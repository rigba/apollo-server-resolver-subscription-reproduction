import { Paragraph, Resolvers, Text } from "resolvers-types";
import { MyContext, pubSub } from "../context";

const Resolver: Resolvers = {
  Query: {
    async fetchParagraph(_, __, context: MyContext): Promise<Paragraph> {
      const text = context.db.getInfo;
      const payload = { title: "Poem", text: { text } };
      pubSub.publish("PARAGRAPH", {
        ParagraphSubscription: payload,
      });
      return payload;
    },
  },
  Paragraph: {
    async text(__, _, context: MyContext): Promise<Text> {
      return { text: context.db.getInfo };
    },
  },
  Subscription: {
    ParagraphSubscription: {
      subscribe: () => ({
        [Symbol.asyncIterator]() {
          return pubSub.asyncIterator(["PARAGRAPH"]);
        },
      }),
    },
  },
};

export default Resolver;
