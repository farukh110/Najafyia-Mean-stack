(function () {

    angular.module('mainApp').controller('projectionReportController', projectionReportController);

    function projectionReportController($scope, $translate, $state, $location, $window, reportsService, programTypeService) {
        var projReportVM = this;
        projReportVM.monthsList = [];
        projReportVM.getMonthsArray = getMonthsArray;
        projReportVM.searchCriteria = {};
        projReportVM.getRecurringProgramTypes = getRecurringProgramTypes;
        projReportVM.getRecurringDonations = getRecurringDonations;
        projReportVM.getRecurringProgramList = getRecurringProgramList;
        projReportVM.getProgramSubCategoryList = getProgramSubCategoryList;
        projReportVM.showProjectionReport = showProjectionReport;


        projReportVM.months = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"];

        function getRecurringProgramList(typeId) {
            if (typeId) {
                programService.getProgramByTypeId(typeId).then(function (res) {
                    projReportVM.programList = _.filter(res.data, function (item) {
                        if (item.donationProcess.length > 0 && item.donationProcess[0].isRecurring) {
                            return item;
                        }
                    });
                    projReportVM.programSubCategoryList = [];
                });
            }
        }
        function getRecurringProgramTypes() {
            programTypeService.getProgramTypes().then(function (res) {
                projReportVM.recurringProgramTypesList = _.filter(res.data, function (item) {
                    if ((item.programTypeName.toUpperCase() != 'RELIGIOUS PAYMENTS')) {
                        return item;
                    }
                })
            });
        }
        function getProgramSubCategoryList(programId) {
            if (programId) {
                programService.getProgramById(programId).then(function (res) {
                    projReportVM.programSubCategoryList = res.data[0].programSubCategory;
                });
            }
        }
        function getRecurringDonations() {
            reportsService.getRecurringDonations().then(function (res) {
                projReportVM.responseData = res.data.reverse();
            })
        }
        function monthDiff(d1, d2) {
            var months;
            months = (d2.getFullYear() - d1.getFullYear()) * 12;
            months -= d1.getMonth() + 1;
            months += d2.getMonth();
            return months <= 0 ? 0 : months;
        }
        function getMonthByNumber(number) {
            if (number > 12) {
                number = number % 12;
            }
            return number - 1;
        }
        function getMonthsArray(fromDate, toDate) {
            const months = monthDiff(fromDate, toDate);
            for (let i = 1; i <= months; i++) {
                projReportVM.monthsList.push({
                    month: projReportVM.months[getMonthByNumber(i)],
                    currency: ["USD", "GBP", "EUR"],
                })
            }
            return projReportVM.monthsList;
        }
        function showProjectionReport() {
            projReportVM.toggler = false;
            projReportVM.projectionReport = [];
            $scope.selectedMonths = [];
            reportsService.getProjectionReport(projReportVM.searchCriteria).then(function (res) {
                projReportVM.projectionReport = res.data.data;
                if (projReportVM.projectionReport && projReportVM.projectionReport.length && projReportVM.searchCriteria.category && !projReportVM.searchCriteria.subMenu) {
                    projReportVM.projectionReport = projReportVM.projectionReport.filter(obj => obj.program && obj.program.length && obj.program[0].programType && obj.program[0].programType.length && obj.program[0].programType[0].slug == projReportVM.searchCriteria.category)
                }
                if (projReportVM.projectionReport && projReportVM.projectionReport.length && projReportVM.searchCriteria.category && projReportVM.searchCriteria.subMenu) {
                    projReportVM.projectionReport = projReportVM.projectionReport.filter(obj => obj.program && obj.program.length && obj.program[0].slug == projReportVM.searchCriteria.subMenu)
                }
                if (res && res.data && res.data.endDate && res.data.startDate) {
                    let startDate = `${months[new Date(res.data.startDate).getMonth()]} ${new Date(res.data.startDate).getFullYear()}`
                    let endDate = `${months[new Date(res.data.endDate).getMonth()]} ${new Date(res.data.endDate).getFullYear()}`
                    $scope.selectedMonths = monthDiff(startDate, endDate);
                }

                projReportVM.toggler = true;
            });
        }
    }
})();