"use client";

import { AlertCircle, AlertTriangle, Info, ChevronDown, ChevronUp, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClusterSummary } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ClusterItemProps {
  cluster: ClusterSummary;
  expanded: boolean;
  onToggle: () => void;
  onNotify: () => void;
  isNotifying: boolean;
}

export function ClusterItem({
  cluster,
  expanded,
  onToggle,
  onNotify,
  isNotifying,
}: ClusterItemProps) {
  // Determine the appropriate icon and color based on severity
  const getSeverityDetails = (severity: string) => {
    switch (severity) {
      case "critical":
        return {
          icon: AlertCircle,
          color: "text-destructive",
          bgColor: "bg-destructive/10",
          borderColor: "border-destructive/50",
          badge: "bg-destructive text-destructive-foreground",
        };
      case "warning":
        return {
          icon: AlertTriangle,
          color: "text-amber-500",
          bgColor: "bg-amber-500/10",
          borderColor: "border-amber-500/50",
          badge: "bg-amber-500 text-white",
        };
      case "info":
      default:
        return {
          icon: Info,
          color: "text-blue-500",
          bgColor: "bg-blue-500/10",
          borderColor: "border-blue-500/50",
          badge: "bg-blue-500 text-white",
        };
    }
  };

  const { icon: SeverityIcon, color, bgColor, borderColor, badge } = getSeverityDetails(cluster.severity);

  return (
    <Card className={cn("transition-all duration-200", borderColor)}>
      <CardHeader className={cn("pb-2", bgColor)}>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <SeverityIcon className={cn("h-5 w-5", color)} />
            <h3 className="font-medium">{cluster.clusterLabel}</h3>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={badge}>
              {cluster.severity.charAt(0).toUpperCase() + cluster.severity.slice(1)}
            </Badge>
            <Badge variant="outline">{cluster.count} occurrences</Badge>
            <Button variant="ghost" size="sm" onClick={onToggle}>
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {expanded && (
        <>
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold mb-1">Root Cause</h4>
                <p className="text-sm text-muted-foreground">{cluster.rootCause}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold mb-1">Sample Logs</h4>
                <div className="bg-muted rounded-md p-3 overflow-auto max-h-[200px]">
                  <pre className="text-xs whitespace-pre-wrap">
                    {cluster.sample.join("\n")}
                  </pre>
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onNotify}
              disabled={isNotifying}
              className="ml-auto"
            >
              {isNotifying ? (
                <>
                  <span className="mr-2">Sending...</span>
                  <span className="animate-spin">
                    <Send className="h-4 w-4" />
                  </span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Notify Slack
                </>
              )}
            </Button>
          </CardFooter>
        </>
      )}
    </Card>
  );
}