interface IBackLogInfo2 {
    JiraNumber: string;
    JiraLink: string;
    Summary: string;
    SubTaskList: any;
}

interface ISubTaskInfo {
    Role: string;
    Assignee: any;
}

interface IPersonInfo {
    UID: string;
    Name: string;
    Title: string;
    FirstName: string;
    GroupID: number;
    MemberType: number;
    MemberTypeDesc: string;
}

class BacklogInfo2 implements IBackLogInfo2 {
    JiraNumber: string;
    JiraLink: string;
    Summary: string;
    SubTaskList: Array<ISubTaskInfo>;

    constructor(jNumber: string, jLink: string, summary: string) {
        this.JiraNumber = jNumber;
        this.JiraLink = jLink;
        this.Summary = summary;
        this.SubTaskList = [new SubTaskInfo("Dev-UI", []), new SubTaskInfo("Dev-Service", []), new SubTaskInfo("Test", [])];
    }
}

class SubTaskInfo implements ISubTaskInfo {
    Role: string;
    Assignee: Array<PersonInfo>;

    constructor(role: string, assignee: Array<PersonInfo>) {
        this.Role = role;
        this.Assignee = assignee;
    }
}

class PersonInfo implements IPersonInfo {
    UID: string;
    Name: string;
    Title: string;
    FirstName: string;
    GroupID: number;
    MemberType: number;
    MemberTypeDesc: string;

    constructor(uid: string, name: string, title: string, firstName: string, groupID: number, membertype: number, memberTypeDesc: string) {
        this.UID = uid;
        this.Name = name;
        this.Title = title;
        this.FirstName = firstName;
        this.GroupID = groupID;
        this.MemberType = membertype;
        this.MemberTypeDesc = memberTypeDesc;
    }
}

