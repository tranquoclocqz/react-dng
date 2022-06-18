app.controller('homeCtrl', function ($scope, $http) {
    $scope.init = () => {
        $scope.filter = {};
        $('.box1').css('opacity', 1);
        $scope.bdline = {};
        $scope.bdline.year = moment().format('YYYY');
        $scope.years = [];
        $scope.report = [];
        $scope.ftInterview = {};
        $http.get(base_url + '/admin_users/ajax_get_years').then((r) => {
            $scope.years = r.data.data;
            select2();
        });
        $scope.userTmp = [];
        $http.get(base_url + '/admin_users/ajax_get_user_off_tmp').then((r) => {
            $scope.userTmp = r.data.data;
            select2();
        })
        $scope.loadbdLine();
        $scope.loadInterview();



        setTimeout(() => {
            $scope.setNullDateFilter();
        }, 200);
    }
    $scope.setNullDateFilter = () => {
        $scope.ftInterview.date = '';
    }

    $scope.caculator = (value, total) => {
        if (Number(total) <= 0) {
            return 0;
        } else {
            let rs = (Number(value) * 100) / Number(total);
            return rs.toFixed(2);
        }
    }

    function select2() {
        setTimeout(() => {
            $('.select2').select2({
                allowClear: true
            });
        }, 200)
    }

    function formatNumber(num) {
        if (!num) {
            return 0;
        }
        num = parseInt(num);
        return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    }

    $scope.loadInterview = () => {

        if ($scope.ftInterview.date) {
            $scope.ftInterview.start_date = moment($scope.ftInterview.date.split('-')[0].trim()).format('YYYY-MM-DD');
            $scope.ftInterview.end_date = moment($scope.ftInterview.date.split('-')[1].trim()).format('YYYY-MM-DD');
        }
        $scope.total = {
            new: 0,
            watting: 0,
            pass: 0,
            cancel: 0,
            not_pass: 0,
            user: 0,
            not_interview: 0,
            total: 0,
            user_active: 0
        };

        $http.get(base_url + '/admin_users/ajax_get_report_interview?filter=' + JSON.stringify($scope.ftInterview)).then((r) => {
            $scope.interviews = r.data.data;
            $scope.interviews.forEach(element => {
                $scope.total.new += Number(element.new);
                $scope.total.watting += Number(element.watting);
                $scope.total.pass += Number(element.pass);
                $scope.total.cancel += Number(element.cancel);
                $scope.total.not_pass += Number(element.not_pass);
                $scope.total.user += Number(element.user);
                $scope.total.not_interview += Number(element.not_interview);
                $scope.total.total += Number(element.total);
                $scope.total.user_active += Number(element.user_active);
            });
        });
    }

    $scope.loadbdLine = () => {
        $http.get(base_url + '/admin_users/ajax_get_report_users?filter=' + JSON.stringify($scope.bdline)).then((r) => {
            let data = r.data.data;
            $scope.report = data;
            $scope.totalUser = {
                num_start: 0,
                start_new: 0,
                start_old: 0,
                total_off: 0,
                off_reason_1: 0,
                off_reason_2: 0,
                off_reason_3: 0
            }
            data.forEach(element => {
                let tmp_of = (Number(element.num_start) - Number(element.start_new));
                $scope.totalUser.num_start += Number(element.num_start);
                $scope.totalUser.start_new += Number(element.start_new);
                $scope.totalUser.start_old += tmp_of;
                $scope.totalUser.total_off += Number(element.total_off);
                $scope.totalUser.off_reason_1 += Number(element.off_reason_1);
                $scope.totalUser.off_reason_2 += Number(element.off_reason_2);
                $scope.totalUser.off_reason_3 += Number(element.off_reason_3);
            });
            console.log(data);
            $("#myfirstchart").empty();
            $scope.mr = new Morris.Line({
                element: 'myfirstchart',
                data: data,
                xkey: 'm',
                xLabels: 'm',
                dataLabels: false,
                ykeys: ['total', 'num_start', 'total_off'],
                parseTime: false,
                labels: ['Tổng nhân sự', 'Nhân sự mới', 'Nghỉ việc'],
                lineColors: ['#95B75D', '#00c0ef', '#dd4b39'],
                hoverCallback: function (index, options, content, row) {
                    var str_hover = `
                            <div>
                                <div class='morris-hover-row-label text-center'>
                                Tháng ${row.m}
                                </div>
                                <div class="morris-hover-point text-left " style="color:#95B75D;">
                                    Tổng nhân sự: ${formatNumber(row.total)}
                                </div>
                                <div class="morris-hover-point text-left " style="color:#00c0ef">
                                    Nhân sự mới ${formatNumber(row.num_start)}
                                </div>
                                <div class="morris-hover-point text-left " style="color: #dd4b39">
                                    Nghỉ việc: ${formatNumber(row.total_off)}
                                </div>
                            </div>
                        `;
                    return str_hover;
                }
            })

            function parseSVG(s) {
                var div = document.createElementNS('http://www.w3.org/1999/xhtml', 'div');
                div.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg">' + s + '</svg>';
                var frag = document.createDocumentFragment();
                while (div.firstChild.firstChild)
                    frag.appendChild(div.firstChild.firstChild);
                return frag;
            }

            var items = $("#myfirstchart").find("svg").find("circle");

        });

    }

    $scope.handleFilter = () => {
        if ($scope.filter.date) {
            let d1 = $scope.filter.date.split('-')[0].trim();
            let d2 = d1.split('/');
            let d3 = $scope.filter.date.split('-')[1].trim();
            let d4 = d3.split('/');
            $scope.filter.start_date = d2[2] + '-' + d2[1] + '-' + d2[0];
            $scope.filter.end_date = d4[2] + '-' + d4[1] + '-' + d4[0];
        }
        $scope.getAll();
    }

    $scope.setbgcolor = (item) => {
        let col = $scope.color.find(i => {
            return item.id == i.id
        });
        return {
            "background-color": col.value
        };
    }

    $scope.openUserOffTmp = () => {
        $('#usertmp').modal('show');
    }
});