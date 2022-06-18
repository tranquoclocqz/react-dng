const config_datatable = {
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
    "pageLength": 50,
    'columns': [{
        width: "5%",
        className: "text-center"
    },
    {
        width: "9%",
        className: "text-center"
    },
    {
        width: "55%",
        className: "text-left"
    },
    {
        width: "13%",
        className: "text-center"
    },
    {
        width: "13%",
        className: "text-center"
    },
    {
        width: "5%",
        className: "text-center",
        orderable: false
    }
    ],
    "columnDefs": [{
        "searchable": false,
        "orderable": false,
        "targets": 5
    }],
};

function submitFiller() {
    let store_id = $('.store').val();
    if (!(store_id && store_id > 0)) {
        toastr.error('Vui lòng chọn chi nhánh');
        return;
    }

    $.ajax({
        url: url_api + "ajax_get_all_service_tour",
        type: "get",
        data: {
            'store_id': store_id,
        },
        dataType: "json",
        beforeSend: function () {
            $('.wrap-all').addClass('loading');
        },
        success: function (response) {
            if (response.status) {
                if ($.fn.DataTable.isDataTable('#table-rs')) {
                    $('#table-rs').DataTable().clear().destroy();
                }
                let data = response.data,
                    html = '';

                if (data && data.length) {
                    $.each(data, function (key, value) {
                        html += `<tr data-id="${value.id}">
                                        <td>${key + 1}</td>
                                        <td>
                                            ${value.service_id}
                                        </td>
                                        <td>
                                            ${value.service_name} -  ${value.price} 
                                        </td>
                                        <td>
                                            <span class="quantity">${value.quantity}</span>
                                        </td>
                                        <td>
                                            <span class="tour">${value.tour}</span>
                                        </td>
                                        <td>
                                            <button data-id="${value.id}" data-service_name="${value.service_name}" data-tour="${value.tour}" data-quantity="${value.quantity}" title="Chỉnh sửa" class="btn btn-xs btn-primary btn-edit"><i class="fa fa-pencil"></i></button>
                                        </td>
                                    </tr>`;
                    });
                }
                $('#table-rs tbody').html(html);

                setTimeout(() => {
                    $('#table-rs').DataTable(config_datatable);
                }, 0)
                setTimeout(() => {
                    $('#table-rs').parent().addClass('table-responsive')
                }, 10)

            } else {
                toastr.error(response.message);
            }
        },
        complete: function () {
            $('.wrap-all').removeClass('loading');
        },
        error: function () {
            toastr.error('Lỗi hệ thống');
        }
    });

}

let current_id = 0;
$(document).on('click', '.btn-edit', function () {
    var self = $(this),
        service_name = self.attr('data-service_name'),
        quantity = self.attr('data-quantity'),
        tour = self.attr('data-tour');
    current_id = self.attr('data-id')
    $('#modal_edit .txt_service_name').val(service_name).attr('title', service_name);
    $('#modal_edit .txt_tour').val(tour);
    $('#modal_edit .txt_quantity').val(quantity);
    $('#modal_edit').modal('show');
})

$(document).on('submit', '#modal_edit form', function (e) {
    e.preventDefault();
    let tour = $('#modal_edit .txt_tour').val(),
        quantity = $('#modal_edit .txt_quantity').val();

    if (!(tour > 0 && tour <= 100)) {
        toastr.error('Số tour phải từ 1 đến 100');
        return;
    }

    if (!(quantity >= -1 && quantity <= 100)) {
        toastr.error('Số lượng phải từ -1 đến 100');
        return;
    }

    $.ajax({
        url: url_api + "save",
        type: "post",
        data: {
            id: current_id,
            tour: tour,
            quantity: quantity,
        },
        dataType: "json",
        beforeSend: function () {
            $('#modal_edit .modal-content').addClass('loading');
        },
        success: function (response) {
            if (response.status) {
                $('#modal_edit').modal('hide');
                let current_tr = $(document).find(`tr[data-id=${current_id}]`);
                current_tr.find('.tour').text(tour);
                current_tr.find('.quantity').text(quantity);
                current_tr.find('.btn-edit').attr('data-tour', tour)
                current_tr.find('.btn-edit').attr('data-quantity', quantity)
                toastr.success('Thành công!');
            } else {
                toastr.error(response.message);
            }
        },
        complete: function () {
            $('#modal_edit .modal-content').removeClass('loading');
        },
        error: function () {
            toastr.error('Lỗi hệ thống');
        }
    });
})

