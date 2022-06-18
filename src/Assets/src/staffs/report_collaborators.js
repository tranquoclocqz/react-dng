
app.controller('RpController', function ($scope, $http) {
    $scope.init = () => {
        $('.box1').css('opacity', '1');
        $scope.filter = {
            store_id: storeId + '',
            start_date: moment().format('01/MM/YYY'),
            end_date: moment().format('DD/MM/YY')
        }
        $scope.getReport();
        select2();
        setTimeout(() => {
            fetchFilter();
        }, 100)
    }

    function select2() {
        $('.select2').select2();
    }

    function fetchFilter() {
        $scope.filter.date = moment().format('01/MM/YYYY') + ' - ' + moment().format('DD/MM/YYYY');
    }

    $scope.getReport = () => {
        $scope.loading = true;
        if ($scope.filter.date) {
            let d1 = $scope.filter.date.split('-')[0].trim();
            let d2 = d1.split('/');
            let d3 = $scope.filter.date.split('-')[1].trim();
            let d4 = d3.split('/');
            $scope.filter.start_date = d2[2] + '-' + d2[1] + '-' + d2[0];
            $scope.filter.end_date = d4[2] + '-' + d4[1] + '-' + d4[0];
        } else {
            $scope.filter.start_date = moment().format('YYYY-MM-01');
            $scope.filter.end_date = moment().format('YYYY-MM-DD');
        }

        $http.get(base_url + '/staffs/ajax_report_collaborators?' + $.param($scope.filter)).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.loading = false;
                $scope.rows = r.data.data;
            } else {
                toastr.error('có lỗi xẩy ra. Vui lòng thử lại sau')
            }
        })
    }

    $scope.geStatusShip = (id) => {
        id = parseInt(id);
        var obj_return = {
            name: '',
            class_name: ''
        };
        switch (id) {
            case -1:
                obj_return = {
                    name: 'Hủy',
                    class_name: 'label-danger'
                }
                break;
            case 1:
                obj_return = {
                    name: 'Chờ lấy hàng',
                    class_name: 'warning'
                }
                break;

            case 2:
                obj_return = {
                    name: 'Đang giao hàng',
                    class_name: 'primary'
                }
                break;

            case 3:
                obj_return = {
                    name: 'Đã chuyển hoàn',
                    class_name: 'danger'
                }
                break;

            case 4:
                obj_return = {
                    name: 'Đã đối soát',
                    class_name: 'success'
                }
                break;
            case 5:
                obj_return = {
                    name: 'Giao thành công',
                    class_name: 'info'
                }
                break;

            default:
                obj_return = {
                    name: 'Không xác định',
                    class_name: 'default'
                }
                break;
        }
        return obj_return;
    }
})