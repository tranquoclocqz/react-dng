app.controller('dbCtrl', function ($scope, $http) {
    $scope.init = () => {
        $scope.query = '';
    }

    $scope.runQuery = () => {
        let data = {
            query: $scope.query
        };
        $http.post(base_url + '/dev/apiQueryDb', data).then(r => {
            if (r && r.data) {
                $scope.results = r.data.data;
            }
        })
    }
})