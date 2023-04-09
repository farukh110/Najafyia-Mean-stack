(function () {

    angular.module('mainApp').factory('logsService', logsService);

    function logsService($http) {
        return {
            insert: insert,
        }
        function insert(log) {
            return $http.post('/api/logs/insert', log).then(function (response, status) {
                return response;
            }).catch(function (error) {
                return error
            });
        }
    }
})();