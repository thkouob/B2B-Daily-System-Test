(function () {
    angular.module('mvcapp', ['UtilityCommon'])
        .controller('indexCtrl', ['$scope', 'DR2Service',
        function ($scope, DR2Service) {
            DR2Service.GetProjectStatus.then(function (data) {
                $scope.DataList = data;
            }, function (response) {
            });
            $scope.SearchVal;
            $scope.RemoveSearchVal = function () {
                $scope.SearchVal = "";
            };
        }]);
})();
//# sourceMappingURL=ProjectStatus.js.map