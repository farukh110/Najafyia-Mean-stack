(function (angular) {
    angular.module('mainApp').component('orphanSelectionModalComponent', {
      templateUrl: 'views/components/donation-calculator/orphan-selection-modal-component.html',
      bindings: {
        compactmode: "=?"
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