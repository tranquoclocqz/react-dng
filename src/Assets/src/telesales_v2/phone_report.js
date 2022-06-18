app.controller('rpCusPhoneCtr', function ($scope, $http, $compile, $window) {

    $scope.init = () => {
        $('body').addClass('sidebar-collapse');
        $('.op-report').removeClass('op-report');
        $scope.pagingInfo = {
            itemsPerPage: 30,
            offset: 0,
            to: 0,
            currentPage: 1,
            totalPage: 1,
            total: 0
        };
        $scope.image_default = base_url + 'assets/images/acount-df.png';
        $scope.filter_rp = {};
        $scope.filter = {
            date: moment().format("DD/MM/YYYY") + ' - ' + moment().format("DD/MM/YYYY"),
            limit: $scope.pagingInfo.itemsPerPage,
            offset: $scope.pagingInfo.offset,
        }
        $scope.get_report = false;
        $scope.id_report = '';
        $scope.obj = {
            data: {
                total: 0
            },
            phone_call: {
                calls: {
                    total: 0,
                    total_success: 0,
                    success_percent: 0,
                    pickup_percent: 0,
                    total_failed: 0,
                    failed_percent: 0
                },
                call: {
                    total: 0,
                    total_percent: 0,
                    total_success: 0,
                    success_percent: 0,
                    total_failed: 0,
                    pickup_percent: 0,
                    failed_percent: 0,
                    not_call: 0,
                    not_call_percent: 0
                }
            },
            appointment: {
                turn: {
                    total: 0,
                    total_invoice: 0,
                    total_invoice_percent: 0,
                    total_cancel: 0,
                    total_cancel_percent: 0,
                    total_fall: 0,
                    total_fall_percent: 0
                },
                customer: {
                    total: 0,
                    total_invoice: 0,
                    total_invoice_percent: 0,
                    total_cancel: 0,
                    total_cancel_percent: 0,
                    total_fall: 0,
                    total_fall_percent: 0
                }
            },
            invoice: {
                turn: {
                    total: 0,
                    total_zero: 0,
                    total_cus_zero: 0
                },
                customer: {
                    total: 0,
                    total_zero: 0,
                    total_invoice_cus_zero: 0,
                    total_one: 0,
                    total_one_sale: 0,
                    total_two: 0,
                    total_two_sale: 0,
                    total_bigger_two: 0,
                    total_bigger_two_sale: 0
                }
            },
            sales: {
                total: null,
                total_cus: 0,
                total_cus_first: 0,
                first: {
                    total: 0
                },
                average_cus_first: {
                    total: 0
                },
                average_appointment: {
                    total: 0
                },
                average_cus: {
                    total: 0
                }
            }
        };
        $scope.rows = {};
        $scope.total = 0;
        //$scope.rows = angular.copy($scope.resetReport());
        $scope.getListHistoryReport();
    }

    $scope.resetReport = () => {
        return $scope.obj = {
            data: {
                total: 0
            },
            phone_call: {
                calls: {
                    total: 0,
                    total_success: 0,
                    success_percent: 0,
                    pickup_percent: 0,
                    total_failed: 0,
                    failed_percent: 0
                },
                call: {
                    total: 0,
                    total_percent: 0,
                    total_success: 0,
                    success_percent: 0,
                    total_failed: 0,
                    pickup_percent: 0,
                    failed_percent: 0,
                    not_call: 0,
                    not_call_percent: 0
                }
            },
            appointment: {
                turn: {
                    total: 0,
                    total_invoice: 0,
                    total_invoice_percent: 0,
                    total_cancel: 0,
                    total_cancel_percent: 0,
                    total_fall: 0,
                    total_fall_percent: 0
                },
                customer: {
                    total: 0,
                    total_invoice: 0,
                    total_invoice_percent: 0,
                    total_cancel: 0,
                    total_cancel_percent: 0,
                    total_fall: 0,
                    total_fall_percent: 0
                }
            },
            invoice: {
                turn: {
                    total: 0,
                    total_zero: 0,
                    total_cus_zero: 0
                },
                customer: {
                    total: 0,
                    total_zero: 0,
                    total_invoice_cus_zero: 0,
                    total_one: 0,
                    total_one_sale: 0,
                    total_two: 0,
                    total_two_sale: 0,
                    total_bigger_two: 0,
                    total_bigger_two_sale: 0
                }
            },
            sales: {
                total: null,
                total_cus: 0,
                total_cus_first: 0,
                first: {
                    total: 0
                },
                average_cus_first: {
                    total: 0
                },
                average_appointment: {
                    total: 0
                },
                average_cus: {
                    total: 0
                }
            }
        };
    }
    $scope.attachFile = (e) => {
        $('#input-file').click();
    }


    $scope.uploadFile = (e) => {
        var input = document.getElementById('input-file'),
            file = input.files[0],
            formData = new FormData();

        $('#upload-file').text(' Đang tải...');
        formData.append('file', file);
        $scope.load_upload = true;
        $scope.loading = true;
        $http({
            url: base_url + 'telesales_v2/ajax_import_excel_report',
            method: "POST",
            data: formData,
            headers: {
                'Content-Type': undefined
            }
        }).then(r => {
            $scope.load_upload = false;
            $scope.loading = false;
            input.value = '';
            $('#upload-file').text(' ' + file.name);
            if (r.data.status == 1) {
                $scope.listPhone = r.data.data;
                $scope.file_name = file.name;
                $scope.get_report = false;
                if ($scope.id_report) {
                    $scope.id_report = '';
                }
                showMessSuccess()
            } else {
                showMessErr(r.data.message);
            }
        })
    }

    // Xuất dữ liệu báo cáo từ file tải lên
    $scope.getData = async () => {
        if (!$scope.listPhone || $scope.listPhone.list.length == 0) {
            showMessErr('Danh sách số điện thoại trống')
            return;
        }
        $scope.rows = {};
        var data = {
            list_phone: angular.copy($scope.listPhone.list),
            start_date: getDateBw($scope.filter_rp.date),
            end_date: getDateBw($scope.filter_rp.date, 0)
        }
        var a = await $scope.getReport(data, 1);
        $scope.rows = angular.copy(a);
        $scope.$apply();
    }

    $scope.getLimit = (start_date, end_date, total_phone) => {
        var date1 = moment(start_date);
        var date2 = moment(end_date);
        var diff = date2.diff(date1, 'days') + 1;
        var limit = 0;
        if (diff > 45 && total_phone > 5000) {
            limit = 600;
        } else {
            limit = 1000;
        }
        return limit
    }
    // Xử lý số liệu report

    $scope.getReport = async (data, is_rp_new = null) => {
        $scope.resetReport();

        var data_phone = Object.values(data.list_phone),
            list_phone_split = [],
            is_break = true;
        var limit = $scope.getLimit(data.start_date, data.end_date, data_phone.length);
            limit = data_phone.length < limit ? data_phone.length : limit;
        var data_rq = {
            start_date: data.start_date,
            end_date: data.end_date
        }

        if (is_rp_new) {
            $scope.loading = true;
            $scope.loading_item = true;
            $scope.get_report = false;
        }

        while (data_phone.length && is_break) {
            list_phone_split = data_phone.splice(0, limit);
            data_rq.list_phone = list_phone_split;
            await $http.post(base_url + 'telesales_v2/ajax_get_report_cus_phone', data_rq).then(r => {
                if (is_rp_new) {
                    $scope.get_report = true;
                }
                if (r && r.data.status == 1) {
                    var obj = r.data.data;
                    $scope.obj.data.total += parseInt(obj.data.total);
                    if (is_rp_new) {
                        $scope.rows.total = angular.copy($scope.obj.data.total);
                    } else {
                        $scope.obj_rp.total = angular.copy($scope.obj.data.total);

                    }

                    $scope.obj.phone_call.calls.total += parseInt(obj.phone_call.calls.total);
                    $scope.obj.phone_call.calls.total_success += parseInt(obj.phone_call.calls.total_success);
                    $scope.obj.phone_call.calls.total_failed += parseInt(obj.phone_call.calls.total_failed);

                    // Tong khach da goi

                    $scope.obj.phone_call.call.total += parseInt(obj.phone_call.call.total);
                    $scope.obj.phone_call.call.total_success += parseInt(obj.phone_call.call.total_success);
                    $scope.obj.phone_call.call.total_failed += parseInt(obj.phone_call.call.total_failed);

                    // Luot dat lich
                    $scope.obj.appointment.turn.total += parseInt(obj.appointment.turn.total);
                    $scope.obj.appointment.turn.total_invoice += parseInt(obj.appointment.turn.total_invoice);
                    $scope.obj.appointment.turn.total_cancel += parseInt(obj.appointment.turn.total_cancel);
                    $scope.obj.appointment.turn.total_fall += parseInt(obj.appointment.turn.total_fall);

                    // Tong khach dat lich
                    $scope.obj.appointment.customer.total += parseInt(obj.appointment.customer.total);
                    $scope.obj.appointment.customer.total_invoice += parseInt(obj.appointment.customer.total_invoice);
                    $scope.obj.appointment.customer.total_cancel += parseInt(obj.appointment.customer.total_cancel);
                    $scope.obj.appointment.customer.total_fall += parseInt(obj.appointment.customer.total_fall);

                    // Hóa đơn
                    $scope.obj.invoice.customer.total += parseInt(obj.invoice.customer.total);
                    $scope.obj.invoice.customer.total_zero += parseInt(obj.invoice.customer.total_zero);
                    $scope.obj.invoice.customer.total_invoice_cus_zero += parseInt(obj.invoice.customer.total_invoice_cus_zero);

                    $scope.obj.invoice.customer.total_one += parseInt(obj.invoice.customer.total_one);
                    $scope.obj.invoice.customer.total_one_sale += parseInt(obj.invoice.customer.total_one_sale);

                    $scope.obj.invoice.customer.total_two += parseInt(obj.invoice.customer.total_two);
                    $scope.obj.invoice.customer.total_two_sale += parseInt(obj.invoice.customer.total_two_sale);

                    $scope.obj.invoice.customer.total_bigger_two += parseInt(obj.invoice.customer.total_bigger_two);
                    $scope.obj.invoice.customer.total_bigger_two_sale += parseInt(obj.invoice.customer.total_bigger_two_sale);

                    $scope.obj.invoice.turn.total += parseInt(obj.invoice.turn.total);
                    $scope.obj.invoice.turn.total_zero += parseInt(obj.invoice.turn.total_zero);
                    $scope.obj.invoice.turn.total_cus_zero += parseInt(obj.invoice.turn.total_cus_zero);

                    // Doanh so
                    $scope.obj.sales.first.total += parseInt(obj.sales.first.total);
                    $scope.obj.sales.total_cus_first += parseInt(obj.sales.total_cus_first);

                    $scope.obj.sales.total += parseInt(obj.sales.total);
                    $scope.obj.sales.total_cus += parseInt(obj.sales.total_cus);
                } else {
                    showMessErr(r.data.message)
                    is_break = false;
                }

            }).catch(e => {
                if (is_rp_new) {
                    $scope.loading = false;
                }
                is_break = false;
                showMessErr();
            });
        }

        // Phần trăm tổng lượt gọi
        $scope.obj.phone_call.calls.success_percent = $scope.obj.phone_call.calls.total_success ? $scope.obj.phone_call.calls.total_success / $scope.obj.phone_call.calls.total * 100 : 0;
        $scope.obj.phone_call.calls.failed_percent = $scope.obj.phone_call.calls.total_failed ? $scope.obj.phone_call.calls.total_failed / $scope.obj.phone_call.calls.total * 100 : 0;

        // Phần trăm tổng khách gọi
        $scope.obj.phone_call.call.success_percent = $scope.obj.phone_call.call.total_success ? $scope.obj.phone_call.call.total_success / $scope.obj.phone_call.call.total * 100 : 0;
        $scope.obj.phone_call.call.failed_percent = $scope.obj.phone_call.call.total_failed ? $scope.obj.phone_call.call.total_failed / $scope.obj.phone_call.call.total * 100 : 0;

        $scope.obj.phone_call.call.not_call = $scope.obj.data.total - $scope.obj.phone_call.call.total;
        $scope.obj.phone_call.call.not_call_percent = $scope.obj.phone_call.call.not_call / $scope.obj.data.total * 100;
        $scope.obj.phone_call.call.total_percent = $scope.obj.phone_call.call.total / $scope.obj.data.total * 100;

        // Phần trăm tổng lượt khách đặt lịch
        $scope.obj.appointment.turn.total_invoice_percent = $scope.obj.appointment.turn.total ? $scope.obj.appointment.turn.total_invoice / $scope.obj.appointment.turn.total * 100 : 0;
        $scope.obj.appointment.turn.total_cancel_percent = $scope.obj.appointment.turn.total ? $scope.obj.appointment.turn.total_cancel / $scope.obj.appointment.turn.total * 100 : 0;
        $scope.obj.appointment.turn.total_fall_percent = $scope.obj.appointment.turn.total ? $scope.obj.appointment.turn.total_fall / $scope.obj.appointment.turn.total * 100 : 0;

        // Phần trăm tổng khách đặt lịch
        $scope.obj.appointment.customer.total_invoice_percent = $scope.obj.appointment.customer.total ? $scope.obj.appointment.customer.total_invoice / $scope.obj.appointment.customer.total * 100 : 0;
        $scope.obj.appointment.customer.total_cancel_percent = $scope.obj.appointment.customer.total ? $scope.obj.appointment.customer.total_cancel / $scope.obj.appointment.customer.total * 100 : 0;
        $scope.obj.appointment.customer.total_fall_percent = $scope.obj.appointment.customer.total ? $scope.obj.appointment.customer.total_fall / $scope.obj.appointment.customer.total * 100 : 0;


        // Trung bình doanh số hoá đơn đầu / khách
        $scope.obj.sales.average_cus_first.total = $scope.obj.sales.total_cus_first ? $scope.obj.sales.first.total / $scope.obj.sales.total_cus_first : 0;

        // Trung bình doanh số / hoá đơn
        $scope.obj.sales.average_appointment.total = $scope.obj.invoice.turn.total ? $scope.obj.sales.total / $scope.obj.invoice.turn.total : 0;

        //Trung bình doanh số / khách
        $scope.obj.sales.average_cus.total = $scope.obj.sales.total_cus ? $scope.obj.sales.total / $scope.obj.sales.total_cus : 0;


        //$scope.loading_item = false;
        if (is_rp_new) {
            $scope.loading = false;
            $scope.loading_item = false;
        }
        $scope.$apply();
        return $scope.obj;

    }

    $scope.saveReport = () => {
        if ($scope.id_report) {
            showMessErr('Báo cáo này đã được lưu');
            return;
        }
        var data_rq = {
            file_name: $scope.file_name,
            start_date: getDateBw($scope.filter_rp.date),
            end_date: getDateBw($scope.filter_rp.date, 0),
            list_phone: angular.copy($scope.listPhone),
        }
        $scope.loading = true;
        $http.post(base_url + 'telesales_v2/ajax_save_report_telesales_phone', data_rq).then(r => {
            $scope.loading = false;
            if (r && r.data.status == 1) {
                $scope.id_report = r.data.data;
                //document.getElementById("#openReport").scrollIntoView({ behavior: 'smooth' });
                $scope.getListHistoryReport();
                showMessSuccess();
            } else {
                showMessErr();
            }
        });
    }

    // Mở popup report cũ
    $scope.getOldReport = async (item) => {
        showPopup('#openReport');
        await $scope.getDataOldReport(item);
    }

    // Xuất số liệu report cũ hoặc xuất dữ liệu report cũ theo ngày tháng mới
    $scope.getDataOldReport = async (item = null) => {
        if (item == null) {
            var data = {
                list_phone: $scope.old_report.data_report.list_phone,
                start_date: getDateBw($scope.filter_popup_rp.date),
                end_date: getDateBw($scope.filter_popup_rp.date, 0)
            }
            $scope.list_old_phone = $scope.old_report.data_report.list_phone.length;
        } else {
            $scope.old_report = angular.copy(item);
            var data_rp = $scope.old_report.data_report;
            if (!data_rp.list_phone || data_rp.list_phone.length == 0) {
                showMessErr('Danh sách số điện thoại trống')
                return;
            }
            $scope.filter_popup_rp.date = $scope.formatDateToTime(data_rp.filter_date.start_date) + ' - ' + $scope.formatDateToTime(data_rp.filter_date.end_date);
            var data = {
                list_phone: data_rp.list_phone,
                start_date: data_rp.filter_date.start_date,
                end_date: data_rp.filter_date.end_date
            }
            $scope.list_old_phone = data_rp.list_phone.length;
        }
        $scope.obj_rp = {};
        $scope.load_item_rp = true;
        var result = await $scope.getReport(data);
        $scope.obj_rp = angular.copy(result);
        $scope.load_item_rp = false;
        $scope.$apply();
    }

    $scope.getListHistoryReport = () => {
        var data_rq = {
            start_date: getDateBw($scope.filter.date),
            end_date: getDateBw($scope.filter.date, 0),
            key_search: $scope.filter.key_search,
            limit: $scope.filter.limit,
            offset: $scope.filter.offset
        }
        $scope.loading_table = true;
        $http.post(base_url + 'telesales_v2/ajax_get_list_history_report_cus_phone', data_rq).then(r => {
            $scope.loading_table = false;
            if (r && r.data.status == 1) {
                $scope.list_report = r.data.data.list;

                $.each($scope.list_report, function (key, value) {
                    value.data_report = JSON.parse(value.data_report);
                })

                $scope.pagingInfo.total = r.data.data.count;
                $scope.pagingInfo.totalPage = Math.ceil(r.data.data.count / $scope.pagingInfo.itemsPerPage);
            } else {
                showMessErr(r.data.message);
            }
        })
    }

    $scope.deleteReport = (item) => {
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
                $http.get(base_url + 'telesales_v2/ajax_delete_report_cus_phone?id=' + item.id).then(r => {
                    if (r.data.status) {
                        swal("Thông báo", "Xóa thành công!", "success");
                        if ($scope.id_report = r.data.data) {
                            $scope.id_report = '';
                        }
                        $scope.getListHistoryReport();
                    } else {
                        swal("Thông báo", "Lỗi hệ thống. Không thể xóa báo cáo!", "error");
                    }
                })
            });
    }

    $scope.openListPhoneIncorrect = () => {
        showPopup('#popup-incorrect-phone');
    }
    $scope.getMoney = (val) => {
        let mn = val ? Number(val) : 0;
        if (mn >= 1000000000) {
            return (mn / 1000000000).toFixed(2) + ' Tỷ';
        } else if (mn >= 1000000) {
            return (mn / 1000000).toFixed(2) + ' Tr';
        } else {
            return mn == 0 ? 0 : (mn / 1000).toFixed(0) + ' K';
        }
    }

    $scope.formatDateToTime = (date, type = 'DD/MM/YYYY') => {
        return moment(date, 'YYYY-MM-DD HH:mm').format(type)
    }

    $scope.go2Page = (page) => {
        if (page < 0) return;
        $scope.pagingInfo.currentPage = page;
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = ($scope.pagingInfo.currentPage - 1) * $scope.pagingInfo.itemsPerPage;
        $scope.getListHistoryReport();
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
})