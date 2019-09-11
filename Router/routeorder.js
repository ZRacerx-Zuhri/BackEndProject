const routeorder = require("express").Router();
const SQL = require("../connection/mysql");
const multer = require("multer");
const path = require("path");
const cloud = path.join(__dirname, "/..");
const dir = path.join(cloud, `/buktitransfer`);

module.exports = routeorder;
//postorder
routeorder.post("/booking/:id", (req, res) => {
  const userID = req.params.id;
  const { payment, bankID } = req.body;

  const dsql = `insert into  orders (userID,payment,bankID) values (?, ? ,?)`;
  const dsql1 = `select * from orders where id=?`;

  SQL.query(dsql, [userID, payment, bankID], (err, result) => {
    if (err) return res.send(err);
    SQL.query(dsql1, result.insertId, (err, result2) => {
      if (err) return res.send(err);
      res.send(result2[0]);
    });
  });
});

//bank
routeorder.get("/bank", (err, res) => {
  const dsql = `select * from daftarbank`;

  SQL.query(dsql, (err, result) => {
    if (err) return res.send(err);
    res.send(result);
  });
});

//update order cart
routeorder.patch("/updatebook/:id", (req, res) => {
  const dsql = `update cart set  orderID = ? where userID=? and orderID is null`;
  const { orderID } = req.body;
  const userID = req.params.id;

  SQL.query(dsql, [orderID, userID], (err, result) => {
    if (err) return res.send(err);
    res.send(result);
  });
});

//update booking
routeorder.patch("/updatejam", (req, res) => {
  const dsql = `select * from cart where orderID is not null`;
  const dsql2 = `update jadwal set booking = true where id in ?`;

  SQL.query(dsql, (err, result) => {
    if (err) return res.send(err);
    var arr = [];
    for (let i = 0; i < result.length; i++) {
      arr.push(result[i].jadwalID);
    }
    SQL.query(dsql2, [[arr]], (err, result2) => {
      if (err) return res.send(err);
      res.send(result2);
    });
  });
});

//get cart not nul
routeorder.get("/paycart/:userid", (req, res) => {
  const userID = req.params.userid;
  const dsql = `select * from cart where orderID is not null`;
  const dsql2 = `select * from orders where id =?`;
  const dsql3 = `select * from bank where bank=?`;
  SQL.query(dsql, [userID], (err, result) => {
    if (err) return res.send(err);
    SQL.query(dsql2);
  });
});

//payment status null
routeorder.get("/paystatus/:id", (req, res) => {
  const userID = req.params.id;

  const dsql = ` select c.id,c.userID,c.orderID,o.paymentstatus from cart c join orders o on c.orderID = o.id
  where o.paymentstatus is null or o.paymentstatus = "Wait" and c.userID = ?`;
  SQL.query(dsql, [userID], (err, result) => {
    if (err) return res.send(err);
    res.send(result);
  });
});

//pay with upload bukti

var Storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, dir);
  },
  filename: function(req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  }
});

const upload = multer({
  limits: { fieldSize: 10000000000 },
  fileFilter(req, file, cb) {
    if (file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(null, true);
    }
    cb(new Error("Please upload image file (jpg, jpeg, or png)"));
  },
  storage: Storage
});

// ACCESS IMAGE
routeorder.get("/bukti/:imageName", (req, res) => {
  const options = {
    root: dir
  };

  const fileName = req.params.imageName;

  res.sendFile(fileName, options, function(err) {
    if (err) return res.send(err);
  });
});

//getidproduct
routeorder.get("/paydata/:id", (req, res) => {
  const userID = req.params.id;
  const dsql = `select c.id,c.userID,c.orderID,o.paymentstatus
                from cart c join orders o on c.orderID = o.id
                where o.paymentstatus is null
                and c.userID= ?`;
  SQL.query(dsql, [userID], (err, result) => {
    if (err) return res.send(err);
    res.send(result);
  });
});

//nullpay
routeorder.get("/nullpay", (req, res) => {
  const dsql = ` select d.namabank ,d.norek from daftarbank d join orders o on o.bankID =d.id where o.paymentstatus is null`;
  SQL.query(dsql, (err, result) => {
    if (err) return res.send(err);
    res.send(result[0]);
  });
});

//  ;
//payhargatotal
routeorder.get("/totalharga/:ID", (req, res) => {
  const userID = req.params.ID;
  const dsql1 = `select sum(p.price) as hasil from product p join cart c on c.productID=p.id where c.id in ? `;
  const dsql = `select c.id,c.userID,c.orderID,o.paymentstatus
                from cart c join orders o on c.orderID = o.id
                where o.paymentstatus is null or o.paymentstatus  = "Wait"
                and c.userID= ?`;
  SQL.query(dsql, [userID], (err, result) => {
    if (err) return res.send(err);
    var arr = [];
    for (let i = 0; i < result.length; i++) {
      arr.push(result[i].id);
    }
    SQL.query(dsql1, [[arr]], (err, result2) => {
      if (err) return res.send(err);
      res.send(result2[0]);
    });
  });
});

//upload foto
routeorder.patch("/buktipembayaran/:ID", upload.single("foto"), (req, res) => {
  const dsql = `update orders set buktipembayaran = ?,
  paymentstatus = "Wait" where userID = ? and paymentstatus is null`;
  const userID = req.params.ID;
  SQL.query(dsql, [req.file.filename, userID], (err, result) => {
    if (err) return res.send(err);
    res.send(result);
  });
});

//Accmanage product
routeorder.get("/paymentuser", (req, res) => {
  const dsql = `select o.id as order_id, u.id as user_id ,u.fullname,o.paymentstatus,o.buktipembayaran
                from  orders o join users u on o.userID = u.id where paymentstatus ="Wait" or paymentstatus ="Acc"`;
  SQL.query(dsql, (err, result) => {
    if (err) return res.send(result);
    res.send(result);
  });
});

//Accept
routeorder.get("/paymen/update/:id", (req, res) => {
  const ID = req.params.id;
  const dsql = `update orders set
  paymentstatus = "Acc" where id = ?`;

  SQL.query(dsql, [ID], (err, result) => {
    if (err) return res.send(err);
    res.send(result);
  });
});

routeorder.get("/decline/update/:id", (req, res) => {
  const ID = req.params.id;
  const dsql = `update orders set
  paymentstatus = "Cancel", buktipembayaran is null where id = ?`;

  SQL.query(dsql, [ID], (err, result) => {
    if (err) return res.send(err);
    res.send(result);
  });
});
