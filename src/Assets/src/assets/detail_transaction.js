app.controller("detailTransactionCtrl", function ($scope, $http, AssetSvc) {

    $scope.dzOptionsFile = {
        paramName: 'file',
        maxFilesize: '10',
        resizeWidth: 1200,
        acceptedFiles: 'image/*',
        url: base_url + '/uploads/ajax_upload_to_filehost?func=asset_detail_transaction',
        dictDefaultMessage: 'Kéo thả hồ sơ tại đây'
    };

    $scope.dzCBFile = {
        'success': function (file, resp) {
            let res = JSON.parse(resp);
            if (res.success == 1) {
                $scope.transaction.images.push({
                    url: res.data[0]
                });
            } else toastr['error'](res.message);
            $('.dz-image').remove();
        }
    };

    $scope.openDetail = (data, response) => {
        $scope.ressponse = response ? response : '';
        $scope.isAction = data.isAction ? data.isAction : 'DETAIL';
        console.log($scope.isAction);
        $scope.getDetailTransaction(data.id);

    }

    $scope.confirmTransaction = () => {
        $scope.loading = true;
        AssetSvc.confirmAssetTransaction($scope.transaction).then(r => {
            $scope.loading = false;
            $('#detailTran').modal('hide');
            angular.element(document.getElementById($scope.ressponse)).scope().getAll();
        })
    }

    $scope.getDetailTransaction = (id) => {
        $('#detailTran').modal('show');
        $scope.loading = true;
        AssetSvc.getAssetTransactionDetail({ 'id': id }).then(data => {
            $scope.loading = false;
            $scope.transaction = data;
            if ($scope.transaction.status == 3) {
                $scope.transaction.assets.forEach(e => {
                    e.quantity_received = '0';
                });
            }
        })
    }

    $scope.printtran = () => {
        window.open(base_url + '/assets/print_transaction_assets?id=' + $scope.transaction.id, "_blank");
    }

    $scope.dowloadSerial = () => {
        let url = base_url + "/assets/dowload_serial_transaction?id=" + $scope.transaction.id
        window.open(url, "_blank");
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

    $scope.showImg = (url) => {
        $scope.currImg = url;
        $("#modalImgDetail").modal("show");
    };

    function select2() {
        setTimeout(() => {
            $('.select2').select2();
        }, 100);
    }

    $scope.formatDate = (date, format) => {
        return moment(date).format(format);
    };
})