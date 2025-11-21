import axios from "axios";

const BITRIX_WEBHOOK_URL = import.meta.env.VITE_BITRIX_WEBHOOK_URL;

const FIELD_DEVELOPER = import.meta.env.VITE_FIELD_DEVELOPER_NAME;
const FIELD_GROSS_COMMISSION = import.meta.env.VITE_FIELD_GROSS_COMMISSION;
const FIELD_NET_COMMISSION = import.meta.env.VITE_FIELD_NET_COMMISSION;
const FIELD_PAYMENT_RECEIVED = import.meta.env.VITE_FIELD_PAYMENT_RECEIVED;
const FIELD_PROPERTY_TYPE = import.meta.env.VITE_FIELD_PROPERTY_TYPE;
const FIELD_AMOUNT_RECEIVABLE = import.meta.env.VITE_FIELD_AMOUNT_RECEIVABLE;

const WON_STAGE_IDS = [
  import.meta.env.VITE_DEAL_STAGE_ID_WON,
  import.meta.env.VITE_DEAL_STAGE_ID_C2WON,
  import.meta.env.VITE_DEAL_STAGE_ID_C4WON,
  import.meta.env.VITE_DEAL_STAGE_ID_C5WON,
].filter(Boolean);


function buildQueryString(params) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => searchParams.append(`${key}[]`, v));
    } else {
      searchParams.append(key, value);
    }
  });
  return searchParams.toString();
}


async function fetchAllWithBatch(baseUrl, methodWithParams) {
  const firstRes = await axios.get(`${baseUrl}/${methodWithParams}`);
  
  if (firstRes.data.error) {
      console.error("Bitrix API Error:", firstRes.data.error_description);
      return [];
  }

  const { result: firstPage = [], total } = firstRes.data;

  if (!total || total <= 50) {
    return firstPage; 
  }

  const commands = {};
  const methodBase = methodWithParams.includes("?")
    ? `${methodWithParams}&`
    : `${methodWithParams}?`;

  for (let i = 50; i < total; i += 50) {
    commands[`page_${i}`] = `${methodBase}start=${i}`;
  }

  try {
    const commandKeys = Object.keys(commands);
    const chunkedCommands = [];
    
    for (let i = 0; i < commandKeys.length; i += 50) {
        const chunk = {};
        commandKeys.slice(i, i + 50).forEach(key => {
            chunk[key] = commands[key];
        });
        chunkedCommands.push(chunk);
    }

    let allAdditionalResults = [];

    for (const cmdChunk of chunkedCommands) {
        const batchRes = await axios.post(`${baseUrl}/batch`, { cmd: cmdChunk });
        const batchData = batchRes.data?.result?.result || {};
        const chunkResults = Object.values(batchData).flat();
        allAdditionalResults = [...allAdditionalResults, ...chunkResults];
    }

    return [...firstPage, ...allAdditionalResults];
  } catch (error) {
    console.error("❌ Error in Bitrix batch call:", error.message);
    return firstPage;
  }
}

async function fetchFast(method, params = {}) {
  if (!BITRIX_WEBHOOK_URL) {
      console.error("BITRIX_WEBHOOK_URL is not configured.");
      return [];
  }

  const queryString = buildQueryString(params);
  const methodWithParams = queryString ? `${method}?${queryString}` : method;
  return await fetchAllWithBatch(BITRIX_WEBHOOK_URL, methodWithParams);
}

const ALL_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Ensure these are imported at the top of your file if not already:
// import { fetchFast } from "./bitrix"; // (Or wherever fetchFast is defined)
// const ALL_MONTHS = ["January", "February", ...]; 

function getQuarter(monthIndexZeroBased) {
  const m = monthIndexZeroBased + 1;
  if (m <= 3) return "Q1";
  if (m <= 6) return "Q2";
  if (m <= 9) return "Q3";
  return "Q4";
}

