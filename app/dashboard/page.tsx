"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { ErrorChart } from "@/components/dashboard/error-chart";
import { ClusterList } from "@/components/dashboard/cluster-list";
import { ChartDataPoint, ClusterSummary } from "@/lib/types";

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [clusters, setClusters] = useState<ClusterSummary[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const eventId = searchParams.get("eventId");

  useEffect(() => {
    if (!eventId) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch both the event data and summaries
        const [eventResponse, summariesResponse] = await Promise.all([
          fetch(`/api/events/${eventId}`),
          fetch(`/api/summaries?eventId=${eventId}`),
        ]);

        if (!eventResponse.ok || !summariesResponse.ok) {
          throw new Error("Failed to fetch data");
        }

        const eventData = await eventResponse.json();
        const summariesData = await summariesResponse.json();

        // Process the logs into chart data points
        const timeMap = new Map<number, number>();
        
        // Round timestamps to the nearest minute and count errors
        eventData.events.forEach((log: any) => {
          if (log.logLevel === "ERROR" || log.logLevel === "CRITICAL") {
            // Round to nearest minute (60 seconds)
            const roundedTime = Math.floor(log.timestamp / 60) * 60;
            timeMap.set(roundedTime, (timeMap.get(roundedTime) || 0) + 1);
          }
        });

        // Convert the map to an array of data points
        const chartPoints: ChartDataPoint[] = Array.from(timeMap.entries())
          .map(([timestamp, errorCount]) => ({ timestamp, errorCount }))
          .sort((a, b) => a.timestamp - b.timestamp);

        setChartData(chartPoints);
        setClusters(summariesData.summaries);
      } catch (error) {
        toast({
          title: "Error fetching data",
          description: error instanceof Error ? error.message : "An unknown error occurred",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [eventId, toast]);

  if (isLoading) {
    return (
      <div className="container py-10 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-lg font-medium">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (!eventId) {
    return (
      <div className="container py-10">
        <Card className="mx-auto max-w-md">
          <CardHeader>
            <CardTitle>No Data Available</CardTitle>
            <CardDescription>
              Please upload logs or fetch from New Relic to view the dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href="/upload">Go to Upload Page</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Log analysis and anomaly detection
          </p>
        </div>
        <Button asChild variant="outline">
          <a href="/upload">Upload New Logs</a>
        </Button>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Error Frequency</CardTitle>
              <CardDescription>
                Chart showing error count over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ErrorChart data={chartData} />
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Log Entries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {chartData.reduce((sum, point) => sum + point.errorCount, 0)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Anomaly Clusters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{clusters.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Critical Issues
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">
                  {clusters.filter(c => c.severity === "critical").length}
                </div>
              </CardContent>
            </Card>
          </div>

          {clusters.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Top Anomalies</CardTitle>
                <CardDescription>
                  The most significant issues detected in your logs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ClusterList 
                  clusters={clusters.slice(0, 3)} 
                  onViewAll={() => setActiveTab("anomalies")} 
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="anomalies">
          <Card>
            <CardHeader>
              <CardTitle>All Detected Anomalies</CardTitle>
              <CardDescription>
                Comprehensive list of anomalies clustered by AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              {clusters.length > 0 ? (
                <ClusterList clusters={clusters} />
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No anomalies detected in the logs.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}