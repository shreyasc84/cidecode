import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";
import { Redirect } from "wouter";
import { RegistrationDialog } from "@/components/auth/registration-dialog";

export default function AuthPage() {
  const { user, connectWithMetaMask, isLoading } = useAuth();
  const [showRegistration, setShowRegistration] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");

  const handleConnect = async () => {
    try {
      await connectWithMetaMask();
    } catch (error: any) {
      if (error.message.includes("needsRegistration")) {
        // Extract wallet address from error response
        const address = error.message.split('"address":"')[1]?.split('"')[0];
        setWalletAddress(address);
        setShowRegistration(true);
      }
    }
  };

  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-6 w-6 text-primary" />
            <CardTitle>JusticeChain</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            Secure evidence tracking on the blockchain
          </p>
        </CardHeader>
        <CardContent>
          <Button 
            className="w-full" 
            size="lg"
            onClick={handleConnect}
            disabled={isLoading}
          >
            Connect with MetaMask
          </Button>
          <p className="mt-4 text-sm text-center text-muted-foreground">
            Only authorized law enforcement personnel can access this system
          </p>
        </CardContent>
      </Card>

      <RegistrationDialog
        isOpen={showRegistration}
        onClose={() => setShowRegistration(false)}
        address={walletAddress}
      />
    </div>
  );
}