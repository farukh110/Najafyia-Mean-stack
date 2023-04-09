(function () {

    angular.module('mainApp').factory('ziyaratService', ZiyaratService);

    function ZiyaratService($http) {
        return {
            getZiyaratList: getZiyaratList,
            getActiveZiyaratList: getActiveZiyaratList,
            registerForZiyarat: registerForZiyarat,
            getSelectedZiyaratList: getSelectedZiyaratList,
            sendEmailtoZaireen: sendEmailtoZaireen,
            getZiyaratByUserId: getZiyaratByUserId,
            saveZiyaratList: saveZiyaratList,
            getConsultantEmail: getConsultantEmail,
            sendMailConsultant: sendMailConsultant,
            triggerZaireenNotificationStatus:triggerZaireenNotificationStatus,
            validateZaireenNotificationStatus :validateZaireenNotificationStatus,
            getZiyaratSetting :  getZiyaratSetting,
            saveZiyaratSetting : saveZiyaratSetting,
        }
        function getZiyaratList() {
            return $http({
                method: 'GET',
                url: '/api/ziyarat/get',
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
        function sendMailConsultant() {
            return $http({
                method: 'GET',
                url: '/api/sendZaireenList',
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
        function getActiveZiyaratList() {
            return $http({
                method: 'GET',
                url: '/api/ziyarat/getActive',
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
        function getConsultantEmail() {
           
            return $http({
                method: 'GET',
                url: '/api/ziyarat/getConsultantEmail',
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
        function registerForZiyarat(params) {
            return $http({
                method: 'POST',
                url: '/api/ziyarat/save',
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
        function saveZiyaratList(params) {
            return $http({
                method: 'POST',
                url: '/api/ziyarat/saveZiyaratList',
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

        function saveZiyaratSetting(params) {
            return $http({
                method: 'POST',
                url: '/api/ziyarat/saveZiyaratSetting',
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


        



        function getSelectedZiyaratList(fromAdmin) {
            return $http({
                method: 'GET',
                params: { fromAdmin },
                url: '/api/ziyarat/getSelectedZiyaratList',
                headers: { 'Content-Type': 'application/json' },
                success: (function (response) {
                    return response.data;
                }),
                error: (function (error) {
                    return error
                })
            }).catch(function (e) {
                return e.data;
            })
        }

        function getZiyaratSetting() {
            return $http({
                method: 'GET',
                url: '/api/ziyarat/getZiyaratSetting',
                headers: { 'Content-Type': 'application/json' },
                success: (function (response) {
                    return response.data;
                }),
                error: (function (error) {
                    return error
                })
            }).catch(function (e) {
                return e.data;
            })
        }




        function sendEmailtoZaireen() {
            return $http({
                method: 'POST',
                url: '/api/ziyarat/sendEmailtoZaireen',
                headers: { 'Content-Type': 'application/json' },
                success: (function (response) {
                    return response.data;
                }),
                error: (function (error) {
                    return error
                })
            }).catch(function (e) {
                return e.data;
            })
        }

        function triggerZaireenNotificationStatus(params) {
            return $http({
                method: 'POST',
                url: '/api/ziyarat/triggerZaireenNotificationStatus',
                data: params,
                headers: { 'Content-Type': 'application/json' },
                success: (function (response) {
                    return response.data;
                }),
                error: (function (error) {
                    return error
                })
            }).catch(function (e) {
                return e.data;
            })
        }

        function validateZaireenNotificationStatus(consultantId) {
            return $http({
                method: 'GET',
                params: { consultantId },
                url: '/api/ziyarat/validateZaireenNotificationStatus',
                headers: { 'Content-Type': 'application/json' },
                success: (function (response) {
                    return response.data;
                }),
                error: (function (error) {
                    return error
                })
            }).catch(function (e) {
                return e.data;
            })
        }


        function getZiyaratByUserId() {
            return $http({
                method: 'GET',
                url: '/api/ziyarat/getZiyaratByUserId',
                headers: { 'Content-Type': 'application/json' },
                success: (function (response) {
                    return response.data;
                }),
                error: (function (error) {
                    return error
                })
            }).catch(function (e) {
                return e.data;
            })
        }





        
    }
})()