export const TOKENS = {
  primary: "#4F46E5", // Indigo / Deep Purple
  primarySoft: "#EEF2FF", // Light Indigo
  redAccent: "#EF4444", // Red for danger/warning
  text: "#333333", // Dark grey for general text
  muted: "#6B7280", // Standard muted grey for secondary text
  border: "#D1D5DB", // Light grey for borders
  bg: "#F8FAFC", // Light off-white for the main background
  white: "#FFFFFF",
};

export const NEW_TEAM_STRUCTURE = {
  "ALEXANDER GRAY": ["Hannah Abbott", "Michael Brown", "Sarah Connor"],
  "BENJAMIN COLE": [
    "Adam Foster",
    "Diana Prince",
    "Harry Potter",
    "Ian Grant",
    "Rachel Green",
    "Steven Rogers",
    "Zane Miller",
    "Ava Lewis",
  ],
  "CHLOE DEKKER": [
    "Arthur King",
    "Alice Summers",
    "Daniel Porter",
    "Marcus Flint",
    "Maria Hill",
    "Oliver Queen",
    "Rebecca Shaw",
    "Ursula Moore",
  ],
  "DAVID CHEN": [
    "Angela Martin",
    "Peter Parker",
    "Samwise Gamgee",
    "Zoe Knight",
  ],
  "ELENA RODRIGUEZ": [
    "Aaron Burr",
    "Ahmed Khan",
    "Gary Oldman",
    "Helen Troy",
    "Morgan Freeman",
    "Robert Neville",
  ],
  "FRANKLIN WRIGHT": [
    "Aria Stark",
    "Bruce Wayne",
    "Frodo Baggins",
    "Miles Morales",
    "Mona Lisa",
    "Moe Szyslak",
    "Monty Burns",
    "Matthew Perry",
    "Matt Murdock",
    "Morty Smith",
    "Rick Sanchez",
    "Saul Goodman",
    "Sandra Bullock",
    "Shaun White",
    "Sonia Blade",
    "Susan Vance",
    "Victor Creed",
  ],
  "GRACE LEE": ["Barbara Gordon", "Ron Weasley"],
  "HENRY O'MALLEY": [
    "Albert Wesker",
    "Anne Shirley",
    "Barry Allen",
    "Beatrice Prior",
    "Fiona Glenanne",
    "Hank Hill",
    "Ivan Drago",
    "James Bond",
    "Kara Danvers",
    "Marge Simpson",
    "Zelda Fitzgerald",
  ],
  "ISABELLA ROSSI": ["Jason Bourne", "Maya Hansen"],
  "JACKSON STONE": [
    "Arthur Dent",
    "Aloy Vera",
    "Homer Simpson",
    "Oscar Martinez",
    "Pam Beesly",
    "Steve Jobs",
    "Tony Stark",
  ],
  "KENJI TANAKA": [], // Manages unassigned
};

export const ALL_LEADERS = Object.keys(NEW_TEAM_STRUCTURE);

export const OTHER_ADMINS = ["Jane Doe"]; 

let agentIdCounter = 1000;
export function generateMockAgent(name, team, role, leader = "") {
  agentIdCounter++;
  const isSales = role === "sales";
  const leads = isSales ? Math.floor(Math.random() * 100) + 50 : 0;
  const deals = isSales ? Math.floor(leads * (Math.random() * 0.2 + 0.1)) : 0;
  const calls = isSales ? Math.floor(Math.random() * 150) + 80 : 0;
  const revenue = isSales ? deals * ((Math.random() * 1.5 + 0.5) * 100000) : 0;
  const commissionAED = isSales ? revenue * (Math.random() * 0.05 + 0.02) : 0;
  const lastTransactionAmount = isSales
    ? (revenue / (deals || 1)) * (Math.random() * 0.8 + 0.6)
    : 0;

  // Generate a random gender for photo
  const gender = Math.random() > 0.5 ? "women" : "men";
  const picId = Math.floor(Math.random() * 70);

  return {
    id: `AG-${agentIdCounter}`,
    name,
    role,
    team: team,
    // REQ: Remove photo URL
    // image: `https://randomuser.me/api/portraits/${gender}/${picId}.jpg`,
    image: ``, // REQ: Removed
    leads,
    deals,
    activities: isSales ? Math.floor(Math.random() * 80) + 30 : 0,
    calls,
    closures: deals,
    tasks: isSales ? Math.floor(Math.random() * 40) + 20 : 0,
    missed: isSales ? Math.floor(Math.random() * 10) : 0,
    conv: isSales ? Math.floor((deals / (leads || 1)) * 100) : 0,
    commissionAED,
    commissionPct: isSales ? Math.floor(Math.random() * 10) + 8 : 0,
    revenue,
    lastTransactionDate: isSales
      ? `2025-${Math.floor(Math.random() * 7) + 1}-${
          Math.floor(Math.random() * 28) + 1
        }`
      : null,
    lastTransactionAmount: isSales ? lastTransactionAmount : null,
    lastTransactionProject: isSales ? "Mock Project" : null,
    hiredBy: Math.random() > 0.5 ? "Company" : "Direct",
    joiningDate: `2023-${Math.floor(Math.random() * 12) + 1}-${
      Math.floor(Math.random() * 28) + 1
    }`,
    leader: leader,
  };
}

