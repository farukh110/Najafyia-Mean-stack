(function () {

    angular.module('mainApp').controller('testController', TestController);

    function TestController($rootScope , $scope, $state, $location, testService) {

        $scope.testVar = "";

        $scope.checkTest = function () {
            testService.testcall().then(function (response) {
                $scope.testVar = response;
            });
        }
    }


})()