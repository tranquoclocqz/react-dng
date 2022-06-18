var date = new Date();
app.controller('salary_upload', function ($scope, $http, $compile, $filter) {

    var pi = $scope.pagingInfo = {
        itemsPerPage: 30,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };
    $scope.init = () => {
        $scope.loadingTable = false;
        $scope.filter = {};
        $scope.type_main = 0;
        $scope.type_temp = 0;
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;
        $scope.getListSalaryTable();
        $scope.resetInsert();
        $('.op-report').removeClass('op-report');
    }

    $scope.resetInsert = () => {
        $scope.obj_insert = {
            name: '',
            type: 1, //1: temp, 2:main
            month: (date.getMonth() + 1).toString(),
            year: date.getFullYear().toString(),
        };
    }

    $scope.uploadFile = () => {
        var input = document.getElementById('input-file'),
            fd = new FormData(),
            file = input.files[0];

        if (!file && $scope.obj_insert.mainSalary) {
            showMessSuccess();
            $('#upload_temp_salary_table').modal('hide');
            return;
        }

        if (!file) {
            showMessErr('Vui lòng chọn file');
            showInputErr('.input-upload');
            return;
        }

        $scope.load_upload = true;
        fd.append('file', file);
        $.each($scope.obj_insert, function (k, v) {
            fd.append(k, v);
        });
        $http({
            method: 'POST',
            url: base_url + 'ketoan/salaries/ajax_upload',
            headers: {
                'Content-Type': undefined
            },
            data: fd
        }).then(r => {
            $scope.load_upload = false;
            if (r.data && r.data.status) {
                $('#upload_temp_salary_table').modal('hide');
                showMessSuccess();
                $scope.resetInsert();
                $scope.getListSalaryTable();
                input.value = '';
            } else {
                showMessErr(r.data.message);
            }
        }, function (response) {
            showMessErrSystem();
        });
    }

    $scope.getListSalaryTable = () => {
        $scope.loadingTable = true;
        $http.get(base_url + 'ketoan/salaries/get_list_salaries?filter=' + JSON.stringify($scope.filter)).then(r => {
            $scope.loadingTable = false;
            if (r.data.status) {
                $scope.listSalary = r.data.data;
                $scope.listSalary.forEach(item => {
                    item.user_main = JSON.parse(item.user_main);
                    item.user_temp = JSON.parse(item.user_temp);
                });
                $scope.pagingInfo.total = r.data.count;
                $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
            } else {
                showMessErr(r.data.message);
            }
        })
    }

    $scope.uploadtempSalary = () => {
        $scope.resetInsert();
        $('#fileName').text('');
        $('#upload_temp_salary_table').modal('show');
    }

    $scope.uploadMainSalary = (item) => {
        event.preventDefault();
        var value = angular.copy(item)
        var mainSalary = value.user_main ? value.user_main.main_file : '';
        document.getElementById('input-file').value = '';
        $scope.resetInsert();
        $('#fileName').text(mainSalary);

        $scope.obj_insert = {
            name: value.name,
            salaries_id: item.id,
            type: 2, //1: temp, 2:main
            month: value.month,
            year: value.year,
            tempSalary: value.user_temp.temp_file,
            mainSalary: mainSalary
        };

        $('#upload_temp_salary_table').modal('show');
    }

    $scope.attachFile = () => {
        $('#input-file').click();
    }

    $('input[type="file"]').change(function (e) {
        var fileName = e.target.files[0].name;
        $('#fileName').text(fileName);
    });


    $scope.removeSalary = (item) => {
        event.preventDefault();
        swal({
                title: "Thông báo",
                text: "Bạn có chắc hành động này!",
                type: "warning",
                showCancelButton: true,
                confirmButtonClass: "btn-danger",
                confirmButtonText: "Xác nhận",
                cancelButtonText: "Đóng",
                closeOnConfirm: false,
                showLoaderOnConfirm: true
            },
            function () {
                $http.get(base_url + 'ketoan/salaries/remove_salary_table?id=' + item.id).then(r => {
                    if (r.data.status) {
                        swal("Thông báo", "Xóa thành công!", "success");
                        $scope.getListSalaryTable();
                    } else {
                        swal("Thông báo", r.data.message, "error");
                    }
                })
            });
    }

    $scope.openPopupMess = (item) => {
        event.preventDefault();
        var val = angular.copy(item);
        $scope.type_main = 0;
        $scope.type_temp = 0;
        $scope.objSalary = {
            salaries_id: val.id,
            temp: val.user_temp,
            main: val.user_main,
        }
        $('#modal-send-message').modal('show');
    }

    $scope.chang_active_type = (temp) => {
        if (temp) {
            $scope.type_main = 0
        } else {
            $scope.type_temp = 0
        }
    }

    $scope.sendMessage = () => {
        if (!$scope.type_temp && !$scope.type_main) {
            showMessErr('Chọn bảng lương cần gửi');
            return;
        }

        if ($scope.type_temp && $scope.type_main) {
            showMessErr('Chỉ được chọn 1 bảng lương');
            return;
        }
        var data_rq = {
            salaries_id: $scope.objSalary.salaries_id,
            type: $scope.type_temp ? $scope.type_temp : $scope.type_main
        }
        $scope.objSalary.load = true;
        $http.post(base_url + 'ketoan/salaries/send_message?' + $.param(data_rq)).then(r => {
            $scope.objSalary.load = false;
            if (r.data.status) {
                $scope.getListSalaryTable();
                $('#modal-send-message').modal('hide');
                showMessSuccess();
            } else {
                showMessErr(r.data.message);
            }
        })
    }

    $scope.formatDateToTime = (date, type = 'DD/MM/YYYY HH:mm') => {
        return moment(date, 'YYYY-MM-DD HH:mm:ss').format(type)
    }

    $scope.go2Page = function (page) {
        if (page < 0) return;
        var pi = $scope.pagingInfo;
        pi.currentPage = page;
        pi.from = pi.offset = (pi.currentPage - 1) * pi.itemsPerPage;
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = ($scope.pagingInfo.currentPage - 1) * $scope.pagingInfo.itemsPerPage;
        $scope.getListSalaryTable();
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
})