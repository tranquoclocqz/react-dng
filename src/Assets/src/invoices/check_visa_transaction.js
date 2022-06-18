app.controller('check_visa_transaction', function ($scope, $http, $sce) {
    $scope.init = () => {
        $scope.loading = false;
        $scope.cashbook_banks = cashbook_banks;
        $scope.filter = {
            bank_id: '',
            wait_confirm: true,
            dates: dates,
            option_position: position_excel_check_visa
        };
        $scope.lists = [];
        $scope.row_not_matchs = [];
        $('#check_visa_transaction').fadeIn('fast');
    }

    $scope.confirmList = () => {
        var lists = angular.copy($scope.lists),
            checkeds = lists.filter(x => x.checked);

        if (!checkeds.length) {
            showMessErr('Vui lòng chọn hàng cần duyệt');
            return;
        }
        var ids = checkeds.map(x => x.id);

        Swal.fire({
            title: "Bạn có chắc chắn?",
            icon: 'warning',
            showCancelButton: true,
            cancelButtonText: 'Hủy',
            confirmButtonText: 'Đồng ý',
            allowOutsideClick: false,
            showLoaderOnConfirm: true,
            preConfirm: function () {
                return new Promise(function (resolve, reject) {
                    $scope.$apply(function () {
                        $http.post(base_url + 'ketoan/invoices/ajax_confirm_transfer_by_ids', {
                            ids: ids,
                        }).then(r => {
                            if (r.data.status) {
                                Swal.close();
                                $scope.readExcel();
                            } else {
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Lỗi',
                                    text: r.data.message
                                });
                            }
                        })
                    });
                });
            },
        }).then(function () {});
    }

    $scope.changeFilterConfirm = () => {
        $('#summit_get').trigger('click');
    }

    $scope.readExcel = () => {
        var input = document.getElementById('file-exel'),
            fd = new FormData(),
            file = input.files[0],
            obj_filter = angular.copy($scope.filter),
            bank_id = Number(obj_filter.bank_id),
            wait_confirm = obj_filter.wait_confirm,
            start_date = getDateBw(obj_filter.dates),
            end_date = getDateBw(obj_filter.dates, 0);

        if (!file) {
            showMessErr('Vui lòng chọn file để Lấy dữ liệu');
            showInputErr('#file-exel');
            return;
        }
        fd.append('file', file);
        fd.append('bank_id', bank_id);
        fd.append('wait_confirm', wait_confirm ? 1 : 0);
        fd.append('start_date', start_date);
        fd.append('end_date', end_date);
        fd.append('option_position', JSON.stringify(obj_filter.option_position));

        $scope.loading = true;
        $scope.lists = [];
        $scope.row_not_matchs = [];
        $http({
            method: 'POST',
            url: base_url + 'ketoan/invoices/ajax_read_data_excel_visa',
            headers: {
                'Content-Type': undefined
            },
            data: fd
        }).then(r => {
            $scope.loading = false;
            if (r.data && r.data.status) {
                showMessSuccess();
                var data = r.data.data,
                    lists = data.lists,
                    row_not_matchs = data.row_not_matchs;

                $.each(lists, function (index, value) {
                    value.checked = value.count_match == 2;
                });
                $scope.lists = lists;
                $scope.row_not_matchs = Object.values(row_not_matchs);
            } else {
                showMessErr(r.data.message);
            }
        }, function () {
            showMessErrSystem();
        });
    }
})

function checkFile(input) {
    var arrType = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        '.xlsx',
        '.xls',
        '.csv',
        'application/octet-stream',
    ];
    if (!arrType.includes(input.files[0].type)) {
        showMessErr(`File ${input.files[0].name} sai định dạng`);
        input.value = '';
    }
}