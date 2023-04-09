(function () {

    angular.module('mainApp').factory('paymentService', paymentService);
    function paymentService($http) {
        return {
            getPayment: getPayment,
            donationPaymentSave: donationPaymentSave,
        }
        function getPayment(donationId) {
            return $http({
                method: 'get',
                url: '/api/payment/',
                params: {donationId},
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
        function donationPaymentSave(item) {
            return $http({
                method: 'get',
                url: '/api/payment/donationPaymentSave',
                params: item,
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