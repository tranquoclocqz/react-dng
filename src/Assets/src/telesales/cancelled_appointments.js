app.controller('cancelled_appointments', function ($scope, $http, $compile, $sce) {
    $scope.init = () => {
        $('body').addClass('sidebar-collapse');
        $scope.dateInputInit();
        select2_reset();
        setTimeout(() => {
            var tbWidth = $('.table-outside').width();
            $('.care-detail').css('width', tbWidth - (tbWidth * 0.1) + 40 + 'px');
            var wHeight = $(window).height();
            $('.table-fix').css('height', wHeight - 220 + 'px');
        }, 200);
    }

    function select2_reset() {
        $(".select-2-multiple").each(function (i, v) {
            var that = $(this);
            var placeholder = $(that).attr("data-placeholder");
            $(that).select2({
                placeholder: placeholder
            });
        });
    }
    $('.sidebar-toggle').on('click', function (e) {
        setTimeout(() => {
            var tbWidth = $('.table-outside').width();
            console.log(tbWidth);
            $('.care-detail').css('width', tbWidth - (tbWidth * 0.1) + 40 + 'px');
        }, 200);
    })

    function object_generating() {
        $scope.detailCare = {};
        $scope.detailCare.hasCallback = false;
    }
    $scope.get_detail_care = (event) => {
        $scope.detailCare = {};
        $scope.detailCare.hasCallback = false;
        $('.pr-2').removeClass('active');
        $(event.target).parents('.pr-2').addClass('active');
    }
    document.addEventListener("click", function (event) {
        // If user clicks inside the element, do nothing
        if (event.target.closest(".care-detail, .intro-cus-avatar, .select2, .select2-results__option, .select2-search__field")) return;
        // If user clicks outside the element, hide it!
        $('.pr-2').removeClass('active');
        // $('.bg-dark').css('display', 'none');
    });

    $scope.setbgcolor = (color) => {
        return { "background-color": color };
    }
    $scope.dateInputInit = () => {
        $('.custom-daterange').daterangepicker({
            opens: 'right',
            alwaysShowCalendars: true,
            startDate: moment().subtract(1, 'days'),
            endDate: moment().subtract(1, 'day'),
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
});