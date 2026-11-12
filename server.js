import dns from "node:dns";
dns.setDefaultResultOrder('ipv4first');
import net from "node:net";
net.setDefaultAutoSelectFamily(false);
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { typeDefs } from "./src/graphql/typedefs.js";
import { resolvers } from "./src/graphql/resolvers.js";
import { register } from "./src/libs/promethus.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import http from "http";

dotenv.config();
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const { url } = await startStandaloneServer(server, {
  listen: {
    port: Number(process.env.PORT)||4002,
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

    return {
      user,
    };
  },
});

// Separate Prometheus metrics server
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

console.log(`GraphQL server started at ${url}`);