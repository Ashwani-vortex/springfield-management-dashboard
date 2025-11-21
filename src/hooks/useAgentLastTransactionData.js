import { useQuery } from "@tanstack/react-query";
import {
  getAllUsers,
  getDepartments,
  getDealsByYear,
} from "../api/bitrix";

const parseMoney = (moneyString) => {
  if (!moneyString) return 0;
  // Handle "1000.00|USD" format or just "1000"
  const val = typeof moneyString === "string" ? moneyString.split("|")[0] : moneyString;
  return parseFloat(val) || 0;
};

const GROSS_COMM_FIELD = import.meta.env.VITE_FIELD_GROSS_COMMISSION;
const PROJECT_NAME_FIELD = import.meta.env.VITE_FIELD_PROJECT_NAME;

export const useAgentLastTransactionData = (year) => {
  return useQuery({
    queryKey: ["agentLastTransaction", year],
    queryFn: async () => {
      const [users, departments, deals] = await Promise.all([
        getAllUsers(),
        getDepartments(),
        getDealsByYear(year),
      ]);

      const departmentMap = new Map(departments.map((d) => [d.ID, d.NAME]));

      const lastTransactions = {};
      
      deals.forEach((deal) => {
        const agentId = deal.ASSIGNED_BY_ID;
        if (!agentId) return;

        // FIX: Safety check for Close Date
        if (!deal.CLOSEDATE) return; 

        const dealDate = new Date(deal.CLOSEDATE);
        
        // FIX: Check if date is valid
        if (isNaN(dealDate.getTime())) return;

        // Logic: Update if we haven't seen this agent OR this deal is newer
        if (
          !lastTransactions[agentId] ||
          dealDate > lastTransactions[agentId].dealDate
        ) {
          lastTransactions[agentId] = {
            dealDate,
            project: deal[PROJECT_NAME_FIELD] || "N/A",
            amount: parseFloat(deal.OPPORTUNITY || 0),
            grossCommission: parseMoney(deal[GROSS_COMM_FIELD]),
          };
        }
      });

      const agents = users.map((user) => {
        // Safe team mapping
        const teamIds = user.UF_DEPARTMENT || [];
        // If UF_DEPARTMENT is a single ID (number), convert to array
        const teamArray = Array.isArray(teamIds) ? teamIds : [teamIds];
        
        const teamName = teamArray
          .map((id) => departmentMap.get(String(id)) || "")
          .filter(Boolean)
          .join(", ") || "Unknown";

        const lastTx = lastTransactions[user.ID];

        return {
          id: user.ID,
          name: `${user.NAME || ""} ${user.LAST_NAME || ""}`.trim(),
          // Safe check for custom fields
          hired_by: user.UF_USR_1728535335261 === "1341" ? "Company" : user.UF_USR_1728535335261 === "1343" ? "Agent" : "-",
          joining_date: user.UF_USR_1727158528318 ? user.UF_USR_1727158528318.split("T")[0] : "-",
          team: teamName,
          // Populate data if transaction exists, otherwise null
          lastTransactionDate: lastTx ? lastTx.dealDate.toISOString().split("T")[0] : null,
          lastTransactionProject: lastTx ? lastTx.project : null,
          lastTransactionAmount: lastTx ? lastTx.amount : 0,
          grossCommission: lastTx ? lastTx.grossCommission : 0,
        };
      });

      const teams = [
        { name: "All" },
        ...departments.map((d) => ({ name: d.NAME })),
      ];

      return { agents, teams };
    },
    staleTime: 1000 * 60 * 5, 
  });
};