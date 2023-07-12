const { Auth } = require("../../../service/v1");
const { constant } = require("../../../utils");

const { SUCCESS } = constant;

const webhook = async (req, res, next) => {
	try {
		return await new Auth().webhook(req.body);
	} catch (error) {
		next(error);
	}
};

const webhookVerify = async (req, res, next) => {
	try {
		console.log(req.query)
		return await new Auth().webhookVerify(req.query); 
	} catch (error) {
		next(error);
	}
};

module.exports = {
	webhook,
	webhookVerify
};
