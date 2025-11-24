"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Dashboard from "@/components/Dashboard";

const queryClient = new QueryClient();

export default function Page() {
  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard />
    </QueryClientProvider>
  );
}
