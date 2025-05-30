// API Types
export interface NewRelicLogEntry {
  timestamp: number;
  message: string;
  logLevel: string;
}

export interface EventData {
  id?: string;
  created_at?: string;
  user_id?: string;
  events: NewRelicLogEntry[];
}

export interface ClusterSummary {
  id?: string;
  created_at?: string;
  user_id?: string;
  eventId: string;
  clusterLabel: string;
  rootCause: string;
  sample: string[];
  severity: 'critical' | 'warning' | 'info';
  count: number;
}

// Chart Types
export interface ChartDataPoint {
  timestamp: number;
  errorCount: number;
}

// Auth Types
export interface User {
  id: string;
  email: string;
}

// Service Types
export interface NerdGraphResponse {
  data: {
    actor: {
      account: {
        logs: {
          events: Array<{
            timestamp: number;
            message: {
              content: string;
            };
            logLevel: string;
          }>;
        };
      };
    };
  };
}

export interface OpenAIResponse {
  id: string;
  choices: Array<{
    message: {
      content: string;
    };
    finish_reason: string;
  }>;
}