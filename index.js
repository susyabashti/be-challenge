const fs = require("fs");
const Fastify = require("fastify");
const Redis = require("ioredis").Redis;
const app = Fastify();
const port = +process.argv[2] || 3000;

const client = new Redis();
client.on("error", (err) => console.log("Redis Client Error", err));

client.on("ready", async () => {
  await app.listen({ port });
  console.log(`Example app listening at http://0.0.0.0:${port}`);
});

const cardsData = fs.readFileSync("./cards.json");
const cards = JSON.parse(cardsData);

async function getMissingCard(key) {
  const userCards = await client.zrange(key, 0, -1);
  let cardsSet = new Set(cards.map((card) => card.id));
  const availableCards = userCards.filter((card) => !cardsSet.has(JSON.parse(card).id));

  return availableCards.pop();
}

app.get("/card_add", async (req, res) => {
  const key = "user_id:" + req.query.id;
  let missingCard = "";
  while (true) {
    missingCard = await getMissingCard(key);
    if (missingCard === undefined) {
      res.send({ id: "ALL CARDS" });
      return;
    }
    result = await client.zadd(key, "NX", 0, missingCard);
    if (result === 0) {
      continue;
    }
    break;
  }
  res.send(missingCard);
});

app.get("/ready", async (req, res) => {
  res.send({ ready: true });
});
