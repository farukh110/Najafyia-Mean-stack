(function () {

    angular.module('mainApp').factory('orphanService', orphanService);
    function orphanService($http) {
        return {
            addOrphan: addOrphan,
            addOrphansList: addOrphansList,
            getOrphans: getOrphans,
            getOrphanById: getOrphanById,
            deleteOrphan: deleteOrphan,
            updateOrphan: updateOrphan,
            getOrphansByCount: getOrphansByCount,
            getOrphanListWithPriority: getOrphanListWithPriority,
            getOrphanListWithNoPriority: getOrphanListWithNoPriority,
            updateSelectedOrphan : updateSelectedOrphan,
            getSelectedOrphansStatus: getSelectedOrphansStatus,
            filterOrphanPopupItems:filterOrphanPopupItems
        }
        //create new Orphan
        function addOrphansList(orphans) {
            return $http({
                method: 'post',
                url: '/api/orphan/addList',
                data: orphans,
                headers: { 'Content-Type': 'application/json' },
                success: (function (response) {
                    return response.data;
                }),
                error: (function (error) {
                    return error;
                })
            });
        }
        function addOrphan(orphanData) {
            return $http({
                method: 'post',
                url: '/api/orphan/add',
                data: orphanData,
                headers: { 'Content-Type': 'application/json' },
                success: (function (response) {
                    return response.data;
                }),
                error: (function (error) {
                    return error;
                })
            });
        }
        //Function to get all orphans
        function getOrphans() {
            return $http({
                method: 'get',
                url: '/api/orphan/list',
                params: { language: localStorage.getItem('lang') },
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
        //Function to get Orphan by Id
        function getOrphanById(orphanId) {
            return $http({
                method: 'get',
                url: '/api/orphan/item/' + orphanId,
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
        //Function to Actiave/Deactiave Orphan Profile
        function deleteOrphan(orphanId, isActive) {
            return $http({
                method: 'delete',
                url: '/api/orphan/delete/' + orphanId + '',
                params: { isActive },
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
        //Function to update Orphan
        function updateOrphan(content) {
            return $http({
                method: 'put',
                url: '/api/orphan/update',
                data: content,
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
        function getOrphansByCount(orphanCount, isSyed, Gender) {
            return $http({
                method: 'get',
                params: { language: localStorage.getItem('lang') },
                url: '/api/orphan/orphanCount/' + orphanCount + '/' + isSyed + '/' + Gender,
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

        function getOrphanListWithPriority() {
            return $http({
                method: 'get',
                url: '/api/orphan/OrphanListWithPriority',
                params: { language: localStorage.getItem('lang') },
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
        function getOrphanListWithNoPriority() {
            return $http({
                method: 'get',
                params: { language: localStorage.getItem('lang') },
                url: '/api/orphan/OrphanListWithNoPriority',
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


        function updateSelectedOrphan(orphanIdArray) {
            return $http({
                method: 'put',
                data:  orphanIdArray ,
                url: '/api/orphan/updateSelectedOrphan',
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

        function getSelectedOrphansStatus(orphanIdArray) {
            return $http({
                method: 'get',
                params: { language: localStorage.getItem('lang') , oprhanArray : orphanIdArray },
                url: '/api/orphan/getSelectedOrphansStatus',
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

        function filterOrphanPopupItems(gender , descent , completeList){

            let filteredList;

            if(gender == 'Any' && descent == 'Any')
            {
                filteredList =  completeList;
            }
            else if(gender == 'Any' && descent != 'Any'){
      
                filteredList =  completeList.filter(orphan => orphan.descent == descent  );
            }
            else if(gender != 'Any' && descent == 'Any'){
                filteredList =  completeList.filter(orphan => orphan.gender == gender  );
            }
            else if(gender != 'Any' && descent != 'Any'){
                filteredList =  completeList.filter(orphan => orphan.gender == gender  && orphan.descent == descent  );
            }

            return filteredList;
        }


        








    }
})()