const routeadmin = require("express").Router();
const SQL = require("../connection/mysql");
// const bcrypt = require("bcrypt");

routeadmin.post("/loginadmin", (req, res) => {
  const { useradmin, password } = req.body;

  const dsql = `select * from mimin where useradmin = ?`;

  SQL.query(dsql, [useradmin], (err, result) => {
    if (err) return res.send(err);
    if (result.length < 1) return res.send("Useradmin atau password salah");
    if (!(password == result[0].password))
      return res.send("useradmin atau password salah");

    res.send(result[0]);
  });
});

module.exports = routeadmin;
