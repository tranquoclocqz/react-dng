app.controller('report_cancel', function ($scope, $http, $compile, $window, $timeout) {

    $scope.init = () => {
        $('.opacity').css('opacity', '1');
        $scope.filter = {};

        $scope.dateInputInit();
    }

    $scope.searchData = () => {

        if (!$scope.filter.date) {
            toastr["error"]("Vui lòng nhập ngày!");
            return;
        }

        var date = $scope.filter.date.split(' - '),
            start = moment(date[0], 'DD/MM/YYYY'),
            end = moment(date[1], 'DD/MM/YYYY');

        if (moment().diff(end, 'days') <= 0) {
            toastr["error"]("Chọn ngày trong quá khứ!");
            return;
        }
        $('.table').addClass('loading');
        $('.btn-sr').css('pointer-events', 'none');


        $http.get(base_url + 'sale_care/ajax_get_report?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r && r.data.status == 1) {

                $('.table').removeClass('loading');
                $('.btn-sr').css('pointer-events', 'initial');

                $scope.data_ajax = r.data.data;
                $scope.total_ajax = r.data.total;
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        })
    }

    $scope.in_consultant = () => {
        if ($scope.filter.group_id && $scope.filter.group_id.length > 0) {
            let e = false;
            angular.forEach($scope.filter.group_id, function (element) {
                if (element == 5) e = true;
            });
            return e;
        } else return false;
    }

    $scope.setUnDate = (item) => {
        setTimeout(() => {
            $scope.filter[item] = undefined;
            $scope.$apply();
        }, 100);
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
                    startDate: moment().subtract(1, 'days'),
                    endDate: moment().subtract(1, 'days'),
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
                        format: 'DD/MM/YYYY'
                    }
                });
            }, 100);
        }
    }
    //start tree group

    $scope.open_role_md = () => {
        $('#roleMd').modal('show');
        get_and_render_list();
    }

    $scope.removeSelected = () => {
        if (!$scope.filter.no_select_tree) $scope.filter.no_select_tree = false;
        $scope.filter.no_select_tree = !$scope.filter.no_select_tree;
        $scope.searchData();
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

        $scope.searchData();
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
        $scope.searchData();
        get_and_render_list();
    }
    //end tree group

});
app.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if (event.which === 13) {
                scope.$apply(function () {
                    scope.$eval(attrs.ngEnter);
                });
                event.preventDefault();
            }
        });
    };
})