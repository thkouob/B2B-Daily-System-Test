//http://www.typescriptlang.org/Handbook#classes
var ProjectStatus = (function () {
    function ProjectStatus(pNumber, pName, sMName, cDate, jiraStatus, drStatus) {
        this.ProjectNumber = pNumber;
        this.ProjectName = pName;
        this.SMName = sMName;
        this.CreateDate = cDate;
        this.JIRAStatus = jiraStatus;
        this.DRStatus = drStatus;
    }
    return ProjectStatus;
})();
//http://confluence.newegg.org/display/TCBB/TypeScript+Share
var DRStatus;
(function (DRStatus) {
    DRStatus[DRStatus["none"] = 0] = "none";
    DRStatus[DRStatus["process"] = 1] = "process";
    DRStatus[DRStatus["done"] = 2] = "done";
    DRStatus[DRStatus["error"] = 3] = "error";
})(DRStatus || (DRStatus = {}));
var JIRAStatus;
(function (JIRAStatus) {
    JIRAStatus[JIRAStatus["none"] = 0] = "none";
    JIRAStatus[JIRAStatus["process"] = 1] = "process";
    JIRAStatus[JIRAStatus["done"] = 2] = "done";
    JIRAStatus[JIRAStatus["error"] = 3] = "error";
})(JIRAStatus || (JIRAStatus = {}));
angular.module('mvcapp', [])
    .factory('projectService', ['$http', function ($http) {
        //TODO Get API Data
        //$http.get('Url')
        //    .then(function (response) {
        //    }, function (response) {
        //
        //    });
        var mockData = [];
        mockData.push(new ProjectStatus(12815, "B2B_WWW Newkit phase I", "Sean.Z.Chen", "2015/12/19", JIRAStatus.process, DRStatus.done));
        mockData.push(new ProjectStatus(12778, "B2B_WWW 2016 CW 2-4:BOM Phase III & Prodcut Fix", "Jac.T.Wang", "2015/12/18", JIRAStatus.done, DRStatus.done));
        mockData.push(new ProjectStatus(12777, "B2B_WWW Newkit phase II", "Sean.Z.Chen", "2015/12/17", JIRAStatus.done, DRStatus.process));
        mockData.push(new ProjectStatus(12776, "B2B_WWW 2016 CW 2-3:BOM Phase II", "Jac.T.Wang", "2015/12/16", JIRAStatus.done, DRStatus.done));
        return {
            DataList: mockData
        };
    }])
    .controller('indexCtrl', ['$scope', '$sce', 'projectService', function ($scope, $sce, projectService) {
        $scope.DataList = projectService.DataList;
        $scope.GetTdClass = function (value) {
            //https://docs.angularjs.org/api/ng/service/$sce
            return value == DRStatus.process || value == JIRAStatus.process ? $sce.trustAsHtml('<p class="fa fa-spinner" /><span>x</span>') : $sce.trustAsHtml('<p class="fa fa-check" /><span>v</span>');
        };
        $scope.SearchVal;
        $scope.RemoveSearchVal = function () {
            $scope.SearchVal = null;
        };
    }]);
//# sourceMappingURL=Demo.js.map