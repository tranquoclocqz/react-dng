app.controller('customers_care', function ($scope, $http, $compile) {
    var pi = $scope.pagingInfo = {
        itemsPerPage: 20,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };
    $scope.init = () => {
        $scope.object_generating();
        $scope.get_customer_list_2nd();

        $scope.get_current_tags();
    }
    $scope.object_generating = () => {
        $scope.filter = {};
        $scope.filter.user = '0';
        $scope.filter.sort = 'newest';
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.limit_view = 15;
        $scope.filter.offset = $scope.pagingInfo.offset;
    }

    $scope.get_customer_list_2nd = () => {
        $http.get(base_url + 'share_beauty/ajax_get_customer_list_2nd?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r && r.data.status == 1) {
                $scope.table_columns = r.data.column_data;
                $scope.customer_list = r.data.data;
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    $scope.add_coulum = () => {
        $http.get(base_url + 'share_beauty/ajax_add_column_care').then(r => {
            if (r && r.data.status == 1) {
                $scope.get_customer_list_2nd();
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }
    $scope.edit_column = (item) => {
        $http.post(base_url + 'share_beauty/ajax_edit_column', item).then(r => {
            if (r && r.data.status == 1) {
                $scope.get_customer_list_2nd();
            } else toastr["error"](r.data.message);
        })
    }

    $scope.edit_sb_care_note = (id, sb_care_note) => {
        var data = {};
        data.id = id;
        data.sb_care_note = sb_care_note;
        $http.post(base_url + 'share_beauty/ajax_edit_sb_care_note', data).then(r => {
            if (r && r.data.status == 1) {
                console.log('Edited');
            } else toastr["error"](r.data.message);
        })
    }
    $scope.edit_col_name = (id, name) => {
        var temp = {};
        temp.id = id;
        temp.name = name;
        $http.post(base_url + 'share_beauty/ajax_edit_column_name', temp).then(r => {
            if (r && r.data.status == 1) { } else toastr["error"](r.data.message);
        })
    }
    $scope.delete_col = (id) => {
        $http.get(base_url + 'share_beauty/ajax_delete_column_care/' + id).then(r => {
            if (r && r.data.status == 1) {
                $scope.get_customer_list_2nd();
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }
    $scope.get_current_tags = () => {
        $http.get(base_url + 'share_beauty/ajax_get_tags').then(r => {
            if (r && r.data.status == 1) {
                $scope.tag_list = r.data.data;
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }
    $scope.openTags = (event) => {
        if ($(event.target).parent().hasClass('active')) {
            $(event.target).parent().removeClass('active');
        } else $(event.target).parent().addClass('active');
    }
    document.addEventListener("click", function (event) {
        // If user clicks inside the element, do nothing
        if (event.target.closest(".add-tags")) return;
        // If user clicks outside the element, hide it!
        $('.add-tags').removeClass('active');
        // $('.bg-dark').css('display', 'none');
    });
});