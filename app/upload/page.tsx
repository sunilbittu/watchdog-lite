"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FileUploader } from "@/components/upload/file-uploader";
import { NewRelicLogEntry } from "@/lib/types";

export default function UploadPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [fileData, setFileData] = useState<NewRelicLogEntry[] | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleFileData = (data: NewRelicLogEntry[]) => {
    setFileData(data);
    toast({
      title: "File processed successfully",
      description: `${data.length} log entries found.`,
    });
  };

  const handleUpload = async () => {
    if (!fileData) return;
    
    setIsUploading(true);
    
    try {
      const response = await fetch("/api/saveEvents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ events: fileData }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to save log data");
      }
      
      const result = await response.json();
      
      toast({
        title: "Upload successful!",
        description: "Your log data has been saved and is ready for analysis.",
      });
      
      router.push(`/dashboard?eventId=${result.id}`);
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFetchFromNewRelic = async () => {
    setIsUploading(true);
    
    try {
      const response = await fetch("/api/fetchLogs", {
        method: "GET",
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch logs from New Relic");
      }
      
      const data = await response.json();
      
      toast({
        title: "Logs fetched successfully",
        description: `Retrieved ${data.events.length} log entries from New Relic.`,
      });
      
      router.push(`/dashboard?eventId=${data.id}`);
    } catch (error) {
      toast({
        title: "Fetch failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Upload Logs</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upload JSON Logs</CardTitle>
            <CardDescription>
              Upload your log data in JSON format. The file should contain an array of log entries
              with timestamp, message, and logLevel fields.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUploader onFileProcessed={handleFileData} />
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleUpload} 
              disabled={!fileData || isUploading}
              className="w-full"
            >
              {isUploading ? "Uploading..." : "Save & Analyze"}
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Fetch from New Relic</CardTitle>
            <CardDescription>
              Fetch the last 30 minutes of logs directly from New Relic using your API key.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              This will use the New Relic API key and account ID configured in your environment
              variables to fetch recent logs.
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleFetchFromNewRelic} 
              disabled={isUploading}
              className="w-full"
            >
              {isUploading ? "Fetching..." : "Fetch & Analyze"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}