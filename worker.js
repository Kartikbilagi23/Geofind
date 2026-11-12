
import "dotenv/config";
import { startConsumer } from "./src/libs/consumer.js";
import redis from "./src/libs/redis.js";

console.log("Starting GeoFind Kafka Worker...");

const consumer = await startConsumer();

async function shutdown(signal) {
    console.log(`${signal} received. Shutting down worker...`);

    try {
        await consumer.stop();
        await consumer.disconnect();
        await redis.quit();

        console.log("Worker shut down successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Worker shutdown failed:", error.message);
        process.exit(1);
    }
}

process.once("SIGTERM", () => shutdown("SIGTERM"));
process.once("SIGINT", () => shutdown("SIGINT"));
