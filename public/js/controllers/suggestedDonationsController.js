(function () {

    angular.module('mainApp').controller('suggestedDonationsController', SuggestedDonationsController);

    function SuggestedDonationsController($scope, $sce, $state, $location, multipartForm, suggestedDonationsService, programTypeService, programService, $translate) {

        var donVM = this;
        donVM.details = null;
        donVM.suggestedDonation = {};
        donVM.suggestedDonationsList = [];
        donVM.programTypesList = [];
        donVM.programList = [];
        donVM.programSubCategoryList = [];
        donVM.isEdit = false;


        donVM.getProgramTypes = getProgramTypes;
        donVM.getProgramList = getProgramList;
        donVM.getProgramSubCategoryList = getProgramSubCategoryList;

        donVM.getSuggestedDonationsList = getSuggestedDonationsList;
        donVM.saveSuggestedDonations = saveSuggestedDonations;
        donVM.editSuggestedDonations = editSuggestedDonations;
        donVM.deleteSuggestedDonations = deleteSuggestedDonations;
        donVM.resetForm = resetForm;

        function getProgramTypes() {
            programTypeService.getProgramTypes().then(function (res) {
                donVM.programTypesList = res.data;
            });
        }
        function getProgramList(typeId) {
            programService.getProgramByTypeId(typeId).then(function (res) {
                donVM.programList = res.data;
                //donVM.programSubCategoryList = [];
            });
        }
        function getProgramSubCategoryList(programId) {
            programService.getProgramById(programId).then(function (res) {
                donVM.programSubCategoryList = res.data[0].programSubCategory;
            });
        }
        function getSuggestedDonationsList() {
            suggestedDonationsService.getSuggestedDonationsList().then(function (response) {
                if (response.status == 200) {
                    donVM.suggestedDonationsList = response.data;
                }
            });
        }
        function saveSuggestedDonations(isValid) {
            let size = donVM.isEdit ? donVM.suggestedDonationsList.length - 1 : donVM.suggestedDonationsList.length;
            if (size < 3) {
                if (isValid) {
                    let language = localStorage.getItem('lang');
                    donVM.details.language = language;
                    suggestedDonationsService.saveSuggestedDonations(donVM.details).then(function (response) {
                        if (response.status == 200) {
                            donVM.resetForm();
                            donVM.getSuggestedDonationsList();
                            swal(
                                $translate.instant('Success!'),
                                response.data,
                                'success'
                            );
                        } else {
                            swal(
                                'Failed!',
                                'Failed to save',
                                'error'
                            )
                        }
                    });
                    donVM.isEdit = false;
                }
            } else {
                swal(
                    'Failed!',
                    'Only 3 Donations can save',
                    'error'
                )
            }
        }
        function deleteSuggestedDonations(id) {
            if (id) {
                suggestedDonationsService.deleteSuggestedDonation(id).then(function (response) {
                    if (response.status == 200) {
                        donVM.getSuggestedDonationsList();
                        swal(
                            $translate.instant('Success!'),
                            response.data,
                            'success'
                        );
                    } else {
                        swal(
                            'Failed!',
                            'Failed to delete',
                            'error'
                        )
                    }
                });
            }
        }
        function editSuggestedDonations(donation) {
            if (donation) {
                donVM.getProgramList(donation.programType[0]._id);
                donVM.getProgramSubCategoryList(donation.program[0]._id);
                donVM.details = {
                    programType: donation.programType[0]._id,
                    program: donation.program[0]._id,
                    programSubCategory: donation.programSubCategory.length > 0 ? donation.programSubCategory[0]._id : '',
                    _id:donation._id
                }
                donVM.isEdit = true;
            }
        }
        function resetForm() {
            donVM.details = {};
            donVM.suggestedDonation = {};
            donVM.programList = [];
            donVM.programSubCategoryList = [];
            donVM.isEdit = false;
        }
    }
})()