export const newAgentsAndAdmins = [];
ALL_LEADERS.forEach((leaderName) => {
  const teamName = `Team ${leaderName.split(" ")[0]}`; // e.g., "Team ADILET"
  // Add the leader as admin/manager
  newAgentsAndAdmins.push(
    generateMockAgent(leaderName, "Management", "admin", "Management")
  );

  // Add agents under that leader
  NEW_TEAM_STRUCTURE[leaderName].forEach((agentName) => {
    newAgentsAndAdmins.push(
      generateMockAgent(agentName, teamName, "sales", leaderName)
    );
  });
});

OTHER_ADMINS.forEach((adminName) => {
  // FIX: Corrected typo in variable name
  newAgentsAndAdmins.push(
    generateMockAgent(adminName, "Management", "admin", "Management")
  );
});


if (!newAgentsAndAdmins.find((a) => a.name === "Amir Abbasi")) {
  // He's "AMIR ABBASI"
}
export const AGENTS_AND_ADMINS = newAgentsAndAdmins;

export const AGENTS = AGENTS_AND_ADMINS.filter((agent) => agent.role === "sales");
export const ADMINS = AGENTS_AND_ADMINS.filter((agent) => agent.role === "admin");

export const TEAMS = ALL_LEADERS.map((leaderName) => {
  const teamName = `Team ${leaderName.split(" ")[0]}`;
  return {
    name: teamName,
    leader: leaderName,
    members: AGENTS.filter((a) => a.team === teamName),
  };
});

export const UNASSIGNED_AGENTS = AGENTS.filter(
  (a) => !a.team || a.team === "Unassigned"
);


export const LEADS = [
  { name: "Bayut", value: 38 },
  { name: "Dubizzle", value: 29 },
  { name: "Meta Ads", value: 14 },
  { name: "Referral", value: 11 },
  { name: "Website", value: 8 },
  { name: "PropertyFinder", value: 22 },
  { name: "Walk-in", value: 5 },
  { name: "Other", value: 3 },
];

export const FUNNEL = [
  { stage: "Leads", value: 3100 },
  { stage: "Qualified", value: 2100 },
  { stage: "Viewings", value: 1240 },
  { stage: "Offers", value: 440 },
  { stage: "Closures", value: 260 },
];


export const existingShortlist = [
  "Azizi",
  "Damac",
  "Emaar",
  "Nakheel",
  "Nshama",
  "Meraas",
  "Sobha",
  "Aldar",
  "Select Group",
  "Mag",
  "Danube",
  "Omniyat",
  "Binghatti",
  "Deyaar",
  "Wasl",
  "Union Properties",
];

