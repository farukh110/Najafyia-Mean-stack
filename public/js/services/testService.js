(function () {

    angular.module('mainApp').factory('testService', TestService);

    function TestService($http) {
        return {
            testcall: testcall
        }

        function testcall() {
            return $http.get('/api/test');
        }
    }

})()