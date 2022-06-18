app.controller('marketing_data', function ($scope, $http, $sce, $compile) {
    var pi = $scope.pagingInfo = {
        itemsPerPage: 30,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };

    $scope.init = () => {
        $scope.object_generating();
        $scope.countAll = 0;
        $scope.all_stores = STORES;
        $scope.all_sources = SOURCES;
        $scope.countAll = 0;
        $scope.getAll();
        $scope.detailShow = false;
        $scope.get_marketing_budgets();

    }
    $scope.object_generating = () => {
        $scope.quickCost = {};
        $scope.filter = {};
        $scope.filter.source_id = '0';
        $scope.filter.store_id = '0';
        $scope.filter.import_id = '0';

        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;
        select2();
        setTimeout(() => {
            $scope.dateInputInit();
        }, 50);

        $scope.resetData();
    }
    $scope.resetData = () => {
        $scope.newcost = {};
        $scope.newcost.files = [];
        $scope.newcost.source_id = '0';
        select2();
    }
    $('#creating-modal').on('hidden.bs.modal', function () {
        $scope.$apply(function () {
            $scope.resetData();
        });
    })

    $scope.getAll = () => {
        $scope.countAll++;
        if ($scope.countAll <= 2) {
            delete $scope.filter.date;
        }
        $http.get(base_url + 'sale_care/ajax_get_marketing_costs?filter=' + JSON.stringify($scope.filter)).then(r => {
            $scope.rows = r.data.data;
            $scope.pagingInfo.total = r.data.count;
            $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
        })
    }
    $scope.opendetail = (id) => {
        $scope.detailShow = true;
        $http.get(base_url + 'sale_care/ajax_get_marketing_costs_by_id/' + id).then(r => {
            $scope.newcost = r.data.data;
            setTimeout(() => {
                // $('#reportrange').data('daterangepicker').setStartDate(r.data.data.created);
                select2();
            }, 100);
            $('#creating-modal').modal('show');
        })
    }

    $scope.create_newcost = () => {

        if ($scope.newcost.source_id == 0 || !$scope.newcost.source_id) {
            toastr.error('Chưa chọn nguồn!');
            return false;
        }

        if ($scope.newcost.store_id == -10 || !$scope.newcost.store_id) {
            toastr.error('Chưa chọn Chi nhánh!');
            return false;
        }
        if (!$scope.newcost.date) {
            toastr.error('Chưa nhập ngày!');
            return false;
        }
        // if ((!$scope.newcost.files) || $scope.newcost.files.length < 1) {
        //     toastr.error('Thiếu chứng từ');
        //     return false;
        // }
        $scope.newcost.price = $scope.newcost.price.replace(/,/g, "");
        $scope.newcost.total_phone = $scope.newcost.total_phone.replace(/,/g, "");
        $scope.newcost.total_inbox = $scope.newcost.total_inbox.replace(/,/g, "");
        $scope.createDisable = true;
        if (!$scope.detailShow) {
            $http.post(base_url + 'sale_care/ajax_create_marketing_cost', $scope.newcost).then(r => {
                $scope.createDisable = false;
                if (r && r.data.status == 1) {
                    toastr["success"]('Đã thêm mới!.');
                    $scope.resetData();
                    $scope.getAll();
                } else toastr["error"](r.data.messages);
            })
        } else {
            $http.post(base_url + 'sale_care/ajax_update_marketing_cost', $scope.newcost).then(r => {
                if (r && r.data.status == 1) {
                    toastr["success"]('Đã cập nhật!.');
                    // $('#creating-modal').modal('hide');
                    // $scope.resetData();
                    $scope.getAll();
                } else toastr["error"](r.data.messages);
            })
        }
    }

    $scope.attachFile = () => {
        $('#inputFileEdit').click();
    }
    $scope.imageUpload = function (element) {
        var files = event.target.files; //FileList object
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var reader = new FileReader();
            reader.onload = $scope.imageIsLoaded;
            reader.readAsDataURL(file);
        }
        $scope.saveImage(files)
    }
    $scope.saveImage = (files) => {
        let fileType = files[0].name.split('.').pop();
        var formData = new FormData();
        formData.append('file', files[0]);
        formData.append('file_extension', fileType);
        formData.append('folder', 'marketingbudgets');
        $http({
            url: base_url + 'uploads/ajax_upload_to_filehost',
            method: "POST",
            data: formData,
            headers: { 'Content-Type': undefined }
        }).then(r => {
            if (r.data.status == 1) {
                $scope.newcost.files.push({ url_image: r.data.data[0], filename: r.data.data[0], file_type: fileType });
            } else {
                toastr["error"]('Tệp không hợp lệ!.')
            }
        })
    }
    $scope.deleteImg = (key, id) => {
        $scope.newcost.files.splice(key, 1);
    }

    $scope.setbgcolor = (color) => {
        return { "background-color": color };
    }

    function select2() {
        setTimeout(() => {
            $('.select2').select2();
        }, 50);
    }
    $scope.dateInputInit = () => {
        $('.custom-daterange').daterangepicker({
            opens: 'right',
            alwaysShowCalendars: true,
            startDate: moment().subtract(1, 'month').startOf('month'),
            endDate: moment(),
            maxDate: moment(),
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
        $('.custom-daterange2').daterangepicker({
            opens: 'right',
            alwaysShowCalendars: true,
            startDate: moment().startOf('month'),
            endDate: moment().endOf('month'),
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
        $('.single-date-picker').daterangepicker({
            singleDatePicker: true,
            showDropdowns: true,
            minYear: 1901,
            maxDate: moment(),
            maxYear: parseInt(moment().format('YYYY'), 10),
            locale: {
                format: 'DD/MM/YYYY',
            }
        });
    }
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
    $scope.get_marketing_budgets = () => {
        $http.get(base_url + 'sale_care/get_mkt_budgets?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.budgets = r.data.data;
            }
        })
    }
    $scope.dataChecking = (item) => {
        console.log($scope.all_stores);
        console.log(item);
        if (!$scope.all_stores.includes(item.store_id) || !$scope.all_sources.includes(item.source_id)) {
            item.data_failed = true;
        } else {
            item.data_failed = false;
        }
    }
    $scope.quickCreateResources = () => {
        for (let index = 0; index < $scope.realInsert.length; index++) {
            var item = $scope.realInsert[index];
            if (item.data_failed) {
                toastr["error"]("Dữ liệu chưa đúng!!!!");
                return false;
            }
        }
        $scope.quickCost.data = $scope.realInsert;
        $http.post(base_url + 'sale_care/ajax_quick_create_marketing_cost', $scope.quickCost).then(r => {
            if (r && r.data.status == 1) {
                toastr["success"]('Đã thêm mới ' + $scope.realInsert.length + ' hàng!.');
                $scope.getAll();
                $('#quick-creative').modal('hide');
            } else toastr["error"](r.data.messages);
        })
    }
    $scope.pasteExcel = (e) => {
        e.preventDefault();
        // $('#pasteExcel').modal('show');
        var cb;
        var clipText = '';
        if (window.clipboardData && window.clipboardData.getData) {
            cb = window.clipboardData;
            clipText = cb.getData('Text');
        } else if (e.clipboardData && e.clipboardData.getData) {
            cb = e.clipboardData;
            clipText = cb.getData('text/plain');
        } else {
            cb = e.originalEvent.clipboardData;
            clipText = cb.getData('text/plain');
        }
        var clipRows = clipText.split('\n');

        if (clipRows.length < 2 || !clipRows) {
            toastr["error"]("Vui lòng thử lại!");
            return false;
        }

        if (clipRows.length >= 100) {
            toastr["error"]("Copy ít hơn 100 dòng!");
            return false;
        }

        for (i = 0; i < clipRows.length; i++) {
            clipRows[i] = clipRows[i].split('\t');
        }

        $scope.insertArray = clipRows;
        $scope.realInsert = [];
        for (let i = 0; i < ($scope.insertArray.length - 1); i++) {
            $scope.realInsert[i] = {};
            if ($scope.insertArray[i]) {
                $scope.realInsert[i].data_failed = false;
                $scope.realInsert[i].date = $scope.insertArray[i][0];
                $scope.realInsert[i].price = $scope.insertArray[i][1];
                $scope.realInsert[i].store_id = $scope.insertArray[i][2];
                $scope.realInsert[i].source_id = $scope.insertArray[i][3];
                $scope.realInsert[i].total_inbox = $scope.insertArray[i][4];
                $scope.realInsert[i].total_phone = $scope.insertArray[i][5];
                if (!$scope.all_stores.includes($scope.insertArray[i][2]) || !$scope.all_sources.includes($scope.insertArray[i][3])) {
                    $scope.realInsert[i].data_failed = true;
                }
            }
        }
        $('#creating-modal').modal('hide');
        $('#quick-creative').modal('show');
    }
})