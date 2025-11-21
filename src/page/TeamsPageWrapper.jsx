import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TeamsPage } from "./TeamsPage";

const queryClient = new QueryClient();

export function TeamsPageWrapper() {
  return (
    <QueryClientProvider client={queryClient}>
      <TeamsPage />
    </QueryClientProvider>
  );
}
