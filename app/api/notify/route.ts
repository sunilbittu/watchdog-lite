import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { summaryId } = await req.json() as { summaryId: string };
    
    if (!summaryId) {
      return NextResponse.json(
        { error: "Summary ID is required" },
        { status: 400 }
      );
    }
    
    const SLACK_URL = process.env.SLACK_URL;
    
    if (!SLACK_URL) {
      return NextResponse.json(
        { error: "Slack webhook URL is not configured" },
        { status: 500 }
      );
    }
    
    // Fetch the summary from the database
    const { data: summary, error } = await supabase
      .from("summaries")
      .select("*")
      .eq("id", summaryId)
      .single();
    
    if (error || !summary) {
      return NextResponse.json(
        { error: "Failed to fetch summary data" },
        { status: 404 }
      );
    }
    
    // Format the message for Slack
    const slackMessage = {
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: `🚨 ${summary.severity.toUpperCase()}: ${summary.cluster_label}`,
            emoji: true,
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Root Cause:* ${summary.root_cause}`,
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Occurrences:* ${summary.count}`,
          },
        },
        {
          type: "divider",
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*Sample Logs:*\n```" + summary.sample.join("\n") + "```",
          },
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `Reported by WatchDog Lite at ${new Date().toISOString()}`,
            },
          ],
        },
      ],
    };
    
    // Send the message to Slack
    const slackResponse = await fetch(SLACK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(slackMessage),
    });
    
    if (!slackResponse.ok) {
      const errorText = await slackResponse.text();
      return NextResponse.json(
        { error: `Failed to send notification to Slack: ${errorText}` },
        { status: slackResponse.status }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending notification:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}