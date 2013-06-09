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
	var DATE_PATTERNS = new Array(
			{
				regex : new RegExp("^(\\d+)\\s+" + MONTH_GROUP + "\\s+(\\d+)$", "i"),
				idx : { day : 1, month : 2, year : 3 }
			},
			{
				regex : new RegExp("^" + MONTH_GROUP + "\\s+(\\d+)\\s*,\\s*(\\d+)$", "i"),
				idx : { day : 2, month : 1, year : 3 }
			},
			{
				regex : new RegExp("^(\\d+)\\s+" + MONTH_GROUP + "$", "i"),
				idx : { day : 1, month : 2 }
			},
			{
				regex : new RegExp("^(\\d+)\\s+" + MONTH_GROUP + "$", "i"),
				idx : { day : 1, month : 2 }
			},
			{
				regex : /^(\d+\:\d+(?::\d+)?(?:\s*am|\s*pm))$/i,
				idx : { hours: 1 }
			},
			{
				regex : /^(previous|next)?\s*(sun|sunday|mon|monday|tue|tuesday|wed|wednesday|thu|thursday|fri|friday|sat|saturday)$/i,
				idx : { shift : 1, 	weekday : 2 }
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

	var getShift = function(str) {
		if (typeof (str) == "string") {
			if (str.toLowerCase() == "next") {
				return 1;
			}
			if (str.toLowerCase() == "previous") {
				return -1;
			}
		}
		return 0;
	};
	
	var parseHours = function(date, hours) {
		var m;
		if (m = hours.match(/^(\d+):(\d+)\s*am$/i)) {
			var hr = parseInt(m[1], 10);
			var min = parseInt(m[2], 10);
			if (hr == 12) {
				hr = hr - 12;
			}
			date.setHours(hr, min);
		} else if (m = hours.match(/^(\d+):(\d+)\s*pm$/i)) {
			var hr = parseInt(m[1], 10);
			var min = parseInt(m[2], 10);
			if (hr < 12) {
				hr = hr + 12;
			}
			date.setHours(hr, min);
		} else if (m = hours.match(/^(\d+):(\d+)$/)) {
			var hr = parseInt(m[1], 10);
			var min = parseInt(m[2], 10);
			date.setHours(hr, min);
		} else if (m = hours.match(/^(\d+):(\d+):(\d+)$/)) {
			var hr = parseInt(m[1], 10);
			var min = parseInt(m[2], 10);
			var sec = parseInt(m[3], 10);
			date.setHours(hr, min, sec);
		}
	};
	
	var parseDate = function(str) {
		for ( var i = 0; i < DATE_PATTERNS.length; ++i) {
			var p = DATE_PATTERNS[i];
			var m;
			if (m = str.match(p.regex)) {
				var d = new Date();
				if (p.idx.weekday) {
					var shift = p.idx.shift ? getShift(m[p.idx.shift]) * 7 : 0;
					var currentWeekday = new Date().getDay();
					var weekday = getWeekdayIndex(m[p.idx.weekday]);
					var diff = currentWeekday - weekday;
					d.setDate(d.getDate() - diff + shift);
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
					if (p.idx.hours) {
						parseHours(d, m[p.idx.hours]);
					}
					if (p.idx.hour) {
						d.setHours(parseInt(m[p.idx.hour], 10));
					}
					if (p.idx.minute) {
						d.setMinutes(parseInt(m[p.idx.minute], 10));
					}
					if (p.idx.second) {
						d.setSeconds(parseInt(m[p.idx.second], 10));
					}
				}
				return d.getTime();
			}
		}
		return null;
	};

	// Relative date patterns:
	var REL_NOW_P = /^(?:just now|now|right\s+now)$/i;
	var REL_AGO_P = /^(.*?)\s+(?:ago|from\s+now)$/i;
	var REL_SEC_P = /^(\d+)(?:s|sec|\s+seconds?)$/i;
	var REL_MIN_P = /^(\d+)(?:m|min|\s+minutes?)$/i;
	var REL_HOUR_P = /^(\d+)(?:h|\s+hours?)$/i;
	var REL_DAY_P = /^(\d+)(?:d|\s+days?)$/i;
	var REL_MONTH_P = /^(\d+)(?:\s+months?)$/i;
	var REL_YEAR_P = /^(\d+)(?:y|\s+years?)$/i;
	var REL_YTT_P = /^(yesterday|today|tomorrow)\s*(?:at)?\s*(\d+\:\d+(?::\d+)?(?:\s*am|\s*pm)?)?$/i;

	var parseRelativeDate = function(str) {
		str = str.trim();

		var d = null;
		if (str.match(REL_NOW_P)) {
			d = new Date().getTime();
		} else {
			var m;
			if (m = str.match(REL_YTT_P)) {
				d = new Date();
				if (m[1].toLowerCase() == "yesterday") {
					d.setDate(d.getDate()-1);
				}
				else if (m[1].toLowerCase() == "tomorrow") {
					d.setDate(d.getDate()+1);
				}
				if (m[2]) {
					parseHours(d, m[2]);
				}
				d = d.getTime();
			} else {
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
		}
		return d;
	};

	var origParse = Date.parse;
	var _ = function(str) {
		if (typeof (str) != "string") {
			return NaN;
		}
		return parseDate(str) || parseRelativeDate(str) || origParse(str);
	};

	return _;
})();
