import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Upload, FileImage, FileVideo, FileAudio, X, AlertTriangle, CheckCircle, Loader2, ScanLine } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ScanResult {
  fileName: string;
  fileType: string;
  fileSize: number;
  aiProbability: number;
  isAiGenerated: boolean;
  detectionDetails: {
    category: string;
    confidence: string;
    indicators: string[];
  };
  scannedAt: string;
}

const ACCEPTED_FORMATS = {
  image: [".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif", ".heic", ".bmp", ".tiff"],
  video: [".mp4", ".webm", ".mov", ".avi", ".mkv", ".m4v", ".wmv"],
  audio: [".mp3", ".wav", ".ogg", ".m4a", ".flac", ".aac", ".wma"],
};

const ALL_ACCEPTED = [...ACCEPTED_FORMATS.image, ...ACCEPTED_FORMATS.video, ...ACCEPTED_FORMATS.audio];

function getFileType(fileName: string): "image" | "video" | "audio" | "unknown" {
  const ext = fileName.toLowerCase().substring(fileName.lastIndexOf("."));
  if (ACCEPTED_FORMATS.image.includes(ext)) return "image";
  if (ACCEPTED_FORMATS.video.includes(ext)) return "video";
  if (ACCEPTED_FORMATS.audio.includes(ext)) return "audio";
  return "unknown";
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileIcon({ type }: { type: string }) {
  switch (type) {
    case "image":
      return <FileImage className="h-5 w-5 text-blue-500" />;
    case "video":
      return <FileVideo className="h-5 w-5 text-purple-500" />;
    case "audio":
      return <FileAudio className="h-5 w-5 text-green-500" />;
    default:
      return <Upload className="h-5 w-5 text-muted-foreground" />;
  }
}

export function MediaScanner() {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanProgress, setScanProgress] = useState(0);

  const scanMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await fetch("/api/scan-media", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Scan failed");
      }
      
      return response.json() as Promise<ScanResult>;
    },
    onSuccess: (result) => {
      setScanResult(result);
      setScanProgress(100);
      toast({
        title: "Scan Complete",
        description: result.isAiGenerated 
          ? "AI-generated content detected!" 
          : "No AI-generated content detected.",
        variant: result.isAiGenerated ? "destructive" : "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Scan Failed",
        description: error.message,
        variant: "destructive",
      });
      setScanProgress(0);
    },
  });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleFileSelect = (file: File) => {
    const ext = file.name.toLowerCase().substring(file.name.lastIndexOf("."));
    if (!ALL_ACCEPTED.includes(ext)) {
      toast({
        title: "Unsupported Format",
        description: `Please upload a supported image, video, or audio file.`,
        variant: "destructive",
      });
      return;
    }

    const maxSize = 100 * 1024 * 1024; // 100MB limit
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "Maximum file size is 100MB.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    setScanResult(null);
    setScanProgress(0);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const startScan = () => {
    if (!selectedFile) return;
    
    setScanProgress(0);
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        return prev + 10;
      });
    }, 200);

    scanMutation.mutate(selectedFile);
  };

  const clearFile = () => {
    setSelectedFile(null);
    setScanResult(null);
    setScanProgress(0);
  };

  const fileType = selectedFile ? getFileType(selectedFile.name) : "unknown";

  return (
    <Card className="border-dashed" data-testid="card-media-scanner">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <ScanLine className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">AI Content Scanner</CardTitle>
        </div>
        <CardDescription>
          Drop an image, video, or audio file to scan for AI-generated content
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!selectedFile ? (
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            data-testid="dropzone-media"
          >
            <input
              type="file"
              accept={ALL_ACCEPTED.join(",")}
              onChange={handleInputChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              data-testid="input-file-upload"
            />
            <div className="flex flex-col items-center gap-3">
              <div className="p-4 rounded-full bg-primary/10">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="font-medium">Drop your file here</p>
                <p className="text-sm text-muted-foreground mt-1">
                  or click to browse
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                <Badge variant="secondary" className="text-xs gap-1">
                  <FileImage className="h-3 w-3" />
                  Images
                </Badge>
                <Badge variant="secondary" className="text-xs gap-1">
                  <FileVideo className="h-3 w-3" />
                  Videos
                </Badge>
                <Badge variant="secondary" className="text-xs gap-1">
                  <FileAudio className="h-3 w-3" />
                  Audio
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Max file size: 100MB
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Selected file info */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-background">
                  <FileIcon type={fileType} />
                </div>
                <div className="min-w-0">
                  <p className="font-medium truncate max-w-[200px]" data-testid="text-file-name">
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(selectedFile.size)} • {fileType.charAt(0).toUpperCase() + fileType.slice(1)}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={clearFile}
                disabled={scanMutation.isPending}
                data-testid="button-clear-file"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Scan progress */}
            {scanMutation.isPending && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Scanning for AI content...</span>
                  <span className="font-medium">{scanProgress}%</span>
                </div>
                <Progress value={scanProgress} className="h-2" />
              </div>
            )}

            {/* Scan result */}
            {scanResult && (
              <div
                className={`p-4 rounded-lg border ${
                  scanResult.isAiGenerated
                    ? "bg-destructive/10 border-destructive/30"
                    : "bg-primary/10 border-primary/30"
                }`}
                data-testid="div-scan-result"
              >
                <div className="flex items-start gap-3">
                  {scanResult.isAiGenerated ? (
                    <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium" data-testid="text-scan-verdict">
                      {scanResult.isAiGenerated
                        ? "AI-Generated Content Detected"
                        : "Authentic Content"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Confidence: {scanResult.detectionDetails.confidence}
                    </p>
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">AI Probability</span>
                        <span className="font-medium" data-testid="text-ai-probability">
                          {(scanResult.aiProbability * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress
                        value={scanResult.aiProbability * 100}
                        className={`h-2 ${scanResult.isAiGenerated ? "[&>div]:bg-destructive" : ""}`}
                      />
                    </div>
                    {scanResult.detectionDetails.indicators.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium mb-2">Detection Indicators:</p>
                        <div className="flex flex-wrap gap-1">
                          {scanResult.detectionDetails.indicators.map((indicator, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {indicator}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            {!scanResult && (
              <Button
                onClick={startScan}
                disabled={scanMutation.isPending}
                className="w-full gap-2"
                data-testid="button-start-scan"
              >
                {scanMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <ScanLine className="h-4 w-4" />
                    Scan for AI Content
                  </>
                )}
              </Button>
            )}

            {scanResult && (
              <Button
                variant="outline"
                onClick={clearFile}
                className="w-full"
                data-testid="button-scan-another"
              >
                Scan Another File
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
