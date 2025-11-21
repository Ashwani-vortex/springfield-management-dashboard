import { useQuery } from "@tanstack/react-query";
import { getDealFields, getDealsByYear, getStatusList, getAllUsers } from "../api/bitrix"; 

const parseMoney = (moneyString) => {
  if (!moneyString || typeof moneyString !== "string") return 0;
  return parseFloat(moneyString.split("|")[0]) || 0;
};

const FIELD_IDS = {
  developer: import.meta.env.VITE_FIELD_DEVELOPER_NAME,
  grossCommission: import.meta.env.VITE_FIELD_GROSS_COMMISSION,
  netCommission: import.meta.env.VITE_FIELD_NET_COMMISSION,
  paymentReceived: import.meta.env.VITE_FIELD_PAYMENT_RECEIVED,
  propertyType: import.meta.env.VITE_FIELD_PROPERTY_TYPE,
  amountReceivable: import.meta.env.VITE_FIELD_AMOUNT_RECEIVABLE,
  agentName: import.meta.env.VITE_FIELD_AGENT_NAME,
};

const DEAL_STAGES_WON = [
  import.meta.env.VITE_DEAL_STAGE_ID_WON,
  import.meta.env.VITE_DEAL_STAGE_ID_C2WON,
  import.meta.env.VITE_DEAL_STAGE_ID_C4WON,
  import.meta.env.VITE_DEAL_STAGE_ID_C5WON,
].filter(Boolean);

