app.controller('sale_care_report', function($scope, $http, $sce, $compile) {
    $scope.init = () => {
        $scope.object_generating();
        $('body').addClass('sidebar-collapse');
        $scope.countChartReload = 0;
        $scope.fullRptReload = 0;
        $scope.get_tags();

        setTimeout(() => {
            $scope.getSource();
            $scope.dateInputInit();
            $scope.getAllData();
        }, 50);
        get_and_render_list(true);

        $scope.obj_search_campaign = {
            show_rs: false,
            key: '',
            list: [],
            load: false
        };
        $scope.searchCampaigns();
    }

    $scope.get_tags = () => {
        $http.get(base_url + 'sale_care/ajax_get_care_tag').then(r => {
            if (r && r.data.status == 1) {
                $scope.list_care_tag = r.data.data;
                select2();
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    $scope.getAllData = () => {
        if (!$scope.filter.date) {
            toastr["error"]("Vui lòng chọn ngày!");
            return;
        }
        var date = $scope.filter.date.split(" - ");

        if (moment(date[1], 'DD/MM/YYYY').diff(moment(date[0], 'DD/MM/YYYY'), 'days') > 31) {
            toastr["error"]("Chọn nhiều nhất một tháng !");
            return;
        }

        if (!$scope.filter.date) {
            toastr["error"]("Vui lòng chọn ngày!");
        }

        $('.bc_').css('opacity', 1);

        if (!$scope.resultTbStatus) $scope.getFullReport();
        else $scope.get_full_chart_report();
        setTimeout(() => {
            $scope.getReportData();
            //  $scope.getReportData2();
        }, 200);


    }

    $scope.object_generating = () => {
        $scope.resultTbStatus = false;
        $scope.filter = {};
        $scope.filter.consultant = '0';
        $scope.filter.camp_id = '0';
        $scope.filter.service_id = '0';
        $scope.filter.tag_id_consultant = '0';
        $scope.filter.type = 'day';

        let param_source_id = getParamsValue('source_id');
        //$scope.source_view_only = getParamsValue('source_view');
        if (param_source_id) {
            $scope.filter.source_id = JSON.parse(param_source_id);
            $(".select2.source").trigger('change.select2');
        } else $scope.filter.source_id = [];
        select2();
    }
    $scope.getFullReport = () => {
        $('.total-rp').addClass('loading');
        $scope.loading_rp = true;
        $http.get(base_url + 'sale_care/ajax_get_general_report?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r && r.data.status == 1) {
                $('.total-rp').removeClass('loading');
                $scope.loading_rp = false;
                data = r.data.data;
                data.number_import_month = parseInt(data.number_import_month, 10)
                data.number_import_month_facebook = parseInt(data.number_import_month_facebook, 10)
                data.number_import_month_zalo = parseInt(data.number_import_month_zalo, 10)
                data.number_import_new = parseInt(data.number_import_new, 10)
                data.number_import_old = parseInt(data.number_import_old, 10)
                data.number_import_care_month = parseInt(data.number_import_care_month, 10)
                data.number_import_new_care_month = parseInt(data.number_import_new_care_month, 10)
                data.number_import_old_care_month = parseInt(data.number_import_old_care_month, 10)
                data.number_import_care_last_month = parseInt(data.number_import_care_last_month, 10)
                data.number_import_new_care_last_month = parseInt(data.number_import_new_care_last_month, 10)
                data.number_import_old_care_last_month = parseInt(data.number_import_old_care_last_month, 10)
                data.number_app = parseInt(data.number_app, 10)
                data.number_app_month = parseInt(data.number_app_month, 10)
                data.number_app_new_month = parseInt(data.number_app_new_month, 10)
                data.number_app_last_month = parseInt(data.number_app_last_month, 10)
                data.number_app_new_last_month = parseInt(data.number_app_new_last_month, 10)
                data.number_app_arrival = parseInt(data.number_app_arrival, 10)
                data.number_app_arrival_month = parseInt(data.number_app_arrival_month, 10)
                data.number_app_new_arrival_month = parseInt(data.number_app_new_arrival_month, 10)
                data.number_app_new_arrival_last_month = parseInt(data.number_app_new_arrival_last_month, 10)
                data.number_invoice = parseInt(data.number_invoice, 10)
                data.number_invoice_month = parseInt(data.number_invoice_month, 10)
                data.number_invoice_new_month = parseInt(data.number_invoice_new_month, 10)
                data.number_invoice_last_month = parseInt(data.number_invoice_last_month, 10)
                data.number_invoice_new_last_month = parseInt(data.number_invoice_new_last_month, 10)
                data.total_price = parseInt(data.total_price, 10)
                data.total_month = parseInt(data.total_month, 10)
                data.total_last_month = parseInt(data.total_last_month, 10)
                data.total_new_month = parseInt(data.total_new_month, 10)
                data.total_new_last_month = parseInt(data.total_new_last_month, 10)
                data.number_customer_care_month = parseInt(data.number_customer_care_month, 10)
                $scope.overviews_data = data;
            }
        });
    }

    $scope.byhour_chart = () => {
        if (!$scope.filter.chart_hour) $scope.filter.chart_hour = false;
        $scope.filter.chart_hour = !$scope.filter.chart_hour;
        $scope.get_full_chart_report();
    }

    $scope.get_full_chart_report = () => {
        $("#myfirstchart").removeClass('noitems');
        $http.get(base_url + 'sale_care/ajax_get_general_chart_rp?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r.data.status == 1) {
                $scope.transData = r.data.data_tb;
                $scope.total_employees = r.data.total_employees;
                $('.chart-rp').removeClass('loading');
                $("#myfirstchart").empty();
                if (r.data.data.length == 0) {
                    $("#myfirstchart").addClass('noitems');
                }
                $scope.mr = new Morris.Line({
                    element: 'myfirstchart',
                    data: r.data.data,
                    xkey: 'date',
                    xLabels: 'date',
                    // yLabelFormat: function(y) {
                    //     return y != Math.round(y) ? '' : y;
                    // },
                    dataLabels: false,
                    resize: false,
                    xLabelAngle: 15,
                    ykeys: ['phone', 'care', 'appointment', 'arrived', 'invoice', 'failed'],
                    parseTime: false,
                    labels: ['SĐT', 'Lịch hẹn', 'Đã ghé', 'Hoá đơn', 'Huỷ hẹn'],
                    lineColors: [
                        '#007bff', /* primary */
                        '#17a2b8', /* info */
                        '#dc3545', /* danger */
                        '#ffc107', /* warning */
                        '#28a745', /* success */
                        '#343a40', /* dark */
                    ],
                    // barColors: ['rgb(47, 125, 246)', 'rgb(40 167 69)', 'rgb(220 53 69)', ' rgb(246, 194, 68)', 'rgb(108, 117, 125)'],
                    hoverCallback: function(index, options, content, row) {
                        var str_hover = `
                                    <div class='morris-hover-row-label'>
                                    ${row.date}
                                    </div>
                                    <div class="morris-hover-point text-left text-primary" style="font-weight:500">
                                         SĐT: ${formatNumber(row.phone)}
                                    </div>
                                    <div class="morris-hover-point text-left text-info">
                                        Lần chăm sóc: ${formatNumber(row.care)}
                                    </div>
                                    <div class="morris-hover-point text-left text-danger">
                                        Lịch hẹn: ${formatNumber(row.appointment)}
                                    </div>
                                    <div class="morris-hover-point text-left text-warning">
                                        Đã ghé: ${formatNumber(row.arrived)}
                                    </div>
                                    <div class="morris-hover-point text-left text-success" style="color: #ffc107">
                                        Hoá đơn: ${formatNumber(row.invoice)}
                                    </div>
                                    <div class="morris-hover-point text-left text-dark" style="color: #343a40">
                                    Huỷ hẹn: ${formatNumber(row.failed)}
                                     </div>
                                    </div>
                                 `;
                        return str_hover;
                    }
                });
            }
        })
    }

    $scope.handleResultTb = () => {
        $scope.resultTbStatus = !$scope.resultTbStatus;
        if ($scope.resultTbStatus) $scope.get_full_chart_report();
    }

    $scope.getSource = () => {
        $http.get(base_url + 'sale_care/get_source_p').then(r => {
            if (r && r.data.status == 1) {
                $scope.sources_pm = r.data.data;
                //$scope.getRealApp($scope.overviews_data.array_ap);
            }
        });
    }


    $scope.get_tag_rp_detail = (tag) => {
        $scope.tag_detail = tag;
        $scope.filter.tag_id = tag.id;
        $http.get(base_url + 'sale_care/ajax_get_tag_rp_detail?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r && r.data.status == 1) {
                $scope.tag_rp_detail = r.data.data;
            }
        });
    }

    $scope.getRealApp = (value) => {
        var data = {
            value: value,
            date: $scope.filter.date,
        }
        $http.post(base_url + 'sale_care/get_real_appoinment', JSON.stringify(data)).then(r => {
            console.log(r);
            if (r && r.data.status == 1) {
                $scope.rApp = r.data.data;
            }
        });
    }

    $scope.getApp = (vl) => {

        var data = {
            date: $scope.filter.date,
            value: vl,
            type: 1
        }
        $('#appModal').modal('show');
        $('.res-tablel').addClass('loading');
        $http.get(base_url + 'sale_care/get_all_appoinment?filter=' + JSON.stringify(data)).then(r => {
            $('.res-tablel').removeClass('loading');
            if (r && r.data.status == 1) {
                $scope.dataAp = r.data.data;
                $scope.otherAp = r.data.other;

            }
        });
    }
    
    $scope.getReportData = (type = 0) => {
        $('.detail-rp-load').addClass('loading');
        $scope.tag_rp_detail = {};
        $http.get(base_url + 'sale_care/ajax_get_report_data/' + type + '?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r && r.data.status == 1) {
                $('.detail-rp-load').removeClass('loading');
                if (type == 0) {
                    $('.on-blur').removeClass('on-blur');
                    $("#bar-example, #pie-chart, #week-pie-chart").empty();
                    // Report theo nguồn 
                    $scope.sources = r.data.source_rp;
                    var sourcr_rp = r.data.source_rp;
                    var sourcr_rp_data = [];
                    var sourcr_rp_color = [];
                    sourcr_rp.forEach((element, index) => {
                        sourcr_rp_data[index] = {
                            label: element.name,
                            value: element.total
                        };
                        sourcr_rp_color[index] = element.backgound_color;
                    });
                    new Morris.Donut({
                        element: 'pie-chart',
                        data: sourcr_rp_data,
                        labelColor: "#556b2f",
                        colors: sourcr_rp_color
                    });
                    $scope.invoice_rp = r.data.invoice_rp;


                    $scope.total_of_invoice_rp = {};
                    $scope.total_of_invoice_rp.booked = 0;
                    $scope.total_of_invoice_rp.ived = 0;
                    $scope.total_of_invoice_rp.total = 0;
                    $scope.total_of_invoice_rp.total_cancel = 0;
                    $scope.total_of_invoice_rp.total_cancel_backed = 0;
                    $scope.total_of_invoice_rp.total_num = 0;
                    r.data.invoice_rp.forEach(element => {
                        $scope.total_of_invoice_rp.booked += parseInt(element.booked);
                        $scope.total_of_invoice_rp.ived += parseInt(element.ived);
                        if (element.total)
                            $scope.total_of_invoice_rp.total += parseInt(element.total);
                        $scope.total_of_invoice_rp.total_cancel += parseInt(element.total_cancel);
                        $scope.total_of_invoice_rp.total_cancel_backed += parseInt(element.total_cancel_backed);
                        $scope.total_of_invoice_rp.total_num += parseInt(element.total_num);
                    });


                    $scope.care_rp = r.data.care_rp;
                    $scope.total_ofcare_rp = r.data.total_ofcare_rp;
                }
            } else toastr["error"]("Đã có lỗi xảy ra!");
        });
    }

    function formatNumber(num) {
        if (!num) {
            return 0;
        }
        num = parseInt(num);
        return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    }
    $scope.getReportData2 = () => {
        $('.chart-rp').addClass('loading');
        $http.get(base_url + 'sale_care/get_line_chart_data?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r.data.status == 1) {
                $('.chart-rp').removeClass('loading');
                $("#myfirstchart").empty();
                $scope.mr = new Morris.Line({
                    element: 'myfirstchart',
                    data: r.data.data,
                    xkey: 'time',
                    xLabels: 'time',
                    // yLabelFormat: function(y) {
                    //     return y != Math.round(y) ? '' : y;
                    // },
                    dataLabels: false,
                    resize: false,
                    xLabelAngle: 15,
                    ykeys: ['total_phone', 'total_cared', 'total_ap', 'notyet', 'total_inv'],
                    parseTime: false,
                    labels: ['Tổng', 'Đã Chăm sóc', 'Chưa chăm sóc'],
                    barColors: ['rgb(47, 125, 246)', 'rgb(83, 163, 81)', 'rgb(220, 53, 69)', ' rgb(246, 194, 68)', 'rgb(108, 117, 125)'],
                    hoverCallback: function(index, options, content, row) {
                        var str_hover = `
                                    <div class='morris-hover-row-label'>
                                    ${row.time}
                                    </div>
                                    <div class="morris-hover-point text-left text-primary" style="color: rgb(47, 125, 246);font-weight:500">
                                         Tổng: ${formatNumber(row.total_phone)}
                                    </div>
                                    <div class="morris-hover-point text-left text-success" style="color: rgb(83, 163, 81)">
                                         Đã chăm sóc: ${formatNumber(row.total_cared)}
                                    </div>
                                    <div class="morris-hover-point text-left text-danger" style="color:   rgb(220, 53, 69)">
                                         Chưa chắm sóc: ${formatNumber(row.notyet)}
                                    </div>
                                    <div class="morris-hover-point text-left text-danger" style="color:   rgb(246, 194, 68)">
                                            Đặt lịch ${formatNumber(row.total_ap)}
                                    </div>
                                    <div class="morris-hover-point text-left text-danger" style="color:   rgb(108, 117, 125)">
                                        Hóa đơn: ${formatNumber(row.total_inv)}
                                    </div>
                                    </div>
                                 `;
                        return str_hover;
                    }
                });

                function parseSVG(s) {
                    var div = document.createElementNS('http://www.w3.org/1999/xhtml', 'div');
                    div.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg">' + s + '</svg>';
                    var frag = document.createDocumentFragment();
                    while (div.firstChild.firstChild)
                        frag.appendChild(div.firstChild.firstChild);
                    return frag;
                }
                var items = $("#myfirstchart").find("svg").find("circle");
                var dem = 3;
                // $.each(items, function(index, v) {
                //     if (index >= 54) {
                //         var value = r.data.data[dem].total_phone;
                //         var newY = parseFloat($(this).attr('cy') - 30);
                //         var newX = parseFloat($(this).attr('cx'));
                //         var output = '<text style="text-anchor: middle; font: 12px sans-serif;stroke: darkgreen;" x="' + newX + '" y="' + newY + '" text-anchor="middle" font="10px &quot;Arial&quot;" stroke="none" fill="#000000" font-size="12px" font-family="sans-serif" font-weight="normal" transform="matrix(1,0,0,1,0,6.875)"><tspan dy="3.75">' + formatNumber(value) + '</tspan></text>';
                //         $("#myfirstchart").find("svg").append(parseSVG(output));
                //         dem++;
                //     }
                // });
            }
        })
    }
    $scope.setbgcolor = (color) => {
        return {
            "background-color": color
        };
    }



    function getCurrentDate() {
        var currentDate = new Date()
        var day = currentDate.getDate()
        var month = currentDate.getMonth() + 1
        var year = currentDate.getFullYear()
        return day + "/" + month + "/" + year;
    }

    function getOneYearAgo() {
        var currentDate = new Date()
        var day = currentDate.getDate()
        var month = currentDate.getMonth() + 1
        var year = currentDate.getFullYear() - 1
        return day + "/" + month + "/" + year;
    }

    function getOneMonthAgo() {
        var currentDate = new Date()
        var day = currentDate.getDate()
        var month = currentDate.getMonth() - 1

        if (month < 10) month = '0' + month;
        var year = currentDate.getFullYear()
        return day + "/" + month + "/" + year;
    }

    function select2() {
        setTimeout(() => {
            $('select2').select2({
                minimumResultsForSearch: -1,
                placeholder: function() {
                    $(this).data('placeholder');
                }
            });
        }, 100);
    }

    $scope.dateInputInit = () => {
        $('.custom-daterange2').daterangepicker({
            opens: 'right',
            alwaysShowCalendars: true,
            startDate: moment().subtract(1, 'days'),
            endDate: moment().subtract(1, 'days'),
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

    $('.custom-daterange2').daterangepicker({
        opens: 'right',
        alwaysShowCalendars: true,
        startDate: moment().subtract(1, 'days'),
        endDate: moment().subtract(1, 'days'),
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

        $scope.getAllData();
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
        $scope.getAllData();
        get_and_render_list();
    }
    //end tree group

    $scope.hideRsFilterCampaigns = () => {
        setTimeout(() => {
            $scope.obj_search_campaign.show_rs = false;
            $scope.$apply();
        }, 250)
    }

    $scope.searchCampaigns = () => {
        var key = $scope.obj_search_campaign.key ? $scope.obj_search_campaign.key : '';
        setTimeout(() => {
            $scope._searchCampaigns(key);
        }, 300);
    }

    $scope._searchCampaigns = (key) => {
        $scope.obj_search_campaign.load = true;
        $http.get(base_url + 'marketing_offlines/ajax_search_campaigns?key=' + key).then(r => {
            if (r.data.status) {
                var data = r.data.data;
                $scope.obj_search_campaign.list = data;
            } else {
                showMessErr(r.data.message);
            }
            $scope.obj_search_campaign.load = false;
        }, function (data, status, headers, config) {
            showMessErrSystem()
        });
    }

    $scope.chooseCampaign = (data) => {
        $scope.obj_search_campaign.key = '';
        
        $scope.filter.mkt_camp_id = data.id;
        $scope.filter.campaign_name = data.name;
    }

    $scope.removeChooseCampaign = () => {
        $scope.filter.mkt_camp_id = 0;
        $scope.filter.campaign_name = '';
        setTimeout(() => {
            $('#search-app').trigger('focus');
        }, 100);
    }

    $scope.resetSearch = () => {
        $scope.obj_search_campaign.key = '';
        $scope.filter.mkt_camp_id = 0;
        $scope.searchCampaigns();
    }
})