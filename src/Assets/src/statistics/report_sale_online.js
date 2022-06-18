


var app = angular.module('app', ['chart.js']);

app.controller('report_online', function ($scope, $http, $filter) {

    var pi = $scope.pagingInfo = {
        itemsPerPage: 30,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };


    $scope.init = () => {

        $scope.filter = {};
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;
        $scope.filter.type_date = 'finish_time';
        $scope.filterProduct = {};
        setDefaultDate();
        $scope.isView = 1;
        $scope.stores = stores;

        $scope.isClick = 'ALL';
        $scope.isUser = 'ALL';
        $scope.isShipper = 'ALL';
        $scope.isType = 'ALL';
        $scope.viewInvoice = false;
        $scope.getCustomerType();
        setTimeout(() => {
            $scope.mr = new Morris.Line({
                element: 'myfirstchart',
                data: [],
                xkey: 'month',
                xLabels: 'month',
                yLabelFormat: function (y) { return $filter('number')(y) + ' đ'; },
                ykeys: ['value'],
                parseTime: false,
                labels: ['Doanh số'],
            });
            $scope.handlerFilter();
        }, 200);

        select2();
        setTimeout(() => {
            setDefaultDate();
        }, 100);
        $scope.status = [-1, 1, 2, 3, 4, 5];

        $scope.getAllShipper();
    }

    $scope.getCustomerType = () => {
        $http.get(base_url + 'customers/ajax_get_customer_types').then(r => {
            if (r.data && r.data.status) {
                $scope.customerTypes = r.data.data;
            } else {
                showMessErr('Không lấy được danh sách nhà vận chuyển');
            }
        }, function (data, status, headers, config) {
            showMessErr('Không lấy được danh sách nhà vận chuyển');
        });
    }

    $scope.changeView = (val) => {
        if ($scope.isView != val) {
            $scope.isView = val;
            $scope.ressetLimitPage();
            if (val == 4) {
                $scope.getReportProductGroup();
                return;
            }
            if (val == 3) {
                $scope.getReportCTV();
            } else $scope.handlerFilter();
        }
    }

    $scope.ressetLimitPage = () => {
        $scope.filter.limit = 30;
        $scope.filter.offset = $scope.pagingInfo.offset = 0;
        $scope.pagingInfo.currentPage = 1;
    }

    function getColor(isReverse, data) {
        $scope.colorDefault = ["#b79419", "#d7df47", "#4de47c", "#726dd3", "#d54c69", "#5a1632", "#605481", "#b18b9c", "#df49ed", "#f54fc6", "#a9d1da", "#83ad05", "#1a09f5", "#cf33d9", "#d641a8", "#bba638", "#ca6e1a", "#b91314", "#5b82f3", "#d9ce5", "#162db0", "#9881f0", "#522750", "#8afd97", "#c91fe2", "#9a9585"];
        if (data.length > $scope.colorDefault.length) {
            $scope.colorDefault = $scope.colorDefault.concat(getRandomColor());
        }
        return $scope.colorDefault;
        // return isReverse ? $scope.colorDefault.reverse() : $scope.colorDefault;
    }

    function select2() {
        setTimeout(() => {
            $(".select2xl").select2({
                placeholder: "Người xử lí",
            });
            $(".select2shiper").select2({
                placeholder: "Đơn vị vận chuyển"
            })
            $(".select2type").select2({
                placeholder: "Loại khách hàng"
            });
            $(".select_st").select2({
                placeholder: "Chi nhánh"
            });
        }, 100);
    }

    $scope.getAllShipper = () => {
        $scope.all_shippers = [];
        $http.get(base_url + 'warehouse_shipper/ajax_get_all_shipper').then(r => {
            if (r.data && r.data.status) {
                $scope.all_shippers = r.data.data;
            } else {
                showMessErr('Không lấy được danh sách nhà vận chuyển');
            }
        }, function (data, status, headers, config) {
            showMessErr('Không lấy được danh sách nhà vận chuyển');
        });
    }

    $scope.viewListInvoice = () => {
        $scope.viewInvoice = !$scope.viewInvoice;
        if ($scope.viewInvoice) {
            $scope.filter.offset = $scope.pagingInfo.offset = 0;
            $scope.pagingInfo.currentPage = 1;
            $scope.getAll();
        }
    }

    $scope.handlerFilter = () => {
        $scope.filter.offset = $scope.pagingInfo.offset = 0;
        $scope.pagingInfo.currentPage = 1;

        if ($scope.isView == 4) {
            $scope.getAll();
            $scope.getReportProductGroup();
            return;
        }

        if ($scope.isView == 3) {
            $scope.getReportCTV();
            return;
        }

        if ($scope.isView == 1) {
            $scope.isClick = 'ALL';
            $scope.isShipper = 'ALL';
            $scope.isUser = 'ALL';
            $scope.getReportStatus();
            $scope.getReportShipper();
            $scope.getReportHandler();
            $scope.getReportDay();
        } else {
            $scope.isType = 'ALL';
            $scope.isClick = 'ALL';
            $scope.getReportStatus();
            $scope.getReportType();
        }
        $scope.getAll();
        select2();
    }

    function getPercent(total, val) {
        let per = Number(total) == 0 ? 0 : (Number(val) / Number(total)) * 100;
        return per.toFixed(2);
    }

    $scope.filterData = (val, type) => {
        if (type == 'status') {
            $scope.filter.ship_status_id = val;
            $scope.isClick = val;
            $scope.getReportHandler();
            $scope.getReportShipper();
            $scope.getAll();
        }

        if (type == 'handler') {
            $scope.filter.handler_ids = [val];
            $scope.isUser = val;
            $scope.getReportShipper();
            $scope.getReportStatus();
            $scope.getAll();
        }

        if (type == 'shipper') {
            $scope.filter.shipper_ids = [val];
            $scope.isShipper = val;
            $scope.getReportHandler();
            $scope.getReportStatus();
            $scope.getAll();
        }

        if (type == 'type') {
            $scope.isType = val;
            $scope.filter.type_ids = [val];
            $scope.getReportStatus();
        }

        select2();
    }


    $scope.clickChart = (points, evt) => {
        let index = $scope.dataChart.labels.findIndex(r => { if (points[0] && points[0]._view.label) { return r == points[0]._view.label; } });
        if (index >= 0) $scope.filterData($scope.dataChart.status[index], 'status');
    }

    $scope.clickChartHandler = (points, evt, status) => {
        let index = $scope.dataHandler.labels.findIndex(r => { if (points[0] && points[0]._view.label) { return r == points[0]._view.label; } });
        if (index >= 0) $scope.filterData('handler', $scope.dataHandler.ids[index]);
    }

    $scope.clickChartShipper = (points, evt, isAll) => {
        let index = $scope.dataChartShip.labels.findIndex(r => { if (points[0] && points[0]._view.label) { return r == points[0]._view.label; } });
        if (index >= 0) $scope.filterData($scope.dataChartShip.shippers[index], 'shipper');
    }

    $scope.clickChartType = (points, evt) => {
        let index = $scope.dataChartType.labels.findIndex(r => { if (points[0] && points[0]._view.label) { return r == points[0]._view.label; } });
        if (index >= 0) $scope.filterData($scope.dataHandler.ids[index], 'type');
    }

    $scope.loadChartStatus = () => {
        if ($scope.total) {
            $scope.dataChart = {
                labels: ["Đơn hủy", "Chờ lấy hàng", "Đang giao hàng", "Đã chuyển hoàn", "Đã đối soát", "Giao hàng thành công"],
                data: [
                    $scope.total.num_cancel ? $scope.total.num_cancel : 0,
                    $scope.total.num_wait ? $scope.total.num_wait : 0,
                    $scope.total.num_delivery ? $scope.total.num_delivery : 0,
                    $scope.total.num_return ? $scope.total.num_return : 0,
                    $scope.total.num_ds ? $scope.total.num_ds : 0,
                    $scope.total.num_success ? $scope.total.num_success : 0
                ],
                percent: [
                    getPercent($scope.total.num_invoice, $scope.total.num_cancel),
                    getPercent($scope.total.num_invoice, $scope.total.num_wait),
                    getPercent($scope.total.num_invoice, $scope.total.num_delivery),
                    getPercent($scope.total.num_invoice, $scope.total.num_return),
                    getPercent($scope.total.num_invoice, $scope.total.num_ds),
                    getPercent($scope.total.num_invoice, $scope.total.num_success)
                ],
                amount: [
                    $scope.total.total_cancel,
                    $scope.total.total_wait,
                    $scope.total.total_delivery,
                    $scope.total.total_return,
                    $scope.total.total_ds,
                    $scope.total.total_success
                ],
                status: [
                    -1, 1, 2, 3, 4, 5
                ],
                colors: [
                    '#dd4b39',
                    '#f39c12',
                    '#3c8dbc',
                    '#FF4500',
                    '#00a65a',
                    '#00c0ef'
                ],
                options: {
                    responsive: true,
                    title: {
                        display: true,
                        text: 'Tỉ lệ đơn hàng theo trạng thái'
                    }
                }
            }
        }
    }

    $scope.loadChartHandler = () => {
        if ($scope.totalHandlers) {
            $scope.dataHandler = {
                ids: [],
                labels: [],
                data: [],
                percent: [],
                colors: [],
                users: [],
                options: {
                    responsive: true,
                    title: {
                        display: true,
                        text: 'Tỉ lệ đơn hàng theo người xử lí'
                    },
                    legend: {
                        display: false
                    },
                    layout: {
                        padding: {
                            left: 0
                        }
                    }
                }
            }
            $scope.totalHandler = $scope.totalHandlers.reduce(function (p, c) { return p + Number(c.num_invoice) }, 0);
            $scope.totalPriceHandler = 0;
            let colors = getColor(false, $scope.totalHandlers);
            $scope.totalHandlers.forEach((e, key) => {
                $scope.totalPriceHandler += Number(e.total_price)
                $scope.dataHandler.data.push(e.num_invoice);
                let name = e.handler_id > 0 ? e.handler_name : 'Đơn Chưa Xử Lý';
                $scope.dataHandler.labels.push(name);
                $scope.dataHandler.colors.push(colors[key]);
                $scope.dataHandler.ids.push(e.handler_id);
                $scope.dataHandler.users.push({
                    total_price: e.total_price,
                    percent: getPercent($scope.totalHandler, e.num_invoice),
                    id: e.handler_id,
                    name: name,
                    handler_url: e.handler_url
                });
            });
        }
    }

    $scope.loadChartShipper = () => {
        if ($scope.totalShipers) {
            $scope.dataChartShip = {
                labels: [],
                data: [],
                colors: [],
                shippers: [],
                options: {
                    responsive: true,
                    title: {
                        display: true,
                        text: 'Tỉ lệ đơn hàng theo Shipper'
                    },
                    legend: {
                        display: false
                    },
                    layout: {
                        padding: {
                            left: 0
                        }
                    }
                }
            };
            $scope.totalShipper = $scope.totalShipers.reduce(function (p, c) { return p + Number(c.num_invoice) }, 0);
            $scope.totalPriceShiper = 0;
            let colorRv = getColor(true, $scope.totalShipers);
            $scope.totalShipers.forEach((e, key) => {
                e.percent = getPercent($scope.totalShipper, e.num_invoice)
                e.name = e.shipper_id > 0 ? e.name : 'Đơn chưa gán shipper';
                $scope.totalPriceShiper += Number(e.total_price)
                $scope.dataChartShip.data.push(e.num_invoice);
                $scope.dataChartShip.labels.push(e.name);
                $scope.dataChartShip.colors.push(colorRv[key]);
                $scope.dataChartShip.shippers.push(e);
            });
        }
    }

    $scope.loadChartType = () => {
        if ($scope.totalTypes) {
            $scope.dataChartType = {
                labels: [],
                data: [],
                colors: [],
                cusTypes: [],
                options: {
                    responsive: true,
                    title: {
                        display: true,
                        text: 'Tỉ lệ đơn hàng theo loại khách hàng'
                    },
                    legend: {
                        display: false
                    },
                    layout: {
                        padding: {
                            left: 0
                        }
                    }
                }
            };
            $scope.totalType = $scope.totalTypes.reduce(function (p, c) { return p + Number(c.num_invoice) }, 0);
            $scope.totalPriceType = 0;
            let colorRv = getColor(true, $scope.totalTypes);

            $scope.totalTypes.forEach((e, key) => {
                e.percent = getPercent($scope.totalType, e.num_invoice)
                $scope.totalPriceShiper += Number(e.total_price)
                $scope.dataChartType.data.push(Number(e.num_invoice));
                $scope.dataChartType.labels.push(e.name);
                $scope.dataChartType.colors.push(colorRv[key]);
                $scope.dataChartType.cusTypes.push(e);
            });
        }
    }

    $scope.loadChartDay = () => {
        $scope.mr.setData($scope.totalDays);
    }

    function setDefaultDate() {
        $scope.filter.date = moment().format('01/MM/YYYY') + ' - ' + moment().format('DD/MM/YYYY')
    }

    function getFormatDataFilter() {
        let d1 = $scope.filter.date.split('-')[0].trim();
        let d2 = d1.split('/');
        let d3 = $scope.filter.date.split('-')[1].trim();
        let d4 = d3.split('/');
        $scope.filter.start_date = d2[2] + '-' + d2[1] + '-' + d2[0];
        $scope.filter.end_date = d4[2] + '-' + d4[1] + '-' + d4[0];

        let import_ids = $('#data_user_id').val();
        $scope.filter.import_ids = import_ids ? JSON.parse(import_ids) : [];
    }

    $scope.getReportStatus = () => {
        getFormatDataFilter();
        $scope.loading = true;
        $http.get(base_url + '/statistics/ajax_get_report_sale_online_by_status?filter=' + JSON.stringify(convertFilter())).then(r => {
            if (r && r.data.status == 1) {
                $scope.total = r.data.total;
                $scope.loadChartStatus();
            } else toastr["error"]("Đã có lỗi xẩy ra!");
            $scope.loading = false;
        })
    }

    function convertFilter() {
        let ft = angular.copy($scope.filter);
        if (ft.handler_ids && ft.handler_ids.find(r => { return r == 'ALL'; })) {
            ft.handler_ids = [];
        }
        if (ft.ship_status_id == 'ALL') {
            ft.ship_status_id = '';
        }
        if (ft.shipper_ids && ft.shipper_ids.find(r => { return r == 'ALL' })) {
            ft.shipper_ids = [];
        }
        if (ft.type_ids && ft.type_ids.find(r => { return r == 'ALL' })) {
            ft.type_ids = [];
        }
        return ft;
    }


    $scope.getReportHandler = () => {
        getFormatDataFilter();
        $scope.loading = true;
        $http.get(base_url + '/statistics/ajax_get_report_sale_online_by_handlers?filter=' + JSON.stringify(convertFilter())).then(r => {
            if (r && r.data.status == 1) {
                $scope.totalHandlers = r.data.total_handlers;
                $scope.loadChartHandler();
            } else toastr["error"]("Đã có lỗi xẩy ra!");
            $scope.loading = false;

        })
    }

    $scope.getReportShipper = () => {
        getFormatDataFilter();
        $scope.loading = true;
        $http.get(base_url + '/statistics/ajax_get_report_sale_online_by_shippers?filter=' + JSON.stringify(convertFilter())).then(r => {
            if (r && r.data.status == 1) {
                $scope.totalShipers = r.data.total_shippers
                $scope.loadChartShipper();
            } else toastr["error"]("Đã có lỗi xẩy ra!");
            $scope.loading = false;
        })
    }

    $scope.getReportType = () => {
        getFormatDataFilter();
        $scope.loading = true;
        $http.get(base_url + '/statistics/get_report_by_customer_type?filter=' + JSON.stringify(convertFilter())).then(r => {
            if (r && r.data.status == 1) {
                $scope.totalTypes = r.data.total_customer_type
                $scope.loadChartType();
            } else toastr["error"]("Đã có lỗi xẩy ra!");
            $scope.loading = false;
        })
    }

    $scope.getReportCTV = () => {
        getFormatDataFilter();
        $scope.loading = true;
        $http.get(base_url + '/staffs/ajax_report_collaborators?' + $.param(convertFilter())).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.rows = r.data.data;
                $scope.rows.forEach(e => {
                    e.total_price = Number(e.total.total_invoice);
                });
                $scope.rows.sort((a, b) => parseFloat(b.total_price) - parseFloat(a.total_price));;

                $scope.totalCollaborators = r.data.total;
                $scope.loading = false;
                $scope.loadChartCollaborators();
            } else {
                toastr.error('có lỗi xẩy ra. Vui lòng thử lại sau')
            }
        })
    }

    $scope.loadChartCollaborators = () => {
        $scope.dataChartCollaboratorStatus = {
            labels: ["Chờ lấy hàng", "Đang giao hàng", "Đã chuyển hoàn", "Đã đối soát", "Giao hàng thành công"],
            data: [
                $scope.totalCollaborators.count_status_1 ? $scope.totalCollaborators.count_status_1 : 0,
                $scope.totalCollaborators.count_status_2 ? $scope.totalCollaborators.count_status_2 : 0,
                $scope.totalCollaborators.count_status_3 ? $scope.totalCollaborators.count_status_3 : 0,
                $scope.totalCollaborators.count_status_4 ? $scope.totalCollaborators.count_status_4 : 0,
                $scope.totalCollaborators.count_status_5 ? $scope.totalCollaborators.count_status_5 : 0
            ],
            percent: [
                getPercent($scope.totalCollaborators.number_invoice_online, $scope.totalCollaborators.count_status_1),
                getPercent($scope.totalCollaborators.number_invoice_online, $scope.totalCollaborators.count_status_2),
                getPercent($scope.totalCollaborators.number_invoice_online, $scope.totalCollaborators.count_status_3),
                getPercent($scope.totalCollaborators.number_invoice_online, $scope.totalCollaborators.count_status_4),
                getPercent($scope.totalCollaborators.number_invoice_online, $scope.totalCollaborators.count_status_5)
            ],
            amount: [
                $scope.totalCollaborators.total_status_1,
                $scope.totalCollaborators.total_status_2,
                $scope.totalCollaborators.total_status_3,
                $scope.totalCollaborators.total_status_4,
                $scope.totalCollaborators.total_status_5
            ],
            status: [
                1, 2, 3, 4, 5
            ],
            colors: [
                '#f39c12',
                '#3c8dbc',
                '#FF4500',
                '#00a65a',
                '#00c0ef'
            ],
            options: {
                responsive: true,
                title: {
                    display: true,
                    text: 'Tỉ lệ đơn hàng theo trạng thái'
                }
            }
        }

        $scope.dataChartCollaboratorType = {
            labels: ["Đơn Online", "Đơn Offline", "Đơn hoàn"],
            data: [
                $scope.totalCollaborators.number_invoice_online ? $scope.totalCollaborators.number_invoice_online : 0,
                $scope.totalCollaborators.number_invoice_offline ? $scope.totalCollaborators.number_invoice_offline : 0,
                $scope.totalCollaborators.number_invoice_return ? $scope.totalCollaborators.number_invoice_return : 0
            ],
            percent: [
                getPercent($scope.totalCollaborators.number_invoice, $scope.totalCollaborators.number_invoice_online),
                getPercent($scope.totalCollaborators.number_invoice, $scope.totalCollaborators.number_invoice_offline),
                getPercent($scope.totalCollaborators.number_invoice, $scope.totalCollaborators.number_invoice_return)
            ],
            colors: [
                '#f39c12',
                '#3c8dbc',
                '#FF4500'
            ],
            options: {
                responsive: true,
                title: {
                    display: true,
                    text: 'Tỉ lệ đơn hàng theo loại hóa đơn'
                }
            }
        }
    }

    $scope.getAll = () => {
        $scope.rows = [];
        if ($scope.isView != 4) {
            if (!$scope.viewInvoice) return;
            getFormatDataFilter();
            $scope.loadingData = true;
            let url = $scope.isView == 1 ? '/statistics/get_list_invoice_online' : '/statistics/get_list_report_customers';
            $http.get(base_url + url + '?filter=' + JSON.stringify(convertFilter())).then(r => {
                if (r && r.data.status == 1) {
                    $scope.rows = r.data.data;
                    $scope.pagingInfo.total = r.data.count;
                    $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
                    $scope.load_data = false;
                } else toastr["error"]("Đã có lỗi xẩy ra!");
                $scope.loadingData = false;
            })
        } else {
            $scope.getReportTopProduct();
        }
    }

    $scope.getReportDay = () => {
        getFormatDataFilter();
        $scope.loading = true;
        $http.get(base_url + '/statistics/get_report_online_by_date?filter=' + JSON.stringify(convertFilter())).then(r => {
            if (r && r.data.status == 1) {
                $scope.totalDays = r.data.data;
                $scope.mr.setData($scope.totalDays.map(r => { return { month: r.label, value: r.total_price }; }));
            } else toastr["error"]("Đã có lỗi xẩy ra!");
            $scope.loading = false;
        })
    }

    function getRandomColor() {
        let cls = [];
        for (let index = 0; index < 20; index++) {
            const randomColor = Math.floor(Math.random() * 16777215).toString(16);
            let color = "#" + randomColor;
            cls.push(color);
        }
        return cls;
    }

    $scope.geStatusShip = (id) => {
        id = parseInt(id);
        var obj_return = {
            name: '',
            class_name: ''
        };
        switch (id) {
            case -1:
                obj_return = {
                    name: 'Hủy',
                    class_name: 'label-danger',
                    text_color: 'text-danger'
                }
                break;
            case 1:
                obj_return = {
                    name: 'Chờ lấy hàng',
                    class_name: 'label-warning',
                    text_color: 'text-warning'
                }
                break;

            case 2:
                obj_return = {
                    name: 'Đang giao hàng',
                    class_name: 'label-primary',
                    text_color: 'text-primary'
                }
                break;

            case 3:
                obj_return = {
                    name: 'Đã chuyển hoàn',
                    class_name: 'label-danger',
                    text_color: 'text-danger'
                }
                break;

            case 4:
                obj_return = {
                    name: 'Đã đối soát',
                    class_name: 'label-success',
                    text_color: 'text-success'
                }
                break;
            case 5:
                obj_return = {
                    name: 'Giao thành công',
                    class_name: 'label-info',
                    text_color: 'text-info'
                }
                break;

            default:
                obj_return = {
                    name: 'Không xác định',
                    class_name: 'label-default',
                    text_color: 'text-default'
                }
                break;
        }
        return obj_return;
    }

    $scope.formatDate = (date, fm) => {
        return moment(date).format(fm ? fm : 'DD-MM-YYYY');
    }

    $scope.openHistory = (id) => {
        window.open(base_url + '/customers/history/' + id);
    }

    $scope.showModalListInvoiceVisa = (_value) => {
        var item = angular.copy(_value);
        $scope.obj_list_invoice_visa = {
            load: true,
            invoice_choose: item,
            choose_code: '',
            choose_image: '',
            list_mpos: [],
            list_vnpay: [],
            list_bank: [],
        }
        $('#modal_invoice_visa').modal('show');
        $http.get(base_url + '/invoice_new/ajax_get_invoice_visa_by_invoice_id?invoice_id=' + item.id).then(r => {
            if (r.data && r.data.status) {
                var list = r.data.data,
                    mpos = [],
                    vnpays = [],
                    banks = [],
                    choose_default = '';
                $.each(list, function (key, value) {
                    if (value.type == 1) {
                        mpos.push(value);
                    } else if (value.bank_id == 9) {
                        vnpays.push(value);
                    } else {
                        if (value.type == 2) value.trans_code_edit = '';
                        banks.push(value);
                    }
                });

                if (mpos.length) {
                    choose_default = 'mpos';
                } else if (vnpays.length) {
                    choose_default = 'vnpay';
                } else {
                    choose_default = 'bank'
                }

                $scope.obj_list_invoice_visa.list_mpos = mpos;
                $scope.obj_list_invoice_visa.list_vnpay = vnpays;
                $scope.obj_list_invoice_visa.list_bank = banks;

                $scope.chooseItemShowVisa(choose_default, 0);
            } else {
                showMessErr(r.data.message);
            }
            $scope.obj_list_invoice_visa.load = false;
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope.checkShowUrlImageVisa = checkShowUrlImageVisa;

    $scope.chooseItemShowVisa = (type, key) => {
        $scope.obj_list_invoice_visa.choose_code = '';
        $scope.obj_list_invoice_visa.choose_image = '';
        $scope.obj_list_invoice_visa.list_mpos.filter(x => x.current_choose = false);
        $scope.obj_list_invoice_visa.list_vnpay.filter(x => x.current_choose = false);
        $scope.obj_list_invoice_visa.list_bank.filter(x => x.current_choose = false);
        if (type == 'mpos') {
            $scope.obj_list_invoice_visa.list_mpos[key].current_choose = true;
            $scope.obj_list_invoice_visa.choose_code = $scope.obj_list_invoice_visa.list_mpos[key].value;
        } else if (type == 'vnpay') {
            $scope.obj_list_invoice_visa.list_vnpay[key].current_choose = true;
            $scope.obj_list_invoice_visa.choose_code = $scope.obj_list_invoice_visa.list_vnpay[key].value;
        } else {
            $scope.obj_list_invoice_visa.list_bank[key].current_choose = true;
            var _bank = angular.copy($scope.obj_list_invoice_visa.list_bank[key]);
            if (_bank.type == 2) {
                $scope.obj_list_invoice_visa.choose_image = _bank.value;
            } else {
                $scope.obj_list_invoice_visa.choose_code = _bank.value;
            }
        }
    }


    $scope.openDetailCollaborators = (item) => {
        getFormatDataFilter();
        let ft = convertFilter();
        window.open(base_url + `/staffs/sale_user?is_view=2&main_store_id=${item.main_store_id}&customer_id=${item.customer_id}&date_start=${ft.start_date}&end_date=${ft.end_date}`);
    }

    //--------PRODUCT REPORT

    $scope.getReportProductGroup = () => {
        getFormatDataFilter();
        $scope.loading = true;
        let ft = {
            start_date: $scope.filter.start_date,
            end_date: $scope.filter.end_date,
            type_date: $scope.filter.type_date,
            store_ids: $scope.filter.store_ids
        };
        $http.get(base_url + '/statistics/ajax_get_total_group_product?filter=' + JSON.stringify(ft)).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.groupProduct = r.data.data;
                for (let key = 0; key < $scope.groupProduct.length; key++) {
                    let sums = getTotalChild($scope.groupProduct, $scope.groupProduct[key], key);
                    $scope.groupProduct[key].total_product_sale = sums.total_product_sale;
                    $scope.groupProduct[key].total_product_return = sums.total_product_return;
                    $scope.groupProduct[key].quantity_sale = sums.quantity_sale;
                    $scope.groupProduct[key].quantity_return = sums.quantity_return;
                    $scope.groupProduct[key].quantity = sums.quantity;
                    $scope.groupProduct[key].total = sums.total;
                    $scope.groupProduct[key].group_ids = sums.group_ids;
                }
                $scope.loading = false;
            } else {
                toastr.error('có lỗi xẩy ra. Vui lòng thử lại sau')
            }
        })
    }

    $scope.getReportTopProduct = () => {
        getFormatDataFilter();
        $scope.filterProduct.start_date = $scope.filter.start_date;
        $scope.filterProduct.end_date = $scope.filter.end_date;
        $scope.filterProduct.type_date = $scope.filter.type_date;
        $scope.filterProduct.store_ids =$scope.filter.store_ids
        $scope.filterProduct.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filterProduct.offset = $scope.pagingInfo.offset;

        $scope.loading = true;
        $http.get(base_url + '/statistics/ajax_get_top_sale_product?filter=' + JSON.stringify($scope.filterProduct)).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.loading = false;
                $scope.rows = r.data.data;
                $scope.pagingInfo.total = r.data.count;
                $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
            } else {
                toastr.error('có lỗi xẩy ra. Vui lòng thử lại sau')
            }
        })
    }

    $scope.filterProductByGroups = (group_ids) => {
        $scope.filterProduct.group_product_ids = group_ids;
        $scope.filterProduct.limit = 20;
        $scope.filterProduct.offset = 0;
        $scope.getReportTopProduct();
    }

    function getTotalChild(groupProduct, current, key) {
        let data = [];
        let keystop = (key + 1 == groupProduct.length) ? true : false;
        for (let index = key; index < groupProduct.length + key; index++) {
            if (groupProduct[index]) data.push(groupProduct[index]);
            if (keystop) {
                break;
            } else {
                if (groupProduct[index + 1] && groupProduct[index + 1].level <= current.level) break;
            }
        }
        let total_sale = total_return = total = 0;
        let quantity_sale = quantity_return = quantity = 0;
        let group_ids = [];
        data.forEach(e => {
            if (e.total_product_sale) total_sale += Number(e.total_product_sale);
            if (e.total_product_return) total_return += Number(e.total_product_return);
            if (e.quantity_sale) quantity_sale += Number(e.quantity_sale);
            if (e.quantity_return) quantity_return += Number(e.quantity_return);
            if (e.quantity) quantity += Number(e.quantity);
            if (e.total) total += Number(e.total);
            group_ids.push(e.group_id);
        });

        return {
            total_product_sale: total_sale,
            total_product_return: total_return,
            total: total,
            quantity_sale: quantity_sale,
            quantity_return: quantity_return,
            quantity: quantity,
            group_ids: group_ids
        }
    }

    $scope.getNameCategory = (value) => {
        let tmp = value ? treeRender(value.level, value.name) : '';
        return tmp;
    }



    //paging
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


app.filter('safeHtml', function ($sce) {
    return function (val) {
        return $sce.trustAsHtml(val);
    };
});