export const csvDevList = `Name English
Beyond 1 Real Estate Development L.L.C
1b Tower Co. L.L.C
1xl Infra & Real Estate Development L.L.C
32 Group Properties Limited
3n Homes Real Estate L.L.C
4 Direction Developments L.L.C
56 Invest L.L.C
77 Shades Of Green Realestate Development L.L.C
A & B Unicorn Real Estate Development L.L.C
A & M Investment L.L.C
A A Developments Llc
A B A Real Estate Development L.L.C
A D E Properties L.L.C
A D G Real Estate Development L.L.C
A G N Skyline Real Estate Developments L.L.C
A G W Real Estate Development L.L.C
A H S Canal Development L.L.C
A H S Palm Development L.L.C
A H S Properties L.L.C
A J G Jaddaf Real Estate Development L.L.C
A J G Prime Real Estate Development L.L.C
A J G Warsan Real Estate Development L.L.C
A J Gargash Real Estate Development L.L.C
A K Homes Real Estate Developers
A M B S Real Estate Development L.L.C
A M E Real Estate Development L.L.C
A M I S Real Estate Development L.L.C
A M I S Signature Development L.L.C
A M I S Urban Developer L.L.C
A N K Creative Real Estate Development L.L.C
A N K Developers L.L.C
Wisal Development Dmcc
Wishes Land Real Estate Development L.L.C
Wishes Real Estate Development L.L.C
Wog Capital Real Estate Development L.L.C
Wujod Real Estate Development L.L.C
Wyz By M Real Estate Development L.L.C
Xanadu Real Estate Development L.L.C
Xida Properties L.L.C
Xv.A05.019 Limited
Y A S Developers Fze
Y A S Developers Fze
Yangtze International Real Estate Developer L.L.C
Yehiaco Real Estate L.L.C
Ymr Developments
York Shire Corporation Limited
Yra Enterprises Limited
Zabeel Investments (L.L.C)
Zabeel Square L.L.C
Zane Developments L.L.C
Zareen Developments Limited
Zarwah Capital Real Estate Development L.L.C
Zarwah Developments L.L.C
Zaya Living Real Estate Development L.L.C
Zaya Zuha Island For Real Estate Development L.L.C
Zazen Property Development L.L.C
Zedor Real Estate Development L.L.C
Zee Development L.L.C
Zenica Property Development L.L.C
Zenica Property Development L.L.C
Zenith By Amber Real Estate Development L.L.C
Zenith Luxury Real Estate Development L.L.C
Zenith Real Estate Development(L.L.C)
Zenith Smart Real Estate Development L.L.C`;

export const allDevsFromCSV = csvDevList
  .split("\n")
  .map((s) => s.trim())
  .filter((s) => s && s !== "Name English");

export const ALL_DEVELOPERS = [
  ...new Set([...existingShortlist, ...allDevsFromCSV]),
].sort();

export const ALL_PROPERTY_TYPES = [
  "Apartment",
  "Villa",
  "Townhouse",
  "Penthouse",
  "Plot",
];

