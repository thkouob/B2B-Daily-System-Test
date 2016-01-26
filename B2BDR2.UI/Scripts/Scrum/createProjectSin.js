angular.module('scrumModule', [])
    .factory('projectMiscService', ['$http', function ($http) {
        //TODO Get API Data
        //$http.get('Url')
        //    .then(function (response) {
        //    }, function (response) {
        //
        //    });
        var mockData = [];
        return {
            DataList: mockData
        };
    }])
    .controller('createProjectCtrl', ['$scope', '$sce', 'projectMiscService', function ($scope, $sce, projectMiscService) {
        $scope.DataList = projectMiscService.DataList;
    }]);
//# sourceMappingURL=createProjectSin.js.map