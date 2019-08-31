const express = require("express");
const app = express();
const route = require("./Router/routeruser");
const cors = require("cors");
const routeadmin = require("./Router/routeradmin");
const RouteP = require("./Router/routerproduct");
const routecart = require("./Router/routercart");

app.use(express.json());
app.use(cors());

app.use(route);
app.use(routeadmin);
app.use(RouteP);
app.use(routecart);

app.get("/", (req, res) => {
  res.send("terhubung");
});
const PORT = 2004;
app.listen(PORT, () => {
  console.log("Connect to " + PORT);
});
