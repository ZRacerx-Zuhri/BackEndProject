const routecart = require("express").Router();
const SQL = require("../connection/mysql");
const multer = require("multer");

const path = require("path");

module.exports = routecart;

//Post To Cart

routecart.post("/addtocart", (req, res) => {
  const { userID, productID, tanggal, jam } = req.body;

  dsql = `insert into cart (userID,productID,jadwalID)
          select ?,p.id,j.id  from
          product p join jadwal j on p.id = j.productID
          where  p.id =? and
          j.tanggal=? and j.jam=?`;
  dsql2 = `select * from cart`;

  SQL.query(dsql, [userID, productID, tanggal, jam], (err, result) => {
    if (err) return res.send("gagal");
    SQL.query(dsql2, (err, result2) => {
      if (err) return res.send("gagal");
      res.send(result2[0]);
    });
  });
});

//Get cart for filter

routecart.post("/cart/:id", (req, res) => {
  const { tanggal, jam } = req.body;
  const productID = req.params.id;

  const dsql = `select c.id,p.id,u.id as userid,p.productname,p.price,u.username,
                date_format(j.tanggal, "%Y-%m-%d") as date,
                time_format(j.jam, "%H:%i") as time from
                cart c  join  users u on u.id = c.userID join
                product p on p.id =c.productID  join jadwal j on j.id = c.jadwalID
                where j.tanggal = ? and j.jam=? and p.id=?`;

  SQL.query(dsql, [tanggal, jam, productID], (err, result) => {
    if (err) return res.send(err);
    res.send(result);
  });
});

//get cart user
routecart.get("/mycart/:userid", (req, res) => {
  const userID = req.params.userid;
  const dsql = `select c.id,p.productname,p.price,p.lokasi,u.fullname,u.mobilenumber,c.orderID,
                date_format(j.tanggal, "%Y-%m-%d") as date
                ,time_format(j.jam, "%H:%i") as time from
                cart c  join  users u on u.id = c.userID join
                product p on p.id =c.productID  join jadwal j on j.id = c.jadwalID
                where  u.id=? and c.orderID is null `;
  SQL.query(dsql, [userID], (err, result) => {
    if (err) return res.send(err);
    res.send(result);
  });
});

//cancel Cart

routecart.delete("/cancel/:id", (req, res) => {
  const ID = req.params.id;
  const dsql = `delete from cart where id=? `;

  SQL.query(dsql, [ID], (err, result) => {
    if (err) return res.send(err);
    res.send(result);
  });
});
