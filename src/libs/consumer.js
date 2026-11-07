import kafka from "../libs/kafka.js"
import { kafkaMessagesCounter } from "./promethus.js";
import redis from "./redis.js"

const consumer=kafka.consumer({
    groupId:"search-analytics-group"
});

await consumer.connect();

console.log("Consumer connected")

await consumer.subscribe({
    topic:"search-events",
    fromBeginning:true
})


await consumer.run({
    eachMessage:async ({message}) => {
        const event=JSON.parse(message.value.toString());
        console.log("Search Event Received");
        await redis.incr("analytics:totalSearches")
        console.log("total searches updated")
        console.log(await redis.get("analytics:totalSearches"));
    }
})