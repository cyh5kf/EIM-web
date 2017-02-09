import GregorianCalendar from 'gregorian-calendar';

const gregorianCalendarLocale = {
    timezoneOffset: - (new Date().getTimezoneOffset()),
    firstDayOfWeek: 0,
    minimalDaysInFirstWeek: 1
};


export function getGregorianCalendar(timestamp) {
    if (timestamp == null) {
        return null;
    } else {
        const gregorianCalendar = new GregorianCalendar(gregorianCalendarLocale);
        gregorianCalendar.setTime(timestamp);
        return gregorianCalendar;
    }
}
