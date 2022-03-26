const { logger } = require("@tgargula/logger");
const express = require("express");

const port = process.env.PORT || 8080;

const createServer = () => {
  const app = express();

  app.use(express.json());

  app.get("/api/healthcheck", (req, res) => {
    logger.info("Healthcheck completed");
    res.status(200).send("OK");
  });

  app.post("/api/pr", (req, res) => {
    res.status(501).send("Not implemented");
  });

  app.use("*", (req, res, next) => {
    res.status(404).json({ error: "Path not found" });
  });

  app.listen(port, () => {
    logger.info(`App listening on port ${port}`);
  });

  return app;
};

module.exports = createServer;
