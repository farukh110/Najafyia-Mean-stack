(function () {

    angular.module('mainApp').controller('studentProfileController', StudentProfileController);

    function StudentProfileController($state, Upload, $http, $scope, $location, studentProfileService, multipartForm, $translate) {

        var vm = this;

        //Functions registered
        vm.addStudent = addStudent;
        vm.getStudents = getStudents;
        vm.getCountryList = getCountryList;
        vm.getLanguagesList = getLanguagesList;
        vm.getStudentDataForUpdate = getStudentDataForUpdate;
        vm.getCountryListForUpdate = getCountryListForUpdate;
        vm.getUpdatedStudentData = getUpdatedStudentData;
        vm.updateStudent = updateStudent;
        vm.deleteStudent = deleteStudent;
        vm.addDays = addDays;
        vm.imageUrl = "";
        vm.file = {};
        vm.country = [];
        vm.languages = [];
        $scope.submitFiles = function () {
            if ($scope.files) {
                $scope.uploadFiles($scope.files);
            }
        };
        $scope.hideShowSponsored = function () {
            $scope.showSponsored = !$scope.showSponsored;
            vm.students = vm.totalStudents;
            if ($scope.showSponsored) {
                vm.students = vm.students.filter(or => or.isSponsored);
                return;
            }
            vm.students = vm.students.filter(or => !or.isSponsored)
        }
        $scope.showAll = function () {
            vm.students = vm.totalStudents;
        }
        // for multiple files:
        $scope.uploadFiles = function (files) {
            if (files && files.length) {

                // or send them all together for HTML5 browsers:

                Upload.upload({
                    url: '/admin/studentList',
                    data: { form: files }
                }).then(function (res) {
                    if (res && res.status === 200) {
                        $scope.status = res.status;
                        swal({
                            title: $translate.instant('Success!'),
                            message: $translate.instant('All data uploaded successfully'),
                            position: 'center-center',
                            type: 'success',
                            allowOutsideClick: false,
                        });
                    }
                }, function (resp) {
                }, function (evt) {
                    $scope.progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    if ($scope.progressPercentage == 100) {
                        setTimeout(() => {
                            $scope.progressPercentage = 0;
                            $scope.files = []
                        }, 800)

                    }
                }).catch(e => {
                    swal({
                        title: 'Failed',
                        message: 'fail to upload data',
                        position: 'center-center',
                        type: 'error',
                        allowOutsideClick: false,
                    });
                });
            }
        }
        function camelize(str) {
            return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
                return index == 0 ? word.toLowerCase() : word.toUpperCase();
            }).replace(/\s+/g, '');
        }
        $scope.age = function (birthday) {
            if (birthday) {
                let bday = new Date(birthday);
                var ageDifMs = Date.now() - bday.getTime();
                var ageDate = new Date(ageDifMs);
                return Math.abs(ageDate.getUTCFullYear() - 1970);
            }
        }
        $scope.handleFileSelect = function () {
            if (!$scope.csvFile) {
                swal({
                    title: 'File not found',
                    message: 'fail to upload data',
                    position: 'center-center',
                    type: 'error',
                    allowOutsideClick: false,
                });
                return;
            }
            $scope.processingCSV = true;
            const lang = localStorage.getItem('lang') || 'ENG';
            Papa.parse($scope.csvFile, {
                header: true,
                dynamicTyping: true,
                complete: function (results) {
                    if (results && results.data && results.data.length) {
                        let updatedArray = [];
                        for (var i = 0; i < results.data.length; i++) {
                            let row = results.data[i];
                            if (row && Object.keys(row).length && typeof row == 'object') {
                                for (var key in row) {
                                    if (row.hasOwnProperty(key) && row[key]) {
                                        const newKey = _.camelCase(key.trim());
                                        if (newKey === 'descent') {
                                            row[key] = row[key] === $translate.instant("SYED") ? "Syed" : "Non-Syed";
                                        }
                                        if (newKey === 'gender') {
                                            row[key] = row[key] === $translate.instant("MALE") ? "Male" : "Female";
                                        }
                                        delete Object.assign(row, { [newKey]: row[key] })[key];
                                    } else break;

                                }
                                row.language = lang;
                                updatedArray.push(row);
                            } else {
                                swal({
                                    title: 'Empty Data Found',
                                    message: `Please update your csv with valid data`,
                                    position: 'center-center',
                                    type: 'error',
                                    allowOutsideClick: false,
                                });
                                $scope.processingCSV = false;
                                return;
                            }
                        }
                        if (updatedArray.length !== results.data.length) return;
                        updatedArray.pop();
                        studentProfileService.addStudentsList(updatedArray)
                            .then((res) => {
                                if (res) {
                                    swal({
                                        title: $translate.instant('Success!'),
                                        message: $translate.instant('All data uploaded successfully'),
                                        position: 'center-center',
                                        type: 'success',
                                        allowOutsideClick: false,
                                    }).then(function () {
                                        location.reload();
                                        // $state.go($state.current, {}, {reload: false});
                                    });
                                }
                            }).catch(e => {
                                swal({
                                    title: 'Failed',
                                    message: 'fail to upload data',
                                    position: 'center-center',
                                    type: 'error',
                                    allowOutsideClick: false,
                                });
                                $scope.processingCSV = false;
                            })
                    }
                }
            });
        }
        $scope.uploadAll = function () {
            $scope.myFiles = $scope.uploader.queue.map(o => o.file);
            // console.log($scope.myFiles);
            if ($scope.myFiles && $scope.myFiles.length) {
                studentProfileService.uploadPhotos($scope.myFiles)
                    .then((res) => {
                        if (res) {
                            swal({
                                title: $translate.instant('Success!'),
                                message: $translate.instant('All data uploaded successfully'),
                                position: 'center-center',
                                type: 'success',
                                allowOutsideClick: false,
                            }).then(function () {
                                location.reload();
                                // $state.go($state.current, {}, {reload: false});
                            });
                        }
                    }).catch(e => {
                        swal({
                            title: 'Failed',
                            message: 'fail to upload data',
                            position: 'center-center',
                            type: 'error',
                            allowOutsideClick: false,
                        });
                    })
            } else {
                swal({
                    title: 'Failed',
                    message: 'No files selected',
                    position: 'center-center',
                    type: 'error',
                    allowOutsideClick: false,
                });
            }
        }
        // Function to Add New Student
        function addStudent(isValid) {
            if (isValid) {
                if (angular.equals({}, vm.file)) {
                    var noImageAvailable = new File(["../upload/imageNotAvailable.jpg"], "imageNotAvailable");
                    vm.file = noImageAvailable;
                }
                multipartForm.post('/upload', vm.file).then(function (res) {
                    var imageLink = res.data.name;
                    var obj = new Object();
                    obj.studentName = vm.studentName;
                    obj.studentId = vm.studentId;
                    obj.language = localStorage.getItem('lang') || 'ENG';
                    // obj.fileNumber = vm.fileNumber;
                    // obj.startingDate = vm.startingDate;
                    // obj.endingDate = vm.endingDate;
                    obj.descent = vm.isSyed === "true"? "Syed" : "Non-Syed";
                    // obj.admissionDate = vm.admissionDate;
                    obj.grade = vm.grade;
                    obj.dateOfBirth = vm.dateOfBirth;
                    // obj.nationality = vm.selectedCountry;
                    // obj.motherTongue = vm.selectedLanguage;
                    // obj.religion = vm.religion;
                    // obj.address = vm.address;
                    obj.city = vm.city;
                    // obj.birthPlace = vm.birthPlace;
                    // obj.motherName = vm.motherName;
                    // obj.motherOccupation = vm.motherOccupation;
                    // obj.fatherName = vm.fatherName;
                    // obj.fatherOccupation = vm.fatherOccupation;
                    // obj.medicalCondition = vm.medicalCondition;
                    // obj.sponsorName = vm.sponsorName;
                    // obj.sponsorEmail = vm.sponsorEmail;
                    // obj.sponsorPhone = vm.sponsorPhone;
                    obj.gender = vm.gender;
                    obj.isActive = true;
                    obj.imageLink = imageLink;
                    // obj.age = vm.age;

                    studentProfileService.addStudent(obj).then(function (res) {
                        if (res.data == 'Duplicate File Number.') {
                            swal({
                                title: 'Student File Number: ' + obj.fileNumber + ' already exists. Please Enter Valid File Number',
                                position: 'center-center',
                                type: 'error',
                                allowOutsideClick: false,
                            });
                        } else {
                            swal({
                                title: $translate.instant(res.data),
                                position: 'center-center',
                                type: 'success',
                                allowOutsideClick: false,
                            }).then(function () {
                                window.location = "#/admin/studentList";
                            });
                            return res;
                        }

                    });
                    //Image block end
                });
            }
        }

        // Function to get all Students
        function getStudents() {
            studentProfileService.getStudents().then(function (res) {
                vm.students = res.data;
                vm.totalStudents = res.data;
                return res;
            });
        }

        // Function to get country list for Nationality
        function getCountryList() {
            studentProfileService.getCountryList().then(function (res) {
                vm.country = res.data;
                vm.country = vm.country.map(c => {
                    if (localStorage.getItem('lang') === 'FRN') {
                        c.name = c.nameFRN;
                    } else if (localStorage.getItem('lang') === 'ARB') {
                        c.name = c.nameARB;    
                    }
                    return c;
                })
            });
        }

        // Function to get country list for Nationality
        function getCountryListForUpdate() {
            studentProfileService.getCountryList().then(function (res) {
                vm.country = res.data;
                vm.country = vm.country.map(c => {
                    if (localStorage.getItem('lang') === 'FRN') {
                        c.name = c.nameFRN;
                    } else if (localStorage.getItem('lang') === 'ARB') {
                        c.name = c.nameARB;    
                    }
                    return c;
                })
                getStudentDataForUpdate();
            });
        }

        // Function to get language list for Mother Tongue
        function getLanguagesList() {
            studentProfileService.getLanguagesList().then(function (res) {
                vm.languages = res.data;
            });
        }

        //Function to Update Student
        function updateStudent(isValid) {
            if (isValid) {
                if (vm.file.name == undefined) {
                    let studentObject = getUpdatedStudentData();
                    studentObject.imageLink = vm.imageLink;
                    studentProfileService.updateStudent(studentObject).then(function (res) {

                        swal({
                            title: $translate.instant(res.data),
                            position: 'center-center',
                            type: 'success',
                            allowOutsideClick: false,
                        }).then(function () {
                            window.location = "#/admin/studentList";
                        });
                        return res;
                    });
                }
                else {
                    multipartForm.post('/upload', vm.file).then(function (res) {
                        let studentObject = getUpdatedStudentData();
                        studentObject.imageLink = res.data.name;
                        studentProfileService.updateStudent(studentObject).then(function (res) {
                            if (res.data == 'Duplicate File Number.') {
                                swal({
                                    title: 'Student File Number: ' + obj.fileNumber + ' already exists. Please Enter Valid File Number',
                                    position: 'center-center',
                                    type: 'error',
                                    allowOutsideClick: false,
                                });
                            } else {
                                swal({
                                    title: $translate.instant(res.data),
                                    position: 'center-center',
                                    type: 'success',
                                    allowOutsideClick: false,
                                }).then(function () {
                                    window.location = "#/admin/studentList";
                                });
                                return res;
                            }
                        });
                    });
                }
            }
        }

        //Function to create Student update object
        function getUpdatedStudentData() {
            var obj = new Object();
            obj.studentId = vm.studentId;
            obj.studentName = vm.studentName;
            // obj.fileNumber = vm.fileNumber;
            // obj.startingDate = vm.startingDate;
            // obj.endingDate = vm.endingDate;
            obj.descent = vm.isSyed ? "Syed" : "Non-Syed";
            // obj.admissionDate = vm.admissionDate;
            obj.grade = vm.grade;
            obj.dateOfBirth = vm.dateOfBirth;
            obj.nationality = vm.selectedCountry;
            // obj.motherTongue = vm.motherTongue;
            // obj.religion = vm.religion;
            // obj.address = vm.address;
            obj.city = vm.city;
            // obj.birthPlace = vm.birthPlace;
            // obj.motherName = vm.motherName;
            // obj.motherOccupation = vm.motherOccupation;
            // obj.fatherName = vm.fatherName;
            // obj.fatherOccupation = vm.fatherOccupation;
            obj.medicalCondition = vm.medicalCondition;
            obj.sponsorName = vm.sponsorName;
            obj.sponsorEmail = vm.sponsorEmail;
            obj.sponsorPhone = vm.sponsorPhone;
            obj.gender = vm.gender;
            // obj.age = vm.age;
            obj.imageLink = vm.imageLink;

            return obj;
        }

        //Function to Activate/Deactivate Student profile
        function deleteStudent(studentId, status) {
            if (status == true) {
                swal({
                    title: $translate.instant('Are you sure?'),
                    text: "",
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: $translate.instant('Yes, Deactivate it!'),
                    cancelButtonText: $translate.instant('No, cancel!'),
                    confirmButtonClass: 'btn btn-success',
                    cancelButtonClass: 'btn btn-danger',
                    buttonsStyling: false
                }).then(function (result) {
                    if (result.value) {
                        studentProfileService.deleteStudent(studentId, status).then(function (res) {
                            vm.result = res.data;
                            swal(
                                $translate.instant('DEACTIVATED!'),
                                $translate.instant('Student has been deactivated.'),
                                'success'
                            )
                            getStudents();
                            return res;
                        });
                    } else if (result.dismiss === 'cancel') {
                        swal(
                            'Cancelled',
                            '',
                            'error'
                        )
                    }
                });
            }
            else {
                studentProfileService.deleteStudent(studentId, status).then(function (res) {
                    vm.result = res.data;
                    swal(
                        $translate.instant('ACTIVATED!'),
                        $translate.instant('Student has been Activated.'),
                        'success'
                    )
                    getStudents();
                    return res;
                });
            }
        }

        //Function to get Student Data for Update
        function getStudentDataForUpdate() {
            var id = $location.search().studentId;

            studentProfileService.getStudentById(id).then(function (res) {
                let data = res.data[0];

                if (data == undefined || data == null) {
                    data = res.data;
                }
                vm.studentId = data.studentId;
                vm.studentName = data.studentName;
                // vm.fileNumber = data.fileNumber;
                vm.dateOfBirth = data.dateOfBirth;
                var dateOfbirth = jQuery('#txtDOB');
                dateOfbirth.datepicker();
                dateOfbirth.datepicker('setDate', vm.dateOfBirth);
                vm.admissionDate = data.admissionDate;
                var admissiondate = jQuery('#txtAdmissionDate');
                admissiondate.datepicker();
                admissiondate.datepicker('setDate', vm.admissionDate);
                vm.startingDate = data.startingDate;
                var startingdate = jQuery('#txtFromDate');
                startingdate.datepicker();
                startingdate.datepicker('setDate', vm.startingDate);
                vm.endingDate = data.endingDate;
                var durationEDate = jQuery('#txtToDate');
                durationEDate.datepicker();
                durationEDate.datepicker('setDate', vm.endingDate);
                vm.gender = data.gender;

                vm.isSyed = data.descent === 'Syed';
                vm.grade = data.grade;

                // let selectedCountryVal = _.find(vm.country, function (o) {
                //     return o._id == data.nationality[0]._id;
                // });
                // vm.selectedCountry = selectedCountryVal;
                // let motherTongueVal = _.find(vm.languages, function (o) {
                //     return o._id == data.motherTongue[0]._id;
                // });
                // vm.motherTongue = motherTongueVal;
                vm.religion = data.religion;
                vm.address = data.address;
                vm.city = data.city;
                vm.birthPlace = data.birthPlace;
                vm.fatherName = data.fatherName;
                vm.motherName = data.motherName;
                vm.fatherOccupation = data.fatherOccupation;
                vm.motherOccupation = data.motherOccupation;
                vm.medicalCondition = data.medicalCondition;
                vm.sponsorName = data.sponsorName;
                vm.sponsorEmail = data.sponsorEmail;
                vm.sponsorPhone = data.sponsorPhone;
                vm.imageLink = data.imageLink;
                vm.age = parseInt(data.age);
                return res;
            });
        }

        jQuery("#txtFromDate").datepicker({
            autoclose: true
        });

        //DOB
        jQuery("#txtDOB").datepicker({
            autoclose: true,
        });
        //For Add/Update Student Profile Form DOB
        $scope.dobDateChange = function () {
            jQuery("#txtAdmissionDate").datepicker("remove");
            jQuery("#txtAdmissionDate").val('');
            //Function to Add one day to Date
            var admissionDateNew = vm.addDays(new Date(vm.dateOfBirth), 1);
            jQuery("#txtAdmissionDate").datepicker({
                autoclose: true,
                startDate: new Date(admissionDateNew),
            });
        }
        //Admission Date
        jQuery("#txtAdmissionDate").datepicker({
            autoclose: true,
        });
        //For Add/Update Student Profile Form Admission Date
        $scope.admissionDateChange = function () {
            jQuery("#txtFromDate").datepicker("remove");
            jQuery("#txtFromDate").val('');
            //Function to Add one day to Date
            var startingDateNew = vm.addDays(new Date(vm.admissionDate), 1);
            jQuery("#txtFromDate").datepicker({
                autoclose: true,
                startDate: new Date(startingDateNew),
            });
        }
        //For Add/Update Student Profile Form
        $scope.startDateChange = function () {
            jQuery("#txtToDate").datepicker("remove");
            jQuery("#txtToDate").val('');
            //Function to Add one day to Date
            var endingDateNew = vm.addDays(new Date(vm.startingDate), 1);
            jQuery("#txtToDate").datepicker({
                autoclose: true,
                startDate: new Date(endingDateNew),
            });
        }
        $scope.setPos = function () {
            var txtFromDatePos = jQuery("#txtFromDate").offset().top;
            var txtToDatePos = jQuery("#txtToDate").offset().top;

            txtFromDatePos = txtFromDatePos - 275;
            txtToDatePos = txtToDatePos - 275;
            angular.element(jQuery('.datepicker-dropdown')[0]).css({ top: "" + (txtFromDatePos) + "px" });
            angular.element(jQuery('.datepicker-dropdown')[0]).css({ top: "" + (txtToDate) + "px" });

        }
        $scope.setPosAdmissionDate = function () {
            var txtAdmissionDatePos = jQuery("#txtAdmissionDate").offset().top;
            txtAdmissionDatePos = txtAdmissionDatePos - 270;
            angular.element(jQuery('.datepicker-dropdown')[0]).css({ top: "" + (txtAdmissionDatePos) + "px" });
        }
        $scope.setPosDOB = function () {
            var txtDOBPos = jQuery("#txtDOB").offset().top;
            txtDOBPos = txtDOBPos - 270;
            angular.element(jQuery('.datepicker-dropdown')[0]).css({ top: "" + (txtDOBPos) + "px" });
        }

        function addDays(startDate, numberOfDays) {
            var returnDate = new Date(
                startDate.getFullYear(),
                startDate.getMonth(),
                startDate.getDate() + numberOfDays,
                startDate.getHours(),
                startDate.getMinutes(),
                startDate.getSeconds());
            return returnDate;
        }
    }
})()
