(function () {

    angular.module('mainApp').factory('donationProcessService', donationProcessService);
    function donationProcessService($http) {
        return {
            addDonationProcess: addDonationProcess,
        }
        //create new Category
        function addDonationProcess(donationProcess) {
            return $http({
                method: 'post',
                url: '/api/donationProcess/add',
                data: donationProcess,
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