export const DEALS_MONITORING_DATA_ORIGINAL = [
  // Using a subset of the new agent/team data for deals
  {
    date: "2025-08-10",
    transactionType: "Sale",
    dealType: "Secondary",
    projectName: "Burj Vista",
    unitNo: "B-2401",
    developerName: "Emaar",
    type: "Apartment",
    noOfBr: "2",
    clientName: "Faisal Al-Marzooqi",
    agentName: "Hannah Abbott",
    team: "Team ALEXANDER",
    propertyPrice: 4500000,
    grossCommissionInclVAT: 94500,
    grossCommission: 90000,
    vat: 4500,
    agentNetCommission: 45000,
    managersCommission: 4500,
    salesSupportCommission: 1000,
    vortexwebCommission: 39500,
    placeholder: "",
    commissionSlab: "5.0%",
    referral: "No",
    referralFee: 0,
    leadSource: "Company Lead",
    invoiceStatus: "Invoiced",
    paymentReceived: "Yes",
    firstPayment: "Yes",
    secondPayment: "Yes",
    thirdPayment: "N/A",
    totalPaymentReceived: 94500,
    amountReceivable: 0,
    bookingForm: "Yes",
    ppCopy: "Yes",
    kyc: "Yes",
    screening: "Yes",
    clientId: "C-2024-00001",
    contactNumber: "+971 50 123 4567",
    email: "faisal.m@example.com",
    clientType: "Resident",
    passportNo: "A12345678",
    emiratesId: "784-1990-1234567-1",
    birthday: "1990-05-20",
    country: "UAE",
    nationality: "Emirati",
  },
  {
    date: "2025-08-08",
    transactionType: "Sale",
    dealType: "Off-plan",
    projectName: "Palm Jumeirah",
    unitNo: "V-12",
    developerName: "Nakheel",
    type: "Villa",
    noOfBr: "5",
    clientName: "Anastasia Petrova",
    agentName: "Adam Foster",
    team: "Team BENJAMIN",
    propertyPrice: 12000000,
    grossCommissionInclVAT: 252000,
    grossCommission: 240000,
    vat: 12000,
    agentNetCommission: 120000,
    managersCommission: 12000,
    salesSupportCommission: 1000,
    vortexwebCommission: 107000,
    placeholder: "",
    commissionSlab: "10.0%",
    referral: "Yes",
    referralFee: 20000,
    leadSource: "Referral",
    invoiceStatus: "Pending",
    paymentReceived: "No",
    firstPayment: "No",
    secondPayment: "No",
    thirdPayment: "No",
    totalPaymentReceived: 0,
    amountReceivable: 252000,
    bookingForm: "Yes",
    ppCopy: "No",
    kyc: "Yes",
    screening: "No",
    clientId: "C-2024-00002",
    contactNumber: "+44 20 7123 4567",
    email: "a.petrova@example.com",
    clientType: "International",
    passportNo: "B87654321",
    emiratesId: "",
    birthday: "1985-11-02",
    country: "UK",
    nationality: "British",
  },
  {
    date: "2025-07-05",
    transactionType: "Rent",
    dealType: "Secondary",
    projectName: "Damac Hills",
    unitNo: "T-890",
    developerName: "Damac",
    type: "Townhouse",
    noOfBr: "3",
    clientName: "Chen Wei",
    agentName: "Arthur King",
    team: "Team CHLOE",
    propertyPrice: 180000,
    grossCommissionInclVAT: 9450,
    grossCommission: 9000,
    vat: 450,
    agentNetCommission: 4500,
    managersCommission: 450,
    salesSupportCommission: 500,
    vortexwebCommission: 3550,
    placeholder: "",
    commissionSlab: "5.0%",
    referral: "No",
    referralFee: 0,
    leadSource: "Personal Lead",
    invoiceStatus: "Invoiced",
    paymentReceived: "Yes",
    firstPayment: "Yes",
    secondPayment: "N/A",
    thirdPayment: "N/A",
    totalPaymentReceived: 9450,
    amountReceivable: 0,
    bookingForm: "Yes",
    ppCopy: "Yes",
    kyc: "Yes",
    screening: "Yes",
    clientId: "C-2024-00003",
    contactNumber: "+86 139 1234 5678",
    email: "chen.wei@example.com",
    clientType: "Resident",
    passportNo: "G55544433",
    emiratesId: "784-1988-7654321-1",
    birthday: "1988-01-30",
    country: "China",
    nationality: "Chinese",
  },
  {
    date: "2025-04-03",
    transactionType: "Sale",
    dealType: "Secondary",
    projectName: "JVC Grand Tower",
    unitNo: "A-432",
    developerName: "Azizi",
    type: "Apartment",
    noOfBr: "1",
    clientName: "David Müller",
    agentName: "Angela Martin",
    team: "Team DAVID",
    propertyPrice: 950000,
    grossCommissionInclVAT: 19950,
    grossCommission: 19000,
    vat: 950,
    agentNetCommission: 9500,
    managersCommission: 950,
    salesSupportCommission: 1000,
    vortexwebCommission: 7550,
    placeholder: "",
    commissionSlab: "Agent Hired - 10.00%",
    referral: "No",
    referralFee: 0,
    leadSource: "Agent Social Media",
    invoiceStatus: "Part-Paid",
    paymentReceived: "Partial",
    firstPayment: "Yes",
    secondPayment: "No",
    thirdPayment: "No",
    totalPaymentReceived: 10000,
    amountReceivable: 9950,
    bookingForm: "Yes",
    ppCopy: "Yes",
    kyc: "No",
    screening: "Yes",
    clientId: "C-2024-00004",
    contactNumber: "+49 176 12345678",
    email: "david.muller@example.de",
    clientType: "International",
    passportNo: "C123D456E",
    emiratesId: "",
    birthday: "1992-09-15",
    country: "Germany",
    nationality: "German",
  },
  {
    date: "2025-02-15",
    transactionType: "Sale",
    dealType: "Off-plan",
    projectName: "Creek Edge",
    unitNo: "C-1105",
    developerName: "Emaar",
    type: "Apartment",
    noOfBr: "2",
    clientName: "Sophie Dubois",
    agentName: "Aaron Burr",
    team: "Team ELENA",
    propertyPrice: 2800000,
    grossCommissionInclVAT: 58800,
    grossCommission: 56000,
    vat: 2800,
    agentNetCommission: 28000,
    managersCommission: 2800,
    salesSupportCommission: 1000,
    vortexwebCommission: 24200,
    placeholder: "",
    commissionSlab: "5.0%",
    referral: "No",
    referralFee: 0,
    leadSource: "Website",
    invoiceStatus: "Invoiced",
    paymentReceived: "Yes",
    firstPayment: "Yes",
    secondPayment: "Yes",
    thirdPayment: "N/A",
    totalPaymentReceived: 58800,
    amountReceivable: 0,
    bookingForm: "Yes",
    ppCopy: "Yes",
    kyc: "Yes",
    screening: "Yes",
    clientId: "C-2024-00005",
    contactNumber: "+33 6 12 34 56 78",
    email: "sophie.dubois@example.fr",
    clientType: "International",
    passportNo: "F98765432",
    emiratesId: "",
    birthday: "1995-03-10",
    country: "France",
    nationality: "French",
  },
];

