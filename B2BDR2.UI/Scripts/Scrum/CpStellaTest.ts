﻿interface IBackLog {
    Id: string,
    Key: string,
    Summary: string,
    Description: string,
    Assignee: any,
    Reporter: any
}
//interface ISubTask2 extends IBackLog {
//    SubTaskList: any;
//}
interface IB2bMember {
    UID: string,
    Name: string
}

interface IProjectB {
    Id: string,
    Key: string,
    Title: string,
    Active: string,
    Subtask: any
}

interface ISubTask {
    Id: string,
    Role: string,
    Assign: any
}

class BackLog implements IBackLog {
    Id: string;
    Key: string;
    Summary: string;
    Description: string;
    Assignee: any;
    Reporter: any;
    constructor(id: string, key: string,
        summary: string, description: string,
        assignee: any, reporter: any
    ) {
        this.Id = id;
        this.Key = key;
        this.Summary = summary;
        this.Description = description;
        this.Assignee = assignee;
        this.Reporter = reporter;
    }
}

class B2bMember implements IB2bMember {
    UID: string;
    Name: string;
    constructor(id: string, name: string) {
        this.UID = id;
        this.Name = name;
    }
}

class ProjectB implements IProjectB {
    Id: string;
    Key: string;
    Title: string;
    Active: string;
    Subtask: any;
    constructor(id: string, key: string, title: string, active: string, sub: any) {
        this.Id = id;
        this.Key = key;
        this.Title = title;
        this.Active = active;
        this.Subtask = sub;
    }
}

class SubTask implements ISubTask {
    Id: string;
    Role: string;
    Assign: any;
    constructor(id: string, role: string, assign: any) {
        this.Id = id;
        this.Role = role;
        this.Assign = assign;
    }
}



var tpscpPractice = angular.module("jiraApp", ['ngTagsInput']);
tpscpPractice.factory('getBackLogList', ['$http', '$q', function ($http: ng.IHttpService, $q: ng.IQService) {
    ////getBackLog
    var url = '/Base/GetJIRABacklogInfo';
    var deferred = $q.defer();

    function GetBackLog(url) {
        var backlogInfoList = [];
      
        $http.get(`${url}`)
            .then(function (response) {
                var resultData: any = response.data;
                angular.forEach(resultData.issues, function (value, key) {    
                    backlogInfoList.push(
                        new BackLog(value.id, value.key,
                            value.fields.summary, value.fields.description,
                            value.fields.assignee, value.fields.reporter));
                });
                deferred.resolve(backlogInfoList);
            }, function (response) {
                deferred.reject(response);
            });

        return deferred.promise;
    }

    return {
        DataList: GetBackLog(url)
    }
}]).factory('getMemberList', ['$http', function ($http: ng.IHttpService) {
    ////getMember
    var apiurl = 'http://10.16.133.102:52332/prj/v1/Person';

    return {
        getMembers: function () {
            return $http({
                url: apiurl,
                method: 'GET'
            })
        }
    }
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
        var tempData: Array<ProjectB> = [];
        var tempBackLog: Array<BackLog> = [];
        $scope.SelectedProjectLog = function (idx) {
            var tempSubTask = [];
            tempSubTask = GetBackLogWithSubTask($scope.BacklogList[idx].Key);
            if (tempData.length > 0) {
                tempData.push(new ProjectB($scope.BacklogList[idx].Id, $scope.BacklogList[idx].Key,
                    $scope.BacklogList[idx].Summary,
                    "",
                    tempSubTask));

                tempBackLog.push($scope.BacklogList[idx]);
                $scope.BacklogList.splice(idx, 1);
            } else {
                tempData.push(new ProjectB($scope.BacklogList[idx].Id, $scope.BacklogList[idx].Key,
                        $scope.BacklogList[idx].Summary,
                        "in active",
                        tempSubTask));
                tempBackLog.push($scope.BacklogList[idx]);
                $scope.BacklogList.splice(idx, 1);
            }

            $scope.ProjectList = tempData;
         
        };

        function GetBackLogWithSubTask(key) {
            var subTaskInfoList = [];
            subTaskInfoList.push(new SubTask(key, "UI", null),
                new SubTask(key, "Service", null),
                new SubTask(key, "Test", null)
            );

            return subTaskInfoList;
        }

        function RoleToNumber(role) {
            switch (role)
            {
                case "Test":
                    return 1;
                case "Service":
                    return 2;
                case "UI":
                    return 3;

            }
        }

        ////add a subTask to pb ---------------------------------------------------------------////
        $scope.AddSubTask = function (pbId, role, asign, idx) {
            var keepGoing = true;
            angular.forEach($scope.ProjectList, function (value, key) {
                if (keepGoing) {
                    if (value.Key === pbId) {
                        value.Subtask.push(new SubTask(pbId, role, asign));
                    }
                }
            });
        }

        ////remove pb to project ---------------------------------------------------------------////
        $scope.RemoveProjectLog = function (idx) {
            var keepGoing = true;
            angular.forEach(tempBackLog, function (value, key) {
                if (keepGoing) {
                    if (value.Key === $scope.ProjectList[idx].Key) {
                        $scope.BacklogList.push(new BackLog(value.Id, value.Key,
                            value.Summary, value.Description,
                            value.Assignee, value.Reporter));
                        keepGoing = false;
                    }
                }
            });
            tempData.splice(idx, 1);
            //fix if remove first tag, content area will be disappear
            if (tempData[0].Active === "") {
                tempData[0].Active = "in active";
            }
        };

        //while click <li> update class active, then the tag will work correct when remove it. 
        $scope.UpdateActiveClass = function (idx) {
            angular.forEach($scope.ProjectList, function (value, key) {
                if (value.Key === $scope.ProjectList[idx].Key) {
                    value.Active = "in active";
                } else {
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
        }

        ////Assignee tags display ---------------------------------------------------------------////
        $scope.LoadAssigneeTag = function ($query) {
            var b2bMembers = [];
            
            angular.forEach($scope.MembersList, function (value, key) {
                b2bMembers.push(
                    new B2bMember(value.UID, value.Name));
            });

            return b2bMembers.filter(function (member) {
                return member.Name.toLowerCase().indexOf($query.toLowerCase()) != -1
                    || member.UID.toLowerCase().indexOf($query.toLowerCase()) != -1;
            });
        };

        $scope.AllFormData = {
            PBList: GetPbList()
        };

        //$scope.$watchCollection('ProjectList', function (newNames, oldNames) {
            //debugger
        //});

        function GetPbList() {
            var pbInfo = [];
            angular.forEach($scope.ProjectList, function (value, key) {
                var slist = [];
                angular.forEach(value.Subtask, function (sval, key) {
                    angular.forEach(sval.Assign, function (val, key) {
                        slist.push({
                            AssigneeUID: val.UID,
                            Role: sval.Role
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
}]);