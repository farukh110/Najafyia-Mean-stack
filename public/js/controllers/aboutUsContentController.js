(function () {

    angular.module('mainApp').controller('aboutUsContentController', AboutUsContentController);

    function AboutUsContentController($scope, $sce, $state, $location, $compile, $window, multipartForm) {

        var pageVM = this;
        pageVM.pageData = null;
        pageVM.pageContentForm = null;
        pageVM.pageDetails = {};

        pageVM.getPageContent = getPageContent;
        pageVM.savePageContent = savePageContent;
        pageVM.resetForm = resetForm;

        function getPageContent() {

        }

        function savePageContent(isValid) {
            if (isValid) {

            }
        }

        function resetForm() {
            pageVM.pageName = null;
            pageVM.pageDetails = {};
        }

    }
})()