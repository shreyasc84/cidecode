import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Wallet, Key, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Step = {
  title: string;
  description: string;
  Icon: typeof Shield;
};

const steps: Step[] = [
  {
    title: "Welcome to JusticeChain",
    description: "A secure blockchain-based evidence management system",
    Icon: Shield,
  },
  {
    title: "Connect Your Wallet",
    description: "Use MetaMask or WalletConnect to authenticate securely",
    Icon: Wallet,
  },
  {
    title: "Role-Based Access",
    description: "Your wallet address determines your access level and permissions",
    Icon: Key,
  },
];

interface WalletOnboardingProps {
  onConnect: () => void;
}

export function WalletOnboarding({ onConnect }: WalletOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep === steps.length - 1) {
      onConnect();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-4">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="p-3 rounded-full bg-primary/10 text-primary"
                >
                  {React.createElement(steps[currentStep].Icon, { className: "w-8 h-8" })}
                </motion.div>
                <div>
                  <h2 className="text-xl font-bold">{steps[currentStep].title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {steps[currentStep].description}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center mt-6">
                <div className="flex gap-2">
                  {steps.map((_, index) => (
                    <motion.div
                      key={index}
                      className={`h-2 w-2 rounded-full ${
                        index === currentStep ? "bg-primary" : "bg-primary/20"
                      }`}
                      animate={{
                        scale: index === currentStep ? 1.2 : 1,
                      }}
                    />
                  ))}
                </div>
                <Button onClick={nextStep} className="gap-2">
                  {currentStep === steps.length - 1 ? (
                    "Connect Wallet"
                  ) : (
                    <>
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
