import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Activity, UploadCloud, BarChart3 } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  <span className="text-primary">WatchDog</span> Lite
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Intelligent log monitoring and anomaly detection powered by AI
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                <Button asChild size="lg" className="w-full">
                  <Link href="/dashboard">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="w-full">
                  <Link href="/upload">
                    <UploadCloud className="mr-2 h-4 w-4" />
                    Upload Logs
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="p-4 bg-background rounded-full">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Real-time Monitoring</h3>
                <p className="text-muted-foreground">
                  Fetch the last 30 minutes of logs from New Relic via NerdGraph API or upload your own JSON logs.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="p-4 bg-background rounded-full">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">AI-Powered Analysis</h3>
                <p className="text-muted-foreground">
                  Automatically cluster anomalies with GPT-4o to identify patterns and root causes.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="p-4 bg-background rounded-full">
                  <UploadCloud className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Instant Notifications</h3>
                <p className="text-muted-foreground">
                  Send critical anomalies directly to your Slack channel with a single click.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}