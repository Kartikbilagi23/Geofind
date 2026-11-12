
import kafka from "./kafka.js";

const producer = kafka.producer();

await producer.connect();

console.log("Kafka producer connected successfully!");

export default producer;
