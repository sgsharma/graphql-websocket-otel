# WebSocket GraphQL with OpenTelemetry

This project demonstrates how to use WebSockets with GraphQL to propagate tracing headers from the Honeycomb web SDK to your backend using OpenTelemetry. The setup involves a client that sends a `traceparent` context as a query parameter and a server that extracts and continues the trace.

## Table of Contents

- [Features](#features)
- [Setup and Installation](#setup-and-installation)
- [Running the Project](#running-the-project)
- [Project Structure](#project-structure)
- [Usage](#usage)
- [OpenTelemetry Integration](#opentelemetry-integration)

## Features

- **GraphQL WebSocket Server**: A server implemented using `graphql-ws` that supports queries and subscriptions over WebSockets.
- **OpenTelemetry Tracing**: Integrates OpenTelemetry to propagate trace context from the client to the server.

## Setup and Installation

### Prerequisites

Ensure you have Node.js and npm installed on your system.

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/your-username/your-repo-name.git
   cd graphql-otel-ws
   ```

2. Get a Honeycomb API key and set your environment variables:

   ```bash
   export HONEYCOMB_API_KEY="your-api-key"
   export OTEL_SERVICE_NAME="graphql-backend"
   export OTEL_EXPORTER_OTLP_PROTOCOL="http/protobuf"
   export OTEL_EXPORTER_OTLP_ENDPOINT="https://api.honeycomb.io:443" # US instance
   export OTEL_EXPORTER_OTLP_HEADERS="x-honeycomb-team=${HONEYCOMB_API_KEY}"
   ```

3. Docker Quickstart (Optional)

   If you have Docker installed, you can use the following command to now start the application:

   ```bash
   docker compose up --build -d
   ```

4. Navigate to http://localhost:8080 to access the application. Open the Developer Tools to inspect the WebSocket connection and the response from the GraphQL server.

5. Inspect your traces in Honeycomb by navigating to the [Honeycomb UI](https://ui.honeycomb.io/).
