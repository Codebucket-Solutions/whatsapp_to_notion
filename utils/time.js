const moment = require("moment");

function toSeconds(s) {
	const b = s.split(":");
	return b[0] * 3600 + b[1] * 60 + (+b[2] || 0);
}

function secondsToHMS(secs) {
	function z(n) {
		return (n < 10 ? "0" : "") + n;
	}
	const sign = secs < 0 ? "-" : "";
	secs = Math.abs(secs);
	return sign + z((secs / 3600) | 0) + ":" + z(((secs % 3600) / 60) | 0);
}

module.exports = {
	timeDifference: (time1, time2) => {
		return secondsToHMS(toSeconds(time2) - toSeconds(time1));
	},
	timeSum: (time1, time2) => {
		return secondsToHMS(toSeconds(time2) + toSeconds(time1));
	},
	toSeconds: time => {
		return toSeconds(time);
	},
	toDaysHourMin: p => {
		let d = Math.floor(p / (3600 * 24));

		p -= d * 3600 * 24;

		let h = Math.floor(p / 3600);

		p -= h * 3600;

		let m = Math.floor(p / 60);

		p -= m * 60;

		let tmp = [];

		d && tmp.push(d + "d");

		(d || h) && tmp.push(h + "h");

		(d || h || m) && tmp.push(m + "m");

		var datetime = tmp.join(" ");
		return datetime;
	},
	dateSort: date => {
		// Format YYYY-MM-DD

		date.sort(function (a, b) {
			let aa = a.split("-").join(),
				bb = b.split("-").join();
			return aa < bb ? -1 : aa > bb ? 1 : 0;
		});

		return {
			sortedDate: date,
		};
	},
	getDate: format => {
		const date = new Date();
		return moment.utc(date).utcOffset("+05:30").format(format);
	},
	updateFormat: (date, format) => {
		return moment.utc(date).format(format);
	},
	addDate: (date, dateFormat, format, time, type) => {
		return moment(date, dateFormat).add(time, type).format(format);
	},
	subDate: (date, dateFormat, format, time, type) => {
		return moment(date, dateFormat).subtract(time, type).format(format);
	},
	dayNo: date => {
		return parseInt(moment.utc(date).utcOffset("+05:30").format("e"), 10);
	},
	dateDiff: (newDate, pastDate) => {
		let date1 = moment(newDate);
		let date2 = moment(pastDate);
		return date2.diff(date1, "seconds");
	},
	ISO: (date, format) => {
		return moment(date, format).format();
	},
	getDates: (startDate, endDate, steps = 3) => {
		const dateArray = [];
		let currentDate = new Date(startDate);

		while (currentDate <= new Date(endDate)) {
			dateArray.push(moment(new Date(currentDate)).format("YYYY-MM-DD"));
			// Use UTC date to prevent problems with time zones and DST
			currentDate.setUTCDate(currentDate.getUTCDate() + steps);
		}

		return dateArray;
	},
};
