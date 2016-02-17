interface IPBInfo {
    IssueKey: string;
    JiraLink: string;
    Summary: string;
    SubTaskList: Array<ISubTaskInfo>;
}

interface ISubTaskInfo {
    RoleName: string;
    Role: number;
    Assignee: Array<IMemberInfo>;
}

interface IMemberInfo {
    UID: string;
    Name: string;
    Title: string;
    FirstName: string;
    GroupID: number;
    MemberType: number;
    MemberTypeDesc: string;
}

interface ICreateProjectRequest {
    ProjectNumber: number;
    ProjectName: string;
    StartDate: string;
    ReleaseDate: string;
    LaunchDate: string;
    DevGruop: number;
    SMUID: string;
    PBList: Array<IPBInfo>;
}

class PBInfo implements IPBInfo {
    IssueId: number;
    IssueKey: string;
    Summary: string;
    JiraLink: string;
    Selected: boolean;
    SubTaskList: Array<SubTaskInfo>;

    constructor(id: number, key: string, link: string, summary: string, selected: boolean) {
        this.IssueId = id;
        this.IssueKey = key;
        this.JiraLink = link;
        this.Summary = summary;
        this.Selected = selected;
        this.SubTaskList = [new SubTaskInfo(3, "Dev-UI", [], ""), new SubTaskInfo(2, "Dev-Service", [], ""), new SubTaskInfo(1, "Test", [], "")];
    }
}

class SubTaskInfo implements ISubTaskInfo {
    RoleName: string;
    Role: number;
    Assignee: Array<MemberInfo>;
    AssigneeUID: string;

    constructor(role: number, roleName: string, assignee: Array<MemberInfo>, uid: string) {
        this.Role = role;
        this.RoleName = roleName;
        this.Assignee = assignee;
        this.AssigneeUID = uid;
    }
}

class MemberInfo implements IMemberInfo {
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

class CreateProjectRequest {
    ProjectNumber: number;
    ProjectName: string;
    StartDate: string;
    ReleaseDate: string;
    LaunchDate: string;
    DevGruop: number; //1:WWW, 2:SSL
    SMUID: string;
    PBList: Array<PBInfo>;

