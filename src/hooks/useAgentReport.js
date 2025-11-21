import { useState,useEffect  } from "react";
import { generateReportData} from "../api/bitrix";
import { useQuery } from "@tanstack/react-query";

export function useAgentReport() {
  const [data, setData] = useState({ agents: [], report: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        const { agentList, performance } = await generateReportData();
        if (mounted) {
          setData({ agents: agentList, report: performance });
        }
      } catch (err) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => { mounted = false; };
  }, []);

  return { ...data, loading, error };
}