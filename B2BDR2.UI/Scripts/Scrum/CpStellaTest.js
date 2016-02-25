(function () {
    var BackLog = (function () {
        function BackLog(id, key, summary, url) {
            this.Id = id;
            this.Key = key;
            this.Summary = summary;
            this.Pburl = url;
        }
        return BackLog;
    })();
    var B2bMember = (function () {
        function B2bMember(id, name, first) {
            this.UID = id;
            this.Name = name;
            this.FirstName = first;
        }
        return B2bMember;
    })();
    var ProjectB = (function () {
        function ProjectB(id, key, title, active, sub) {
            this.Id = id;
            this.Key = key;
            this.Title = title;
            this.Active = active;
            this.Subtask = sub;
        }
        return ProjectB;
    })();
    var SubTask = (function () {
        function SubTask(id, role, assign) {
            this.Id = id;
            this.Role = role;
            this.Assign = assign;
        }
        return SubTask;
    })();
    //interface JQuery {
    //    modal(): JQuery;
    //}
    var tpscpPractice = angular.module("jiraApp", ['ngTagsInput', 'ui.bootstrap', 'ngMessages', 'UtilityCommon', 'LocalStorageModule']);
    tpscpPractice.factory('getBackLogList', ['$http', '$q', function ($http, $q) {
            ////getBackLog
            var url = '/base/GetMockNodeBacklogInfo';
            var deferred = $q.defer();
            function GetBackLog(url) {
                var backlogInfoList = [];
                $http.get("" + url)
                    .then(function (response) {
                    var resultData = response.data;
                    $('.sk-circle').hide();
                    $('.pbArea').fadeIn();
                    angular.forEach(resultData.data, function (value, key) {
                        var url = "http://jira/browse/" + value.key;
                        backlogInfoList.push(new BackLog(value.id, value.key, value.summary, url));
                    });
                    deferred.resolve(backlogInfoList);
                }, function (response) {
                    deferred.reject(response);
                });
                return deferred.promise;
            }
            return {
                DataList: GetBackLog(url)
            };
        }]).factory('getMemberList', ['$http', '$q', function ($http, $q) {
            ////getMember
            var apiurl = 'http://10.16.133.102:52332/prj/v1/Person';
            var deferred = $q.defer();
            function GetMembersList(apiurl) {
                var b2bMembers = [];
                $http.get("" + apiurl)
                    .then(function (response) {
                    var resultData = response.data;
                    angular.forEach(resultData, function (value, key) {
                        b2bMembers.push(new B2bMember(value.UID, value.Name, value.FirstName));
                    });
                    deferred.resolve(b2bMembers);
                }, function (response) {
                    deferred.reject(response);
                });
                return deferred.promise;
            }
            return {
                GetMembers: GetMembersList(apiurl)
            };
        }]);
    tpscpPractice.controller("JiraCtrl", ['$scope', 'getBackLogList', 'getMemberList', '$http', '$filter', '$window', '$timeout', 'localStorageService',
        function ($scope, getBackLogList, getMemberList, $http, $filter, $window, $timeout, localStorageService) {
            ////Init ---------------------------------------------------------------////
            $scope.AllFormData = {
                DevGruop: null
            };
            localStorage.setItem("lastname", "Smith");
            if (localStorageService.get("DevGruop") != null || localStorageService.get("DevGruop") != undefined) {
                $scope.AllFormData.DevGruop = localStorageService.get("DevGruop");
            }
            if (localStorageService.get("SmName") != null || localStorageService.get("SmName") != undefined) {
                $scope.SmName = localStorageService.get("SmName");
            }
            $scope.ShowEditTitle = function () {
                if ($scope.ProjectList == undefined || $scope.ProjectList.length == 0) {
                    return false;
                }
                return true;
            };
            $scope.format = 'yyyy/MM/dd';
            ////display lists info ---------------------------------------------------------------////
            // Members
            getMemberList.GetMembers.then(function (result) {
                $scope.MembersList = result;
            });
            $scope.$watchCollection('AllFormData.DevGruop', function (newNames, oldNames) {
                if ($scope.AllFormData.DevGruop != null) {
                    var apiurl = 'http://10.16.133.102:52332/prj/v1/Person?group=' + newNames;
                    var groupMembers = [];
                    $http.get("" + apiurl)
                        .then(function (response) {
                        var resultData = response.data;
                        angular.forEach(resultData, function (value, key) {
                            groupMembers.push(new B2bMember(value.UID, value.Name, value.FirstName));
                        });
                        $scope.MembersList = groupMembers;
                    });
                }
            });
            // BackLogs
            getBackLogList.DataList.then(function (data) {
                $scope.BacklogList = data;
            });
            //// add pb to project ---------------------------------------------------------------////
            var tempData = [];
            var tempBackLog = [];
            $scope.SelectedProjectLog = function (idx) {
                var tempSubTask = [];
                tempSubTask = GetBackLogWithSubTask($scope.BacklogList[idx].Key);
                if (tempData.length > 0) {
                    tempData.push(new ProjectB($scope.BacklogList[idx].Id, $scope.BacklogList[idx].Key, $scope.BacklogList[idx].Summary, "", tempSubTask));
                    tempBackLog.push($scope.BacklogList[idx]);
                    $scope.BacklogList.splice(idx, 1);
                }
                else {
                    tempData.push(new ProjectB($scope.BacklogList[idx].Id, $scope.BacklogList[idx].Key, $scope.BacklogList[idx].Summary, "in active", tempSubTask));
                    tempBackLog.push($scope.BacklogList[idx]);
                    $scope.BacklogList.splice(idx, 1);
                }
                $scope.ProjectList = angular.copy(tempData);
            };
            ////add a subTask to pb ---------------------------------------------------------------////
            $scope.AddSubTask = function (pbId, role, asign, idx) {
                var keepGoing = true;
                angular.forEach($scope.ProjectList, function (value, key) {
                    if (keepGoing) {
                        if (value.Key === pbId) {
                            value.Subtask.push(new SubTask(pbId, NameToRole(role), asign));
                        }
                    }
                });
            };
            $scope.currentItemIdx = null;
            ////remove pb to project ---------------------------------------------------------------////
            $scope.OpenWarningPopUp = function (idx) {
                var d = angular.element("#modalRemovePBConfirm");
                $scope.currentItemIdx = angular.copy(idx);
                d.modal("show");
            };
            $scope.RemoveProjectLog = function () {
                var d = angular.element("#modalRemovePBConfirm");
                var keepGoing = true;
                var idx = $scope.currentItemIdx;
                angular.forEach(tempBackLog, function (value, key) {
                    if (keepGoing) {
                        if (value.Key === $scope.ProjectList[idx].Key) {
                            var url = "http://jira/browse/" + value.Key;
                            $scope.BacklogList.push(new BackLog(value.Id, value.Key, value.Summary, url));
                            keepGoing = false;
                        }
                    }
                });
                tempData.splice(idx, 1);
                //fix if remove first tag, content area will be disappear
                if (tempData[0] !== undefined && tempData[0].Active === "") {
                    tempData[0].Active = "in active";
                }
                $scope.ProjectList = angular.copy(tempData);
                d.modal("hide");
            };
            //while click <li> update class active, then the tag will work correct when remove it. 
            $scope.UpdateActiveClass = function (idx) {
                angular.forEach($scope.ProjectList, function (value, key) {
                    if (value.Key === $scope.ProjectList[idx].Key) {
                        value.Active = "in active";
                    }
                    else {
                        value.Active = "";
                    }
                });
            };
            ////remove a subTask to pb ---------------------------------------------------------------////
            $scope.RemoveSubTask = function (pbId, idx) {
                var keepGoing = true;
                angular.forEach($scope.ProjectList, function (value, key) {
                    if (keepGoing) {
                        if (value.Key === pbId) {
                            value.Subtask.splice(idx, 1);
                        }
                    }
                });
            };
            ////Assignee tags display ---------------------------------------------------------------////
            $scope.LoadAssigneeTag = function ($query) {
                return $scope.MembersList.filter(function (member) {
                    return member.Name.toLowerCase().indexOf($query.toLowerCase()) != -1
                        || member.UID.toLowerCase().indexOf($query.toLowerCase()) != -1;
                });
            };
            ////PopUp window ---------------------------------------------------------------////
            $scope.OpenPopUp = function () {
                $scope.$watchCollection('$scope.AllFormData', function (newNames, oldNames) {
                    $scope.AllFormData.SMUID = NameToUID();
                    $scope.AllFormData.PBList = GetPbList();
                    $scope.AllFormData.StartDate = GetFormatDate($scope.StartDate);
                    $scope.AllFormData.ReleaseDate = GetFormatDate($scope.ReleaseDate);
                    $scope.AllFormData.LaunchDate = GetFormatDate($scope.LaunchDate);
                });
                $scope.DevGroup = GetDevGroup();
                localStorageService.set("DevGruop", $scope.AllFormData.DevGruop);
                localStorageService.set("SmName", $scope.SmName);
                var index = 5;
                var myinterval = setInterval(function () {
                    index--;
                    var $btAccept = $('#bt_accept');
                    var countSpan = $('#bt_accept').find('span');
                    countSpan.text("(" + (index).toString() + ")");
                    if (index == 0) {
                        $btAccept.removeClass("disabled");
                        countSpan.remove();
                        clearInterval(myinterval);
                    }
                }, 1000);
            };
            $scope.GetAssigneeGroup = function (sub) {
                var assigneeGroup = [];
                angular.forEach(sub, function (val, key) {
                    angular.forEach(val.Assign, function (asign, key) {
                        assigneeGroup.push(asign.FirstName);
                    });
                });
                return $filter('unique')(assigneeGroup).join(", ");
            };
            ////Submit to creat project ---------------------------------------------------------------////
            $scope.Save = function () {
                var request;
                request = angular.copy($scope.AllFormData);
                var postapiurl = 'http://10.16.133.102:3000/jiraapi/project';
                $http.post(postapiurl, request)
                    .then(function (response) {
                    alert("Create Project Success!");
                    function redirectedPage() {
                        var url = "http://" + $window.location.host + "/Mockup/Index";
                        $window.location.href = url;
                    }
                    ;
                    $timeout(redirectedPage, 500);
                }, function (response) {
                    console.log(response);
                });
            };
            ////Show warning message if user leave page ---------------------------------------------------------------////
            $scope.$watch('dailyForm.$dirty', function (value) {
                if (value) {
                    $window.onbeforeunload = function () {
                        return "Your data will be lost, if you're leave!! Do you want to leave?";
                    };
                }
            });
            ////Private function ---------------------------------------------------------------////
            function GetBackLogWithSubTask(key) {
                var subTaskInfoList = [];
                subTaskInfoList.push(new SubTask(key, "UI", null), new SubTask(key, "Service", null), new SubTask(key, "Test", null));
                return subTaskInfoList;
            }
            function GetFormatDate(date) {
                return $filter('date')(date, 'dd/MMM/yy');
            }
            function GetDevGroup() {
                switch ($scope.AllFormData.DevGruop) {
                    case "1":
                        return "WWW";
                    case "2":
                        return "SSL";
                }
            }
            function NameToUID() {
                var keepGoing = true;
                var uid;
                angular.forEach($scope.MembersList, function (value, key) {
                    if (keepGoing) {
                        if (value.Name === $scope.SmName) {
                            uid = value.UID;
                            keepGoing = false;
                        }
                    }
                });
                return uid;
            }
            function GetPbList() {
                var pbInfo = [];
                angular.forEach($scope.ProjectList, function (value, key) {
                    var slist = [];
                    angular.forEach(value.Subtask, function (sval, key) {
                        angular.forEach(sval.Assign, function (val, key) {
                            slist.push({
                                AssigneeUID: val.UID,
                                Role: RoleToNumber(sval.Role)
                            });
                        });
                    });
                    pbInfo.push({
                        IssueId: value.Id,
                        IssueKey: value.Key,
                        Selected: true,
                        SubTaskList: slist
                    });
                });
                return pbInfo;
            }
            function RoleToNumber(role) {
                switch (role) {
                    case "Test":
                        return 1;
                    case "Service":
                        return 2;
                    case "UI":
                        return 3;
                }
            }
            function NameToRole(role) {
                switch (role) {
                    case "1":
                        return "Test";
                    case "2":
                        return "Service";
                    case "3":
                        return "UI";
                }
            }
        }]);
})();
//# sourceMappingURL=CpStellaTest.js.map