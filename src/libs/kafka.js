import { Kafka } from "kafkajs"

const kafka=new Kafka({
    clientId:"geofind",
    brokers:[process.env.KAFKA_BROKER]
})

export default kafka;