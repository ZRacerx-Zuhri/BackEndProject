const RouteP = require("express").Router();
const SQL = require("../connection/mysql");

const multer = require("multer");

const path = require("path");

module.exports = RouteP;

//set multer
const store = path.join(__dirname, "/..");
const dir = path.join(store, `/productimg`);

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
  limits: { fileSize: 10000000000 },
  fileFilter(req, file, cb) {
    if (file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(null, true);
    }
    e;
    cb(new Error("Please upload image file (jpg, jpeg, or png)"));
  },
  storage: Storage
});

//Access image

RouteP.get("/productimg/:imgname", (req, res) => {
  const option = {
    root: dir
  };

  const fileName = req.params.imgname;

  res.sendFile(fileName, option, function(err) {
    if (err) return res.send(err);
  });
});

//Input Product

RouteP.post("/input/product", upload.array("picture", 4), (req, res) => {
  const { productname, deskripsi, price, lokasi, category } = req.body;

  const dsql = `insert into product set ?`;
  const dsql2 = `select id  from product where  productname = ?`;
  const dsql3 = `insert into kategori set ?`;

  if (req.files.length === 0) return res.send("Please Upload picture");
  if (req.files.length < 4) return res.send("Please Upload min 4 picture");
  SQL.query(
    dsql,
    {
      productname: productname,
      deskripsi: deskripsi,
      price: price,
      lokasi: lokasi,
      picture: req.files[0].filename,
      picture2: req.files[1].filename,
      picture3: req.files[2].filename,
      picture4: req.files[3].filename
    },
    (err, result) => {
      if (err) return res.send(err);

      SQL.query(dsql2, [productname], (err, result1) => {
        if (err) return res.send(err);

        SQL.query(
          dsql3,
          { category: category, productid: result1[0].id },
          (err, result3) => {
            if (err) return res.send(err);
            res.send(result3);
          }
        );
      });
    }
  );
});

//Get data product

RouteP.get("/product", (req, res) => {
  dsql = `select
          p.id,p.productname,p.deskripsi,p.price,p.lokasi,
          p.picture,p.picture2,p.picture3,p.picture4,k.category from
          product p join kategori k on p.id = k.productID
      `;

  SQL.query(dsql, (err, result) => {
    if (err) return res.send(err);
    res.send(result);
  });
});

//Delete product
RouteP.delete("/deleteproduct/:id", (req, res) => {
  const ID = req.params.id;
  dsql = `delete from product where id = ?`;

  SQL.query(dsql, ID, (err, result) => {
    if (err) return res.send(err);
    res.send("Berhasil dihapus");
  });
});

//Edit Product
RouteP.patch("/editproduct/:id", (req, res) => {
  const ID = req.params.id;
  const { productname, deskripsi, price, lokasi } = req.body;

  const dsql = `update product set productname=?,deskripsi=?,price=?,lokasi=? where id=?`;
  SQL.query(
    dsql,
    [productname, deskripsi, price, lokasi, ID],
    (err, result) => {
      if (err) return res.send(err);
      res.send(result);
    }
  );
});

//Add Jadwal
RouteP.post("/addjadwal", (req, res) => {
  const { tanggal, jam, productname } = req.body;

  const dsql = `insert into  jadwal  (tanggal,jam,productID) select ?,?,id
  from product where productname= ?`;

  SQL.query(dsql, [tanggal, jam, productname], (err, result) => {
    if (err) return res.send(err);
    res.send(result);
  });
});

//get jadwal product

RouteP.get("/jadwal", (req, res) => {
  const dsql = `select date_format(j.tanggal,'%d/%m/%Y')as date , time_format(j.jam,'%H %i') as time  ,p.productname , p.lokasi , j.tanggal,j.jam
from product p join jadwal j on p.id =j.productID
where j.booking = false `;

  SQL.query(dsql, (err, result) => {
    if (err) return res.send(err);
    res.send(result);
  });
});

//data product only with name
RouteP.get("/lapangan/:name", (req, res) => {
  const Name = req.params.name;
  const dsql = `select * from product where productname = ?`;
  SQL.query(dsql, [Name], (err, result) => {
    if (err) return res.send(err);
    res.send(result);
  });
});

//get data product by Id
RouteP.get("/product/:id", (req, res) => {
  const ID = req.params.id;
  const dsql = `select * from product where id = ?`;
  SQL.query(dsql, [ID], (err, result) => {
    if (err) return res.send(err);
    res.send(result[0]);
  });
});

//product jadwal by id

RouteP.get("/productjadwal/:id", (req, res) => {
  const ID = req.params.id;
  const dsql = `select DATE_FORMAT(j.tanggal,'%Y-%m-%d') as date,time_format(j.jam,'%H:%i') as time ,
p.productname,p.price,p.lokasi,p.picture,j.id from
product p join jadwal j on p.id = j.productID
where j.booking = false and p.id=?`;

  SQL.query(dsql, [ID], (err, result) => {
    if (err) return res.send(err);
    res.send(result);
  });
});

//category
RouteP.get("/product-category/:name", (req, res) => {
  const sql = `select * from product p join kategori k on p.id = k.productID where k.category = "${req.params.name}"`;
  SQL.query(sql, (err, result) => {
    if (err) return res.send(err);
    res.send(result);
  });
});
