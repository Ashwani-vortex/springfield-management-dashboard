import { useQuery } from "@tanstack/react-query";
import { getAllUsers, getDepartments } from "../api/bitrix";

export const useTeamsData = () => {
  return useQuery({
    queryKey: ["teamsData"],
    queryFn: async () => {
      // Fetch both users and departments in parallel for speed
      const [users, departments] = await Promise.all([
        getAllUsers(),
        getDepartments(),
      ]);

      // Create a map for easy department name lookup
      const departmentMap = new Map(
        departments.map((dept) => [dept.ID, dept.NAME])
      );

      // Initialize an empty structure to hold our teams
      const teamsAgg = {};
      for (const dept of departments) {
        teamsAgg[dept.ID] = {
          name: dept.NAME,
          members: [],
        };
      }

      // Iterate over each user and assign them to their respective teams
      for (const user of users) {
        const member = {
          id: user.ID,
          name: `${user.NAME || ""} ${user.LAST_NAME || ""}`.trim(),
          role: user.WORK_POSITION || "N/A",
          // Use a fallback image if the user has no personal photo
          image:
            user.PERSONAL_PHOTO ||
            `https://placehold.co/100x100/E2E8F0/4A5568?text=${(
              user.NAME || "U"
            ).charAt(0)}`,
        };

        // A user can be in multiple departments
        if (user.UF_DEPARTMENT && user.UF_DEPARTMENT.length > 0) {
          for (const deptId of user.UF_DEPARTMENT) {
            if (teamsAgg[deptId]) {
              teamsAgg[deptId].members.push(member);
            }
          }
        }
      }

      // Convert the aggregated object into an array and filter out empty teams
      const teamsData = Object.values(teamsAgg).filter(
        (team) => team.members.length > 0
      );

      return teamsData;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};
