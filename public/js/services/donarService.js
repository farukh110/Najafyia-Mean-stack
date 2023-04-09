(function () {

    angular.module('mainApp').factory('donarService', donarService);

    function donarService($http) {
        return {
            registerDonar: registerDonar,
            updateDonar: updateDonar,
            getDonars: getDonars,
            deleteDonar: deleteDonar,
            getDonarById: getDonarById,
            addAccountDetail: addAccountDetail,
            updateProfile: updateProfile,
            sentEmailToDonor: sentEmailToDonor
        }
        //Add account details of donar
        function addAccountDetail(donar) {
            return $http({
                method: 'post',
                url: '/api/donar/update',
                data: donar,
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
        //pulish new donar  
        function registerDonar(content) {
            return $http({
                method: 'post',
                url: '/api/donar/add',
                data: content,
                headers: { 'Content-Type': 'application/json' },
            }).then(function onSuccess(response) {
                return response;
            },function onError(error) {
                return error;
            });
        }
        function updateDonar(content) {
            return $http({
                method: 'put',
                url: '/api/donar/update/',
                data: content,
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
        function getDonars() {
            return $http({
                method: 'get',
                url: '/api/donar/list',
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
        function getDonarById(userId) {
            return $http({
                method: 'get',
                url: '/api/donar/' + userId,
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
        function deleteDonar(donarId) {
            return $http({
                method: 'delete',
                url: '/api/donar/delete/' + donarId + '',

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
        function updateProfile(params) {
            return $http({
                method: 'put',
                url: '/api/user/update',
                data: params,
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
        function sentEmailToDonor(donor) {
            return $http({
                method: 'post',
                url: '/api/sendEmail',
                headers: { 'Content-Type': 'application/json' },
                data: donor,
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