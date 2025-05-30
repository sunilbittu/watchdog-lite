import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");
    
    if (!eventId) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }
    
    // Fetch summaries for the specified event
    const { data, error } = await supabase
      .from("summaries")
      .select("*")
      .eq("event_id", eventId);
    
    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch summaries" },
        { status: 500 }
      );
    }
    
    // Transform the data to match our expected format
    const transformedData = data.map((summary) => ({
      id: summary.id,
      created_at: summary.created_at,
      user_id: summary.user_id,
      eventId: summary.event_id,
      clusterLabel: summary.cluster_label,
      rootCause: summary.root_cause,
      sample: summary.sample,
      severity: summary.severity,
      count: summary.count,
    }));
    
    return NextResponse.json({ summaries: transformedData });
  } catch (error) {
    console.error("Error fetching summaries:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}