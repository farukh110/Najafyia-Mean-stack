(function () {

    angular.module('mainApp').factory('manageOrphanService', ManageOrphanService);

    function ManageOrphanService($http) {
        return {
            getOrphansRecurring: getOrphansRecurring,
            changeOrphan: changeOrphan,
            cancelOrphan: cancelOrphan,
            updateSponsorship: updateSponsorship
        }

        function getOrphansRecurring() {
            return $http({
                method: 'get',
                params: { language: localStorage.getItem('lang') },
                url: '/api/manageOrp/getOrphansRecurring/',
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

        function changeOrphan(content) {
            return $http({
                method: 'post',
                url: '/api/manageOrp/changeOrphan/',
                data: content,
                headers: { 'Content-Type': 'application/json' },
                success: (function (response) {
                    return response;
                }),
                error: (function (error) {
                    return error;
                }
                )
            });
        }

        function cancelOrphan(content) {
            return $http({
                method: 'post',
                url: '/api/manageOrp/cancelOrphan',
                data: content,
                headers: { 'Content-Type': 'application/json' },
                success: (function (response) {
                    return response;
                }),
                error: (function (error) {
                    return error;
                }
                )
            });
        }

        function updateSponsorship(content) {
            return $http({
                method: 'post',
                url: '/api/manageOrp/updateSponsorship/',
                data: content,
                headers: { 'Content-Type': 'application/json' },
                success: (function (response) {
                    return response;
                }),
                error: (function (error) {
                    return error;
                }
                )
            });
        }

    }
})()