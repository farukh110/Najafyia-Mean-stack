(function () {

    angular.module('mainApp').controller('manageOrphanController', ManageOrphanController);

    function ManageOrphanController($rootScope, $scope, $state, $location, $translate, manageOrphanService, orphanService) {

        let orphanChanged  = null;
        let orphanCancelObj = null;
        $scope.endDate = "";
        jQuery("#txtED").datepicker({
            autoclose: false,
            startDate: 'today'
        });

        $scope.recordsLimit = 10;
        $scope.orphanRecurringList = [];
        $scope.dtOptions = {
            paging: false,
            "ordering": true,
            "Searching": true,
        };

        $scope.getOrphansRecurring = function () {
            manageOrphanService.getOrphansRecurring().then(function (res) {
                if (res.data) {
                    $scope.orphanRecurringList = res.data;
                    $scope.orphanRecurringList = $scope.orphanRecurringList.filter(res => res.updatedBy !== 'AUTO SCHEDULER')
                }
            });
        }

        $scope.loadMore = function () {
            $scope.recordsLimit = $scope.recordsLimit + 10;
        }

        $scope.getOrphans = function (donarName, selectedReccuring) {
            if (selectedReccuring.freezed  || ( !selectedReccuring.freezed && orphanChanged )) {
                $scope.orphansList = [];
                $scope.selectedReccuring = {};
                $scope.orphanSelected = {};
                $scope.selectedReccuring = selectedReccuring;
                $scope.donarName = donarName;

                orphanService.getOrphanListWithPriority().then(function (res) {
                    $scope.orphansList = res.data;
                    $scope.orphansList = $scope.orphansList.filter(x => x.orphanId !== $scope.selectedReccuring.orphan.orphanId);
                    // });
                    // orphanService.getOrphanListWithNoPriority().then(function (res) {
                    //     $scope.orphansList = $scope.orphansList.concat(res.data);
                    //     $scope.orphansList = $scope.orphansList.filter(x => x.orphanId !== $scope.selectedReccuring.orphan.orphanId);
                    // });
                });
                jQuery('#orphansModal').modal('toggle');

            }
            else {
                swal(
                    'Change orphan not allowed.',
                    'Kindly cancel sponsorship first.',
                    'error'
                )
            }
        }

        $scope.updateOrphanSelection = function (id, orphanList, orphan) {
            $scope.orphanSelected = undefined;
            angular.forEach(orphanList, function (item) {
                item.checked = false;
                if (id === item._id) {
                    item.checked = true;
                    $scope.orphanSelected = orphan;
                }
            });
        }
        $scope.age = function (birthday) {
            if (birthday) {
                let bday = new Date(birthday);
                var ageDifMs = Date.now() - bday.getTime();
                var ageDate = new Date(ageDifMs);
                return Math.abs(ageDate.getUTCFullYear() - 1970);
            }
        }
        $scope.changeOrphan = function () {

            var orphanChangeDetails = [];
            orphanChangeDetails.push($scope.orphanSelected);
            orphanChangeDetails.push($scope.selectedReccuring);
            manageOrphanService.changeOrphan(orphanChangeDetails).then(function (res) {
                swal(
                    $translate.instant('Sponsorship Changed'),
                    '',
                    'success'
                )

                if(res.status == 200){
                $scope.cancelOrphan(orphanCancelObj);
               // $scope.getOrphansRecurring();
                }
                jQuery('#orphansModal').modal('toggle');
            }).catch((err) => {
                swal(
                    'Error',
                    err.data,
                    'error'
                )
            });
        }
        function getCancelMessage(orphanName) {
            let lang = localStorage.getItem('lang');
            if (lang === 'ENG') {
                return "Are you sure you want to cancel " + orphanName + "'s sponsorship ?"
            } else if (lang == 'FRN') {
                return 'Êtes vous sûr de vouloir annuler le parrainage de' + orphanName + '?'
            } else return "Are you sure you want to cancel " + orphanName + "'s sponsorship ?"
        }

        $scope.getPaymentAttempt = function (orphanReccurring){
            let paymentSchedule  = orphanReccurring.paymentSchedule? orphanReccurring.paymentSchedule : [];
            if(paymentSchedule.length > 0 ){
                let found = paymentSchedule.find(item => item.status == 'Unpaid' && item.attemptHistory != null );
                return found && found.attemptHistory.length > 0 ? found.attemptHistory.length -1 : '-';
            }
        }

        $scope.cancelOrphan = function (orphanRecurring) {
            manageOrphanService.cancelOrphan(orphanRecurring).then(function (res) {
                $scope.getOrphansRecurring();
            });
        }
        $scope.modifyOrphan = function(orphanReccurring){

            swal({
                title: "",
                text: "What modification  would you like to make?",
                type: "warning",
                showCancelButton: true,
                showCloseButton : true,
                confirmButtonColor: "#3085d6",
                confirmButtonText: "Change Orphan",
                cancelButtonText: "Cancel Sponsoirship",
               confirmButtonClass: 'btn swal2-styled',
               cancelButtonClass: 'btn btn-danger',
               buttonsStyling: false
            }).then((result) => { // <--
                if (result.value) { // <-- if confirmed
                    orphanChanged = true;
                    orphanListId = orphanReccurring._id;
                    orphanCancelObj = {
                        _id : orphanReccurring._id,
                        orphan: {
                            orphanId : orphanReccurring.orphan.orphanId
                        }
                    }
                  $scope.getOrphans(orphanReccurring.donar[0].donarName, orphanReccurring);
                }
                else if(result.dismiss == 'cancel'){
                    $scope.cancelSponsorship(orphanReccurring);
                }
            });
        }

        $scope.cancelSponsorship = function(orphanReccurring){



            //get all orphans here that belong to the same donation 

            let count = orphanReccurring.donationDetails.count ? Number(orphanReccurring.donationDetails.count) : -1 ;
 
            let text = count == 1  ? "Are you sure you want to cancel the sponsorship for orphan : "+orphanReccurring.orphan.orphanName : "Are you sure you want to cancel the sponsorship for orphan : <br>"+orphanReccurring.orphan.orphanName +", along with "+ Number(count - 1)+" other orphans?" 

            swal({
                title: "",
                html:text,
               // text: "Are you sure you want to cancel the sponsorship for orphan : "+orphanReccurring.orphan.orphanName +" ?",
                type: "warning",
                showCloseButton : true,
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                confirmButtonText: "Yes",
                cancelButtonText: "No"
            }).then((result) => { // <--
                if (result.value) { // <-- if confirmed
                    orphanReccurring.setCancel = true;
                    $scope.cancelOrphan(orphanReccurring);
                    // do we need a confirmation pop up ?
                }
            }); 
        };

        $scope.dayDiff = function (todate) { //todate is nextDonationDate
            var date1 = new Date();
            var date2 = new Date(todate);
            var timeDiff = date2.getTime() - date1.getTime();
            var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
            return diffDays;
        }

        $scope.dueAmount = function (orphanReccurring) {
            var months;
            var nextDonationDate = new Date(orphanReccurring.nextDonationDate);
            months = (new Date().getFullYear() - nextDonationDate.getFullYear()) * 12;
            months -= nextDonationDate.getMonth() + 1;
            months += new Date().getMonth() + 1;
            months = months <= 0 ? 0 : months;
            return orphanReccurring.amount * months;
        }

        $scope.setPosED = function () {
            var txtEDs = jQuery("#txtED").offset().top;
            txtEDs = txtEDs - 270;
            angular.element(jQuery('.datepicker-dropdown')[0]).css({ top: "" + (txtEDs) + "px" });
        }

        $scope.openEndDateDialog = function (orphanReccurring) {
            $scope.selectedReccuring = orphanReccurring;
            let minDate = '';
            const currentED = new Date(orphanReccurring.endDate);
            const today = new Date();
            minDate = (currentED && currentED > today) ? currentED : 'today';
            $scope.endDate = orphanReccurring.endDate.split("T")[0];
            jQuery("#txtED").datepicker("remove");
            jQuery("#txtED").datepicker({
                autoclose: false,
                startDate: minDate,
            });
            jQuery("#editModal").modal("show");

        }

        $scope.updateOrphanSponsorship = function () {

            if ($scope.endDate == "") {
                swal({
                    position: 'center-center',
                    type: 'error',
                    title: 'Please select End Date',
                    showConfirmButton: false,
                });
            }
            else {
                $scope.selectedReccuring.endDate = $scope.endDate;

                manageOrphanService.updateSponsorship($scope.selectedReccuring).then(function (res) {
                    jQuery("#editModal").modal("hide");
                    $scope.getOrphansRecurring();
                });
            }
        }
    }
})()