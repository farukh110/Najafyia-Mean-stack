(function () {

    angular.module('mainApp').factory('campaignService', CampaignService);

    function CampaignService($http) {
        return {
            getCampaigns: getCampaigns,
            getCampaignById: getCampaignById,
            getActiveCampaigns: getActiveCampaigns,
            saveCampaign: saveCampaign,
            deleteCampaign: deleteCampaign,
            deActivateCampaign: deActivateCampaign
        }

        function getCampaigns(lang) {
            return $http({
                method: 'GET',
                url: '/api/campaign/list',
                headers: {
                    'Content-Type': 'application/json',
                    'language': lang
                },
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

        function getCampaignById(id, lang) {
            return $http({
                method: 'GET',
                url: '/api/campaign/get/' + id,
                headers: {
                    'Content-Type': 'application/json',
                    'language': lang
                },
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

        function getActiveCampaigns(lang) {
            return $http({
                method: 'GET',
                url: '/api/campaign/activeList',
                headers: {
                    'Content-Type': 'application/json',
                    'language': lang
                },
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

        function saveCampaign(params) {
            return $http({
                method: 'POST',
                url: '/api/campaign/save',
                data: params,
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

        function deleteCampaign(params) {
            return $http({
                method: 'POST',
                url: '/api/campaign/delete/' + params,
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

        function deActivateCampaign(params) {
            return $http({
                method: 'POST',
                url: '/api/campaign/deActivate',
                data: params,
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