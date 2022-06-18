angular.module('app', [])
    .controller('index', function ($scope, $http, $sce, $compile) {
        var pi = $scope.pagingInfo = {
            itemsPerPage: 30,
            offset: 0,
            to: 0,
            currentPage: 1,
            totalPage: 1,
            total: 0
        };

        $scope.init = () => {
            console.log(1);
        }
    })