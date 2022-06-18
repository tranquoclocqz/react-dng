app.controller('historyCtrl', function ($scope, $http, $sce, $compile) {
    var pi = $scope.pagingInfo = {
        itemsPerPage: 20,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };

    $scope.init = () => {
        $scope.user = {};
        $scope.filter = {};
        $scope.table_active = '';
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;
        $scope.getUserDetail();
        $scope.getTimeLine();

        $scope.date_start = moment(date_start).format("MM/DD/YYYY");
        var start = $('#filterrange').data('start');
        var end = $('#filterrange').data('end');
        if (typeof start === "undefined") {
            start = $scope.date_start.toString();
            end = moment().format("MM/DD/YYYY");
        }

        $('.filterrange').daterangepicker({
            opens: 'right',
            alwaysShowCalendars: true,
            showCustomRangeLabel: false,
            startDate: start,
            endDate: end,
            ranges: {
                'Hôm nay': [moment(), moment()],
                'Hôm qua': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                '7 ngày trước': [moment().subtract(6, 'days'), moment()],
                '30 ngày trước': [moment().subtract(29, 'days'), moment()],
                'Tháng này': [moment().startOf('month'), moment().endOf('month')],
                '1 tháng trước': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
                '3 tháng trước': [moment().subtract(3, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
                '6 tháng trước': [moment().subtract(6, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
                '1 năm trước': [moment().subtract(1, 'year').add(1, 'day'), moment()],
                '2 năm trước': [moment().subtract(2, 'year').add(1, 'day'), moment()],
                'Ngày bắt đầu làm': [$scope.date_start.toString(), moment()],
            }
        });
    }

    $(document).ready(function () {
        $('.block-timeline').css('height', $('#block-profile').height() - 15);
        $('.listHistory').css('height', $('#block-profile').height() - 98);
    });

    $scope.getUserDetail = () => {
        if (!$scope.filter.date) {
            $scope.filter.date = moment(date_start).format("MM/DD/YYYY").toString() + ' - ' + moment().format("MM/DD/YYYY").toString();
        }

        $http.get(base_url + '/admin_users/ajax_get_user_detail_history/' + idUser + '?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.user = r.data.data_user;

                // thang điểm
                $scope.user.point_ladder = "";
                if ($scope.user.statistic.medium_point < 7) {
                    $scope.user.point_ladder = 'O - OUT';
                }
                if ($scope.user.statistic.medium_point >= 7 && $scope.user.statistic.medium_point <= 10) {
                    $scope.user.point_ladder = 'B - BAD';
                }
                if ($scope.user.statistic.medium_point >= 11 && $scope.user.statistic.medium_point <= 15) {
                    $scope.user.point_ladder = 'N - NORMAL';
                }
                if ($scope.user.statistic.medium_point >= 16 && $scope.user.statistic.medium_point <= 18) {
                    $scope.user.point_ladder = 'G - GOOD';
                }
                if ($scope.user.statistic.medium_point >= 19 && $scope.user.statistic.medium_point <= 20) {
                    $scope.user.point_ladder = 'E - EXCELLENT';
                }
            }
        })
    }

    $scope.getTimeLine = () => {
        if (!$scope.filter.date) {
            $scope.filter.date = moment(date_start).format("MM/DD/YYYY").toString() + ' - ' + moment().format("MM/DD/YYYY").toString();
        }

        $http.get(base_url + '/admin_users/ajax_get_timeline/' + idUser + '?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r.data && r.data.status == 1) {
                var arr = r.data.timeline;
                for (var i = 0, l = arr.length; i < l; i++) {
                    switch (arr[i].type) {
                        case "birthday_":
                            arr[i].type = '<span class="label label-success">Ngày sinh</span>';
                            break;
                        case "date_start_":
                            var text = '';
                            if (arr[i].form_of_work) {
                                if (arr[i].form_of_work == 11) {
                                    text = "(Học việc)"
                                } else {
                                    text = "(Thử việc)"
                                }
                            }
                            if (moment($scope.user.date_start).format("DD.MM.YYYY").toString() == arr[i].created.toString()) { // nếu trùng ngày bắt đầu làm việc
                                arr[i].type = '<a href="user_interviews/rating_user_interview/' + idUser + '?id=' + arr[i].id + '" target="_blank"><span class="label label-success">Bắt đầu làm việc ' + text + '</span></a>';
                            } else {
                                arr[i].type = '<a href="user_interviews/rating_user_interview/' + idUser + '?id=' + arr[i].id + '" target="_blank"><span class="label label-success">Bắt đầu ' + text + '</span></a>';
                            }
                            break;
                        case "created_request_official":
                            if (arr[i].title) {
                                arr[i].type = '<a href="user_interviews/rating_user_interview/' + idUser + '?id=' + arr[i].id + '" target="_blank"><span class="label label-success" title="' + arr[i].title + '">Yêu cầu lên chính thức</span></a>';
                            } else {
                                arr[i].type = '<a href="user_interviews/rating_user_interview/' + idUser + '?id=' + arr[i].id + '" target="_blank"><span class="label label-success">Yêu cầu lên chính thức</span></a>';
                            }
                            break;
                        case "confirm_request_official":
                            arr[i].type = '<a href="user_interviews/rating_user_interview/' + idUser + '?id=' + arr[i].id + '" target="_blank"><span class="label label-success">Chính thức</span></a>';
                            break;
                        case "Biên bản":
                            arr[i].type = '<a href="admin_users/penance_view/' + arr[i].id + '" target="_blank" title="' + arr[i].title + '"><span class="label label-danger">' + arr[i].type + '</span></a>';
                            break;
                        case "Khiếu nại":
                            arr[i].type = '<a href="customers/complain_detail/' + arr[i].id + '" target="_blank" title="' + arr[i].title + '"><span class="label label-danger">' + arr[i].type + '</span></a>';
                            break;
                        case "Phiếu đánh giá":
                            arr[i].type = '<span class="label label-success" ng-click="showEvaluationDetail(' + arr[i].id + ')" title="' + arr[i].title + '">' + arr[i].type + '</span>';
                            break;
                        case "decision":
                            arr[i].type = '<a href="admin_users/decision_detail?id=' + arr[i].id + '" target="_blank"><span class="label label-success">' + arr[i].title + '</span></a>';
                            break;
                        case "Nghỉ việc":
                            arr[i].type = '<span class="label label-danger" title="' + arr[i].title + '">' + arr[i].type + '</span>';
                            break;
                        case "Nghỉ tạm thời":
                            arr[i].type = '<span class="label label-warning" title="' + arr[i].title + '">' + arr[i].type + '</span>';
                            break;
                        case "Làm việc lại":
                            arr[i].type = '<span class="label label-success" title="' + arr[i].title + '">' + arr[i].type + '</span>';
                            break;
                        case "Nghỉ phép":
                            var text = '';
                            if (arr[i].created != arr[i].date_end) {
                                text += ' từ ' + arr[i].created.substr(0, 5) + ' đến ' + arr[i].date_end;
                            }

                            if (arr[i].title) {
                                arr[i].type = '<a href="staffs/submit_order/1/' + arr[i].id + '" target="_blank" title="' + arr[i].title + '"><span class="label label-warning">' + arr[i].type + text + '</span></a>';
                            } else {
                                arr[i].type = '<a href="staffs/submit_order/1/' + arr[i].id + '" target="_blank"><span class="label label-warning">' + arr[i].type + text + '</span></a>';
                            }
                            break;
                        case "Công tác":
                            var text = '';
                            if (arr[i].created != arr[i].date_end) {
                                text += ' từ ' + arr[i].created.substr(0, 5) + ' đến ' + arr[i].date_end;
                            }

                            if (arr[i].title) {
                                arr[i].type = '<a href="staffs/submit_order/2/' + arr[i].id + '" target="_blank" title="' + arr[i].title + '"><span class="label label-default">' + arr[i].type + text + '</span></a>';
                            } else {
                                arr[i].type = '<a href="staffs/submit_order/2/' + arr[i].id + '" target="_blank"><span class="label label-default">' + arr[i].type + text + '</span></a>';
                            }
                            break;
                        default:
                            arr[i].type = '<span class="label label-default">' + arr[i].type + '</span>';
                    }
                }

                var uniques = [];
                var itemsFound = {};
                for (var i = 0, l = arr.length; i < l; i++) {
                    var stringified = arr[i].created;
                    if (itemsFound[stringified]) {
                        for (let j = uniques.length - 1; j >= 0; j--) {
                            if (arr[i].created == uniques[j].created) {
                                uniques[j].type += arr[i].type;
                            }
                        }
                        continue;
                    }
                    uniques.push(arr[i]);
                    itemsFound[stringified] = true;
                }

                $scope.timeline = uniques;
                $scope.timeline_mobile = uniques;
                $scope.timeline = _.chunk(uniques, 3);

                var even_number = uniques.length / 3;
                if (Math.ceil(even_number) % 2 == 0) {
                    $scope.even_number = 1;
                } else {
                    $scope.even_number = 0;
                }

                // timeline desktop
                var $el = '';
                if ($scope.timeline.length > 0) {
                    $scope.timeline.forEach(e => {
                        $el += '<div class="item">';
                        e.forEach(arr => {
                            $el += `<div class="subItem text-primary">
                                                <span class="info">
                                                    `+ arr.type + `
                                                </span>
                                                <span class="year">`+ arr.created + ` </span>
                                                <span class="icon arrow even-number" ng-if="even_number==1"></span>
                                                <span class="icon arrow odd-number" ng-if="even_number==0"></span>
                                            </div>`;

                        });
                        $el += `<div class="curve">
                                    <span class="arrow-curve"></span>
                                </div>
                            </div>`;
                    });
                }
                let html = $compile($el)($scope);
                $('.listHistory').html(html);

                // timeline mobile
                var $elMobile = '';
                if ($scope.timeline_mobile.length > 0) {
                    $scope.timeline_mobile.forEach(e => {
                        $elMobile += `<li class="timeline__entry">
                                <time>` + e.created + `</time>
                                <div style="padding-top: 22px;">`+ e.type + `</div>
                            </li>`;
                    });
                    $elMobile += `<span class="arrow-mobile"></span>`;
                }
                let htmlMobile = $compile($elMobile)($scope);
                $('.listHistoryMobile').html(htmlMobile);
            } else {
                toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
            }
        })
    }

    $scope.formatNumber = (num) => {
        return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    }

    $scope.format_date = (date, type) => {
        return moment(date).format(type);
    }

    $scope.openPenances = (open) => {
        if (open == "OPEN") {
            $('#table_complain_user, #table_decisions_user, #table_admin_user_off, #table_contract_user, #table_assets_personal, #table_evaluation').css('display', 'none');
            if ($('#table_penances_user').css('display') == 'none') {
                $scope.table_active = 'openPenances';
            } else {
                $scope.table_active = '';
            }
            $('#table_penances_user').slideToggle(300);
            $scope.open_tabel = "openPenances";
            pi = $scope.pagingInfo = {
                itemsPerPage: 20,
                offset: 0,
                to: 0,
                currentPage: 1,
                totalPage: 1,
                total: 0
            };
            $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
            $scope.filter.offset = $scope.pagingInfo.offset;
        }

        if (!$scope.filter.date) {
            $scope.filter.date = moment(date_start).format("MM/DD/YYYY").toString() + ' - ' + moment().format("MM/DD/YYYY").toString();
        }

        $http.get(base_url + '/admin_users/ajax_get_penance/' + idUser + '?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r.data.status == 1) {
                $scope.penances = r.data.data;
                $scope.pagingInfo.total = r.data.count;
                $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
            } else {
                toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
            }
        });
    }

    $scope.openComplain = (open) => {
        if (open == "OPEN") {
            $('#table_penances_user, #table_decisions_user, #table_admin_user_off, #table_contract_user, #table_assets_personal, #table_evaluation').css('display', 'none');
            if ($('#table_complain_user').css('display') == 'none') {
                $scope.table_active = 'openComplain';
            } else {
                $scope.table_active = '';
            }
            $('#table_complain_user').slideToggle(300);

            $scope.open_tabel = "openComplain";
            pi = $scope.pagingInfo = {
                itemsPerPage: 20,
                offset: 0,
                to: 0,
                currentPage: 1,
                totalPage: 1,
                total: 0
            };
            $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
            $scope.filter.offset = $scope.pagingInfo.offset;
        }

        if (!$scope.filter.date) {
            $scope.filter.date = moment(date_start).format("MM/DD/YYYY").toString() + ' - ' + moment().format("MM/DD/YYYY").toString();
        }

        $http.get(base_url + '/admin_users/ajax_get_complains/' + idUser + '?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r.data.status == 1) {
                $scope.complains = r.data.data;
                $scope.pagingInfo.total = r.data.count;
                $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
            } else {
                toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
            }
        });
    }

    $scope.openDecisions = (open) => {
        if (open == "OPEN") {
            $('#table_penances_user, #table_complain_user, #table_admin_user_off, #table_contract_user, #table_assets_personal, #table_evaluation').css('display', 'none');
            if ($('#table_decisions_user').css('display') == 'none') {
                $scope.table_active = 'openDecisions';
            } else {
                $scope.table_active = '';
            }
            $('#table_decisions_user').slideToggle(300);

            $scope.open_tabel = "openDecisions";
            pi = $scope.pagingInfo = {
                itemsPerPage: 20,
                offset: 0,
                to: 0,
                currentPage: 1,
                totalPage: 1,
                total: 0
            };
            $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
            $scope.filter.offset = $scope.pagingInfo.offset;
        }

        if (!$scope.filter.date) {
            $scope.filter.date = moment(date_start).format("MM/DD/YYYY").toString() + ' - ' + moment().format("MM/DD/YYYY").toString();
        }

        $scope.filter.user_id = idUser;
        $scope.filter.type_id = '';
        $scope.filter.orther_type_id = 5;
        $http.get(base_url + '/admin_users/ajax_get_decisions?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r.data.status == 1) {
                $scope.decisions = r.data.data;
                $scope.pagingInfo.total = r.data.count;
                $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
            } else {
                toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
            }
        });
    }

    $scope.openAdminUserOff = (open) => {
        if (open == "OPEN") {
            $('#table_decisions_user, #table_penances_user, #table_complain_user, #table_contract_user, #table_assets_personal, #table_evaluation').css('display', 'none');
            if ($('#table_admin_user_off').css('display') == 'none') {
                $scope.table_active = 'openAdminUserOff';
            } else {
                $scope.table_active = '';
            }
            $('#table_admin_user_off').slideToggle(300);

            $scope.open_tabel = "openAdminUserOff";
            pi = $scope.pagingInfo = {
                itemsPerPage: 20,
                offset: 0,
                to: 0,
                currentPage: 1,
                totalPage: 1,
                total: 0
            };
            $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
            $scope.filter.offset = $scope.pagingInfo.offset;
            $scope.filter.type = '';
        }

        if (!$scope.filter.date) {
            $scope.filter.date = moment(date_start).format("MM/DD/YYYY").toString() + ' - ' + moment().format("MM/DD/YYYY").toString();
        }

        $http.get(base_url + '/admin_users/ajax_get_admin_user_off/' + idUser + '?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r.data.status == 1) {
                $scope.admin_user_off = r.data.data;
                $scope.pagingInfo.total = r.data.count;
                $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
            } else {
                toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
            }
        });
    }

    $scope.changeTypeSearch = (type) => {
        $scope.filter.type = type;
        $scope.openAdminUserOff();
    }

    $scope.unset = () => {
        $scope.filter.date = undefined;
    }

    $scope.closeTable = (idText) => {
        $scope.table_active = '';
        $(idText).slideToggle(300);
    }

    $scope.getFilterUserHistory = () => {
        $('#table_penances_user, #table_complain_user, #table_decisions_user, #table_admin_user_off, #table_contract_user, #table_assets_personal, #table_evaluation').css('display', 'none');
        $scope.table_active = '';
        $scope.getUserDetail();
        $scope.getTimeLine();
    }

    $scope.openContract = (open) => {
        if (open == "OPEN") {
            $('#table_admin_user_off, #table_decisions_user, #table_penances_user, #table_complain_user, #table_assets_personal, #table_evaluation').css('display', 'none');
            if ($('#table_contract_user').css('display') == 'none') {
                $scope.table_active = 'openContract';
            } else {
                $scope.table_active = '';
            }
            $('#table_contract_user').slideToggle(300);

            $scope.open_tabel = "openContract";
            pi = $scope.pagingInfo = {
                itemsPerPage: 20,
                offset: 0,
                to: 0,
                currentPage: 1,
                totalPage: 1,
                total: 0
            };
            $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
            $scope.filter.offset = $scope.pagingInfo.offset;
        }

        if (!$scope.filter.date) {
            $scope.filter.date = moment(date_start).format("MM/DD/YYYY").toString() + ' - ' + moment().format("MM/DD/YYYY").toString();
        }

        $scope.filter.user_id = idUser;
        $scope.filter.type_id = [6];
        $scope.filter.orther_type_id = '';
        $http.get(base_url + '/admin_users/ajax_get_decisions?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r.data.status == 1) {
                $scope.contracts = r.data.data;
                $scope.pagingInfo.total = r.data.count;
                $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
            } else {
                toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
            }
        });
    }

    $scope.openAssetsPersonal = (open) => {
        if (open == "OPEN") {
            $('#table_contract_user, #table_admin_user_off, #table_decisions_user, #table_penances_user, #table_complain_user, #table_evaluation').css('display', 'none');
            if ($('#table_assets_personal').css('display') == 'none') {
                $scope.table_active = 'openAssetsPersonal';
            } else {
                $scope.table_active = '';
            }
            $('#table_assets_personal').slideToggle(300);

            $scope.open_tabel = "openAssetsPersonal";
            pi = $scope.pagingInfo = {
                itemsPerPage: 20,
                offset: 0,
                to: 0,
                currentPage: 1,
                totalPage: 1,
                total: 0
            };
            $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
            $scope.filter.offset = $scope.pagingInfo.offset;
        }

        if (!$scope.filter.date) {
            $scope.filter.date = moment(date_start).format("MM/DD/YYYY").toString() + ' - ' + moment().format("MM/DD/YYYY").toString();
        }

        $http.get(base_url + '/admin_users/ajax_get_assets_personal/' + idUser + '?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r.data.status == 1) {
                $scope.assets_personal = r.data.data;
                $scope.pagingInfo.total = r.data.count;
                $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
            } else {
                toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
            }
        });
    }

    $scope.openEvaluation = (open) => {
        if (open == "OPEN") {
            $('#table_contract_user, #table_admin_user_off, #table_decisions_user, #table_penances_user, #table_complain_user, #table_assets_personal').css('display', 'none');
            if ($('#table_evaluation').css('display') == 'none') {
                $scope.table_active = 'openEvaluation';
            } else {
                $scope.table_active = '';
            }
            $('#table_evaluation').slideToggle(300);

            $scope.open_tabel = "openEvaluation";
        }
        $http.get(base_url + '/admin_users/ajax_get_evaluation/' + idUser + '?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r.data.status == 1) {
                $scope.reviews = r.data.data;
                $scope.reviews.forEach(function (review) {
                    if (review.manage_reviews) {
                        let arr_manage_reviews = JSON.parse(review.manage_reviews);
                        review.total_manager = 0;
                        arr_manage_reviews.forEach(function (manage) {
                            if (manage.selected == true) {
                                review.total_manager++;
                            }
                        });
                    }

                    if (review.user_reviews) {
                        let arr_user_reviews = JSON.parse(review.user_reviews);
                        review.total_user = 0;
                        arr_user_reviews.forEach(function (user) {
                            if (user.selected == true) {
                                review.total_user++;
                            }
                        });
                    }
                });
            } else {
                toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
            }
            $scope.loadTable = false;
        });
    }

    $scope.viewDetailDe = (id) => {
        window.open(base_url + `admin_users/decision_detail?id=${id}`);
    }

    $scope.viewDetail = (value) => {
        if (value.type == 4) {
            window.open(base_url + `/staffs/add_order_quit/${value.id}`, '_blank');
        } else {
            window.open(base_url + `/staffs/submit_order/${value.type}/${value.id}`);
        }
    }

    $scope.viewDetailUser = () => {
        if ($('#viewMore').css('display') == 'none') $scope.arrow_info = 1;
        else $scope.arrow_info = 0;
        $('#viewMore').slideToggle(300);
    }

    $scope.showEvaluationDetail = (id) => {
        $http.get(base_url + '/admin_users/ajax_get_all_criteria?log_id=' + id + '&user_id=' + idUser).then(r => {
            if (r.data.status == 1) {
                $scope.history_evaluation = 0;
                $scope.criteries = r.data.data;
                $scope.list_manage_reviews = r.data.list_manage_reviews;
                $scope.manage_date = r.data.manage_date;
                $scope.list_user_reviews = r.data.list_user_reviews;
                $scope.user_date = r.data.user_date;
                $scope.user_evaluation = r.data.user_evaluation;

                for (var i = 0; i < $scope.criteries.length; i++) {
                    for (var j = 0; j < $scope.list_manage_reviews.length; j++) {
                        if ($scope.criteries[i].id == $scope.list_manage_reviews[j].id) {
                            $scope.criteries[i].selected_magnage = $scope.list_manage_reviews[j].selected;
                            $scope.criteries[i].note = $scope.list_manage_reviews[j].note;
                        }
                    }

                    for (var k = 0; k < $scope.list_user_reviews.length; k++) {
                        if ($scope.criteries[i].id == $scope.list_user_reviews[k].id) {
                            $scope.criteries[i].selected_user = $scope.list_user_reviews[k].selected;
                        }
                    }
                }

                $scope.totalCheckedUser = 0;
                for (var i = 0; i < $scope.list_user_reviews.length; i++) {
                    if ($scope.list_user_reviews[i].selected == true) {
                        $scope.totalCheckedUser += 1;
                    }
                }

                $scope.totalCheckedManage = 0;
                for (var i = 0; i < $scope.list_manage_reviews.length; i++) {
                    if ($scope.list_manage_reviews[i].selected == true) {
                        $scope.totalCheckedManage += 1;
                    }
                }
                $('#modalHisroryEvaluation').modal('show');
            } else {
                toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
            }
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

        if ($scope.open_tabel == 'openPenances') $scope.openPenances('PAGING');
        if ($scope.open_tabel == 'openComplain') $scope.openComplain('PAGING');
        if ($scope.open_tabel == 'openDecisions') $scope.openDecisions('PAGING');
        if ($scope.open_tabel == 'openAdminUserOff') $scope.openAdminUserOff('PAGING');
        if ($scope.open_tabel == 'openContract') $scope.openContract('PAGING');
        if ($scope.open_tabel == 'openAssetsPersonal') $scope.openAssetsPersonal('PAGING');

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

    $scope.converHtml = (htmlbd) => {
        return $sce.trustAsHtml(htmlbd);
    }

    $scope.converHtmlEvaluation = (index, htmlbd, obligatory) => {
        $span = '';
        if (obligatory == 1) {
            $span = '<span class="obligatory"> (*)</span>';
        }
        return $sce.trustAsHtml(index + '. ' + htmlbd + $span);
    }

    $scope.eventClick = () => {
        alert('a');
    }
});