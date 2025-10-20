"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Verification token is missing");
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        if (response.ok) {
          setStatus("success");
          setMessage("Email verified successfully! You can now log in to your account.");
        } else {
          const errorData = await response.json();
          setStatus("error");
          setMessage(errorData.detail || "Failed to verify email");
        }
      } catch (error) {
        setStatus("error");
        setMessage("Network error. Please try again.");
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {status === "loading" && "Verifying Email..."}
            {status === "success" && "Email Verified!"}
            {status === "error" && "Verification Failed"}
          </CardTitle>
          <CardDescription>
            {status === "loading" && "Please wait while we verify your email address"}
            {status === "success" && "Your email has been successfully verified"}
            {status === "error" && "There was a problem verifying your email"}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {status === "loading" && (
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          )}

          {status === "success" && (
            <div className="space-y-4">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
              <p className="text-green-700 font-medium">{message}</p>
              <Button asChild className="w-full">
                <Link href="/login">Continue to Login</Link>
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-4">
              <XCircle className="h-16 w-16 text-red-600 mx-auto" />
              <p className="text-red-700 font-medium">{message}</p>
              <div className="space-y-2">
                <Button asChild variant="outline" className="w-full">
                  <Link href="/login">Back to Login</Link>
                </Button>
                <Button asChild variant="ghost" className="w-full">
                  <Link href="/register">Register Again</Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}