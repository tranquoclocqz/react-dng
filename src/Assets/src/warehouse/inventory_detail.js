app.controller('ivdtCtrl', function ($scope, $http) {
    $scope.init = () => {
        $scope.id = idTmp;
        $scope.tran = {};
        getTranDetail();
        $scope.user_id = id_current_user;
        $scope.fullname = fullname;
        $scope.loading = true;
        $scope.tranNotAccept = [];
        $scope.userHistory = [];
        $('.box-hide').css('opacity', '1');
    }

    $scope.viewTranNotAccept = () => {
        $('#viewTranNotAccept').modal('show');
    }

    function getTranNotUnfinish(tran) {
        $http.post(base_url + '/warehouse/ajax_get_tran_unfinish', tran).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.tranNotAccept = r.data.data;
            }
        })
    }

    function getTranDetail() {
        $scope.loading = true;
        $http.get(base_url + '/warehouse/ajax_get_inventory_tmp_details/' + $scope.id).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.loading = false;
                $scope.tran = r.data.data;
                $scope.tran.log = ($scope.tran.log && $scope.tran.log != '') ? JSON.parse($scope.tran.log) : [];
                $scope.tran.products.forEach(element => {
                    element.quantity_real = Number(element.quantity_real);
                });
                getTranNotUnfinish($scope.tran);
            }
        })
    }

    $scope.checkQuanity = (q1, q2) => {
        return q1 == q2 ? false : true;
    }

    $scope.formatDate = (date, type) => {
        return moment(date).format(type);
    }

    $scope.print_docs = (id) => {
        window.open(base_url + '/warehouse/print_inventory/' + id)
    }

    $scope.viewHistoryUser = () => {
        $('#historyUser').modal('show');
    }

    $scope.openFormReload = () => {
        $('#reload').modal('show');
    }

    $scope.confirmReload = () => {
        $http.post(base_url + '/warehouse/ajax_reload_tran_tmps', $scope.tran).then(r => {
            if (r.data && r.data.status == 1) {
                toastr['success']('Làm mới phiếu thành công!');
                getTranDetail();
            } else {
                toastr['error'](r.data && r.data.message ? r.data.message : 'Có lổi xẩy ra. Vui lòng thử lại sau!');
            }
        })
    }

    $scope.confirmTran = (status, edit) => {
        $scope.loading = true;
        let data = $scope.tran;
        data.status = status;
        data.isEdit = edit ? 1 : 0;
        if (edit) {
            data.log.unshift({ user_id: $scope.user_id, name: $scope.fullname, created: moment().format('YYYY-MM-DD HH:mm:ss') });
            data.log = JSON.stringify(data.log);
        }
        $http.post(base_url + '/warehouse/ajax_confirm_tran_tmp', data).then(r => {
            if (r.data && r.data.status == 1) {
                toastr['success'](edit ? 'Lưu thành công!' : 'xác nhận thành công!');
                getTranDetail();
            } else {
                $scope.loading = false;
                if (data.status == 2) {
                    data.status = 1;
                }
                toastr['error'](r.data && r.data.message ? r.data.message : 'Có lổi xẩy ra. Vui lòng thử lại sau!');
            }
        })
    }

    $scope.openConfirm = () => {
        $('#confirmDelete').modal('show');
    }

    $scope.checkDifferentQuantity = (item) => {
        if ($scope.tran.status == 1) return false;
        return item.quantity == item.quantity_real ? false : true;
    }

    $scope.deleteTran = () => {
        let data = { id: $scope.tran.id };
        $('#confirmDelete').modal('hide');
        $http.post(base_url + '/warehouse/ajax_delete_tran_tmp', data).then(r => {
            if (r.data && r.data.status == 1) {
                toastr['success']('Xóa thành công!');
                setTimeout(() => {
                    window.close();
                }, 2500);
            } else {
                toastr['error']('Có lổi xẩy ra. Vui lòng thử lại sau!');
            }
        })
    }

    $scope.checkQuanChange = () => {
        if ($scope.tran && $scope.tran.products) {
            let tmp = $scope.tran.products.filter(r => { return r.quantity != r.quantity_real; });
            return tmp.length > 0 ? tmp.length : 0;
        }
        return -1;
    }

    $scope.checkkey = (event) => {
        var keys = {
            'up': 38,
            'right': 39,
            'down': 40,
            'left': 37,
            'escape': 27,
            'backspace': 8,
            'tab': 9,
            'enter': 13,
            'del': 46,
            '0': 48,
            '1': 49,
            '2': 50,
            '3': 51,
            '4': 52,
            '5': 53,
            '6': 54,
            '7': 55,
            '8': 56,
            '9': 57,
            'dash': 189,
            'subtract': 109
        };

        for (var index in keys) {
            if (!keys.hasOwnProperty(index)) continue;
            if (event.charCode == keys[index] || event.keyCode == keys[index]) {
                return; //default event
            }
        }
        event.preventDefault();
    }
})