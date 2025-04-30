// app/(customer)/settings/_components/PasswordChangeForm.tsx
"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast"; // Or use sonner

// Adjust path if needed
import {
  PasswordChangeFormValues,
  passwordChangeSchema,
} from "../_actions/types";
import { changePassword } from "../_actions/actions";

// Adjust paths if needed
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";

export default function PasswordChangeForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PasswordChangeFormValues>({
    resolver: zodResolver(passwordChangeSchema),
    mode: "onBlur",
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const onSubmit = async (data: PasswordChangeFormValues) => {
    // Sensitive logs REMOVED
    // console.log("[Form] Submitting password change..."); // Optional: Keep non-sensitive
    setIsSubmitting(true);
    form.clearErrors();

    try {
      const result = await changePassword(data);
      // Sensitive logs REMOVED
      // console.log("[Form] Server action result:", result);

      if (result.success) {
        toast.success(result.message || "Password updated successfully!");
        form.reset();
      } else {
        toast.error(result.error || "Failed to update password.");
        if (result.fieldErrors) {
          (
            Object.keys(result.fieldErrors) as Array<
              keyof PasswordChangeFormValues
            >
          ).forEach((fieldName) => {
            const message = result.fieldErrors![fieldName];
            if (message) {
              form.setError(fieldName, { type: "server", message: message });
            }
          });
        }
      }
    } catch (error) {
      console.error("[Form] Client error submitting password change:", error);
      toast.error("An unexpected client error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
        <CardDescription>
          Update your account password. Choose a strong, unique password.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <CardContent className="space-y-4">
            {/* Current Password Field */}
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter your current password"
                      autoComplete="off" // Keep off
                      {...field}
                      disabled={isSubmitting}
                      aria-required="true"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* New Password Field */}
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter new password (min. 8 chars, complexity required)"
                      autoComplete="new-password"
                      {...field}
                      disabled={isSubmitting}
                      aria-required="true"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Confirm New Password Field */}
            <FormField
              control={form.control}
              name="confirmNewPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Confirm your new password"
                      autoComplete="new-password"
                      {...field}
                      disabled={isSubmitting}
                      aria-required="true"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting} className="ml-auto">
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isSubmitting ? "Updating..." : "Change Password"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
