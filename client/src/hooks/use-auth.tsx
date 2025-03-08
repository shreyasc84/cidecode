import { createContext, ReactNode, useContext } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { User, UserRole } from "@shared/schema";
import { connectWallet } from "@/lib/web3";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  connectWithMetaMask: (registration?: RegistrationData) => Promise<void>;
  logout: () => Promise<void>;
};

type RegistrationData = {
  name: string;
  department: string;
  badgeNumber?: string;
  email?: string;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();

  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/user"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/user", { credentials: "include" });
        if (res.status === 401) return null;
        return res.json();
      } catch (error) {
        return null;
      }
    },
  });

  const connectMutation = useMutation({
    mutationFn: async (registration?: RegistrationData) => {
      const address = await connectWallet();
      const res = await apiRequest("POST", "/api/auth/connect", { 
        address,
        registration 
      });
      return res.json();
    },
    onSuccess: (response) => {
      if (response.needsRegistration) {
        toast({
          title: "Registration Required",
          description: "Please complete your registration to continue",
        });
        // You can trigger a registration modal/form here
      } else {
        queryClient.setQueryData(["/api/user"], response);
        toast({
          title: "Connected successfully",
          description: `Welcome ${response.name}`,
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Connection failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logged out successfully",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        connectWithMetaMask: (registration) => connectMutation.mutateAsync(registration),
        logout: () => logoutMutation.mutateAsync(),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}