(function () {

    angular.module('mainApp').factory('roleCheckService', roleCheckService);

    function roleCheckService($http) {
        return {
            checkRole: checkRole
        }
        function checkRole(role) {
            if(role && role.length) {
                if(role.findIndex(r=> r === 'admin') > -1) return 'admin';
                if(role.findIndex(r => r === 'accountant') > -1 ) return 'accountant';
                if(role.findIndex(r => r === 'currency') > -1 ) return 'currency';

            }
        }
    }
})();