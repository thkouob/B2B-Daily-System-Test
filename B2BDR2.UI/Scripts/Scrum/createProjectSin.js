var BacklogInfo2 = (function () {
    function BacklogInfo2(jNumber, jLink, summary) {
        this.JiraNumber = jNumber;
        this.JiraLink = jLink;
        this.Summary = summary;
        this.SubTaskList = [new SubTaskInfo("Dev-UI", []), new SubTaskInfo("Dev-Service", []), new SubTaskInfo("Test", [])];
    }
    return BacklogInfo2;
})();
var SubTaskInfo = (function () {
    function SubTaskInfo(role, assignee) {
        this.Role = role;
        this.Assignee = assignee;
    }
    return SubTaskInfo;
})();
var PersonInfo = (function () {
    function PersonInfo(uid, name, title, firstName, groupID, membertype, memberTypeDesc) {
        this.UID = uid;
        this.Name = name;
        this.Title = title;
        this.FirstName = firstName;
        this.GroupID = groupID;
        this.MemberType = membertype;
        this.MemberTypeDesc = memberTypeDesc;
    }
    return PersonInfo;
})();
angular.module('scrumModule', ['ngTagsInput', 'ui.bootstrap', 'ngAnimate'])
    .factory('DRService', ['$http', function ($http) {
        var backLogData = [];
        backLogData.push(new BacklogInfo2("TCBB-9679", "http://jira/browse/TCBB-9679", "Fix the deadlock issue of Sciquest order process app."));
        backLogData.push(new BacklogInfo2("TCBB-9634", "http://jira/browse/TCBB-9634", "Export order results"));
        backLogData.push(new BacklogInfo2("TCBB-9623", "http://jira/browse/TCBB-9623", "support multiple fixed discount promo code for multiple warehouse order"));
        return {
            BackLogList: backLogData
        };
    }])
    .factory('JIRAService', ['$http', function ($http) {
        var getPersonUrl = 'http://10.16.133.102:52332/prj/v1/Person';
        var getBackLogUrl = 'http://10.16.133.102:3000/jiraapi/issues';
        function GetPersonData(url) {
            var personInfoList = [];
            $http.get(url)
                .then(function (response) {
                var result = response.data;
                angular.forEach(result, function (value, key) {
                    personInfoList.push(new PersonInfo(value.UID, value.Name, value.Title, value.FirstName, value.GroupID, value.MemberType, value.MemberTypeDesc));
                });
            }, function (error) {
                //// write log / show error alert.
                console.log(error);
            });
            return personInfoList;
        }
        function GetBackLogList(url) {
            var backLogList = [];
            $http.get(url)
                .then(function (response) {
                var result = response.data;
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
            GetPersonData: GetPersonData(getPersonUrl),
            GetBackLogList: GetBackLogList(getBackLogUrl)
        };
    }])
    .filter('personData', function () {
    return function (data, query) {
        query = query.toLowerCase();
        var result = [];
        angular.forEach(data, function (value, key) {
            if (value.UID.toLowerCase().startsWith(query) || value.Name.toLowerCase().startsWith(query)) {
                result.push(value);
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
    .controller('createProjectCtrl', ['$scope', '$sce', '$filter', 'DRService', 'JIRAService',
    function ($scope, $sce, $filter, DRService, JIRAService) {
        // Init
        $scope.projectNumber;
        $scope.projectName;
        $scope.scrumMaster;
        $scope.scrumMasterObj;
        $scope.AddedProjectPBInfo = [];
        $scope.BackLogList = JIRAService.GetBackLogList;
        $scope.PersonData = JIRAService.GetPersonData;
        // Function
        $scope.LoadPersonData = function (query) {
            return $filter('personData')($scope.PersonData, query);
        };
        $scope.AddPB = function ($index) {
            var selectedPB = $scope.BackLogList[$index];
            selectedPB.SubTaskList = [new SubTaskInfo("Dev-UI", []), new SubTaskInfo("Dev-Service", []), new SubTaskInfo("Test", [])];
            $scope.AddedProjectPBInfo.push(selectedPB);
            $scope.BackLogList.splice($index, 1);
        };
        $scope.RemovePB = function ($index, JiraName) {
            var answer = confirm("Remove " + JiraName + " from added list?");
            if (answer) {
                $scope.BackLogList.push($scope.AddedProjectPBInfo[$index]);
                $scope.AddedProjectPBInfo.splice($index, 1);
            }
        };
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
    }]);
//# sourceMappingURL=createProjectSin.js.map