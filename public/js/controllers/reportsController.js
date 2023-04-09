(function () {

    angular.module('mainApp').controller('reportsController', ReportsController);

    function ReportsController($scope, $state, $location, reportsService, programTypeService, programService, occasionService, duaService, countryService, $translate, userService) {

        var reportVM = this;
        reportVM.projectionReport = [];
        $scope.dataListReports = [];

        reportVM.hajjZiyarahprogramId = "5a850e9f7a02ca6bbb8adc1d";
        reportVM.responseData = [];
        reportVM.dataList = [];
        reportVM.SDOZList = [];
        reportVM.searchCriteria = {};
        reportVM.shamsList = [];
        reportVM.countryList = [];
        reportVM.dateToday = new Date();
        reportVM.orphansList = [];
        reportVM.studentList = [];
        reportVM.donationList = [];
        reportVM.donorDetailsList = [];
        reportVM.ocassionList = [];
        reportVM.duaList = [];
        $scope.language = localStorage.getItem('lang');
        $scope.colSpan = 8;
        $scope.changeColSpan = function (value) {
            $scope.colSpan = value ? $scope.colSpan + 1 : $scope.colSpan - 1;
        }
        function encode_utf8(s) {
            return unescape(encodeURIComponent(s));
        }
        function decode_utf8(s) {
            return decodeURIComponent(escape(s));
        }
        reportVM.searchCriteria.type = reportVM.projectionSelection = 'Recurring';
        var months = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"];



        reportVM.monthsList = [{
            month: 'January',
            currency: {
                USD: 0,
                EUR: 0,
                GBP: 0,
            },
            status: false
        }, {
            month: 'February',
            currency: {
                USD: 0,
                EUR: 0,
                GBP: 0,
            },
            status: false
        }, {
            month: 'March',
            currency: {
                USD: 0,
                EUR: 0,
                GBP: 0,
            },
            status: false
        }, {
            month: 'April',
            currency: {
                USD: 0,
                EUR: 0,
                GBP: 0,
            },
            status: false
        }, {
            month: 'May',
            currency: {
                USD: 0,
                EUR: 0,
                GBP: 0,
            },
            status: false
        }, {
            month: 'June',
            currency: {
                USD: 0,
                EUR: 0,
                GBP: 0,
            },
            status: false
        }, {
            month: 'July',
            currency: {
                USD: 0,
                EUR: 0,
                GBP: 0,
            },
            status: false
        }, {
            month: 'August',
            currency: {
                USD: 0,
                EUR: 0,
                GBP: 0,
            },
            status: false
        }, {
            month: 'September',
            currency: {
                USD: 0,
                EUR: 0,
                GBP: 0,
            },
            status: false
        }, {
            month: 'October',
            currency: {
                USD: 0,
                EUR: 0,
                GBP: 0,
            },
            status: false
        }, {
            month: 'November',
            currency: {
                USD: 0,
                EUR: 0,
                GBP: 0,
            },
            status: false
        }, {
            month: 'December',
            currency: {
                USD: 0,
                EUR: 0,
                GBP: 0,
            },
            status: false
        }];


        reportVM.getProgramTypes = getProgramTypes;
        reportVM.getRecurringProgramTypes = getRecurringProgramTypes;
        reportVM.getReligiousProgramsList = getReligiousProgramsList;
        reportVM.getSDOZList = getSDOZList;
        reportVM.getProgramList = getProgramList;
        reportVM.getRecurringProgramList = getRecurringProgramList;
        reportVM.hajjZiyarahReportList = hajjZiyarahReportList;
        reportVM.getProgramSubCategoryList = getProgramSubCategoryList;
        reportVM.getOcassionBySubCat = getOcassionBySubCat;
        reportVM.getDuasByOcassion = getDuasByOcassion;
        reportVM.getDonarWiseReport = getDonarWiseReport;
        reportVM.getaccountingWiseReport = getaccountingWiseReport;
        reportVM.getDonations = getDonations;
        reportVM.getRecurringDonations = getRecurringDonations;
        reportVM.filterDonarWiseReport = filterDonarWiseReport;
        reportVM.filterDonarDetailsReport = filterDonarDetailsReport;
        reportVM.ChangeIterationFields = ChangeIterationFields;
        reportVM.filterConsolidatedReport = filterConsolidatedReport;
        reportVM.fillDonorDetails = fillDonorDetails;
        reportVM.resetForm = resetForm;
        reportVM.printDiv = printDiv;
        reportVM.getKhumsSubCategoryList = getKhumsSubCategoryList;
        reportVM.getKhumsReport = getKhumsReport;
        reportVM.getProfileReport = getProfileReport;
        reportVM.getCountryList = getCountryList;
        reportVM.showProjectionReport = showProjectionReport;
        reportVM.filterProfileReport = filterProfileReport;
        reportVM.getStudentSponsorship = getStudentReport;
        reportVM.getOrphansScholarship = getOrphanReport;
        reportVM.getSponsorshipRenewalReport = getSponsorshipRenewalReport;
        reportVM.filterSponsorshipReport = filterSponsorshipReport;


        $scope.curencyTotal = {
            euro: 0,
            dollar: 0,
            pound: 0
        };

        $scope.amount = {
            grandTotalUSD: 0,
            grandTotalEUR: 0,
            grandTotalGBP: 0,
            meanUSD: 0,
            meanEUR: 0,
            meanGBP: 0,
            medianUSD: 0,
            medianEUR: 0,
            medianGBP: 0,
            count: 0
        };

        $scope.iterationFields = {
            transactionDate: true,
            donorId: true,
            donorCountry: true,
            nextSubMenu: true,
            count: true,
            amount: true
        };

        $scope.countryList = [];
        $scope.decentStatus = function (data) {
            let status = '----';
            if (data.isSyed) status = 'SYED';
            else if (data.isSyed === false) status = 'NON-SYED';
            return $translate.instant(status);
        }
        // programService.getProgramById('5a850e9f7a02ca6bbb8adc1d').then(function (res) {
        //     reportVM.hajjZiyarahList = res.data[0].programSubCategory;
        // });

        programService.getSDOZList().then(function (res) {
            reportVM.SDOZList = res.data;
        });

        function getProgramTypes() {
            programTypeService.getProgramTypes().then(function (res) {
                reportVM.programTypesList = res.data;
                reportVM.programTypesList = reportVM.programTypesList.map(prg=>{
                    prg.programTypeName = $translate.instant(prg.programTypeName);
                    return prg;
                 })
            });
        }

        function getRecurringProgramTypes() {
            programTypeService.getProgramTypes().then(function (res) {
                reportVM.recurringProgramTypesList = _.filter(res.data, function (item) {
                    if ((item.programTypeName != $translate.instant('RELIGIOUS PAYMENTS'))) {
                        return item;
                    }
                })
            });
        }

        function getReligiousProgramsList(typeId) {
            if (typeId) {
                programService.getProgramByTypeId(typeId).then(function (res) {
                    reportVM.programList = res.data;
                    reportVM.programSubCategoryList = [];
                });
            }
        }

        function getProgramList(typeId) {
            if (typeId) {
                programService.getProgramByTypeId(typeId).then(function (res) {
                    reportVM.programList = res.data || [];
                    reportVM.programList = reportVM.programList.filter(o=>o.isActive);
                    reportVM.programSubCategoryList = [];
                });
            }
        }

        function getRecurringProgramList(typeId) {
            if (typeId) {
                programService.getProgramByTypeId(typeId).then(function (res) {
                    reportVM.programList = _.filter(res.data, function (item) {
                        if (item.donationProcess.length > 0 && item.donationProcess[0].isRecurring) {
                            return item;
                        }
                    });
                    reportVM.programSubCategoryList = [];
                });
            }
        }

        function getProgramSubCategoryList(programId) {
            if (programId) {
                programService.getProgramById(programId).then(function (res) {
                    reportVM.programSubCategoryList = res.data[0].programSubCategory;
                    reportVM.programSubCategoryList = reportVM.programSubCategoryList.filter(ps => ps.isActive);
                    // if (programId === '5ae01dbd1a0d051508846688') {
                    //     reportVM.shamsList = reportVM.programSubCategoryList[0].hasOwnProperty('sahms') ? reportVM.programSubCategoryList[0].sahms : [];
                    // }
                });
            }
        }

        function getOcassionBySubCat(subCat) {
            occasionService.getOcassionBySubCat(subCat._id)
                .then(function (res) {
                    reportVM.ocassionList = res.data;
                });
        }

        function getDuasByOcassion(occassion) {
            duaService.getDuasByOcassion(occassion._id)
                .then(function (res) {
                    reportVM.duaList = res.data;
                });
        }

        function getCountryList() {
            countryService.getCountryList().then(function (res) {
                reportVM.countryList = res.data;
                reportVM.countryList = reportVM.countryList.map(c => {
                    if (localStorage.getItem('lang') === 'FRN') {
                        c.name = c.nameFRN;
                    } else if (localStorage.getItem('lang') === 'ARB') {
                        c.name = c.nameARB;
                    }
                    return c;
                })
                $scope.countryList = reportVM.countryList;

            });
        }


        function getSDOZList() {
            programService.getSDOZList().then(function (res) {
                reportVM.SDOZList = res.data[0];
            })
        }

        function dateFormated(date) {
            if (date) {
                var fullDate = new Date(date);
            } else {
                var fullDate = new Date();
            }
            var twoDigitMonth = ((fullDate.getMonth().length + 1) === 1) ? (fullDate.getMonth() + 1) : '0' + (fullDate.getMonth() + 1);
            var twoDigitDate = fullDate.getDate() <= 9 ? '0' + fullDate.getDate() : fullDate.getDate();
            return twoDigitMonth + "/" + twoDigitDate + "/" + fullDate.getFullYear();
        }

        reportVM.getProgramTypes();


        function getDonarWiseReport() {
            reportsService.getDonarWiseReport(reportVM.searchCriteria).then(function (res) {
                reportVM.responseData = res.data.reverse();
                for (var i = 0; i < reportVM.responseData.length; i++) {
                    if (reportVM.responseData[i].donationdetails && reportVM.responseData[i].donationdetails.length) {
                        reportVM.responseData[i].donationdetails.forEach((obj) => {
                            obj.donor = reportVM.responseData[i].donor;
                            $scope.dataListReports.push(obj);
                            if (obj.donor && obj.donor.length && obj.donor[0].user && !obj.donor[0].user.length) {
                                userService.getGuestUserByDonorId(obj.donor[0]._id).then(res => {
                                    obj.donor[0].user = [res.data];
                                });
                            }
                        })
                    }

                }
            });
        }

        function getaccountingWiseReport() {
            reportsService.getaccountingWiseReport(reportVM.searchCriteria).then(function (res) {
                reportVM.responseData = res.data.reverse();
            });
        }

        function getDonations() {
            reportVM.searchCriteria.paymentType = 'Recurring';
            reportsService.getDonations().then(function (res) {
                reportVM.responseData = res.data.reverse();
            })
        }

        function getRecurringDonations() {
            reportsService.getRecurringDonations().then(function (res) {
                reportVM.responseData = res.data.reverse();
            })
        }


        function getKhumsReport() {

            // if (localStorage.getItem('lang') == 'ARB') {
            //     $scope.programName = "الخمس";
            // } else if (localStorage.getItem('lang') == 'FRN') {
            //     $scope.programName = "Khums";
            // } else {
            //     $scope.programName = "Khums";
            // }

            // if ($scope.programName) {
            reportsService.getKhumsReport().then(function (res) {
                $scope.receiptDetails = res.data.reverse();
                $scope.getKhumsReport('-khums');
            });

            // }
        }

        function getProfileReport() {
            reportsService.getProfileReport().then(function (res) {
                reportVM.responseData = res.data.reverse();
            });
        }


        $scope.getKhumsReport = function (programName) {

            for (var i = 0; i < $scope.receiptDetails.length; i++) {
                if ($scope.receiptDetails[i].donationdetails && $scope.receiptDetails[i].donationdetails.length) {
                    $scope.receiptDetails[i].donationdetails.forEach((obj) => {
                        obj.program.forEach((elem) => {
                            if (elem.slug == programName) {
                                obj.donor = $scope.receiptDetails[i].donor;
                                $scope.dataListReports.push(obj);
                            }
                        })
                    })
                }

            }

        }


        function filterDonarWiseReport() {
            if (!reportVM.searchCriteria.toDate || !reportVM.searchCriteria.fromDate) {
                swal(
                    $translate.instant('Required!'),
                    $translate.instant('Please insert date first'),
                    'error'
                )
                return
            }
            reportVM.toggler = false;
            $scope.dataListDonarWiseReport = Object.assign([], $scope.dataListReports);
            if (reportVM.searchCriteria.fromDate && reportVM.searchCriteria.toDate) {
                $scope.dataListDonarWiseReport = $scope.dataListDonarWiseReport.filter(obj => (new Date(obj.created.split('T').shift().split("-").join("/")) >= new Date(reportVM.searchCriteria.fromDate) && new Date(obj.created.split('T').shift().split("-").join("/")) <= new Date(reportVM.searchCriteria.toDate)));
            }
            if (reportVM.searchCriteria.category) {
                $scope.dataListDonarWiseReport = $scope.dataListDonarWiseReport.filter(obj => obj.program["0"].programType["0"].slug == reportVM.searchCriteria.category);
            }
            if (reportVM.searchCriteria.subMenu) {
                $scope.dataListDonarWiseReport = $scope.dataListDonarWiseReport.filter(obj => obj.program["0"].slug == reportVM.searchCriteria.subMenu);
            }
            if (reportVM.searchCriteria.subMenu1) {
                $scope.dataListDonarWiseReport = $scope.dataListDonarWiseReport.filter(obj =>
                    obj.programSubCategory[0].slug == reportVM.searchCriteria.subMenu1);
            }
            if (reportVM.searchCriteria.paymentType) {
                $scope.dataListDonarWiseReport = $scope.dataListDonarWiseReport.filter(obj => {
                    if (obj.isRecurring == undefined) obj.isRecurring = false;
                    return obj.isRecurring.toString() == reportVM.searchCriteria.paymentType
                });
            }
            if (reportVM.searchCriteria.amountY) {
                $scope.dataListDonarWiseReport = $scope.dataListDonarWiseReport.filter(obj => obj.amount <= reportVM.searchCriteria.amountY);
            }
            if (reportVM.searchCriteria.amountX) {
                $scope.dataListDonarWiseReport = $scope.dataListDonarWiseReport.filter(obj => obj.amount >= reportVM.searchCriteria.amountX);
            }
            if (reportVM.searchCriteria.searchField) {
                let donorName = reportVM.searchCriteria.searchField;
                const regexp = new RegExp(donorName, 'i');
                $scope.dataListDonarWiseReport = $scope.dataListDonarWiseReport.filter(obj => {
                    let donor = obj.donor && obj.donor[0];
                    if (donor) {
                        return regexp.test(donor.donarName) || regexp.test(donor.mobile) || regexp.test(donor.email)
                    } else false;
                });
            }
            if (reportVM.searchCriteria.decent) {
                $scope.dataListDonarWiseReport = $scope.dataListDonarWiseReport.filter(obj => obj.isSyed.toString() == reportVM.searchCriteria.decent);
            }
            if (reportVM.searchCriteria.status) {
                $scope.dataListDonarWiseReport = $scope.dataListDonarWiseReport.filter(obj => obj.donation.isKhums.toString() == reportVM.searchCriteria.status);
            }
            $scope.curencyTotal.dollar = _.sumBy($scope.dataListDonarWiseReport, function (o) {
                if (o.donation.currency != null && o.donation.currencyTitle == 'USD' && o.amount != null) {
                    return o.amount;
                }
            });
            $scope.curencyTotal.euro = _.sumBy($scope.dataListDonarWiseReport, function (o) {
                if (o.donation.currency != null && o.donation.currencyTitle == 'EUR' && o.amount != null) {
                    return o.amount;
                }
            });

            $scope.curencyTotal.pound = _.sumBy($scope.dataListDonarWiseReport, function (o) {
                if (o.donation.currency != null && o.donation.currencyTitle == 'GBP' && o.amount != null) {
                    return o.amount;
                }
            });
            reportVM.toggler = true;

        }
        function showProjectionReport() {
            reportVM.toggler = false;
            reportVM.projectionReport = [];
            $scope.selectedMonths = [];
            reportsService.getProjectionReport(reportVM.searchCriteria).then(function (res) {
                reportVM.projectionReport = res.data.data;
                if (reportVM.projectionReport && reportVM.projectionReport.length && reportVM.searchCriteria.category && !reportVM.searchCriteria.subMenu) {
                    reportVM.projectionReport = reportVM.projectionReport.filter(obj => obj.program && obj.program.length && obj.program[0].programType && obj.program[0].programType.length && obj.program[0].programType[0].slug == reportVM.searchCriteria.category)
                }
                if (reportVM.projectionReport && reportVM.projectionReport.length && reportVM.searchCriteria.category && reportVM.searchCriteria.subMenu) {
                    reportVM.projectionReport = reportVM.projectionReport.filter(obj => obj.program && obj.program.length && obj.program[0].slug == reportVM.searchCriteria.subMenu)
                }
                if (res && res.data && res.data.endDate && res.data.startDate) {
                    let startDate = `${months[new Date(res.data.startDate).getMonth()]} ${new Date(res.data.startDate).getFullYear()}`
                    let endDate = `${months[new Date(res.data.endDate).getMonth()]} ${new Date(res.data.endDate).getFullYear()}`
                    $scope.selectedMonths = monthDiff(startDate, endDate);
                }
                if (res && res.data && res.data.data && res.data.data.length) {
                    reportVM.projectionReport.forEach((obj) => {
                        obj.endDate = obj.endDate || new Date()
                        if (obj.created && obj.endDate) {
                            let startDate = `${months[new Date(obj.created).getMonth()]} ${new Date(obj.created).getFullYear()}`
                            let endDate = `${months[new Date(obj.endDate).getMonth()]} ${new Date(obj.endDate).getFullYear()}`
                            obj.months = monthDiff(startDate, endDate);
                            if (obj.program[0].slug === 'higher-education-loans' && obj.programSubCategory && obj.programSubCategory.length && obj.programSubCategory[0].isPhd) {
                                for (let i = 0; i < obj.months.length; i++) {
                                    if (obj.months[i]) {
                                        for (let j = 1; j < 6; j++) {
                                            obj.months[i + j] = undefined;
                                        }
                                        obj.months = obj.months.splice(i, 6);
                                    }
                                    i = i + 6;
                                }
                            }
                            if (obj.program[0].slug === 'higher-education-loans' && obj.programSubCategory && obj.programSubCategory.length && !obj.programSubCategory[0].isPhd) {
                                for (let i = 0; i < obj.months.length; i++) {
                                    if (obj.months[i]) {
                                        for (let j = 1; j < 5; j++) {
                                            obj.months[i + j] = undefined;
                                        }
                                        obj.months = obj.months.splice(i, 5);
                                    }
                                    i = i + 5;
                                }
                            }
                            obj.months.pop();
                        }
                        if (obj.months && obj.months.length && obj.amount) {
                            obj.grandAmount = obj.amount * obj.months.length
                        }
                    })
                    $scope.totalInUSD = reportVM.projectionReport.filter(obj => obj.donationDetails.donation.currencyTitle == 'USD').reduce((total, num) => {
                        return Number(total) + Number(num.grandAmount);
                    }, 0)
                    $scope.totalInEUR = reportVM.projectionReport.filter(obj => obj.donationDetails.donation.currencyTitle == 'EUR').reduce((total, num) => {
                        return Number(total) + Number(num.grandAmount);
                    }, 0)
                    $scope.totalInGBP = reportVM.projectionReport.filter(obj => obj.donationDetails.donation.currencyTitle == 'GBP').reduce((total, num) => {
                        return Number(total) + Number(num.grandAmount);
                    }, 0)
                    let data = Object.assign([], reportVM.projectionReport);
                    $scope.MonthArray = [];
                    for (var i = 0; i < data.length; i++) {
                        for (var j = 0; j < data[i].months.length; j++) {
                            var usdNetAmount = 0;
                            var eurNetAmount = 0;
                            var gbpNetAmount = 0;
                            for (var k = 0; k < data.length; k++) {
                                if (data[k].months.indexOf(data[i].months[j]) >= 0) {
                                    if (data[k].donationDetails.donation.currencyTitle == 'USD') {
                                        usdNetAmount += data[k].amount;
                                    }
                                    if (data[k].donationDetails.donation.currencyTitle == 'EUR') {
                                        eurNetAmount += data[k].amount;
                                    }
                                    if (data[k].donationDetails.donation.currencyTitle == 'GBP') {
                                        gbpNetAmount += data[k].amount;
                                    }
                                }
                            }
                            if (k == data.length && (!$scope.MonthArray.length || ($scope.MonthArray && $scope.MonthArray.findIndex(obj => obj.month == data[i].months[j]) < 0))) {
                                $scope.MonthArray.push({ usdAmount: usdNetAmount, gbpAmount: gbpNetAmount, eurAmount: eurNetAmount, month: data[i].months[j] })
                            }
                        }

                    }
                    $scope.MonthArray.push(undefined);
                    $scope.MonthArray[$scope.MonthArray - 1] = $scope.MonthArray[$scope.MonthArray - 2];
                    $scope.MonthArray[$scope.MonthArray - 2] = undefined;
                }
                reportVM.toggler = true;
            });
        }


        function monthDiff(from, to) {
            var arr = [];
            var datFrom = new Date('1 ' + from);
            var datTo = new Date('1 ' + to);
            var fromYear = datFrom.getFullYear();
            var toYear = datTo.getFullYear();
            var diffYear = (12 * (toYear - fromYear)) + datTo.getMonth();

            for (var i = datFrom.getMonth(); i <= diffYear; i++) {
                arr.push(months[i % 12] + " " + Math.floor(fromYear + (i / 12)));
            }
            return arr;
        }



        function ChangeIterationFields(item, status) {
            $scope.iterationFields.item = status;

        }

        function median(list) {
            var median = 0, numsLen = list.length;
            _.orderBy(list, (o) => o.amount);
            if (numsLen % 2 === 0) { //is even
                // average of two middle numbers
                median = (list[numsLen / 2 - 1].amount + list[numsLen / 2].amount) / 2;
            } else { // is odd
                // middle number only
                median = list[(numsLen - 1) / 2].amount;
            }
            return median;
        }

        function filterConsolidatedReport() {
            if (!reportVM.searchCriteria.toDate || !reportVM.searchCriteria.fromDate) {
                swal(
                    $translate.instant('Required!'),
                    $translate.instant('Please insert date first'),
                    'error'
                )
                return
            }
            reportVM.toggler = false;
            $scope.dataListConsolidatedReport = Object.assign([], $scope.dataListReports);
            if (reportVM.searchCriteria.fromDate && reportVM.searchCriteria.toDate) {
                $scope.dataListConsolidatedReport = $scope.dataListConsolidatedReport.filter(obj => (new Date(obj.created.split('T').shift().split("-").join("/")) >= new Date(reportVM.searchCriteria.fromDate) && new Date(obj.created.split('T').shift().split("-").join("/")) <= new Date(reportVM.searchCriteria.toDate)));
            }
            if (reportVM.searchCriteria.category) {
                $scope.dataListConsolidatedReport = $scope.dataListConsolidatedReport.filter(obj => obj.program["0"].programType["0"].slug == reportVM.searchCriteria.category);
            }
            if (reportVM.searchCriteria.subMenu) {
                $scope.dataListConsolidatedReport = $scope.dataListConsolidatedReport.filter(obj => obj.program["0"].slug == reportVM.searchCriteria.subMenu);
            }
            if (reportVM.searchCriteria.subMenu1) {
                $scope.dataListConsolidatedReport = $scope.dataListConsolidatedReport.filter(obj =>
                    obj.programSubCategory[0].slug == reportVM.searchCriteria.subMenu1);
            }
            if (reportVM.searchCriteria.paymentType) {
                $scope.dataListConsolidatedReport = $scope.dataListConsolidatedReport.filter(obj => {
                    if (obj.isRecurring == undefined) obj.isRecurring = false;
                    return obj.isRecurring.toString() == reportVM.searchCriteria.paymentType
                });
            }
            if (reportVM.searchCriteria.country) {
                $scope.dataListConsolidatedReport = $scope.dataListConsolidatedReport.filter(obj => obj.donor[0].user[0].countryOfResidence == reportVM.searchCriteria.country)
            }

            $scope.amount.grandTotalUSD = _.sumBy($scope.dataListConsolidatedReport, (o) => o.donation.currencyTitle == 'USD' && o.amount);
            $scope.amount.grandTotalEUR = _.sumBy($scope.dataListConsolidatedReport, (o) => o.donation.currencyTitle == 'EUR' && o.amount);
            $scope.amount.grandTotalGBP = _.sumBy($scope.dataListConsolidatedReport, (o) => o.donation.currencyTitle == 'GBP' && o.amount);

            $scope.amount.meanUSD = $scope.dataListConsolidatedReport.length && $scope.amount.grandTotalUSD > 1 ? ($scope.amount.grandTotalUSD / $scope.dataListConsolidatedReport.length - 1) : $scope.amount.grandTotalUSD;
            $scope.amount.meanEUR = $scope.dataListConsolidatedReport.length && $scope.amount.grandTotalEUR > 1 ? ($scope.amount.grandTotalEUR / $scope.dataListConsolidatedReport.length - 1) : $scope.amount.grandTotalEUR;
            $scope.amount.meanGBP = $scope.dataListConsolidatedReport.length && $scope.amount.grandTotalGBP > 1 ? ($scope.amount.grandTotalGBP / $scope.dataListConsolidatedReport.length - 1) : $scope.amount.grandTotalGBP;

            $scope.amount.medianUSD = $scope.dataListConsolidatedReport.filter(obj => obj.donation.currencyTitle == 'USD').length > 0 ? median($scope.dataListConsolidatedReport.filter(obj => obj.donation.currencyTitle == 'USD')) : 0;
            $scope.amount.medianEUR = $scope.dataListConsolidatedReport.filter(obj => obj.donation.currencyTitle == 'EUR').length > 0 ? median($scope.dataListConsolidatedReport.filter(obj => obj.donation.currencyTitle == 'EUR')) : 0;
            $scope.amount.medianGBP = $scope.dataListConsolidatedReport.filter(obj => obj.donation.currencyTitle == 'GBP').length > 0 ? median($scope.dataListConsolidatedReport.filter(obj => obj.donation.currencyTitle == 'GBP')) : 0;


            $scope.amount.count = $scope.dataListConsolidatedReport.filter(obj => obj.count).reduce((total, num) => {
                return Number(total) + Number(num.count);
            }, 0)
            reportVM.toggler = true;
        }

        function generateOrder(fromMonth, toMonth, months, obj1, obj2) {
            var orderNo = 0;
            if (fromMonth > toMonth) {
                for (let i = fromMonth - 1; i < 12; i++) {
                    months ? months[i].status = true : '';
                    months ? months[i].orderNo = orderNo : '';
                    obj1 ? obj1[i].orderNo = orderNo : '';
                    obj2 ? obj2[i].orderNo = orderNo : '';
                    obj1 ? obj1[i].status = true : '';
                    orderNo++;
                }
                for (let i = 0; i < toMonth; i++) {
                    months ? months[i].status = true : '';
                    months ? months[i].orderNo = orderNo : '';
                    obj1 ? obj1[i].orderNo = orderNo : '';
                    obj2 ? obj2[i].orderNo = orderNo : '';
                    obj1 ? obj1[i].status = true : '';
                    orderNo++;
                }
            } else {
                for (let i = fromMonth - 1; i < toMonth; i++) {
                    months ? months[i].status = true : '';
                    months ? months[i].orderNo = orderNo : '';
                    obj1 ? obj1[i].orderNo = orderNo : '';
                    obj2 ? obj2[i].orderNo = orderNo : '';
                    obj1 ? obj1[i].status = true : '';
                    orderNo++;
                }
            }

            return months, obj1, obj2;
        }

        function createMonthListObj() {
            let obj = [{
                month: 'January',
                currency: {
                    USD: 0,
                    EUR: 0,
                    GBP: 0,
                },
                status: false
            }, {
                month: 'February',
                currency: {
                    USD: 0,
                    EUR: 0,
                    GBP: 0,
                },
                status: false
            }, {
                month: 'March',
                currency: {
                    USD: 0,
                    EUR: 0,
                    GBP: 0,
                },
                status: false
            }, {
                month: 'April',
                currency: {
                    USD: 0,
                    EUR: 0,
                    GBP: 0,
                },
                status: false
            }, {
                month: 'May',
                currency: {
                    USD: 0,
                    EUR: 0,
                    GBP: 0,
                },
                status: false
            }, {
                month: 'June',
                currency: {
                    USD: 0,
                    EUR: 0,
                    GBP: 0,
                },
                status: false
            }, {
                month: 'July',
                currency: {
                    USD: 0,
                    EUR: 0,
                    GBP: 0,
                },
                status: false
            }, {
                month: 'August',
                currency: {
                    USD: 0,
                    EUR: 0,
                    GBP: 0,
                },
                status: false
            }, {
                month: 'September',
                currency: {
                    USD: 0,
                    EUR: 0,
                    GBP: 0,
                },
                status: false
            }, {
                month: 'October',
                currency: {
                    USD: 0,
                    EUR: 0,
                    GBP: 0,
                },
                status: false
            }, {
                month: 'November',
                currency: {
                    USD: 0,
                    EUR: 0,
                    GBP: 0,
                },
                status: false
            }, {
                month: 'December',
                currency: {
                    USD: 0,
                    EUR: 0,
                    GBP: 0,
                },
                status: false
            }, {
                month: 'Total',
                currency: {
                    USD: 0,
                    EUR: 0,
                    GBP: 0,
                },
                status: true
            }];
            return obj;
        }

        function fillDonorDetails(list) {
            if (list) {
                reportVM.donorDetailsList = list;
            } else {
                reportVM.donorDetailsList = [];
            }
        }

        function reInitializeMonths(totalStatus) {
            reportVM.monthsList = [{
                month: 'January',
                currency: {
                    USD: 0,
                    EUR: 0,
                    GBP: 0,
                },
                status: false
            }, {
                month: 'February',
                currency: {
                    USD: 0,
                    EUR: 0,
                    GBP: 0,
                },
                status: false
            }, {
                month: 'March',
                currency: {
                    USD: 0,
                    EUR: 0,
                    GBP: 0,
                },
                status: false
            }, {
                month: 'April',
                currency: {
                    USD: 0,
                    EUR: 0,
                    GBP: 0,
                },
                status: false
            }, {
                month: 'May',
                currency: {
                    USD: 0,
                    EUR: 0,
                    GBP: 0,
                },
                status: false
            }, {
                month: 'June',
                currency: {
                    USD: 0,
                    EUR: 0,
                    GBP: 0,
                },
                status: false
            }, {
                month: 'July',
                currency: {
                    USD: 0,
                    EUR: 0,
                    GBP: 0,
                },
                status: false
            }, {
                month: 'August',
                currency: {
                    USD: 0,
                    EUR: 0,
                    GBP: 0,
                },
                status: false
            }, {
                month: 'September',
                currency: {
                    USD: 0,
                    EUR: 0,
                    GBP: 0,
                },
                status: false
            }, {
                month: 'October',
                currency: {
                    USD: 0,
                    EUR: 0,
                    GBP: 0,
                },
                status: false
            }, {
                month: 'November',
                currency: {
                    USD: 0,
                    EUR: 0,
                    GBP: 0,
                },
                status: false
            }, {
                month: 'December',
                currency: {
                    USD: 0,
                    EUR: 0,
                    GBP: 0,
                },
                status: false
            }, {
                month: 'Total',
                currency: {
                    USD: 0,
                    EUR: 0,
                    GBP: 0,
                },
                status: totalStatus
            }];
        }

        function filterProfileReport() {
            if (!reportVM.searchCriteria.toDate || !reportVM.searchCriteria.fromDate) {
                swal(
                    $translate.instant('Required!'),
                    $translate.instant('Please insert date first'),
                    'error'
                )
                return
            }
            reportVM.toggler = false;
            $scope.profileReport = [];
            $scope.finalizedDataReport = [];
            if (reportVM.searchCriteria.fromDate != null && reportVM.searchCriteria.toDate != null) {
                $scope.finalizedDataReport = reportVM.responseData.filter(obj => (new Date(obj.created.split('T').shift().split("-").join("/")) >= new Date(reportVM.searchCriteria.fromDate) && new Date(obj.created.split('T').shift().split("-").join("/")) <= new Date(reportVM.searchCriteria.toDate)));
                var total = $scope.finalizedDataReport.length;
            }
            $scope.finalizedDataReport = $scope.finalizedDataReport.filter(obj => {
                if (obj.user && obj.user.length && obj.user[0].language == reportVM.searchCriteria.language) {
                    return obj;
                } else if (!reportVM.searchCriteria.language) {
                    return obj
                }
            })
            $scope.finalizedDataReport = $scope.finalizedDataReport.filter(obj => {
                if (reportVM.searchCriteria.country && obj.user && obj.user.length && obj.user[0].countryOfResidence && obj.user[0].countryOfResidence == reportVM.searchCriteria.country) {
                    return obj;
                } else if (reportVM.searchCriteria.country && obj.user && obj.user.length && obj.user[0].countryOfResidence && obj.user[0].countryOfResidence != reportVM.searchCriteria.country && $scope.countryList.find(object => object._id == (obj.user[0].countryOfResidence).trim())) {
                    obj.user[0].countryOfResidence = $scope.countryList.find(object => object._id == (obj.user[0].countryOfResidence).trim()).name;
                    return obj;
                }
                else if (!reportVM.searchCriteria.country && obj.user && obj.user.length && obj.user[0].countryOfResidence) {
                    // obj.user[0].copy= $scope.countryList.find(object=> object._id == obj.user[0].countryOfResidence).name;    
                    return obj
                }
            })
            $scope.finalizedDataReport.map((obj) => {
                if ($scope.countryList.find(object => object._id == (obj.user[0].countryOfResidence).trim())) {
                    return obj.user[0].countryOfResidence = $scope.countryList.find(object => object._id == (obj.user[0].countryOfResidence).trim()).name;
                }
            })
            var result = Object.values($scope.finalizedDataReport.reduce((c, v) => {
                let k = v.user[0].countryOfResidence + '-' + v.user[0].language;
                c[k] = c[k] || [];
                c[k].push(v);
                return c;
            }, {}));
            let object = Object.assign({}, result);
            if (Object.keys(object).length) {
                for (const key in object) {
                    if (object.hasOwnProperty(key)) {
                        let obj = {
                            count: object[key].length,
                            country: object[key][0].user[0].countryOfResidence,
                            language: object[key][0].user[0].language,
                            percentage: (object[key].length * 100) / total
                        }
                        $scope.profileReport.push(obj)

                    }
                }
            }

            reportVM.toggler = true;
        }


        function hajjZiyarahReportList() {
            if (!reportVM.searchCriteria.toDate || !reportVM.searchCriteria.fromDate) {
                swal(
                    $translate.instant('Required!'),
                    $translate.instant('Please insert date first'),
                    'error'
                )
                return
            }
            reportVM.toggler = false;
            $scope.filterListHajjZiyarah = Object.assign([], $scope.dataListReports);
            $scope.filterListHajjZiyarah = $scope.filterListHajjZiyarah.filter(obj => obj.program[0].slug == 'hajj-and-ziyarah');
            if (reportVM.searchCriteria.fromDate && reportVM.searchCriteria.toDate) {
                $scope.filterListHajjZiyarah = $scope.filterListHajjZiyarah.filter(obj => (new Date(obj.created.split('T').shift().split("-").join("/")) >= new Date(reportVM.searchCriteria.fromDate) && new Date(obj.created.split('T').shift().split("-").join("/")) <= new Date(reportVM.searchCriteria.toDate)));
            }
            if (reportVM.searchCriteria.hajjZiyarah) {
                $scope.filterListHajjZiyarah = $scope.filterListHajjZiyarah.filter(obj => obj.programSubCategory[0].slug == reportVM.searchCriteria.hajjZiyarah.slug);
            }
            if (reportVM.searchCriteria.selectedOccasion) {
                $scope.filterListHajjZiyarah = $scope.filterListHajjZiyarah.filter(obj => obj.occasion && obj.occasion._id == reportVM.searchCriteria.selectedOccasion._id);
            }
            if (reportVM.searchCriteria.selectedDua) {
                $scope.filterListHajjZiyarah = $scope.filterListHajjZiyarah.filter(obj => obj.dua && obj.dua._id == reportVM.searchCriteria.selectedDua._id);
            }


            $scope.curencyTotal.dollar = _.sumBy($scope.filterListHajjZiyarah, function (o) {
                if (o.donation.currency != null && o.donation.currencyTitle == 'USD' && o.amount != null) {
                    return o.amount;
                }
            });
            $scope.curencyTotal.euro = _.sumBy($scope.filterListHajjZiyarah, function (o) {
                if (o.donation.currency != null && o.donation.currencyTitle == 'EUR' && o.amount != null) {
                    return o.amount;
                }
            });

            $scope.curencyTotal.pound = _.sumBy($scope.filterListHajjZiyarah, function (o) {
                if (o.donation.currency != null && o.donation.currencyTitle == 'GBP' && o.amount != null) {
                    return o.amount;
                }
            });
            reportVM.toggler = true;
        }


        /*Accounting Report*/

        function accountingReportList() {
            $scope.listAccounting = [];
            $scope.filterlistAccounting = [];
            angular.forEach(reportVM.responseData, function (value) {
                if (value.donationdetails.length >= 1) {
                    if (value.donationdetails[0].program[0].slug == 'hajj-and-ziyarah') {
                        $scope.listHajjZiyarah.push(value);
                    }
                }
            });
            if (reportVM.searchCriteria.hajjZiyarah == null && reportVM.searchCriteria.ocassion != null) {
                $scope.filterlistAccounting = $scope.listHajjZiyarah;
            }
            else {
                angular.forEach($scope.listAccounting, function (value) {

                    var filterItem = value;

                    if (reportVM.searchCriteria.hajjZiyarah != null) {

                        if (filterItem != null
                            ? !(filterItem.donationdetails[0].programSubCategory[0]._id == reportVM.searchCriteria.hajjZiyarah)
                            : !(value.donationdetails[0].programSubCategory[0]._id == reportVM.searchCriteria.hajjZiyarah)) {
                            filterItem = null;
                        }
                        else {
                            filterItem = value;
                        }
                    }
                    if (reportVM.searchCriteria.selectedOccasion != null) {
                        if (filterItem != null && filterItem.donationdetails[0].hasOwnProperty('occasion')) {
                            if (filterItem != null
                                ? !(filterItem.donationdetails[0].occasion._id == reportVM.searchCriteria.selectedOccasion)
                                : !(value.donationdetails[0].occasion._id == reportVM.searchCriteria.selectedOccasion)) {
                                filterItem = null;
                            }
                            else {
                                filterItem = value;
                            }
                        } else {
                            filterItem = null;
                        }
                    }
                    if (reportVM.searchCriteria.selectedDua != null) {

                        if (filterItem != null && filterItem.donationdetails[0].hasOwnProperty('dua')) {
                            if (filterItem != null
                                ? !(filterItem.donationdetails[0].dua._id == reportVM.searchCriteria.selectedDua)
                                : !(value.donationdetails[0].dua._id == reportVM.searchCriteria.selectedDua)) {
                                filterItem = null;
                            }
                            else {
                                filterItem = value;
                            }
                        }
                        else {
                            filterItem = null;
                        }
                    }
                    if (filterItem != null) {
                        $scope.filterlistAccounting.push(filterItem);
                    }
                });
            }

            var seen = {};
            $scope.curencyTotal.dollar = _.sumBy($scope.filterlistAccounting, function (o) {
                if (o.currency != null && o.currencyTitle == 'USD' && o.donationdetails[0] != null && o.donationdetails[0].amount != null) {
                    return o.donationdetails[0].amount;
                }
            });
            $scope.curencyTotal.euro = _.sumBy($scope.filterlistAccounting, function (o) {
                if (o.currency != null && o.currencyTitle == 'EUR' && o.donationdetails[0] != null && o.donationdetails[0].amount != null) {
                    return o.donationdetails[0].amount;
                }
            });

            $scope.curencyTotal.pound = _.sumBy($scope.filterlistAccounting, function (o) {
                if (o.currency != null && o.currencyTitle == 'GBP' && o.donationdetails[0] != null && o.donationdetails[0].amount != null) {
                    return o.donationdetails[0].amount;
                }
            });

        }

        function filterDonarDetailsReport() {
            $scope.dataListDonarWiseReport = [];
            angular.forEach(reportVM.responseData, function (value) {

                var filterItem = value;

                if (reportVM.searchCriteria.category != null) {
                    if (value.donationdetails.length > 0) {

                        if (!(filterItem.donationdetails[0].program[0].programType[0].slug == reportVM.searchCriteria.category)) {
                            filterItem = null;
                        }
                    }
                }
                if (reportVM.searchCriteria.subMenu != null) {
                    if (value.donationdetails.length > 0) {

                        if (value.donationdetails[0].program.length > 0) {
                            if (filterItem != null
                                ? !(filterItem.donationdetails[0].program[0]._id == reportVM.searchCriteria.subMenu)
                                : !(value.donationdetails[0].program[0]._id == reportVM.searchCriteria.subMenu)) {
                                filterItem = null;
                            }
                            else {
                                filterItem = value;
                            }
                        }
                    }
                }
                if (reportVM.searchCriteria.subMenu1 != null) {
                    if (value.donationdetails.length > 0) {
                        if (value.donationdetails[0].programSubCategory.length > 0) {
                            if (filterItem != null
                                ? !(filterItem.donationdetails[0].programSubCategory[0]._id == reportVM.searchCriteria.subMenu1)
                                : !(value.donationdetails[0].programSubCategory[0]._id == reportVM.searchCriteria.subMenu1)) {
                                filterItem = null;
                            }
                            else {
                                filterItem = value;
                            }
                        }
                    }
                }

                if (reportVM.searchCriteria.paymentType != null) {
                    if (value.donationdetails.length > 0) {
                        if (filterItem != null
                            ? !(filterItem.donationdetails[0].program[0].donationProcess[0].isRecurring == reportVM.searchCriteria.paymentType)
                            : !(value.donationdetails[0].program[0].donationProcess[0].isRecurring == reportVM.searchCriteria.paymentType)) {
                            filterItem = null;
                        }
                        else {
                            filterItem = value;
                        }
                    }
                }

                if (reportVM.searchCriteria.amountX != null && reportVM.searchCriteria.amountY != null) {

                    if (value.donationdetails.length > 0) {

                        if (filterItem != null
                            ? !(filterItem.donationdetails[0].amount >= reportVM.searchCriteria.amountX && filterItem.donationdetails[0].amount <= reportVM.searchCriteria.amountY)
                            : !(value.donationdetails[0].amount >= reportVM.searchCriteria.amountX && value.donationdetails[0].amount <= reportVM.searchCriteria.amountY)) {
                            filterItem = null;
                        }
                        else {
                            filterItem = value;
                        }
                    }
                }

                if (reportVM.searchCriteria.category == undefined && reportVM.searchCriteria.fromDate != null && reportVM.searchCriteria.toDate != null) {

                    if (filterItem != null
                        ? !(new Date(filterItem.created.split('T').shift().split("-").join("/")) >= new Date(reportVM.searchCriteria.fromDate) && new Date(filterItem.created.split('T').shift().split("-").join("/")) <= new Date(reportVM.searchCriteria.toDate))
                        : !(new Date(value.created.split('T').shift().split("-").join("/")) >= new Date(reportVM.searchCriteria.fromDate) && new Date(value.created.split('T').shift().split("-").join("/")) <= new Date(reportVM.searchCriteria.toDate))) {
                        filterItem = null;
                    }
                    else {
                        filterItem = value;
                    }

                }

                if (reportVM.searchCriteria.searchField != undefined && reportVM.searchCriteria.searchField != null
                    && reportVM.searchCriteria.searchField != "") {

                    if (filterItem != null
                        ? !(filterItem.donor[0].donarName.indexOf(reportVM.searchCriteria.searchField) >= 0 || filterItem.donor[0].email.indexOf(reportVM.searchCriteria.searchField) >= 0 || filterItem.donor[0].mobile.indexOf(reportVM.searchCriteria.searchField) >= 0)
                        : !(value.donor[0].donarName.indexOf(reportVM.searchCriteria.searchField) >= 0 || value.donor[0].email.indexOf(reportVM.searchCriteria.searchField) >= 0 || value.donor[0].mobile.indexOf(reportVM.searchCriteria.searchField) >= 0)) {
                        filterItem = null;
                    }
                    else {
                        filterItem = value;
                    }

                }


                if (filterItem != null) {
                    $scope.dataListDonarWiseReport.push(filterItem);
                }

            });


        }


        function resetForm() {
            if (reportVM.searchCriteria.type != reportVM.projectionSelection) {
                reportVM.projectionReport = [];
            }
            reportVM.searchCriteria = {};
            reportVM.dataList = [];
            reportVM.donationList = [];
            $scope.finalizedDataReport = [];
            $scope.dataListDonarWiseReport = [];
            reInitializeMonths(false);
            $scope.filterListHajjZiyarah = [];
            $scope.filterlistAccounting = [];
            reportVM.searchCriteria.type = reportVM.projectionSelection;

        }

        jQuery("#txtFromDate").datepicker({
            minDate: 0,
            maxDate: (!reportVM.searchCriteria.toDate) ? 'today' : reportVM.searchCriteria.toDate,
            autoclose: true
        });
        jQuery("#txtToDate").datepicker({
            minDate: (!reportVM.searchCriteria.fromDate) ? 0 : reportVM.searchCriteria.fromDate,
            maxDate: 0,
            autoclose: true
        });

        $scope.checkStartDate = function (startDate) {
            var date1 = new Date(startDate);
            var date2 = new Date();
            date2.setHours(0, 0, 0, 0);
            if (date1 < date2) {
                reportVM.searchCriteria.startDate = null;
                jQuery("#txtToDate").val('');
                swal(
                    'Failed!',
                    'Invalid Date for Campaign',
                    'error'
                )
            }
        }

        //For Add/Update Sadaqah Form
        $scope.startDateChange = function () {
            // jQuery("#txtToDate").datepicker("remove");
            // jQuery("#txtToDate").val('');
            //getting end date after 12months from selected date
            // var endFullDate = new Date(reportVM.searchCriteria.fromDate).setMonth(new Date(reportVM.searchCriteria.fromDate).getMonth() + 12);
            // var endMonth = new Date(endFullDate).getMonth();
            // var endYear = new Date(endFullDate).getFullYear();
            jQuery("#txtToDate").datepicker({
                autoclose: true,
                startDate: new Date(reportVM.searchCriteria.fromDate),
                // endDate: new Date(endYear, endMonth, 0)
            });
        }
        $scope.setPosFromDate = function () {
            var position = jQuery("#txtFromDate").offset().top;
            angular.element(jQuery('.datepicker-dropdown')[0]).css({ top: "" + (position) + "px" });
        }
        $scope.setPosToDate = function () {
            var position = jQuery("#txtToDate").offset().top;
            angular.element(jQuery('.datepicker-dropdown')[0]).css({ top: "" + (position) + "px" });
            jQuery("#txtFromDate").datepicker({
                autoclose: true,
                // startDate: new Date(reportVM.searchCriteria.fromDate),
                endDate: new Date(reportVM.searchCriteria.toDate)
            });
        }


        $scope.exportData = function (id, type) {
            $('#' + id).tableExport({ type: type, escape: 'false' });
        }

        // Export to Excel only
        $scope.exportToExcel = function (name, id) {
            //getting data from our table
            var data_type = 'data:application/vnd.ms-excel';
            var table_div = document.getElementById(id);
            var table_html = table_div.outerHTML.replace(/ /g, '%20');

            var a = document.createElement('a');
            a.href = data_type + ', ' + table_html;
            a.download = name + "_" + reportVM.dateToday + ".xls"
            a.click();
        }

        // Export to PDF only
        $scope.exportToPDF = function (name, fontSize, orientation) {
            const pdfDoc = new jsPDF(orientation, 'pt');

            //header table
            var data2 = pdfDoc.autoTableHtmlToJson(document.getElementById('exportTableHeader'));
            pdfDoc.autoTable(data2.columns, data2.rows, {
                margin: { top: 20, left: 20, right: 20, bottom: 0 },
                showHeader: 'firstPage',
                tableLineWidth: 0,
                bodyStyles: { rowHeight: 30 },
                drawCell: function (cell, opts) {
                },
                styles: {
                    fontSize: 10,
                    valign: 'top',
                    overflow: 'linebreak',
                    columnWidth: 'auto',
                    cellPadding: 2,
                    rowHeight: 10
                },
            });

            //records table
            if (document.getElementById('exportTable')) {
                var data = pdfDoc.autoTableHtmlToJson(document.getElementById('exportTable'));
                pdfDoc.autoTable(data.columns, data.rows, {
                    startY: pdfDoc.autoTableEndPosY() + 5,
                    margin: { top: 10, left: 20, right: 20, bottom: 0 },
                    tableLineWidth: 0.5,
                    bodyStyles: { rowHeight: 30 },
                    drawCell: function (cell, opts) {
                    },
                    styles: {
                        fontSize: fontSize,
                        valign: 'top',
                        overflow: 'linebreak',
                        columnWidth: 'auto',
                        cellPadding: 2,
                        rowHeight: 10,
                        lineWidth: 0.5,
                    },
                });
            }

            //records table 1
            if (document.getElementById('exportTable1')) {
                var data = pdfDoc.autoTableHtmlToJson(document.getElementById('exportTable1'));
                pdfDoc.autoTable(data.columns, data.rows, {
                    startY: pdfDoc.autoTableEndPosY() + 5,
                    margin: { top: 10, left: 20, right: 20, bottom: 0 },
                    tableLineWidth: 0.5,
                    bodyStyles: { rowHeight: 30 },
                    drawCell: function (cell, opts) {
                    },
                    styles: {
                        fontSize: fontSize,
                        valign: 'top',
                        overflow: 'linebreak',
                        columnWidth: 'auto',
                        cellPadding: 2,
                        rowHeight: 10,
                        lineWidth: 0.5,
                    },
                });
            }

            //records table 2
            if (document.getElementById('exportTable2')) {
                var data = pdfDoc.autoTableHtmlToJson(document.getElementById('exportTable2'));
                pdfDoc.autoTable(data.columns, data.rows, {
                    startY: pdfDoc.autoTableEndPosY() + 5,
                    margin: { top: 10, left: 20, right: 20, bottom: 0 },
                    tableLineWidth: 0.5,
                    bodyStyles: { rowHeight: 30 },
                    drawCell: function (cell, opts) {
                    },
                    styles: {
                        fontSize: fontSize,
                        valign: 'top',
                        overflow: 'linebreak',
                        columnWidth: 'auto',
                        cellPadding: 2,
                        rowHeight: 10,
                        lineWidth: 0.5,
                    },
                });
            }
            pdfDoc.save(name + "_" + reportVM.dateToday + ".pdf");
        }

        function printDiv(divName) {
            var innerContents = document.getElementById(divName).innerHTML;
            var popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
            popupWinindow.document.open();
            popupWinindow.document.write('<html><head><link rel="stylesheet" type="text/css" href="style.css" /></head><body onload="window.print()">' + innerContents + '</html>');
            popupWinindow.document.close();
        }

        $scope.printReceipt = function () {

            var innerContents = document.getElementById("innerReceiptModal").innerHTML;

        }

        function getKhumsSubCategoryList() {

            if (localStorage.getItem('lang') == 'ARB') {
                $scope.programName = "الخمس";
            } else if (localStorage.getItem('lang') == 'FRN') {
                $scope.programName = "Khums";
            } else {
                $scope.programName = "Khums";
            }

            if ($scope.programName) {
                programService.getProgramByProgramName($scope.programName).then(function (res) {
                    reportVM.programSubCategoryList = res.data[0].programSubCategory;
                });
            }
        }


        /********************* Sponsorship Renewal Report Work **************************************/

        function getSponsorshipRenewalReport() {
            getOrphanReport();
            getStudentReport();
            $scope.filteredStudentsAndOrphans = [];
            // angular.forEach(reportVM.orphansList, function (orphan) {
            // });
        }

        function getOrphanReport() {
            reportsService.getOrphanScholarship().then(function (res) {
                reportVM.orphansList = res.data;
                settingOrphanDataInList();
            });
        }

        function settingOrphanDataInList() {
            angular.forEach(reportVM.orphansList, function (orphan) {
                if (orphan.donationdetails != undefined && orphan.donationdetails.length > 0) {
                    setOrphanData(orphan);
                }
            });
        }

        function setOrphanData(orphan) {

            if (orphan.orphans != undefined && orphan.orphans.length > 0 &&
                orphan.donationdetails != undefined && orphan.donationdetails.length > 0 &&
                orphan.donar != undefined && orphan.donar.length > 0 &&
                orphan.created != undefined && orphan.created != null &&
                orphan.endDate != undefined && orphan.endDate != null
                && orphan.donationdetails[0].donation != undefined
                && orphan.donationdetails[0].donation.currency != undefined
                && orphan.donationdetails[0].donation.currency != null
            ) {

                $scope.orphanScholarshipData = {};
                $scope.orphanScholarshipData.studentId = orphan.orphans[0].orphanId;
                $scope.orphanScholarshipData.startDate = orphan.startDate;
                $scope.orphanScholarshipData.created = orphan.created;
                $scope.orphanScholarshipData.endDate = orphan.endDate;
                $scope.orphanScholarshipData.commitmentDate = orphan.paymentDate;
                $scope.orphanScholarshipData.orphanName = orphan.orphans[0].orphanName;
                $scope.orphanScholarshipData.gender = orphan.orphans[0].gender;
                $scope.orphanScholarshipData.decent = (orphan.orphans[0].isSyed) ? "Syed" : "Non-Syed";
                $scope.orphanScholarshipData.dob = orphan.orphans[0].dateOfBirth;
                $scope.orphanScholarshipData.donarName = orphan.donar[0].donarName;
                $scope.orphanScholarshipData.donarEmail = orphan.donar[0].email;
                $scope.orphanScholarshipData.amount = orphan.sponsorshipAmount;
                $scope.orphanScholarshipData.paymentType = orphan.donationdetails[0].isRecurring;
                $scope.orphanScholarshipData.isOrphan = true;
                $scope.orphanScholarshipData.donarId = "--";
                $scope.orphanScholarshipData.currency = orphan.donationdetails[0].donation.currency;
                $scope.orphanScholarshipData.currencyTitle = orphan.donationdetails[0].donation.currencyTitle;

                $scope.filteredStudentsAndOrphans.push($scope.orphanScholarshipData);
            }

        }

        function getStudentReport() {
            reportsService.getStudentSponsorhsip().then(function (res) {
                reportVM.studentList = res.data;
                settingStudentDataInList();
            });
        }

        function settingStudentDataInList() {
            angular.forEach(reportVM.studentList, function (student) {
                if (student.donationdetails != undefined && student.donationdetails.length > 0) {
                    setStudentData(student);
                }
            });
        }

        function setStudentData(student) {

            if (student.students != undefined && student.students.length > 0 &&
                student.donationdetails != undefined && student.donationdetails.length > 0 &&
                student.donar != undefined && student.donar.length > 0 &&
                student.created != undefined && student.created != null &&
                student.endDate != undefined && student.endDate != null
                && student.donationdetails[0].donation != undefined
                && student.donationdetails[0].donation.currency != undefined
                && student.donationdetails[0].donation.currency
            ) {

                $scope.orphanScholarshipData = {};
                $scope.orphanScholarshipData.studentId = "--";
                $scope.orphanScholarshipData.startDate = student.startDate;
                $scope.orphanScholarshipData.endDate = student.endDate;
                $scope.orphanScholarshipData.created = student.created;
                $scope.orphanScholarshipData.commitmentDate = student.paymentDate;
                $scope.orphanScholarshipData.orphanName = student.students[0].studentName;
                $scope.orphanScholarshipData.gender = student.students[0].gender;
                $scope.orphanScholarshipData.decent = (student.students[0].isSyed) ? "Syed" : "Non-Syed";
                $scope.orphanScholarshipData.dob = student.students[0].dateOfBirth;
                $scope.orphanScholarshipData.donarName = student.donar[0].donarName;
                $scope.orphanScholarshipData.donarEmail = student.donar[0].email;
                $scope.orphanScholarshipData.amount = student.sponsorshipAmount;
                $scope.orphanScholarshipData.studentId = student.students[0].studentId;
                $scope.orphanScholarshipData.paymentType = student.donationdetails[0].isRecurring;
                $scope.orphanScholarshipData.donarId = "--";
                $scope.orphanScholarshipData.currency = student.donationdetails[0].donation.currency;
                $scope.orphanScholarshipData.currencyTitle = student.donationdetails[0].donation.currencyTitle;

                $scope.filteredStudentsAndOrphans.push($scope.orphanScholarshipData);
            }

        }

        function convertDate(inputFormat) {
            function pad(s) {
                return (s < 10) ? '0' + s : s;
            }

            var d = new Date(inputFormat);
            return [pad(d.getMonth() + 1), pad(d.getDate()), d.getFullYear()].join('/');
        }


        function filterSponsorshipReport() {
            if (!reportVM.searchCriteria.toDate || !reportVM.searchCriteria.fromDate) {
                swal(
                    $translate.instant('Required!'),
                    $translate.instant('Please insert date first'),
                    'error'
                )
                return
            }
            reportVM.toggler = false;
            $scope.decentSummarize = {};
            $scope.curencyTotal = {};

            if (reportVM.searchCriteria.fromDate && reportVM.searchCriteria.toDate) {

                $scope.dataListSponsorReport = $scope.filteredStudentsAndOrphans.filter(obj => new Date(obj.created.split('T').shift().split("-").join("/")) >= new Date(reportVM.searchCriteria.fromDate) && new Date(obj.created.split('T').shift().split("-").join("/")) <= new Date(reportVM.searchCriteria.toDate))
                $scope.dataListSponsorReport.map(obj => {
                    if (obj.dob != "--") {
                        let dobDate = new Date(obj.dob).getDate();
                        let dobMonth = new Date(obj.dob).getMonth() + 1;
                        let dobYear = new Date(obj.dob).getFullYear();

                        obj.birthdate = `${dobDate} - ${dobMonth} - ${dobYear}`
                    } else {
                        obj.birthdate = obj.dob;
                    }

                    if (obj.startDate && obj.startDate.indexOf("NaN") < 0) {
                        let startDate = new Date(obj.startDate).getDate();
                        let startMonth = new Date(obj.startDate).getMonth() + 1;
                        let startYear = new Date(obj.startDate).getFullYear();

                        obj.programStartDate = `${startDate} - ${startMonth} - ${startYear}`
                    } else {
                        obj.programStartDate = "--"
                    }

                    if (obj.endDate && obj.endDate.indexOf("NaN") < 0) {
                        let endDate = new Date(obj.endDate).getDate();
                        let endMonth = new Date(obj.endDate).getMonth() + 1;
                        let endYear = new Date(obj.endDate).getFullYear();

                        obj.programEndDate = `${endDate} - ${endMonth} - ${endYear}`
                    }
                    else {
                        obj.programEndDate = "--"
                    }
                    if (obj.commitmentDate && obj.commitmentDate.toString().indexOf("NaN") < 0) {
                        if (new Date(obj.commitmentDate) == 'Invalid Date') {
                            obj.commitmentDate = Number(obj.commitmentDate);
                        }
                        let commitmentDate = new Date(obj.commitmentDate).getDate();
                        let commitmentMonth = new Date(obj.commitmentDate).getMonth() + 1;
                        let commitmentYear = new Date(obj.commitmentDate).getFullYear();

                        obj.commitmentDueDate = `${commitmentDate} - ${commitmentMonth} - ${commitmentYear}`
                    } else {
                        obj.commitmentDueDate = "--"
                    }
                    return obj;

                })

                if (reportVM.searchCriteria.paymentType == "true" || reportVM.searchCriteria.paymentType == "false") {
                    $scope.dataListSponsorReport = $scope.dataListSponsorReport.filter(obj => obj.paymentType.toString() == reportVM.searchCriteria.paymentType);
                }
                if (reportVM.searchCriteria.typeSearchField) {
                    $scope.dataListSponsorReport = $scope.dataListSponsorReport.filter(obj => obj.studentId == reportVM.searchCriteria.typeSearchField);
                }
                if (reportVM.searchCriteria.donorSearchField) {
                    let donorName = reportVM.searchCriteria.donorSearchField;
                    const regexp = new RegExp(donorName, 'i');
                    $scope.dataListSponsorReport = $scope.dataListSponsorReport.filter(obj => regexp.test(obj.donarName))
                }
            }


            if ($scope.dataListSponsorReport && $scope.dataListSponsorReport.length) {
                $scope.decentSummarize.nonSyedMale = $scope.dataListSponsorReport.filter(obj => obj.decent && obj.decent.toLowerCase() == 'non-syed' && obj.gender && obj.gender.toLowerCase() == 'male').length;
                $scope.decentSummarize.nonSyedFemale = $scope.dataListSponsorReport.filter(obj => obj.decent && obj.decent.toLowerCase() == 'non-syed' && obj.gender && obj.gender.toLowerCase() == 'female').length;
                $scope.decentSummarize.syedMale = $scope.dataListSponsorReport.filter(obj => obj.decent && obj.decent.toLowerCase() == 'syed' && obj.gender && obj.gender.toLowerCase() == 'male').length;
                $scope.decentSummarize.syedFemale = $scope.dataListSponsorReport.filter(obj => obj.decent && obj.decent.toLowerCase() == 'syed' && obj.gender && obj.gender.toLowerCase() == 'female').length;

                let totalInUSD = $scope.dataListSponsorReport.filter(obj => obj.currencyTitle == 'USD');
                let totalInEUR = $scope.dataListSponsorReport.filter(obj => obj.currencyTitle == 'EUR');
                let totalInGBP = $scope.dataListSponsorReport.filter(obj => obj.currencyTitle == 'GBP');

                $scope.curencyTotal.dollar = total(totalInUSD)
                $scope.curencyTotal.euro = total(totalInEUR)
                $scope.curencyTotal.pound = total(totalInGBP)
            }
            reportVM.toggler = true

        }
        function total(array) {
            return array.reduce((total, num) => {
                return Number(total) + Number(num.amount);
            }, 0)
        }
        function convertToUTF8(rows) {
            // for (let i = 0; i < rows.length; i++) {
            //     const childNodes = rows[i];
            //     if (childNodes && childNodes.length) {
            //         for (let j = 0; j < childNodes.length; j++) {
            //             if (childNodes[j] && childNodes[j].childNodes) {
            //                 for(let k=0; k<childNodes[j].childNodes.length; k++) {
            //                     if(childNodes[j].childNodes[k]) {
            //                         childNodes[j].childNodes[k] = encode_utf8(`${childNodes[j].childNodes[k]}`);
            //                         console.log("after encode", childNodes[j].childNodes[k]);
            //                         childNodes[j].childNodes[k] = decode_utf8(`${childNodes[j].childNodes[k]}`);
            //                         console.log("after decode", childNodes[j].childNodes[k]);
            //                     }

            //                 }
            //             }
            //         }
            //     }
            // }
            return rows;
        }
        // Export to Excel only
        $scope.exportToExcel = function (name, id) {
            //getting data from our table
            var data_type = 'data:application/vnd.ms-excel';
            var table_div = document.getElementById(id);
            var table_html = table_div.outerHTML.replace(/ /g, '%20');

            var a = document.createElement('a');
            a.href = data_type + ', ' + table_html;
            a.download = name + "_" + $scope.dateToday + ".xls"
            a.click();
        }

        // Export to PDF only
        $scope.exportToPDF = function (name, fontSize, orientation) {
            var doc = new jsPDF(orientation, 'pt');

            //header table
            var data2 = doc.autoTableHtmlToJson(document.getElementById('exportTableHeader'));
            doc.autoTable(data2.columns, data2.rows, {
                margin: { top: 20, left: 20, right: 20, bottom: 0 },
                showHeader: 'firstPage',
                tableLineWidth: 0,
                bodyStyles: { rowHeight: 30 },
                drawCell: function (cell, opts) {
                },
                styles: {
                    fontSize: 10,
                    valign: 'top',
                    overflow: 'linebreak',
                    columnWidth: 'auto',
                    cellPadding: 2,
                    rowHeight: 10
                },
            });

            //records table
            if (document.getElementById('exportTable')) {
                var data = doc.autoTableHtmlToJson(document.getElementById('exportTable'));
                doc.autoTable(data.columns, convertToUTF8(data.rows), {
                    startY: doc.autoTableEndPosY() + 5,
                    margin: { top: 10, left: 20, right: 20, bottom: 0 },
                    tableLineWidth: 0.5,
                    bodyStyles: { rowHeight: 30 },
                    drawCell: function (cell, opts) {
                        if (cell && cell.text && cell.text.length) {
                            cell.text = cell.text.map(t => encode_utf8(t));
                        }
                        return cell;
                    },
                    styles: {
                        fontSize: fontSize,
                        valign: 'top',
                        overflow: 'linebreak',
                        columnWidth: 'auto',
                        cellPadding: 2,
                        rowHeight: 10,
                        lineWidth: 0.5,
                    },
                });
            }

            doc.save(name + "_" + $scope.dateToday + ".pdf");
        }

    }
})()