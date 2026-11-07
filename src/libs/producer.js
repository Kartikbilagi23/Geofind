import kafka from "./kafka.js"
const producer=kafka.producer();

await producer.connect();

console.log("producer connected!")

export default producer;