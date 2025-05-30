"use client";

import { useState, useRef } from "react";
import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { NewRelicLogEntry } from "@/lib/types";

interface FileUploaderProps {
  onFileProcessed: (data: NewRelicLogEntry[]) => void;
}

export function FileUploader({ onFileProcessed }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    
    try {
      if (file.type !== "application/json") {
        throw new Error("Only JSON files are supported");
      }
      
      const text = await file.text();
      const data = JSON.parse(text);
      
      // Validate the structure of the JSON file
      if (!Array.isArray(data)) {
        throw new Error("File must contain an array of log entries");
      }
      
      // Check if the data has the required fields
      const isValid = data.every((entry: any) => 
        typeof entry.timestamp === "number" && 
        typeof entry.message === "string" && 
        typeof entry.logLevel === "string"
      );
      
      if (!isValid) {
        throw new Error("Each log entry must have timestamp, message, and logLevel fields");
      }
      
      onFileProcessed(data);
    } catch (error) {
      toast({
        title: "Error processing file",
        description: error instanceof Error ? error.message : "Invalid file format",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-lg p-10 text-center",
        isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25",
        "transition-colors duration-200"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="p-3 rounded-full bg-primary/10">
          <UploadCloud className="h-8 w-8 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium">
            {isProcessing ? "Processing file..." : "Drag and drop your JSON file here"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            or click to browse files
          </p>
        </div>
        <button
          type="button"
          onClick={handleButtonClick}
          disabled={isProcessing}
          className="text-sm text-primary underline cursor-pointer"
        >
          Select a file
        </button>
      </div>
    </div>
  );
}