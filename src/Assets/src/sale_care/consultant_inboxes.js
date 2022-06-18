app.controller('consultant_inboxes', function ($scope, $http, $sce, $compile) {
    var pi = $scope.pagingInfo = {
        itemsPerPage: 30,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };

    $scope.init = () => {
        $scope.getStore();
        $scope.table_row = true;
        $scope.object_generating();
        $scope.countAll = 0;
        $scope.all_page = PAGES;
        $scope.countAll = 0;
        $scope.detailShow = false;
        $scope.getService();
        setTimeout(() => {
            $scope.dateInputInit();
            $scope.getAll();
        }, 10);
    }

    $scope.getService = () => {
        $http.get(base_url + 'sale_care/ajax_get_service').then(r => {
            if (r && r.data.status == 1) {
                $scope.services = r.data.data;
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    $scope.object_generating = () => {
        $scope.quickCost = {};
        $scope.filter = {};
        $scope.filter.source_id = '0';
        $scope.filter.page_id = '0';
        $scope.filter.import_id = '0';
        $scope.filter.service_id = '0';
        $scope.filter.store_id = '0';

        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;
        select2();
        $scope.resetData();
    }

    $scope.addTimeToNote = (txt) => {
        $scope.newcost.note = (($scope.newcost.note) ? $scope.newcost.note  + ' ' : '') + txt;
    }
    

    $scope.getStore = () => {
        $http.get(base_url + 'sale_care/ajax_get_stores').then(r => {
            if (r && r.data.status == 1) {
                $scope.stores = r.data.data;
                $scope.stores_ = angular.copy(r.data.data);
                $scope.stores.push({
                    id: -1,
                    name: 'Hồ Chí Minh',
                    description: 'Hồ Chí Minh'
                }, {
                    id: 0,
                    name: 'Chưa xác định',
                    description: 'Chưa xác định'
                });
                setTimeout(() => {
                    $('.select2').select2();
                }, 10);
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }
    $scope.resetData = () => {
        $scope.newcost = {};
        $scope.newcost.source_id = '0';
        $scope.newcost.page_id = '0';
        select2();
    }
    $('#creating-modal').on('hidden.bs.modal', function () {
        $scope.$apply(function () {
            $scope.resetData();
        });
    })
    $scope.bind_page_id = () => {
        if ($scope.filter.source_id == 1) {
            $scope.filter.page_id = '0';
            setTimeout(() => {
                select2();
            }, 50);
        }
    }

    $scope.getAll = () => {
        if ($scope.table_row) {
            $scope.loading = true;
            $http.get(base_url + 'sale_care/ajax_get_consultant_inboxes?filter=' + JSON.stringify($scope.filter)).then(r => {
                $scope.loading = false;
                $scope.rows = r.data.data.data;
                $scope.pagingInfo.total = r.data.data.count;
                $scope.pagingInfo.totalPage = Math.ceil(r.data.data.count / pi.itemsPerPage);
            })
        } else $scope.get_excel_table();
    }

    $scope.backex = () => {
        $scope.table_row = true;
    }
    $scope.get_excel_table = () => {
        $scope.loading = true;
        $http.get('sale_care/ajax_get_consultant_inbox_excel?filter=' + JSON.stringify($scope.filter)).then(r => {
            $scope.loading = false;
            $scope.table_row = false;
            $scope.total_tb_row = {
                ib: 0,
                no_reply: 0,
                no_reply_1st: 0,
                no_reply_2nd: 0,
                total_phone: 0,
                total_app: 0,
                total_app_arrival: 0,
                total_app_failed: 0,
                total_app_incoming: 0,
                total_app_arrival_no_invoice: 0
            }
            $scope.data_excel = r.data.data;
            angular.forEach($scope.data_excel, function (element, key) {
                element.ib = parseInt(element.ib, 10);
                element.no_reply = parseInt(element.no_reply, 10);
                element.no_reply_1st = parseInt(element.no_reply_1st, 10);
                element.no_reply_2nd = parseInt(element.no_reply_2nd, 10);
                element.total_phone = parseInt(element.total_phone, 10);
                element.total_app = parseInt(element.total_app, 10);
                element.total_app_arrival = parseInt(element.total_app_arrival, 10);
                element.total_app_failed = parseInt(element.total_app_failed, 10);
                element.total_app_incoming = parseInt(element.total_app_incoming, 10);
                element.total_app_arrival_no_invoice = parseInt(element.total_app_arrival_no_invoice, 10);

                    $scope.total_tb_row.ib += element.ib;
                    $scope.total_tb_row.no_reply += element.no_reply;
                    $scope.total_tb_row.no_reply_1st += element.no_reply_1st;
                    $scope.total_tb_row.no_reply_2nd += element.no_reply_2nd;
                    $scope.total_tb_row.total_phone += element.total_phone;
                    $scope.total_tb_row.total_app += element.total_app;
                    $scope.total_tb_row.total_app_arrival += element.total_app_arrival;
                    $scope.total_tb_row.total_app_failed += element.total_app_failed;
                    $scope.total_tb_row.total_app_incoming += element.total_app_incoming;
                    $scope.total_tb_row.total_app_arrival_no_invoice += element.total_app_arrival_no_invoice;
            });

        })
    }

    $scope.export_excel = () => {
        let data = angular.copy($scope.filter);
        data.export = true;
        window.open('sale_care/ajax_get_consultant_inbox_excel?filter=' + JSON.stringify(data), '_blank');
    }

    $scope.opendetail = (id) => {
        $scope.detailShow = true;
        $http.get(base_url + 'sale_care/ajax_get_consultant_inbox_by_id/' + id).then(r => {
            $scope.newcost = r.data.data;
            setTimeout(() => {
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

        if ($scope.newcost.source_id == 2 && !$scope.newcost.page_id) {
            toastr.error('Chưa chọn page!');
            return false;
        }
        if (!$scope.newcost.date) {
            toastr.error('Chưa nhập ngày!');
            return false;
        }

        let data = angular.copy($scope.newcost);
        data.total = data.total.replace(/,/g, "");
        data.no_reply = data.no_reply.replace(/,/g, "");
        data.no_reply_1st = data.no_reply_1st.replace(/,/g, "");
        data.no_reply_2nd = data.no_reply_2nd.replace(/,/g, "");

        $scope.createDisable = true;
        if (!$scope.detailShow) {
            $http.post(base_url + 'sale_care/ajax_create_consultant_inbox', data).then(r => {
                $scope.createDisable = false;
                if (r && r.data.status == 1) {
                    toastr["success"]('Đã thêm mới!.');
                    $scope.resetData();
                    $scope.getAll();
                } else toastr["error"](r.data.messages);
            })
        } else {
            $http.post(base_url + 'sale_care/ajax_update_consultant_inbox', data).then(r => {
                if (r && r.data.status == 1) {
                    toastr["success"]('Đã cập nhật!.');
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
        $http({
            url: base_url + '/uploads/ajax_upload_to_filehost?func=sale_care_consultant_inboxes',
            method: "POST",
            data: formData,
            headers: {
                'Content-Type': undefined
            }
        }).then(r => {
            if (r.data.status == 1) {
                $scope.newcost.files.push({
                    url_image: r.data.data[0],
                    filename: r.data.data[0],
                    file_type: fileType
                });
            } else {
                toastr["error"]('Tệp không hợp lệ!.')
            }
        })
    }
    $scope.deleteImg = (key, id) => {
        $scope.newcost.files.splice(key, 1);
    }

    $scope.setbgcolor = (color) => {
        return {
            "background-color": color
        };
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
            startDate: moment().startOf('month'),
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


    //start tree group

    $scope.open_role_md = () => {
        $('#roleMd').modal('show');
        get_and_render_list();
    }

    function get_and_render_list(first = false) {
        $http.get('sale_care/ajax_get_groups_consultants?filter=' + JSON.stringify({
            all: false,
            get_users: true
        })).then(r => {
            if (r && r.data.status == 1) {
                $scope.groups = r.data.data;
                if (first) $scope.filter.selected_group = $scope.groups[0].id;
                let html = bind_fnc($scope.groups, 1);
                $(".list-groups").empty();
                var $el = $(html).appendTo('.list-groups');
                $compile($el)($scope);
            }
        })
    }

    function bind_fnc($list, is_main = 0) {
        var html = `
            <ul class=" ${is_main == 1 ? 'main-ul' : ''} w-100">
            `;
        $list.forEach((list, key) => {
            html += `
                <li class="group-item-li pointer ${($scope.filter.selected_group == list.id) ? 'active' : ''}">
                    <div class="fth">
                        <div class="text" ng-click="select_group_item(${list.id}, $event)">
                            <div class="no">${list.obs ? list.obs.length : 0}</div>
                            <div class="name">${list.name}</div>
                        </div>
                        <div class="action" ng-click="toggle_members(${list.id}, $event)"><i class="fa fa-angle-right" aria-hidden="true"></i></div>
                    </div>
                </li>
                `;
            if (list.obs && list.obs.length > 0) {
                html += `<div class="mb ${($scope.filter.selected_parent == list.id) ? 'open' : ''} ">`;
                list.obs.forEach((element, k) => {
                    if (element.active == 1) {
                        html += `<li class="child members pointer 
                        ${(k == list.obs.length - 1) ? 'last-c' : ''} 
                        ${($scope.filter.selected_member == element.id) ? 'selected' : ''}"
                        ng-click="select_members_item(${element.id}, ${list.id},$event)">`;
                        html += `<div>${element.name}</div>`;
                        html += `</li>`;
                    }
                });
            }
            html += `</div>`
            if (list.children && list.children.length > 0) {
                html += `<li class="child">`;
                html += bind_fnc(list.children);
                html += `</li>`;
            }
        });
        html += `</ul>`;
        return html;
    }

    $scope.select_group_item = (id) => {
        $scope.filter.selected_group = id;

        delete $scope.filter.selected_member;
        delete $scope.filter.selected_parent;

        $scope.getAll();
        get_and_render_list();
    }

    $scope.toggle_members = (parent_id, event) => {
        $scope.filter.selected_parent = parent_id;
        handle_unreload_list();
    }

    function handle_unreload_list() {
        let html = bind_fnc($scope.groups, 1);
        $(".list-groups").empty();
        var $el = $(html).appendTo('.list-groups');
        $compile($el)($scope);
    }

    $scope.select_members_item = (member_id, group_id, event) => {
        $scope.filter.selected_member = member_id;
        $scope.filter.selected_parent = group_id;
        delete $scope.filter.selected_group;
        $scope.getAll();
        get_and_render_list();
    }
    //end tree group
})