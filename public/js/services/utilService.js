(function () {

    angular.module('mainApp').factory('utilService', utilService);

    function utilService($http, MetaTagsService, $translate,$rootScope,config) {
        return {
            countValidator: countValidator,
            loader: loader,
            addPrintPageBreak: addPrintPageBreak,
            readmoreText: readmoreText,
            sendEmail: sendEmail,
            getSponsorshipPlanString: getSponsorshipPlanString,
            createProgramListForErrorMessage: createProgramListForErrorMessage,
            sleep:sleep,
            getNumberOfDays:getNumberOfDays,
            stringToDate:stringToDate,
            getEventObjMultipleSubscription:getEventObjMultipleSubscription
        }
        function sendEmail(subject, emailBody, url, organizationName, emailText) {
            let lang = localStorage.getItem('lang')
            if (lang == 'ARB') {
                organizationName = 'النجفية';
                emailText = 'انقر على عنوان URL المعطى وانتقل إلى برنامج محترم'
            } else if (lang == 'FRN') {
                organizationName = 'Najafyia';
                emailText = `Cliquez sur l'URL donnée et accédez au programme respecté`
            } else {
                organizationName = 'Najafyia';
                emailText = 'Click the given Url and go to Respected Program'
            }
            // var div = document.createElement("div");
            // div.innerHTML = emailBody;
            // let content = div.textContent || div.innerText || "";
            content = `${MetaTagsService.SERVER_URL}/#/${url} ${emailText}`;
            var mail = `mailto:${''}?subject=${organizationName} - ${subject}
             &body= ${content}`;
            return mail;
        }
        function readmoreText(text, lines) {
            let num = 180;
            let lang = localStorage.getItem('lang')
            var div = document.createElement("div");
            div.innerHTML = text;
            const content = div.textContent || div.innerText || "";
            if (lines >= 3) {
                if (lang == "ARB") {
                    num = 200;
                    return content.substring(0, num).replace(/\s+/g, ' ').trim() + '...';
                }
                return content.substring(0, num) + '...';
            } else return content.substring(0, 100) + '...';
        }
        //Function to check valid Counter values
        function countValidator(min, max, interval) {
            let minInt = parseInt(min);
            let maxInt = parseInt(max);
            let intervalInt = parseInt(interval);
            if (minInt > 0 && maxInt > 0 && intervalInt > 0) {
                if ((maxInt % minInt == 0) && (intervalInt % minInt == 0 || minInt % intervalInt == 0)) {
                    if (minInt > maxInt || intervalInt > maxInt / 2) {
                        return false;
                    }
                    return true;
                } else {
                    return false;
                }
            }
        }
        // Function to add page break
        function addPrintPageBreak(printContent, limit) {
            if (printContent.length >= limit) {
                for (let i = limit; i < printContent.length; i = limit + i) {
                    printContent.splice(i, 0, '<div class="pagebreak"> </div>');
                }
            }
            return printContent.toString().split(',').join(' ');
        }
        function loader(params) {
            if (params.status === 'START') {
                swal({
                    title: "",
                    text: params.msg,
                    imageUrl: "",
                    showConfirmButton: false
                });
            } else {
                swal.close();
            }
        }

        function getSponsorshipPlanString(noOfMonths, amount) {

            if (noOfMonths == 3 || 6 || 12) {
                let key = "SPONSORSHIP_PLAN_" + noOfMonths;

                let sponsorshipPlanString = $translate.instant(key);

                sponsorshipPlanString = sponsorshipPlanString.replace("[amount]", amount);

                return sponsorshipPlanString;
            }

            else {
                let key = "SPONSORSHIP_PLAN";

                let sponsorshipPlanString = $translate.instant(key);

                sponsorshipPlanString = sponsorshipPlanString.replace("[amount]", amount).replace("[noMonths]", noOfMonths);

                return sponsorshipPlanString;
            }

        }

        function createProgramListForErrorMessage(obj, result) {
            let programList = [];
            let currentLang = localStorage.getItem("lang")
            // var htmlString = `<ul class="program-names-list ${currentLang}">`;
            // programList.push(obj.program.programName);
            // result.data.items = result.data.items.filter(item => item.isRecurringProgram);
            // htmlString += '<li>' + obj.program.programName + '</li>';

            // for (let index = 0; index < result.data.items.length; index++) {
            //     if (!programList.find(function (item) {
            //         return (item === result.data.items[index].program.programName);
            //     })) {
            //         programList.push(result.data.items[index].program.programName);
            //         htmlString += '<li>' + result.data.items[index].program.programName + '</li>';
            //     }
            // }
            // htmlString += '</ul>'
            // return htmlString;
        }

        function sleep (ms) {
            return new Promise((resolve) => {
              setTimeout(resolve, ms);
            });
          } 

        function getNumberOfDays(start, end) {
            const date1 = new Date(start);
            const date2 = new Date(end);
        
            // One day in milliseconds
            const oneDay = 1000 * 60 * 60 * 24;
        
            // Calculating the time difference between two dates
            const diffInTime = date2.getTime() - date1.getTime();
        
            // Calculating the no. of days between two dates
            const diffInDays = Math.round(diffInTime / oneDay);
        
            return diffInDays;
        }
        
        function stringToDate(_date,_format,_delimiter)
        {
                    var formatLowerCase=_format.toLowerCase();
                    var formatItems=formatLowerCase.split(_delimiter);
                    var dateItems=_date.split(_delimiter);
                    var monthIndex=formatItems.indexOf("mm");
                    var dayIndex=formatItems.indexOf("dd");
                    var yearIndex=formatItems.indexOf("yyyy");
                    var month=parseInt(dateItems[monthIndex]);
                    month-=1;
                    var formatedDate = new Date(dateItems[yearIndex],month,dateItems[dayIndex]);
                    return formatedDate;
        }

        function getEventObjMultipleSubscription(eventType )
        {
            let eventObj = {
                eventName: config.EventConstants.EventNames.MultipleRecurringProgram,
                eventType: eventType  ,
                triggeredBy:  $rootScope.loggedInUserDetails ? $rootScope.loggedInUserDetails.email : config.EventConstants.TriggeredBy.Guest,
                eventData:{},
                source: config.EventConstants.Sources.FDC,
                level: config.EventConstants.Levels.Tracking
              };

              return eventObj;
        }
    }
})()