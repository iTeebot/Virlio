"use client";

import React, { useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { RegistrationWizard } from "@/components/auth/RegistrationWizard";
import { Loader2 } from "lucide-react";

function RegisterFormContainer() {
  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      window.location.href = "/dashboard/overview";
    }
  }, [status]);

  return <RegistrationWizard />;
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-gray-500 flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          <span>Loading...</span>
        </div>
      }
    >
      <RegisterFormContainer />
    </Suspense>
  );
}