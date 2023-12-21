const http = require("http");
const Redis = require("ioredis").Redis;
const url = require("url");
const cards = require("./cards.json");

const port = +process.argv[2] || 3000;
const ALL_CARDS = JSON.stringify({ id: "ALL CARDS" });
const READY = JSON.stringify({ ready: true });
const client = new Redis({ enableAutoPipelining: true });

const cards_stringified = cards.map((val) => JSON.stringify(val));

const app = http.createServer();

app.on("request", async (req, res) => {
  const parsedUrl = url.parse(req.url, true);

  switch (parsedUrl.pathname) {
    case "/card_add":
      const currentIndex = await client.incr(parsedUrl.query.id);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(cards_stringified[currentIndex - 1] || ALL_CARDS);
      break;
    case "/ready":
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(READY);
      break;
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Example app listening at http://0.0.0.0:${port}`);
});
