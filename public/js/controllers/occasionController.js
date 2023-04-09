(function () {

    angular.module('mainApp').controller('occasionController', occasionController);

    function occasionController($scope, $location, programTypeService, programService, occasionService, multipartForm) {

        var vm = this;
        var programData = [];
        vm.programTypes = [];
        vm.getProgramTypes = getProgramTypes;
        vm.addOccasion = addOccasion;
        vm.getOccasions = getOccasions;
        vm.deleteOccasion = deleteOccasion;
        vm.getProgramForOccasionUpdate = getProgramForOccasionUpdate;
        vm.getOccaionDataForUpdate = getOccaionDataForUpdate;
        vm.getActivePrograms = getActivePrograms;
        vm.getSubCategoriesOfSelectedProgam = getSubCategoriesOfSelectedProgam;
        vm.selectChosenProgram = selectChosenProgram;
        vm.updateOccasion = updateOccasion;
        
        //get all program types
        function getProgramTypes() {
            programTypeService.getProgramTypes().then(function (res) {
                vm.programTypes = res.data;
                return res.data;
            });
        }
        //get all active programs of selected program Type
        function getActivePrograms() {
            if (vm.selectedProgramType != undefined) {
                let programTypeId = vm.selectedProgramType._id;
                programService.getProgramByTypeId(programTypeId).then(function (res) {
                    vm.programs = res.data;
                    return res.data;
                });
            } else {
                vm.programs = [];
            }
        }
        //get all subcategories of selected Program
        function getSubCategoriesOfSelectedProgam() {
            if (vm.selectedProgram != undefined) {
                if (vm.selectedProgram.programSubCategory.length > 0) {
                    vm.subcategories = vm.selectedProgram.programSubCategory;
                }
            } else {
                vm.subcategories = [];
            }
        }
        //get programs for Occasion Update
        function getProgramForOccasionUpdate() {
            programTypeService.getProgramTypes().then(function (res) {
                vm.programTypes = res.data;
                getOccaionDataForUpdate();
            });
        }
        //Function to get Occasion Data for Update
        function getOccaionDataForUpdate() {
            var id = $location.search().occasionid;

            occasionService.getOccasionById(id).then(function (res) {
                let data = res.data[0];

                if (data == undefined || data == null) {
                    data = res.data;
                }
                vm.occasionId = data._id;
                let selectedProgramTypeVal = _.find(vm.programTypes, function (o) {
                    return o._id == data.programType[0]._id;
                });
                vm.selectedProgramType = selectedProgramTypeVal;
                //Get Programs of Chosen ProgramType
                if (vm.selectedProgramType != undefined) {
                    let programTypeId = vm.selectedProgramType._id;
                    programService.getProgramByTypeId(programTypeId).then(function (res) {
                        vm.programs = res.data;
                        if (vm.programs != undefined) {
                            selectChosenProgram(data.program[0]._id, data.programSubCategory[0]._id);
                        }
                    });
                }
                vm.occasionName = data.occasionName;
                vm.fixedAmount = data.fixedAmount;

                return res;
            });
        }
        //function to set program
        function selectChosenProgram(programId, programSubCategoryId) {
            if (vm.programs != undefined) {
                let selectedProgramVal = _.find(vm.programs, function (o) {
                    return o._id == programId;
                });
                vm.selectedProgram = selectedProgramVal;
                if (vm.selectedProgram != undefined) {
                    getSubCategoriesOfSelectedProgam();
                    if (vm.subcategories != undefined) {
                        let selectedSubCategoryVal = _.find(vm.subcategories, function (o) {
                            return o._id == programSubCategoryId;
                        });
                        vm.selectedCategory = selectedSubCategoryVal;
                    }
                }
            }
        }
        //function to add occasion
        function addOccasion(isValid) {
            let obj = new Object();
            obj = getOccasionObject();
            occasionService.addOccasion(obj).then(function (res) {

                swal({
                    title: $translate.instant(res.data),
                    position: 'center-center',
                    type: 'success',
                    allowOutsideClick: false,
                }).then(function () {
                    window.location = "#/admin/occasionList";
                });
                return res;
            });
        }
        //function to get Occasion Object
        function getOccasionObject() {
            var obj = {};
            obj.programType = vm.selectedProgramType;
            obj.program = vm.selectedProgram;
            obj.programSubCategory = vm.selectedCategory;
            obj.occasionName = vm.occasionName;
            obj.fixedAmount = vm.fixedAmount;
            obj.userLang= localStorage.getItem('lang');

            return obj;
        }
        //function to get all occasions
        function getOccasions() {
            occasionService.getOccasions(localStorage.getItem('lang')).then(function (res) {
                vm.occasions = res.data;
                return res;
            });
        }
        //Function to update Occasion
        function updateOccasion(){
            //Update Occasion
            let occasionUpdateObject = new Object();
            occasionUpdateObject = getOccasionObject();
            occasionUpdateObject.id = vm.occasionId;
           
            occasionService.updateOccasion(occasionUpdateObject).then(function (res) {
                swal({
                    title: $translate.instant(res.data),
                    position: 'center-center',
                    type: 'success',
                    allowOutsideClick: false,
                }).then(function () {
                    window.location = "#/admin/occasionList";
                });
                return res;
            });
        }
        //function to soft delete occasion
        function deleteOccasion(occasionId, status) {
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
                        occasionService.deleteOccasion(occasionId).then(function (res) {
                            vm.result = res.data;
                            swal(
                                $translate.instant('DEACTIVATED!'),
                                'Occasion has been deactivated.',
                                'success'
                            )
                            getOccasions();
                            return res;
                        });
                        // result.dismiss can be 'cancel', 'overlay',
                        // 'close', and 'timer'
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
                occasionService.deleteOccasion(occasionId).then(function (res) {
                    vm.result = res.data;
                    swal(
                        $translate.instant('ACTIVATED!'),
                        'Occasion has been Activated.',
                        'success'
                    )
                    getOccasions();
                    return res;
                });
            }
        }
    }
})()