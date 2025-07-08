"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, CheckCircle } from "lucide-react";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");

  useEffect(() => {
    const token = searchParams.get("token");
    const type = searchParams.get("type"); // optional

    if (!token) {
      setStatus("error");
      return;
    }

    setStatus("success");

    // ✅ Redirect to login instead of dashboard
    setTimeout(() => {
      router.push("/auth");
    }, 1500);
  }, [searchParams, router]);

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
          <p>Email confirmed! Redirecting you to the login page...</p>
        </div>
      )}
      {status === "error" && (
        <div className="flex flex-col items-center">
          <p className="text-red-600">Invalid or missing token.</p>
        </div>
      )}
    </div>
  );
}
