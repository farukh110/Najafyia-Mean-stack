(function () {

    angular.module('mainApp').controller('translateController', TranslateController);

    function TranslateController($rootScope, $scope, $state, $location, translateService) {

        let vm = this;
        vm.getTranslations = getTranslations;
        vm.saveTranslations = saveTranslations;
        vm.getIndexOnValueChange = getIndexOnValueChange;
        vm.lang = localStorage.getItem('lang') || 'ENG';

        function getTranslations() {
            translateService.getTranslations(vm.lang)
                .then(res => {
                    vm.translateList = res.data;
                })
                .catch()
        }
        function saveTranslations(i) {
            // translateService.saveTranslations(vm.translateList[i])
        }
        function getIndexOnValueChange(value,i) {
        }
    }


})()