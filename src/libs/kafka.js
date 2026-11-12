
import "dotenv/config";
import { Kafka } from "kafkajs";
import fs from "node:fs";

const kafka = new Kafka({
    clientId: "geofind",

    brokers: [process.env.KAFKA_BROKER],

    ssl: {
        rejectUnauthorized: true,
        ca: [fs.readFileSync("./certs/ca.pem", "utf-8")]
    },

    sasl: {
        mechanism: "scram-sha-256",
        username: process.env.KAFKA_USERNAME,
        password: process.env.KAFKA_PASSWORD
    }
});

export default kafka;
