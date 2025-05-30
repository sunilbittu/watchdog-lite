#!/bin/bash

LOG_API="https://log-api.newrelic.com/log/v1"
NEW_RELIC_LICENSE_KEY="cebd051df3d01a74af890e4b0f96a4adFFFFNRAL"

for i in {1..100}; do
  timestamp=$(date +%s%3N)
  curl -s -X POST "$LOG_API" \
    -H "Content-Type: application/json" \
    -H "X-License-Key: $NEW_RELIC_LICENSE_KEY" \
    -d "[
    {
      \"timestamp\": $timestamp,
      \"message\": \"TEST_ERROR line $i\",
      \"log.level\": \"error\",
      \"service.name\": \"demo-generator\"
    }
  ]"
done
