var Dashboard;
(function (Dashboard) {
    var PhotoUrlList = [
        '/Content/Image/Photos/2015_EGGDay/DSC_0378.JPG',
        '/Content/Image/Photos/2015_EGGDay/DSC_0383.JPG',
        '/Content/Image/Photos/2015_EGGDay/DSC_1046.JPG',
        '/Content/Image/Photos/2015_EGGDay/DSC_1058.JPG',
        '/Content/Image/Photos/2015_MoonABC/DSC_1230.JPG',
        '/Content/Image/Photos/2015_MoonABC/DSC_1334.JPG',
        '/Content/Image/Photos/2015_MoonABC/DSC_1370.JPG',
        '/Content/Image/Photos/2015_MoonABC/DSC_1375.JPG',
        '/Content/Image/Photos/2015_MoonABC/DSC_1386.JPG',
        '/Content/Image/Photos/2015_MoonABC/DSC_6520.JPG',
        '/Content/Image/Photos/2015_MoonABC/DSC_6528.JPG',
        '/Content/Image/Photos/2015_Xmax/Xmas_SSL.JPG',
        '/Content/Image/Photos/2015_Xmax/Xmas_WWW.JPG',
        '/Content/Image/Photos/2015_Xmax/Xmax_Test.JPG',
        '/Content/Image/Photos/2015_Xmax/Xmas_SSLwithTree.JPG',
    ];
    function getRandomArbitrary(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }
    Dashboard.randomTop5Urls = (function () {
        var _randomTop5Urls = [];
        var photoUrlListCount = PhotoUrlList.length;
        var randomNum = 0;
        for (var i = 0; i < 5; i++) {
            var _randomUrl = '';
            do {
                _randomUrl = PhotoUrlList[getRandomArbitrary(0, photoUrlListCount)];
            } while (_randomTop5Urls.indexOf(_randomUrl) > -1);
            _randomTop5Urls.push(_randomUrl);
        }
        return _randomTop5Urls;
    }());
    var Slide = (function () {
        function Slide(Id, Active, ImageUrl, Desc) {
            this.Id = Id;
            this.Active = Active;
            this.ImageUrl = ImageUrl;
            this.Desc = Desc;
        }
        return Slide;
    })();
    Dashboard.Slide = Slide;
})(Dashboard || (Dashboard = {}));
(function () {
    angular.module('mvcapp', ['ui.bootstrap'])
        .controller('DashboardCtrl', ['$scope',
        function ($scope) {
            $scope.slides = [];
            var index = 0;
            for (var _i = 0, _a = Dashboard.randomTop5Urls; _i < _a.length; _i++) {
                var randomTop5Url = _a[_i];
                var _active = '';
                var _desc = '';
                if (index == 0) {
                    _active = 'active';
                }
                $scope.slides.push(new Dashboard.Slide(index++, _active, randomTop5Url, _desc));
            }
        }]);
})();
//# sourceMappingURL=Dashboard.js.map