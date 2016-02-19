(function () {
    angular.module('UtitlityCommon', [])
        .constant('DR2Config', {
        PersonSessionKey: "personList",
        DRServiceHostUrl: 'http://10.16.133.102:52332',
        NodeServiceHostUrl: 'http://10.16.133.102:3000'
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
        .filter('fullToUidName', ['DR2Service', function (DR2Service) {
            var data = null, serviceInvoked = false;
            function logicData(input) {
                if (data !== null) {
                    angular.forEach(data, function (value, key) {
                        if (angular.isString(input) && input.toLowerCase() === value.Name.toLowerCase()) {
                            return input = value.UID;
                        }
                    });
                }
                return input;
            }
            var resultFn = function (input) {
                if (data === null) {
                    if (!serviceInvoked) {
                        serviceInvoked = true;
                        DR2Service.GetPersonList.then(function (personList) {
                            data = personList;
                        }, function () {
                            data = null;
                        });
                    }
                    return input;
                }
                else {
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
                    angular.forEach(data, function (value, key) {
                        if (angular.isString(input) && input.toLocaleLowerCase() == value.UID.toLocaleLowerCase()) {
                            return input = value.Name;
                        }
                    });
                }
                return input;
            }
            var resultFn = function (input) {
                if (data === null) {
                    if (!serviceInvoked) {
                        serviceInvoked = true;
                        DR2Service.GetPersonList.then(function (personList) {
                            data = personList;
                        }, function () {
                            data = null;
                        });
                    }
                    return input;
                }
                else {
                    return logicData(input);
                }
            };
            //https://docs.angularjs.org/guide/filter
            resultFn.$stateful = true;
            return resultFn;
        }])
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
        .factory('storageHelper', function () {
        function GetSessionStorageItem(key, isString) {
            if (isString === void 0) { isString = false; }
            var data = window.sessionStorage.getItem(key);
            if (isString) {
                return data;
            }
            return angular.fromJson(data);
        }
        function SetSessionStorageItem(key, data) {
            if (!angular.isString(data)) {
                data = angular.toJson(data);
            }
            window.sessionStorage.setItem(key, data);
        }
        return {
            GetSessionStorageItem: GetSessionStorageItem,
            SetSessionStorageItem: SetSessionStorageItem
        };
    })
        .factory('DR2Service', ['$http', '$q', 'DR2Config', 'storageHelper', function ($http, $q, DR2Config, storageHelper) {
            var hostUrl = DR2Config.DRServiceHostUrl;
            var personUrl = hostUrl + "/Person"; //'/base/GetPersonInfo';
            var prjStatusUrl = hostUrl + "/prj/v1/newprjstatus";
            function GetOriginPersonData(url) {
                return $http.get(url, { cache: true });
            }
            function GetPersonList(url) {
                var deffered = $q.defer();
                var personInfo = storageHelper.GetSessionStorageItem(DR2Config.PersonSessionKey);
                if (personInfo === undefined || personInfo === null) {
                    GetOriginPersonData(url).then(function (response) {
                        var personList = [];
                        angular.forEach(response.data, function (value, key) {
                            personList.push(new DR2Person(value.FirstName, value.GroupId, value.MemberTypeDesc, value.MemberType, value.Name, value.Titile, value.UID));
                        });
                        storageHelper.SetSessionStorageItem(DR2Config.PersonSessionKey, personList);
                        deffered.resolve(personList);
                    }, function (response) {
                        deffered.reject(response);
                    });
                }
                else {
                    deffered.resolve(angular.fromJson(personInfo));
                }
                return deffered.promise;
            }
            function TryConvertToDate(data) {
                try {
                    var d = new Date(data);
                    return [d.getFullYear(), d.getMonth() + 1, d.getDate()].join('/') + " " + [d.getHours(), d.getMinutes(), d.getSeconds()].join(':');
                }
                catch (e) {
                }
                return data;
            }
            function GetProjectStatus(url) {
                var deferred = $q.defer();
                $http.get(url)
                    .then(function (response) {
                    var data = response.data;
                    var mockData = [];
                    if (data) {
                        angular.forEach(data, function (value, key) {
                            mockData.push(new ProjectStatus(value.ProjectNumber, value.ProjectName, value.SM, TryConvertToDate(value.CreatedDate), value.JIRAStatus, value.DRStatus));
                        });
                        deferred.resolve(mockData);
                    }
                    deferred.reject('not found data!');
                }, function (response) {
                    deferred.reject(response);
                });
                return deferred.promise;
            }
            return {
                GetPersonList: GetPersonList(personUrl),
                GetProjectStatus: GetProjectStatus(prjStatusUrl)
            };
        }])
        .factory('NodeService', ['$http', 'DR2Config', function ($http, DR2Config) {
            var hostUrl = DR2Config.NodeServiceHostUrl;
            var backLogListUrl = hostUrl + "/jiraapi/issues";
            var createPrjUrl = hostUrl + "/jiraapi/project";
            //TODO logic
            return {};
        }]);
    //class
    var DR2Person = (function () {
        function DR2Person(firstName, groupId, memberTypeDesc, memberType, name, titile, uID) {
            this.FirstName = firstName;
            this.GroupId = groupId;
            this.MemberType = memberType;
            this.Name = name;
            this.Titile = titile;
            this.UID = uID;
        }
        return DR2Person;
    })();
    var ProjectStatus = (function () {
        function ProjectStatus(pNumber, pName, sMName, cDate, jiraStatus, drStatus) {
            this.ProjectNumber = pNumber;
            this.ProjectName = pName;
            this.SMName = sMName;
            this.CreateDate = cDate;
            this.JIRAStatus = parseInt(jiraStatus);
            this.DRStatus = parseInt(drStatus);
        }
        return ProjectStatus;
    })();
})();
//# sourceMappingURL=UtitlityCommon.js.map