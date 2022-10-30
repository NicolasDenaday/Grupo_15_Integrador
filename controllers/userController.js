const fs = require("fs");
const path = require("path");
const bcryptjs = require("bcryptjs");
const { validationResult } = require("express-validator");


function findAll() {
  const jsonData = fs.readFileSync(path.join(__dirname, "../data/users.json"));
  const data = JSON.parse(jsonData);
  return data;
}


function writeFile(data) {
  const dataString = JSON.stringify(data, null, 4);
  fs.writeFileSync(path.join(__dirname, "../data/users.json"), dataString);
}

module.exports = {
  register: (req, res) => {
    res.render("crearCuenta");
  },

  processRegister: (req, res) => {
    const error = validationResult(req);

    if (!error.isEmpty()) {
      return res.render("crearCuenta", {
        errors: error.mapped(),
        old: req.body,
      });
    } else {
      const users = findAll();

      const newUser = {
        id: users.length + 1,
        name: req.body.name,
        email: req.body.email,
        image: req.file.filename,
        password: bcryptjs.hashSync(req.body.password, 10),
      };

      users.push(newUser);

      writeFile(users);

      res.redirect("/");
    }
  },

  login: (req, res) => {
    res.render("login");
  },
  processLogin: (req, res) => {
    const error = validationResult(req);

    if (!error.isEmpty()) {
      return res.render("login", { errors: error.mapped() });
    };

    const users = findAll();
    
    const userFound = users.find(function(user){
        return user.email == req.body.email && bcryptjs.compareSync(req.body.password, user.password)
    });

    if (!userFound) {
      return res.render("login", { errorLogin: "Credenciales invalidas!" });
    } else {
        req.session.usuarioLogueado = {
            id: userFound.id,
            email: userFound.email,
        }

        if(req.body.rememberUser){
            res.cookie('recordame', userFound.id, {maxAge: 60 * 60 * 60})
        }

        res.redirect('/');
    }
  },
  logout: (req, res)=>{
    req.session.destroy();
    res.clearCookie("recordame");
    res.redirect("/");
  }
};