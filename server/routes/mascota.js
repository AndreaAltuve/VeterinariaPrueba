const express = require("express");

const _ = require("underscore");

const app = express();
const Mascota = require("../models/mascota");

//=========================
//Muestra los mascotas
//=========================

app.get("/mascota", (req, res) => {
	let desde = req.query.desde || 0;
	desde = Number(desde);

	let limite = req.query.limite || 5;
	limite = Number(limite);

	//entre '' estan solo los campos que quiero mandar
	Mascota.find({ estado: true })
		.sort("nombre")
		.skip(desde)
		.limit(limite)
		.populate("cliente", "nombre apellidos email telefono")
		.exec((err, mascotas) => {
			if (err) {
				return res.status(400).json({
					ok: false,
					err,
				});
			}
			Mascota.countDocuments({ estado: true }, (err, conteo) => {
				res.json({
					ok: true,
					mascotas,
					cuantos: conteo,
				});
			});
		});
});

//=========================
//Busca una mascota por ID
//=========================

app.get("/mascota/:id", (req, res) => {
	let id = req.params.id;

	Mascota.findById(id)
		.populate("cliente", "nombre apellidos email telefono")
		.exec((err, mascotaBD) => {
			if (err) {
				return res.status(400).json({
					ok: false,
					err,
				});
			}
			if (!mascotaBD) {
				return res.status(400).json({
					ok: false,
					err: {
						message: "Mascota no encontrada",
					},
				});
			}
			res.json({
				ok: true,
				mascota: mascotaBD,
			});
		});
});

//=========================
//Muestra los mascotas de un mismo dueño
//=========================

app.get("/mascota/dueno/:id", (req, res) => {
	let desde = req.query.desde || 0;
	desde = Number(desde);

	let limite = req.query.limite || 5;
	limite = Number(limite);

	let cliente = req.params.id;

	//entre '' estan solo los campos que quiero mandar
	Mascota.find({ estado: true, cliente: cliente })
		.skip(desde)
		.limit(limite)
		.populate("cliente", "nombre apellidos email telefono")
		.exec((err, mascotas) => {
			if (err) {
				return res.status(400).json({
					ok: false,
					err,
				});
			}
			Mascota.countDocuments(
				{ estado: true, cliente: cliente },
				(err, conteo) => {
					res.json({
						ok: true,
						mascotas,
						cuantos: conteo,
					});
				},
			);
		});
});

//=========================
//Crea una mascota
//=========================
app.post("/mascota", function (req, res) {
	let body = req.body;

	let mascota = new Mascota({
		nombre: body.nombre,
		especie: body.especie,
		raza: body.raza,
		cliente: body.cliente,
	});

	mascota.save((err, mascotaDB) => {
		if (err) {
			return res.status(400).json({
				ok: false,
				err,
			});
		}
		res.json({
			ok: true,
			mascota: mascotaDB,
		});
	});
});
//=========================
// Actualiza un mascota por id
//=========================
app.put("/mascota/:id", function (req, res) {
	let id = req.params.id;

	let body = _.pick(req.body, ["nombre", "raza", "especie"]);

	console.log(body);
	Mascota.findByIdAndUpdate(
		id,
		body,
		{ new: true, runValidators: true },
		(err, mascotaDB) => {
			if (err) {
				return res.status(400).json({
					ok: false,
					err,
				});
			}

			res.json({
				ok: true,
				mascota: mascotaDB,
			});
		},
	);
});

//=========================
// Elimina un mascota
//=========================
app.delete("/mascota/:id", function (req, res) {
	let id = req.params.id;

	let cambiaEstado = {
		estado: false,
	};

	Mascota.findByIdAndUpdate(
		id,
		cambiaEstado,
		{ new: true },
		(err, mascotaBorrado) => {
			if (err) {
				return res.status(400).json({
					ok: false,
					err,
				});
			}
			if (!mascotaBorrado) {
				return res.status(400).json({
					ok: false,
					err: {
						message: "Mascota no encontrado",
					},
				});
			}
			res.json({
				ok: true,
				mascota: mascotaBorrado,
			});
		},
	);
});

//=========================
//Obtener  mascota por id
//=========================
app.get("/mascota/:id", (req, res) => {
	let id = req.params.id;
	Mascota.findById(id, (err, mascotaBD) => {
		if (err) {
			return res.status(400).json({
				ok: false,
				err: {
					message: "Error al buscar el mascota",
				},
			});
		}
		if (!mascotaBD) {
			return res.status(400).json({
				ok: false,
				err: {
					message: "mascota no encontrada",
				},
			});
		}
		res.json({
			ok: true,
			mascota: mascotaBD,
		});
	});
	// .populate('suario', 'nombre email')
	// .populate('categoria', 'descripcion');
	//Populate:Usuario y categoria
});

module.exports = app;