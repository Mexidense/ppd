"use client";

import { useRouter } from "next/navigation";
import { UploadDocument } from "@/components/upload-document";
import { Button } from "@/components/ui/button";
import { X, ArrowLeft } from "lucide-react";

export default function UploadPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header with Close Button */}
          <div className="flex items-center justify-between mb-6 lg:mb-8">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="rounded-full flex-shrink-0"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">Upload New Document</h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Share your content and start earning
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/published')}
              className="rounded-full hover:bg-destructive/10 hover:text-destructive flex-shrink-0 ml-2"
              title="Close"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>

          {/* Upload Form */}
          <UploadDocument />
        </div>
      </div>
    </div>
  );
}

