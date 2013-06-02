//
// date-parse is extension for Date parse method, which supports more formats than default implementation. In addition, this
// extension allows parsing relative dates (like "12 hours ago").
//
//
// Author: Michael Spector <michael@colabo.com>
// License: Apache 2.0 (http://opensource.org/licenses/Apache-2.0)
//

Date.parse = (function() {

	var MONTH_GROUP = "(jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|september|oct|october|nov|november|dec|december)";
	var DATE_PATTERNS = new Array({
		regex : new RegExp("^(\\d+) " + MONTH_GROUP + " (\\d+)$", "i"),
		idx : {
			day : 1,
			month : 2,
			year : 3
		}
	}, {
		regex : new RegExp("^(\\d+) " + MONTH_GROUP + "$", "i"),
		idx : {
			day : 1,
			month : 2
		}
	}, {
		regex : /^(sun|sunday|mon|monday|tue|tuesday|wed|wednesday|thu|thursday|fri|friday|sat|saturday)$/i,
		idx : {
			weekday : 1
		}
	});

	var makeFullYear = function(year) {
		if (typeof (year) == "string") {
			year = parseInt(year, 10);
		}
		if (year < 20) {
			return 2000 + year;
		}
		if (year < 100) {
			return 1900 + year;
		}
		return year;
	};

	var MONTH_IDX = {
		jan : 0,
		january : 0,
		feb : 1,
		february : 1,
		mar : 2,
		march : 2,
		apr : 3,
		april : 3,
		may : 4,
		jun : 5,
		june : 5,
		jul : 6,
		july : 6,
		aug : 7,
		august : 7,
		sep : 8,
		september : 8,
		oct : 9,
		october : 9,
		nov : 10,
		november : 10,
		dec : 11,
		december : 11
	};
	var getMonthIndex = function(month) {
		if (typeof (month) == "number") {
			return month;
		}
		return MONTH_IDX[month.toLowerCase()];
	};

	var WEEKDAY_IDX = {
		sun : 0,
		sunday : 0,
		mon : 1,
		monday : 1,
		tue : 2,
		tuesday : 2,
		wed : 3,
		wednesday : 3,
		thu : 4,
		thursday : 4,
		fri : 5,
		friday : 5,
		sat : 6,
		saturday : 6
	};
	var getWeekdayIndex = function(weekday) {
		if (typeof (weekday) == "number") {
			return weekday;
		}
		return WEEKDAY_IDX[weekday.toLowerCase()];
	};

	var parseDate = function(str) {
		for ( var i = 0; i < DATE_PATTERNS.length; ++i) {
			var p = DATE_PATTERNS[i];
			var m;
			if (m = str.match(p.regex)) {
				var d = new Date();
				if (p.idx.weekday) {
					var currentWeekday = new Date().getDay();
					var weekday = getWeekdayIndex(m[p.idx.weekday]);
					var diff = currentWeekday - weekday;
					d.setDate(d.getDate() - diff);
				} else {
					if (p.idx.year) {
						d.setFullYear(makeFullYear(m[p.idx.year]));
					}
					if (p.idx.month) {
						d.setMonth(getMonthIndex(m[p.idx.month]));
					}
					if (p.idx.day) {
						d.setDate(parseInt(m[p.idx.day], 10));
					}
				}
				return d;
			}
		}
		return null;
	};

	// Relative date patterns:
	var REL_NOW_P = /^(?:just now|now|right now)$/i;
	var REL_AGO_P = /^(.*?)\s+(?:ago|from now)$/i;
	var REL_SEC_P = /^(\d+)(?:s|sec| seconds)$/i;
	var REL_MIN_P = /^(\d+)(?:m|min| minutes)$/i;
	var REL_HOUR_P = /^(\d+)(?:h| hours)$/i;
	var REL_DAY_P = /^(\d+)(?:d| days)$/i;
	var REL_MONTH_P = /^(\d+)(?: months)$/i;
	var REL_YEAR_P = /^(\d+)(?:y| years)$/i;

	var parseRelativeDate = function(str) {
		var d = null;
		if (str.match(REL_NOW_P)) {
			d = new Date().getTime();
		} else {
			var m;
			var t = (m = str.match(REL_AGO_P)) ? m[1] : str;
			if (m = t.match(REL_SEC_P)) {
				d = new Date().getTime() - m[1] * 1000;
			} else if (m = t.match(REL_MIN_P)) {
				d = new Date().getTime() - m[1] * 60000;
			} else if (m = t.match(REL_HOUR_P)) {
				d = new Date().getTime() - m[1] * 3600000;
			} else if (m = t.match(REL_DAY_P)) {
				d = new Date().getTime() - m[1] * 86400000;
			} else if (m = t.match(REL_MONTH_P)) {
				d = new Date().getTime() - m[1] * 2.62974e9;
			} else if (m = t.match(REL_YEAR_P)) {
				d = new Date().getTime() - m[1] * 3.15569e10;
			}
		}
		return d;
	};

	var origParse = Date.parse;
	var _ = function(str) {
		var d = origParse(str);
		if (isNaN(d) && typeof (str) == "string") {
			d = parseDate(str) || parseRelativeDate(str) || NaN;
		}
		return d;
	};

	return _;
})();
