import express from "express";
import cors from "cors";
import { ApolloServer } from "apollo-server-express";
import { createServer } from "http";
import {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageLocalDefault,
} from "apollo-server-core";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";
import { createContext } from "./context";
import { readFileSync } from "node:fs";
import Resolver from "./resolvers/resolver";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { MyDatabase } from "./fakedb";

const app = express();
const httpServer = createServer(app);

const conn = async () => {
  const corsOptions: cors.CorsOptions = {
    origin: "http://localhost:3000",
    credentials: true
  }

  app.use(
    cors(corsOptions)  
  );

  const typeDefs = readFileSync("./schema.graphql", "utf8");

  const schema = makeExecutableSchema({
    typeDefs,
    resolvers: [Resolver],
  });
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/graphql",
  });

  const serverCleanup = useServer(
    {
      schema,
      context: (ctx, args, msgs) => {
        return {
          ctx,
          args,
          msgs,
          db: new MyDatabase(), 
        };
      },
    },
    wsServer
  );

  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginLandingPageLocalDefault({ embed: true, }),
      // Proper shutdown for the HTTP server.
      ApolloServerPluginDrainHttpServer({ httpServer }),
      // Proper shutdown for the WebSocket server.
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
    context: createContext,
  });

  await server.start();
  
  server.applyMiddleware({
    app,
    cors: corsOptions,
  });


  httpServer.listen(4000, () => {
    console.log(`server started...`);
  });
};
conn();
