app.controller('report_appmobile', function ($scope, $http) {
    $scope.init = () => {
        $('.content').css('opacity', 1);
        $scope.show = false;
        $scope.filter = {};
        $scope.data_user = {};
        $scope.filter.store_id = store_id;
        $scope.filter.date = moment().startOf('month').format("MM/DD/YYYY") + ' - ' + moment().endOf('month').format("MM/DD/YYYY");
        $scope.dateInputInit();
        // $scope.getAppUser();

        $scope.load_user = true;
        $scope.load_store = true;

        $scope.data = [
            { month: '1', value: 0 },
            { month: '2', value: 0 },
            { month: '3', value: 0 },
            { month: '4', value: 0 },
            { month: '5', value: 0 },
            { month: '6', value: 0 },
            { month: '7', value: 0 },
            { month: '8', value: 0 },
            { month: '9', value: 0 },
            { month: '10', value: 0 },
            { month: '11', value: 0 },
            { month: '12', value: 0 },
        ];
        $scope.mr = new Morris.Line({
            element: 'myfirstchart',
            data: $scope.data,
            xkey: 'month',
            xLabels: 'month',
            yLabelFormat: function (y) { return y != Math.round(y) ? '' : y; },
            ykeys: ['value'],
            parseTime: false,
            labels: ['Lượng khách hàng'],
            hoverCallback: function (index, options, content, row) {
                var str_hover = `
                         <div class='morris-hover-row-label'>
                          Tháng ${row.month + ' / ' + $scope.year}
                         </div>
                         <div class="morris-hover-point" style="color: #0b62a4">
                                Số khách hàng sử dụng:${formatNumber(row.value)}
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
        $.each(items, function (index, v) {
            var value = $scope.data[index].value;
            var newY = parseFloat($(this).attr('cy') - 20);
            var newX = parseFloat($(this).attr('cx'));
            var output = '<text style="text-anchor: middle; font: 12px sans-serif;" x="' + newX + '" y="' + newY + '" text-anchor="middle" font="10px &quot;Arial&quot;" stroke="none" fill="#000000" font-size="12px" font-family="sans-serif" font-weight="normal" transform="matrix(1,0,0,1,0,6.875)"><tspan dy="3.75">' + value + '</tspan></text>';
            $("#myfirstchart").find("svg").append(parseSVG(output));
        });
        $scope.year = moment().year();
        $scope.getMonthAppUser($scope.year);
        $scope.getStoreAppUser();
        $scope.checkShow();
    }

    function formatNumber(num) {
        if (!num) {
            return 0;
        }
        num = parseInt(num);
        return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    }
    $scope.unset = () => {
        //   filter.store_id = unidentified;

        setTimeout(() => {
            $('#store').select2('val', null);
        }, 10);
    }
    $scope.checkShow = () => {
        $scope.show = true;
        if ($scope.year == moment().year()) {
            $scope.show = false;
        }
    }
    $scope.getAppUser = () => {
        $scope.load_user = true;
        $http.get(base_url + '/statistics/ajax_get_app_user?filter=' + JSON.stringify($scope.filter)).then(r => {

            console.log(r.data.data1.total_in);

            $scope.load_user = false;

            $scope.have_date = $scope.filter.date;
            $scope.have_store = $('#store option:selected').html();
            $scope.data_user.total_in = formatNumber(r.data.data1.total_in);
            $scope.data_user.total_active_by_in = formatNumber(r.data.data1.total_active_by_in);




            // $scope.data_user.total = r.data.data2.total;
            //    $scope.data_user.total_active = r.data.data2.total_active;

            // r.data.data.forEach(element => {


            //     element.total = formatNumber(element.total);
            //     element.total_active = formatNumber(element.total_active);
            //     element.total_active_by_in = formatNumber(element.total_active_by_in);
            // });
            $scope.reportappuser = r.data.data;
        })
    }
    $scope.pre = () => {
        $scope.year = $scope.year - 1;
        $scope.checkShow();
        $scope.getMonthAppUser($scope.year);
    }
    $scope.next = () => {
        $scope.year = $scope.year + 1;
        $scope.checkShow();
        $scope.getMonthAppUser($scope.year);
    }
    $scope.getMonthAppUser = (year) => {
        $http.get(base_url + '/statistics/ajax_get_month_report_app_user/' + year).then(r => {

            $scope.data = [
                { month: '1', value: 0 },
                { month: '2', value: 0 },
                { month: '3', value: 0 },
                { month: '4', value: 0 },
                { month: '5', value: 0 },
                { month: '6', value: 0 },
                { month: '7', value: 0 },
                { month: '8', value: 0 },
                { month: '9', value: 0 },
                { month: '10', value: 0 },
                { month: '11', value: 0 },
                { month: '12', value: 0 },
            ];
            r.data.data.forEach(element => {
                $scope.data.forEach(element2 => {
                    if (element2.month == element.month) {
                        element2.value = parseInt(element.value);
                    }
                });
            });

            $scope.mr.setData($scope.data);

        })
    }
    $scope.dateInputInit = () => {
        if ($('.date').length) {
            if (typeof start === "undefined") {
                start = end = moment().format("MM/DD/YYYY");
            }
            setTimeout(() => {
                $('.date').daterangepicker({
                    opens: 'right',
                    alwaysShowCalendars: true,
                    startDate: moment().startOf('month'),
                    endDate: moment().endOf('month'),
                    ranges: {
                        'Hôm nay': [moment(), moment()],
                        'Hôm qua': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                        '7 ngày trước': [moment().subtract(6, 'days'), moment()],
                        '30 ngày trước': [moment().subtract(29, 'days'), moment()],
                        'Tháng này': [moment().startOf('month'), moment().endOf('month')],
                        'Tháng trước': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
                    }
                });
            }, 100);
        }
    }
    $scope.serchByTime = () => {
        // if(!$scope.filter.store_id || $scope.filter.store_id.length ==0){
        //     toastr.error('Vui lòng chọn ít nhất 1 chi nhánh');
        //     return;
        // }
        $("#store_report_app").empty();
        $scope.getStoreAppUser();

    }
    function formatpercent(i) {
        if (!i) {
            return 0;
        }
        return Math.round(i);
    }
    $scope.getStoreAppUser = () => {
        $scope.load_store = true;

        $http.get(base_url + '/statistics/ajax_get_store_report_app_user?filter=' + JSON.stringify($scope.filter)).then(r => {
            $scope.load_store = false;



            $scope.have_store = $('#store option:selected').html();
            if ($scope.filter.date) {
                $scope.data_user.total = r.data.total;
                $scope.data_user.total_active = formatNumber(r.data.total_active);
                $scope.data_user.total_active_in = formatNumber(r.data.total_active_in);

                $scope.data_user.new_cus = r.data.new_cus;
                $scope.data_user.new_cus_app = r.data.new_cus_app;

                var data = $scope.filter.date.split("-");
                $scope.have_date = moment(data[0].trim(' '), 'MM/DD/YYYY').format('DD/MM') + '-' + moment(data[1].trim(' '), 'MM/DD/YYYY').format('DD/MM');;
                $scope.have_date_2 = moment(data[1].trim(' '), 'MM/DD/YYYY').format('DD/MM');;

                r.data.data.forEach(element => {
                    element.total_unactive = element.total_all - element.total_active;
                    element.total_active_true = element.total_active - element.total_active_in;
                });

                $scope.ar = new Morris.Bar({
                    element: 'store_report_app',
                    data: r.data.data,
                    xkey: 'description',
                    xLabels: 'description',
                    ykeys: ['total_active_in', 'total_active_true', 'total_unactive'],
                    horizontal: true,
                    dataLabels: false,
                    stacked: true,
                    barColors: ['#01b21f', '#3c8dbc', '#ebebeb'],
                    resize: false,
                    labels: ['Số khách hàng sử dụng', 'Tổng số khách hàng không sử dụng'],
                    hoverCallback: function (index, options, content, row) {
                        var str_hover = `
                                    <div class='morris-hover-row-label'>
                                     Chi nhánh: ${row.description}
                                    </div>
                                    <div class="morris-hover-point" style="color: #000000">
                                         Tổng số khách phát sinh hóa đơn: ${formatNumber(row.total_all)}   
                                    </div>
                                    <div class="morris-hover-point" style="color: #3c8dbc">
                                    Tổng số khách sử dụng app(có hóa đơn) đến ${$scope.have_date_2}  : ${formatNumber(row.total_active)} (${formatpercent(row.total_active / row.total_all * 100)}%)
                                    </div>
                                    <div class="morris-hover-point" style="color: #666">
                                    Khách không tải app(có hóa đơn) đến ${$scope.have_date_2}: ${formatNumber(row.total_unactive)} (${formatpercent(row.total_unactive / row.total_all * 100)}%)
                                    </div>
                                    <div class="morris-hover-point" style="color: #01b21f">
                                    Khách có tải app(có hóa đơn)   ${$scope.have_date}  : ${formatNumber(row.total_active_in)} (${formatpercent(row.total_active_in / row.total_all * 100)}%)
                                    </div>
                                    <div class="morris-hover-point" style="color: #666">
                                    Tổng số khách không sử dụng app(có hóa đơn) ${$scope.have_date}  : ${formatNumber(row.total_all - row.total_active_in)} (${formatpercent((row.total_all - row.total_active_in) / row.total_all * 100)}%)
                                    </div>
                                 `;
                        return str_hover;
                    }
                });

                setTimeout(() => {

                    function parseSVG(s) {

                        var div = document.createElementNS('http://www.w3.org/1999/xhtml', 'div');

                        div.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg">' + s + '</svg>';

                        var frag = document.createDocumentFragment();

                        while (div.firstChild.firstChild)

                            frag.appendChild(div.firstChild.firstChild);

                        return frag;

                    }



                    var items = $("#store_report_app").find("svg").find("rect");

                    count = 0;

                    count2 = 0;

                    $.each(items, function (index, v) {

                        var dem = index + 1;

                        if (dem % 3 == 0) {



                            var value = r.data.data[count].total_all;

                            var newY = parseFloat($(this).attr('y')) + parseFloat($(this).attr('height')) / 4;



                            var newX = parseFloat($(this).attr('x')) + parseFloat($(this).attr('width')) + 30;



                            var output = '<text style="text-anchor: middle; font: 12px sans-serif;" x="' + newX + '" y="' + newY + '" text-anchor="middle" font="10px &quot;Arial&quot;" stroke="none" fill="#000000" font-size="12px" font-family="sans-serif" font-weight="normal" transform="matrix(1,0,0,1,0,6.875)"><tspan dy="3.75">' + formatNumber(value) + '</tspan></text>';

                            $("#store_report_app").find("svg").append(parseSVG(output));

                            count++;

                        }

                    });

                }, 700);

            } else {
                $scope.have_date = undefined;
                $scope.have_date_2 = undefined;

                $scope.data_user.total = formatNumber(r.data.total);
                $scope.data_user.total_active = formatNumber(r.data.total_active);



                r.data.data.forEach(element => {
                    element.total_unactive = element.total_all - element.total_active;
                });

                $scope.ar = new Morris.Bar({
                    element: 'store_report_app',
                    data: r.data.data,
                    xkey: 'description',
                    xLabels: 'description',
                    ykeys: ['total_active', 'total_unactive'],
                    horizontal: true,
                    dataLabels: false,
                    stacked: true,
                    barColors: ['#3c8dbc', '#ebebeb'],
                    resize: false,
                    labels: ['Số khách hàng sử dụng', 'Tổng số khách hàng không sử dụng'],
                    hoverCallback: function (index, options, content, row) {
                        var str_hover = `
                                    <div class='morris-hover-row-label'>
                                     Chi nhánh: ${row.description}
                                    </div>
                                    <div class="morris-hover-point" style="color: #000000">
                                         Tổng số khách : ${formatNumber(row.total_all)}   
                                    </div>
                                    <div class="morris-hover-point" style="color: #3c8dbc">
                                    Tổng số khách sử dụng app : ${formatNumber(row.total_active)} (${formatpercent(row.total_active / row.total_all * 100)}%)
                                  </div>
                                 
                                  <div class="morris-hover-point" style="color: #666">
                                  Tổng số khách không sử dụng app: ${formatNumber(row.total_unactive)} (${formatpercent(row.total_unactive / row.total_all * 100)}%)
                                </div>
                                 `;
                        return str_hover;
                    }
                });

                setTimeout(() => {

                    function parseSVG(s) {

                        var div = document.createElementNS('http://www.w3.org/1999/xhtml', 'div');

                        div.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg">' + s + '</svg>';

                        var frag = document.createDocumentFragment();

                        while (div.firstChild.firstChild)

                            frag.appendChild(div.firstChild.firstChild);

                        return frag;

                    }



                    var items = $("#store_report_app").find("svg").find("rect");

                    count = 0;

                    count2 = 0;

                    $.each(items, function (index, v) {

                        var dem = index + 1;

                        if (dem % 2 == 0) {



                            var value = r.data.data[count].total_all;

                            var newY = parseFloat($(this).attr('y')) + parseFloat($(this).attr('height')) / 4;



                            var newX = parseFloat($(this).attr('x')) + parseFloat($(this).attr('width')) + 30;



                            var output = '<text style="text-anchor: middle; font: 12px sans-serif;" x="' + newX + '" y="' + newY + '" text-anchor="middle" font="10px &quot;Arial&quot;" stroke="none" fill="#000000" font-size="12px" font-family="sans-serif" font-weight="normal" transform="matrix(1,0,0,1,0,6.875)"><tspan dy="3.75">' + formatNumber(value) + '</tspan></text>';

                            $("#store_report_app").find("svg").append(parseSVG(output));

                            count++;

                        }

                    });

                }, 700);
            }








        })
    }
});