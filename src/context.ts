import Redis from "ioredis";
import { Request, Response } from "express";
import { RedisPubSub } from "graphql-redis-subscriptions";
import { MyDatabase } from "./fakedb";

export const pubSub = new RedisPubSub({
  publisher: new Redis(),
  subscriber: new Redis(),
});

const db = new MyDatabase()

export type MyContext = {
  db: MyDatabase;
  req: Request
  res: Response;
};

export function createContext(req: any, res: any) {
  return {
    ...req,
    ...res,
    db,
  };
}
