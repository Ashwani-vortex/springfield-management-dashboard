import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Agents } from "./AgentReportPage";

const queryClient = new QueryClient();

export function AgentReportPagePageWrapper() {
  return (
    <QueryClientProvider client={queryClient}>
      <Agents />
    </QueryClientProvider>
  );
}
