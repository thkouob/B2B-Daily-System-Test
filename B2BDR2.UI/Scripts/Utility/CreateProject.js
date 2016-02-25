(function () {
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
    angular.module('mvcapp', ['UtilityCommon', 'ngTagsInput', 'ui.bootstrap', 'ngMessages'])
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
        .directive('accessibleForm', function () {
        return {
            restrict: 'A',
            link: function (scope, elem) {
                // set up event handler on the form element
                elem.on('submit', function () {
                    // find the first invalid element
                    var firstInvalid = elem.find('.ng-invalid:first');
                    // if we find one, set focus
                    if (firstInvalid) {
                        firstInvalid.focus();
                    }
                });
            }
        };
    })
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
        .controller('indexCtrl', ['$scope', '$filter', 'DR2Service', 'NodeService', '$anchorScroll', '$location', '$window', 'DR2Config',
        function ($scope, $filter, DR2Service, NodeService, $anchorScroll, $location, $window, DR2Config) {
            // Init
            $scope.projectNumber;
            $scope.projectName;
            $scope.scrumMasterName; //TODO: use localStorage to get init
            $scope.devGroup = DevGroup.www; //TODO: use localStorage to get init: OOO || 1
            $scope.startDate;
            $scope.releaseDate;
            $scope.launchDate;
            $scope.addedProjectPBInfo = [];
            $scope.backLogList = NodeService.GetBackLogList();
            $scope.memberData = DR2Service.GetMemberData;
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
                selectedPB.SubTaskList = [new SubTaskInfo(PbUserRole.UI, "Dev-UI", [], ""), new SubTaskInfo(PbUserRole.Service, "Dev-Service", [], ""), new SubTaskInfo(PbUserRole.Test, "Test", [], "")];
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
                //.then(function (response) {
                //
                //    if (response.IsSuccess) {
                //        //TODO success message
                //        $window.location.href = DR2Config.ProjectStatusUrl;
                //    } else if (response.ErrorMessage) {
                //        alert(response.ErrorMessage);
                //    } else if (response.status) {
                //        alert(response.data)
                //    } else {
                //
                //    }
                //}, function (response) {
                //
                //});
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
//# sourceMappingURL=CreateProject.js.map