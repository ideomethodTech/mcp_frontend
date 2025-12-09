"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export const ApiProvider = ({ children }) => {
  const [queryClient] = useState(() => 
    new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
      retry: 1, // Changed from 3 to 1
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      retryOnMount: false, // Add this
    },
    mutations: {
      retry: 0, // Changed from 1 to 0
    },
  },
})
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Only show devtools in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={true} />
      )}
    </QueryClientProvider>
  );
};

export default ApiProvider;