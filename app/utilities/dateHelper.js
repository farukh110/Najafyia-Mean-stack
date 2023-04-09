var moment = require('moment');
var logHelper = require('../utilities/logHelper');
var dateFilterConfig = {
    IncludeStartDate: '[',
    ExcludeStartDate: '(',
    IncludeEndDate: ']',
    ExcludeEndDate: ')'
}


module.exports = {
    createUTCDate: (dateString) => {
        try {
            const dt = new Date(dateString);
            var utcDate = new Date(Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate(), dt.getHours(), dt.getMinutes(), dt.getSeconds()));
            return utcDate;
        }
        catch (err) {
            logHelper.logError("Error in convertToUTCDate : ", err);
        }
    },
    addDaysInDate: function (startDate, daysToAdd, utcFlag, format) {
        try {
            var dateLocale = utcFlag == true ? moment(startDate).utc() : moment(startDate);
            utcFlag == true ? dateLocale.add(daysToAdd, 'days').utc() : dateLocale.add(daysToAdd, 'days');
            return utcFlag == true ? dateLocale.utc().format(format) : dateLocale.format(format);
        } catch (error) {
            logHelper.logError(
                'DateHelper.addDaysInDate: Error occured while adding days in date: ' +
                error,
            );
        }
        return null;
    },
    subtractDaysFromDate: function (startDate, daysToSubtract, utcFlag, format) {
        try {
            var dateLocale = moment(startDate);
            dateLocale.subtract(daysToSubtract, 'days');
            return utcFlag == true ? dateLocale.utc().format(format) : dateLocale.format(format);
        } catch (error) {
            logHelper.logError(
                'DateHelper.subtractDaysFromDate: Error occured while subtracting days from date: ' +
                error,
            );
        }
        return null;
    },
    isDateBetweenTwoDates: function (dateToCheck, startDate, endDate, includeStartDateFlag, includeEndDateFlag) {
        try {
            return moment(dateToCheck).isBetween(startDate, endDate, undefined, (includeStartDateFlag == true ? dateFilterConfig.IncludeStartDate : dateFilterConfig.ExcludeStartDate) + (includeEndDateFlag == true ? dateFilterConfig.IncludeEndDate : dateFilterConfig.ExcludeEndDate));
        } catch (error) {
            logHelper.logError(
                'DateHelper.isDateBetweenTwoDates: Error occured while checking date between two dates: ' +
                error,
            );
        }
        return null;
    },
    getDateInSpecificFormat: function (date, utcFlag, format, locale) {
        // parameter : 'format' is for date format (provide empty for default format), 
        // parameter : 'locale' is to change language (provide empty for default language which is english)
        try {
            locale = locale == undefined ? '' : locale;//To handle default value
            format = format == undefined ? '' : format;//To handle default value
            utcFlag = utcFlag == undefined ? false : utcFlag;
            return utcFlag == true ? moment(date).locale(locale).utc().format(format) : moment(date).locale(locale).format(format);
        } catch (error) {
            logHelper.logError(
                'DateHelper.getDateInSpecificFormat: Error occured while converting date format: ' +
                error,
            );
        }
        return null;
    },
    resetTimeToDayStart: function (date, utcFlag, format) {
        try {
            return utcFlag == true ? moment(date).utcOffset(0).startOf('day').utc().format(format) : moment(date).utcOffset(0).startOf('day').format(format);
        } catch (error) {
            logHelper.logError(
                'DateHelper.resetTimeToDayStart: Error occured while reseting to day start: ' +
                error,
            );
        }
        return null;
    },
    resetTimeToDayEnd: function (date, utcFlag, format) {
        try {
            return utcFlag == true ? moment(date).utcOffset(0).endOf('day').utc().format(format) : moment(date).utcOffset(0).endOf('day').format(format);
        } catch (error) {
            logHelper.logError(
                'DateHelper.resetTimeToDayStart: Error occured while reseting to day end: ' +
                error,
            );
        }
        return null;
    },
    addMonthsInDate: function (startDate, monthsToAdd, utcFlag, format) {
        try {
            var dateLocale = moment(startDate);
            dateLocale.add(monthsToAdd, 'months');
            return utcFlag == true ? dateLocale.utc().format(format) : dateLocale.format(format);
        } catch (error) {
            logHelper.logError(
                'DateHelper.addMonthsInDate: Error occured while adding months in date: ' +
                error,
            );
        }
        return null;
    },
    getNextMonth: function (getFirstDay) {
        var now = new Date();
        if (now.getMonth() == 11) {
            return new Date(now.getFullYear() + 1, 0, 1);
        } else {
            return new Date(now.getFullYear(), now.getMonth() + 1, getFirstDay ? 1 : now.getDate());
        }
    },
    resetDateToMonthStart: function (date, utcFlag, format) {
        try {
            return utcFlag == true ? moment(date).utcOffset(0).startOf('month').utc().format(format) : moment(date).utcOffset(0).startOf('month').format(format);
        } catch (error) {
            logHelper.logError(
                'DateHelper.resetDateToMonthStart: Error occured while reseting to month start: ' +
                error,
            );
        }
        return null;
    },
    getStartOfMonth: function (date) {
        try{
            return moment(this.createUTCDate(date)).utc().startOf("month");
        } catch (error) {
            logHelper.logError(
                'DateHelper.getStartOfMonth: Error occured while making start of month date: ' +
                error,
            );
        }
    },
    getEndOfMonth: function (date) {
        try{
            return moment(this.createUTCDate(date)).utc().endOf("month");
        } catch (error) {
            logHelper.logError(
                'DateHelper.getEndOfMonth: Error occured while making end of month date: ' +
                error,
            );
        }
    },
    getDiffBetweenTwoDates: function (startDate , endDate,differenceUnit) {
        try{
           // endDate.diff(StartDate, 'months')
           endDate = moment( this.createUTCDate(endDate));
            return differenceUnit ?  endDate.diff(this.createUTCDate(startDate),differenceUnit) : endDate.diff(this.createUTC(startDate) )
            // moment(this.createUTCDate(date)).utc().endOf("month");
        } catch (error) {
            logHelper.logError(
                'DateHelper.getDiffBetweenTwoDates: Error occured while calculating difference: ' +
                error,
            );

            
        }
    },
    convertDateToUnix: function (date) {
        try{
          let momentDate = moment(date)
            return momentDate.unix();
            // moment(this.createUTCDate(date)).utc().endOf("month");
        } catch (error) {
            logHelper.logError(
                'DateHelper.getDiffBetweenTwoDates: Error occured while calculating difference: ' +
                error,
            );
        }
    },
    getDateNow: function (utc) {
        try{
           // utcFlag == true ? dateLocale.utc().format(format) : dateLocale.format(format);
            return utc == true ?  this.createUTCDate(Date()) : Date();
            // moment(this.createUTCDate(date)).utc().endOf("month");
        } catch (error) {
            logHelper.logError(
                'DateHelper.getDateNow: Error occured while calculating difference: ' +
                error,
            );

            
        }
    },
    getStartOfNextMonth: function (Date) {
        try{
          let newDate = this.addMonthsInDate(Date,1,true);
            return this.getStartOfMonth(newDate); 
            // moment(this.createUTCDate(date)).utc().endOf("month");
        } catch (error) {
            logHelper.logError(
                'DateHelper.getStartOfNextMonth: Error occured while calculating difference: ' +
                error,
            );

            
        }
    },
    addInDate: function (Date, additionInteger,unit, utcFlag, format) {
        try {
            var dateLocale = utcFlag == true ? moment(Date).utc() : moment(Date);
            utcFlag == true ? dateLocale.add(additionInteger, unit).utc() : dateLocale.add(additionInteger, unit);
            return utcFlag == true ? dateLocale.utc().format(format) : dateLocale.format(format);
        } catch (error) {
            logHelper.logError(
                'DateHelper.addDaysInDate: Error occured while adding days in date: ' +
                error,
            );
        }
        return null;
    },
    getStartOfPreviousMonth: function (Date) {
        try{
          let newDate = this.addMonthsInDate(Date,-1,true);
            return this.getStartOfMonth(newDate); 
            // moment(this.createUTCDate(date)).utc().endOf("month");
        } catch (error) {
            logHelper.logError(
                'DateHelper.getStartOfPreviousMonth: ' +error,);
        }
    }


    //var duration = moment.duration(end.diff(startTime));
}

