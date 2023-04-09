(function () {

    angular.module('mainApp').factory('userService', userService);

    function userService($http) {
        return {
            registerUser: registerUser,
            updateUser: updateUser,
            getUsers: getUsers,
            deleteUser: deleteUser,
            getUserById: getUserById,
            registerGuestUser:registerGuestUser,
            achievementRates: achievementRates,
            getAchievementRates:getAchievementRates,
            getGuestUserByDonorId:getGuestUserByDonorId,
        }
        //pulish new user
        function registerUser(content) {
           return $http({
                method: 'post',
                url: '/api/user/add',
                data: content,
                headers: { 'Content-Type': 'application/json' },
            }).then(function onSuccess(response) {
                return response;
            },function onError(error) {
                return error;
            });
        }
        function achievementRates(obj){
            return $http({
                method: 'POST',
                url: '/api/achievementRate/add',
                data: obj,
                headers: { 'Content-Type': 'application/json' },
            }).then(function onSuccess(response) {
                return response;
            },function onError(error) {
                return error;
            });   
        }
        function getAchievementRates(currencyTitle){
            return $http({
                method: 'GET',
                url: `api/achievementRate/fetch/${currencyTitle}`,
                headers: { 'Content-Type': 'application/json' },
                
            }).then(function onSuccess(response) {
                return response;
            },function onError(error) {
                return error;
            });   
        }
        function registerGuestUser(content) {
           return $http({
                method: 'post',
                url: '/api/user/addGuest',
                data: content,
                headers: { 'Content-Type': 'application/json' },
            }).then(function onSuccess(response) {
                return response;
            },function onError(error) {
                return error;
            });
        }
        function updateUser(content) {
            return $http({
                method: 'put',
                url: '/api/user/update',
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
        function getUsers() {
            return $http({
                method: 'get',
                url: '/api/user/list',
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
        function getUserById(userId) {
            return $http({
                method: 'get',
                url: '/api/user/getSpecificUser/' + userId,
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
        function getGuestUserByDonorId(userId) {
            return $http({
                method: 'get',
                url: '/api/user/getGuestUserByDonorId/' + userId,
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
        function deleteUser(userId) {
            return $http({
                method: 'delete',
                url: '/api/user/delete/' + userId + '',

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