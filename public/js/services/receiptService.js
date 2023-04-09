(function () {

    angular.module('mainApp').factory('receiptService', receiptService);

    function receiptService($http) {
        return {
            getReceiptDetails: getReceiptDetails,
            sendReceipt: sendReceipt,
            getKhumsReceipts: getKhumsReceipts

        }
        //pulish new user
        function getReceiptDetails() {
            return $http({
                method: 'get',
                url: '/api/donation/receiptsDetails',
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
        function sendReceipt(receiptBody) {
            return $http({
                method: 'post',
                url: '/api/sendReceiptEmail',
                headers: { 'Content-Type': 'application/json' },
                data: receiptBody,
                success: (function (response) {
                    return response;
                }),
                error: (function (error) {
                    return error;
                }
                )
            });
        }
        function getKhumsReceipts() {
            return $http({
                method: 'get',
                url: '/api/donation/khumsReceipts',
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