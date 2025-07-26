import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

/**
 * Authentication hook that fetches user information from the API
 */
export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      try {
        return await apiRequest("GET", "/api/auth/user");
      } catch (error: any) {
        // If user is not authenticated, return null instead of throwing
        if (error?.status === 401) {
          return null;
        }
        throw error;
      }
    },
    retry: false,
  });

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    error
  };
}