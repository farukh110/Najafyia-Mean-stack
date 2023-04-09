(function () {

    angular.module('mainApp').factory('donarDashboardService', DonarDashboardService);

    function DonarDashboardService($http) {
        return {
            getUserDonations: getUserDonations,
            getUserDonationDetails: getUserDonationDetails,
            getUserRecurringDonations: getUserRecurringDonations,
            getUserGeneralCareDonations: getUserGeneralCareDonations,
            getUserDAZSchoolDonations: getUserDAZSchoolDonations,
            getExpiringSponsorships: getExpiringSponsorships,
            getCountForTotalDonation: getCountForTotalDonation,
            getStudentById: getStudentById,
            updateProfile: updateProfile,
            renewSponsorships: renewSponsorships,
            getAutoRenewTotal:getAutoRenewTotal,
            getRecurringDonationsForMenuVisibility : getRecurringDonationsForMenuVisibility
        }

        function getUserDonations() {
            return $http({
                method: 'GET',
                url: '/api/donation/getDonationListByUser',
                headers: {'Content-Type': 'application/json'},
                success: (function (response) {
                    return response.data;
                }),
                error: (function (error) {
                        return error;
                    }
                )
            });
        }

        function getUserDonationDetails() {
            return $http({
                method: 'GET',
                url: '/api/donation/getDonationDetailsListByUser',
                headers: {'Content-Type': 'application/json'},
                success: (function (response) {
                    return response.data;
                }),
                error: (function (error) {
                        return error;
                    }
                )
            });
        }

        function getUserRecurringDonations() {
            return $http({
                method: 'GET',
                url: '/api/donation/reccurring-by-user-id',
                headers: {'Content-Type': 'application/json'},
                success: (function (response) {
                    return response.data;
                }),
                error: (function (error) {
                        return error;
                    }
                )
            });
        }

        function getCountForTotalDonation(){
            return $http({
                method: 'GET',
                url: '/api/donation/total',
                headers: {'Content-Type': 'application/json'},
                success: (function (response) {
                    return response.data;
                }),
                error: (function (error) {
                        return error;
                    }
                )
            });
        }

        function getUserGeneralCareDonations() {
            return $http({
                method: 'GET',
                url: '/api/orphanSponsorship-by-user-id/list',
                headers: {'Content-Type': 'application/json'},
                success: (function (response) {
                    return response.data;
                }),
                error: (function (error) {
                        return error;
                    }
                )
            });
        }

        function getUserDAZSchoolDonations() {
            return $http({
                method: 'GET',
                url: '/api/studentSponsorship-by-user-id/list',
                headers: {'Content-Type': 'application/json'},
                success: (function (response) {
                    return response.data;
                }),
                error: (function (error) {
                        return error;
                    }
                )
            });
        }

        function getExpiringSponsorships() {
            return $http({
                method: 'GET',
                url: '/api/expiringSponsorship-by-user-id/list',
                headers: {'Content-Type': 'application/json'},
                success: (function (response) {
                    return response.data;
                }),
                error: (function (error) {
                        return error;
                    }
                )
            });
        }
        function getAutoRenewTotal() {
            return $http({
                method: 'GET',
                url: '/api/donation/getAutoRenewTotal',
                headers: {'Content-Type': 'application/json'},
                success: (function (response) {
                    return response.data;
                }),
                error: (function (error) {
                        return error;
                    }
                )
            });
        }

        function renewSponsorships(params) {
            return $http({
                method: 'POST',
                url: '/api/renewSponsorships',
                data: params,
                headers: {'Content-Type': 'application/json'},
                success: (function (response) {
                    return response.data;
                }),
                error: (function (error) {
                        return error;
                    }
                )
            });
        }

        function getStudentById(id) {
            return $http({
                method: 'GET',
                url: '/api/studentProfile/item/' + id,
                headers: {'Content-Type': 'application/json'},
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
                headers: {'Content-Type': 'application/json'},
                success: (function (response) {
                    return response.data;
                }),
                error: (function (error) {
                        return error;
                    }
                )
            });
        }

        function getRecurringDonationsForMenuVisibility() {
            return $http({
                method: 'GET',
                url: '/api/donation/reccurring-for-menu-visibility',
                headers: {'Content-Type': 'application/json'},
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