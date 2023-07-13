const { Auth } = require("../../../service/v1");
const { constant } = require("../../../utils");

const { SUCCESS } = constant;

const webhook = async (req, res, next) => {
	try {
		return await new Auth().webhook(req.body);
	} catch (error) {
		console.log(error)
		next(error);
	}
};

const webhookVerify = async (req, res, next) => {
	try {
		return await new Auth().webhookVerify(req.query); 
	} catch (error) {
		console.log(error)
		next(error);
	}
};

module.exports = {
	webhook,
	webhookVerify
};
