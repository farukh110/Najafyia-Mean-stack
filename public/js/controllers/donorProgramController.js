(function () {

    angular.module('mainApp').controller('donorProgramController', donorProgramController);

    function donorProgramController(donorProgramService, programTypeService, loginService, $translate) {




        var donarVM = this;
        donarVM.details = null;
        donarVM.recordsLimit = 8;
        donarVM.userProgramList = [];
        donarVM.programFilter = programFilter;
        donarVM.categoryFilter = categoryFilter;
        donarVM.filterByYear = filterByYear;
        donarVM.getProgramTypes = getProgramTypes;
        donarVM.getUserDetails = getUserDetails;
        donarVM.getUserDonations = getUserDonations;
        donarVM.loadMore = loadMore;
        donarVM.cancelSubscription = cancelSubscription;
        donarVM.autoRenewal = autoRenewal;
        donarVM.clickStatus;
        donarVM.todayDate = new Date();
        donarVM.userLanguage = localStorage.getItem('lang') || 'ENG';
        donarVM.getSingleOrphanDetails = getSingleOrphanDetails;
        donarVM.getMultipleOrphanDetails = getMultipleOrphanDetails;
        donarVM.getDonorProgramDetails = getDonorProgramDetails;
        donarVM.getOrphanNames = getOrphanNames;
        donarVM.readMore = readMore;
        //donarVM.programType = programType;
        donarVM.getCardItemCSSClass = (donarProgram) => {
            let cssClassNames = "cardItem ";
            cssClassNames += (donarProgram.lastPaymentStatus == "Unpaid" && donarProgram.subscriptionStatus == "Active" ? "failed" : donarProgram.subscriptionStatus.toLowerCase().replace(' ','-'));

            return cssClassNames;
        }
        donarVM.getBeneficiaryNames = (donorProgram) => {
            try {
                if (donorProgram.program.programDetails.additionalMetaData.value) {
                    if (donorProgram.isCollapsed === false) {
                        return donorProgram.program.programDetails.additionalMetaData.value;
                    }
                    else {
                        if (!donorProgram.isCollapsed)
                            donorProgram.isCollapsed = true;
                        return donorProgram.program.programDetails.additionalMetaData.value.slice(0, 1);
                    }
                }
            }
            catch (e) {
                console.log(e);
            }
            return [];
        }
        donarVM.toggleBeneficiaryNames = (donorProgram) => {
            donorProgram.isCollapsed = !donorProgram.isCollapsed;
        }
        donarVM.getSeeMoreButtonText = (donorProgram) => {
            return donorProgram.isCollapsed ? '...('+$translate.instant('SEE_MORE') + ')' : '(' +$translate.instant('SEE_LESS') + ')';
        }
        function getProgramTypes() {
            programTypeService.getProgramTypes().then(function (res) {
                donarVM.programTypesList = res.data;
            });
        }

        donarVM.getStartDate = function (date) {
            let stDate = new Date(date);
            // add a day
            stDate.setDate(stDate.getDate() + 1);
            return stDate;
        }
        function getUserDetails() {

            loginService.getLoggedInUserDetails().then(function (res) {
                donarVM.details = res;
            });
        }

        donarVM.filteredDonations = function (filterBY) {
            if (!filterBY) return donarVM.userProgramList = donarVM.filterOption;
            donarVM.userProgramList = donarVM.filterOption.filter(obj => obj.program && obj.program.programDetails && obj.program.programDetails.programName == filterBY)
        }

        function getUserDonations() {
            donorProgramService.getUserDonationDetails(donarVM.userLanguage).then(function (res) {

                if (res.status == 200) {
                    donarVM.userProgramList = res.data;
                    donarVM.filterOption = angular.copy(donarVM.userProgramList);
                    if(donarVM.programType)
                    {
                        donarVM.filteredDonations(donarVM.programType);
                    }
                }
            });
        }

        function loadMore() {
            donarVM.recordsLimit = donarVM.recordsLimit + 8;
        }

        function categoryFilter(donation) {
            if (donarVM.programType) {
                if (donation && donation.program && donation.program.programDetails) {
                    if (donation.program.programDetails.slug == donarVM.programType) {
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

        function programFilter() {
            if (donarVM.programType) {
                if (donation && donation.program && donation.program.programDetails) {
                    if (donation.program.programDetails.programName == donarVM.programType) {
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

        function filterByYear(donation) {
            if (donation && (donation.startDate >= new Date(`1-1-${donarVM.searchValue}`) && donation.startDate <= new Date(`1-1-${donarVM.searchValue + 1}`))) {
                return donation;
            }
            else return;
        }

        function autoRenewal(event, clickedId, donorProgram) {
            event.preventDefault();

            swal({
                text: $translate.instant('RENEW_CONFIRMATION_TEXT'),
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                confirmButtonText: $translate.instant('Yes')
            }).then((result) => { // <--
                if (result.value) { // <-- if confirmed

                    donorProgramService.toggleAutoRenewal(donorProgram._id, !donorProgram.isAutoRenewal).then(function (res) {
                        if (res.status == 200) {
                            donorProgram.isAutoRenewal = !donorProgram.isAutoRenewal
                            document.getElementById(clickedId).checked = donorProgram.isAutoRenewal;
                        } else {
                        }
                    });
                }

            });
            // }
        }

        function cancelSubscription(stripeSubscriptionId) {

            if (stripeSubscriptionId) {
                swal({
                    title:$translate.instant('CANCEL_SUBSCRIPTION'),
                    text: $translate.instant('CANCEL_SUBSCRIPTION_MESSAGE'),
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#3085d6",
                    confirmButtonText: $translate.instant('Yes'),
                    cancelButtonText:$translate.instant('No'),
                }).then((result) => { // <--
                    if (result.value) { // <-- if confirmed
                        donorProgramService.cancelSubscription(stripeSubscriptionId).then(function (res) {
                            if (res.status == 200) {
                                getUserDonations();
                                
                            }
                        });
                    }
                });
            }
        }

        function getSingleOrphanDetails(orphanDetails) {
            donarVM.orphanDetails = orphanDetails;
        }

        function getMultipleOrphanDetails(orphanDetailList) {
            donarVM.orphanDetailList = orphanDetailList;
        }

        function getDonorProgramDetails(donorProgram){

            donorProgramService.getDonorProgramDetails(donorProgram._id).then(function (res) {

                if (res.status == 200) {
                    donarVM.installmentPlanList = res.data;
                    donarVM.currentDonorProgram = donorProgram;
                }
            });
        }

        function getOrphanNames(orphanDetailList) {
            var concatenatedOrphanNames = '';
            if (orphanDetailList && orphanDetailList.length > 0) {
                for (let index = 0; index < orphanDetailList.length; index++) {
                    concatenatedOrphanNames = concatenatedOrphanNames + orphanDetailList[index].orphanName;
                    if (index != orphanDetailList.length - 1) {
                        concatenatedOrphanNames = concatenatedOrphanNames + ' | ';
                    }
                }
            }
            return concatenatedOrphanNames;
        }

        donarVM.getAge = (birthday) => {
            if (birthday) {
                let bday = new Date(birthday);
                var ageDifMs = Date.now() - bday.getTime();
                var ageDate = new Date(ageDifMs);
                return Math.abs(ageDate.getUTCFullYear() - 1970);
            }
        }


    }
})()