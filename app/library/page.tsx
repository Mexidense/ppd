"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LibraryRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to home page (which now has both marketplace and library)
    router.replace("/");
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
        <p className="mt-4 text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
}