export const useManagementData = (year) => {
  return useQuery({
    queryKey: ["managementData", year],
    queryFn: async () => {
      // 1. Fetch Data
      const [fields, allDeals, statuses, users] = await Promise.all([
        getDealFields(),
        getDealsByYear(year),
        getStatusList(),
        getAllUsers(), 
      ]);

      // Create User Map (ID -> Name)
      const userMap = new Map();
      const agentSalesAgg = {}; // Initialize aggregation object

      // --- FIX: Pre-fill Agent List with ALL Active Users ---
      users.forEach(u => {
        const fullName = `${u.NAME} ${u.LAST_NAME}`.trim() || u.EMAIL;
        userMap.set(u.ID, fullName);
        // Initialize every agent with 0 sales so they appear in the list
        agentSalesAgg[fullName] = 0; 
      });

      const wonDeals = allDeals.filter((deal) =>
        DEAL_STAGES_WON.includes(deal.STAGE_ID)
      );

      // Maps
      const propertyTypeField = fields[FIELD_IDS.propertyType];
      const propertyTypeItems = propertyTypeField?.items || propertyTypeField?.LIST || [];
      const propertyTypeMap = new Map(
        propertyTypeItems.map((item) => [item.ID, item.VALUE])
      );

      // Aggregators
      const propertyTypesAgg = {};
      const developersAgg = {}; 
      const leadSourceAgg = {};

      // --- Loop 1: All Deals ---
      for (const deal of allDeals) {
        const propertyPrice = parseFloat(deal.OPPORTUNITY) || 0;
        const developer = deal[FIELD_IDS.developer] || "Unknown";
        const typeId = deal[FIELD_IDS.propertyType];
        const typeName = propertyTypeMap.get(typeId) || "Unknown";
        const leadSource = deal.SOURCE_ID || "Unknown";

        propertyTypesAgg[typeName] = (propertyTypesAgg[typeName] || 0) + 1;

        if (!developersAgg[developer]) developersAgg[developer] = { totalValue: 0 };
        developersAgg[developer].totalValue += propertyPrice;

        leadSourceAgg[leadSource] = (leadSourceAgg[leadSource] || 0) + 1;
      }

      // --- Loop 2: Won Deals ---
      const monthlyDataAgg = {};
      let totalGrossCommission = 0;
      let totalNetCommission = 0;
      
      const devCommissionAgg = {}; 
      const devUnitsAgg = {};
      const propertyTypeSalesAgg = {}; 
      // agentSalesAgg is already initialized above

      for (const deal of wonDeals) {
        const grossCommission = parseMoney(deal[FIELD_IDS.grossCommission]);
        const netCommission = parseMoney(deal[FIELD_IDS.netCommission]);
        const paymentReceived = parseMoney(deal[FIELD_IDS.paymentReceived]);
        const propertyPrice = parseFloat(deal.OPPORTUNITY) || 0;
        const amountReceivable = parseFloat(deal[FIELD_IDS.amountReceivable]) || 0;
        const developer = deal[FIELD_IDS.developer] || "Unknown";
        
        // --- AGENT NAME LOGIC ---
        let agentName = deal[FIELD_IDS.agentName];
        
        if (!agentName || !isNaN(agentName)) {
             const assignedId = deal.ASSIGNED_BY_ID;
             agentName = userMap.get(assignedId) || "Unknown Agent";
        }
        
        if (Array.isArray(agentName)) {
            agentName = agentName[0];
        }

        totalGrossCommission += grossCommission;
        totalNetCommission += netCommission;

        if (!devCommissionAgg[developer]) devCommissionAgg[developer] = 0;
        devCommissionAgg[developer] += grossCommission;

        if (!devUnitsAgg[developer]) devUnitsAgg[developer] = 0;
        devUnitsAgg[developer] += 1;

        const typeId = deal[FIELD_IDS.propertyType];
        const typeName = propertyTypeMap.get(typeId) || "Unknown";
        if (!propertyTypeSalesAgg[typeName]) propertyTypeSalesAgg[typeName] = { units: 0, value: 0 };
        propertyTypeSalesAgg[typeName].units += 1;
        propertyTypeSalesAgg[typeName].value += propertyPrice;

        // --- AGENT SALES AGGREGATION ---
        // Ensure we handle case where agent name coming from deal isn't in our initial list
        if (agentSalesAgg[agentName] === undefined) agentSalesAgg[agentName] = 0;
        agentSalesAgg[agentName] += propertyPrice;

        const month = new Date(deal.CLOSEDATE).toLocaleString("default", { month: "long" });
        if (!monthlyDataAgg[month]) {
          monthlyDataAgg[month] = {
            dealsWon: 0, propertyPrice: 0, grossCommission: 0, netCommission: 0, paymentReceived: 0, amountReceivable: 0,
          };
        }
        monthlyDataAgg[month].dealsWon++;
        monthlyDataAgg[month].propertyPrice += propertyPrice;
        monthlyDataAgg[month].grossCommission += grossCommission;
        monthlyDataAgg[month].netCommission += netCommission;
        monthlyDataAgg[month].paymentReceived += paymentReceived;
        monthlyDataAgg[month].amountReceivable += amountReceivable;
      }

      // Formatting
      const totalPropertyValueAllDeals = Object.values(developersAgg).reduce((sum, dev) => sum + dev.totalValue, 0);
      const totalDealsByMonth = Object.entries(monthlyDataAgg).map(([month, data]) => ({ month, ...data }));
      const propertyTypesData = Object.entries(propertyTypesAgg).map(([name, value]) => ({ name, value }));
      
      const developersData = Object.entries(developersAgg).map(([developer, data]) => ({
        developer,
        value: data.totalValue,
        percentage: totalPropertyValueAllDeals > 0 ? ((data.totalValue / totalPropertyValueAllDeals) * 100).toFixed(2) : 0,
      }));

      const statusMapByStatusId = new Map((statuses || []).map((s) => [String(s.STATUS_ID), s.NAME]));
      const statusMapById = new Map((statuses || []).map((s) => [String(s.ID), s.NAME]));
      const leadSourceData = Object.entries(leadSourceAgg).map(([sourceId, value]) => ({
          name: statusMapByStatusId.get(String(sourceId)) || statusMapById.get(String(sourceId)) || String(sourceId) || "Unknown",
          value, id: sourceId 
      })).sort((a, b) => b.value - a.value);

      const salesByPropertyType = Object.entries(propertyTypeSalesAgg).map(([type, data]) => ({
        type, units: data.units, value: data.value,
      })).sort((a, b) => b.value - a.value);

      const developerCommissionData = Object.entries(devCommissionAgg).map(([developer, value]) => ({
          developer, value 
      })).sort((a, b) => b.value - a.value);

      const developerUnitsData = Object.entries(devUnitsAgg).map(([developer, value]) => ({
          developer, value 
      })).sort((a, b) => b.value - a.value);

      const salesByAgentData = Object.entries(agentSalesAgg)
        .map(([agent, value]) => ({
          agent, value 
        }))
        // Filter out "Unknown Agent" if you want clean data, or keep it to see unassigned deals
        .filter(item => item.agent !== "Unknown Agent") 
        .sort((a, b) => b.value - a.value);

      return {
        kpis: {
          totalDeals: allDeals.length,
          dealsWon: wonDeals.length,
          grossCommission: totalGrossCommission,
          netCommission: totalNetCommission,
        },
        allDevelopers: [...new Set(allDeals.map((d) => d[FIELD_IDS.developer]).filter(Boolean))],
        totalDealsByMonth,
        propertyTypesData,
        developersData,
        leadSourceData,
        salesByPropertyType,
        developerCommissionData,
        developerUnitsData,
        salesByAgentData,
      };
    },
  });
};