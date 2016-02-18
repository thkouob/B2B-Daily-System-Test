class ProjectStatus2 implements IProjectStatus {
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

enum JIRAStatus2 {
    none = 0,
    process = 1,
    done = 2,
    error = 3
}

enum DRStatus2 {
    none = 0,
    process = 1,
    done = 2,
    error = 3
}

angular.module('mvcapp', [])
    .constant('DR2Config', {
        PersonSessionKey: "personList"
    })
    .filter('fullToUidName', ['DR2Service', function (DR2Service) {
        var data = null, serviceInvoked = false;

        function logicData(input) {
            if (data !== null) {
                angular.forEach(data, function (value: IDR2Person, key) {
                    if (angular.isString(input) && input.toLowerCase() === value.Name.toLowerCase()) {
                        return input = value.UID;
                    }
                });
            }
            return input;
        }

        var resultFn = <StatefulFunction>function (input) {
            if (data === null) {
                if (!serviceInvoked) {
                    serviceInvoked = true;
                    DR2Service.GetPersonList.then(function (personList) {
                        data = personList;
                    }, function () {
                        data = null;
                    })
                }
                return input;
            } else {
                return logicData(input);
            }
        };
        //https://docs.angularjs.org/guide/filter
        resultFn.$stateful = true;
        return resultFn;
    }])
    .filter('uidToFullName', ['DR2Service', function (DR2Service) {

        var data = null, serviceInvoked = false;

        function logicData(input) {
            if (data !== null) {
                angular.forEach(data, function (value: IDR2Person, key) {
                    if (angular.isString(input) && input.toLocaleLowerCase() == value.UID.toLocaleLowerCase()) {
                        return input = value.Name;
                    }
                });
            }
            return input;
        }

        var resultFn = <StatefulFunction>function (input) {
            if (data === null) {
                if (!serviceInvoked) {
                    serviceInvoked = true;
                    DR2Service.GetPersonList.then(function (personList) {
                        data = personList;
                    }, function () {
                        data = null;
                    })
                }
                return input;
            } else {
                return logicData(input);
            }
        };
        //https://docs.angularjs.org/guide/filter
        resultFn.$stateful = true;
        return resultFn;
    }])
    .factory('storageHelper', function () {
        function GetSessionStorageItem(key, isString: boolean = false) {
            var data = window.sessionStorage.getItem(key);
            if (isString) {
                return data;
            }
            return angular.fromJson(data);
        }

        function SetSessionStorageItem(key, data: any) {
            if (!angular.isString(data)) {
                data = angular.toJson(data)
            }
            window.sessionStorage.setItem(key, data);
        }

        return {
            GetSessionStorageItem: GetSessionStorageItem,
            SetSessionStorageItem: SetSessionStorageItem
        }
    })
    .factory('DR2Service', ['$http', '$q', 'DR2Config', 'storageHelper', function ($http: ng.IHttpService, $q: ng.IQService, DR2Config, storageHelper) {
        var url = '/base/GetPersonInfo';

        function GetOriginPersonData(url) {
            return $http.get(`${url}/Person`, { cache: true });
        }

        function GetPersonList(url) {
            var deffered = $q.defer();
            var personInfo = storageHelper.GetSessionStorageItem(DR2Config.PersonSessionKey);

            if (personInfo === undefined || personInfo === null) {
                GetOriginPersonData(url).then(function (response) {
                    var personList = [];
                    angular.forEach(response.data, function (value: IDR2Person, key) {
                        personList.push(
                            new DR2Person(value.FirstName, value.GroupId, value.MemberTypeDesc,
                                value.MemberType, value.Name, value.Titile, value.UID));
                    });
                    storageHelper.SetSessionStorageItem(DR2Config.PersonSessionKey, personList);
                    deffered.resolve(personList);
                }, function (response) {
                    deffered.reject(response);
                });
            } else {
                deffered.resolve(angular.fromJson(personInfo));
            }

            return deffered.promise;
        }

        return {
            GetPersonList: GetPersonList(url)
        }
    }])
    .factory('projectService', ['$http', function ($http: ng.IHttpService) {

        var mockData: Array<ProjectStatus2> = [];

        mockData.push(new ProjectStatus2(12815, "B2B_WWW Newkit phase I", "Sean.Z.Chen", "2015/12/19", JIRAStatus2.process, DRStatus2.done));
        mockData.push(new ProjectStatus2(12778, "B2B_WWW 2016 CW 2-4:BOM Phase III & Prodcut Fix", "Jac.T.Wang", "2015/12/18", JIRAStatus2.done, DRStatus2.error));
        mockData.push(new ProjectStatus2(12777, "B2B_WWW Newkit phase II", "Sean.Z.Chen", "2015/12/17", JIRAStatus2.done, DRStatus2.process));
        mockData.push(new ProjectStatus2(12776, "B2B_WWW 2016 CW 2-3:BOM Phase II", "Jac.T.Wang", "2015/12/16", JIRAStatus2.done, DRStatus2.none));

        return {
            DataList: mockData
        }
    }])
    .controller('indexCtrl', ['$scope', '$sce', 'projectService', '$filter', 'DR2Service',
        function ($scope, $sce: ng.ISCEService, projectService, JiraService, $filter, DR2Service) {

            $scope.DataList = projectService.DataList;

            $scope.GetTdClass = function (value) {
                var statusCss;
                switch (value) {
                    case JIRAStatus2.done:
                        statusCss = '<p class="fa fa-check" title="Done" />'
                        break;
                    case JIRAStatus2.error:
                        statusCss = '<p class="fa fa-times" title="Error" />'
                        break;
                    case JIRAStatus2.process:
                        statusCss = '<p class="fa fa-spinner" title="Processing..." />'
                        break;
                }
                return $sce.trustAsHtml(statusCss);
            }

            $scope.SearchVal;

            $scope.RemoveSearchVal = function () {
                $scope.SearchVal = "";
            }

        }]);