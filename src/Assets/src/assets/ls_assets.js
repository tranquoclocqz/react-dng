app.controller('assetsCtrl', function ($scope, $http, AssetSvc) {

    var pi = $scope.pagingInfo = {
        itemsPerPage: 50,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };

    $scope.init = () => {
        $scope.isView = 1;
        $scope.filter = {};
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;
        $scope.filterGR = {};
        AssetSvc.getAllGroups({ 'active': 1 }).then(r => {
            $scope.loading = false;
            $scope.groups = r.data;
        });
        $scope.get_assests();
        $scope.asset = {
        };
        $scope.group = {};
        $scope.types = [
            { id: '1', name: 'Có serial' },
            { id: '2', name: 'Không có serial' }
        ]

    }


    $scope.changeView = (val) => {
        $scope.isView = val;
        $scope.pagingInfo = {
            itemsPerPage: 50,
            offset: 0,
            to: 0,
            currentPage: 1,
            totalPage: 1,
            total: 0
        };
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;
        $scope.filterGR.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filterGR.offset = $scope.pagingInfo.offset;
        let ls = val == 1 ? $scope.get_assests() : $scope.loadAssetsGroup();
    }

    $scope.editOrAddGroupModal = (group) => {
        if (group) {
            $scope.group = group;
            $scope.group.active = Number(group.active);
        } else {
            $scope.group = {};
            $scope.group.active = 1;
        }
        $('#addGroup').modal('show');
    }

    $scope.createOrUpdateGroup = () => {
        AssetSvc.createOrUpdateGroup($scope.group).then(r => {
            $('#addGroup').modal('hide');
            $scope.loadAssetsGroup();
        })
    }

    $scope.get_assests = () => {
        $scope.loading = true;
        AssetSvc.getAll($scope.filter).then(r => {
            $scope.loading = false;
            $scope.rows = r.data;
            $scope.pagingInfo.total = r.count;
            $scope.pagingInfo.totalPage = Math.ceil(r.count / pi.itemsPerPage);
        })
    }

    $scope.openModel = (id) => {
        if (id) {
            $scope.getAssetById(id);
        } else {
            $scope.getCodeAsset();

        }
    }

    $scope.getCodeAsset = () => {
        AssetSvc.getLastAssetCode().then(code => {
            $scope.asset = {};
            $scope.asset.active = 1;
            $scope.asset.code = code;
            $('#addAsset').modal('show');
        })
    }

    $scope.loadAssetsGroup = (val) => {
        $scope.loading = true;
        AssetSvc.getAllGroups($scope.filterGR).then(r => {
            $scope.loading = false;
            $scope.rows = r.data;
        });
    }

    $scope.getAssetById = (id) => {
        AssetSvc.getAssetById(id).then(data => {
            $scope.asset = data;
            $scope.asset.active = Number($scope.asset.active);
            $('#addAsset').modal('show');

        })
    }

    $scope.createOrUpdateAssets = () => {
        if ($scope.asset.type && $scope.asset.asset_group_id) {
            AssetSvc.createOrUpdateAssets($scope.asset).then(r => {
                $('#addAsset').modal('hide');
                $scope.get_assests();
            })
        } else {
            toastr["error"]("bạn chưa chọn nhóm hoặc loại tài sản!")
        }
    }

    //paging
    $scope.go2Page = function (page) {
        if (page < 0) return;
        var pi = $scope.pagingInfo;
        pi.currentPage = page;
        pi.from = pi.offset = (pi.currentPage - 1) * pi.itemsPerPage;
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = ($scope.pagingInfo.currentPage - 1) * $scope.pagingInfo.itemsPerPage;
        $scope.get_assests();
        pi.to = pi.total < pi.itemsPerPage ? pi.total : pi.itemsPerPage
    }

    $scope.Previous = function (page) {
        if (page - 1 > 0) $scope.go2Page(page - 1);
        if (page - 1 == 0) $scope.go2Page(page);
    }

    $scope.getRange = function (paging) {
        var max = paging.currentPage + 3;
        var total = paging.totalPage + 1;
        if (max > total) max = total;
        var min = paging.currentPage - 2;
        if (min <= 0) min = 1;
        var tmp = [];
        return _.range(min, max);
    }
    //end paging
});