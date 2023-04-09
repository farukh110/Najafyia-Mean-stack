(function () {

    angular.module('mainApp').factory('eventLogsService', eventLogsService);
    function eventLogsService($http) {
        return {
            addEventLog: addEventLog
        }
        //create new Dua
        function addEventLog(eventLogObj) {
            return $http({
                method: 'post',
                url: '/api/insert-eventLogs',
                data: eventLogObj,
                headers: { 'Content-Type': 'application/json' },
                success: (function (response) {
                    return response.data;
                }),
                error: (function (error) {
                    return error;
                }
                )
            });
        }
    }
})()