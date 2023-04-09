(function () {

    angular.module('mainApp').factory('donorProgramService', DonorProgramService);

    function DonorProgramService($http) {
        return {
            getUserDonations: getUserDonations,
            getUserDonationDetails: getUserDonationDetails,
            cancelSubscription: cancelSubscription,
            toggleAutoRenewal: toggleAutoRenewal,
            getDonorProgramDetails : getDonorProgramDetails
        }

        function getUserDonations() {
            return $http({
                method: 'GET',
                url: '/api/donation/getDonationListByUser',
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



        function getUserDonationDetails(language) {
            return $http({
                method: 'GET',
                url: '/api/donorProgram/getdonorProgramsListByUser/'+ language, 
                headers: {'Content-Type': 'application/json'},
                success: (function (response) {
                    return response.data; 
                } ),
                error: (function (error) {
                        return error;
                    }
                )

            });
        }

        function cancelSubscription(stripeSubscriptionId) {
            return $http({
                method: 'POST',
                url: '/api/donorProgram/cancelSubscription/'+ stripeSubscriptionId,
                headers: { 'Content-Type': 'application/json' },
                success: (function (response) {
                    return response;
                }),
                error: (function (error) {
                    return error;
                }
                )
            });
        }

        function toggleAutoRenewal(donorProgramID,autoRenewFlag) {
            return $http({
                method: 'POST',
                url: '/api/donorProgram/toggleAutoRenewal/' + donorProgramID + '/' + autoRenewFlag,
                headers: { 'Content-Type': 'application/json' },
                success: (function (response) {
                    return response;
                }),
                error: (function (error) {
                    return error;
                }
                )
            });
        }

        function getDonorProgramDetails(donorProgramID) {
            return $http({
                method: 'POST',
                url: '/api/donorProgram/getDonorProgramDetails/'+ donorProgramID,
                headers: { 'Content-Type': 'application/json' },
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