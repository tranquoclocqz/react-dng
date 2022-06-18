app.controller('temp_app', function ($scope, $http) {
    $scope.init = () => {
        $('#temp_app').addClass('in');
        $scope.filter = {
            date: toDay
        };
        $scope.getList();
        $(".date_filter").datepicker({
            dateFormat: "dd-mm-yy"
        });
        if ($('body').width() <= 1024) {
            $('body').addClass('sidebar-collapse');
        }
    }

    $scope.getList = () => {
        var data_rq = angular.copy($scope.filter);
        data_rq.date = moment(data_rq.date, 'DD-MM-YYYY').format('YYYY-MM-DD');
        $scope.load_list = true;
        $http.get(base_url + 'appointments/ajax_get_app_temp?' + $.param(data_rq)).then(r => {
            if (r && r.data.status == 1) {
                var data = r.data.data;
                $scope.list_waiting = data.filter(x => x.is_finish != 1);
                $scope.list_imported = data.filter(x => x.is_finish == 1);
                $scope.parsehtmlList($scope.list_waiting, '#list_waiting');
                $scope.parsehtmlList($scope.list_imported, '#list_imported');
            } else showMessErr("Đã có lỗi xẩy ra!");
            $scope.load_list = false;
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope.parsehtmlList = (data, selector) => {
        if ($.fn.DataTable.isDataTable(selector)) {
            $(selector).DataTable().destroy();
        }
        setTimeout(() => {
            var obj_language = {
                "language": {
                    "processing": '<i class="fa fa-spinner fa-spin fa-3x fa-fw"></i><span class="sr-only">Đang tải...</span> ',
                    "sLengthMenu": "Xem _MENU_ mục",
                    "sZeroRecords": "Không tìm thấy dòng nào phù hợp",
                    "sInfo": "Đang xem _START_ đến _END_ trong tổng số _TOTAL_ mục",
                    "sInfoEmpty": "Đang xem 0 đến 0 trong tổng số 0 mục",
                    "sInfoFiltered": "(được lọc từ _MAX_ mục)",
                    "sInfoPostFix": "",
                    "sSearch": "Tìm:",
                    "sUrl": "",
                    "oPaginate": {
                        "sFirst": "Đầu",
                        "sPrevious": "Trước",
                        "sNext": "Tiếp",
                        "sLast": "Cuối"
                    }
                },
                "pageLength": 50
            };
            if (!data.length)
                obj_language.data = [];
            $(selector).DataTable(obj_language);
        }, 0);
    }

    $scope.addInvoice = (item) => {
        Swal.fire({
            title: 'Bạn có chắc tạo phiếu thu?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            cancelButtonText: 'Hủy',
            confirmButtonText: 'Đồng ý',
            allowOutsideClick: false,
        }).then((result) => {
            if (result.value) {
                $http.post(base_url + 'appointments/ajax_add_temp', JSON.stringify(item)).then(r => {
                    if (r.data && r.data.status) {
                        showMessSuccess();
                        $scope.getList();
                        window.open(base_url + 'invoice_temp_v2/detail/' + r.data.data.insert_id, 'blank');
                    } else showMessErr(r.data.message);
                }, function (data, status, headers, config) {
                    showMessErrSystem();
                });
            }
        });
    }
})

jQuery(function ($) {
    $.datepicker.regional["vi-VN"] = {
        closeText: "Đóng",
        prevText: "Trước",
        nextText: "Sau",
        currentText: "Hôm nay",
        monthNames: ["Tháng một", "Tháng hai", "Tháng ba", "Tháng tư", "Tháng năm", "Tháng sáu", "Tháng bảy", "Tháng tám", "Tháng chín", "Tháng mười", "Tháng mười một", "Tháng mười hai"],
        monthNamesShort: ["Một", "Hai", "Ba", "Bốn", "Năm", "Sáu", "Bảy", "Tám", "Chín", "Mười", "Mười một", "Mười hai"],
        dayNames: ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"],
        dayNamesShort: ["CN", "Hai", "Ba", "Tư", "Năm", "Sáu", "Bảy"],
        dayNamesMin: ["CN", "T2", "T3", "T4", "T5", "T6", "T7"],
        weekHeader: "Tuần",
        firstDay: 1,
        isRTL: false,
        showMonthAfterYear: false,
        yearSuffix: ""
    };
    $.datepicker.setDefaults($.datepicker.regional["vi-VN"]);
});

$('.tab-content tabel').on('draw.dt', function () {
    $(this).wrap('<div class="table-responsive"></div>')
});