const routecart = require("express").Router();
const SQL = require("../connection/mysql");
const multer = require("multer");

const path = require("path");

module.exports = routecart;

//Post To Cart

routecart.post("/addtocart", (req, res) => {
  const { userID, productID, tanggal, jam } = req.body;

  dsql = `insert into cart (userID,productID)
          select ?,p.id  from
          product p join jadwal j on p.id = j.productID
          where  p.id =? and
          j.tanggal=? and j.jam=?`;
  dsql2 = `select * from cart`;

  SQL.query(dsql, [userID, productID, tanggal, jam], (err, result) => {
    if (err) return res.send(err);
    SQL.query(dsql2, (err, result2) => {
      if (err) return res.send(err);
      res.send(result2[0]);
    });
  });
});
