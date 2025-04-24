"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { LoginFormValues, loginSchema } from "./validation";
import { toast } from "sonner"; // Using sonner
import { ArrowLeft, Info, Loader2 } from "lucide-react"; // Import Loader2
import { login } from "./actions";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const LoginForm = () => {
  const router = useRouter();
  const [isPending, setIsPending] = React.useState(false);
  // --- State for loading message ---
  const [loadingMessage, setLoadingMessage] = React.useState("");

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    // --- Set initial loading message ---
    setLoadingMessage("Please wait... logging in");
    setIsPending(true); // Start loading state

    try {
      const result = await login(data); // Call the server action

      if (result?.error) {
        toast.error(result.error);
        if (result.error.includes("Invalid email or password")) {
          form.setError("email", { message: " " }); // Clear specific messages if desired
          form.setError("password", { message: " " }); // Let main toast handle it
        }
        // --- STOP loading on error ---
        setIsPending(false);
        setLoadingMessage("");
        return;
      }

      if (result?.redirectTo) {
        // --- Update loading message before redirect ---
        setLoadingMessage("Redirecting...");

        // Logic to determine which success message to show
        if (
          result.redirectTo === "/register-success" ||
          !result.sessionCreated
        ) {
          // This case handles initial registration completion or logins without session (USER role)
          // Adjust toast message if needed for USER role login without session
          // For now, assuming /register-success is the primary case here
          toast.success("Registration successful! Redirecting...");
        } else if (result.sessionCreated) {
          // --- Show Login Success Toast ---
          toast.success("Logged in successfully!!!");
        }

        // Small delay to allow toast to be seen before navigation
        await new Promise((resolve) => setTimeout(resolve, 500)); // Slightly longer delay?

        router.push(result.redirectTo);
        // No need to set isPending false here as navigation occurs
        return;
      }

      // Fallback if no error and no redirect (shouldn't normally happen)
      toast.warning("Login process completed unexpectedly.");
      setIsPending(false);
      setLoadingMessage("");
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Failed to sign in. Please try again.");
      // --- STOP loading on catch error ---
      setIsPending(false);
      setLoadingMessage("");
    }
    // Removed finally block as redirect handles pending state exit
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Back Button */}
      {!isPending && ( // Hide back button during loading? Optional.
        <div className="w-full max-w-md mb-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="flex items-center text-muted-foreground hover:text-foreground"
            disabled={isPending} // Disable if pending
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      )}

      <div className="w-full max-w-md space-y-6 bg-card p-8 rounded-lg shadow-lg border border-border">
        {/* --- Conditional Rendering for Loading State --- */}
        {isPending ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground animate-pulse">
              {loadingMessage || "Processing..."}
            </p>
          </div>
        ) : (
          // --- Render the form when not loading ---
          <>
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-semibold text-foreground">
                Welcome back! 👋 {/* Updated Welcome Message */}
              </h1>
              <p className="text-muted-foreground">
                Please sign in to your account to continue
              </p>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                {/* Email Field */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="you@example.com" // Changed placeholder
                          {...field}
                          disabled={isPending}
                          autoComplete="email"
                          type="email"
                          className="bg-input" // Use theme input background
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password Field */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Password</FormLabel>
                        <TooltipProvider delayDuration={100}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent side="top" align="end">
                              <ul className="list-disc list-inside text-xs">
                                <li>At least 8 characters</li>
                                <li>One uppercase letter</li>
                                <li>One lowercase letter</li>
                                <li>One number</li>
                                <li>One special character</li>
                              </ul>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <FormControl>
                        <Input
                          type="password"
                          {...field}
                          disabled={isPending}
                          autoComplete="current-password"
                          className="bg-input" // Use theme input background
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Remember Me / Forgot Password */}
                <FormField
                  control={form.control}
                  name="remember"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between pt-2">
                      <div className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isPending}
                            id="remember-me"
                          />
                        </FormControl>
                        <label
                          htmlFor="remember-me"
                          className="text-sm font-medium leading-none text-muted-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Remember me
                        </label>
                      </div>
                      <Link
                        href="/forgot-password" // Ensure this route exists
                        className="text-sm text-primary hover:text-primary/90 font-medium"
                      >
                        Forgot password?
                      </Link>
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full" // Removed specific colors, rely on theme primary
                  disabled={isPending}
                >
                  {/* Button loading state handled within the conditional rendering block above */}
                  Sign In
                </Button>

                {/* Link to Register */}
                <div className="text-center pt-2">
                  {" "}
                  {/* Added padding top */}
                  <p className="text-sm text-muted-foreground">
                    New on our platform?{" "}
                    <Link
                      href="/register" // Ensure this route exists
                      className="text-primary hover:text-primary/90 font-medium underline"
                    >
                      Create an account
                    </Link>
                  </p>
                </div>
              </form>
            </Form>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginForm;
