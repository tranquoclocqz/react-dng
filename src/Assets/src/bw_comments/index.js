.controller('request', function ($scope, $http, $compile, $window, $sce) {
    var pi = $scope.pagingInfo = {
        itemsPerPage: 20,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };
    $scope.init = () => {
        $('.box').css('opacity', '1');
        $scope.filter = {};
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.limit_view = 15;
        $scope.filter.offset = $scope.pagingInfo.offset;
        $scope.counsel = {};
        $scope.newComment = {};
        $scope.get_sourse();
        $scope.dateInputInit();
        $scope.filter.staff_id = '0';
        $scope.sourse = sources;
        $scope.post_list = posts;
        $scope.page_show_title = 'Tất cả bình luận';

        $scope.getCounselling();
    }

    $scope.loadmoreViews = () => {
        $scope.filter.limit_view = $scope.filter.limit_view + 15;
        $scope.getCounselling_2nd();
    }
    $scope.deleteComent = (id, type) => {
        $scope.delete_id = id;
        $('#deleteModal').modal('show');
    }
    $scope.deleteCommentCofirmed = () => {
        $http.get(base_url + 'bw_comments/ajax_delete_coment/' + $scope.delete_id).then(r => {
            if (r && r.data.status == 1) {
                if ($scope.view_type == 'all') {
                    $scope.getCounselling();
                } else $scope.getCounselling_2nd();
            } else toastr["error"]("Đã có lỗi xẩy ra!");
            $('#deleteModal').modal('hide');
        });
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
                maxDate: moment(),
                alwaysShowCalendars: true,
                showCustomRangeLabel: false,
                autoUpdateInput: false,
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
                $(this).val(picker.startDate.format('DD/MM/YYYY') + ' - ' + picker.endDate.format('DD/MM/YYYY'));
                $scope.filter.date_times = picker.startDate.format('DD/MM/YYYY') + ' - ' + picker.endDate.format('DD/MM/YYYY');
                $scope.getCounselling();
            });

        }
    }
    $scope.sent_note = (value, index) => {
        var data = {
            post_id: value.post_id,
            page_id: value.page_id,
            parent_id: value.id,
            bot_check: value.bot_check,
            bot_name: value.bot_name,
            bot_phone: value.bot_phone,
            public: 1,
            comment: value.adv_note
        }
        $http.post(base_url + 'bw_comments/ajax_sent_counselling/' + value.id, JSON.stringify(data)).then(r => {
            if (r && r.data.status == 1) {
                toastr["success"]("Thành công!");
                $scope.getCounselling();
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }
    $scope.open_reply_form = (event) => {
        $('.open_reply_form').show();
        $(event.target).hide();
        $('.out-side-reply').slideUp();
        $(event.target).parents('.comment-item').find('.out-side-reply').slideDown();
    }
    $scope.sent_new_note = (value) => {
        var data = {
            post_id: $scope.filter.post_id,
            parent_id: 0,
            bot_check: value.bot_check,
            bot_name: value.bot_name,
            bot_phone: value.bot_phone,
            public: 1,
            comment: value.adv_note
        }
        $http.post(base_url + 'bw_comments/ajax_sent_counselling/' + value.id, JSON.stringify(data)).then(r => {
            if (r && r.data.status == 1) {
                toastr["success"]("Thành công!");
                $scope.getCounselling();
                $scope.newComment.adv_note = '';
                $scope.newComment.bot_name = '';
                $scope.newComment.bot_phone = '';
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    $scope.set_collapse_status = (id, value, type) => {
        collapse_status = (value == 1) ? 0 : 1;
        var data = {
            id: id,
            collapse_status: collapse_status
        }
        $http.post(base_url + 'bw_comments/ajax_change_collapse_status', JSON.stringify(data)).then(r => {
            if (r && r.data.status == 1) {
                toastr["success"]("Cập nhật thành công!");
                if (type == 'public') {
                    $scope.getCounselling();
                } else {
                    $scope.getCounselling_2nd();
                }
            } else toastr["error"]("Đã có lỗi xẩy ra!");
            $('.comment-item').removeClass('show-actions');
        });
    }
    $scope.open_actions = (event) => {
        $('.comment-item').removeClass('show-actions');
        $(event.target).parents('.comment-item').addClass('show-actions');
    }
    document.addEventListener("click", function (event) {
        // If user clicks inside the element, do nothing
        if (event.target.closest(".comment-actions, .dots")) return;
        // If user clicks outside the element, hide it!
        $('.comment-item').removeClass('show-actions');
        // $('.bg-dark').css('display', 'none');
    });

    $scope.openList = (event, type) => {
        if (type == 0) {
            $(event.target).parent().removeClass('active');
        } else $(event.target).parent().addClass('active');
    }
    $scope.converHtml = (htmlbd) => {
        return $sce.trustAsHtml(htmlbd);
    }
    $scope.createFilter = (type, text, id, event) => {
        $(event.target).parents('.form-filter').addClass('selected').find('.text-selected').html(text);
        switch (type) {
            case 'page':
                $scope.page_show_title = text;
                $scope.filter.source_id = id;
                $http.get(base_url + 'bw_comments/ajax_get_post_list/' + id).then(r => {
                    if (r && r.data.status == 1) {
                        $scope.post_list = r.data.data;
                    } else toastr["error"]("Đã có lỗi xẩy ra!");
                });
                break;
            case 'post':
                $scope.filter.post_id = id;
                break;
            default:
                break;
        }
        $scope.getCounselling();
    }
    $scope.view_newest = () => {

        $scope.view_type = 'hided';

        delete $scope.filter.source_id;
        delete $scope.filter.post_id;
        delete $scope.filter.date_times;

        $('.form-filter').removeClass('selected');

        $scope.getCounselling_2nd();
    }
    $scope.open_news = (page_id, post_id) => {
        $scope.filter.source_id = page_id;
        $scope.filter.post_id = post_id;
        $http.get(base_url + 'bw_comments/ajax_get_filter_name?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r && r.data.status == 1) {
                $('.page-filter, .post-filter').addClass('selected');

                $('.page-filter').find('.text-selected').html(r.data.data.page_name);
                $('.post-filter').find('.text-selected').html(r.data.data.post_name);
                $('#home-tab').click();
                $scope.getCounselling();
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });


    }
    $scope.cancelCheckinFilter = (type, event) => {
        $(event.target).parents('.form-filter').removeClass('selected');
        switch (type) {
            case 'page':
                $scope.page_show_title = 'Tất cả bình luận';
                delete $scope.filter.source_id;
                delete $scope.filter.post_id;
                $('.form-filter').removeClass('selected');
                $scope.post_list = posts;
                break;
            case 'post':
                delete $scope.filter.post_id;
                break;
            default:
                break;
        }
        $scope.getCounselling();
    }
    $scope.unset = () => {
        $scope.filter.source_id = undefined;
        $scope.filter.staff_id = '0';
        $scope.getCounselling();
    }
    $scope.getTable = (status) => {
        $scope.filter.status = status;
        $scope.getCounselling();
    }

    $scope.openField = (value, index) => {
        value.adv_user_id = 0;
    }
    $scope.get_list_telesales = () => {

    }
    $scope.getCounselling = () => {
        $scope.view_type = 'all';
        $http.get(base_url + 'bw_comments/ajax_get_counselling?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r && r.data.status == 1) {

                $scope.counsellings = r.data.data;

                console.log(r.data);

                $scope.pagingInfo.total = r.data.count;
                $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    $scope.getCounselling_2nd = () => {
        $http.get(base_url + 'bw_comments/ajax_get_counselling_2nd?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r && r.data.status == 1) {
                $scope.counsellings = r.data.data;
                $scope.waiting_count = r.data.count;
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    $scope.get_sourse = () => {

    }
    $scope.public_comment = (val, checked_status, type) => {
        checked_status = (checked_status == 1) ? 0 : 1;
        var data = {
            id: val.id,
            public: checked_status
        }
        $http.post(base_url + 'bw_comments/ajax_change_public', JSON.stringify(data)).then(r => {
            if (r && r.data.status == 1) {
                toastr["success"]("Cập nhật thành công!");
                $('.comment-item').removeClass('show-actions');

                if (type == 'public') {
                    $scope.getCounselling();
                } else {
                    $scope.getCounselling_2nd();
                }
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }


    $scope.go2Page = function (page) {
        if (page < 0) return;
        var pi = $scope.pagingInfo;
        pi.currentPage = page;
        pi.from = pi.offset = (pi.currentPage - 1) * pi.itemsPerPage;
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = ($scope.pagingInfo.currentPage - 1) * $scope.pagingInfo.itemsPerPage;
        $scope.getCounselling();
        pi.to = pi.total < pi.itemsPerPage ? pi.total : pi.itemsPerPage
    }
    $scope.unset = (cond) => {
        switch (cond) {
            case 'time':
                delete $scope.filter.date_times;
                break;
            default:
                break;
        }
        $scope.getCounselling();
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

}).filter('cut', function () {
    return function (value, wordwise, max, tail) {
        if (!value) return '';

        max = parseInt(max, 10);
        if (!max) return value;
        if (value.length <= max) return value;

        value = value.substr(0, max);
        if (wordwise) {
            var lastspace = value.lastIndexOf(' ');
            if (lastspace !== -1) {
                //Also remove . and , so its gives a cleaner result.
                if (value.charAt(lastspace - 1) === '.' || value.charAt(lastspace - 1) === ',') {
                    lastspace = lastspace - 1;
                }
                value = value.substr(0, lastspace);
            }
        }
        return value + (tail || ' …');
    };
});