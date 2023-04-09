(function () {

    angular.module('mainApp').controller('manageStudentController', ManageStudentController);

    function ManageStudentController($rootScope, $scope, $state, $location, $translate, studentProfileService, manageStudentService) {

        $scope.recordsLimit = 10;
        $scope.getStudentsRecurring = function () {
            manageStudentService.getStudentsRecurring().then(function (res) {
                $scope.studentRecurringList = res.data;
                $scope.studentRecurringList = $scope.studentRecurringList.filter(res => res.updatedBy !== 'AUTO SCHEDULER')
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
        $scope.loadMore = function () {
            $scope.recordsLimit = $scope.recordsLimit + 10;
        }

        $scope.getStudents = function (donarName, selectedReccuring) {
            if (selectedReccuring.freezed) {
                $scope.searchStudentName = undefined;
                $scope.studentsList = [];
                $scope.selectedReccuring = {};
                $scope.studentSelected = {};
                $scope.selectedReccuring = selectedReccuring;
                $scope.donarName = donarName;

                studentProfileService.getStudentListWithPriority().then(function (res) {
                    $scope.studentsList = res.data;
                    studentProfileService.getStudentListWithNoPriority().then(function (res) {
                        $scope.studentsList = $scope.studentsList.concat(res.data);
                        $scope.studentsList = $scope.studentsList.filter(x => x.studentId !== $scope.selectedReccuring.student.studentId);
                    });
                });
                jQuery('#studentsModal').modal('toggle');

            }
            else {
                swal(
                    'Change student not allowed.',
                    'Kindly cancel sponsorship first.',
                    'error'
                )
            }
        }

        $scope.updateStudentSelection = function (id, studentList, student) {
            angular.forEach(studentList, function (item) {
                if (id != item._id) {
                    item.checked = false;
                    $scope.studentSelected = student;
                }
            });
        }

        $scope.changeStudent = function () {

            var studentChangeDetails = [];
            studentChangeDetails.push($scope.studentSelected);
            studentChangeDetails.push($scope.selectedReccuring);
            manageStudentService.changeStudent(studentChangeDetails).then(function (res) {
                swal(
                    $translate.instant('Sponsorship Changed'),
                    '',
                    'success'
                )
                $scope.getStudentsRecurring();
                jQuery('#studentsModal').modal('toggle');
            }).catch(err => {
            });
        }
        function getCancelMessage(orphanName){
            let lang = localStorage.getItem('lang');
            if (lang === 'ENG') {
                return "Are you sure you want to cancel " + orphanName + "'s sponsorship ?"
            } else if (lang == 'FRN') {
                return 'Êtes vous sûr de vouloir annuler le parrainage de' + orphanName + '?'
            } else return "Are you sure you want to cancel " + orphanName + "'s sponsorship ?"
        }
        $scope.cancelStudent = function (studentRecurring) {

            swal({
                title: getCancelMessage(studentRecurring.student.studentName),
                text: "",
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes',
                cancelButtonText: 'No',
                confirmButtonClass: 'btn btn-success',
                cancelButtonClass: 'btn btn-danger',
                buttonsStyling: false
            }).then(function (result) {
                if (result.value) {
                    manageStudentService.cancelStudent(studentRecurring).then(function (res) {
                        swal(
                            'Cancelled',
                            '',
                            'success'
                        )
                        $scope.getStudentsRecurring();
                    });
                }
            });
        }

        $scope.dayDiff = function (todate) { //todate is nextDonationDate
            var date1 = new Date();
            var date2 = new Date(todate);
            var timeDiff = date2.getTime() - date1.getTime();
            var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
            return diffDays;
        }

        $scope.dueAmount = function (studentReccurring) {
            var months;
            var nextDonationDate = new Date(studentReccurring.nextDonationDate);
            months = (new Date().getFullYear() - nextDonationDate.getFullYear()) * 12;
            months -= nextDonationDate.getMonth() + 1;
            months += new Date().getMonth() + 1;
            months = months <= 0 ? 0 : months;
            return studentReccurring.amount * months;
        }

    }
})()