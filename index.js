const express = require("express");
const app = express();
const port = 8080;

app.use(express.json());

app.post("/pr", (req, res) => {
  console.log(req.body);
  res.send("Hello World!");
});

app.use((req, res, next) => {
  res.status(404).json({ error: "path not found" });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
