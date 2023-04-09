(function () {

    angular.module('mainApp').factory('loginService', LoginService);

    function LoginService($http) {
        return {
            login: login,
            logout: logout,
            registration: registration,
            forgotPassword: forgotPassword,
            resetpassword: resetpassword,
            getSession: getSession,
            getLoggedInUserDetails: getLoggedInUserDetails,
            getTodaysCampaigns: getTodaysCampaigns,
            getRecurringDonations: getRecurringDonations,
            getDonarFromUser: getDonarFromUser,
            faceBookLoginService: faceBookLoginService,
            socialLoginAuthentication: socialLoginAuthentication
        }
        function login(params) {
            return $http.post('/api/user/login', params).then(function (response, status) {

                return response;
            }).catch(function (error) {
                return error
            });
        }
        function getSession() {
            return $http({
                method: 'get',
                url: ' /getsession',
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
        function logout() {
            return $http.post('/api/user/logout').then(function (response) {
                return response.data;
            }).catch(function (error) {
                return error
            });
        }
        function socialLoginAuthentication(userEmail) {
            return $http.post('/api/user/socialLoginAuthentication', userEmail).then(function (response) {
                return response.data;
            }).catch(function (error) {
                return error
            });
        }
        function registration(user) {
            return $http({
                url: '/api/user/add',
                method: 'POST',
                data: user,
                headers: { 'Content-Type': 'application/json' }
            }).then(function (response) {
                return response;
            }).catch(function (error) {
                return error
            });
        }
        function forgotPassword(params) {
            return $http({
                url: '/api/user/getUserName/?userName=' + params.username,
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            }).then(function (response) {
                return response.data;
            }).catch(function (error) {
                return error
            });
        }
        function faceBookLoginService() {
            return $http({
                url: '/auth/facebook',
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            }).then(function (response) {
                return response.data;
            }).catch(function (error) {
                return error
            });
        }
        function getDonarFromUser(userId) {
            return $http({
                url: '/api/user/getDonarFromUser/?userId=' + userId,
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            }).then(function (response) {
                return response;
            }).catch(function (error) {
                return error
            });
        }
        function getRecurringDonations(donarId) {
            return $http({
                url: '/api/user/getRecurringDonations/?donarId=' + donarId,
                method: 'GET',
                headers: { 'Contect-Type': 'application/json' }
            }).then(function (reponse) {
                return reponse;
            }).catch(function (error) {
                return error;
            })
        }
        function resetpassword(user) {
            return $http({
                url: '/api/user/updatePassword',
                data: user,
                method: 'PUT',
                headers: { 'Contect-Type': 'application/json' }
            }).then(function (reponse) {
                return reponse.data;
            }).catch(function (error) {
                return error;
            })

        }
        function getLoggedInUserDetails() {
            return $http({
                url: '/api/user/getLoggedInUserDetails',
                method: 'GET',
                headers: { 'Contect-Type': 'application/json' }
            }).then(function (reponse) {
                return reponse.data;
            }).catch(function (error) {
                return error;
            })
        }
        function getTodaysCampaigns() {
            return $http({
                url: '/api/user/getTodaysCampaigns',
                method: 'GET',
                headers: { 'Contect-Type': 'application/json' }
            }).then(function (reponse) {
                return reponse.data;
            }).catch(function (error) {
                return error;
            })
        }
    }

})()