// a small library using moment.js, detecting the user's timezone
// Repository : https://github.com/Canop/tzdetect.js
// It must be included between the moment-timezone.js script and the moment-timezone-data.js one.
// Usage :
//   tzdetect.names : an array of all available timezone id
//   tzdetect.matches(base) : returns an array of all timezones matching the user's one, or supplied base timezone
import moment from 'moment';
import momentTimeZone from 'moment-timezone';

var tzdetect = {
    names: moment.tz.names(),
    matches: function(base) {
        var results = [],
            now = Date.now(),
            makekey = function(id) {
                return [0, 4, 8, -5 * 12, 4 - 5 * 12, 8 - 5 * 12, 4 - 2 * 12, 8 - 2 * 12].map(function(months) {
                    var m = moment(now + months * 30 * 24 * 60 * 60 * 1000);
                    if (id) m.tz(id);
                    // Compare using day of month, hour and minute (some timezones differ by 30 minutes)
                    return m.format("DDHHmm");
                }).join(' ');
            },
            lockey = makekey(base);
        tzdetect.names.forEach(function(id) {
            if (makekey(id) === lockey) results.push(id);
        });
        return results;
    }
};
var tzName = tzdetect.matches()[0];
export default {
    timeToLocale: function(time, format) {
        return momentTimeZone(Number(time)).tz(tzName).format(format);
    },

    formatToTimeLine: function(time) {
        return this.timeToLocale(Number(time), 'LL');
    },

    formatToString: function(time, format) {
        return moment(Number(time)).format(format);
    },

    formatToTodayTime: function(time) {
        var format = "YYYY-MM-DD "+time;
        var dateTime = moment().format(format);
        return new Date(dateTime).getTime();
    },

    addDays: function(time,days){
        return moment(time).add(days, 'days');
    },

    isToday: function(time) {
        var day = moment(Number(time));
        var today = moment();
        return today.startOf('day').isSame(day.startOf('day'));
    },

    isCurrentYear: function(time) {
        var day = moment(Number(time));
        var today = moment();
        return today.startOf('year').isSame(day.startOf('year'));
    },

    minutesAgo(minutes) {
        return moment.duration(minutes, "minutes").humanize(true);
    },

    secondsAgo(seconds) {
        return moment.duration(seconds, "seconds").humanize(true);
    },

    daysAgo(days) {
        return moment.duration(days, "days").humanize(true);
    },

    hoursAgo(hours) {
        return moment.duration(hours, "hours").humanize(true);
    },
    calcTime(offset, format) {

        // create Date object for current location

        var d = new Date();

        // convert to msec

        // add local time zone offset

        // get UTC time in msec

        var utc = d.getTime() + (d.getTimezoneOffset() * 60000);

        // create new Date object for different city

        // using supplied offset

        var nd = new Date(utc + (3600000 * offset));

        // return time as a string(toLocaleString)
        return moment(nd).format(format);

    }
};
