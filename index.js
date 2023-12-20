const fs = require("fs");
const Fastify = require("fastify");
const app = Fastify();
const port = +process.argv[2] || 3000;

const Redis = require("ioredis").Redis;
const client = new Redis({});
client.on("error", (err) => console.log("Redis Client Error", err));

app.listen({ port }, () => {
  console.log(`Example app listening at http://0.0.0.0:${port}`);
});

const cardsData = fs.readFileSync("./cards.json");
const cards = JSON.parse(cardsData);

async function getMissingCard(key) {
  const userCards = await client.zrange(key, 0, -1);
  const cardsGiven = new Set(userCards);
  const allCards = cards.filter((value) => !cardsGiven.has(value.id));

  return allCards.pop();
}

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
    let missingCard = "";
    while (true) {
      // console.time("get-missing-card" + key);
      missingCard = await getMissingCard(key);
      // console.timeEnd("get-missing-card" + key);
      if (missingCard === undefined) {
        res.send({ id: "ALL CARDS" });
        return;
      }
      const result = await client.zadd(key, "NX", [0, missingCard.id]);

      if (!result) continue;
      break;
    }
    res.send(missingCard);
  }
);

app.get("/ready", async (_, res) => {
  res.send({ ready: true });
});
