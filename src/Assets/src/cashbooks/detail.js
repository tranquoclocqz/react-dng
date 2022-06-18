app.directive('copyToClipboard', function() {
    return {
        restrict: 'A',
        link: function (scope, elem, attrs) {
            elem.click(function () {
                if (attrs.copyToClipboard) {
                    var $temp_input = $("<input>");
                    $("body").append($temp_input);
                    $temp_input.val(attrs.copyToClipboard).select();
                    document.execCommand("copy");
                    $temp_input.remove();
                    toastr["warning"]('Đã sao chép liên kết vào bộ nhớ tạm!');
                }
            });
        }
    };
});
app.directive("whenScrolled", function () {
    return {
        restrict: 'A',
        link: function (scope, elem, attrs) {
            // we get a list of elements of size 1 and need the first element
            raw = elem[0];
            // we load more elements when scrolled past a limit
            elem.bind("scroll", function () {
                if (raw.scrollTop + raw.offsetHeight + 5 >= raw.scrollHeight) {
                    scope.$apply(attrs.whenScrolled);
                }
            });
        }
    }
});
app.controller('detail', function ($scope, $http, $sce) {
    $scope.init = () => {
        get_group_cost();
        $scope.base_url = base_url;
        $scope.current_user = CURRENT_USER_ID;
        $scope.is_admin = IS_ADMIN;
        $scope.current_store_id = CURRENT_STORE_ID;
        $scope.data = JSON.parse(DATA);
        setTimeout(() => {
            if ($scope.data.import_id == $scope.current_user && $scope.data.verify_status == 0) {
                $scope.get_itemDetail($scope.data.id)
            } else {
                $scope.get_itemDetail($scope.data.id, 'view')
            }
        }, 200);
        
        objectGenerator();
        autosize($('textarea.autosize'));
        setTimeout(() => {
            $scope.dateInputInit();
        }, 10);
        var preview_id = getParamsValue('preview_id');
        if (preview_id) {
            $scope.get_itemDetail(preview_id, 'view');
        } else console.log('no value was found!');
        $scope.loading_model_note = false;
    }

    $scope.checkShowUrlImage = (url_image) => {
        var url = angular.copy(url_image) + '';
        if (url.slice(0, 4) == 'http') {} else {
            url = base_url + 'assets/uploads/certificates/' + url;
        }
        return url;
    }

    $scope.be_showZoomImg = (url) => {
        showZoomImg($scope.checkShowUrlImage(url));
    }

    function get_group_cost() {
        $http.get(base_url + 'cashbooks/ajax_get_group_cost').then(r => {
            $scope.group_cost = r.data.data;
        })
    }

    function getParamsValue(params) {
        var url = new URL(window.location.href);
        var c = url.searchParams.get(params);
        return c;
    }

    function objectGenerator() {
        $scope.filter = {};
        $scope.mont_year_render();
    }
    $scope.selectMonthAllocated = (month) => {
        $scope.cbsObject.month_allocated = month;
    }
    $scope.mont_year_render = (year = 0, delete_access = true) => {
        if ($scope.cbsObject && delete_access) delete $scope.cbsObject.month_allocated;

        let d = new Date();
        $scope.current_year = d.getFullYear();
        let current_month = d.getMonth();

        $scope.df_month_allocated = $scope.current_year + '/' + (current_month < 10 ? '0' + current_month : current_month);

        $scope.list_month = [];
        for (let index = 0; index < current_month; index++) {
            let bep = index + 1;
            bep = bep < 10 ? '0' + bep : bep;
            $scope.list_month.push(bep);
        }
        if (current_month == 1) {
            $scope.current_year = $scope.current_year - 1;
            $scope.list_month = [12];
            $scope.df_month_allocated = $scope.current_year + '/' + 12;
        }
    }


    $scope.handleFilter = () => {
        $scope.pagingInfo.currentPage = 1;
        $scope.pagingInfo.offset = 0;
    }


    $scope.formatDate = (d, fm) => {
        return moment(d).format(fm);
    }

    function select2() {
        setTimeout(() => {
            $('.select2').select2();
        }, 200);
    }

    $scope.dateInputInit = () => {
        $('.custom-daterange').daterangepicker({
            opens: 'right',
            alwaysShowCalendars: true,
            startDate: moment().subtract(6, 'days'),
            endDate: moment(),
            // maxDate: moment(),
            maxYear: parseInt(moment().format('YYYY'), 10),
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
                format: 'DD/MM/YYYY',
            }
        });
    }
    // $scope.single_date_picker = () => {
    //     $('input.single-picker').daterangepicker({
    //         singleDatePicker: true,
    //         showDropdowns: true,
    //         minYear: 1901,
    //         maxYear: parseInt(moment().format('YYYY'), 10)
    //     }, function(start, end, label) {
    //         var years = moment().diff(start, 'years');
    //         alert("You are " + years + " years old!");
    //     });
    // }

    function new_CBS_reset() {
        delete $scope.list_transaction_func;
        delete $scope.list_verify_request;
        delete $scope.bind_selected_group;

        $scope.cbsObject = {};
        $scope.cbsObject.type_id = '0';
        $scope.cbsObject.formality = 'amount';
        $scope.cbsObject.source = 'amount';
        $scope.cbsObject.bank_id = '0';
        setTimeout(() => {
            var c = document.getElementById("myCanvas");
            var ctx = c.getContext("2d");
            ctx.clearRect(0, 0, c.width, c.height);
        }, 300);
    }

    $scope.check_data_after_loaddata = function (data) {
        $scope.mont_year_render(data.year_allocated, false);
        let selected_group = $scope.group_cost.find(x => x.id === data.type_id);
        $scope.bind_selected_group = selected_group;
        $http.get(base_url + 'cashbooks/ajax_get_user_by?filter=' + JSON.stringify({
            'group_ids': JSON.parse(selected_group.main_group_confirm_id),
            'user_ids': JSON.parse(selected_group.user_confirm_id),
            'cost_group_id': selected_group.id
        })).then(r => {
            if (r.data.status == 1) {
                $scope.list_verify_request = r.data.data;
                select2();
            } else toastr["error"]('Vui lòng thử lại');
        })
        if (selected_group.link_function_type > 0) {
            if(selected_group.link_function_type == 4){
                $scope.loadding = true;
                $http.get(base_url + 'cashbooks/ajax_get_recently_transaction_func?filter=' + JSON.stringify({
                    'link_function_type': selected_group.link_function_type,
                    'transaction_ids': data.link_functions
                })).then(r => {
                    if (r.data.status == 1) {
                        $scope.list_transaction_func = r.data.data;
                        angular.forEach($scope.list_transaction_func, function (value, key) {
                            if (value.id_cs == $scope.cbsObject.id) {
                                value.view = 1;
                                $scope.max_price = value.transfer_amount;
                            }else{
                                value.view = 0;
                            }
                        });
                    } else toastr["error"]('Vui lòng thử lại');
                    $scope.loadding = false;
                })
            }else{
                $http.get(base_url + 'cashbooks/ajax_get_recently_transaction_func?filter=' + JSON.stringify({
                    'link_function_type': selected_group.link_function_type,
                    'limit': 30
                })).then(r => {
                    if (r.data.status == 1) {
                        angular.forEach(r.data.data, function (value, key) {
                            r.data.data[key].selected_item = false;
                            if (data.link_functions.indexOf(value.id) != -1) {
                                r.data.data[key].selected_item = true;
                            }
                        });
                        $scope.list_transaction_func = r.data.data;
                    } else toastr["error"]('Vui lòng thử lại');
                })
            }
        }
    }

    $scope.check_type_id = (id, checktype = false) => {
        let selected_group = $scope.group_cost.find(x => x.id === id);
        $scope.bind_selected_group = selected_group;
        $scope.cbsObject.link_functions = [];
        $scope.transaction_limit = 30;
        if (selected_group.quota_per_month && selected_group.quota_per_month != null) {
            $scope.cbsObject.month_allocated = $scope.df_month_allocated + '';
            $scope.cbsObject.month_accept = selected_group.quota_per_month;
        } else {
            delete $scope.cbsObject.month_allocated;
            delete $scope.cbsObject.month_accept;
            delete $scope.cbsObject.year_allocated;
        }
        $http.get(base_url + 'cashbooks/ajax_get_user_by?filter=' + JSON.stringify({
            'group_ids': JSON.parse(selected_group.main_group_confirm_id),
            'user_ids': JSON.parse(selected_group.user_confirm_id),
            'cost_group_id': selected_group.id
        })).then(r => {
            if (r.data.status == 1) {
                $scope.list_verify_request = r.data.data;
                $scope.cbsObject.request_verify_id = '0';
                select2();
            } else toastr["error"]('Vui lòng thử lại');
        })
        if (selected_group.link_function_type != 0) {
            $scope.cbsObject.link_function_type = selected_group.link_function_type;
            if(selected_group.link_function_type == 4){
                $scope.search_bank = {};
                $scope.search_bank.name = "";
                if($scope.cbsObject.id){
                    $scope.get_itemDetail($scope.cbsObject.id, 'edit');
                }
            }else{
                $scope.get_recent_transactions();
            }
        } else {
            delete $scope.list_transaction_func;
            delete $scope.cbsObject.link_function_type;
        }
    }
    $scope.get_recent_transactions = (limit = 30) => {
        $http.get(base_url + 'cashbooks/ajax_get_recently_transaction_func?filter=' + JSON.stringify({
            'link_function_type': $scope.bind_selected_group.link_function_type,
            'limit': limit
        })).then(r => {
            if (r.data.status == 1) {
                $scope.list_transaction_func = r.data.data;
                if (r.data.data.length == 0) toastr["warning"]('Không có giao dịch liên kết phù hợp, vui lòng kiểm tra lại nhóm chi!');
                select2();
            } else toastr["error"]('Vui lòng thử lại');
        })
    }
    $scope.copy_cbs_id = () => {
        /* Select the text field */
        var copyText = document.getElementById("copy_input");
        copyText.select();
        copyText.setSelectionRange(0, 99999); /* For mobile devices */
        /* Copy the text inside the text field */
        document.execCommand("copy");
        /* Alert the copied text */
        alert("Đã copy liên kết: " + copyText.value);
    }
    $scope.get_itemDetail = (id, type = 'edit') => {
        $scope.search_bank = {};
        $scope.search_bank.name = "";
        delete $scope.error_messages;
        $scope.body_loading = true;
        let par = (type == 'edit') ? '?type=edit' : '?type=view';
        $http.get(base_url + 'cashbooks/ajax_get_cbs_detail/' + id + par).then(r => {
            $scope.body_loading = false;
            if (r.data.status == 1) {
                $scope.url_preview = base_url + 'cashbooks/expenditures_v2?preview_id=' + r.data.data.id;
                $scope.detail_transaction_func = r.data.recent_transactions;
                $scope.cbsObject = r.data.data;
                $scope.modalType = (type == 'edit') ? 'create_cbs' : 'view_detail';
                $scope.check_data_after_loaddata(r.data.data);
            } else toastr["error"]('Vui lòng thử lại');
        })
    }
    $scope.confirm_cbs = (status, type = 1) => { //1: duyệt lần 1, 2: duyệt lại
        if (type == 2 || (status == 2 && type == 1)) {
            if (!$scope.cbsObject.note_edit_cashbook || $scope.cbsObject.note_edit_cashbook == '') {
                showMessErr('Vui lòng nhập ghi chú!')
                return false;
            }
        } else {
            $scope.cbsObject.note_edit_cashbook = '';
        }

        let data = {
            'cbs_id': $scope.cbsObject.id,
            'status': status,
            'cancel_note': $scope.cbsObject.note_edit_cashbook,
            'confirm_type': type
        }
        
        $scope.loading_model_note = true;
        $http.post(base_url + 'cashbooks/ajax_confirm_cbs', data).then(r => {
            $scope.loading_model_note = false;
            if (r && r.data.status == 1) {
                $scope.get_itemDetail($scope.data.id, 'view');
                $('#confirm-note-modal').modal('hide');
                if (status == 1 && type == 1) {
                    swal("Thông báo", "Phiếu chi đã duyệt thành công.", "success");
                } else showMessSuccess('Đã cập nhật thành công!');
            } else showMessErr();
        })
    }
    $scope.attachFile = () => {
        $('#inputFileEdit').click();
    }
    $scope.imageUpload = function (element) {
        var files = event.target.files; //FileList object
        $scope.saveImage(files)
    }

    $scope.showZoomImg = (value) => {
        showZoomImg(value)
    }

    $scope.removeFile = (key, item) => {
        item.files.splice(key, 1);
    }

    $scope.saveImage = (files) => {
        var formData = new FormData();
        formData.append('file', files[0]);
        formData.append('resize_level', 3);
        formData.append('folder', 'cashbook');
        formData.append('multiple', true);
        for (let index = 0; index < files.length; index++) {
            formData.append('file[]', files[index]);
        }
        $scope.loading = true;
        $http({
            url: base_url + '/uploads/ajax_upload_to_filehost?func=cashbook_detail',
            method: "POST",
            data: formData,
            headers: {
                'Content-Type': undefined
            }
        }).then(r => {
            $scope.loading = false;
            if (r.data.status == 1) {
                $scope.cbsObject.file = r.data.data[0];
            } else {
                toastr["error"](r.data.message)
            }
        })
    }
    $scope.cbs_action = () => {
        if ($scope.cbsObject.formality == 'transfer' && $scope.cbsObject.bank_id == 0) {
            toastr["error"]('Vui lòng chọn tài khoản thụ hưởng!');
            return false;
        }
        if (!$scope.cbsObject.file || $scope.cbsObject.file == '') {
            toastr["error"]('Vui lòng chọn chứng từ!');
            return false;
        }
        if ($scope.cbsObject.link_function_type && $scope.cbsObject.link_function_type != 0 && (!$scope.cbsObject.link_functions || $scope.cbsObject.link_functions.length == 0)) {
            toastr["error"]('Không có giao dịch áp dụng, vui lòng kiểm tra lại!');
            return false;
        }

        if ($scope.cbsObject.month_accept && !$scope.cbsObject.month_allocated) {
            toastr["error"]('Vui lòng nhập đầy đủ tháng áp dụng!');
            return false;
        }

        if (!$scope.cbsObject.request_verify_id || $scope.cbsObject.request_verify_id == 0) {
            toastr["error"]('Vui lòng chọn người duyệt!');
            return false;
        }

        let data = angular.copy($scope.cbsObject);

        data.price = (data.price + '').replace(/,/g, "");
        if (data.price <= 0) {
            toastr["error"]('Vui lòng nhập số tiền!');
            return false;
        }
        if (data.price > $scope.max_price && $scope.cbsObject.link_function_type == 3) {
            $scope.error_messages = 'Vui lòng kiểm tra lại số tiền đã nhập và số tiền sử dụng quà tặng!'
            return false;
        }
        if (data.price != $scope.max_price && $scope.cbsObject.link_function_type == 4) {
            toastr["error"]('Vui lòng kiểm tra lại số tiền đã nhập và số tiền thanh toán ngân hàng!');
            return false;
        }
        $http.post(base_url + 'cashbooks/ajax_create_cbs', data).then(r => {
            if (r && r.data.status == 1) {
                delete $scope.error_messages;
                toastr.success('Đã tạo thành công!');
                $scope.getAll();
                $('#showModal').modal('hide');
            } else {
                $scope.error_messages = r.data.messages;
            }
        })
    }

    $scope.openMdConfirm = (type, item) => {
        $scope.confirmModalType = type;
        $scope.md_item = item;
        $('#confirmModal').modal('show');

    }
    $scope.openModal = (type, item = null) => {
        $scope.modalType_IND = type;
        switch (type) {
            case 'file':
                $scope.detail_file = $scope.checkShowUrlImage(item.file);
                break;
            default:
                break;

        }
        $('#showModal').modal('show');
    }
    $scope.confirmAction = () => {
        switch ($scope.confirmModalType) {
            case 'cancel':
                $http.get(base_url + 'cashbooks/cancel_cbs_by_creator/' + $scope.md_item).then(r => {
                    if (r && r.data.status == 1) {
                        toastr.success(r.data.messages);
                        location.replace(base_url + 'cashbooks/expenditures_v2')
                    } else toastr["error"](r.data.messages);
                })
                break;

            default:
                break;
        }
    }
    $scope.selectTrans = (item) => {
        item.selected_item = !item.selected_item;
        $scope.cbsObject.link_functions = [];
        $scope.max_price = 0;
        angular.forEach($scope.list_transaction_func, function (value, key) {
            if (value.selected_item) {
                $scope.cbsObject.link_functions.push(value.id);
                if (value.max_real_price) $scope.max_price += Number(value.max_real_price);
            }
        });
    }

    $scope.get_recent_transactions_bank = () => {
        if($scope.search_bank.name.length > 3){
            $scope.loadding = true;
            if(!$scope.cbsObject.id){
                $scope.cbsObject.link_functions = []
            }
            if(!$scope.cbsObject.price){
                $scope.loadding = false;
                return toastr["error"]('Vui lòng nhập số tiền');
            }
            $scope.cbsObject.formality = "transfer";
            $http.get(base_url + 'cashbooks/ajax_get_recently_transaction_func?' + $.param({
                'link_function_type': $scope.bind_selected_group.link_function_type,
                'keyword' : $scope.search_bank.name,
                'price' : $scope.cbsObject.price
            })).then(r => {
                if (r.data.status == 1) {
                    $scope.list_transaction_func = r.data.data;
                    angular.forEach($scope.list_transaction_func, function (value, key) {
                        if (value.id_cs == $scope.cbsObject.id) {
                            value.view = 1;
                        }else{
                            value.view = 0;
                        }
                    });
                    if (r.data.data.length == 0) toastr["warning"]('Không có giao dịch liên kết phù hợp, vui lòng kiểm tra lại nội dung tìm kiếm và số tiền!');
                    select2();
                } else toastr["error"]('Vui lòng thử lại');
                $scope.loadding = false;
            });
        }else{
            return toastr["error"]('Vui lòng nhập nội dung hóa đơn chuyển khoản');
        }

    }

    $scope.selectTransBank = (item) => {
        $scope.cbsObject.link_functions = [];
        $scope.cbsObject.link_functions.push(item.id);
        $scope.cbsObject.bank_id = item.bank_id;
        $scope.max_price = 0;
        angular.forEach($scope.list_transaction_func, function (value, key) {
            if (value.id == item.id) {
                value.view = 1;
                $scope.max_price = value.transfer_amount;
            }else{
                value.view = 0;
            }
        });
    }

    $scope.showModelConfirm = (status, type = 1) => {
        swal({
            title: "Thông báo",
            text: "Bạn có chắc muốn duyệt phiếu chi này?",
            type: "warning",
            showCancelButton: true,
            confirmButtonClass: "btn-danger",
            confirmButtonText: "Xác nhận",
            cancelButtonText: "Đóng",
            confirmButtonColor: "#00a65a",
            closeOnConfirm: false,
            showLoaderOnConfirm: true,
            allowOutsideClick: false,
        }, function () {
            $scope.confirm_cbs(status, type);
        });
    }

    $scope.showModelNote = () => {
        $scope.cbsObject.note_edit_cashbook = '';
        $('#confirm-note-modal').modal('show');
    }
});