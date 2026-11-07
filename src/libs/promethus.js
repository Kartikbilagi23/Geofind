import client from "prom-client"

client.collectDefaultMetrics()

export const register = client.register;

export const searchCounter = new client.Counter({
    name: "search_request_total",
    help: "Total Nearby Searches"
})

export const cacheCounter = new client.Counter({
    name: "cache_hit_total",
    help: "Redis Cache Hits"
})

export const cacheMissCounter = new client.Counter({
    name: "cache_miss_total",
    help: 'Redis Cache Misses'
})

export const kafkaMessagesCounter = new client.Counter({
    name: "kafka_messages_total",
    help: "Kafka Produced Messages"
})

export const reqlatency = new client.Histogram({
    name: "request_latency_seconds",
    help: "Nearby Search Latency",
    buckets: [
        0.01,
        0.05,
        0.1,
        0.5,
        1,
        2
    ]
})