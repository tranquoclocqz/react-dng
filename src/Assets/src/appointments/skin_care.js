setTimeout(() => {
    if ($('body').width() <= 1250) {
        $('body').addClass('sidebar-collapse');
    }
    window.onresize = function (event) {
        if ($('body').width() <= 1250) {
            $('body').addClass('sidebar-collapse');
        }
    };
}, 100)
app.controller('skins', function ($scope, $http, $compile, $sce) {
    $scope.init = () => {
        $('#skins').fadeIn('fast');
        $scope.filter = {
            date: moment(today, 'YYYY-MM-DD').format('DD-MM-YYYY'),
            type: '1'
        };
        $scope.currentUser = currentUser;
        $scope.resetSort();
        $scope.list = [];
        $scope.list_temp = [];
        $scope.obj_count = {};
        $scope.getList();
    }

    $scope.pagingInfo = {
        itemsPerPage: 30,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };

    $scope.getList = () => {
        var data_rq = angular.copy($scope.filter),
            date = moment(data_rq.date, 'DD-MM-YYYY');

        if (data_rq.date.length != 10 || !date.isValid()) {
            showMessErr('Thời gian không hợp lệ');
            return;
        } else data_rq.date = date.format('YYYY-MM-DD');

        $scope.resetSort();
        $scope.loading = true;
        $http.get(base_url + 'appointments/ajax_get_list_appointment_skin_care?' + $.param(data_rq)).then(r => {
            $scope.loading = false;
            if (r.data.status) {
                var data = r.data.data,
                    i = 1;

                $.each(data, function (index, value) {
                    value.i = i++;
                    value.time = moment(value.time, 'HH:mm:ss').format('HH:mm')
                });
                $scope.list = data;
                $scope.list_temp = data;
                $scope.countList();
                $scope.updatePagination();
                $scope.go2Page(1);
            } else showMessErr(r.data.message);
        }, function () {
            showMessErrSystem();
        })
    }

    $scope.countList = () => {
        $scope.obj_count = {
            total: $scope.list_temp.length,
            total_your: $scope.list_temp.filter(x => x.skin_id == currentUser.id).length,
            customer_old: $scope.list_temp.filter(x => x.customer_type == 'old').length,
            customer_new: $scope.list_temp.filter(x => x.customer_type != 'old').length
        };

    } 

    // begin sort table end pagination
    $scope.updatePagination = () => {
        var count = $scope.list.length;
        $scope.pagingInfo.total = count;
        $scope.pagingInfo.totalPage = Math.ceil(count / $scope.pagingInfo.itemsPerPage);
    }

    $scope.go2Page = (page) => {
        if (page < 0) return;
        $scope.pagingInfo.currentPage = page;
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = ($scope.pagingInfo.currentPage - 1) * $scope.pagingInfo.itemsPerPage;
    }

    $scope.Previous = (page) => {
        if (page - 1 > 0) $scope.go2Page(page - 1);
        if (page - 1 == 0) $scope.go2Page(page);
    }

    $scope.getRange = (paging) => {
        var max = paging.currentPage + 3;
        var total = paging.totalPage + 1;
        if (max > total) max = total;
        var min = paging.currentPage - 2;
        if (min <= 0) min = 1;
        return _.range(min, max);
    }

    $scope.resetSort = () => {
        $scope.sort_table = {
            order: 'asc',
            sorting: 'time',
        }
        $scope.key_search = '';
    }

    $scope._toggleSort = () => {
        if ($scope.sort_table.order == 'asc') $scope.sort_table.order = 'desc';
        else $scope.sort_table.order = 'asc';
    }

    $scope.sortTable = (key) => {
        if ($scope.sort_table.sorting == key) {
            $scope._toggleSort();
        } else {
            $scope.sort_table.order = 'asc';
        }
        $scope.sort_table.sorting = key;
        $scope._sortData(key);
    }

    $scope._sortData = (key) => {
        var left = 1,
            right = -1;

        if ($scope.sort_table.order == 'desc') {
            left = -1;
            right = 1;
        }
        $scope.list_temp.sort((a, b) => (a.i > b.i ? 1 : -1)); // sx như data lúc đầu

        if (key == 'customer_name') {
            $scope.list_temp.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? left : right));
        } else if (key == 'customer_type') {
            $scope.list_temp.sort((a, b) => (a.i > b.i ? right : left));
            $scope.list_temp.sort((a, b) => (a.customer_type > b.customer_type ? left : right));
        } else if (key == 'index') {
            $scope.list_temp.sort((a, b) => (a.i > b.i ? left : right));
        } else if (key == 'time') {
            $scope.list_temp.sort((a, b) => (a.time > b.time ? left : right));
        }

        $scope.searchTable();
    }

    $scope.searchTable = () => {
        var expected = ToSlug($scope.key_search),
            _data = angular.copy($scope.list_temp);
        if (expected == '') {
            $scope.list = _data;
        } else {
            $scope.list = _data.filter(x =>
                (x.customer_id && ToSlug(x.customer_id).indexOf(expected) !== -1) ||
                ToSlug(x.time).indexOf(expected) !== -1 ||
                ToSlug(x.name).indexOf(expected) !== -1 ||
                ToSlug(x.phone).indexOf(expected) !== -1 ||
                ToSlug(x.note).indexOf(expected) !== -1 ||
                ToSlug(x.adv_note).indexOf(expected) !== -1 ||
                ToSlug(x.cs_note).indexOf(expected) !== -1);
        }
        $scope.go2Page(1);
        $scope.updatePagination();
    }
    // end sort table end pagination

    $scope.openCustomerHistory = (customer_id) => {
        showPopup('#modal_customer_history');
        $scope.customer = {
            load: true,
            html: '',
        };

        $http.get(base_url + 'customers/history/' + customer_id + '?is_get_view=1').then(r => {
            if (r.data && r.data.status) {
                $scope.customer.html = r.data.data;
            } else {
                showMessErr(r.data.message);
            }
            $scope.customer.load = false;
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope.confirmSetSkin = (value, confirm = 1) => {
        Swal.fire({
            title: 'Bạn có chắc?',
            text: confirm ? 'Nhận soi da!' : 'Gỡ soi da',
            icon: 'warning',
            showCancelButton: true,
            cancelButtonText: 'Hủy',
            confirmButtonText: 'Đồng ý',
            allowOutsideClick: false,
            showLoaderOnConfirm: true,
            preConfirm: function () {
                return new Promise(function (resolve, reject) {
                    $scope.$apply(function () {
                        $scope.setSkin(value, confirm);
                    });
                });
            },
        }).then(function () {});
    }

    $scope.setSkin = (value, confirm) => {
        $http.post(base_url + 'appointments/ajax_set_skin_in_skin_care', {
            id: value.id,
            skin_id: currentUser.id,
            confirm: confirm
        }).then(r => {
            if (r.data && r.data.status) {
                var data = r.data.data;
                value.skin_id = data.skin_id;
                value.skin_time = data.skin_time;
                value.skin_name = currentUser.fullname;
                value.skin_avatar = currentUser.image_url;
                $scope.countList();
                showMessSuccess();
                Swal.close();
            } else {
                Swal.fire('', r.data.message, 'error');
            }

            setTimeout(() => {
                $scope.$apply();
            }, 0)
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope.converHtml = (htmlbd) => {
        return $sce.trustAsHtml(htmlbd);
    }
})

app.filter('momentFormat', function () {
    return (value, format) => {
        return moment(value, 'YYYY-MM-DD HH:mm:ss').format(format);
    };
});
function ToSlug(title) {
    if (title == '') return '';
    //Đổi chữ hoa thành chữ thường
    slug = title.toLowerCase();

    //Đổi ký tự có dấu thành không dấu
    slug = slug.replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a');
    slug = slug.replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e');
    slug = slug.replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i');
    slug = slug.replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o');
    slug = slug.replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u');
    slug = slug.replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, 'y');
    slug = slug.replace(/đ/gi, 'd');
    //Xóa các ký tự đặt biệt
    slug = slug.replace(/\`|\~|\!|\@|\#|\||\$|\%|\^|\&|\*||∣|\+|\=|\,|\.|\/|\?|\>|\<|\'|\"|\:|\;|_/gi, '');
    //Đổi khoảng trắng thành ký tự gạch ngang
    //slug = slug.replace(/ /gi, " - ");
    //Đổi nhiều ký tự gạch ngang liên tiếp thành 1 ký tự gạch ngang
    //Phòng trường hợp người nhập vào quá nhiều ký tự trắng
    slug = slug.replace(/\-\-\-\-\-/gi, '-');
    slug = slug.replace(/\-\-\-\-/gi, '-');
    slug = slug.replace(/\-\-\-/gi, '-');
    slug = slug.replace(/\-\-/gi, '-');
    //Xóa các ký tự gạch ngang ở đầu và cuối
    slug = '@' + slug + '@';
    slug = slug.replace(/\@\-|\-\@|\@/gi, '');
    return slug
}