angular.module('scrumModule', ['ngTagsInput', 'ui.bootstrap', 'ngAnimate', 'ngMessages'])
    .factory('DRService', ['$http', function ($http: ng.IHttpService) {
        var getPersonUrl = 'http://10.16.133.102:52332/prj/v1/Person';

        function GetPersonData(url) {
            var personInfoList: Array<PersonInfo> = [];
            $http.get(url)
                .then(function (response) {
                    var result: any = response.data;
                    angular.forEach(result, function (value, key) {
                        personInfoList.push(
                            new PersonInfo(value.UID, value.Name, value.Title, value.FirstName, value.GroupID, value.MemberType, value.MemberTypeDesc));
                    });
                }, function (error) {
                    //// write log / show error alert.
                    console.log(error);
                });
            return personInfoList;
        }

        return {
            GetPersonData: GetPersonData(getPersonUrl)
        }
    }])
    .factory('NodeService', ['$http', function ($http: ng.IHttpService) {
        //var getBackLogUrl = 'http://10.16.133.102:3000/jiraapi/issues';
        var getBackLogUrl = '/base/GetMockNodeBacklogInfo';

        function GetBackLogList(url) {
            var backLogList: Array<BacklogInfo2> = [];
            $http.get(url)
                .then(function (response) {
                    var result: any = response.data;
                    angular.forEach(result.data, function (value, key) {
                        backLogList.push(new BacklogInfo2(value.key, "http://jira/browse/" + value.key, value.summary));
                    });
                    $('#iconLoading').hide();
                    $('#t_BackLog').fadeIn();
                }, function (error) {
                    //// write log / show error alert.
                    console.log(error);
                });
            return backLogList;
        }

        return {
            GetBackLogList: GetBackLogList(getBackLogUrl)
        }
    }])
    .directive('checksmname', ['$filter', function ($filter) {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function ($scope, elm, attrs, ngModel: any) {
                return ngModel.$validators.json = function (modelValue, viewValue) {

                    if (ngModel.$isEmpty(modelValue)) {
                        ngModel.$setValidity("checksmname", true);
                        return true;
                    }
                    var uid = $filter('nameToUid')(modelValue, $scope.PersonData);
                    if (!ngModel.$isEmpty(uid)) {
                        ngModel.$setValidity("checksmname", true);
                        return true;
                    }

                    ngModel.$setValidity("checksmname", false);
                    return false;
                };
            }
        };
    }])
    .directive('drcalander', function () {
        var tpl = '<div class="input-group">' +
            '<input type="text" class="form-control" placeholder= "yyyy/MM/dd" uib-datepicker-popup="{{format}}"' +
            'ng-model="datemodel" is-open="popupDateCalander.opened" close-text="Close" ng-click="openDateCalander()" readonly />' +
            '<span class="input-group-btn" >' +
            '<button type="button" class="btn btn-default" ng-click="openDateCalander()" ><i class="glyphicon glyphicon-calendar" ></i></button>' +
            '</span>' +
            '</div>';
        return {
            restrict: 'E',
            template: tpl,
            replace: true,
            scope: { format: '@', datemodel: '=' },
            link: function (scope: any) {
                scope.openDateCalander = function () {
                    scope.popupDateCalander.opened = true;
                };

                scope.popupDateCalander = {
                    opened: false
                };
            }
        };
    })
    .filter('personData', function () {
        return function (data, query) {
            query = query.toLowerCase();
            var result = [];
            angular.forEach(data, function (value, key) {
                if (value.UID.toLowerCase().startsWith(query) || value.Name.toLowerCase().startsWith(query)) {
                    result.push(value)
                }
            });
            return result;
        }
    })
    .filter('unique', function () {
        return function (items, filterOn) {
            if (filterOn === false) {
                return items;
            }

            if ((filterOn || angular.isUndefined(filterOn)) && angular.isArray(items)) {
                var hashCheck = {},
                    newItems = [];

                var extractValueToCompare = function (item) {
                    if (angular.isObject(item) && angular.isString(filterOn)) {
                        return item[filterOn];
                    } else {
                        return item;
                    }
                };

                angular.forEach(items, function (item) {
                    var valueToCheck, isDuplicate = false;

                    for (var i = 0; i < newItems.length; i++) {
                        if (angular.equals(extractValueToCompare(newItems[i]), extractValueToCompare(item))) {
                            isDuplicate = true;
                            break;
                        }
                    }
                    if (!isDuplicate) {
                        newItems.push(item);
                    }

                });
                items = newItems;
            }
            return items;
        };
    })
    .filter('nameToUid', function () {
        return function (inputName: string = null, datalist: Array<PersonInfo> = null) {
            var result;
            if (inputName !== null && datalist !== null && angular.isString(inputName) && angular.isArray(datalist)) {
                angular.forEach(datalist, function (value: IPersonInfo, key) {
                    if (inputName.toLocaleLowerCase() === value.Name.toLowerCase()) {
                        return result = value.UID;
                    }
                });
            }

            return result;
        };
    })
    .filter('fullToUidName', ['DRService', function (DRService) {
        var data = null, serviceInvoked = false;

        function logicData(input, datasource = null) {
            if (datasource !== null) {
                angular.forEach(datasource, function (value: PersonInfo, key) {
                    if (angular.isString(input) && input.toLowerCase() === value.Name.toLowerCase()) {
                        return input = value.UID;
                    }
                });
            }
            else if (data !== null) {
                angular.forEach(data, function (value: PersonInfo, key) {
                    if (angular.isString(input) && input.toLowerCase() === value.Name.toLowerCase()) {
                        return input = value.UID;
                    }
                });
            }
            return input;
        }

        var resultFn = <StatefulFunction>function (input, datasource = null) {
            if (data === null && datasource === null) {
                if (!serviceInvoked) {
                    serviceInvoked = true;
                    DRService.GetPersonData.then(function (personList) {
                        data = personList;
                    }, function () {
                        data = null;
                    })
                }
                return input;
            } else {
                return logicData(input, datasource);
            }
        };

        //https://docs.angularjs.org/guide/filter
        resultFn.$stateful = true;
        return resultFn;
    }])
    .controller('createProjectCtrl', ['$scope', '$sce', '$filter', 'DRService', 'NodeService',
        function ($scope, $sce: ng.ISCEService, $filter, DRService, NodeService) {
            // Init
            $scope.projectNumber;
            $scope.projectName;
            $scope.scrumMasterName; //TODO: use localStorage to get init
            $scope.scrumMasterUID = function () {
                var result = $filter('nameToUid')($scope.scrumMasterName, $scope.PersonData);
                return result;
            };

            $scope.devGroup; //TODO: use localStorage to get init
            $scope.startDate;
            $scope.startDateFormat = function () {
                return $filter('date')($scope.startDate, 'd/MMM/yy');
            }

            $scope.releaseDate;
            $scope.launchDate;
            $scope.AddedProjectPBInfo = [];
            $scope.BackLogList = NodeService.GetBackLogList;
            $scope.PersonData = DRService.GetPersonData;
            $scope.format = 'yyyy/MM/dd';

            // Function
            $scope.LoadPersonData = function (query) {
                return $filter('personData')($scope.PersonData, query);
            }

            $scope.AddPB = function ($index) {
                var selectedPB: BacklogInfo2 = $scope.BackLogList[$index];
                selectedPB.SubTaskList = [new SubTaskInfo("Dev-UI", []), new SubTaskInfo("Dev-Service", []), new SubTaskInfo("Test", [])];
                $scope.AddedProjectPBInfo.push(selectedPB);
                $scope.BackLogList.splice($index, 1);
            }

            $scope.RemovePB = function ($index, JiraName) {
                var answer = confirm("Remove " + JiraName + " from added list?");
                if (answer) {
                    $scope.BackLogList.push($scope.AddedProjectPBInfo[$index]);
                    $scope.AddedProjectPBInfo.splice($index, 1);
                }
            }

            $scope.GetPBAssignees = function (pb: BacklogInfo2) {
                var allAssignees = [];

                pb.SubTaskList.forEach(function (sub) {
                    sub.Assignee.forEach(function (p) {
                        allAssignees.push(p.FirstName);
                    });
                });
                var pbAssignees = $filter('unique')(allAssignees);
                return pbAssignees.join(", ");
            }
        }]);