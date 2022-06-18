var $owl_invoice;
app.directive('clickAnywhereButHere', ['$document', function ($document) {
    return {
        link: function postLink(scope, element, attrs) {
            var onClick = function (event) {
                var isChild = $(element).has(event.target).length > 0;
                var isSelf = element[0] == event.target;
                var isInside = isChild || isSelf;
                if (!isInside) {
                    scope.$apply(attrs.clickAnywhereButHere)
                }
            }
            scope.$watch(attrs.isActive, function (newValue, oldValue) {
                if (newValue !== oldValue && newValue == true) {
                    $document.bind('click', onClick);
                } else if (newValue !== oldValue && newValue == false) {
                    $document.unbind('click', onClick);
                }
            });
        }
    };
}]);

app.directive('ngFile', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {

            element.bind('change', function () {

                $parse(attrs.ngFile).assign(scope, element[0].files)

                scope.$apply();

            });
        }
    };
}]);

app.directive('copyToClipboard', function () {
    return {
        restrict: 'A',
        link: function (scope, elem, attrs) {
            elem.click(function () {
                if (attrs.copyToClipboard) {
                    var $temp_input = $("<input>");
                    $("body").append($temp_input);
                    $temp_input.val(attrs.copyToClipboard).select();
                    document.execCommand("copy");
                    toastr["success"]("Copy: " + attrs.copyToClipboard);
                    $temp_input.remove();
                }
            });
        }
    };
});

