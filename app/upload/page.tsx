"use client";

import { Header } from "@/components/header";
import { UploadDocument } from "@/components/upload-document";

export default function UploadPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <div className="flex-1 p-8">
        <div className="max-w-3xl mx-auto">
          <UploadDocument />
        </div>
      </div>
    </div>
  );
}

