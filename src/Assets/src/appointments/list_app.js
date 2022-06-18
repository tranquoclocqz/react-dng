$(".js-example-data-ajax").select2();


if ($('body').width() <= 1250) {
    $('body').addClass('sidebar-collapse');
}
window.onresize = function(event) {
    if ($('body').width() <= 1250) {
        $('body').addClass('sidebar-collapse');
    }
};

app.controller('appointments', function($scope, $http, $compile) {
    $scope.init = () => {
        $('.appointments').fadeIn('fast');
        $scope.filter = {};
        $scope.getAllBeauty();
        $scope.current_bed_id = 0;
        $scope.allow_edit_app = allow_edit_app;
        $scope.cr_user_id = cr_user_id;
        $scope.id_beauty = '0';
        $scope.this_bed = 0;
        $scope.this_invoice = 0;
        $scope.this_event = null;
        $scope.load_re_bed = false;
        $scope.pass = true;
        $scope.loading_finish_bed = false;
        $scope.loading_finish_invoice = true;
        $scope.invoice_finish_beds = {};
        $scope.resetSort();
        $scope.getData();
        $scope.obj_invoice_need_finish = {
            load: false,
            list: [],
        };

        $scope.obj_manager = {};
    }

    $scope.openManagerConfirm = (value) => {
        var item = angular.copy(value);
        $scope.obj_manager = {
            load: false,
            note: item.manager_note,
            manager_id: cr_user_id,
            appointment_id: item.id
        };
        $('#modal_manager_note').modal('show');
    }

    $scope.openManagerUpdateNote = (value) => {
        $('[role="tooltip"]').remove();
        if (!value.is_today || value.manager_id != cr_user_id) return;
        var item = angular.copy(value);
        $scope.obj_manager = {
            load: false,
            note: item.manager_note,
            manager_id: cr_user_id,
            appointment_id: item.id,
            is_update_note: 1
        };
        $('#modal_manager_note').modal('show');
    }

    $scope.managerNotConfirm = (item) => {
        Swal.fire({
            title: 'Bạn có chắc chắn?',
            html: 'Hủy xác nhận tiếp khách',
            icon: 'warning',
            showCancelButton: true,
            cancelButtonText: 'Hủy',
            confirmButtonText: 'Đồng ý',
            allowOutsideClick: false,
            showLoaderOnConfirm: true,
            preConfirm: function() {
                return new Promise(function(resolve, reject) {
                    $scope.$apply(() => {
                        $scope.obj_manager = {
                            note: null,
                            manager_id: 0,
                            appointment_id: item.id
                        };
                        $scope.saveManagerConfirm();
                    })
                });
            },
        }).then(function() {});
    }

    $scope.saveManagerConfirm = () => {
        $scope.obj_manager.load = true;
        $http.post(base_url + 'appointments/ajax_manager_confirm', $scope.obj_manager).then(r => {
            $scope.obj_manager.load = false;
            Swal.close();
            if (r.data && r.data.status) {
                $('#modal_manager_note').modal('hide');
                showMessSuccess();
                $scope._updateItemApp($scope.obj_manager.appointment_id, r.data.data);
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi!',
                    text: r.data.message
                });
            }
            setTimeout(() => {
                $scope.$apply();
            }, 0);
        }, function(data, status, headers, config) {
            showMessErrSystem();
        });
    }
    $scope.pagingInfo = {
        itemsPerPage: 50,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };

    $scope.getData = () => {
        $scope.resetSort();
        $('.appointments').addClass('loading');
        var data_rq = {};
        if ($scope.ajax_data) {
            data_rq.date = $scope.ajax_data.date;
        }
        $http.get(base_url + 'appointments/ajax_get_list_app?filter=' + JSON.stringify(data_rq)).then(r => {
            $('.appointments').removeClass('loading');
            if (r.data.status) {
                var data = r.data.data,
                    is_today = false,
                    i = 1;

                $scope.ajax_data = data;
                $scope.actived = $scope.new = $scope.old = 0;
                $scope.c_img = $scope.c_cus = 0;

                if (data.date == data.current_date) {
                    is_today = true;
                }
                $scope.ajax_data.results.forEach(element => {
                    element.i = i++;
                    element.is_today = is_today;
                    element.invoice_id = Number(element.invoice_id);
                    $scope.c_img += element.c_img;
                    if (element.c_img > 0) $scope.c_cus++;
                    if (element.status == 1) {
                        $scope.actived++;
                    }
                    if (element.customer_type_ == 'old') {
                        $scope.old++;
                    } else {
                        $scope.new++;
                    }
                    if (!element.arrival_time) {
                        element.skin_id = '-1';
                    }
                });
                console.log($scope.ajax_data.results);
                $scope.ajax_data._results = angular.copy($scope.ajax_data.results)
                $scope.current_date_filter = angular.copy($scope.ajax_data.date);
                $scope.updatePagination();
                $scope.go2Page(1);
            } else showMessErr("Đã có lỗi xẩy ra!");
        })
    }

    // begin sort table end pagination
    $scope.updatePagination = () => {
        var count = $scope.ajax_data.results.length;
        $scope.pagingInfo.total = count;
        $scope.pagingInfo.totalPage = Math.ceil(count / $scope.pagingInfo.itemsPerPage);
    }

    $scope.go2Page = (page) => {
        if (page < 0) return;
        $scope.pagingInfo.currentPage = page;
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = ($scope.pagingInfo.currentPage - 1) * $scope.pagingInfo.itemsPerPage;
    }

    $scope.Previous = (page) => {
        if (page - 1 > 0) $scope.go2Page(page - 1);
        if (page - 1 == 0) $scope.go2Page(page);
    }

    $scope.getRange = (paging) => {
        var max = paging.currentPage + 3;
        var total = paging.totalPage + 1;
        if (max > total) max = total;
        var min = paging.currentPage - 2;
        if (min <= 0) min = 1;
        return _.range(min, max);
    }

    $scope.resetSort = () => {
        $scope.sort_table = {
            order: 'asc',
            sorting: 'index',
        }
        $scope.key_search = '';
    }

    $scope._toggleSort = () => {
        if ($scope.sort_table.order == 'asc') $scope.sort_table.order = 'desc';
        else $scope.sort_table.order = 'asc';
    }

    $scope.sortTable = (key) => {
        if ($scope.sort_table.sorting == key) {
            $scope._toggleSort();
        } else {
            $scope.sort_table.order = 'asc';
        }
        $scope.sort_table.sorting = key;
        $scope._sortData(key);
    }

    $scope._sortData = (key) => {
        var left = 1,
            right = -1;

        if ($scope.sort_table.order == 'desc') {
            left = -1;
            right = 1;
        }
        $scope.ajax_data._results.sort((a, b) => (a.i > b.i ? 1 : -1)); // sx như data lúc đầu

        if (key == 'customer_name') {
            $scope.ajax_data._results.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? left : right));
        } else if (key == 'customer_type') {
            $scope.ajax_data._results.sort((a, b) => (a.i > b.i ? right : left));
            $scope.ajax_data._results.sort((a, b) => (a.customer_type_ > b.customer_type_ ? left : right));
        } else if (key == 'index') {
            $scope.ajax_data._results.sort((a, b) => (a.i > b.i ? left : right));
        } else if (key == 'time') {
            $scope.ajax_data._results.sort((a, b) => (a.time > b.time ? left : right));
        } else if (key == 'import') {
            $scope.ajax_data._results.sort((a, b) => (a.import_name.toLowerCase() > b.import_name.toLowerCase() ? left : right));
        } else if (key == 'status') {
            $scope.ajax_data._results.sort((a, b) => (Number(a.invoice_id) > Number(b.invoice_id) ? left : right));
        }

        $scope.searchTable();
    }

    $scope.searchTable = () => {
            var expected = ToSlug($scope.key_search),
                _data = angular.copy($scope.ajax_data._results);
            if (expected == '') {
                $scope.ajax_data.results = _data;
            } else {
                $scope.ajax_data.results = _data.filter(x =>
                    (x.customer_id && ToSlug(x.customer_id).indexOf(expected) !== -1) ||
                    ToSlug(x.time).indexOf(expected) !== -1 ||
                    ToSlug(x.name).indexOf(expected) !== -1 ||
                    ToSlug(x.phone).indexOf(expected) !== -1 ||
                    ToSlug(x.note).indexOf(expected) !== -1 ||
                    ToSlug(x.adv_note).indexOf(expected) !== -1 ||
                    ToSlug(x.cs_note).indexOf(expected) !== -1);
            }
            $scope.go2Page(1);
            $scope.updatePagination();
        }
        // end sort table end pagination

    $scope.confirmFinishInvoice = (item) => {
        if (item.invoice_date != toDay) {
            showMessErr('Phiếu thu đã qua ngày');
            return;
        }
        Swal.fire({
            title: 'Bạn có chắc chắn?',
            html: 'Hoàn tất phiếu thu khách ' + `<b>${item.customer_name}</b>`,
            icon: 'warning',
            showCancelButton: true,
            cancelButtonText: 'Hủy',
            confirmButtonText: 'Đồng ý',
            allowOutsideClick: false,
            showLoaderOnConfirm: true,
            preConfirm: function() {
                return new Promise(function(resolve, reject) {
                    $scope._finishInvoice(item);
                });
            },
        }).then(function() {});
    }

    $scope._finishInvoice = (item) => {
        $http.post(base_url + 'invoices_v2/ajax_toggle_finish_invoice', {
            invoice_id: item.invoice_id,
            is_finish: 1,
        }).then(r => {
            Swal.close();
            if (r.data && r.data.status) {
                showMessSuccess();
                $scope.getListInvoiceNeedFinish();
            } else {
                showMessErr(r.data.message);
            }
        }, function(data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope.getListInvoiceNeedFinish = () => {
        $scope.obj_invoice_need_finish = {
            load: true,
            list: [],
        };
        var data_rq = {
            date: $scope.ajax_data.date,
            store_id: cr_store_id
        }
        $http.get(base_url + 'invoices_v2/ajax_get_list_invoice_not_finish?' + $.param(data_rq)).then(r => {
            $scope.obj_invoice_need_finish.load = false;
            if (r && r.data.status == 1) {
                $scope.obj_invoice_need_finish.list = r.data.data;
            } else {
                showMessErr(r.data.message);
            }
        }, function() {
            showMessErrSystem('Không thể lấy danh sách phiếu thu cần hoàn tất');
        })
    }

    $scope.saveApp = () => {
        if (!$scope.phone_app) {
            showMessErr("Nhập số điện thoại!");
            return false;
        }
        if (!$scope.name) {
            showMessErr("Nhập tên khách hàng!");
            return false;
        }

        var data = {
            phone: $scope.phone_app,
            name: $scope.name
        };

        $http.post(base_url + 'appointments/ajax_add_app_in_day', JSON.stringify(data)).then(r => {

            if (r && r.data.status == 1) {
                showMessSuccess("Thành công!");
                $scope.getData();
                $scope.name = "";
                $('input[name=phone]').val("");
                $scope.phone_app = "";
            } else if (r && r.data.status == 0) {
                showMessErr(r.data.message);
                if (r.data.id) {
                    $scope.id_app = r.data.id;
                }
            } else showMessErr("Đã có lỗi xẩy ra!");
        })

    }

    $scope.showComplain = (customer_id, is_show = 1) => {
        if (is_show != 1) {
            return;
        }
        show_complain(customer_id);
    }

    $scope.checkPhone = (event) => {

        if ($scope.pass && $scope.name && $scope.name != "") {
            if ($scope.phone_app) {
                event.preventDefault();
                $('input[name=booking]').attr('disabled', true);
                var data = {
                    phone: $scope.phone_app
                }
                $scope.id_app = undefined;
                $http.get(base_url + 'appointments/check_appointment?filter=' + JSON.stringify(data)).then(r => {

                    if (r && r.data.status == 1) {
                        if (r.data.data > 0) {
                            $scope.id_app = r.data.data;
                            $('input[name=booking]').attr('disabled', false);
                        } else if (r.data.data == 0) {
                            $scope.pass = false;
                            $('input[name=booking]').attr('disabled', false);
                            $('input[name=booking]').trigger('click');
                            $('input[name=booking]').attr('disabled', true);
                        } else {
                            showMessErr("Đã có lỗi xẩy ra!");
                        }
                    } else {
                        $('input[name=booking]').attr('disabled', false);
                        showMessErr("Đã có lỗi xẩy ra!");
                    }
                })
            }
        }
    }

    $scope.getAllBeauty = () => {
        $http.get(base_url + 'admin_users/ajax_get_list_user_by_group_id?group_id=12').then(r => {
            if (r && r.data.status == 1) {
                $scope.all_beauty = r.data.data;
                var obs = {
                        fullname: 'Chọn soi da',
                        id: '-1'
                    },
                    obs2 = {
                        fullname: 'Không soi da',
                        id: '0'
                    };
                $scope.all_beauty.unshift(obs);
                $scope.all_beauty.push(obs2);
            } else showMessErr("Đã có lỗi xẩy ra!");
        }, function() {
            showMessErrSystem();
        })
    }

    $scope.addSkin = (id_beauty, id) => {
        data = {
            id_beauty: id_beauty,
            id: id
        }
        $http.post(base_url + 'appointments/ajax_add_skin', data).then(r => {
            if (r && r.data.status == 1) {
                showMessSuccess("Thành công!");
            } else showMessErr("Đã có lỗi xẩy ra!");
        }, function() {
            showMessErrSystem();
        })
    }

    $scope._updateItemApp = (id, data) => {
        var item = $scope.ajax_data.results.find(x => x.id == id);
        $scope._setItemApp(item, data);

        item = $scope.ajax_data._results.find(x => x.id == id)
        $scope._setItemApp(item, data);
    };

    $scope._setItemApp = (item, data) => {
        item.invoice_time = data.invoice_time;
        item.status = data.status;
        item.arrival_time = data.arrival_time;
        item.skin_time = data.skin_time;
        item.invoice_id = data.invoice_id;
        item.skin_id = data.skin_id;
        item.customer_id = data.customer_id;
        item.status = data.status;
        item.manager_id = data.manager_id;
        item.manager_avatar = data.manager_id ? currentUser.image_url : '';
        item.manager_note = data.manager_note;
    }

    $scope.customerArrival = (value) => {
        data = {
            id: value.id
        }
        value.load = true;
        $http.post(base_url + 'appointments/ajax_cus_arrival', data).then(r => {
            value.load = false;
            if (r && r.data.status == 1) {
                showMessSuccess("Xác nhận khách tới thành công!");
                $scope._updateItemApp(value.id, r.data.data);
            } else showMessErr("Đã có lỗi xẩy ra!");
        }, function() {
            showMessErrSystem();
        })
    }

    $scope.back = (number, value) => {
        data = {
            id: value.id,
            number: number
        }
        value.load = true;
        $http.post(base_url + 'appointments/ajax_back', data).then(r => {
            value.load = false;
            if (r && r.data.status == 1) {
                showMessSuccess("Thành công!");
                $scope._updateItemApp(value.id, r.data.data);
            } else showMessErr("Đã có lỗi xẩy ra!");
        }, function() {
            showMessErrSystem();
        })
    }

    $scope.setSkinApp = (value) => {
        var beauty_id = value.skin_id;
        if (beauty_id == -1) {
            showMessErr("Vui lòng chọn soi da!");
            return false;
        }
        data = {
            id: value.id,
            id_beauty: beauty_id,
            time: true
        }
        value.load = true;
        $http.post(base_url + 'appointments/ajax_add_skin', data).then(r => {
            value.load = false;
            if (r && r.data.status == 1) {
                showMessSuccess(r.data.message);
                $scope._updateItemApp(value.id, r.data.data);
            } else showMessErr("Đã có lỗi xẩy ra!");
        }, function() {
            showMessErrSystem();
        })
    }

    function _createInvoice(value) {
        $.ajax({
            url: base_url + "appointments/change_status",
            data: {
                'id': value.id
            },
            type: "POST",
            dataType: "json",
            beforeSend: function() {
                setTimeout(() => {
                    value.load = true;
                    $scope.$apply();
                }, 0)
            },
            success: function(data) {
                value.load = false;
                if (data.success) {
                    $scope._updateItemApp(value.id, data.data);
                    if (company_id == 4) window.open(base_url + 'invoices_v2/detail/' + data.invoice_id, 'blank');
                } else {
                    showMessErr("Đã có lỗi");
                }
                setTimeout(() => {
                    $scope.$apply();
                }, 0)
            },
            error: function() {
                showMessErrSystem('Không thể tạo phiếu thu');
            }
        });
    }

    $scope.confirmCreateInvoice = (value) => {
        Swal.fire({
            title: 'Tạo hóa đơn?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            cancelButtonText: 'Hủy',
            confirmButtonText: 'Đồng ý',
            allowOutsideClick: false,
        }).then((result) => {
            if (result.value) {
                _createInvoice(value)
            }
        })
    }

    function searchPhone(v) {
        $.ajax({
            type: "get",
            url: base_url + 'customers/get_list_customer_by_phone',
            data: {
                phone: v
            },
            beforeSend: function() {
                $('.dropdown-menu.resust-search table').addClass('load');
                !$('input[name=phone]').parent().hasClass('loading2') && $('input[name=phone]').parent().addClass('loading2');
            },
            dataType: "json",
            success: function(response) {
                if (response.status) {
                    let data = response.data,
                        tbody = '';
                    if (data) {
                        $.each(data, function(index, element) {
                            tbody += `<tr ${element.app_now=="YES" ? 'class="info"' : ''} data-name="${element.name}" data-phone="${element.phone}">
                                <td><div title="${element.name}">${element.app_now=="YES" ? '<i class="fa fa-calendar" style="color: #00a65a;"></i>' : ''} ${element.name}</div></td>
                                <td>${element.phone}</td>
                                <td>${element.created}</td>
                                <td><div>${element.name_stores}</div></td>
                            </tr>`;
                        });
                        viewRs(tbody);
                        setTimeout(() => {
                            !$('input[name=phone]').parent().hasClass('open') && $('input[name=phone]').parent().addClass('open');
                        }, 100)
                    }
                }
            },
            complete() {
                setTimeout(() => {
                    $('.dropdown-menu.resust-search').parent().removeClass('loading2');
                }, 100);
            },
            error() {
                toastr.error('Có lỗi xảy ra!')
            }
        });
    }

    $scope.sPhone = (p) => {
        if (p.length >= 3) {
            searchPhone(p);
            $scope.phone_app = p;
            $('.dropdown-menu.resust-search').parent().removeClass('open');
        }
    }
    $(document).ready(function() {
        $('.dropdown-menu.resust-search').on('mousedown', 'table tbody tr:not(.par-info)', function(e) {
            let p = $(this).attr('data-phone').trim(),
                n = $(this).attr('data-name');
            $('input[name=phone]').val(p);
            $scope.name = n;
            $scope.phone_app = p;
            $scope.$apply();
            $('.dropdown-menu.resust-search').parent().toggleClass('open');
        });
    });

    $scope.showPrintCustomerCode = (item) => {
        $('#print_customer_code').modal('show');
        $scope.obj_print = angular.copy(item);
        $scope.obj_print.note = '';
    }

    $scope.printCustomerCode = () => {
        $scope.obj_print.load = true;
        $http.post(base_url + 'appointments/ajax_print_customer_code', $scope.obj_print).then(r => {
            if (r.data && r.data.status) {
                showMessSuccess('Đã in thông tin khách hàng');
                $('#print_customer_code').modal('hide');
            } else {
                showMessErr(r.data.message);
            }
            $scope.obj_print.load = false;
        }, function() {
            showMessErrSystem();
        })
    }

    $scope.showImages = (list) => {
        var $owl_invoice_image = $("#owl_invoice_image").owlCarousel({
            navigation: false, // Show next and prev buttons
            autoplay: false,
            items: 1,
            itemsDesktop: false,
            itemsDesktopSmall: false,
            itemsTablet: true,
            itemsMobile: false,
            dots: false,
        });

        var html = '';
        $.each(list, function(index, value) {
            var _type = '';
            if (value.type == 'contract') {
                _type = `<span style="color: red; position: absolute; right: 2px;top: 2px;">Hồ sơ</span>`;
            } else if (value.type == 'treatment') {
                _type = `<span style="color: red; position: absolute; right: 2px;top: 2px;">Phát đồ điểu trị</span>`;
            }
            html += `<div class="item">
                            ${_type}
                            <img class="img-responsive img-customer" src="${value.image}">
                        </div>`;
        });

        $('#modal_invoice_image_customer').modal('show').find('#owl_invoice_image').html(html);
        $("#owl_invoice_image").attr('class', 'owl-carousel owl-theme');
        $owl_invoice_image.trigger('destroy.owl.carousel');
        setTimeout(() => {
            $owl_invoice_image = $(document).find("#owl_invoice_image").owlCarousel({
                navigation: false, // Show next and prev buttons
                nav: true,
                navText: ['<i class="fa fa-chevron-left left" aria-hidden="true"></i>', '<i class="fa fa-chevron-right right" aria-hidden="true"></i>'],
                autoplay: false,
                items: 1,
                itemsDesktop: false,
                itemsDesktopSmall: false,
                itemsTablet: true,
                itemsMobile: false,
                dots: false,
            });
        }, 150);
    }
});
app.controller('add', function($scope, $http, $location) {
    $scope.init = () => {
        $('.box').css('opacity', 1);
    }
    $scope.openHistory = () => {
        $scope.load_his_user = true;
        var data = {
            cr_user: id_current_user
        }

        $http.get(base_url + 'appointments/ajax_open_history?filter=' + JSON.stringify(data)).then(r => {
            if (r && r.data.status == 1) {
                $scope.load_his_user = false;

                $scope.list_customers = r.data.list_customers;
                $scope.lists = r.data.lists;
                $scope.list_tomorow_customers = r.data.list_tomorow_customers;

            } else showMessErr("Đã có lỗi xẩy ra!");

        });
    }
});
app.filter('custom', function() {
    return function(input, search) {
        if (!input) return input;
        if (!search) return input;
        //var expected = ('' + search).toLowerCase();
        var expected = ToSlug(search);
        var result = {};
        angular.forEach(input, function(value, key) {
            //	var actual = ('' + value.user_name).toLowerCase();
            var actual = ToSlug(value.user_name);
            if (actual.indexOf(expected) !== -1) {
                result[key] = value;
            }
        });
        return result;
    }
});

function viewRs(html) {
    $('.dropdown-menu.resust-search').html(`<table class="table table-bordered tablelte-full">
                                            <tbody>
                                            <tr class="info par-info">
                                                <th>Khách hàng</th>
                                                <th>SĐT</th>
                                                <th>Ngày tạo</th>
                                                <th>Chi nhánh</th>
                                            </tr>
                                            ${html}
                                            </tbody>
                                        </table>`);
}

$(document).on('mouseup', function(e) {
    var container = $(".dropdown-menu .resust-search");
    if (!container.is(e.target) && container.has(e.target).length === 0) {
        $('input[name=phone]').parent().removeClass('open');
    }
})

$('#switch-invoice-new').on('change', function() {
    var self = $(this);
    self.attr('disabled', 'disabled');
    $.ajax({
        type: "post",
        url: base_url + 'invoices/ajax_choose_invoice_new',
        data: {
            'choose_invoice_new': self.prop('checked') ? 1 : 0,
        },
        dataType: "json",
        success: function(response) {
            if (response.status) {
                showMessSuccess('Thay đổi chọn phiếu thu mới thành công!')
            } else showMessErr("Đã có lỗi xẩy ra!");
        },
        complete: function() {
            self.attr('disabled', false);
        },
        error: function() {
            self.prop('checked', !self.prop('checked'));
        }
    });
});

// $('#table_').on('draw.dt', function () {
//     $(this).parent().addClass('table-responsive');
// });

function show_complain($customer_id) {
    $('#modal_in').modal('show');
    $('#modal_in .modal-content').addClass('loading');

    $.ajax({
        url: "ajax/popup_detail_complain",
        type: "post",
        dataType: "text",
        data: {
            customer_id: $customer_id
        },
        success: function(result) {
            $('#cp_body').html(result);
            $('#modal_in .modal-content').removeClass('loading');
        }
    });
}
$(document).on('mouseup', function(e) {
    var container = $(".dropdown-menu .resust-search");
    // Nếu click bên ngoài đối tượng container thì ẩn nó đi
    if (!container.is(e.target) && container.has(e.target).length === 0) {
        $('input[name=phone]').parent().removeClass('open');
    }
})

function ToSlug(title) {
    if (title == '') return '';
    //Đổi chữ hoa thành chữ thường
    slug = title.toLowerCase();

    //Đổi ký tự có dấu thành không dấu
    slug = slug.replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a');
    slug = slug.replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e');
    slug = slug.replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i');
    slug = slug.replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o');
    slug = slug.replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u');
    slug = slug.replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, 'y');
    slug = slug.replace(/đ/gi, 'd');
    //Xóa các ký tự đặt biệt
    slug = slug.replace(/\`|\~|\!|\@|\#|\||\$|\%|\^|\&|\*||∣|\+|\=|\,|\.|\/|\?|\>|\<|\'|\"|\:|\;|_/gi, '');
    //Đổi khoảng trắng thành ký tự gạch ngang
    //slug = slug.replace(/ /gi, " - ");
    //Đổi nhiều ký tự gạch ngang liên tiếp thành 1 ký tự gạch ngang
    //Phòng trường hợp người nhập vào quá nhiều ký tự trắng
    slug = slug.replace(/\-\-\-\-\-/gi, '-');
    slug = slug.replace(/\-\-\-\-/gi, '-');
    slug = slug.replace(/\-\-\-/gi, '-');
    slug = slug.replace(/\-\-/gi, '-');
    //Xóa các ký tự gạch ngang ở đầu và cuối
    slug = '@' + slug + '@';
    slug = slug.replace(/\@\-|\-\@|\@/gi, '');
    return slug
}