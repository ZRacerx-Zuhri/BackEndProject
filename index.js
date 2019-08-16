const express = require("express");
const app = express();
const route = require("./Router/routeruser");
const cors = require("cors");
app.use(express.json());
app.use(cors());

app.use(route);

app.get("/", (req, res) => {
  res.send("terhubung");
});
const PORT = 2004;
app.listen(PORT, () => {
  console.log("Connect to " + PORT);
});
