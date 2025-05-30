"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ClusterItem } from "@/components/dashboard/cluster-item";
import { ClusterSummary } from "@/lib/types";

interface ClusterListProps {
  clusters: ClusterSummary[];
  onViewAll?: () => void;
}

export function ClusterList({ clusters, onViewAll }: ClusterListProps) {
  const [expandedCluster, setExpandedCluster] = useState<string | null>(null);
  const [notifying, setNotifying] = useState<string | null>(null);
  const { toast } = useToast();

  const toggleExpand = (clusterId: string) => {
    setExpandedCluster(expandedCluster === clusterId ? null : clusterId);
  };

  const handleNotify = async (cluster: ClusterSummary) => {
    setNotifying(cluster.id || null);
    
    try {
      const response = await fetch("/api/notify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ summaryId: cluster.id }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to send notification");
      }
      
      toast({
        title: "Notification sent",
        description: `Alert for "${cluster.clusterLabel}" was sent to Slack`,
      });
    } catch (error) {
      toast({
        title: "Failed to send notification",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setNotifying(null);
    }
  };

  // Sort clusters by severity (critical first, then warning, then info)
  const sortedClusters = [...clusters].sort((a, b) => {
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    return (
      severityOrder[a.severity as keyof typeof severityOrder] -
      severityOrder[b.severity as keyof typeof severityOrder]
    );
  });

  return (
    <div className="space-y-4">
      {sortedClusters.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-muted-foreground">No anomalies detected</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {sortedClusters.map((cluster) => (
              <ClusterItem
                key={cluster.id}
                cluster={cluster}
                expanded={expandedCluster === cluster.id}
                onToggle={() => toggleExpand(cluster.id || "")}
                onNotify={() => handleNotify(cluster)}
                isNotifying={notifying === cluster.id}
              />
            ))}
          </div>
          
          {onViewAll && clusters.length > 3 && (
            <div className="pt-4 text-center">
              <Button variant="outline" onClick={onViewAll}>
                View All Anomalies
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}