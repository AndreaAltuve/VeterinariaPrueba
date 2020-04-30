require("./config/config");
const express = require("express");
const socketIO = require("socket.io");
const http = require("http");
const path = require("path");
const mongoose = require("mongoose");

const app = express();
let server = http.createServer(app);

const publicPath = path.resolve(__dirname, "../public");
const port = process.env.PORT || 3000;

app.use(express.static(publicPath));

// IO: esta es la comunicacion del backend
module.exports.io = socketIO(server);
require("./sockets/socket");

//Configuración global de rutas
let indexRoutes = "./routes/index";

app.use(require(indexRoutes));

mongoose.connect(
	process.env.URLDB,
	{ useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true },
	(err, resp) => {
		if (err) throw err;
		console.log("Base de datos online");
	},
);

server.listen(port, (err) => {
	if (err) throw new Error(err);

	console.log(`Servidor corriendo en puerto ${port}`);
});
