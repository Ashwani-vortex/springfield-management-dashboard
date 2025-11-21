import { useState, useMemo } from "react";
import { useTeamsData } from "../hooks/useTeamData";
import { TOKENS } from "../utils/data";

// UI Components (From your project structure)
import { Card } from "../utils/ui/Card";
import { CardHeader } from "../utils/ui/CardHeader";
import { CardBody } from "../utils/ui/CardBody";
import { Input } from "../utils/ui/Input";

// Icons
import { Users, Search, Loader2, AlertCircle, Briefcase } from "lucide-react";

export function TeamsPage() {
  // 1. Get Data from Bitrix Hook
  const { data: teams, isLoading, isError, error } = useTeamsData();
  const [searchQuery, setSearchQuery] = useState("");

  // 2. Memoize the filtering logic (Exact logic from reference code)
  const filteredTeams = useMemo(() => {
    if (!teams) return [];

    // If there's no search query, return all teams
    if (!searchQuery.trim()) {
      return teams;
    }

    const lowerCaseQuery = searchQuery.toLowerCase();

    // Filter members within teams, then remove empty teams
    return teams
      .map((team) => {
        const filteredMembers = team.members.filter(
          (member) =>
            member.name.toLowerCase().includes(lowerCaseQuery) ||
            member.role.toLowerCase().includes(lowerCaseQuery)
        );
        return { ...team, members: filteredMembers };
      })
      .filter((team) => team.members.length > 0);
  }, [teams, searchQuery]);

  // 3. Loading State
  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-96 text-gray-500">
        <Loader2 className="animate-spin mb-2" size={32} style={{ color: TOKENS.primary }} />
        <p>Loading Teams...</p>
      </div>
    );
  }

  // 4. Error State
  if (isError) {
    return (
      <div className="flex flex-col justify-center items-center h-96 text-red-500">
        <AlertCircle size={32} className="mb-2" />
        <p>Error: {error?.message || "Failed to load teams"}</p>
      </div>
    );
  }

  // 5. Main UI
  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <Card>
        <CardBody>
          <div className="relative">
            <Search 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" 
              size={18} 
            />
            <Input
              className="pl-10 w-full"
              placeholder="Search by name or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardBody>
      </Card>

      {/* Display Teams */}
      {filteredTeams && filteredTeams.length > 0 ? (
        filteredTeams.map((team) => (
          <Card key={team.id || team.name}>
            <CardHeader
              title={`${team.name} (${team.members.length})`}
              icon={<Users size={18} style={{ color: TOKENS.primary }} />}
            />
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {team.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-3 rounded-xl border transition-shadow duration-200 hover:shadow-md bg-white"
                    style={{ borderColor: TOKENS.border }}
                  >
                    {/* Member Image */}
                    {/* <img
                      src={member.image}
                      alt={member.name}
                      className="w-12 h-12 rounded-full object-cover bg-gray-100 border"
                      style={{ borderColor: TOKENS.border }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://placehold.co/100x100/E2E8F0/4A5568?text=${member.name.charAt(0)}`;
                      }}
                    /> */}
                    
                    {/* Member Details */}
                    <div className="overflow-hidden">
                      <div className="font-semibold text-gray-800 truncate" title={member.name}>
                        {member.name}
                      </div>
                      <div 
                        className="text-xs truncate" 
                        style={{ color: TOKENS.muted }}
                        title={member.role}
                      >
                        {member.role}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        ))
      ) : (
        /* Empty State */
        <Card>
          <CardBody>
            <div className="flex flex-col items-center justify-center py-10 text-gray-500">
              <Users size={48} className="mb-4 opacity-20" />
              <p>No members found matching your search.</p>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}