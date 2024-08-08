import express from "express";
import { createServer } from "http";
import { execute, subscribe } from "graphql";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";
import { context, trace, defaultTextMapGetter } from "@opentelemetry/api";
import { W3CTraceContextPropagator } from "@opentelemetry/core";
import { URL } from "url"; // Node.js built-in module

// Do Opentelemetry propagation work
let tracer = trace.getTracer("graphql-backend");

// Define an interface for the input object that includes 'traceparent' & 'tracestate'.
interface Carrier {
  traceparent?: string;
  tracestate?: string;
}

// Assume "input" is an object with 'traceparent' & 'tracestate' keys.
const input: Carrier = {};

// Define GraphQL schema
const typeDefs = `
  type Query {
    hello: String
  }

  type Subscription {
    greetings: String
  }
`;

// Define GraphQL resolvers
const resolvers = {
  Query: {
    hello: () => "Hello, world!",
  },
  Subscription: {
    greetings: {
      subscribe: async function* () {
        console.log("Subscription started"); // Log when the subscription starts
        for (const greeting of ["Hi", "Hello", "Hey"]) {
          console.log("Sending greeting:", greeting); // Log each greeting sent
          yield { greetings: greeting };
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      },
    },
  },
};

const schema = makeExecutableSchema({ typeDefs, resolvers });

const app = express();
const httpServer = createServer(app);

const propagator = new W3CTraceContextPropagator();

// Create a WebSocket server
const wsServer = new WebSocketServer({
  server: httpServer,
  path: "/graphql",
  handleProtocols: (protocols, req) => {
    console.log(req);
    console.log("Client requested protocols:", protocols);

    if (Array.from(protocols).includes("graphql-transport-ws")) {
      return "graphql-transport-ws";
    }
    if (Array.from(protocols).includes("graphql-ws")) {
      return "graphql-ws";
    }
    if (Array.from(protocols).includes("subscriptions-transport-ws")) {
      return "subscriptions-transport-ws";
    }

    console.warn("No matching protocol found. Defaulting to 'graphql-ws'.");
    return false; // No matching protocol
  },
});

// Use graphql-ws to handle subscriptions
useServer(
  {
    schema,
    execute,
    subscribe,
    onConnect: (ctx) => {
      const { request } = ctx.extra;

      // Parse the URL to extract query parameters
      const url = new URL(request.url || "", `http://${request.headers.host}`);
      const traceparent = url.searchParams.get("traceparent");

      console.log("Extracted traceparent:", traceparent);
      const headers = {
        // Set traceparent header
        traceparent: traceparent || "",
      };

      // Extract the trace context from headers
      const activeContext = propagator.extract(
        context.active(),
        headers,
        defaultTextMapGetter
      );

      console.log("Extracted context:", activeContext);
      // Set the extracted context as active
      context.with(activeContext, () => {
        // From here, any spans you create will be part of the extracted context
        const span = tracer.startSpan("websocket-connection");
        console.log("Span started with context:", span.spanContext());

        // Make sure to end the span when appropriate
        span.end();
      });
    },
  },
  wsServer
);

// Serve the GraphQL API
app.use(express.json());
app.use("/graphql", (req, res) => {
  console.log(req.headers);
  res
    .status(200)
    .send("GraphQL API is running. Use a WebSocket client to connect.");
});

// Start the HTTP server
httpServer.listen(4000, () => {
  console.log("Server is running on http://localhost:4000/graphql");
});
