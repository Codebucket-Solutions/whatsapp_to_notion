const { constant } = require("../utils");
const { statusCodes } = require("../helper");

const { FAILURE } = constant;
const { BAD_GATEWAY } = statusCodes;

/**
 *
 * This middleware checks the centralised error handling. All the error thrown by the controllers is handled
 * by this middleware.
 *
 *
 * @param {*} err -> Custom Error Handler
 * @param {*} res -> Express response object
 */

const handleError = (err, res) => {
	const { statusCode = BAD_GATEWAY, message } = err;
	res.status(statusCode).json({
		status: FAILURE,
		statusCode,
		message,
	});
};

module.exports = handleError;
