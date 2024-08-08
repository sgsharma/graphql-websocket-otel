"use strict";
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function () { return this; }, i;
    function awaitReturn(f) { return function (v) { return Promise.resolve(v).then(f, reject); }; }
    function verb(n, f) { if (g[n]) { i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; if (f) i[n] = f(i[n]); } }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const graphql_1 = require("graphql");
const schema_1 = require("@graphql-tools/schema");
const ws_1 = require("ws");
const ws_2 = require("graphql-ws/lib/use/ws");
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
            subscribe: function () {
                return __asyncGenerator(this, arguments, function* () {
                    for (const greeting of ["Hi", "Hello", "Hey"]) {
                        yield yield __await({ greetings: greeting });
                        yield __await(new Promise((resolve) => setTimeout(resolve, 1000)));
                    }
                });
            },
        },
    },
};
const schema = (0, schema_1.makeExecutableSchema)({ typeDefs, resolvers });
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
// Create a WebSocket server
const wsServer = new ws_1.WebSocketServer({
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
    // handleProtocols: (protocols, req) => {
    //   console.log("Client requested protocols:", protocols);
    //   return Array.from(protocols).includes("graphql-transport-ws")
    //     ? "graphql-transport-ws"
    //     : Array.from(protocols).includes("graphql-ws")
    //     ? "graphql-ws"
    //     : Array.from(protocols).includes("subscriptions-transport-ws")
    //     ? "subscriptions-transport-ws"
    //     : "graphql-ws";
    // },
});
// Use graphql-ws to handle subscriptions
(0, ws_2.useServer)({ schema, execute: graphql_1.execute, subscribe: graphql_1.subscribe }, wsServer);
// Serve the GraphQL API
app.use(express_1.default.json());
app.use("/graphql", (req, res) => {
    res
        .status(200)
        .send("GraphQL API is running. Use a WebSocket client to connect.");
});
// Start the HTTP server
httpServer.listen(4000, () => {
    console.log("Server is running on http://localhost:4000/graphql");
});
