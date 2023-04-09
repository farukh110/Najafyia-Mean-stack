(function () {

    angular.module('mainApp').controller('duaController', duaController);

    function duaController($scope, $location, programTypeService, programService, occasionService, duaService, multipartForm, religiousPaymentService, programService, $filter, $translate) {

        var vm = this;

        vm.getDuas = getDuas;
        vm.addDua = addDua;
        vm.getDuas = getDuas;
        vm.deleteDua = deleteDua;
        vm.getHajjZiyarahSubCat = getHajjZiyarahSubCat;
        vm.getDuaDataForUpdate = getDuaDataForUpdate;
        vm.updateDua = updateDua;
        vm.getOccasionBySubCategory = getOccasionBySubCategory;
        vm.getActiveReligiousPayments = getActiveReligiousPayments;




        async function getActiveReligiousPayments() {
            if (localStorage.getItem('lang') == 'ARB') {
                religiousPayment = "المدفوعات الدينية";
            } else if (localStorage.getItem('lang') == 'FRN') {
                religiousPayment = "Paiements religieux";
            } else {
                religiousPayment = "Religious Payments";
            }
            const res = await programTypeService.getProgramType(religiousPayment);
            vm.programType = res.data[0];
            const programTypeId = vm.programType._id;
            const rpRes = await religiousPaymentService.getReligiousPayments(programTypeId);
            vm.religiousPayments = rpRes.data;
            vm.selectedProgramType = vm.religiousPayments.find(rp => rp.isActive && rp.slug === 'hajj-and-ziyarah' && rp.language === localStorage.getItem('lang'));
            if (vm.religiousPayments && vm.religiousPayments.length) getHajjZiyarahSubCat();
        }

        //function to get all occasions
        function getHajjZiyarahSubCat() {
            // let currentDuaId = vm.selectedOccasion.programSubCategory[0]._id;
            if (vm.selectedProgramType != undefined) {
                vm.subCategoriesList = vm.selectedProgramType.programSubCategory;
                let currentDuaId = vm.selectedOccasion.programSubCategory[0]._id;
                vm.subCategories = vm.subCategoriesList.find(o => o._id === currentDuaId)
            }
        }

        function getOccasionBySubCategory() {
            duaService.getOccasionBySubCategory(vm.subCategories._id)
                .then(function (res) {
                    vm.occasions = res.data;
                });
        }

        //Function to get Dua Data for Update
        function getDuaDataForUpdate() {
            var id = $location.search().duaid;
            duaService.getDuaById(id).then(function (res) {
                let data = res.data[0];
                if (data == undefined || data == null) {
                    data = res.data;
                }
                vm.subCategories = null;
                duaService.getOccasionBySubCategory(data.occasion[0].programSubCategory[0])
                    .then(function (res) {
                        vm.occasions = res.data;
                        let selectedOccasionVal = _.find(vm.occasions, function (o) {
                            return o._id === data.occasion[0]._id;
                        });
                        vm.selectedOccasion = selectedOccasionVal;
                        getActiveReligiousPayments();
                    });
                vm.duaId = data._id;
                vm.duaName = data.duaName;
                vm.fixedAmount = data.fixedAmount;

                return res;
            });
        }

        //Function to get All Duaas
        function getDuas() {
            duaService.getDuas().then(function (res) {
                vm.occasions = res.data;
                return res.data;
            });
        }

        //function to add Dua
        function addDua(isValid) {
            let obj = new Object();
            obj = getDuaObject();
            duaService.addDua(obj).then(function (res) {
                swal({
                    title: $translate.instant(res.data),
                    position: 'center-center',
                    type: 'success',
                    allowOutsideClick: false,
                }).then(function () {
                    window.location = "#/admin/addDua";
                });
                return res;
            });
        }

        //function to get Occasion Object
        function getDuaObject() {
            var obj = {};
            obj.occasion = vm.selectedOccasion;
            obj.duaName = vm.duaName;
            obj.fixedAmount = vm.fixedAmount;
            obj.userLang = localStorage.getItem('lang');

            return obj;
        }

        //Function to get All Duas
        function getDuas() {

            duaService.getDuas(localStorage.getItem('lang')).then(function (res) {
                vm.duas = res.data;
            });
        }

        //Function to Update Dua
        function updateDua() {
            //Update Dua
            let duaUpdateObject = new Object();
            duaUpdateObject = getDuaObject();
            duaUpdateObject.id = vm.duaId;

            duaService.updateDua(duaUpdateObject).then(function (res) {
                swal({
                    title: $translate.instant(res.data),
                    position: 'center-center',
                    type: 'success',
                    allowOutsideClick: false,
                }).then(function () {
                    window.location = "#/admin/duaList";
                });
                return res;
            });
        }

        function getSubCategories() {


            return obj;
        }

        //Function to soft delete Duas
        function deleteDua(duaId, status) {
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
                        duaService.deleteDua(duaId).then(function (res) {
                            vm.result = res.data;
                            swal(
                                $translate.instant('DEACTIVATED!'),
                                'Dua has been deactivated.',
                                'success'
                            )
                            getDuas();
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
            } else {
                duaService.deleteDua(duaId).then(function (res) {
                    vm.result = res.data;
                    swal(
                        $translate.instant('ACTIVATED!'),
                        'Dua has been Activated.',
                        'success'
                    )
                    getDuas();
                    return res;
                });
            }
        }
    }
})()