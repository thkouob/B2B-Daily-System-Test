(function () {
    angular.module('mvcapp', ['UtitlityCommon'])
        .controller('indexCtrl', ['$scope', 'DR2Service',
        function ($scope, DR2Service, JiraService) {
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