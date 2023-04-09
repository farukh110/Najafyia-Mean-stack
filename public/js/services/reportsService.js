(function () {

    angular.module('mainApp').factory('reportsService', ReportsService);

    function ReportsService($http) {
        return {
            getDonarWiseReport: getDonarWiseReport,
            getDonations: getDonations,
            getRecurringDonations: getRecurringDonations,
            getKhumsReport: getKhumsReport,
            getProfileReport: getProfileReport,
            getProjectionReport: getProjectionReport,
            getStudentSponsorhsip: getStudentSponsorhsip,
            getOrphanScholarship: getOrphanScholarship
        }

        function getDonarWiseReport(params) {
            return $http({
                method: 'GET',
                url: '/api/report/donarWiseReport',
                params: params,
                headers: {'Content-Type': 'application/json'},
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
        function getProjectionReport(params) {
            return $http({
                method: 'GET',
                url: '/api/report/projectionReport',
                params: params,
                headers: {'Content-Type': 'application/json'},
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

        function getDonations() {
            return $http({
                method: 'GET',
                url: '/api/report/getDonations',
                headers: {'Content-Type': 'application/json'},
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

        function getRecurringDonations() {
            return $http({
                method: 'GET',
                url: '/api/report/getRecurringDonations',
                headers: {'Content-Type': 'application/json'},
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

        function getKhumsReport() {

            return $http({
                method: 'GET',
                url: '/api/report/khumsReport/',
                headers: {'Content-Type': 'application/json'},
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

        function getProfileReport() {

            return $http({
                method: 'GET',
                url: '/api/report/profileReport/',
                headers: {'Content-Type': 'application/json'},
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

        function getOrphanScholarship() {

            return $http({
                method: 'GET',
                url: '/api/report/sponsorshipReportOrphan/',
                headers: {'Content-Type': 'application/json'},
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

        function getStudentSponsorhsip() {

            return $http({
                method: 'GET',
                url: '/api/report/sponsorshipReportStudent/',
                headers: {'Content-Type': 'application/json'},
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