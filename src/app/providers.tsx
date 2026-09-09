import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { AuthProvider } from "@/features/auth/AuthProvider";
import { queryClient } from "@/lib/queryClient";

export function Providers({ children }: { children: ReactNode }) { return <QueryClientProvider client={queryClient}><AuthProvider>{children}<Toaster position="top-right" richColors /></AuthProvider></QueryClientProvider>; }
