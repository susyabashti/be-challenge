const Fastify = require("fastify");
const Redis = require("ioredis").Redis;
const cards = require("./cards.json");

const cards_stringified = cards.map((val) => JSON.stringify(val));

const app = Fastify();
const port = +process.argv[2] || 3000;

const ALL_CARDS = JSON.stringify({ id: "ALL CARDS" });
const client = new Redis({ enableAutoPipelining: true });

app.listen({ port }, () => {
  console.log(`Example app listening at http://0.0.0.0:${port}`);
});

app.get("/card_add", async (req, res) => {
  const currentIndex = await client.incr(req.query.id);
  res.send(cards_stringified[currentIndex - 1] || ALL_CARDS);
});

app.get("/ready", async (_, res) => {
  res.send({ ready: true });
});
