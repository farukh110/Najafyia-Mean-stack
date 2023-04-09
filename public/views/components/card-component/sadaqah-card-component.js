(function (angular) {
    angular.module('mainApp').component('sadaqahCardComponent', {
      templateUrl: 'views/components/card-component/sadaqah-card-component.html',
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