const Route = require("express").Router();
const SQL = require("../connection/mysql");
const bcrypt = require("bcrypt");
const multer = require("multer");
const isemail = require("validator/lib/isEmail");
const path = require("path");

const cloud = path.join(__dirname, "/..");
const dir = path.join(cloud, `/myupload`);

var Storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, dir);
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + file.fieldname + path.extname(file.originalname));
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
Route.get("/users/avatar/:imageName", (req, res) => {
  const options = {
    root: dir
  };

  const fileName = req.params.imageName;

  res.sendFile(fileName, options, function(err) {
    if (err) return res.send(err);
  });
});

//Post Avatar
Route.post("/uploadavatar", upload.single("Avatar"), (req, res) => {
  const dsql = `update users set avatar = ? where username=?`;
  const dsql2 = `select * from users where ?`;
  const { username } = req.body;

  SQL.query(dsql, [req.file.filename, username], (err, result) => {
    if (err) return res.send(err);
    SQL.query(dsql2, { username: username }, (err, result2) => {
      if (err) return res.send(err);
      res.send(result2);
    });
  });
});

//Post Users
Route.post("/inputuser", (req, res) => {
  let {
    email,
    password,
    userName,
    fullname,
    gender,
    tanggallahir,
    alamat,
    nomobile
  } = req.body;
  const dsql = `insert into users set ?`;
  const dsql2 = `select * from users`;

  if (!isemail(email)) {
    return res.send("Email is Not Valid!");
  }
  const hash = bcrypt.hashSync(password, 5);

  SQL.query(
    dsql,
    {
      username: userName,
      fullname: fullname,
      email: email,
      password: hash,
      gender: gender,
      tanggallahir: tanggallahir,
      alamat: alamat,
      mobilenumber: nomobile
    },
    (err, result) => {
      if (err) {
        return res.send(err);
      }

      SQL.query(dsql2, (err, result2) => {
        if (err) {
          return res.send(err);
        }

        res.send(result2);
      });
    }
  );
});

//Read All user

Route.get("/getusers", (req, res) => {
  dsql = `select * from users`;

  SQL.query(dsql, (err, result) => {
    if (err) return res.send(err);
    res.send(result);
  });
});

//Read One User

Route.get("/users/:name", (req, res) => {
  const dsql = `select * from users where username = ?`;
  const Username = req.params.name;
  SQL.query(dsql, [Username], (err, result) => {
    if (err) return res.send(err);
    if (result.length < 1) return res.send("user tidak ada");
    res.send({ pesan: "data ada", data: result[0] });
  });
});

//Login User

Route.post("/user/login", (req, res) => {
  const { Username, Password } = req.body;

  const dsql = `select * from users where username = ?`;
  SQL.query(dsql, [Username], (err, result) => {
    if (err) return res.send(err);
    if (result.length < 1)
      return res.send("USERNAME atau Password tidak ditemukan");
    if (!bcrypt.compareSync(Password, result[0].password))
      return res.send("USERNAME atau Password tidak ditemukan");
    res.send(result[0]);
  });
});

module.exports = Route;
