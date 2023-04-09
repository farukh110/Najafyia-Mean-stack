(function () {

    angular.module('mainApp').controller('donarDashboardController', DonarDashboardController);

    function DonarDashboardController($scope, $translate, $rootScope, $state, $location, $window, manageOrphanService, manageStudentService, multipartForm, donarDashboardService, ziyaratService, suggestedDonationsService, programTypeService, projectService, loginService, cartService) {

        var donarVM = this;
        donarVM.details = null;
        donarVM.recordsLimit = 8;
        donarVM.registeredForZiyarat = false;
        donarVM.programTypesList = [];
        donarVM.userDonationsList = [];
        donarVM.suggestedDonationsList = [];
        donarVM.generalCareSponsorshipList = [];
        donarVM.DAZSchoolList = [];
        donarVM.studentDetails = {};
        donarVM.orphanSponsorshipList = [];
        donarVM.orphanDetails = {};
        donarVM.khumsList = [];
        donarVM.expiringSponsorshipList = [];
        donarVM.renewalsList = [];
        donarVM.imegeURL = null;
        donarVM.file = {};
        donarVM.donationCounters = {
            renewals: 0,
            recurring: 0,
            generalCare: 0,
            dazSchool: 0,
            otherPayments: 0
        };
        donarVM.donationDurations = [];
        donarVM.totalAmount = 0;

        donarVM.getProgramTypes = getProgramTypes;
        donarVM.getUserDetails = getUserDetails;
        donarVM.getUserDonations = getUserDonations;
        donarVM.getDAZSchoolDonations = getDAZSchoolDonations;
        donarVM.getUserGeneralCareDonations = getUserGeneralCareDonations;
        donarVM.getSuggestedDonationsList = getSuggestedDonationsList;
        donarVM.donateNow = donateNow;
        donarVM.getStudentDetails = getStudentDetails;
        donarVM.getOrphanDetails = getOrphanDetails;
        donarVM.getExpiringSponsorships = getExpiringSponsorships;
        donarVM.addRenewals = addRenewals;
        donarVM.setEndDate = setEndDate;
        donarVM.renewSponsorships = renewSponsorships;
        donarVM.getUserRecurringDonations = getUserRecurringDonations;
        donarVM.updateProfile = updateProfile;
        donarVM.resetForm = resetForm;
        donarVM.loadMore = loadMore;
        donarVM.openPDF = openPDF;
        donarVM.getTheCountforDonation = getTheCountforDonation;
        donarVM.userLanguage = localStorage.getItem('lang') || 'ENG';
        donarVM.tabVisibilityControl = tabVisibilityControl;
        $scope.age = function (birthday) {
            if (birthday) {
                let bday = new Date(birthday);
                var ageDifMs = Date.now() - bday.getTime();
                var ageDate = new Date(ageDifMs);
                return Math.abs(ageDate.getUTCFullYear() - 1970);
            }
        }
        $scope.setStatus = function (item) {
            if (item.isChanged) return 'INACTIVE';
            if (!item.isActive) return 'INACTIVE';
            if (item.freezed) return 'INACTIVE';
            else return 'ACTIVE'
        }
        function openPDF(pdf) {
            if (!pdf) {
                return swal(
                    $translate.instant('Document not linked!'),
                    $translate.instant('Nothing to view'),
                    'error'
                )
            }
            window.open('uploads/' + pdf);
            return false;
        }
        function getProgramTypes() {
            programTypeService.getProgramTypes().then(function (res) {
                donarVM.programTypesList = res.data;
            });
        }

        function getUserDetails() {
            loginService.getLoggedInUserDetails().then(function (res) {
                donarVM.details = res;
            });
        }
        function sumDdAutoRenew(donation) {
            if (donation.autoRenew) return false;
            if (donation && donation.donationdetails && donation.donationdetails.length) {
                donation.donationdetails.forEach(dd => {
                    if (dd.autoRenew) {
                        donation.autoRenew = dd.autoRenew;
                        // if(donation.amount) {
                        //     donation.amount = donation.amount + dd.amount;
                        // } else 
                        // donation.totalAmount = donation.totalAmount + dd.amount;
                    }
                });
                return donation;
            }
        }
        function getTheCountforDonation() {
            donarDashboardService.getCountForTotalDonation().then(function (res) {
                if (res.status == 200 && res.data) {
                    let usdTotal = res.data.usdTotal[0] || {};
                    let gbpTotal = res.data.gbpTotal[0] || {};
                    let eurTotal = res.data.eurTotal[0] || {};
                    // AutoRenew Amounts
                    donarVM.totalOfAutoRenewUSD = usdTotal.totalRenewalAmount || 0;
                    donarVM.totalOfAutoRenewEUR = eurTotal.totalRenewalAmount || 0;
                    donarVM.totalOfAutoRenewGBP = gbpTotal.totalRenewalAmount || 0;
                    // Recurring Amounts
                    donarVM.totalOfRecurringUSD = usdTotal.totalRecurringAmount || 0;
                    donarVM.totalOfRecurringEUR = eurTotal.totalRecurringAmount || 0;
                    donarVM.totalOfRecurringGBP = gbpTotal.totalRecurringAmount || 0;
                    // Orphan Amounts
                    donarVM.totalOfOrphanUSD = usdTotal.totalOrphanAmount || 0;
                    donarVM.totalOfOrphanEUR = eurTotal.totalOrphanAmount || 0;
                    donarVM.totalOfOrphanGBP = gbpTotal.totalOrphanAmount || 0;
                    // Daz Amounts
                    donarVM.totalOfDazUSD = usdTotal.totalDAZAmount || 0;
                    donarVM.totalOfDazEUR = eurTotal.totalDAZAmount || 0;
                    donarVM.totalOfDazGBP = gbpTotal.totalDAZAmount || 0;
                    // Total Amounts
                    donarVM.totalOfdonationUSD = usdTotal.totalDonationAmount || 0;
                    donarVM.totalOfdonationEUR = eurTotal.totalDonationAmount || 0;
                    donarVM.totalOfdonationGBP = gbpTotal.totalDonationAmount || 0;
                }
            });
        }

        function total(array) {
            return array.reduce((total, num) => {
                return Number(total) + Number(num.amount || num.totalAmount);
            }, 0)
        }

        donarVM.filteredDonations = function (filterBY) {
            donarVM.recordsLimit = 8;
            if (!filterBY) return donarVM.userDonationsList = donarVM.filterOption;
            donarVM.userDonationsList = donarVM.filterOption.filter(obj => obj.program && obj.program.length && obj.program[0].programName == filterBY)
        }
        function getUserRecurringDonations() {
            donarDashboardService.getUserRecurringDonations().then(function (res) {
                if (res.data && res.data.length) {
                    donarVM.recurringList = res.data;
                    if (donarVM.recurringList && donarVM.recurringList.length) {
                        donarVM.recurringList = donarVM.recurringList.sort((a, b) => b.created - a.created);
                        donarVM.recurringList = donarVM.recurringList.map(recs => {
                            if (recs.program && recs.program[0] && recs.program[0].slug === 'higher-education-loans') {
                                recs.endDate = new Date(new Date(recs.endDate).setMonth(new Date(recs.endDate).getMonth() - 6))
                            }
                            if(recs.program && recs.program[0] && recs.program[0].slug === 'orphan-sponsorship') {
                                recs.endDate = new Date(new Date(recs.freezedDate).setMonth(new Date(recs.freezedDate).getMonth() + 11));
                            }
                            return recs;
                        });
                        // donarVM.recurringList = donarVM.recurringList.map(recrs => {
                        //     recrs.endDate = new Date(new Date(recrs.endDate).setMonth(new Date(recrs.endDate).getMonth() - 1));
                        //     return recrs;
                        // })
                    }
                }
            });
        }

        function getUserDonations() {
            donarDashboardService.getUserDonationDetails().then(function (res) {
                if (res.status == 200) {
                    donarVM.userDonationsList = res.data;
                    donarVM.filterOption = angular.copy(donarVM.userDonationsList);
                }

            });
            donarDashboardService.getUserDonations().then(function (res) {
                if (res.status == 200) {
                    getGeneralFundDonations(res.data);
                    getKhumslDonations(res.data);
                }

            });
        }

        function getSuggestedDonationsList() {
            suggestedDonationsService.getSuggestedDonationsList().then(function (response) {
                if (response && response.status == 200) {
                    donarVM.suggestedDonationsList = response.data;
                }
            });
        }

        function donateNow(donation) {
            if (donation) {
                if (donation.program.length > 0) {
                    switch (donation.programType[0].programTypeName.toLowerCase()) {
                        case (($translate.instant('Religious Payments'.toUpperCase()))).toLowerCase():
                            window.location = `/#/subcategorydetail/${donation.programSubCategory[0].slug}?programid=${donation.program[0].slug}`;
                            break;
                        case (($translate.instant('Projects'.toUpperCase()))).toLowerCase():
                            window.location = '/#/projectdetails/' + donation.program[0].slug;
                            break;
                        case (($translate.instant('Sadaqa'.toUpperCase()))).toLowerCase():
                            window.location = '/#/sadaqadetails/' + donation.program[0].slug;
                            break;
                        case (($translate.instant('General Care'.toUpperCase()))).toLowerCase():
                            window.location = '/#/generalcaredetails/' + donation.program[0].slug;
                            break;
                        case (($translate.instant('Dar Al Zahra'.toUpperCase()))).toLowerCase():
                            window.location = '/#/daralzahradetails/' + donation.program[0].slug;
                            break;
                        default:
                            break;
                    }
                }
            }
        }

        function getGeneralFundDonations(list) {
            let data = _.filter(list, function (item) {
                if (item.donationdetails && item.donationdetails.length && item.donationdetails[0].program && item.donationdetails[0].program.length) {
                    if (item.donationdetails[0].program[0].programName == 'General Fund') {
                        return item;
                    }
                }
            });
            // if (data) {
            //     donarVM.generalCareSponsorshipList = data;
            //     _.forEach(data, function (item2) {
            //         if (item2.donationdetails[0].program.length > 0) {
            //             donarVM.donationCounters.generalCare = donarVM.donationCounters.generalCare + item2.totalAmount
            //         }
            //     });
            // }
        }

        function getDAZSchoolDonations() {
            manageStudentService.getStudentsRecurring().then(function (response) {
                if (response.data.length) {
                    // response.data = response.data.filter(o => {
                    //     return o.donar && o.donar.length && o.donar[0]._id === req.session._id;
                    // });
                    donarVM.DAZSchoolList = response.data;
                    // donarVM.DAZSchoolList = donarVM.DAZSchoolList.map(res => {
                    //     let endDate = new Date(res.endDate);
                    //     // endDate = new Date(endDate.setMonth(endDate.getMonth() + 1));
                    //     endDate.setDate(endDate.getDate()-1);
                    //     res.endDate = endDate;
                    //     return res;
                    // });
                    // donarVM.DAZSchoolList = donarVM.DAZSchoolList.filter(res => res.updatedBy == 'AUTO SCHEDULER')
                }
            })

        }

        function getUserGeneralCareDonations() {
            manageOrphanService.getOrphansRecurring().then(function (response) {
                if (response.data.length > 0) {
                    donarVM.orphanSponsorshipList = response.data;
                    donarVM.orphanSponsorshipList = donarVM.orphanSponsorshipList.filter(o => o.updatedBy !== 'AUTO SCHEDULER');
                }
            })
        }

        function getStudentDetails(studentDetails) {
            donarVM.studentDetails = studentDetails;
        }

        function getOrphanDetails(orphanDetails) {
            donarVM.orphanDetails = orphanDetails;
        }

        function getKhumslDonations(list) {
            for (var i = 0; i < list.length; i++) {
                if (list[i].donationdetails && list[i].donationdetails.length) {
                    list[i].donationdetails.forEach((obj) => {
                        if (obj.program[0].programName == 'Khums' || obj.program[0].programName == 'الخمس') {
                            donarVM.khumsList.push(obj);
                        }
                    })
                }

            }
        }

        //get Expiring Sponsorships
        function getExpiringSponsorships() {
            projectService.getDonationDuration().then(function (res) {
                var currentMonth = 7;
                if (currentMonth == 1) {
                    var donation = []
                    donation.push($filter('filter')(res.data, { 'noOfMonths': 6 })[0]);
                    donarVM.donationDurations = donation;
                }
                else if (currentMonth == 7) {
                    var donation = []
                    angular.forEach(res.data, function (value) {
                        if (value.noOfMonths == 6 || value.noOfMonths == 12) {
                            donation.push(value);
                        }
                    });
                    donarVM.donationDurations = donation;
                }
            });

            donarDashboardService.getAutoRenewTotal().then(function (response) {
                if (response.status === 200) {
                    donarVM.expiringSponsorshipList = response.data;
                    donarVM.expiringSponsorshipList = donarVM.expiringSponsorshipList.map(recs => {
                        if (recs && recs.slug === 'higher-education-loans') {
                            recs.nextPayment = new Date(recs.endDate);
                            recs.endDate = new Date(new Date(recs.endDate).setMonth(new Date(recs.endDate).getMonth() - 6));
                        }
                        if (recs && recs.slug == 'orphan-sponsorship') {
                            recs.nextPayment = new Date(new Date(recs.freezedDate).setMonth(new Date(recs.freezedDate).getMonth() + 12));
                            recs.endDate = new Date(new Date(recs.freezedDate).setMonth(new Date(recs.freezedDate).getMonth() + 11));
                        }
                        if (recs && recs.slug == 'hawzah-students') {
                            recs.nextPayment = new Date(new Date(recs.endDate).setMonth(new Date(recs.endDate).getMonth()  + 1 ));
                        }
                        return recs;
                    });
                }
            });
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

        function checkSponsorshipExpiry(list) {
            var newList = [];
            for (let i = 0; i < list.length; i++) {
                if (list[i].endDate != null) {
                    if (dateFormated(list[i].endDate) <= dateFormated()) {
                        newList.push(list[i]);
                    }
                } else {
                    newList.push(list[i]);
                }
            }
            return newList;
        }

        function addRenewals() {
            if (donarVM.expiringSponsorshipList.length > 0) {
                donarVM.renewalsList = _.filter(donarVM.expiringSponsorshipList, { 'selected': true });
                if (donarVM.renewalsList.length < 1) {
                    swal(
                        'Oops!',
                        'Nothing to renew',
                        'error'
                    )
                    return;
                }
                donarVM.totalAmount = 0;
                _.forEach(donarVM.renewalsList, function (item) {
                    if (item.sponsorshipAmount) {
                        donarVM.totalAmount = donarVM.totalAmount + parseFloat(item.sponsorshipAmount);
                    }
                });
            }
        }

        function updateProfile(isValid) {
            if (isValid) {
                if (donarVM.file.name == undefined) {
                    donarDashboardService.updateProfile(donarVM.details).then(function (response) {
                        if (response.status == 200) {
                            donarVM.getUserDetails;
                            let msg;
                            if (response.data == "User updated successfully!") {
                                if (localStorage.getItem('lang') == 'ARB') {
                                    msg = "!تم تحديث معلومات المستخدم بنجاح";
                                } else if (localStorage.getItem('lang') == 'FRN') {
                                    msg = "Informations enregistrés avec sucès";
                                } else {
                                    msg = "User information successfully updated!";
                                }
                            }
                            swal(
                                $translate.instant('Success!'),
                                msg,
                                'success'
                            );
                        } else {
                            swal(
                                'Failed!',
                                'Failed to update',
                                'error'
                            )
                        }
                    });
                } else {
                    //upload image than save
                    multipartForm.post('/upload', donarVM.file).then(function (res) {
                        donarVM.details.file = res.data.name;
                        donarDashboardService.updateProfile(donarVM.details).then(function (response) {
                            if (response.status == 200) {
                                donarVM.getUserDetails;
                                let msg;
                                if (response.data == "User updated successfully!") {
                                    if (localStorage.getItem('lang') == 'ARB') {
                                        msg = "!تم تحديث صورة الملف الشخصي بنجاح";
                                    } else if (localStorage.getItem('lang') == 'FRN') {
                                        msg = "Photo de profil enregistrée!";
                                    } else {
                                        msg = "Profile picture updated successfully!";
                                    }
                                }
                                swal(
                                    $translate.instant('Success!'),
                                    msg,
                                    'success'
                                );
                            } else {
                                swal(
                                    'Failed!',
                                    'Failed to update',
                                    'error'
                                )
                            }
                        });
                    });
                }
            }
        }

        $scope.user = {};
        $scope.user.roles = [];

        function setEndDate(item, donationDuration) {
            var endDate = new Date();
            endDate.setMonth(endDate.getMonth() + donationDuration);
            var twoDigitMonth = ((endDate.getMonth() + 1) > 9) ? (endDate.getMonth() + 1) : '0' + (endDate.getMonth() + 1);
            var twoDigitDate = endDate.getDate() <= 9 ? '0' + endDate.getDate() : endDate.getDate();
            item.endDateObj = endDate;
            if (item.students) {
                //item.students[0].endingDate = "" + (endDate.getMonth() + 1) + "/" + endDate.getDate() + "/" + endDate.getFullYear() + "";
                item.endDate = twoDigitMonth + "/" + twoDigitDate + "/" + endDate.getFullYear();
            }
            if (item.orphans) {
                item.endDate = twoDigitMonth + "/" + twoDigitDate + "/" + endDate.getFullYear();
            }
        }

        function renewSponsorships() {
            donarDashboardService.renewSponsorships(donarVM.renewalsList).then(function (response) {
                if (response.status == 200) {
                    donarVM.renewalsList = [];
                    donarVM.getExpiringSponsorships();
                    swal(
                        $translate.instant('Success!'),
                        response.data,
                        'success'
                    );
                } else {
                    swal(
                        'Failed!',
                        'Failed to update',
                        'error'
                    )
                }
            });
        }

        function resetForm() {
            donarVM.details = null;
            donarVM.imegeURL = null;
            donarVM.file = {};
            donarVM.registeredForZiyarat = false;
        }

        function loadMore() {
            donarVM.recordsLimit = donarVM.recordsLimit + 8;
        }
        $scope.categoryFilter = function (donation) {
            if (donarVM.programType) {
                if (donation && donation.program.length > 0) {
                    if (donation.program[0].programType[0].slug == donarVM.programType) {
                        return donation;
                    } else {
                        return;
                    }
                }
                else {
                    return;
                }
            } else {
                return donation;
            }

        }
        $scope.programFilter = function (donation) {
            if (donarVM.programType) {
                if (donation && donation.program.length > 0) {
                    if (donation.program[0].programName == donarVM.programType) {
                        return donation;
                    } else {
                        return;
                    }
                }
                else {
                    return;
                }
            } else {
                return donation;
            }

        }
        $scope.filterByYear = function (donation) {
            if (donation && (donation.startDate >= new Date(`1-1-${donarVM.searchValue}`) && donation.startDate <= new Date(`1-1-${donarVM.searchValue + 1}`))) {
                return donation;
            }
            else return;
        }

        function tabVisibilityControl()
        {
            donarDashboardService.getRecurringDonationsForMenuVisibility().then(function (res) {
                if (res.status == 200 && res.data) {
                    console.log('tab visibility data',res.data);
                    donarVM.showOrphanBasicCare = res.data.showOrphanBasicCareTab;
                }
            });
        }
    }
})()