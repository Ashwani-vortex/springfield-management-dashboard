import { useQuery } from "@tanstack/react-query";
import {
  getAllUsers,
  getDepartments,
  getAllLeadsForYear,
  getAllWonDealsForYear,
  getLeadSources,
} from "../api/bitrix";

const parseMoney = (moneyString) => {
  if (!moneyString || typeof moneyString !== "string") return 0;
  return parseFloat(moneyString.split("|")[0]) || 0;
};

const GROSS_COMM_FIELD = import.meta.env.VITE_FIELD_GROSS_COMMISSION;

export const useAgentsData = (year) => {
  return useQuery({
    queryKey: ["agentsData", year],
    queryFn: async () => {
      // 1. Fetch all raw data concurrently
      const [users, departments, leads, deals, leadSources] = await Promise.all(
        [
          getAllUsers(),
          getDepartments(),
          getAllLeadsForYear(year),
          getAllWonDealsForYear(year),
          getLeadSources(),
        ]
      );

      // 2. Create helper maps for efficient lookups
      // FIX 1: Convert Department ID to String explicitly
      const departmentMap = new Map(departments.map((d) => [String(d.ID), d.NAME]));
      
      const leadSourceMap = new Map(
        leadSources.map((s) => [s.STATUS_ID, s.NAME])
      );

      // 3. Initialize agent profiles
      const agents = {};
      users.forEach((user) => {
        const teamIds = user.UF_DEPARTMENT || [];
        
        // FIX 2: Convert User's Department ID to String during lookup
        const teamNames = teamIds
          .map((id) => departmentMap.get(String(id)) || "Unknown")
          .join(", ");

        // Optional: Debugging to see if it works now
        // console.log(`User: ${user.NAME}, IDs: ${teamIds}, Result: ${teamNames}`);

        agents[user.ID] = {
          id: user.ID,
          name: `${user.NAME || ""} ${user.LAST_NAME || ""}`.trim(),
          image:
            user.PERSONAL_PHOTO ||
            "https://placehold.co/100x100/E2E8F0/4A5568?text=NA",
          team: teamNames || "Unassigned", // Fallback if array was empty
          leads: 0,
          deals: 0,
          calls: 0,
          conv: 0,
          commissionAED: 0,
          revenue: 0,
          tasks: 0,
          missed: 0,
          activities: 0,
          closures: 0,
          commissionPct: 0,
          monthlyTrends: Array(12)
            .fill(0)
            .map((_, i) => ({ month: i, leads: 0, deals: 0, calls: 0 })),
          leadSources: {},
        };
      });

      // 4. Process leads
      leads.forEach((lead) => {
        const agent = agents[lead.ASSIGNED_BY_ID];
        if (agent) {
          agent.leads++;
          const date = new Date(lead.DATE_CREATE);
          if(!isNaN(date)) {
             const month = date.getMonth();
             if(agent.monthlyTrends[month]) agent.monthlyTrends[month].leads++;
          }

          const sourceName = leadSourceMap.get(lead.SOURCE_ID) || "Unknown";
          agent.leadSources[sourceName] =
            (agent.leadSources[sourceName] || 0) + 1;
        }
      });

      // 5. Process deals
      deals.forEach((deal) => {
        const agent = agents[deal.ASSIGNED_BY_ID];
        if (agent) {
          agent.deals++;
          agent.commissionAED += parseMoney(deal[GROSS_COMM_FIELD]);
          agent.revenue += parseFloat(deal.OPPORTUNITY || 0);

          const date = new Date(deal.CLOSEDATE);
          if(!isNaN(date)) {
             const month = date.getMonth();
             if(agent.monthlyTrends[month]) agent.monthlyTrends[month].deals++;
          }
        }
      });

      // 6. Final formatting
      Object.values(agents).forEach((agent) => {
        agent.conv =
          agent.leads > 0 ? Math.round((agent.deals / agent.leads) * 100) : 0;

        // Format chart data
        agent.monthlyTrends = agent.monthlyTrends
          .map((d, i) => ({
            name: new Date(year, i).toLocaleString("default", {
              month: "short",
            }),
            ...d,
          }))
          .slice(0, new Date().getMonth() + 1);

        agent.leadSourcesData = Object.entries(agent.leadSources).map(
          ([name, value]) => ({ name, value })
        );
        agent.activityMixData = [
          { name: "Deals", value: agent.deals },
          { name: "Leads", value: agent.leads },
        ];
      });

      const teams = [
        { name: "All Teams" },
        ...departments.map((d) => ({ name: d.NAME })),
      ];

      return { agents: Object.values(agents), teams };
    },
    staleTime: 1000 * 60 * 10,
  });
};