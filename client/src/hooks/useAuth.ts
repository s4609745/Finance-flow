import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiService } from "@/lib/apiService";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

// Token management with XSS protection
const getToken = () => {
  try {
    return localStorage.getItem('token');
  } catch {
    return null;
  }
};
const setToken = (token: string) => {
  try {
    localStorage.setItem('token', token);
  } catch {
    // Handle storage errors silently
  }
};
const removeToken = () => {
  try {
    localStorage.removeItem('token');
  } catch {
    // Handle storage errors silently
  }
};

export function useAuth() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      const token = getToken();
      if (!token) return null;

      try {
        const response = await apiService.getCurrentUser();
        return response.data;
      } catch (error) {
        console.error('Auth error:', error);
        removeToken();
        return null;
      }
    },
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await apiService.login(credentials);
      return response.data;
    },
    onSuccess: (data) => {
      console.log(data, 'oiuyt783yrh893j')
      setToken(data.token);
      queryClient.setQueryData(["/api/auth/user"], data.user);
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
    }) => {
      const response = await apiService.register(userData);
      return response.data;
    },
    onSuccess: (data) => {
      setToken(data.token);
      queryClient.setQueryData(["/api/auth/user"], data.user);
      toast({
        title: "Welcome to ExpenseTracker Pro!",
        description: "Your account has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      removeToken();
      queryClient.setQueryData(["/api/auth/user"], null);
      queryClient.clear();
    },
    onSuccess: () => {
      setLocation("/");
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    },
  });

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    loginMutation,
    registerMutation,
    logoutMutation,
  };
}
