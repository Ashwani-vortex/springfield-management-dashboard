import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DealsMonitoringPage } from "./DealsMonitoringPage";

const queryClient = new QueryClient();

export function DealsMonitoringPageWrapper() {
  return (
    <QueryClientProvider client={queryClient}>
      <DealsMonitoringPage />
    </QueryClientProvider>
  );
}
