const bcrypt = require("bcryptjs");

module.exports = {
	hashPassword: async password => {
		try {
			const saltRounds = 10;

			const hashedPassword = await new Promise((resolve, reject) => {
				bcrypt.hash(password, saltRounds, function (err, hash) {
					if (err) reject(err);
					resolve(hash);
				});
			});
			return hashedPassword;
		} catch (error) {
			console.log(error);
			return 0;
		}
	},
	compare: async (original, password) => {
		return new Promise(function (resolve, reject) {
			bcrypt.compare(password, original, function (err, isMatch) {
				if (err) {
					reject(err);
				} else {
					resolve(isMatch);
				}
			});
		});
	},
};
