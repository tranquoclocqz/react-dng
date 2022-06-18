app.controller('confirm_list', function ($scope, $http, $sce, $compile, $location) {

    var pi = $scope.pagingInfo = {
        itemsPerPage: 20,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };

    $scope.init = () => {
        $('.box').css('opacity', "1");
        $scope.transObj = {
            transfer_type: '3'
        };
        $scope.allow_view_all = allow_view_all;
        $scope.filter = {
            by_date_create: false,
            active: '1',
            date_created: date_bw_today,
            allow_view_all: allow_view_all,
            transfer_type: '3',
            store_id: `${store_id}`
        };
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;
        $scope.status = 1;
        $scope.submitTransferType = '3';
        $scope.getCashBook();
        $scope.getConfirmList(1);
        $(`.select2`).select2();
    }

    $scope.showLabelInstallment = (json) => {
        if (isJsonString(json)) {
            json = JSON.parse(json);
            return json.methodCode === "VNPAY_SPOS_INSTALLMENT" ? $sce.trustAsHtml(` <label class="label label-primary">Trả góp</label>`) : '';
        }
    }

    function isJsonString(str) {
        if (!str) return false;
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }

    $scope.openCallApi = () => {
        $scope.obj_call = {
            text: '',
            load: false
        };
        $('#callApiModal').modal('show');
    }


    $scope.callApiSendSms = () => {
        $scope.obj_call.load = true;
        $http.post('verify_payment/ajax_call_api_sen_sms', $scope.obj_call).then(r => {
            $scope.obj_call.load = false;
            if (r && r.data.status == 1) {
                $('#callApiModal').modal('hide');
                showMessSuccess();
            } else showMessErr(r.data.messages);
        }, function (err) {
            showMessErrSystem();
        });
    }



    $scope.openEdit = (value) => {
        var item = angular.copy(value);
        $('#editModal').modal('show');
        $scope.obj_edit = {
            id: item.id,
            active: item.active,
            payment_identifier: item.payment_identifier,
            load: false
        }
    }

    $scope.editTrans = () => {
        var obj_edit = angular.copy($scope.obj_edit);
        $scope.obj_edit.load = true;
        $http.post('verify_payment/ajax_update_trans', obj_edit).then(r => {
            $scope.obj_edit.load = false;
            if (r && r.data.status == 1) {
                $('#editModal').modal('hide');
                showMessSuccess();
                $scope.getConfirmList($scope.status);
            } else showMessErr(r.data.messages);
        });
    }

    $scope.open_creator = (transfer_type) => {
        $('#createModal').modal('show');
        $scope.transObj.transfer_type = transfer_type;
        $scope.transObj.transfer_code = '';
        $scope.transObj.payment_identifier = '';
        $scope.transObj.transfer_amount = '';


        $scope.transObj.bank_id = '0';
        if (transfer_type == "4") {
            $scope.transObj.store_id = `${store_id}`;
        }
        var today = new Date();
        let dte = moment(today).format('DD/MM/YYYY HH:mm:00');
        setTimeout(() => {
            $('#datetimepicker1').daterangepicker({
                singleDatePicker: true,
                timePicker: true,
                timePicker24Hour: true,
                autoApply: false,
                autoUpdateInput: false,
                drops: 'down',
                autoclose: false,
                locale: {
                    format: 'DD/MM/YYYY HH:mm:ss'
                },
            }).val(dte);
            $("#datetimepicker1").trigger("change");
            $('#datetimepicker1').on('apply.daterangepicker', function (ev, picker) {
                $(this).val(picker.startDate.format('DD/MM/YYYY HH:mm:ss'));
                $("#datetimepicker1").trigger("change");
            });
            $("#datetimepicker1").data('daterangepicker').setStartDate(today);
            $(`.select2`).select2();
        }, 50);
    }

    $scope.create_trans = () => {
        let err = false;
        if ($scope.transObj.payment_identifier && $scope.transObj.payment_identifier != '') {
            $scope.transObj.payment_identifier = removeVietnameseTones($scope.transObj.payment_identifier);
        }
        let data = angular.copy($scope.transObj);
        data.transfer_amount = (data.transfer_amount + '').replace(/,/g, "");
        if (data.transfer_amount == "undefined" || data.transfer_amount == 0 || !data.transfer_amount) {
            err = 'Vui lòng nhập số tiền';
        }
        if (data.transfer_type == 3 && data.bank_id == 0) {
            err = 'Vui lòng chọn ngân hàng';
        }
        if (!data.payment_identifier || data.payment_identifier == '') {
            err = 'Vui lòng nhập ghi chú';
        }
        if (data.transfer_type == 4 && (!data.transfer_code || data.transfer_code == '')) {
            err = 'Vui lòng nhập mã giao dịch';
        }
        if (data.transfer_type == 4 && (!data.store_id || data.store_id == '')) {
            err = 'Vui lòng chọn chi nhánh';
        }
        if (err) {
            showMessErr(err);
            return false;
        }
        $scope.sending = true;
        $http.post('verify_payment/ajax_gen_trans', data).then(r => {
            delete $scope.sending;
            if (r && r.data.status == 1) {
                $scope.getConfirmList($scope.status);
                $(`#form-update`).trigger("reset");
                $('#createModal').modal('hide');
            } else showMessErr(r.data.message);
        });
    }
    $scope.getCashBook = () => {
        $http.get(base_url + '/verify_payment/get_banks').then(r => {
            if (r && r.data.status == 1) {
                $scope.banks = r.data.data;
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    $scope.changeSearch = () => {
        $scope.getConfirmList($scope.status);
    }

    $scope.searchKey = () => {
        if ($scope.filter.key.length <= 3) {
            return;
        }
        $scope.getConfirmList($scope.status);
    }

    $scope.outSearch = () => {
        if ($scope.filter.key.length <= 3) {
            $scope.filter.key = "";
            $scope.getConfirmList($scope.status);
        }
    }

    $scope.chooseTab = (status = null) => {
        $scope.status = status;
        $scope.go2Page(1);
    }

    $scope.getConfirmList = (status = null) => {
        var obj_search = angular.copy($scope.filter),
            dates_created = obj_search.date_created.split(' - '),
            dates_start = dates_created[0].split('/'),
            dates_end = dates_created[1].split('/'),
            create_start = dates_start[2] + '-' + dates_start[1] + '-' + dates_start[0],
            create_end = dates_end[2] + '-' + dates_end[1] + '-' + dates_end[0];

        obj_search.status = status;
        $scope.submitTransferType = obj_search.transfer_type;
        if (obj_search.by_date_create) {
            obj_search.date_create_start = create_start;
            obj_search.date_create_end = create_end;
        }

        if (obj_search.transfer_type == "4") {
            delete obj_search.bank_id;
            delete obj_search.active;
        }

        if (obj_search.transfer_type == "3") {
            delete obj_search.store_id;
        }

        if (obj_search.key && obj_search.key.length < 3) {
            showMessErr('Vui lòng nhập ít nhất 3 từ khóa để tìm kím');
            return;
        }
        obj_search.key = ToSlug(obj_search.key);

        $("html, body").animate({
            scrollTop: 0
        }, 0);
        $scope.load_list = true;
        $http.get(base_url + 'verify_payment/ajax_get_confirm_list?filter=' + JSON.stringify(obj_search)).then(r => {
            $scope.load_list = false;
            if (r && r.data.status == 1) {
                var data = r.data.data,
                    list = data.list;
                $.each(list, function (index, value) {
                    value.note = value.note ? value.note : '---';
                });
                $scope.status = status;
                $scope.lists = list;
                $scope.pagingInfo.total = data.count;
                $scope.pagingInfo.totalPage = Math.ceil(data.count / pi.itemsPerPage);
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    $scope.go2Page = function (page) {
        if (page < 0) return;
        var pi = $scope.pagingInfo;
        pi.currentPage = page;
        pi.from = pi.offset = (pi.currentPage - 1) * pi.itemsPerPage;
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = ($scope.pagingInfo.currentPage - 1) * $scope.pagingInfo.itemsPerPage;
        $scope.getConfirmList($scope.status);
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

}).directive('ngEnter', function () {
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
});

function ToSlug(title) {
    if (title == '' || !title) return '';
    //Đổi chữ hoa thành chữ thường

    slug = title.toLowerCase();
    slug = slug.replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a');
    slug = slug.replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e');
    slug = slug.replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i');
    slug = slug.replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o');
    slug = slug.replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u');
    slug = slug.replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, 'y');
    slug = slug.replace(/đ/gi, 'd');
    //Xóa các ký tự đặt biệt
    slug = slug.replace(/\`|\~|\!|\@|\#|\||\$|\%|\^|\&|\*|\(|\)|\+|\=|\,|\.|\/|\?|\>|\<|\'|\"|\:|\;|_/gi, '');
    //Đổi khoảng trắng thành ký tự gạch ngang
    slug = slug.replace(/ /gi, " ");
    //Đổi nhiều ký tự gạch ngang liên tiếp thành 1 ký tự gạch ngang
    //Phòng trường hợp người nhập vào quá nhiều ký tự trắng
    slug = slug.replace(/\-\-\-\-\-/gi, ' ');
    slug = slug.replace(/\-\-\-\-/gi, ' ');
    slug = slug.replace(/\-\-\-/gi, ' ');
    slug = slug.replace(/\-\-/gi, ' ');
    //Xóa các ký tự gạch ngang ở đầu và cuối
    slug = '@' + slug + '@';
    slug = slug.replace(/\@\-|\-\@|\@/gi, '');
    return slug;
}