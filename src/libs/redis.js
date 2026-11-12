
import "dotenv/config";
import { createClient } from "redis";

if (!process.env.REDIS_URL) {
    throw new Error("REDIS_URL is missing");
}

const redis = createClient({
    url: process.env.REDIS_URL
});

redis.on("error", (err) => {
    console.error("Redis Error:", err.message);
});

await redis.connect();

console.log("Redis connected successfully!");

export default redis;
