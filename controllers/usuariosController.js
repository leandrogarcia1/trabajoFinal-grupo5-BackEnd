const UsuarioModel = require("../models/usuario.models");
const Usuarios = require("../models/usuario.models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  try {
    const {
      nombre,
      apellido,
      role,
      mail,
      contraseña,
      telefono,
      url,
      usuarioAdm,
    } = req.body;
    const hash = await bcrypt.hash(contraseña, 10);

    const usuario = new Usuarios({
      nombre,
      apellido,
      role,
      mail,
      contraseña: hash,
      telefono,
      url,
      usuarioAdm,
    });
    await usuario.save();
    res.status(201).json("Usuario creado");
  } catch (error) {
    res.status(400).json("usuario no Creado");
  }
};

const loginUsuario = async (req, res) => {
  const user = await Usuarios.findOne({ mail: req.body.mail });

  if (!user) {
    return res.status(400).json("Usuario y/o contraseña incorrecto");
  }

  const match = await bcrypt.compare(req.body.contraseña, user.contraseña);

  if (!match) {
    return res.status(400).json("Usuario y/o contraseña incorrecto");
  }

  // generar el token

  const token = jwt.sign(
    {
      id: user._id,
      nombre: user.nombre,
      apellido: user.apellido,
      role: user.role,
      mail: user.mail,
      telefono: user.telefono,
      url: user.url,
      usuarioAdm: user.usuarioAdm,
    },
    process.env.SECRET_KEY,
    { expiresIn: "1d" }
  );

  res.header("auth-token", token).json({
    error: null,
    data: { token },
  });
};

const getAllUsers = async (req, res) => {
  try {
    const usuarios = await Usuarios.find();
    res.json(usuarios);
  } catch (error) {
    res.status(400).json("Usuarios no encontrados");
  }
};

//Borrar una usuario

const deleteUsuario = async (req, res) => {
  try {
    const id = req.params.id;
    const usuario = await UsuarioModel.findById(id);
    if (usuario) {
      await UsuarioModel.deleteOne({ _id: id });
      res.status(200).json("usuario eliminado");
    } else {
      res.status(404).json("usuario no encontrado");
    }
  } catch (error) {
    res.status(400).json("usuario no eliminado");
  }
};

//Actualizar una usuario

const updateUsuario = async (req, res) => {
  try {
    const id = req.params.id;
    console.log(req.body);

    const UsuarioActualizado = await UsuarioModel.findByIdAndUpdate(
      { _id: id },
      req.body,

      { new: true }
    );

    res.status(200).json(UsuarioActualizado);
  } catch (error) {
    res.status(400).json("Usuario no actualizada");
  }
};

module.exports = {
  register,
  loginUsuario,
  getAllUsers,
  deleteUsuario,
  updateUsuario,
};
