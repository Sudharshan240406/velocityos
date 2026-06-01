import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Reset your VelocityOS password and get back into the cockpit.",
};

export default function ResetPasswordPage() {
  return <AuthShell authConfigured mode="reset" />;
}
