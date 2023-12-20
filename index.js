const fs = require("fs");
const Fastify = require("fastify");
const Redis = require("ioredis").Redis;
const cards = require("./cards.json");

const app = Fastify();
const port = +process.argv[2] || 3000;

const client = new Redis();
app.decorate("redis", client);

app.listen({ port }, () => {
  console.log(`Example app listening at http://0.0.0.0:${port}`);
});

app.get(
  "/card_add",
  {
    schema: {
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
    },
  },
  async (req, res) => {
    const key = req.query.id;
    const currentIndex = await app.redis.incr(key);
    res.send(cards[currentIndex - 1] || { id: "ALL CARDS" });
  }
);

app.get("/ready", async (_, res) => {
  res.send({ ready: true });
});