export async function runReport(assignedById = null, year = null) {
  try {
    const targetYear = year || new Date().getFullYear();

    // 1. Setup Parameters
    const userParams = {
      "filter[ACTIVE]": "Y",
      "select": ["ID", "NAME", "LAST_NAME", "EMAIL", "UF_DEPARTMENT"]
    };

    // --- CONFIGURATION: The Correct Field ID ---
    const COMMISSION_FIELD_ID = "UF_CRM_1727871887978"; 

    const dealParams = {
      "filter[>=DATE_CREATE]": `${targetYear}-01-01T00:00:00+03:00`,
      "filter[<=DATE_CREATE]": `${targetYear}-12-31T23:59:59+03:00`,
      "select": [
        "ID",
        "OPPORTUNITY",
        "ASSIGNED_BY_ID",
        "DATE_CREATE",
        COMMISSION_FIELD_ID // Select the correct ID
      ]
    };

    if (assignedById) {
      dealParams["filter[ASSIGNED_BY_ID]"] = assignedById;
    }

    // 2. Fetch ALL Pages
    const [agentsRaw, deals] = await Promise.all([
        fetchFast("user.get", userParams),
        fetchFast("crm.deal.list", dealParams)
    ]);

    // 3. Map Agents
    const agents = {};
    agentsRaw.forEach(u => {
      agents[u.ID] = [u.NAME, u.LAST_NAME].filter(Boolean).join(" ").trim()
        || u.EMAIL?.split("@")[0]
        || `User ${u.ID}`;
    });

    const performance = {};

    // 4. Initialize Structure
    Object.keys(agents).forEach(agentId => {
        performance[agentId] = {
            id: agentId,
            name: agents[agentId],
            totalOpportunity: 0,
            totalCommission: 0,
            totalDeals: 0,
            monthly: {},
            quarterly: {
                Q1: { opp: 0, comm: 0, deals: 0 },
                Q2: { opp: 0, comm: 0, deals: 0 },
                Q3: { opp: 0, comm: 0, deals: 0 },
                Q4: { opp: 0, comm: 0, deals: 0 }
            },
            yearly: { grossComm: 0 } 
        };
        
        const monthNames = [
          "January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"
        ];
        
        monthNames.forEach(m => {
            performance[agentId].monthly[m] = { opportunity: 0, commission: 0, deals: 0 };
        });
    });

    // 5. Process Deals
    deals.forEach(deal => {
      const agentId = String(deal.ASSIGNED_BY_ID);
      
      if (!performance[agentId]) return;

      // --- FIX 1: Helper to parse "Amount|Currency" format ---
      const parseBitrixMoney = (val) => {
         if(!val) return 0;
         // Handle "2500000|AED" -> "2500000"
         const numberPart = val.toString().split('|')[0]; 
         // Remove commas and parse
         return parseFloat(numberPart.replace(/,/g, "")) || 0;
      };

      const opp = parseBitrixMoney(deal.OPPORTUNITY);

      // --- FIX 2: Use the CORRECT Field ID Variable ---
      const commission = parseBitrixMoney(deal[COMMISSION_FIELD_ID]); 

      const date = new Date(deal.DATE_CREATE);
      if (isNaN(date)) return;

      const monthNames = [
          "January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"
      ];
      const monthName = monthNames[date.getMonth()];
      const quarter = getQuarter(date.getMonth());

      // Aggregate Data
      performance[agentId].monthly[monthName].opportunity += opp;
      performance[agentId].monthly[monthName].commission += commission;
      performance[agentId].monthly[monthName].deals++;

      performance[agentId].quarterly[quarter].opp += opp;
      performance[agentId].quarterly[quarter].comm += commission;
      performance[agentId].quarterly[quarter].deals++;

      performance[agentId].totalOpportunity += opp;
      performance[agentId].totalCommission += commission;
      performance[agentId].yearly.grossComm += commission; 
      performance[agentId].totalDeals++;
    });

    return performance;

  } catch (error) {
    console.error("Report failed:", error.message);
    throw error;
  }
}

