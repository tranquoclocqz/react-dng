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
app.controller('debtCtrl', function ($scope, $http, $sce) {
    var pi = $scope.pagingInfo = {
        itemsPerPage: 30,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };
    $scope.current_user = CURRENT_USER_ID;
    $scope.store_list = STS;
    $scope.init = () => {
        $scope.activeTab = 2;
        objectGenerator();
        $http.get(base_url + 'cashbooks/get_cashbook_online_receipt_data').then(r => {
            if (r && r.data.status == 1) {
                $scope.shiper_list = r.data.data.warehouse_shipers;
            } else toastr["error"](r.data.messages);
        })

        $http.get(base_url + 'cashbooks/get_user_by_group_cost/27').then(r => {
            if (r && r.data.status == 1) {
                $scope.list_request_confirm = r.data.data;
            } else toastr["error"](r.data.messages);
        })
        setTimeout(() => {
            $scope.dateInputInit();
            $scope.getAll();
        }, 10);
        select2();
    }


    $scope.changeActiveTab = (tab) => {
        $scope.activeTab = tab;
        if (condition) {

        }
    }

    function objectGenerator() {
        $scope.filter = {};
        $scope.filter.shiper_id = '0';
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;
    }

    $scope.getAll = () => {
        $http.get(base_url + 'cashbooks/ajax_get_receipt_list?filter=' + JSON.stringify($scope.filter)).then(r => {
            $scope.body_loading = false;
            if (r.data.status == 1) {
                $scope.rows = r.data.data;
                $scope.pagingInfo.total = r.data.count;
                $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
            } else toastr["error"](r.data.messages);
        })
    }
    $scope.resend_cbs = (id) => {
        $http.get(base_url + 'cashbooks/ajax_resend_cbs/' + id).then(r => {
            if (r && r.data.status == 1) {
                toastr.success(r.data.messages);
                $scope.getAll();
            } else toastr["error"](r.data.messages);
        })
    }
    $scope.createdcbs = (type = 0) => {
        dt = {};
        if ($scope.cbsObject.formality == 0) {
            toastr["error"]("Vui lòng chọn hình thức");
            return false;
        }
        if (!$scope.cbsObject.file) {
            toastr["error"]("Vui lòng nhập chứng từ");
            return false;
        }

        if (!$scope.cbsObject.price || $scope.cbsObject.price == 0) {
            toastr["error"]("Vui lòng nhập số tiền");
            return false;
        }
        if ($scope.cbsObject.shiper_id == 0) {
            toastr["error"]("Vui lòng chọn shiper");
            return false;
        }
        if (!$scope.cbsObject.link_functions || $scope.cbsObject.link_functions.length == 0) {
            toastr["error"]("Vui lòng chọn hóa đơn liên kết");
            return false;
        }
        if ($scope.cbsObject.request_verify_id == 0) {
            toastr["error"]("Vui lòng chọn người duyệt");
            return false;
        }
        $scope.loading = true;

        dt.file = $scope.cbsObject.file;
        dt.title = $scope.cbsObject.title;
        dt.price = ($scope.cbsObject.price + '').replace(/,/g, "");
        dt.warehouse_shiper_id = $scope.cbsObject.shiper_id;
        dt.formality = $scope.cbsObject.formality;
        dt.request_verify_id = $scope.cbsObject.request_verify_id;
        dt.note = $scope.cbsObject.note;

        dt.link_functions = $scope.cbsObject.link_functions;

        if ($scope.cbsObject.id) {
            dt.id = $scope.cbsObject.id;
        }

        $http.post(base_url + 'cashbooks/create_cbs', dt).then(r => {
            if (r && r.data.status == 1) {
                toastr.success('Đã tạo thành công!');
                $scope.getAll();
                $('#showModal').modal('hide');
            } else toastr["error"](r.data.messages);
        })
        return;
    }
    $scope.attachFile = () => {
        $('#inputFileEdit').click();
    }
    $scope.imageUpload = function (element) {
        var files = event.target.files; //FileList object
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var reader = new FileReader();
            reader.onload = function (readerEvent) {
                var avatarImg = new Image();
                var src = reader.result;
                avatarImg.src = src;
                document.getElementById("dataUrl").innerText = src;
                avatarImg.onload = function () {
                    var c = document.getElementById("myCanvas");
                    var ctx = c.getContext("2d");
                    ctx.canvas.width = avatarImg.width;
                    ctx.canvas.height = avatarImg.height;
                    ctx.drawImage(avatarImg, 0, 0);
                };
            }
            reader.readAsDataURL(file);
        }
        $scope.saveImage(files)
    }
    $scope.saveImage = (files) => {
        var formData = new FormData();
        formData.append('resize_level', 3);
        formData.append('file', files[0]);
        $http({
            url: base_url + '/uploads/ajax_upload_to_filehost?func=cashbook_debt',
            method: "POST",
            data: formData,
            headers: {
                'Content-Type': undefined
            }
        }).then(r => {
            if (r.data.status == 1) {
                $scope.cbsObject.file = r.data.data[0];
            } else {
                toastr["error"](r.data.message)
            }
        })
    }
    $scope.dateInputInit = () => {
        $('.custom-daterange').daterangepicker({
            opens: 'right',
            alwaysShowCalendars: true,
            startDate: moment().subtract(1, 'days'),
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
    $scope.shiper_logo = () => {
        if ($scope.cbsObject.shiper_id && $scope.cbsObject.shiper_id != '0') {
            let lg = '';
            angular.forEach($scope.shiper_list, function (value, key) {
                if (value.id == $scope.cbsObject.shiper_id) {
                    lg = value.logo;
                }
            });
            return lg;
        }
        return 'assets/images/noimg.png';
    }
    $scope.count_selected_money = (type) => {
        let amount = 0;
        let visa = 0;
        angular.forEach($scope.list_transaction_func, function (value, key) {
            if (value.selected_item) {
                amount += Number(value.amount_nub);
                visa += Number(value.visa_nub);
            }
        });
        if (type == 'visa') return visa;
        if (type == 'amount') return amount;
    }
    $scope.selectTrans = (item) => {
        if (item.total_linked > 0) {
            if (!$scope.cbsObject.id || $scope.cbsObject.id != item.linked_id) {
                toastr["error"]('Giao dịch đã được liên kết!');
                return false;
            }
        }
        if (item.ship_status_id == -1) {
            toastr["error"]('Không thể chọn giao dịch đã bị hủy!');
            return false;
        }
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
    $scope.check_selected = (item) => {
        let check = 0;
        angular.forEach($scope.cbsObject.link_functions, function (value, key) {
            if (value == item.id) {
                item.selected_item = true;
                check = 1;
                return;
            }
        })
        return check;
    }
    $scope.openModal = (type, item = null) => {
        delete $scope.error_messages;
        $scope.modalType = type;
        switch (type) {
            case 'create_cbs':
                $scope.cbsObject = {};
                $scope.cbsObject.formality = "0";
                $scope.cbsObject.price = "0";
                $scope.cbsObject.request_verify_id = "0";
                $scope.cbsObject.title = "Doanh thu công nợ nhà vận chuyển";
                $scope.cbsObject.shiper_id = "0";
                select2();
                $scope.invFilter = {};
                $scope.invFilter.status = 4;
                $scope.get_receipt_inv_fun(30, [], $scope.invFilter.status);
                break;
            case 'linked':
                get_linked_by_cbs(item);
                break;
            case 'edit':
                $scope.cbsObject = item;
                setTimeout(() => {
                    select2();
                    $scope.get_receipt_inv_fun();
                }, 10);
                break;
            default:
                break;
        }
        $('#showModal').modal('show');
    }

    $scope.showZoomImg = (value) => {
        showZoomImg(value)
    }

    function get_linked_by_cbs(cbs) {
        $http.get(base_url + 'cashbooks/get_get_linked_by_cbs?filter=' + JSON.stringify({
            'cbs_id': cbs.id,
            'shiper_receitp': 1
        })).then(r => {
            if (r.data.status == 1) {
                $scope.linked_list = (r.data.data);
            } else toastr["error"]('Vui lòng thử lại');
        })
    }

    $scope.converHtml = (htmlbd) => {
        return $sce.trustAsHtml(htmlbd);
    }

    function select2() {
        setTimeout(() => {
            $('.select2').select2();
        }, 100);
    }
    $scope.changeShiper = () => {
        $scope.cbsObject.link_functions = [];
        $scope.list_transaction_func = [];
        $scope.get_receipt_inv_fun();
    }

    $scope.get_receipt_inv_fun = (limit = 30, trans_arr = [], status = 4) => {
        $scope.invFilter.status = status;
        $scope.transLimit = limit;
        let data = {};
        data.limit = limit;
        data.status = status;
        data.shiper_id = $scope.cbsObject.shiper_id;
        data.store_id = CURRENT_STORE_ID;
        // if (trans_arr.length > 0) {
        //     data.transactions = trans_arr;
        //     data.only_arr = true;
        // }
        $http.post(base_url + 'cashbooks/get_receipt_inv_fun', data).then(r => {
            if (r && r.data.status == 1) {
                $scope.list_transaction_func = r.data.data.list_trans;
            } else toastr["error"](r.data.messages);
        });
    }
    //paging-----------------------------------

    $scope.go2Page = function (page) {
        if (page < 0) return;
        var pi = $scope.pagingInfo;
        pi.currentPage = page;
        pi.from = pi.offset = (pi.currentPage - 1) * pi.itemsPerPage;
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = ($scope.pagingInfo.currentPage - 1) * $scope.pagingInfo.itemsPerPage;
        $scope.getAll();
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
    //end paging

});