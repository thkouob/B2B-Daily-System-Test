(function () {
    var PBInfo = (function () {
        function PBInfo(id, key, link, summary, selected) {
            this.IssueId = id;
            this.IssueKey = key;
            this.JiraLink = link;
            this.Summary = summary;
            this.Selected = selected;
            this.SubTaskList = [new SubTaskInfo(3, "Dev-UI", [], ""), new SubTaskInfo(2, "Dev-Service", [], ""), new SubTaskInfo(1, "Test", [], "")];
        }
        return PBInfo;
    })();
    var SubTaskInfo = (function () {
        function SubTaskInfo(role, roleName, assignee, uid) {
            this.Role = role;
            this.RoleName = roleName;
            this.Assignee = assignee;
            this.AssigneeUID = uid;
        }
        return SubTaskInfo;
    })();
    var MemberInfo = (function () {
        function MemberInfo(uid, name, title, firstName, groupID, membertype, memberTypeDesc) {
            this.UID = uid;
            this.Name = name;
            this.Title = title;
            this.FirstName = firstName;
            this.GroupID = groupID;
            this.MemberType = membertype;
            this.MemberTypeDesc = memberTypeDesc;
        }
        return MemberInfo;
    })();
    var CreateProjectRequest = (function () {
        function CreateProjectRequest(prjNumber, prjName, startDate, releaseDate, launchDate, devGroup, smUid, pbList) {
            this.ProjectNumber = prjNumber;
            this.ProjectName = prjName;
            this.StartDate = startDate;
            this.ReleaseDate = releaseDate;
            this.LaunchDate = launchDate;
            this.DevGruop = devGroup; //1:WWW, 2:SSL
            this.SMUID = smUid;
            this.PBList = pbList;
        }
        return CreateProjectRequest;
    })();
    angular.module('scrumModule', ['ngTagsInput', 'ui.bootstrap', 'ngMessages'])
        .factory('DRService', ['$http', function ($http) {
            var getPersonUrl = 'http://10.16.133.102:52332/prj/v1/Person';
            function GetMemberData(url) {
                var memberInfoList = [];
                $http.get(url)
                    .then(function (response) {
                    var result = response.data;
                    angular.forEach(result, function (value, key) {
                        memberInfoList.push(new MemberInfo(value.UID, value.Name, value.Title, value.FirstName, value.GroupID, value.MemberType, value.MemberTypeDesc));
                    });
                }, function (error) {
                    //// write log / show error alert.
                    console.log(error);
                });
                return memberInfoList;
            }
            return {
                GetMemberData: GetMemberData(getPersonUrl)
            };
        }])
        .factory('NodeService', ['$http', function ($http) {
            var getBackLogUrl = 'http://10.16.133.102:3000/jiraapi/issues';
            //var getBackLogUrl = '/base/GetMockNodeBacklogInfo';
            var postCreateProjectUrl = 'http://10.16.133.102:3000/jiraapi/project';
            function GetBackLogList() {
                var backLogList = [];
                $http.get(getBackLogUrl)
                    .then(function (response) {
                    var result = response.data;
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
            function PostCreateProject(request) {
                $http.post(postCreateProjectUrl, request)
                    .then(function (response) {
                    return true;
                }, function (error) {
                    // write log / show error alert.
                    console.log(error);
                    return false;
                });
            }
            return {
                GetBackLogList: GetBackLogList,
                PostCreateProject: PostCreateProject
            };
        }])
        .directive('checksmname', ['$filter', function ($filter) {
            return {
                restrict: 'A',
                require: 'ngModel',
                link: function ($scope, elm, attrs, ngModel) {
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
            link: function (scope) {
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
            link: function (scope, element, attrs) {
                //Hide or show the modal
                scope.showModal = function (visible) {
                    if (visible) {
                        element.modal("show");
                    }
                    else {
                        element.modal("hide");
                    }
                };
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
                    });
                }
            });
            return result;
        };
    })
        .filter('unique', function () {
        return function (items, filterOn) {
            if (filterOn === false) {
                return items;
            }
            if ((filterOn || angular.isUndefined(filterOn)) && angular.isArray(items)) {
                var hashCheck = {}, newItems = [];
                var extractValueToCompare = function (item) {
                    if (angular.isObject(item) && angular.isString(filterOn)) {
                        return item[filterOn];
                    }
                    else {
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
        return function (inputName, datalist) {
            if (inputName === void 0) { inputName = null; }
            if (datalist === void 0) { datalist = null; }
            var result;
            if (inputName !== null && datalist !== null && angular.isString(inputName) && angular.isArray(datalist)) {
                angular.forEach(datalist, function (value, key) {
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
            function logicData(input, datasource) {
                if (datasource === void 0) { datasource = null; }
                if (datasource !== null) {
                    angular.forEach(datasource, function (value, key) {
                        if (angular.isString(input) && input.toLowerCase() === value.Name.toLowerCase()) {
                            return input = value.UID;
                        }
                    });
                }
                else if (data !== null) {
                    angular.forEach(data, function (value, key) {
                        if (angular.isString(input) && input.toLowerCase() === value.Name.toLowerCase()) {
                            return input = value.UID;
                        }
                    });
                }
                return input;
            }
            var resultFn = function (input, datasource) {
                if (datasource === void 0) { datasource = null; }
                if (data === null && datasource === null) {
                    if (!serviceInvoked) {
                        serviceInvoked = true;
                        DRService.GetMemberData.then(function (memberList) {
                            data = memberList;
                        }, function () {
                            data = null;
                        });
                    }
                    return input;
                }
                else {
                    return logicData(input, datasource);
                }
            };
            //https://docs.angularjs.org/guide/filter
            resultFn.$stateful = true;
            return resultFn;
        }])
        .controller('createProjectCtrl', ['$scope', '$sce', '$filter', 'DRService', 'NodeService', '$location', '$anchorScroll',
        function ($scope, $sce, $filter, DRService, NodeService, $location, $anchorScroll) {
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
            };
            $scope.OpenModal = function () {
                $scope.drform.$setSubmitted();
                if ($scope.drform.$valid) {
                    $scope.showDialog = true;
                }
                else {
                    $location.hash('top');
                    $anchorScroll();
                }
            };
            $scope.CloseModal = function () {
                $scope.showDialog = false;
            };
            //Load all member data use to autocomplete.
            $scope.LoadMemberData = function (query) {
                return $filter('memberData')($scope.memberData, query);
            };
            $scope.AddPB = function ($index) {
                var selectedPB = $scope.backLogList[$index];
                selectedPB.SubTaskList = [new SubTaskInfo(3, "Dev-UI", [], ""), new SubTaskInfo(2, "Dev-Service", [], ""), new SubTaskInfo(1, "Test", [], "")];
                $scope.addedProjectPBInfo.push(selectedPB);
                $scope.backLogList.splice($index, 1);
            };
            $scope.RemovePB = function ($index, JiraName) {
                var answer = confirm("Remove " + JiraName + " from added list?");
                if (answer) {
                    $scope.backLogList.push($scope.addedProjectPBInfo[$index]);
                    $scope.addedProjectPBInfo.splice($index, 1);
                }
            };
            // Use to show PB assignees with distinct.
            $scope.GetPBAssignees = function (pb) {
                var allAssignees = [];
                pb.SubTaskList.forEach(function (sub) {
                    sub.Assignee.forEach(function (p) {
                        allAssignees.push(p.FirstName);
                    });
                });
                var pbAssignees = $filter('unique')(allAssignees);
                return pbAssignees.join(", ");
            };
            $scope.CreateProject = function () {
                NodeService.PostCreateProject($scope.GetCreateProjectRequest());
                $scope.CloseModal();
            };
            $scope.GetCreateProjectRequest = function () {
                $scope.reuqestAddedPBList = angular.copy($scope.addedProjectPBInfo);
                $scope.reuqestAddedPBList.forEach(function (pb) {
                    var requestSubTaskList = [];
                    pb.SubTaskList.forEach(function (sub) {
                        sub.Assignee.forEach(function (assignee) {
                            requestSubTaskList.push(new SubTaskInfo(sub.Role, sub.RoleName, null, assignee.UID));
                        });
                    });
                    pb.SubTaskList = requestSubTaskList;
                });
                var request = new CreateProjectRequest($scope.projectNumber, $scope.projectName, $scope.FormatDate($scope.startDate), $scope.FormatDate($scope.releaseDate), $scope.FormatDate($scope.launchDate), $scope.devGroup, $scope.scrumMasterUID(), $scope.reuqestAddedPBList);
                return request;
            };
        }]);
})();
//# sourceMappingURL=createProjectSin.js.map