export const leadSources = [
  "Company Lead",
  "Referral",
  "Personal Lead",
  "Agent Social Media",
  "Website",
  "Bayut",
  "Dubizzle",
  "Meta Ads",
  "PropertyFinder",
];

export const dealTypes = ["Secondary", "Off-plan"];
export const propertyTypesGen = ["Apartment", "Villa", "Townhouse", "Penthouse"];
export const invoiceStatuses = ["Invoiced", "Pending", "Part-Paid"];
export const paymentReceivedStatuses = ["Yes", "No", "Partial"];

export const generatedDeals = [];
for (let i = 0; i < 60; i++) {
  // Generate 60 new deals
  const randomAgent = AGENTS[Math.floor(Math.random() * AGENTS.length)];
  const randomDev =
    ALL_DEVELOPERS[Math.floor(Math.random() * ALL_DEVELOPERS.length)];
  const propType =
    propertyTypesGen[Math.floor(Math.random() * propertyTypesGen.length)];

  const propertyPrice =
    propType === "Villa"
      ? Math.floor(Math.random() * 8000000) + 3000000 // 3M - 11M
      : propType === "Penthouse"
      ? Math.floor(Math.random() * 15000000) + 5000000 // 5M - 20M
      : Math.floor(Math.random() * 2500000) + 500000; // 500k - 3M

  const grossCommission = propertyPrice * (Math.random() * 0.02 + 0.02); // 2-4%
  const grossCommissionInclVAT = grossCommission * 1.05;
  const vat = grossCommission * 0.05;
  const agentNetCommission = grossCommission * (Math.random() * 0.2 + 0.4); // 40-60%
  const managersCommission = grossCommission * 0.05;
  const vortexwebCommission =
    grossCommission - agentNetCommission - managersCommission;

  const paymentStatus =
    paymentReceivedStatuses[
      Math.floor(Math.random() * paymentReceivedStatuses.length)
    ];
  let totalPaymentReceived = 0;
  if (paymentStatus === "Yes") totalPaymentReceived = grossCommissionInclVAT;
  if (paymentStatus === "Partial")
    totalPaymentReceived = grossCommissionInclVAT * 0.5;

  generatedDeals.push({
    date: `2025-${Math.floor(Math.random() * 12) + 1}-${
      Math.floor(Math.random() * 28) + 1
    }`, // Jan-Dec 2025 (FIX V23: Was 8)
    transactionType: "Sale",
    dealType: dealTypes[Math.floor(Math.random() * dealTypes.length)],
    projectName: `${randomDev.split(" ")[0]} Residences` || "Generated Project",
    unitNo: `G-${Math.floor(Math.random() * 50) + 1}${
      Math.floor(Math.random() * 20) + 1
    }`,
    developerName: randomDev,
    type: propType,
    noOfBr: `${Math.floor(Math.random() * 5) + 1}`,
    clientName: `Client ${1000 + i}`,
    agentName: randomAgent.name,
    team: randomAgent.team,
    propertyPrice: propertyPrice,
    grossCommissionInclVAT: grossCommissionInclVAT,
    grossCommission: grossCommission,
    vat: vat,
    agentNetCommission: agentNetCommission,
    managersCommission: managersCommission,
    salesSupportCommission: 1000,
    vortexwebCommission: vortexwebCommission,
    placeholder: "",
    commissionSlab: "5.0%",
    referral: Math.random() > 0.8 ? "Yes" : "No",
    referralFee: 0,
    leadSource: leadSources[Math.floor(Math.random() * leadSources.length)],
    invoiceStatus:
      invoiceStatuses[Math.floor(Math.random() * invoiceStatuses.length)],
    paymentReceived: paymentStatus,
    firstPayment: paymentStatus !== "No" ? "Yes" : "No",
    secondPayment: paymentStatus === "Yes" ? "Yes" : "No",
    thirdPayment: "N/A",
    totalPaymentReceived: totalPaymentReceived,
    amountReceivable: grossCommissionInclVAT - totalPaymentReceived,
    bookingForm: "Yes",
    ppCopy: "Yes",
    kyc: "Yes",
    screening: "Yes",
    clientId: `C-2024-G${100 + i}`,
    contactNumber: "+971 50 987 6543",
    email: `client.${1000 + i}@example.com`,
    clientType: Math.random() > 0.5 ? "Resident" : "International",
    passportNo: `P${1000000 + i}`,
    emiratesId: "",
    birthday: "1990-01-01",
    country: "Various",
    nationality: "Various",
  });
}


