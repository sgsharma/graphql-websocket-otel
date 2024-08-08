import { HoneycombWebSDK } from "@honeycombio/opentelemetry-web";
import { getWebAutoInstrumentations } from "@opentelemetry/auto-instrumentations-web";
import { createClient } from "graphql-ws";
import { trace } from "@opentelemetry/api";

const HONEYCOMB_API_KEY = process.env.HONEYCOMB_API_KEY;

// Initialize the Honeycomb Web SDK
const sdk = new HoneycombWebSDK({
  instrumentations: [getWebAutoInstrumentations()],
  serviceName: "graphql-frontend", // Customize with your service name
  apiKey: HONEYCOMB_API_KEY, // Replace with your actual Honeycomb API key
});

// Register the SDK
sdk.start();

const tracer = trace.getTracer("click-tracer");
tracer.startActiveSpan("click-span", (span) => {
  const traceparent = `00-${span.spanContext().traceId}-${
    span.spanContext().spanId
  }-01`;
  const url = "ws://localhost:4000/graphql?traceparent=" + traceparent;
  console.log("Traceparent:", traceparent);
  // Create the WebSocket client
  const client = createClient({
    url: url,
  });

  // Set up WebSocket client with a button event
  const button = document.getElementById("queryButton") as HTMLButtonElement;
  button.addEventListener("click", async () => {
    console.log("Button clicked. Executing query...");

    // Execute a GraphQL query
    const query = client.iterate({
      query: "query { hello }",
    });

    const { value } = await query.next();
    if (value && value.data) {
      console.log("Query Result:", value.data.hello); // Should log 'Hello, world!'
    } else {
      console.error("Query Failed:", value);
    }

    // Execute a GraphQL subscription
    console.log("Starting subscription...");
    const subscription = client.iterate({
      query: "subscription { greetings }",
    });

    for await (const event of subscription) {
      if (event && event.data) {
        console.log("Subscription Event:", event.data.greetings); // Logs greetings
        break; // Stop after receiving the first event
      }
    }
    span.end();
  });
});
