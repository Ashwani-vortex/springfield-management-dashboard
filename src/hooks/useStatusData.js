import { useQuery } from "@tanstack/react-query";
import { 
    getAllLeadsForYear, 
    getLeadStatuses, 
    getLeadSources, 
    getAllUsers 
} from "../api/bitrix";

// Helper function to calculate the age of a lead in a human-readable format
const getLeadAge = (dateCreate) => {
    const leadDate = new Date(dateCreate);
    const now = new Date();
    const diffMs = now - leadDate;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 24) return `${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d`;
};

export const useStatusData = (year) => {
  return useQuery({
    queryKey: ["statusData", year],
    queryFn: async () => {
      // 1. Fetch all necessary data in parallel
      const [leads, statuses, sources, users] = await Promise.all([
        getAllLeadsForYear(year),
        getLeadStatuses(),
        getLeadSources(),
        getAllUsers(),
      ]);

      // 2. Create helper maps for efficient data lookup
      const statusMap = new Map(statuses.map(s => [s.STATUS_ID, s.NAME]));
      const sourceMap = new Map(sources.map(s => [s.STATUS_ID, s.NAME]));
      const userMap = new Map(users.map(u => [u.ID, `${u.NAME || ''} ${u.LAST_NAME || ''}`.trim()]));

      // 3. Process data for each card
      
      // Pipeline Health Data
      const pipelineAgg = {};
      leads.forEach(lead => {
        const statusName = statusMap.get(lead.STATUS_ID) || "Unknown";
        pipelineAgg[statusName] = (pipelineAgg[statusName] || 0) + 1;
      });
      const pipelineHealthData = Object.entries(pipelineAgg).map(([stage, value]) => ({ stage, value }));

      // Lead Source Effectiveness Data
      const leadSourceAgg = {};
      leads.forEach(lead => {
        const sourceName = sourceMap.get(lead.SOURCE_ID) || "Unknown";
        leadSourceAgg[sourceName] = (leadSourceAgg[sourceName] || 0) + 1;
      });
      const leadSourceData = Object.entries(leadSourceAgg).map(([name, value]) => ({ name, value }));
      
      // Missed Leads Data (assuming 'NEW' is the status for a new, untouched lead)
      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));

      const missedLeads = leads
        .filter(lead => lead.STATUS_ID === 'NEW' && new Date(lead.DATE_CREATE) < twentyFourHoursAgo)
        .map(lead => ({
          id: lead.ID,
          source: sourceMap.get(lead.SOURCE_ID) || 'Unknown',
          agent: userMap.get(lead.ASSIGNED_BY_ID) || 'Unassigned',
          age: getLeadAge(lead.DATE_CREATE),
          rawAge: now - new Date(lead.DATE_CREATE)
        }))
        .sort((a, b) => b.rawAge - a.rawAge) // Sort by oldest first
        .slice(0, 3); // Get top 3 oldest missed leads

      return { pipelineHealthData, leadSourceData, missedLeads };
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};
