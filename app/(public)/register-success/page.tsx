"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const RegisterSuccess = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 bg-card p-8 rounded-lg shadow-lg border border-border"
      >
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex justify-center"
          >
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </motion.div>

          <h1 className="text-2xl font-bold text-foreground">
            Registration Successful!
          </h1>

          <div className="py-4">
            <p className="text-muted-foreground text-sm">
              Your account is currently pending approval. Our team will review
              your application and you will receive an email notification once
              your account has been activated.
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-accent/40 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Please note that the approval process may take up to 24-48
                hours. You can log in to check your account status at any time.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                onClick={() => router.push("/")}
                className="w-full bg-primary hover:bg-primary/90"
              >
                Go to Login
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/")}
                className="w-full"
              >
                Return to Home
              </Button>
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>
            Need help?{" "}
            <Button
              variant="link"
              className="p-0 h-auto font-semibold"
              onClick={() => router.push("/register-success")}
            >
              Contact Support
            </Button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterSuccess;