    constructor(prjNumber: number, prjName: string, startDate: string, releaseDate: string, launchDate: string, devGroup: number, smUid: string, pbList: Array<PBInfo>) {
        this.ProjectNumber = prjNumber;
        this.ProjectName = prjName;
        this.StartDate = startDate;
        this.ReleaseDate = releaseDate;
        this.LaunchDate = launchDate;
        this.DevGruop = devGroup; //1:WWW, 2:SSL
        this.SMUID = smUid;
        this.PBList = pbList;
    }
}

angular.module('scrumModule', ['ngTagsInput', 'ui.bootstrap', 'ngAnimate', 'ngMessages'])
    .factory('DRService', ['$http', function ($http: ng.IHttpService) {
        var getPersonUrl = 'http://10.16.133.102:52332/prj/v1/Person';

        function GetMemberData(url) {
            var memberInfoList: Array<MemberInfo> = [];
            $http.get(url)
                .then(function (response) {
                    var result: any = response.data;
                    angular.forEach(result, function (value, key) {
                        memberInfoList.push(
                            new MemberInfo(value.UID, value.Name, value.Title, value.FirstName, value.GroupID, value.MemberType, value.MemberTypeDesc));
                    });
                }, function (error) {
                    //// write log / show error alert.
                    console.log(error);
                });
            return memberInfoList;
        }

        return {
            GetMemberData: GetMemberData(getPersonUrl)
        }
    }])
    .factory('NodeService', ['$http', function ($http: ng.IHttpService) {
        var getBackLogUrl = 'http://10.16.133.102:3000/jiraapi/issues';
        //var getBackLogUrl = '/base/GetMockNodeBacklogInfo';
        var postCreateProjectUrl = 'http://10.16.133.102:3000/jiraapi/project';

        function GetBackLogList() {
            var backLogList: Array<PBInfo> = [];
            $http.get(getBackLogUrl)
                .then(function (response) {
                    var result: any = response.data;
                    angular.forEach(result.data, function (value, key) {
                        backLogList.push(new PBInfo(value.id, value.key, "http://jira/browse/" + value.key, value.summary, true));
                    });
                    $('#iconLoading').hide();
                    $('#t_BackLog').fadeIn();
                }, function (error) {
                    // write log / show error alert.
                    console.log(error);
                });
            return backLogList;
        }

        function PostCreateProject(request: ICreateProjectRequest) {
            debugger;
            $http.post(postCreateProjectUrl, request)
                .then(function (response) {
                    // redirect to project status page.
                    alert("Create Project Success");
                }, function (error) {
                    // write log / show error alert.
                    console.log(error);
                });
        }

        return {
            GetBackLogList,
            PostCreateProject
        }
    }])
    .directive('myAlert', function ($modal, $log) {
        return {
            restrict: 'E',
            scope: {
                mode: '@',
                boldTextTitle: '@',
                textAlert: '@'
            },
            link: function (scope: any, elm, attrs) {

                scope.data = {
                    mode: scope.mode || 'info',
                    boldTextTitle: scope.boldTextTitle || 'title',
                    textAlert: scope.textAlert || 'text'
                }

                var ModalInstanceCtrl = function ($scope, $modalInstance, data) {

                    console.log(data);

                    $scope.data = data;
                    $scope.close = function () {
                        $modalInstance.close($scope.data);
                    };
                };

                elm.parent().bind("click", function (e) {
                    scope.open();
                });

                scope.open = function () {

                    var modalInstance = $modal.open({
                        templateUrl: 'myModalContent.html',
                        controller: ModalInstanceCtrl,
                        backdrop: true,
                        keyboard: true,
                        backdropClick: true,
                        size: 'lg',
                        resolve: {
                            data: function () {
                                return scope.data;
                            }
                        }
                    });


                    modalInstance.result.then(function (selectedItem) {
                        scope.selected = selectedItem;
                    }, function () {
                        $log.info('Modal dismissed at: ' + new Date());
                    });
                }
            }
        };
    })
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
                    var uid = $filter('nameToUid')(modelValue, $scope.memberData);
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
            '<input name="{{name}}" type="text" class="form-control" placeholder= "yyyy/MM/dd" uib-datepicker-popup="{{format}}"' +
            'ng-model="datemodel" is-open="popupDateCalander.opened" close-text="Close" ng-click="openDateCalander()" readonly required />' +
            '<span class="input-group-btn" >' +
            '<button type="button" class="btn btn-default" ng-click="openDateCalander()" ><i class="glyphicon glyphicon-calendar" ></i></button>' +
            '</span>' +
            '</div>';
        return {
            restrict: 'E',
            template: tpl,
            replace: true,
            scope: { format: '@', datemodel: '=', name: '@' },
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
    .directive("modalShow", function () {
        return {
            restrict: "A",
            scope: {
                modalVisible: "="
            },
            link: function (scope: any, element, attrs) {
                //Hide or show the modal
                scope.showModal = function (visible) {
                    if (visible) {
                        element.modal("show");
                    }
                    else {
                        element.modal("hide");
                    }
                }
                //Check to see if the modal-visible attribute exists
                if (!attrs.modalVisible) {
                    //The attribute isn't defined, show the modal by default
                    scope.showModal(true);
                }
                else {
                    //Watch for changes to the modal-visible attribute
                    scope.$watch("modalVisible", function (newValue, oldValue) {
                        scope.showModal(newValue);
                    });

                    //Update the visible value when the dialog is closed through UI actions (Ok, cancel, etc.)
                    element.bind("hide.bs.modal", function () {
                        scope.modalVisible = false;
                        if (!scope.$$phase && !scope.$root.$$phase)
                            scope.$apply();
                    });
                }
            }
        };
    })
    .filter('memberData', function () {
        return function (data, query) {
            query = query.toLowerCase();
            var result = [];
            angular.forEach(data, function (value, key) {
                if (value.UID.toLowerCase().startsWith(query) || value.Name.toLowerCase().startsWith(query)) {
                    result.push({
                        UID: value.UID,
                        Name: value.Name,
                        FirstName: value.FirstName
                    })
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
        return function (inputName: string = null, datalist: Array<MemberInfo> = null) {
            var result;
            if (inputName !== null && datalist !== null && angular.isString(inputName) && angular.isArray(datalist)) {
                angular.forEach(datalist, function (value: IMemberInfo, key) {
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
                angular.forEach(datasource, function (value: MemberInfo, key) {
                    if (angular.isString(input) && input.toLowerCase() === value.Name.toLowerCase()) {
                        return input = value.UID;
                    }
                });
            }
            else if (data !== null) {
                angular.forEach(data, function (value: MemberInfo, key) {
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
                    DRService.GetMemberData.then(function (memberList) {
                        data = memberList;
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
    .controller('createProjectCtrl', ['$scope', '$sce', '$filter', 'DRService', 'NodeService', '$location', '$anchorScroll',
        function ($scope, $sce: ng.ISCEService, $filter, DRService, NodeService, $location: ng.ILocationService, $anchorScroll: ng.IAnchorScrollService) {
            // Init
            $scope.projectNumber;
            $scope.projectName;
            $scope.scrumMasterName; //TODO: use localStorage to get init
            $scope.devGroup = 1; //TODO: use localStorage to get init: OOO || 1
            $scope.startDate;
            $scope.releaseDate;
            $scope.launchDate;
            $scope.addedProjectPBInfo = [];
            $scope.backLogList = NodeService.GetBackLogList();
            $scope.memberData = DRService.GetMemberData;
            $scope.format = 'yyyy/MM/dd';
            $scope.showDialog;

            // Function
            $scope.scrumMasterUID = function () {
                var result = $filter('nameToUid')($scope.scrumMasterName, $scope.memberData);
                return result;
            };

            $scope.FormatDate = function (date) {
                return $filter('date')(date, 'd/MMM/yy');
            }

            $scope.OpenModal = function () {
                $scope.drform.$setSubmitted();
                if ($scope.drform.$valid) {
                    $scope.showDialog = true;
                } else {
                    $location.hash('top');
                    $anchorScroll();
                }
            }

            $scope.CloseModal = function () {
                $scope.showDialog = false;
            }

            //Load all member data use to autocomplete.
            $scope.LoadMemberData = function (query) {
                return $filter('memberData')($scope.memberData, query);
            }

            $scope.AddPB = function ($index) {
                var selectedPB: PBInfo = $scope.backLogList[$index];
                selectedPB.SubTaskList = [new SubTaskInfo(3, "Dev-UI", [], ""), new SubTaskInfo(2, "Dev-Service", [], ""), new SubTaskInfo(1, "Test", [], "")];
                $scope.addedProjectPBInfo.push(selectedPB);
                $scope.backLogList.splice($index, 1);
            }

            $scope.RemovePB = function ($index, JiraName) {
                var answer = confirm("Remove " + JiraName + " from added list?");
                if (answer) {
                    $scope.backLogList.push($scope.addedProjectPBInfo[$index]);
                    $scope.addedProjectPBInfo.splice($index, 1);
                }
            }

            // Use to show PB assignees with distinct.
            $scope.GetPBAssignees = function (pb: PBInfo) {
                var allAssignees = [];

                pb.SubTaskList.forEach(function (sub) {
                    sub.Assignee.forEach(function (p) {
                        allAssignees.push(p.FirstName);
                    });
                });
                var pbAssignees = $filter('unique')(allAssignees);
                return pbAssignees.join(", ");
            }

            $scope.CreateProject = function () {
                NodeService.PostCreateProject($scope.GetCreateProjectRequest());
            }

            $scope.GetCreateProjectRequest = function () {
                // use angular.copy() to copy by value, so we can change content without change original data.
                $scope.reuqestAddedPBList = angular.copy($scope.addedProjectPBInfo);
                $scope.reuqestAddedPBList.forEach(function (pb) {
                    var requestSubTaskList: Array<SubTaskInfo> = [];
                    pb.SubTaskList.forEach(function (sub) {
                        sub.Assignee.forEach(function (assignee) {
                            requestSubTaskList.push(new SubTaskInfo(sub.Role, sub.RoleName, null, assignee.UID));
                        });
                    });
                    pb.SubTaskList = requestSubTaskList;
                });

                var request: CreateProjectRequest = new CreateProjectRequest(
                    $scope.projectNumber,
                    $scope.projectName,
                    $scope.FormatDate($scope.startDate),
                    $scope.FormatDate($scope.releaseDate),
                    $scope.FormatDate($scope.launchDate),
                    $scope.devGroup,
                    $scope.scrumMasterUID(),
                    $scope.reuqestAddedPBList
                );

                return request;
            }
        }]);