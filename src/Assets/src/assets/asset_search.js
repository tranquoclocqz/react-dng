app.controller('searchCtrl', function ($scope, $http) {
    $scope.init = () => {
        $scope.filter = {};
        $scope.filter.type = '1';
        $(".box1").css("opacity", "1");

        $scope.loadAssets();
    }

    $scope.loadAssets = () => {
        $http.get('assets/api_get_assets').then(r => {
            $scope.assets = r.data.data;
        })
    }

    $scope.searchAssets = () => {
        $http.get(base_url + '/assets/ajax_search_assets?key=' + $scope.filter.key).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.serials = r.data.data;
            }
        });
    }

    $scope.handlefilter = () => {
        if ($scope.filter.type == 1) {
            $scope.getInventory();
            $scope.getAssetPersonal();
        } else {
            $scope.searchAssets();
        }
    }

    $scope.getAssetPersonal = () => {
        let ft = {
            asset_id: $scope.filter.asset_id
        }
        $http.get(base_url + '/assets/ajax_get_personal_assets?asset_id=' + $scope.filter.asset_id).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.personal = r.data.data;
            }
        })
    };

    $scope.getInventory = () => {
        let ft = {
            asset_id: $scope.filter.asset_id
        }
        $http.get(base_url + '/assets/search_asset_store?filter=' + JSON.stringify(ft)).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.stores = r.data.data;
            }
        })
    }

    $scope.formatDate = (d, fm) => {
        return moment(d).format(fm);
    }

    $scope.getHistory = (dest_id, asset_id, type) => {
        $('#modalHistory').modal('show');
        let param = {
            dest_id: dest_id,
            asset_id: asset_id
        };
        if (type == 2) param.type = 2;
        $scope.loading = true;
        $http.get(`assets/ajax_get_asset_history?` + $.param(param)).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.assetDetail = r.data.data;
            }
            $scope.loading = false;
        });
    }

    $scope.getClassType = (type) => {
        if (type == 1) return 'label-primary';
        if (type == 2) return 'label-warning';
        if (type == 3) return 'label-danger';
        return 'label-default';
    }

    $scope.getClassStatus = (status) => {
        if (status == 1) return 'label-primary';
        if (status == 2) return 'label-info';
        if (status == 3) return 'label-warning';
        if (status == 4) return 'label-danger';
        if (status == 5) return 'label-success';
        if (status == 6) return 'label-danger';
        return 'label-default';

    }
});