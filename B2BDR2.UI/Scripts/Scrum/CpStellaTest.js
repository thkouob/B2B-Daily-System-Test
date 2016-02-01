var BackLog = (function () {
    function BackLog(id, key, summary, description, assignee, reporter) {
        this.Id = id;
        this.Key = key;
        this.Summary = summary;
        this.Description = description;
        this.Assignee = assignee;
        this.Reporter = reporter;
    }
    return BackLog;
})();
var B2bMember = (function () {
    function B2bMember(id, name, fname, title, mtype, gid) {
        this.UID = id;
        this.Name = name;
        this.FirstName = fname;
        this.Title = title;
        this.MerberType = mtype;
        this.GroupId = gid;
    }
    return B2bMember;
})();
var ProjectB = (function () {
    function ProjectB(id, title, active, sub) {
        this.Id = id;
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
var tpscpPractice = angular.module("jiraApp", ['ngTagsInput']);
tpscpPractice.factory('getBackLogList', ['$http', '$q', function ($http, $q) {
        ////getBackLog
        var url = '/Base/GetJIRABacklogInfo';
        var deferred = $q.defer();
        function GetBackLog(url) {
            var backlogInfoList = [];
            $http.get("" + url)
                .then(function (response) {
                var resultData = response.data;
                angular.forEach(resultData.issues, function (value, key) {
                    backlogInfoList.push(new BackLog(value.id, value.key, value.fields.summary, value.fields.description, value.fields.assignee, value.fields.reporter));
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
    }]).factory('getMemberList', ['$http', function ($http) {
        ////getMember
        var apiurl = 'http://10.16.133.102:52332/prj/v1/Person';
        return {
            getMembers: function () {
                return $http({
                    url: apiurl,
                    method: 'GET'
                });
            }
        };
    }]);
tpscpPractice.controller("JiraCtrl", ['$scope', 'getBackLogList', 'getMemberList',
    function ($scope, getBackLogList, getMemberList) {
        ////display lists info ---------------------------------------------------------------////
        getMemberList.getMembers().success(function (result) {
            $scope.MembersList = result;
        });
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
                tempData.push(new ProjectB($scope.BacklogList[idx].Key, $scope.BacklogList[idx].Summary, "", tempSubTask));
                tempBackLog.push($scope.BacklogList[idx]);
                $scope.BacklogList.splice(idx, 1);
            }
            else {
                tempData.push(new ProjectB($scope.BacklogList[idx].Key, $scope.BacklogList[idx].Summary, "in active", tempSubTask));
                tempBackLog.push($scope.BacklogList[idx]);
                $scope.BacklogList.splice(idx, 1);
            }
            $scope.ProjectList = tempData;
        };
        function GetBackLogWithSubTask(key) {
            var subTaskInfoList = [];
            subTaskInfoList.push(new SubTask(key, "UI", null), new SubTask(key, "Service", null), new SubTask(key, "Test", null));
            return subTaskInfoList;
        }
        ////add a subTask to pb ---------------------------------------------------------------////
        $scope.AddSubTask = function (pbId, role, asign, idx) {
            var keepGoing = true;
            angular.forEach($scope.ProjectList, function (value, key) {
                if (keepGoing) {
                    if (value.Id === pbId) {
                        value.Subtask.push(new SubTask(pbId, role, asign));
                    }
                }
            });
        };
        ////remove pb to project ---------------------------------------------------------------////
        $scope.RemoveProjectLog = function (idx) {
            var keepGoing = true;
            angular.forEach(tempBackLog, function (value, key) {
                if (keepGoing) {
                    if (value.Key === $scope.ProjectList[idx].Id) {
                        $scope.BacklogList.push(new BackLog(value.Id, value.Key, value.Summary, value.Description, value.Assignee, value.Reporter));
                        keepGoing = false;
                    }
                }
            });
            debugger;
            tempData.splice(idx, 1);
            //fix if remove first tag, content area will be disappear
            if (tempData[0].Active === "") {
                tempData[0].Active = "in active";
            }
        };
        //while click <li> update class active, then the tag will work correct when remove it. 
        $scope.UpdateActiveClass = function (idx) {
            angular.forEach($scope.ProjectList, function (value, key) {
                if (value.Key === $scope.ProjectList[idx].Id) {
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
                    if (value.Id === pbId) {
                        value.Subtask.splice(idx, 1);
                    }
                }
            });
        };
        ////Assignee tags display ---------------------------------------------------------------////
        $scope.loadAssigneeTag = function ($query) {
            var countries = $scope.MembersList;
            return countries.filter(function (country) {
                return country.Name.toLowerCase().indexOf($query.toLowerCase()) != -1
                    || country.UID.toLowerCase().indexOf($query.toLowerCase()) != -1;
            });
        };
        $scope.tagAdded = function (tag) {
            $scope.log.push('Added: ' + tag.text);
        };
        $scope.tagRemoved = function (tag) {
            $scope.log.push('Removed: ' + tag.text);
        };
    }]);
//# sourceMappingURL=CpStellaTest.js.map