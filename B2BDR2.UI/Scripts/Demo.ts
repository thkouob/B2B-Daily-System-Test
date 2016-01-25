interface IProjectStatus {
    ProjectNumber: number,
    ProjectName: string,
    SMName: string,
    CreateDate: string,
    JIRAStatus: number,
    DRStatus: number
}
class ProjectStatus implements IProjectStatus {
    ProjectNumber: number;
    ProjectName: string;
    SMName: string;
    CreateDate: string;
    JIRAStatus: number;
    DRStatus: number;
    constructor(pNumber: number, pName: string,
        sMName: string, cDate: string,
        jiraStatus: number, drStatus: number) {
        this.ProjectNumber = pNumber;
        this.ProjectName = pName;
        this.SMName = sMName;
        this.CreateDate = cDate;
        this.JIRAStatus = jiraStatus;
        this.DRStatus = drStatus;
    }
}
enum DRStatus {
    none = 0,
    process = 1,
    done = 2,
    error = 3
}

enum JIRAStatus {
    none = 0,
    process = 1,
    done = 2,
    error = 3
}

angular.module('mvcapp', [])
    .factory('projectService', ['$http', function ($http) {
        var mockData: Array<ProjectStatus> = [];

        mockData.push(new ProjectStatus(12815, "B2B_WWW Newkit phase I", "Sean.Z.Chen", "2015/12/19", JIRAStatus.process, DRStatus.done));
        mockData.push(new ProjectStatus(12778, "B2B_WWW 2016 CW 2-4:BOM Phase III & Prodcut Fix", "Jac.T.Wang", "2015/12/18", JIRAStatus.done, DRStatus.done));
        mockData.push(new ProjectStatus(12777, "B2B_WWW Newkit phase II", "Sean.Z.Chen", "2015/12/17", JIRAStatus.done, DRStatus.process));
        mockData.push(new ProjectStatus(12776, "B2B_WWW 2016 CW 2-3:BOM Phase II", "Jac.T.Wang", "2015/12/16", JIRAStatus.done, DRStatus.done));

        return {
            DataList: mockData
        }
    }])
    .controller('indexCtrl', ['$scope', '$sce', 'projectService', function ($scope, $sce: ng.ISCEService, projectService) {
        $scope.DataList = projectService.DataList;
        $scope.GetTdClass = function (value) {
            return value == DRStatus.process || value == JIRAStatus.process ? $sce.trustAsHtml('<p class="fa fa-spinner" /><span>x</span>') : $sce.trustAsHtml('<p class="fa fa-check" /><span>v</span>');
        }
    }]);