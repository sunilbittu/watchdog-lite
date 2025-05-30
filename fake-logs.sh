# .env  (replace with your values)
NEW_RELIC_LICENSE_KEY=cebd051df3d01a74af890e4b0f96a4adFFFFNRAL
LOG_API=https://log-api.newrelic.com/log/v1

# fake-logs.sh
for i in {1..100}; do
  curl -X POST $LOG_API \
       -H "Content-Type: application/json" \
       -H "X-License-Key: $NEW_RELIC_LICENSE_KEY" \
       -d '[
             {
               "timestamp": '"$(date +%s%3N)"',
               "message": "TEST_ERROR line '"$i"'",
               "log.level": "error",
               "service.name": "demo-generator"
             }
           ]'
done
