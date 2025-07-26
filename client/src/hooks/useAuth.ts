// NewLogBook/client/src/hooks/useAuth.ts

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

export function useAuth() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery(
    ["me"],
    async () => {
      // This is the corrected API endpoint
      const res = await fetch("/api/auth/user", { 
        credentials: "include", 
      });
      if (!res.ok) return null;
      return res.json();
    },
    {
      retry: false,
    }
  );

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    queryClient.invalidateQueries(["me"]);
  }, [queryClient]);

  return {
    // I also simplified this line for you
    user: data, 
    isAuthenticated: !!data,
    isLoading,
    isError,
    logout,
  };
}
