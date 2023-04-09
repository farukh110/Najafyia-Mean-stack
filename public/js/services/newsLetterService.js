(function () {

    angular.module('mainApp').factory('newsLetterService', NewsLetterService);

    function NewsLetterService($http) {
        return {
            addSubscription: addSubscription,
            unSubscribe: unSubscribe,
            getNewsletterList: getNewsletterList
        }
        function addSubscription(params) {
            return $http({
                method: 'POST',
                url: '/api/newsletterSubscription/subscribe',
                data: params,
                headers: { 'Content-Type': 'application/json' },
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

        function getNewsletterList() {
            return $http({
                method: 'get',
                url: '/api/newsletterSubscription/list',
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

        function unSubscribe(params) {
            return $http({
                method: 'POST',
                url: '/api/newsletterSubscription/unSubscribe',
                data: params,
                headers: { 'Content-Type': 'application/json' },
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