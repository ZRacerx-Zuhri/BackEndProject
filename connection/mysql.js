const mysql = require("mysql");

const connectsql = mysql.createConnection({
  user: "projectakhir",
  password: "planetbekasi",
  host: "localhost",
  database: "playteam",
  port: 3306
});

// connectsql.connect((err, res) => {
//   res.send("Connected!");
// });

module.exports = connectsql;
