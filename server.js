
import "dotenv/config";

import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first");

import net from "node:net";
net.setDefaultAutoSelectFamily(false);

import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { typeDefs } from "./src/graphql/typedefs.js";
import { resolvers } from "./src/graphql/resolvers.js";
import { register } from "./src/libs/promethus.js";
import { startConsumer } from "./src/libs/consumer.js";
import producer from "./src/libs/producer.js";
import redis from "./src/libs/redis.js";

import jwt from "jsonwebtoken";
import http from "node:http";

const server = new ApolloServer({
    typeDefs,
    resolvers,
});

const { url } = await startStandaloneServer(server, {
    listen: {
        port: Number(process.env.PORT) || 4002,
        host: "0.0.0.0",
    },

    context: async ({ req }) => {
        const authHeader = req.headers.authorization;
        const token = authHeader?.replace("Bearer ", "");

        let user = null;

        if (token) {
            try {
                const decoded = jwt.verify(
                    token,
                    process.env.JWT_SECRET
                );

                user = {
                    userId: decoded.userId,
                    email: decoded.email,
                };
            } catch (error) {
                console.log("JWT error:", error.message);
            }
        }

        return { user };
    },
});

// Prometheus metrics server
const metricsServer = http.createServer(async (req, res) => {
    if (req.url === "/metrics") {
        try {
            res.writeHead(200, {
                "Content-Type": register.contentType,
            });

            res.end(await register.metrics());
        } catch (error) {
            res.writeHead(500);
            res.end("Failed to generate metrics");
        }

        return;
    }

    res.writeHead(404);
    res.end("Not found");
});

metricsServer.listen(4003, "0.0.0.0", () => {
    console.log("Metrics server started on port 4003");
});

// Start Kafka consumer in the same process
console.log("Starting GeoFind Kafka Consumer...");

const consumer = await startConsumer();

console.log("GraphQL server started at", url);
console.log("GeoFind API and Kafka consumer are running!");


// Graceful shutdown
let shuttingDown = false;

async function shutdown(signal) {
    if (shuttingDown) return;
    shuttingDown = true;

    console.log(`${signal} received. Shutting down GeoFind...`);

    try {
        await consumer.stop();
        await consumer.disconnect();

        await server.stop();

        await new Promise((resolve, reject) => {
            metricsServer.close((error) => {
                if (error) reject(error);
                else resolve();
            });
        });

        await producer.disconnect();

        if (redis.isOpen) {
            await redis.quit();
        }

        console.log("GeoFind shut down successfully.");
        process.exit(0);

    } catch (error) {
        console.error("Shutdown failed:", error.message);
        process.exit(1);
    }
}

process.once("SIGTERM", () => shutdown("SIGTERM"));
process.once("SIGINT", () => shutdown("SIGINT"));
