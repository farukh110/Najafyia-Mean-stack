(function () {

    angular.module('mainApp').factory('webSettingsService', WebSettingsService);

    function WebSettingsService($http) {
        return {
            getWebSettings: getWebSettings,
            saveWebSettings: saveWebSettings
        }

        function getWebSettings() {
            return $http({
                method: 'GET',
                url: '/api/webSettings/get',
                headers: {'Content-Type': 'application/json'},
                success: (function (response) {
                    return response.data;
                }),
                error: (function (error) {
                        return error;
                    }
                )
            }).catch(function (e) {
                return e.data;
            });
        }

        function saveWebSettings(params) {
            return $http({
                method: 'POST',
                url: '/api/webSettings/saveUpdate',
                data: params,
                headers: {'Content-Type': 'application/json'},
                success: (function (response) {
                    return response.data;
                }),
                error: (function (error) {
                        return error;
                    }
                )
            }).catch(function (e) {
                return e.data;
            });
        }
    }
})()