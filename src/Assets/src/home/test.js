
app.controller('DatatableCtrl', function ($scope, $http, $sce, $window) {
    $scope.init = () => {
        $scope.model = {
            url: 'https://api.myjson.com/bins/ozfil',
            limit: 20
        }

        $scope.tblBridge = {
            filter: {}
        }

        $scope.columns = [
            {
                model: "name",
                title: "Tên",
                renderWithFunc: function (data, type, full) {
                    return data || ""
                },
                opts: {
                    "width": "45%"
                },
                filter: {
                    type: "text"
                },
                isSortable: true
            }, {
                model: "age",
                title: "age",
                renderWithFunc: function (data, type, full) {
                    return data;
                },
                opts: {
                    "width": "45%"
                },
                filter: {
                    type: "date"
                },
                isSortable: true
            }
        ];
    }

    $scope.abc = () => {
        $scope.tblBridge.refresh();
    }
});