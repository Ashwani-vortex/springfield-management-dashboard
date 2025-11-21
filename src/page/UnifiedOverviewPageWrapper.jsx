import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UnifiedOverviewPage } from "./UnifiedOverviewPage";

const queryClient = new QueryClient();

export function UnifiedOverviewPageWrapper() {
  return (
    <QueryClientProvider client={queryClient}>
      <UnifiedOverviewPage />
    </QueryClientProvider>
  );
}
