module Dashboard {
    const PhotoUrlList = [
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

    export var randomTop5Urls: string[] = (function () {
        let _randomTop5Urls: string[] = [];
        let photoUrlListCount = PhotoUrlList.length;
        let randomNum = 0;
        for (var i = 0; i < 5; i++) {
            let _randomUrl = '';
            do  {
                _randomUrl = PhotoUrlList[getRandomArbitrary(0, photoUrlListCount)];
            } while (_randomTop5Urls.indexOf(_randomUrl) > -1)

            _randomTop5Urls.push(_randomUrl);
        }

        return _randomTop5Urls;
    } ());

    export class Slide {
        constructor(public Id: number,
            public Active: string,
            public ImageUrl: string,
            public Desc: string
        ) { }
    }
}

(function () {
    angular.module('mvcapp', ['ui.bootstrap'])
        .controller('DashboardCtrl', ['$scope',
            function ($scope) {
                $scope.slides = [];
                let index = 0;
                for (let randomTop5Url of Dashboard.randomTop5Urls) {
                    let _active = '';
                    let _desc = '';

                    if (index == 0) {
                        _active = 'active';
                    }

                    $scope.slides.push(new Dashboard.Slide(index++, _active, randomTop5Url, _desc));
                }
            }]);
})()