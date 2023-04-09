(function () {

    angular.module('mainApp').factory('suggestedDonationsService', SuggestedDonationsService);

    function SuggestedDonationsService($http) {
        return {
            getSuggestedDonationsList: getSuggestedDonationsList,
            saveSuggestedDonations: saveSuggestedDonations,
            deleteSuggestedDonation: deleteSuggestedDonation
        }
        function getSuggestedDonationsList() {
            
            return $http({
                method: 'GET',
                url: '/api/suggestedDonations/get/'+localStorage.getItem('lang'),
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
        function saveSuggestedDonations(params) {
            return $http({
                method: 'POST',
                url: '/api/suggestedDonations/save',
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
        function deleteSuggestedDonation(params) {
            return $http({
                method: 'POST',
                url: '/api/suggestedDonations/delete/' + params,
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