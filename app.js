const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");

const { v1} = require("./routes");
const { validateToken, handleError } = require("./middleware");

const {morganLogger } = require("./middleware/logger");
const app = express();


app.use(morganLogger)
	.use(cors())
	.use(helmet())
	.use(bodyParser.urlencoded({ limit: "100mb", extended: true, parameterLimit: 50000 }))
	.use(bodyParser.json({ limit: "100mb" }))
	.use(express.static(path.join(__dirname, "public")))
	.set("views", path.join(__dirname, "views"));

app.use(validateToken);
app.use("/v1", v1);

app.use((err, req, res, next) => {
	handleError(err, res);
});
	

module.exports = app;
