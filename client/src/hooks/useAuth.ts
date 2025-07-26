import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

export function useAuth() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery(
    ["me"],
    async () => {
      const res = await fetch("/api/me", {
        credentials: "include", // 👈 This line is important!
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
      credentials: "include", // 👈 Include here as well (optional but good practice)
    });
    queryClient.invalidateQueries(["me"]);
  }, [queryClient]);

  return {
    user: data?.user,
    isAuthenticated: !!data?.user,
    isLoading,
    isError,
    logout,
  };
}