app.controller('date_off', function ($scope, $http, $compile, $window, $timeout, $sce) {


    var pi = $scope.pagingInfo = {
        itemsPerPage: 1,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };




    $scope.init = () => {
        $('.opacity').css('opacity', '1');

        $scope.p = {};
        $scope.p = angular.copy(pi);
        $scope.p.itemsPerPage = 25;
        $scope.p.id = 0;


        $scope.filter = {};
        $scope.complain = {};
        $scope.remind = {};
        $scope.list_image_invoice = {};
        $scope.star = {};

        $scope.filter.limit = $scope.p.itemsPerPage;
        $scope.filter.offset = $scope.p.offset;

        $scope.ar_cpl = [];

        let param_type = getParamsValue('type');
        $scope.filter.type = "1";
        if (param_type && !isNaN(param_type) && param_type != "") {
            $scope.filter.type = param_type;
        }

        let param_date = getParamsValue('date');
        $scope.filter.date = moment().subtract(1, 'days').format("DD/MM/YYYY") + ' - ' + moment().subtract(1, 'days').format("DD/MM/YYYY");
        if (param_date && param_date != "") {
            $scope.filter.date = JSON.parse(param_date);
        }

        let param_debit = getParamsValue('debit');
        if (param_debit && !isNaN(param_debit) && param_debit != "") {
            $scope.filter.debit = param_debit;
        }

        let param_store_id = getParamsValue('store_id');
        if (param_store_id && param_store_id != "") {
            $scope.filter.store_id = JSON.parse(param_store_id);
        }

        let param_tag_id = getParamsValue('tag_id');
        if (param_tag_id) {
            $scope.filter.tag_id = JSON.parse(param_tag_id);
        }

        let param_option = getParamsValue('option');
        if (param_option) {
            $scope.filter.option = param_option;
        } else {
            $scope.filter.option = 0;
        }


        $scope.numberHis = 1;


        $scope.setDateSearch();
        $scope.dateInputInit();
        $scope.allPhone($scope.filter.tag_id);
        $scope.dateTime();
        $scope.care = [];

        setTimeout(() => {
            $scope.getStore();
            $scope.changeCare();
            $scope.checkRemind();
            $scope.getGroupComplain();
            $scope.getLevelComplain();
        }, 150);
    }


    $scope.getLevelComplain = () => {
        $http.get(base_url + '/options/ajax_get_level_complain').then(r => {
            if (r.data) {
                $scope.complains = r.data;
            }
        })
    }

    $scope.getGroupComplain = () => {
        $http.get(base_url + 'telesales_v2/ajax_get_cpl').then(r => {

            if (r && r.data.status == 1) {
                $scope.data_complain = r.data.data;
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    $scope.changeBirth = (value) => {
        var data = {
            customer_id: value.customer_id,
            birthday: value.birthday,
            appointment_id: value.appointment_id,
            invoice_id: value.invoice_id,
            type: $scope.type
        }
        $http.post(base_url + 'telesales_v2/ajax_save_birthday', JSON.stringify(data)).then(
            r => {
                if (r && r.data.status == 1) {
                    toastr["success"]("Đổi thành công!");
                    value.is_check_birthday = 1;
                    $scope.detail_care(1, value);
                } else if (r && r.data.status == 0) {
                    toastr["error"](r.data.message);
                } else toastr["error"]("Đã có lỗi xẩy ra!");
            });
    }

    $scope.dateTime = () => {
        setTimeout(() => {
            $(".date_").datepicker({
                dateFormat: "dd-mm-yy"
            });
        }, 1);
    }

    $scope.removeAllCancel = () => {
        $http.post(base_url + 'telesales_v2/ajax_remove_all_cancel').then(
            r => {
                if (r && r.data.status == 1) {
                    $scope.go2Page(1, $scope.p);
                } else if (r && r.data.status == 0) {
                    toastr["error"](r.data.message);
                } else toastr["error"]("Đã có lỗi xẩy ra!");
            });
    }

    $scope.getHisAppoiment = (phone) => {
        $scope.cr_phone_sl = phone;
        getHisAppoiment(phone);
    }

    function getHisAppoiment(phone) {
        $('#appointment_his').modal('show').find('.modal-body').addClass('loading').find('.wrap-table-appointment>tbody').html('');
        $.ajax({
            url: base_url + 'appointments/get_aptm_history?phone=' + phone,
            type: "get",
            dataType: "json",
            success: function (response) {
                if (response.status == 1) {
                    let data = response.data,
                        html_his = '';
                    if (data.length) {
                        $.each(data, function (key, aptm) {
                            html_his += `<tr>
											<td class="text-center">${aptm.date} ${aptm.time}</td>
											<td>${aptm.name}</td>
											<td>
												${aptm.adv_note != '' ? `<span><strong>TVV:</strong> ${aptm.adv_note}</span>` : ''
                                }
												<div class="clearfix"></div>
												${aptm.cs_note != '' ? `<span><strong>CSKH:</strong> ${aptm.cs_note}</span>` : ''
                                }
													<div class="clearfix"></div>
												${aptm.note != '' ? `<span><strong>Lễ tân:</strong> ${aptm.note}</span>` : ''
                                }
											</td>
											<td>${aptm.order_name}</td>
											<td class="text-center">
												${aptm.status == true ? `<span class="label label-success">Đã tới</span>` : `<span class="label label-default">Chưa tới</span>`}
											</td>
											<td class="text-center">
												${aptm.store_name}
											</td>
										</tr>`;
                        });
                    }
                    $('#appointment_his .wrap-table-appointment>tbody').html(html_his);
                } else {
                    toastr['error']('Có lổi xẩy ra. Vui lòng thử lại sau');
                }
            },
            complete: function () {
                $('#appointment_his .modal-body').removeClass('loading');
            },
            error: function () {
                toastr['error']('Lỗi hệ thống. Vui lòng thử lại sau');
            }
        });
    }

    $scope.checkRemind = () => {
        var data = {
            date: moment().format('YYYY/MM/DD'),
            store_id: $scope.filter.store_id
        }

        $http.get(base_url + 'telesales_v2/get_remind?filter=' + JSON.stringify(data)).then(r => {
            if (r && r.data.status == 1) {
                $scope.total_remind = r.data.data;
            } else if (r && r.data.status == 0) {
                toastr["error"](r.data.message);
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    $scope.getCallHistory_ = (phone) => {
        $http.get(base_url + 'sale_care/ajax_get_care_result_by_phone/' + phone).then(r => {
            $scope.total_duration_time = r.data.total_duration_time;
            $scope.total_call_time = r.data.total_call_time;
            if (r && r.data.status == 1) {
                $('body').css('cursor', 'auto');
                $scope.call_result_details = r.data.data;
            }
        })
    }

    $scope.saveCareApp = () => {
        if (!$scope.remind.date || $scope.remind.date == "") {
            toastr["error"]("Nhập ngày!");
            return;
        }
        if (!$scope.remind.time || $scope.remind.time == "") {
            toastr["error"]("Nhập giờ!");
            return;
        }
        var data = {
            customer_id: $scope.cr_value.customer_id,
            appointment_id: $scope.cr_value.appointment_id,
            type: $scope.type,
            invoice_id: $scope.cr_value.invoice_id,
            id_care: 14,
            date: $scope.remind.date,
            time: $scope.remind.time,
            note: $scope.remind.note
        }
        $http.post(base_url + 'telesales_v2/ajax_save_phone_care', JSON.stringify(data)).then(
            r => {
                if (r && r.data.status == 1) {
                    $('#appoint_').modal('hide');
                    toastr["success"]("Xóa thành công!");
                    $scope.detail_care(1, $scope.cr_value);
                    $scope.remind = {};
                } else if (r && r.data.status == 0) {
                    toastr["error"](r.data.message);
                } else toastr["error"]("Đã có lỗi xẩy ra!");
            });
    }

    $scope.addRemind = (value, index) => {
        $scope.cr_index = index;
        $scope.cr_value = value;

        $('#appoint_').modal('show');

    }

    $scope.setDateSearch = () => {}

    $scope.show_complain = (value) => {
        var data = {
            customer_id: value
        }

        $http.get(base_url + 'telesales_v2/popup_detail_complain?filter=' + JSON.stringify(data)).then(r => {
            $('#cp_body').html(r.data);
            $('#modal_complain').modal('show');
        });
    }

    $scope.openDetailP = (value, event = null) => {
        $scope.cr_value = value;
        $scope.openCare = false;
    }

    $scope.close_cs = () => {
        $('tbody').find('tr.child').css('display', 'none');
    }

    $scope.openDetailH = (value) => {
        $scope.openHistory(value.customer_id);
    }

    $scope.converHtml = (htmlbd) => {
        return $sce.trustAsHtml(htmlbd);
    }

    $scope.openHistory = (id) => {
        $('#modal_history_cus').modal('show');
        $scope.loading_history_cus = true;

        $http.get(base_url + 'customers/history/' + id + '?is_get_view=1').then(r => {
            if (r.data && r.data.status == 1) {
                $scope.html_history_customer = r.data.data;

                setTimeout(() => {
                    $(document).find('#modal_history_cus .modal-body .modal-lg').removeClass('modal-lg');
                    if (!$(document).find('#modal_history_cus .modal-body table>tbody>tr.main_invoice .modal-content button.close').length) {
                        $(document).find('#modal_history_cus .modal-body table>tbody>tr.main_invoice .modal-content').append(`<button style="z-index: 9;color: #dc3545;padding: 5px 10px;border: 1px solid #dc3545;opacity: 1;" type="button" class="close btn btn-sm" onclick="$(this).closest('div.modal.fade').modal('hide');">×</button>`);
                    }
                    var a_image = $(document).find('#modal_history_cus td>a[data-toggle="modal"]');
                    (a_image && a_image.length) && $(a_image).each(function (index, element) {
                        $(this).removeAttr('data-toggle');
                        var invoice_id = $(this).attr('data-target').replace('.modal-', '');
                        $(this).attr('data-invoice_id', invoice_id);
                    });
                }, 500)
            } else {
                toastr.error(r.data.message, 'Lỗi!');
            }
            $scope.loading_history_cus = false;
        }, function (data, status, headers, config) {
            toastr["error"]('Vui lòng thử lại!', 'Lỗi!');
        });
    }

    $(document).on('click', '#modal_history_cus td>a[data-target]', function (e) {
        var self = $(this),
            target = self.attr('data-target');
        $('#storeModal').empty();
        $('#modal_history_cus').find(target).addClass('modalImg');
        $('#storeModal').append($('#modal_history_cus').find(target).clone());
        setTimeout(() => {
            $(target).css('z-index', '9999999');
            $('#storeModal ' + target).modal('show');


            document.addEventListener('click', function (event) {
                console.log($(event.target).parent("#storeModal").length == 0);
                if ($(event.target).parent("#storeModal").length == 0) {

                } else {
                    $('#modal_history_cus').modal('hide');
                }
            });
        }, 100);
        e.preventDefault();
    })

    $scope.deleteCare = (item, items) => {
        var data = angular.copy(item);
        $http.post(base_url + 'telesales_v2/ajax_delete_care', JSON.stringify(data)).then(
            r => {
                if (r && r.data.status == 1) {
                    toastr["success"]("Xóa thành công!");
                    $scope.detail_care(1, items);
                } else if (r && r.data.status == 0) {
                    toastr["error"](r.data.message);
                } else toastr["error"]("Đã có lỗi xẩy ra!");
            });
    }

    $scope.getPack = (customer_id) => {
        var data = {
            customer_id: customer_id
        };
        $('#detailP .tab-content').addClass('loading');
        $scope.is_pack = 1;
        $http.get(base_url + 'telesales_v2/ajax_get_pack?filter=' + JSON.stringify(data)).then(r => {
            $('#detailP .tab-content').removeClass('loading');

            if (r && r.data.status == 1) {
                $scope.data_pack = r.data.data;
                $scope.data_inv = r.data.inv;

            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }
    $scope.getInvoice = (customer_id) => {
        var data = {
            customer_id: customer_id
        };
        $scope.is_pack = 0;

        $('#detailP .tab-content').addClass('loading');

        $http.get(base_url + 'telesales_v2/ajax_get_inv?filter=' + JSON.stringify(data)).then(r => {
            $('#detailP .tab-content').removeClass('loading');

            if (r && r.data.status == 1) {
                $scope.data_inv = r.data.data;
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    $scope.openIMG = (value) => {
        $('#image-' + value).modal('show');
        $scope.no_open = 1;
        $('#image-' + value).on('hidden.bs.modal', function () {
            delete $scope.no_open;
        });

    }


    $scope.clickActive = (value = null, event = null) => {

        if ($scope.no_open && $scope.no_open == 1) {
            return;
        }

        if (value && value == -1) {
            return;
        }

        if (!event) {
            $('table').find('tbody').removeClass('active_');
            return;
        }
        $scope.to_view = 1;

        if ($(event.target).parents('tbody').hasClass('active_')) {
            $(event.target).parents('tbody').removeClass('active_');
        } else {
            $('table').find('tbody').removeClass('active_');
            $(event.target).parents('tbody').addClass('active_');

            setTimeout(() => {
                $(event.target).parents('tbody').find('li').removeClass('active');
                $(event.target).parents('tbody').find('.first_element').addClass('active');
            }, 100);
            $scope.getCallHistory_(value.phone);
            $(".date_").datepicker("destroy");
            $scope.dateTime();
        }

    }


    $('#complainmd').on('shown.bs.modal', function () {
        $scope.complain = {};

        setTimeout(() => {
            $('.select2').select2();
            $('.user_sl').select2('val', null);
            $('.store_sl').select2('val', null);
            $('.cpl_sl').select2('val', null);
            $scope.$apply();
        }, 350);
    });

    $scope.selectLevel = (value) => {
        Swal.fire({
            title: 'Bạn chọn khiếu nại cấp độ ' + value.level,
            html: value.description.replace(/(?:\r\n|\r|\n)/g, '<br>'),
            icon: 'question',
            showConfirmButton: true,
            showCancelButton: false,
            allowOutsideClick: true,
        }).then((result) => {
            if (result.value) {

            }
        })
    }

    $scope.addComplain = () => {
        if (!$scope.complain.type) {
            toastr["error"]("Chọn kiểu phàn nàn!");
            return;
        }
        if (!$scope.complain.store_id) {
            toastr["error"]("Chọn chi nhánh bị khiếu nại!");
            return;
        }
        if (!$scope.complain.date || $scope.complain.date == "") {
            toastr["error"]("Chọn ngày!");
            return;
        }
        if (!$scope.complain.level) {
            toastr["error"]("Chọn Cấp độ khiếu nại!");
            return;
        }
        if (!$scope.complain.note) {
            toastr["error"]("Nhập ghi chú!");
            return;
        }

        var data = {
            // customer_id: $scope.cr_value.customer_id,
            phone: $scope.cr_value.phone,
            store_id: $scope.complain.store_id,
            customer_complain_type_id: $scope.complain.type,
            note: $scope.complain.note,
            user_id: $scope.complain.user_id,
            complain_date: moment($scope.complain.date, 'DD-MM-YYYY').format('YYYY-MM-DD'),
            level: $scope.complain.level
        }
        $('#addCompaibtn').css('pointer-events', 'none');

        $http.post(base_url + '/customers/ajax_add_complain', data).then(r => {
            if (r && r.data.status == 1) {
                $('#addCompaibtn').css('pointer-events', 'auto');

                $scope.complain = {};
                toastr["success"]("Thành công!");
                $scope.select2();
                $('#complainmd').modal('hide');

            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });

    }

    $scope.date_ = () => {
        setTimeout(() => {
            $("#date_complain").datepicker({
                dateFormat: "dd-mm-yy"
            });
        }, 100);
    }

    $scope.openComplain = (value, index) => {
        $scope.cr_value = value;
        $scope.cr_index = index;
        // if (!$scope.complain.date || $scope.complain.date == "") {
        //     var date = $scope.filter.date.split(' - ');
        //     $scope.complain.date = date[0];
        // } else {
        //     $scope.complain.date = moment().format("DD/MM/YYYY");
        // }


        $scope.date_();
        $('#complainmd').modal('show');
    }

    $scope.changeType = () => {
        if ($scope.filter.type != 5) {
            delete $scope.filter.key;
        }
        insertParam('type', $scope.filter.type);
        if ($scope.filter.debit) {
            insertParam('debit', $scope.filter.debit);
        } else {
            insertParam('debit', null);
        }
        if ($scope.filter.store_id) {
            insertParam('store_id', JSON.stringify($scope.filter.store_id));
        } else {
            insertParam('store_id', null);
        }

        if ($scope.filter.date) {
            insertParam('date', JSON.stringify($scope.filter.date));
        } else {
            insertParam('date', null);
        }

        if ($scope.filter.tag_id) {
            insertParam('tag_id', JSON.stringify($scope.filter.tag_id));
        } else {
            insertParam('tag_id', null);
        }
        $scope.select2();
    }


    $scope.setStar = (value, index) => {

        $scope.cr_value = value;
        $scope.cr_index = index;
        $scope.ar_cpl = [];
        $('#modal_rating').modal('show');
    }

    $scope.cfStar = () => {

        if (!$scope.star.number) {
            toastr["error"]("Chọn sao!");
            return;
        }
        if ($scope.star.number < 5 && $scope.ar_cpl.length == 0) {
            toastr["error"]("Chọn lý do!");
            return;
        }
        if ($scope.star.number < 5 && $scope.ar_cpl.length > 0) {
            let check = false;
            $scope.data_complain.forEach(element => {
                if ($scope.ar_cpl.indexOf(parseInt(element.id)) >= 0 && element.content_request > 0) {
                    check = true;
                }
            });
            if (check && !$scope.star.note) {
                toastr["error"]("Vui lòng nhập ghi chú!");
                return;
            }
        }



        var data = {
            invoice_id: $scope.cr_value.invoice_id,
            star: $scope.star.number,
            note: $scope.star.note ? $scope.star.note : '',
            group: $scope.ar_cpl
        };

        $http.post(base_url + 'telesales_v2/ajax_rating', JSON.stringify(data)).then(r => {
            if (r && r.data.status == 1) {
                $scope.cr_value.star = $scope.star.number;
                $scope.star = {};
                $scope.ar_cpl = [];
                toastr["success"]("Thành công!");
                $('#modal_rating').modal('hide');

            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });

    }

    $scope.setUnDate = (name) => {
        $scope.filter[name] = undefined;
        if (name = 'tag_id')
            $scope.filter[name] = 0;
        $scope.select2();
        $scope.changeType();

    }

    $scope.select2 = () => {
        setTimeout(() => {
            $('.select2').select2();
            $scope.$apply();
        }, 200);
    }

    $scope.getStore = () => {
        $http.get(base_url + 'sale_care/ajax_get_stores').then(r => {
            if (r && r.data.status == 1) {
                $scope.stores = r.data.data;

                let param_store_id = getParamsValue('store_id');
                if (param_store_id && param_store_id != "") {
                    $scope.filter.store_id = JSON.parse(param_store_id);
                    $scope.select2();
                }
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    $scope.sendSms = (value) => {
        if (company_id != 1) {
            showMessErr('Không hổ trợ gửi SMS với chi nhánh này.');
            return;
        }

        var cf = confirm('Bạn có muốn gửi SMS đên sô điện thoại ' + value.phone);

        if (!cf)
            return false;


        var data = angular.copy(value);
        data.type = $scope.filter.type;
        $http.post(base_url + 'telesales_v2/ajax_send_sms_remind', JSON.stringify(data)).then(r => {
            if (r && r.data.status == 1) {
                value.sms = true;
                $scope.detail_care(1, value);
                toastr["success"]("Thành công!");
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });

    }

    $scope.saveTagChange = () => {
        $http.post(base_url + 'telesales_v2/save_tag_change', JSON.stringify($scope.list_key)).then(r => {
            // console.log(r);

            if (r && r.data.status == 1) {
                $scope.changeCare();
                $('#openTags').modal('hide');
                toastr["success"]("Thành công!");
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    $scope.searchPhone = () => {
        $scope.filter.type = "5";

        $scope.go2Page(1, $scope.p);
    }


    $scope.insertData = (value) => {
        $scope.detail_care(1, $scope.cr_value);
    }


    $scope.setDataModal = (value, index = -1) => {

        $scope.cr_value = value;
        $scope.cr_index = index;

        setTimeout(() => {
            var myInput = $("#cskh");
            myInput.val(1);
            myInput.trigger('input');

            var myInput = $("#nameForm");
            myInput.val(value.name);
            myInput.trigger('input');

            var myInput = $("#phoneForm");
            myInput.val(value.phone);
            myInput.trigger('input');

            var myInput = $("#type_care");
            myInput.val($scope.type);
            myInput.trigger('input');


            if (value.customer_id) {
                var myInput = $("#customerIdForm");
                myInput.val(value.customer_id);
                myInput.trigger('input');
            }

            if (value.invoice_id) {
                var myInput = $("#invoiceIdForm");
                myInput.val(value.invoice_id);
                myInput.trigger('input');
            }

            if (value.appointment_id) {
                var myInput = $("#appointmentIdForm");
                myInput.val(value.appointment_id);
                myInput.trigger('input');
            }


            if (value.store_id > 0) {
                $('.storeForm .select2').select2('val', value.store_id);
            }


            $('#appointment_app .created_user_').html('');
            $scope.$apply();

            $('#cl_').trigger('click');
        }, 0);


        $('#appoint').modal('show');
    }

    $scope.addTag = () => {
        $('#addTag').css('pointer-events', 'none');
        $http.post(base_url + 'telesales_v2/ajax_add_tag', JSON.stringify($scope.tag)).then(
            r => {
                $('#addTag').css('pointer-events', 'initial');
                if (r && r.data.status == 1) {
                    $scope.tag = {};
                    $scope.changeCare();
                    $scope.getData();
                } else if (r && r.data.status == 0) {
                    toastr["error"](r.data.message);
                } else toastr["error"]("Đã có lỗi xẩy ra!");
            });
    }

    $scope.loadCancel = () => {
        $('.cancel_tr').css('pointer-events', 'none');
        $('.cancel_tr').css('cursor', 'wait');

        var data = {
            date: $scope.filter.date
        }
        $http.post(base_url + 'telesales_v2/ajax_add_cancel', JSON.stringify(data)).then(
            r => {
                $('.cancel_tr').css('pointer-events', 'initial');
                $('.cancel_tr').css('cursor', 'initial');
                if (r && r.data.status == 1) {
                    $scope.go2Page(1, $scope.p);
                } else if (r && r.data.status == 0) {
                    toastr["error"](r.data.message);
                } else toastr["error"]("Đã có lỗi xẩy ra!");
            });
    }

    $scope.savePhoneCare = (value) => {


        if (!$scope.care[value.id] || $scope.care[value.id] && !$scope.care[value.id].id_care) {
            toastr["error"]("Không để trống tên tag!");
            return false;
        }


        var data = angular.copy($scope.care[value.id]);
        data.customer_id = value.customer_id;
        data.appointment_id = value.appointment_id;
        data.type = $scope.type;
        data.invoice_id = value.invoice_id;
        $('.btn-xn').css('pointer-events', 'none');
        $('body').css('cursor', 'wait');


        $http.post(base_url + 'telesales_v2/ajax_save_phone_care', JSON.stringify(data)).then(
            r => {
                $('body').css('cursor', 'auto');

                if (r && r.data.status == 1) {
                    //$scope.getData();

                    $scope.detail_care(1, value);
                    // if (!value.obs) {
                    //     value.obs = [];
                    // }
                    // if (!value.total_care) {
                    //     value.total_care = 0;
                    // }
                    // value.total_care++;
                    // value.obs.unshift(r.data.detail);
                    $scope.care[value.id] = {};
                    toastr["success"]('Thành công!');

                } else if (r && r.data.status == 0) {
                    toastr["error"](r.data.message);
                } else toastr["error"]("Đã có lỗi xẩy ra!");
            });
    }

    $scope.detail_care = (cr_index, cr_value) => {
        var data = {
            customer_id: cr_value.customer_id
        }

        $http.get(base_url + 'telesales_v2/detail_care?filter=' + JSON.stringify(data)).then(r => {
            4
            $('.btn-xn').css('pointer-events', 'initial');
            if (r && r.data.status == 1) {
                cr_value.obs = r.data.data.obs;
                cr_value.total_care = r.data.data.total_care;
                cr_value.is_care = true;
                cr_value.obs.forEach(element => {
                    if ($scope.type == element.type && ((cr_value.appointment_id > 0 && cr_value.appointment_id == element.appointment_id) || (cr_value.invoice_id > 0 && cr_value.invoice_id == element.invoice_id))) {
                        if (element.is_sms == 1)
                            cr_value.sms = true
                        if (element.re_appointment_id > 0)
                            cr_value.re_appointment_id = element.re_appointment_id
                    }
                });

            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    $scope.forceMaxLength = function (s, maxLength) {
        if (s.length > maxLength) {
            return Array.prototype.slice.apply(s, [0, maxLength - 3]).join('') + '...';
        } else {
            return s;
        }
    }


    $scope.changeCare = () => {
        $http.get(base_url + 'telesales_v2/ajax_get_care_tag?filter=' + JSON.stringify({})).then(r => {
            if (r && r.data.status == 1) {
                $scope.list_key = r.data.data;
                $scope.tag_location = [];
                $scope.tag_options = [];
                $scope.tag_options2 = [];
                $scope.list_key.forEach(element => {
                    element.location = parseInt(element.location);
                    element.exist_day = parseInt(element.exist_day);

                    if (element.location > 0) {
                        $scope.tag_location.push(element);
                    }
                    if (["1", "2"].indexOf(element.id) < 0) {
                        $scope.tag_options.push(element);
                    }

                    $scope.tag_options2.push(element);

                });

                angular.element(document).ready(function () {
                    setTimeout(() => {
                        $scope.dTable = $('.dta_table');
                        $scope.dTable.DataTable({
                            "retrieve": true
                        });
                        $scope.$apply();
                    }, 0);
                });

                setTimeout(() => {
                    let param_tag_id = getParamsValue('tag_id');
                    if (param_tag_id) {
                        $scope.filter.tag_id = JSON.parse(param_tag_id);
                    }
                    $scope.select2();
                }, 100);


            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    // $scope.getStore = () => {
    //     $http.get(base_url + 'sale_care/ajax_get_stores').then(r => {
    //         if (r && r.data.status == 1) {
    //             $scope.stores = r.data.data;
    //         } else toastr["error"]("Đã có lỗi xẩy ra!");
    //     });
    // }

    $scope.renderStore = (id) => {
        var string = "";
        if ($scope.stores)
            $scope.stores.forEach(element => {
                if (id == element.id) {
                    string = element.description;
                }
            });
        return string;
    }
    $scope.searchData = () => {
        delete $scope.filter.endPage;
        $scope.go2Page(1, $scope.p);
    }

    $scope.allPhone = (id) => {
        delete $scope.filter.endPage;
        $('tbody').find('tr.child').css('display', 'none');

        if (id || id === 0)
            if (id <= 0 || id == 14) {
                $scope.filter.option = id;
                insertParam('option', id);
                insertParam('tag_id', null);

                delete $scope.filter.tag_id;

            } else {
                if (!Array.isArray(id)) {
                    id = JSON.parse('["' + id + '"]');
                }
                $scope.filter.tag_id = id;
                insertParam('option', null);
                insertParam('tag_id', JSON.stringify(id));

                delete $scope.filter.option;
            }

        if (id == 14) {
            $scope.filter.date = moment().format("DD/MM/YYYY") + ' - ' + moment().format("DD/MM/YYYY");
            $scope.dateInputInit();
        }
        $scope.go2Page(1, $scope.p);

        $scope.select2();

    }

    $scope.getData = () => {

        $scope.clickActive();

        $scope.to_view = 1;


        if ($scope.filter.type == 5 && !$scope.filter.key) {
            toastr["error"]("Nhập SĐT cần tim kiếm!");
            return;
        }

        if (($scope.filter.type == 1 || $scope.filter.type == 2 || $scope.filter.type == 3) && (!$scope.filter.tag_id || $scope.filter.tag_id && $scope.filter.tag_id.length == 0))
            if ($scope.filter.date && $scope.filter.date != "") {
                var date = $scope.filter.date.split(' - '),
                    start = moment(date[0], 'DD/MM/YYYY'),
                    end = moment(date[1], 'DD/MM/YYYY');

                if ($scope.filter.type == 1 || $scope.filter.type == 2)
                    if (end.diff(start, 'days') > 0) {
                        toastr["error"]("Bạn chỉ có thể lọc tối đa một ngày cho loại khách hàng này!");
                        return;
                    }
            } else {
                toastr["error"]("Vui lòng chọn ngày!");
                return;
            }




        $('body').css('pointer-events', 'none');
        $('.content-wrapper').css('cursor', 'wait');

        $('.table-responsive').css('opacity', '0.5').addClass('loading');

        $http.get(base_url + 'telesales_v2/ajax_get_data?filter=' + JSON.stringify($scope.filter))
            .then(r => {
                $('body').css('pointer-events', 'auto');
                $('.content-wrapper').css('cursor', 'auto');

                if (r && r.data.status == 1) {
                    $scope.ajax_data = r.data.data;

                    if ($scope.type != 5) {
                        $scope.old_type = $scope.type;
                    }

                    $scope.type = $scope.filter.type;
                    $scope.is_load = r.data.is_load;
                    $('.table-responsive').css('opacity', '1').removeClass('loading');

                    if (r.data.ar_import) {
                        $scope.getEmp(r.data.ar_import);
                    }

                    if (r.data.images) {
                        $scope.get_imgs(r.data.images);
                    }





                    $scope.p.total = parseInt(r.data.count);
                    $scope.p.totalPage = Math.ceil(r.data.count / $scope.p.itemsPerPage);

                    if ($scope.filter.endPage == 1) {
                        $scope.p.currentPage = $scope.p.totalPage;
                        $scope.p.offset = ($scope.p.currentPage - 1) * $scope.p.itemsPerPage;
                    }

                    if ($scope.filter.key) {
                        $('.container-tab >.form').addClass('disabled_');
                        $('.SEARCH >.input-group').css('box-shadow', '#bddbe4 0px 0px 8px 4px');
                    }

                } else toastr["error"]("Đã có lỗi xẩy ra!");
            });
    }

    $scope.changePhoneNumber = () => {
        if (!$scope.filter.key) {
            $('.container-tab >.form').removeClass('disabled_');
            $('.SEARCH >.input-group').css('box-shadow', 'none');
            if ($scope.old_type) {
                $scope.filter.type = $scope.old_type;
            } else {
                $scope.filter.type = '1';
            }
        }
    }

    $scope.get_imgs = (emp, view = null) => {
        var data = {
            invoices: emp
        }
        $http.get(base_url + 'telesales_v2/get_imgs?filter=' + JSON.stringify(data))
            .then(r => {
                if (r && r.data.status == 1) {
                    if (!view) {
                        $scope.ajax_data.forEach(element => {
                            r.data.data.forEach(element_ => {
                                if (element.invoice_id == element_.invoice_id)
                                    element.images = element_.images;
                            });
                        });

                    } else {

                        $("#his_child tbody tr").each(function (index) {
                            r.data.data.forEach(element => {
                                if ($(this).data('invoice') == element.invoice_id) {
                                    $(this).attr("data-imgs", JSON.stringify(element.images))
                                    $html = $('<i class="fa fa-file-image-o text-primary openImgC"  aria-hidden="true"></i>');
                                    $(this).find('td:first-child').append($html);
                                    $compile($html)($scope);
                                }
                            });
                        });
                    }
                } else toastr["error"]("Đã có lỗi xẩy ra!");
            });
    }

    $scope.getGpl = (emp) => {
        var data = {
            invoices: emp
        }
        $http.get(base_url + 'telesales_v2/get_gpl?filter=' + JSON.stringify(data))
            .then(r => {
                if (r && r.data.status == 1) {
                    $("#his_child tbody tr").each(function (index) {
                        r.data.data.forEach(element => {
                            if ($(this).data('invoice') == element.invoice_id) {



                                $html = element.star + '<i class="fa fa-star-o" aria-hidden="true"></i> :' + element.content;
                                if (element.ct) {
                                    $html += '(' + element.ct + ')';
                                }

                                $(this).find('td:last-child .star_rpl').append($html);
                            }
                        });
                    });
                } else toastr["error"]("Đã có lỗi xẩy ra!");
            });
    }


    $("body").on('click', '.openImgC', function () {

        $scope.images_child = ($(this).parents('tr').data('imgs'));

        $scope.$apply();

        $('.img_child').modal('show');
    });




    $scope.getEmp = (emp) => {
        var data = {
            users: emp
        }
        $http.get(base_url + 'telesales_v2/get_emps?filter=' + JSON.stringify(data))
            .then(r => {
                if (r && r.data.status == 1) {

                    $scope.ajax_data.forEach(element => {
                        r.data.data.forEach(element_ => {
                            if (element.import_id == element_.id)
                                element.import_name = element_.name;
                        });
                    });

                } else toastr["error"]("Đã có lỗi xẩy ra!");
            });
    }


    $scope.get_call_results = (arr) => {
        $http.post(base_url + 'sale_care/ajax_get_call_results', JSON.stringify(arr)).then(r => {
            if (r && r.data.status == 1) {
                $scope.ajax_data.forEach((element, index) => {
                    r.data.data.forEach(el => {
                        if (element.phone == el.phone) {
                            $scope.ajax_data[index].total_call = el.total;
                            $scope.ajax_data[index].total_false = el.total_false;
                        }
                    });
                });
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }
    $scope.getCallHistory = (phone) => {
        $('#user_table2').DataTable().destroy();
        $('.call-history').css('pointer-events', 'none');
        $('body').css('cursor', 'wait');
        $http.get(base_url + 'sale_care/ajax_get_care_result_by_phone/' + phone).then(r => {
            $scope.total_duration_time = r.data.total_duration_time;
            $scope.total_call_time = r.data.total_call_time;
            if (r && r.data.status == 1) {
                $('.call-history').css('pointer-events', 'inherit');
                $('body').css('cursor', 'auto');

                $scope.call_result_details = r.data.data;
                $('#call_result').modal('show');
                angular.element(document).ready(function () {
                    setTimeout(() => {
                        $('#user_table2').DataTable({
                            "columnDefs": [{
                                "defaultContent": "-",
                                "targets": "_all"
                            }]
                        });
                        $scope.$apply();
                    }, 0);
                });
            }
        })
    }

    $scope.close_cs = (value) => {
        $scope.to_view = 1;
    }
    $scope.openHisN = (value) => {

        $scope.to_view = 2;

        $('.care_box ').addClass('loading');
        $('.child').css('pointer-events', 'none');
        var data = {
            customer_id: value.customer_id
        }

        $http.post(base_url + 'telesales_v2/ajax_get_invoice', JSON.stringify(data)).then(r => {
            $('.care_box').removeClass('loading');
            $('.child').css('pointer-events', 'auto');
            var obj = r.data;
            $('#tb2_' + value.customer_id).html(obj.package + obj.invoice);

            if (r.data.imgs) {
                $scope.get_imgs(r.data.imgs, 2);

                $scope.getGpl(r.data.imgs);
            }

        });
    }


    $scope.deleteTag = (item) => {
        var data = {
            id: item.id
        }
        $http.post(base_url + 'telesales_v2/delete_tag', JSON.stringify(data)).then(r => {
            if (r && r.data.status == 1) {
                $scope.saveTagChange();
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }
    $scope.dateInputInit = () => {
        if ($('.date').length) {
            //var start = $scope.start;
            //var end = $scope.end;
            if (typeof start === "undefined") {
                start = end = moment().subtract(1, 'days').format("MM/DD/YYYY");
            }
            if ($scope.filter.date) {
                var date = $scope.filter.date.split(' - '),
                    start = moment(date[0], 'DD/MM/YYYY'),
                    end = moment(date[1], 'DD/MM/YYYY');
            } else {
                var
                    start = moment(),
                    end = moment();
            }


            setTimeout(() => {
                $('.date').daterangepicker({
                    opens: 'right',
                    alwaysShowCalendars: true,
                    startDate: start,
                    endDate: end,
                    ranges: {
                        'Hôm nay': [moment(), moment()],
                        'Hôm qua': [moment().subtract(1, 'days'), moment().subtract(1,
                            'days')],
                        '7 ngày trước': [moment().subtract(6, 'days'), moment()],
                        '30 ngày trước': [moment().subtract(29, 'days'), moment()],
                        'Tháng này': [moment().startOf('month'), moment().endOf('month')],
                        'Tháng trước': [moment().subtract(1, 'month').startOf('month'),
                            moment().subtract(1, 'month').endOf('month')
                        ]
                    },
                    locale: {
                        format: 'DD/MM/YYYY'
                    }
                });
            }, 100);
        }
    }

    $scope.addToList = (value) => {

        let index = $scope.ar_cpl.indexOf(parseInt(value.id));
        console.log(index);
        if (index < 0) {
            $scope.ar_cpl.push(parseInt(value.id));
        } else {
            $scope.ar_cpl.splice(index, 1);
        }


    }

    $scope.checkHave = (value) => {
        let index = $scope.ar_cpl.indexOf(parseInt(value));
        if (index >= 0) {
            return true;
        }
        return false;
    }




    $scope.go2Page = function (page, item) {
        $('tbody').find('tr.child').css('display', 'none');

        var pi = item;

        console.log(item);
        if (page < 0) {
            $scope.filter.endPage = 1;
            $scope.filter.limit = pi.itemsPerPage;
            $scope.getData();
            return;
        }

        // console.log(item);
        $scope.filter.endPage = 0;
        pi.currentPage = page;
        pi.from = pi.offset = (pi.currentPage - 1) * pi.itemsPerPage;
        if (pi.id == 1) {
            $scope.filter1.limit = pi.itemsPerPage;
            $scope.filter1.offset = pi.offset;
            $scope.getStudentCare($scope.current_student.id);
        } else if (pi.id == 2) {
            $scope.filter2.limit = pi.itemsPerPage;
            $scope.filter2.offset = pi.offset;
            $scope.getApp(0);
        } else {
            $scope.filter.limit = pi.itemsPerPage;
            $scope.filter.offset = pi.offset;
            $scope.getData();
        }

        pi.to = pi.total < pi.itemsPerPage ? pi.total : pi.itemsPerPage
    }

    $scope.Previous = function (page, item) {
        if (page - 1 > 0) $scope.go2Page(page - 1, item);
        if (page - 1 == 0) $scope.go2Page(page, item);
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

    // $('#modal_image_invoice').on('hide.bs.modal', function () {
    //     console.log(123);
    //     $('#modal_history_cus').modal('show');
    //     setTimeout(() => {
    //         $('body').addClass('modal-open');
    //     }, 500)
    // });

});
app.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if (event.which === 13) {
                scope.$apply(function () {
                    scope.$eval(attrs.ngEnter);
                });
                event.preventDefault();
            }
        });
    };
})