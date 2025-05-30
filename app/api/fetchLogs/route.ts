import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const NR_API_KEY = process.env.NR_API_KEY;
    const NR_ACCOUNT_ID = process.env.NR_ACCOUNT_ID;
    
    if (!NR_API_KEY || !NR_ACCOUNT_ID) {
      return NextResponse.json(
        { error: "New Relic API key or account ID not configured" },
        { status: 500 }
      );
    }
    
    // Calculate time range (last 30 minutes)
    const endTime = Math.floor(Date.now() / 1000);
    const startTime = endTime - 30 * 60; // 30 minutes in seconds
    
    // NerdGraph query to fetch logs
    const graphqlQuery = {
      query: `
        {
          actor {
            account(id: ${NR_ACCOUNT_ID}) {
              logs {
                events(
                  filter: { timestamp: { from: ${startTime}, to: ${endTime} } }
                  limit: 1000
                ) {
                  timestamp
                  message {
                    content
                  }
                  logLevel
                }
              }
            }
          }
        }
      `,
    };
    
    // Make the request to New Relic's NerdGraph API
    const response = await fetch("https://api.newrelic.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "API-Key": NR_API_KEY,
      },
      body: JSON.stringify(graphqlQuery),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("New Relic API error:", errorText);
      return NextResponse.json(
        { error: "Failed to fetch logs from New Relic" },
        { status: response.status }
      );
    }
    
    const nerdGraphResponse = await response.json();
    
    // Transform the response to our expected format
    const events = nerdGraphResponse.data.actor.account.logs.events.map(
      (event: any) => ({
        timestamp: event.timestamp,
        message: event.message.content,
        logLevel: event.logLevel,
      })
    );
    
    // In a real application, this would include authentication
    // For simplicity, we're using a fixed user ID
    const userId = "system-user";
    
    // Save the events to the database
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
        { error: "Failed to save events from New Relic" },
        { status: 500 }
      );
    }
    
    // Trigger the summarization process
    await fetch(new URL("/api/summarise", response.url).toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ eventId: data.id }),
    });
    
    return NextResponse.json({ id: data.id, events });
  } catch (error) {
    console.error("Error fetching logs:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}