
import kafka from "./kafka.js";
import { kafkaMessagesCounter } from "./promethus.js";
import redis from "./redis.js";

export async function startConsumer() {
    const consumer = kafka.consumer({
        groupId: "search-analytics-group"
    });

    try {
        await consumer.connect();
        console.log("Kafka consumer connected!");

        await consumer.subscribe({
            topic: "search-events",
            fromBeginning: true
        });

        await consumer.run({
            eachMessage: async ({ message }) => {
                if (!message.value) return;

                const event = JSON.parse(message.value.toString());

                console.log("Search event received:", {
                    category: event.category,
                    result: event.result
                });

                await redis.incr("analytics:totalSearches");

                kafkaMessagesCounter.inc();

                console.log(
                    "Total searches:",
                    await redis.get("analytics:totalSearches")
                );
            }
        });

        return consumer;
    } catch (error) {
        await consumer.disconnect().catch(() => {});
        throw error;
    }
}
