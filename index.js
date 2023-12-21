const Fastify = require("fastify");
const Redis = require("ioredis").Redis;
const cards = require("./cards.json");

const app = Fastify();
const port = +process.argv[2] || 3000;

const ALL_CARDS = { id: "ALL CARDS" };
const client = new Redis();
const schema = {
  response: {
    200: {
      type: "object",
      properties: {
        id: {
          type: "string",
        },
        name: {
          type: "string",
        },
      },
      required: ["id"],
    },
  },
};

app.listen({ port }, () => {
  console.log(`Example app listening at http://0.0.0.0:${port}`);
});

app.get(
  "/card_add",
  {
    schema,
  },
  async (req, res) => {
    const currentIndex = await client.incr(req.query.id);
    res.send(cards[currentIndex - 1] || ALL_CARDS);
  }
);

app.get("/ready", async (_, res) => {
  res.send({ ready: true });
});
