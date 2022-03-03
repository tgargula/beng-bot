const express = require("express");

const port = process.env.PORT || 8080;

const createServer = () => {
  const app = express();

  app.use(express.json());

  app.post("/api/pr", (req, res) => {
    console.log(req.body);
    res.send("Hello World!");
  });

  app.use((req, res, next) => {
    res.status(404).json({ error: "Path not found" });
  });

  app.listen(port, () => {
    console.log(`App listening on port ${port}`);
  });

  return app;
}

module.exports = createServer;