function select2() {
    setTimeout(() => {
        $('.select2').select2();
    }, 50);
}

app.controller('iControler', function ($scope, $http, $compile, $sce) {
    $scope.init = () => {
        $scope.key = '';
        $scope.load_search = false;
        $scope.result_search = {};

        $scope.open_wrap_add = false;
        $scope.add = {
            load: false,
            tour: 1,
            service_name: 'Chưa chọn',
            service_id: 0,
            quantity: '1',
        }
        $scope.copy = {
            store_id_from: current_store_id + '',
            store_id_to: current_store_id + '',
            load: false,
        }

        $scope.all_stores = all_stores;
        submitFiller();
        select2();
    }

    $('.wrap-all .store').on('change', function () {
        $scope.submitFiller();
    })

    $scope.submitFiller = () => {
        submitFiller();
    }

    $scope.show_modal_copy = () => {
        $('#modal_copy').modal('show');
    }

    $scope.show_modal_add = () => {
        $scope.key = '';
        $scope.load_search = false;
        $scope.result_search = {};
        $scope.open_wrap_add = false;
        $('#modal_add').modal('show');
    }

    $scope.search = () => {
        if ($scope.filter_timer) {
            clearTimeout($scope.filter_timer);
        }
        $scope.filter_timer = setTimeout(() => {
            var key = $scope.key,
                data_rq = {
                    key: key,
                    store_id: $('.store').val(),
                };

            if (key.length < 2) return true;

            $scope.load_search = true;
            $http.post(url_api + 'ajax_search_service', data_rq).then(r => {
                if (r.data && r.data.status) {
                    $scope.result_search = r.data.data;
                } else {
                    toastr.error(response.message);
                }
                $scope.load_search = false;

            }, function (data, status, headers, config) {
                toastr["error"]('Vui lòng thử lại!', 'Lỗi!');
            });
        }, 350);
    }

    $scope.chooseItemSearch = (item) => {
        $scope.key = '';
        $scope.open_wrap_add = true;
        $scope.add = {
            load: false,
            tour: 1,
            service_name: item.description + ' - ' + item.price,
            service_id: item.id,
            quantity: '1',
        }
    }

    $scope.add_service = (e) => {
        e.preventDefault();
        if (!($scope.add.tour > 0 && $scope.add.tour <= 100)) {
            toastr.error('Số tour phải từ 1 đến 100');
            return;
        }

        if (!($scope.add.quantity >= 0 && $scope.add.quantity <= 100)) {
            toastr.error('Số lượng phải từ 0 đến 100');
            return;
        }

        $scope.add.load = true;
        let data_rq = angular.copy($scope.add);
        data_rq.store_id = $('.store').val();

        $http.post(url_api + 'ajax_add_service_tour', data_rq).then(r => {
            if (r.data && r.data.status) {
                $scope.submitFiller();
                $scope.open_wrap_add = false;
                $scope.key = '';
                toastr.success(`Đã xét ${$scope.add.tour} tour cho ${$scope.add.service_name}`);
            } else {
                toastr.error(r.data.message);
            }

            $scope.add.load = false;
        }, function (data, status, headers, config) {
            toastr["error"]('Vui lòng thử lại!', 'Lỗi!');
        });
    }

    $scope.copySetting = () => {
        if ($scope.copy.store_id_from == $scope.copy.store_id_to) {
            toastr.error('Không được chọn 2 chi nhánh giống nhau!');
            return;
        }

        $scope.copy.load = true;

        $http.post(url_api + 'ajax_copy_service_tour', $scope.copy).then(r => {
            if (r.data && r.data.status) {
                toastr.success('Sao chép dữ liệu thành công!');
            } else {
                toastr.error(r.data.message);
            }

            $scope.copy.load = false;
        }, function (data, status, headers, config) {
            toastr["error"]('Vui lòng thử lại!', 'Lỗi!');
        });
    }
})