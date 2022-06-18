app.controller('marketing_data_budget', function ($scope, $http, $sce, $compile) {
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
        runDrag_to_scroll();
    }

    function runDrag_to_scroll() {
        const slider = document.querySelector('.outside-tablecustom');
        let isDown = false;
        let startX;
        let scrollLeft;

        slider.addEventListener('mousedown', (e) => {
            isDown = true;
            slider.classList.add('moving');
            startX = e.pageX - slider.offsetLeft;
            scrollLeft = slider.scrollLeft;
        });
        slider.addEventListener('mouseleave', () => {
            isDown = false;
            slider.classList.remove('moving');
        });
        slider.addEventListener('mouseup', () => {
            isDown = false;
            slider.classList.remove('moving');
        });
        slider.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - slider.offsetLeft;
            const walk = (x - startX) * 3; //scroll-fast
            slider.scrollLeft = scrollLeft - walk;

        });
    }
    $scope.object_generating = () => {

        $scope.filter = {};
        $scope.newItem = {};
        $scope.filter.source_id = '0';

        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;
        $scope.is_onlyshow = true;
        $scope.is_onlycreate = false;
        select2();
        setTimeout(() => {
            $scope.dateInputInit();
        }, 50);
    }
    $('.budget-table').on('focus', '.budget-item input', function () {
        $(this).parents('tr').addClass('budget-active');
    })
    $('.budget-table').on('focusout', '.budget-item input', function () {
        $('.budget-active').removeClass('budget-active');
    })
    $scope.setbgcolor = (color) => {
        return { "background-color": color };
    }
    $scope.update_budget_row = (item) => {
        var data = item.sources;
        data.forEach(e => {
            e.total_budget = e.total_budget.replace(/,/g, "");
            e.onday_budget = e.onday_budget.replace(/,/g, "");
        });
        $http.post(base_url + 'sale_care/update_budget_row', data).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.get_marketing_budgets(1);
                toastr["success"]("Chỉnh sửa thành công!");
            }
        })
    }
    $scope.handle_newBudget = () => {
        if ($scope.is_onlycreate == true) {
            $scope.is_onlycreate = false;
            $scope.get_marketing_budgets();
        } else {
            $scope.is_onlycreate = true;
            $scope.budgets = [];
        }

    }
    $scope.get_marketing_budgets = (type = 0) => {
        if (type == 0) $scope.is_onlyshow = true;
        $scope.is_onlycreate = false;
        $http.get(base_url + 'sale_care/get_mkt_budgets?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.budgets = r.data.data;
            }
        })
    }
    $scope.get_new_budgets_values = () => {
        $http.get(base_url + 'sale_care/get_mkt_budgets_to_create?filter=' + JSON.stringify($scope.newItem)).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.budgets = r.data.data;
                $scope.is_onlyshow = false;
            } else toastr["error"](r.data.message);
        })
    }
    $scope.createBudgets = () => {
        var data = {};
        data.date = $scope.newItem.date;
        data.data = $scope.budgets;
        data.data.forEach(element => {
            element.sources.forEach(e => {
                e.total_budget = e.total_budget.replace(/,/g, "");
                e.onday_budget = e.onday_budget.replace(/,/g, "");
            });
        });
        $http.post(base_url + 'sale_care/create_mkt_budgets', data).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.budgets = r.data.data;
            }
        })
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
})