export const getAllUsers = async () => {
  let allUsers = [];
  let batchStart = 0;
  let processing = true;

  const BATCH_SIZE = 50;
  const PAGE_SIZE = 50;

  while (processing) {
    const cmd = {};

    for (let i = 0; i < BATCH_SIZE; i++) {
      const currentStart = batchStart + (i * PAGE_SIZE);
      cmd[`cmd_${i}`] = `user.get?filter[ACTIVE]=true&start=${currentStart}`;
    }

    const response = await fetch(`${BITRIX_WEBHOOK_URL}/batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        halt: 0,
        cmd: cmd,
      }),
    });

    if (!response.ok) throw new Error("Failed to fetch users from Bitrix via batch");

    const data = await response.json();
    const results = data.result.result;

    let usersFoundInThisBatch = 0;

    for (let i = 0; i < BATCH_SIZE; i++) {
      const key = `cmd_${i}`;
      if (results[key] && Array.isArray(results[key])) {
        allUsers = allUsers.concat(results[key]);
        usersFoundInThisBatch += results[key].length;
      }
    }

    if (usersFoundInThisBatch < BATCH_SIZE * PAGE_SIZE) {
      processing = false;
    } else {
      batchStart += BATCH_SIZE * PAGE_SIZE;
    }
  }

  return allUsers;
};


export const getDepartments = async () => {
  return await fetchFast("department.get");
};


export const getLeadSources = async () => {
  const response = await fetch(`${BITRIX_WEBHOOK_URL}/batch`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      halt: 0,
      cmd: {
        sources: "crm.status.list?filter[ENTITY_ID]=SOURCE",
      },
    }),
  });

  if (!response.ok) throw new Error("Failed to fetch Bitrix lead sources via batch");

  const data = await response.json();

  if (data.result && data.result.result && data.result.result.sources) {
    return data.result.result.sources;
  }
  
  return [];
};


export const getDealsByYear = async (year) => {
  const params = {
    "select": [
      "*",
      import.meta.env.VITE_FIELD_DEVELOPER_NAME,
      import.meta.env.VITE_FIELD_GROSS_COMMISSION,
      import.meta.env.VITE_FIELD_NET_COMMISSION,
      import.meta.env.VITE_FIELD_PAYMENT_RECEIVED,
      import.meta.env.VITE_FIELD_PROPERTY_TYPE,
      import.meta.env.VITE_FIELD_AMOUNT_RECEIVABLE,
      import.meta.env.VITE_FIELD_PROJECT_NAME 
    ].filter(Boolean)
  };

  if (year) {
    params["filter[>=CLOSEDATE]"] = `${year}-01-01T00:00:00`;
    params["filter[<=CLOSEDATE]"] = `${Number(year) + 1}-01-01T00:00:00`;
  }
  return await fetchFast("crm.deal.list", params);
};


export const getAllWonDealsForYear = async (year) => {
    const selectFields = [
        "ASSIGNED_BY_ID",
        "CLOSEDATE",
        import.meta.env.VITE_FIELD_TOTAL_COMMISSION,
    ].filter(Boolean);

    const params = {};
    selectFields.forEach((field, index) => {
        params[`select[${index}]`] = field;
    });

    WON_STAGE_IDS.forEach((id, index) => {
        params[`filter[STAGE_ID][${index}]`] = id;
    });

    params["filter[>=CLOSEDATE]"] = `${year}-01-01T00:00:00`;
    params["filter[<=CLOSEDATE]"] = `${year}-12-31T23:59:59`;

    return await fetchFast("crm.deal.list", params);
};


export const getAllLeadsForYear = async (year) => {
  let allLeads = [];
  let batchStart = 0;
  let processing = true;

  const selectFields = [
    "ID",
    "ASSIGNED_BY_ID",
    "DATE_CREATE",
    "SOURCE_ID",
    "STATUS_ID",
  ];

  const BATCH_SIZE = 50; 
  const PAGE_SIZE = 50; 

  while (processing) {
    const cmd = {};

    for (let i = 0; i < BATCH_SIZE; i++) {
      const params = new URLSearchParams();

      selectFields.forEach((field, index) => {
        params.append(`select[${index}]`, field);
      });

      params.append("filter[>=DATE_CREATE]", `${year}-09-12T00:00:00`);
      params.append("filter[<=DATE_CREATE]", `${year}-12-31T23:59:59`);

      const currentStart = batchStart + (i * PAGE_SIZE);
      params.append("start", currentStart);

      cmd[`cmd_${i}`] = `crm.lead.list?${params.toString()}`;
    }

    const response = await fetch(`${BITRIX_WEBHOOK_URL}/batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        halt: 0,
        cmd: cmd,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Failed to fetch batch for year ${year}. Status: ${response.status}`);
    }

    const data = await response.json();
    const results = data.result.result;

    let recordsInThisBatch = 0;

    for (let i = 0; i < BATCH_SIZE; i++) {
      const key = `cmd_${i}`;
      if (results[key] && Array.isArray(results[key])) {
        const pageData = results[key];
        allLeads = allLeads.concat(pageData);
        recordsInThisBatch += pageData.length;
      }
    }

    if (recordsInThisBatch < BATCH_SIZE * PAGE_SIZE) {
      processing = false;
    } else {
      batchStart += BATCH_SIZE * PAGE_SIZE;
    }
  }

  return allLeads;
};



export async function generateReportData(year = null) {
  const performance = await runReport(null, year);
  
  const agentList = Object.values(performance).map(p => ({
      id: p.id,
      name: p.name,
  }));
  
  agentList.sort((a, b) => a.name.localeCompare(b.name));
  
  return { 
      agentList, 
      performance: performance 
  };
}

export const getAgents = async () => {
  const users = await getAllUsers();
  const salesDeptId = import.meta.env.VITE_SALES_DEPARTMENT_ID;
  if (!salesDeptId) {
    console.warn(
      "VITE_SALES_DEPARTMENT_ID is not set in .env file. Returning all users."
    );
  }
  return users;
};

export const getContacts = async (contactIds) => {
  if (!contactIds || contactIds.length === 0) return [];

  const chunks = [];
  for (let i = 0; i < contactIds.length; i += 50) {
      chunks.push(contactIds.slice(i, i + 50));
  }

  const allContacts = [];
  
  for (const chunk of chunks) {
      const params = new URLSearchParams();
      chunk.forEach((id, index) => {
          params.append(`filter[ID][${index}]`, id);
      });
      params.append("select[0]", "ID");
      params.append("select[1]", "PHONE");
      params.append("select[2]", "EMAIL");

      const chunkContacts = await fetchFast("crm.contact.list", Object.fromEntries(params));
      allContacts.push(...chunkContacts);
  }

  return allContacts;
};

export const getDealFields = async () => {
  const response = await fetch(`${BITRIX_WEBHOOK_URL}/batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        halt: 0,
        cmd: { fields: "crm.deal.fields" }
      })
  });
  
  if (!response.ok) throw new Error("Failed to fetch Bitrix deal fields");
  const data = await response.json();
  
  if (data.result && data.result.result && data.result.result.fields) {
      return data.result.result.fields;
  }
  return {};
};