export const DEALS_MONITORING_DATA = [
  ...DEALS_MONITORING_DATA_ORIGINAL,
  ...generatedDeals,
];


export const AGENT_PERFORMANCE_DATA = AGENTS.map((agent, idx) => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const quarters = ["Q1", "Q2", "Q3", "Q4"];

  // Create semi-consistent random data
  const baseComm = (agent.commissionAED || 50000) * 5; // Yearly total
  const baseValue = (agent.revenue || 200000) * 10; // Yearly total
  const baseDeals = (agent.deals || 10) * 5; // Yearly total

  const monthlyData = months.map((m) => ({
    month: m,
    rankComm: Math.floor(Math.random() * 10) + 1,
    grossComm: Math.floor(Math.random() * (baseComm / 8)) + baseComm / 24,
    propValue: Math.floor(Math.random() * (baseValue / 8)) + baseValue / 24,
    // REQ V18: FIX: Apply Math.floor to the *entire* calculation to ensure integer deal counts
    deals: Math.floor(Math.random() * (baseDeals / 8) + baseDeals / 24), // Add deals qty
  }));

  const quarterlyData = quarters.map((q, i) => {
    const quarterMonths = monthlyData.slice(i * 3, i * 3 + 3);
    return {
      quarter: q,
      rankComm: Math.floor(Math.random() * 5) + 1,
      grossComm: quarterMonths.reduce((sum, m) => sum + m.grossComm, 0),
      propValue: quarterMonths.reduce((sum, m) => sum + m.propValue, 0),
      deals: quarterMonths.reduce((sum, m) => sum + m.deals, 0), // Sum deals qty
    };
  });

  const yearlyData = {
    rank: idx + 1, // Add Rank
    grossComm: quarterlyData.reduce((sum, q) => sum + q.grossComm, 0),
    propValue: quarterlyData.reduce((sum, q) => sum + q.propValue, 0),
    deals: quarterlyData.reduce((sum, q) => sum + q.deals, 0), // Sum deals qty
  };

  return {
    ...agent,
    rank: yearlyData.rank,
    monthly: monthlyData,
    quarterly: quarterlyData,
    yearly: yearlyData,
  };
});


export const CHART_COLORS = [
  TOKENS.primary,
  TOKENS.redAccent,
  "#6699CC",
  "#99CCFF",
  "#C0C0C0",
];

export const MGMT_CHART_COLORS = [
  "#003366",
  "#3b82f6",
  "#60a5fa",
  "#93c5fd",
  "#bfdbfe",
];

export function csvEscape(v) {
  return `"${String(v ?? "").replace(/"/g, '""')}"`;
}

export function downloadCSV(data, headers, filename) {
  // Use headers to determine keys and order
  const headerKeys = headers.map((h) => h.key);

  const lines = [headers.map((h) => csvEscape(h.label)).join(",")];

  data.forEach((row, idx) => {
    const values = headerKeys.map((key, i) => {
      let val = row[key];

      // Handle special cases or formatting if needed
      if (key === "sno") {
        val = idx + 1;
      }

      return csvEscape(val);
    });
    lines.push(values.join(","));
  });

  const blob = new Blob([lines.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

