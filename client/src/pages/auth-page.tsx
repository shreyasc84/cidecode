import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";
import { Redirect } from "wouter";

export default function AuthPage() {
  const { user, connectWithMetaMask, isLoading } = useAuth();

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
            onClick={() => connectWithMetaMask()}
            disabled={isLoading}
          >
            Connect with MetaMask
          </Button>
          <p className="mt-4 text-sm text-center text-muted-foreground">
            Only authorized law enforcement personnel can access this system
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
