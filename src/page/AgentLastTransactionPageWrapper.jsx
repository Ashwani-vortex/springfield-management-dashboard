import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AgentLastTransactionPage } from "./AgentLastTransactionPage";

const queryClient = new QueryClient();

export function AgentLastTransactionPageWrapper() {
  return (
    <QueryClientProvider client={queryClient}>
      <AgentLastTransactionPage />
    </QueryClientProvider>
  );
}
