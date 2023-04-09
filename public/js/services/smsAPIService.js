(function () {

    angular.module('mainApp').factory('smsAPIService', smsAPIService);

    function smsAPIService($http) {
        return {
            sendSms:sendSms

        }
        function sendSms(msg,to) {
            var username= "info@najafyia.org";
            var password = "NeCuXnFD";
            var handle = "9f011a0123544438323072c57caf1a08";
            var userid= "14481";
            var from = "Al-Najfyia";
            return $http({
                method: 'get',
                url: 'https://api.smsglobal.com/http-api.php?action=sendsms&user='+username+'&password='+password+'&from='+from+'&to='+to+'&text='+msg,
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
