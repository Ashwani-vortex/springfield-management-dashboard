import { useEffect, useState } from "react";
import { runReport } from "../api/bitrix";

export function useAgentRanking(assignedById = null, year = null) {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      
      try {
        console.log("useAgentRanking: Starting fetch...");
        const result = await runReport(assignedById, year);
        
        if (!cancelled) {
          console.log("useAgentRanking: Data received", Object.keys(result).length, "agents");
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("useAgentRanking: Error", err);
          setError(err.message || "Something went wrong");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    // Cleanup function to prevent state updates on unmounted component
    return () => {
      cancelled = true;
    };
  }, [assignedById, year]);

  return { data, loading, error };
}