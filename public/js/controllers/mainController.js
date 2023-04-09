(function () {

    angular.module('mainApp').controller('mainController', mainController);
    function mainController($rootScope) {
        var vm = this;
        // $rootScope.$on('userDetail', function (event, data) {
        //     $rootScope.userDetail = data;
        //     vm.userDetail = $rootScope.userDetail;
            // get current loggedIn user role from localStorage
            let userRole = localStorage.getItem('userRole');
            // if (vm.userDetail && vm.userDetail.role && vm.userDetail.role.length) {
            //     vm.restrictedRoles = vm.userDetail.role;
                // For Accountant/Finance
               if(userRole === "super admin") {
                    vm.isAdmin = true;
                    vm.isAccountant = true;
                    vm.isContentEditor = true;
                    vm.isCurrencyEditor = true;
                } else {
                    if (userRole === 'Accountant/Finance') {
                        vm.isAccountant = true;
                    }
                    if (userRole === 'Content Editor') {
                        vm.isContentEditor = true;
                    }
                    if (userRole === 'Currency Editor') {
                        vm.isCurrencyEditor = true;
                    }
                    if (userRole === 'admin') {
                        vm.isAdmin = true;
                    }
                }



            }
        // })

    // }
})()