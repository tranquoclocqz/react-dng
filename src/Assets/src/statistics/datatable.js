'use strict';

app.directive("dtTable", function () {
    return {
        scope: {
            columns: '=',
            options: '=',
            model: '=',
            tblBridge: '=',
            refresh: '&',
            callback: '&',
            fromDirectiveFn: '=method'
        },
        controller: ['$scope', '$rootScope', '$http', function ($scope, $rootScope, $http) {

            if (!$scope.tblBridge.externalFilter)
                $scope.tblBridge.externalFilter = {};
            // var _ = require('lodash');
            $scope._filter = {};
            $scope.subFilter = {};
            $scope.moment = moment;
            var pi = $scope.pagingInfo = {
                itemsPerPage: $scope.model.limit,
                offset: 0,
                to: 0,
                currentPage: 1,
                totalPage: 1,
                total: 0
            };
            console.log('pi', pi);

            $scope.colMap = {};



            angular.forEach($scope.columns, function (v, k) {
                $scope.colMap[v.model] = v;
                if (v.actions) {
                    $scope.dbClickRow = angular.copy(v.actions[0].func)
                }
            });

            $scope.changeSubFilter = function () {
                $scope.loadRows();
            }


            $scope.parseDate = function (col, val, fmt) {

                if (moment(val, fmt).isValid()) {
                    $scope.subFilter[col] = val;
                    $scope.updateWhere();

                } else {

                    $scope.subFilter[col] = null;
                    $scope.updateWhere();
                }
            }


            $scope.go2Page = function (page) {
                if (page < 0) return;
                var pi = $scope.pagingInfo;
                pi.currentPage = page;
                pi.from = pi.offset = (pi.currentPage - 1) * pi.itemsPerPage;
                $scope.loadRows(function () {
                    $scope.currentPage = page;
                });
                pi.to = pi.total < pi.itemsPerPage ? pi.total : pi.itemsPerPage
            }

            $scope.Previous = function (page) {
                if (page - 1 > 0) $scope.go2Page(page - 1);
                if (page - 1 == 0) $scope.go2Page(page);
            }


            $scope.changeFilter = function () {
                console.log('changeFilter');
                $scope.loadRows();
            }

            $scope.tblBridge.refresh = $scope.refresh = function () {
                $scope.loadRows();
            };

            $scope.getRange = function (paging) {
                var max = paging.currentPage + 3;
                var total = paging.totalPage + 1;
                if (max > total) max = total;
                var min = paging.currentPage - 2;
                if (min <= 0) min = 1;
                var tmp = [];
                return _.range(min, max);
            }

            $scope.tblBridge.updateWhere = $scope.updateWhere = function (q) {
                $scope.pagingInfo.currentPage = 1; $scope.pagingInfo.offset = 0;
                angular.forEach($scope.columns, function (col) {
                    if (col.sort) {
                        $scope.sort = col.model + ' ' + col.sort;
                    }
                })
                $scope.loadRows();
            }
            $scope.resetColumnsSort = function (col) {
                angular.forEach($scope.columns, function (v, k) {
                    if ($scope.columns[k] != col)
                        $scope.columns[k].sort = null;
                });
            }

            $scope.loadRows = function (cb, arrs) {
                var filter = {
                    filter: $scope.subFilter,
                    order: $scope.sort,
                    limit: pi.itemsPerPage,
                    offset: pi.offset,
                };

                console.log(filter);
                filter = JSON.stringify(filter);
                console.log('filter', filter);

                $http.get($scope.model.url + '?filter=' + filter).then(function (data) {
                    console.log(data);

                    $scope.rows = data.data.data;
                    $scope.pagingInfo.total = data.data.count;
                    $scope.pagingInfo.totalPage = Math.ceil(data.data.count / pi.itemsPerPage);
                });

            }
            $scope.loadRows();
        }],
        templateUrl: './assets/src/statistics/vb-table2.html'
    };
});