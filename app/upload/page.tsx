"use client";

import { useRouter } from "next/navigation";
import { UploadDocument } from "@/components/upload-document";
import { Button } from "@/components/ui/button";
import { X, ArrowLeft } from "lucide-react";

export default function UploadPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header with Close Button */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="rounded-full"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Upload New Document</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Share your content and start earning
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/published')}
              className="rounded-full hover:bg-destructive/10 hover:text-destructive"
              title="Close"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Upload Form */}
          <UploadDocument />
        </div>
      </div>
    </div>
  );
}

