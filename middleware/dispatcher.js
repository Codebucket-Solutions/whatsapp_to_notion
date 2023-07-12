const { statusCodes, authHelper, ErrorHandler} = require("../helper");
const { UNAUTHORIZED } = require("../helper/status-codes");
const { constant, camelize } = require("../utils");
const { FAILURE } = require("../utils/constant");
const validator = require("./validator");
const { OK, BAD_GATEWAY } = statusCodes;
const { SUCCESS } = constant;
const { checkAuth, checkUserType } = authHelper;
/**
 *
 * The dispacter function middleware is the single source for sending 
 * the response. This middleware
 * checks if the user is authenticated and if the allowed user 
 * has access to the controller.
 *
 * @param {*} req -> Express request object
 * @param {*} res -> Express response object
 * @param {*} next -> Express middleware next function
 * @param {*} func -> Router controller function
 * @param {*} resource -> Resource to Check Permission On
 * @param {*} perm -> Permission to Check
 * @returns -> The final response with the data
 */

const dispatcher = async (req, res, next, func, resource, perm,stopPaths=[]) => {
		try {
			await validator(req, res, async()=>{
			const { user } = req;
			if(req.body) {
				req.body.headers = req.headers;
			}
			const data = await func(req, res, next);
			if (data != null) {
				return res.status(OK).json({ status: SUCCESS,
					data: camelize(data,stopPaths) })};
			});
		} catch (err) {
			next(err);
		}
};



module.exports = dispatcher;