export const getDealsPaginated = async (start = 0) => {
  const selectFields = [
    "ID",
    "CLOSEDATE",
    "OPPORTUNITY",
    "TYPE_ID",
    "CONTACT_ID",
    import.meta.env.VITE_FIELD_PROJECT_NAME,
    import.meta.env.VITE_FIELD_TRANSACTION_TYPE,
    import.meta.env.VITE_FIELD_AGENT_NAME,
    import.meta.env.VITE_FIELD_PROPERTY_REFERENCE,
    import.meta.env.VITE_FIELD_DEVELOPER_NAME,
    import.meta.env.VITE_FIELD_PROPERTY_TYPE,
    import.meta.env.VITE_FIELD_GROSS_COMMISSION,
    import.meta.env.VITE_FIELD_NET_COMMISSION,
    import.meta.env.VITE_FIELD_PAYMENT_RECEIVED,
    import.meta.env.VITE_FIELD_AMOUNT_RECEIVABLE,
    import.meta.env.VITE_FIELD_UNIT_NUMBER,
    import.meta.env.VITE_FIELD_NO_OF_BEDROOMS,
    import.meta.env.VITE_FIELD_CLIENT_NAME,
    import.meta.env.VITE_FIELD_TEAM,
    import.meta.env.VITE_FIELD_GROSS_COMMISSION_INCL_VAT,
    import.meta.env.VITE_FIELD_VAT,
    import.meta.env.VITE_FIELD_AGENT_NET_COMMISSION,
    import.meta.env.VITE_FIELD_MANAGER_COMMISSION,
    import.meta.env.VITE_FIELD_SALES_SUPPORT_COMMISSION,
    import.meta.env.VITE_FIELD_SPRINGFIELD_NET_COMMISSION,
    import.meta.env.VITE_FIELD_COMMISSION_SLAB,
    import.meta.env.VITE_FIELD_REFERRAL,
    import.meta.env.VITE_FIELD_REFERRAL_FEE,
    import.meta.env.VITE_FIELD_INVOICE_STATUS,
    import.meta.env.VITE_FIELD_PAYMENT_RECEIVED_STATUS,
    import.meta.env.VITE_FIRST_PAYMENT_RECEIVED,
    import.meta.env.VITE_SECOND_PAYMENT_RECEIVED,
    import.meta.env.VITE_THIRD_PAYMENT_RECEIVED,
    import.meta.env.VITE_TOTAL_PAYMENT_RECEIVED,
    import.meta.env.VITE_AMOUNT_RECEIVABLE,
    import.meta.env.VITE_FIELD_BOOKING_FORM,
    import.meta.env.VITE_FIELD_PP_COPY,
    import.meta.env.VITE_FIELD_KYC,
    import.meta.env.VITE_FIELD_SCREENING,
    import.meta.env.VITE_FIELD_CLIENT_ID,
    import.meta.env.VITE_FIELD_CLIENT_TYPE,
    import.meta.env.VITE_PASSPORT_OR_COMPANY_REG_NO,
    import.meta.env.VITE_FIELD_EMIRATES_ID,
    import.meta.env.VITE_FIELD_BIRTHDAY,
    import.meta.env.VITE_FIELD_COUNTRY,
    import.meta.env.VITE_FIELD_NATIONALITY,
  ];
  const selectParams = selectFields
    .filter(Boolean)
    .map((field, i) => `select[${i}]=${field}`)
    .join("&");
    
  const apiUrl = `${BITRIX_WEBHOOK_URL}/crm.deal.list?${selectParams}&start=${start}`;

  const response = await fetch(apiUrl);
  if (!response.ok)
    throw new Error("Failed to fetch paginated deals from Bitrix");

  const data = await response.json();
  return {
    deals: data.result || [],
    total: data.total || 0,
  };
};

export const getLeadStatuses = async () => {
  const response = await fetch(`${BITRIX_WEBHOOK_URL}/batch`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      halt: 0, 
      cmd: {
        statuses: "crm.status.list?filter[ENTITY_ID]=STATUS",
      },
    }),
  });

  if (!response.ok) throw new Error("Failed to fetch Bitrix batch");

  const data = await response.json();

  if (data.result && data.result.result && data.result.result.statuses) {
    return data.result.result.statuses;
  }

  if (data.result.result_error && data.result.result_error.statuses) {
    throw new Error(data.result.result_error.statuses.error_description);
  }

  return [];
};

export const getStatusList = async () => {
  const response = await fetch(`${BITRIX_WEBHOOK_URL}/crm.status.list?filter[ENTITY_ID]=SOURCE`);
  if (!response.ok) throw new Error("Failed to fetch source statuses");
  const data = await response.json();
  return data.result || [];
};