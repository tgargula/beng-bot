const { logger } = require("@tgargula/logger");
const express = require("express");
const closeTask = require("./actions/close_task");

const port = process.env.PORT || 8080;

const createServer = () => {
  const app = express();

  app.use(express.json());

  app.get("/api/healthcheck", (req, res) => {
    logger.info("Healthcheck completed");
    res.status(200).send("OK");
  });

  app.post("/api/issue", async (req, res, next) => {
    try {
      const payload = req.body;
      if (payload.action !== "closed") {
        res.status(202).send("Issue is not closed. Skipping");
        return;
      }

      await closeTask(payload);
      res.status(200).send("OK");
    } catch (err) {
      next(err);
    }
  });

  app.use("*", (req, res, next) => {
    res.status(404).json({ error: "Path not found" });
  });

  app.use((err, req, res, next) => {
    res.status(500).send(err);
  });

  app.listen(port, () => {
    logger.info(`App listening on port ${port}`);
  });

  return app;
};

module.exports = createServer;
