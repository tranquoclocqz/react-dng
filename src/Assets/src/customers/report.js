app.controller('report', function ($scope, $http) {
    $scope.init = () => {
        $scope.show = false;
        $scope.load = true;
        $scope.report = {};
        $scope.filter = {};
        $scope.start = moment().format('MM-DD-YYYY');
        $scope.end = moment().format('MM-DD-YYYY');
        $scope.getComlains();
        $scope.t1 = 0;
        $scope.t2 = 0;
        $scope.t3 = 0;
        $scope.t4 = 0;
        $scope.t0 = 0;
        $scope.t5 = '';
        $scope.getUserComlains();
        $scope.getStoreComlains();
        $scope.year = moment().year();
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
            labels: ['Lần'],
        });

        $scope.checkShow();
        $scope.getCurent();
        $scope.dateInputInit();

    }
    $scope.dateInputInit = () => {
        if ($('.daterage').length) {
            var start = moment().format('MM-DD-YYYY');
            var end = moment().format('MM-DD-YYYY');
            if (typeof start === "undefined") {
                start = end = moment().format("MM/DD/YYYY");
            }
            $('.daterage').daterangepicker({
                opens: 'right',
                alwaysShowCalendars: true,
                showCustomRangeLabel: false,
                autoUpdateInput: false,
                startDate: start,
                endDate: end,
                ranges: {
                    'Hôm nay': [moment(), moment()],
                    'Hôm qua': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                    '7 ngày trước': [moment().subtract(6, 'days'), moment()],
                    '30 ngày trước': [moment().subtract(29, 'days'), moment()],
                    'Tháng này': [moment().startOf('month'), moment().endOf('month')],
                    'Tháng trước': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
                }
            });
            $('.daterage').on('apply.daterangepicker', function (ev, picker) {
                $(this).val(picker.startDate.format('MM/DD/YYYY') + ' - ' + picker.endDate.format('MM/DD/YYYY'));
                $scope.filter.date = picker.startDate.format('MM/DD/YYYY') + ' - ' + picker.endDate.format('MM/DD/YYYY');
            });

        }
    }
    $scope.checkShow = () => {
        $scope.show = true;
        if ($scope.year == moment().year()) {
            $scope.show = false;
        }
    }
    $scope.next = () => {
        $scope.year = $scope.year + 1;
        $scope.getCurent();
    }
    $scope.pre = () => {
        $scope.year = $scope.year - 1;
        $scope.getCurent();
    }
    $scope.getCurent = () => {
        $scope.checkShow();
        $http.get(base_url + '/customers/ajax_get_month_report/' + $scope.year).then(r => {
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
                        element2.value = parseInt(element.total);
                    }
                });
            });
            $scope.mr.setData($scope.data);

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
        })
    }

    $scope.getComlainsReport = () => {
        $scope.getComlains();
        $scope.filter.checkChangeDateInput = true;
    }

    $scope.getComlains = () => {
        var ar2 = [];
        var tong = 0;
        $scope.t0 = 0;
        $scope.t1 = 0;
        $scope.t2 = 0;
        $scope.t3 = 0;
        $scope.t4 = 0;
        $scope.t5 = $scope.convertSeconds(0);
        $scope.load = true;
        $http.get(base_url + '/customers/ajax_get_report?filter=' + JSON.stringify($scope.filter)).then(r => {
            r.data.data.forEach((element, key) => {
                var ob = {
                    id: '',
                    ten: '',
                    total1: 0,
                    total2: 0,
                    total3: 0,
                    total4: 0,
                    time1: '',
                    time2: '',
                    time3: '',
                    time4: '',
                    total_time: 0,
                    total_timeH: '',
                    total_all: 0
                }
                ob.id = element.customer_complain_type_id;
                ob.ten = element.name;
                ob.total_all = parseInt(element.total);
                ob.total_timeH = $scope.convertSeconds(0);
                $scope.t0 = $scope.t0 + parseInt(element.total);
                if (element.status == 1) {
                    ob.total1 = element.total;
                    ob.time1 = element.total_time;
                    $scope.t1 = $scope.t1 + parseInt(ob.total1);
                }
                if (element.status == 2) {
                    ob.total2 = element.total;
                    ob.time2 = element.total_time;
                    $scope.t2 = $scope.t2 + parseInt(ob.total2);
                }
                if (element.status == 3) {
                    ob.total3 = element.total;
                    ob.time3 = element.total_time;
                    $scope.t3 = $scope.t3 + parseInt(ob.total3);
                }
                if (element.status == 4) {

                    ob.total_time = element.total_time / element.total;
                    ob.total_timeH = $scope.convertSeconds(ob.total_time);
                    tong = tong + ob.total_time;
                    $scope.t5 = $scope.convertSeconds(tong);

                    ob.total4 = element.total;
                    ob.time4 = element.total_time;
                    $scope.t4 = $scope.t4 + parseInt(ob.total4);
                }

                if (ar2.length == 0) {
                    ar2.push(ob)
                } else {
                    let index = -1;
                    ar2.forEach((element2, vt) => {
                        if (element.customer_complain_type_id == element2.id) {
                            index = vt;
                        }
                    });
                    if (index != -1) {
                        ar2[index].total_time = ar2[index].total_time + ob.total_time;
                        ar2[index].total_timeH = $scope.convertSeconds(ar2[index].total_time);
                        ar2[index].total_all = ar2[index].total_all + parseInt(element.total);
                        if (element.status == 1) {
                            ar2[index].total1 = element.total;
                            ar2[index].time1 = element.total_time;
                        }
                        if (element.status == 2) {
                            ar2[index].total2 = element.total;
                            ar2[index].time2 = element.total_time;
                        }
                        if (element.status == 3) {
                            ar2[index].total3 = element.total;
                            ar2[index].time3 = element.total_time;
                        }
                        if (element.status == 4) {
                            ar2[index].total4 = element.total;
                            ar2[index].time4 = element.total_time;

                        }

                    } else {
                        ar2.push(ob);
                    }
                }
            });
            $scope.report = ar2;
            $scope.load = false;
        })
    }
    $scope.convertSeconds = function (sec) {
        var day = Math.floor(sec / 86400);
        var hrs = Math.floor((sec - (day * 86400)) / 3600);
        var min = Math.floor((sec - (hrs * 3600) - (day * 86400)) / 60);
        var seconds = sec - (day * 86400) - (hrs * 3600) - (min * 60);
        seconds = Math.round(seconds * 100) / 100
        seconds = Math.ceil(seconds);
        var result = day + ' ngày  ';
        result += (hrs < 10 ? "0" + hrs : hrs);
        result += ":" + (min < 10 ? "0" + min : min);
        result += ":" + (seconds < 10 ? "0" + seconds : seconds);
        return result;
    }
    $scope.showModal = (id, name) => {
        $scope.name = name;
        $scope.count = 0;
        $http.get(base_url + '/customers/ajax_get_modal_store_report/' + id + '?filter=' + JSON.stringify($scope.filter)).then(r => {
            $scope.reportstoremodal = r.data.data;
            $scope.count = $scope.count + 1;
        });
        $http.get(base_url + '/customers/ajax_get_modal_user_report/' + id + '?filter=' + JSON.stringify($scope.filter)).then(r => {
            $scope.reportusermodal = r.data.data;
            $scope.count = $scope.count + 1;
        });
        $('#modal').modal('show');
    }
    $scope.getUserComlains = () => {
        $http.get(base_url + '/customers/ajax_get_user_report?filter=' + JSON.stringify($scope.filter)).then(r => {
            r.data.data.forEach(element => {
                element.dttotal = JSON.parse('[' + element.dttotal + ']');
            });
            $scope.reportuser = r.data.data;
        })
    }

    $scope.getStoreComlains = () => {
        $http.get(base_url + '/customers/ajax_get_store_report?filter=' + JSON.stringify($scope.filter)).then(r => {
            r.data.data.forEach(element => {
                element.dttotal = JSON.parse('[' + element.dttotal + ']');
            });
            $scope.reportstore = r.data.data;
        })
    }

});