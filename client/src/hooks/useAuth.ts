import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  // For local development, bypass authentication
  if (import.meta.env.DEV) {
    return {
      user: { claims: { sub: "local_user", email: "local@example.com", first_name: "Local", last_name: "User" } },
      isLoading: false,
      isAuthenticated: true,
    };
  }

  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}


