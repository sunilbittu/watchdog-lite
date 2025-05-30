import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { NewRelicLogEntry } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const { events } = await req.json() as { events: NewRelicLogEntry[] };
    
    if (!events || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { error: "Invalid or empty events array" },
        { status: 400 }
      );
    }
    
    // In a real application, this would include authentication
    // For simplicity, we're using a fixed user ID
    const userId = "system-user";
    
    // Insert the events into the database
    const { data, error } = await supabase
      .from("events_raw")
      .insert({
        user_id: userId,
        events,
      })
      .select("id")
      .single();
    
    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to save events" },
        { status: 500 }
      );
    }
    
    // Trigger the summarization process
    const summarizeResponse = await fetch(
      new URL("/api/summarise", req.url).toString(),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ eventId: data.id }),
      }
    );
    
    if (!summarizeResponse.ok) {
      console.warn("Warning: Summarization process failed but events were saved");
    }
    
    return NextResponse.json({ id: data.id });
  } catch (error) {
    console.error("Error saving events:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}