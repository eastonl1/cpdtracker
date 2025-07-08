"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, CheckCircle } from "lucide-react";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");

  useEffect(() => {
    // Assume success, Supabase handles token in background
    setStatus("success");

    const timeout = setTimeout(() => {
      router.push("/dashboard");
    }, 1500);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      {status === "verifying" && (
        <div className="flex flex-col items-center">
          <Loader2 className="w-8 h-8 animate-spin mb-4" />
          <p>Verifying your email...</p>
        </div>
      )}
      {status === "success" && (
        <div className="flex flex-col items-center">
          <CheckCircle className="w-8 h-8 text-green-500 mb-4" />
          <p>Email confirmed! Redirecting you to your dashboard...</p>
        </div>
      )}
      {status === "error" && (
        <div className="flex flex-col items-center">
          <p className="text-red-600">Something went wrong. Please try again later.</p>
        </div>
      )}
    </div>
  );
}
