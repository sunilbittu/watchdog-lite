import { NextResponse } from "next/server";
import OpenAI from "openai";
import { supabase } from "@/lib/supabase";
import { NewRelicLogEntry, ClusterSummary } from "@/lib/types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

const BATCH_SIZE = 50;

export async function POST(req: Request) {
  try {
    const { eventId } = await req.json() as { eventId: string };
    
    if (!eventId) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }
    
    // Fetch the events from the database
    const { data: eventData, error: eventError } = await supabase
      .from("events_raw")
      .select("*")
      .eq("id", eventId)
      .single();
    
    if (eventError || !eventData) {
      return NextResponse.json(
        { error: "Failed to fetch event data" },
        { status: 404 }
      );
    }
    
    const logs: NewRelicLogEntry[] = eventData.events;
    
    // Process logs in batches
    const batches: NewRelicLogEntry[][] = [];
    for (let i = 0; i < logs.length; i += BATCH_SIZE) {
      batches.push(logs.slice(i, i + BATCH_SIZE));
    }
    
    const summaries: ClusterSummary[] = [];
    
    for (const batch of batches) {
      // Create a prompt for GPT-4o
      const prompt = `
        I need you to analyze these log entries and identify clusters of related issues.
        For each cluster, provide:
        1. A short descriptive label
        2. The likely root cause
        3. A few representative sample log messages
        4. A severity level (critical, warning, or info)
        5. The approximate count of this issue in the provided logs
        
        Format your response as a JSON array with objects containing:
        {
          "clusterLabel": "Short descriptive label",
          "rootCause": "Likely root cause explanation",
          "sample": ["sample log 1", "sample log 2"],
          "severity": "critical|warning|info",
          "count": 123
        }
        
        Here are the logs:
        ${JSON.stringify(batch, null, 2)}
      `;
      
      // Call OpenAI API
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
      });
      
      const content = response.choices[0].message.content;
      
      if (!content) {
        console.error("Empty response from OpenAI");
        continue;
      }
      
      try {
        // Parse the JSON response
        const clusterData = JSON.parse(content);
        
        // Validate the structure
        if (Array.isArray(clusterData)) {
          for (const cluster of clusterData) {
            if (
              cluster.clusterLabel &&
              cluster.rootCause &&
              Array.isArray(cluster.sample) &&
              ["critical", "warning", "info"].includes(cluster.severity) &&
              typeof cluster.count === "number"
            ) {
              summaries.push({
                ...cluster,
                eventId,
                user_id: eventData.user_id,
              });
            }
          }
        }
      } catch (parseError) {
        console.error("Failed to parse OpenAI response:", parseError);
        console.log("Raw response:", content);
      }
    }
    
    // Save the summaries to the database
    if (summaries.length > 0) {
      const { error: insertError } = await supabase
        .from("summaries")
        .insert(summaries.map(summary => ({
          user_id: summary.user_id,
          event_id: summary.eventId,
          cluster_label: summary.clusterLabel,
          root_cause: summary.rootCause,
          sample: summary.sample,
          severity: summary.severity,
          count: summary.count,
        })));
      
      if (insertError) {
        console.error("Failed to insert summaries:", insertError);
      }
    }
    
    return NextResponse.json({ success: true, clusters: summaries.length });
  } catch (error) {
    console.error("Error summarizing logs:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}