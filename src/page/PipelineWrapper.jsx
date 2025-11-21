import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Pipeline } from "./Pipeline";

const queryClient = new QueryClient();

export function PipelineWrapper() {
  return (
    <QueryClientProvider client={queryClient}>
      <Pipeline />
    </QueryClientProvider>
  );
}
