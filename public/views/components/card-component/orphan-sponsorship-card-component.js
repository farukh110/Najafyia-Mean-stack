(function (angular) {
    angular.module('mainApp').component('orphanSponsorshipCardComponent', {
      templateUrl: 'views/components/card-component/orphan-sponsorship-card-component.html',
      bindings: {
      },
      controllerAs: 'ctrl',
      controller: ['$scope', function ($scope) {
        this.$onInit = function () {
          var vm = this;
          console.log(vm);
       
  
          
        }
  
       
  
      }]
    });
  })(window.angular);