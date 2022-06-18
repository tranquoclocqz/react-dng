app.controller('svCtrl', function ($scope, $http, $sce) {
    var pi = $scope.pagingInfo = {
        itemsPerPage: 30,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };

    $scope.init = () => {
        $('.box1').css('opacity', '1');
        $scope.filter = {};
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;
        $scope.filter.nation_id = '1';
        $scope.filter.store_type = (current_company_id == 4) ? '4' : '1';
        $scope.filter.active = '1';
        $scope.productQtt = {
            quantity: '',
            product_id: 0
        };
        $scope.getAll();
        $scope.getAllCategory();
        select2();
        $scope.category = [];
        $scope.isEdit = 0;
    }

    $scope.editDiscount = (id) => {
        $scope.isEdit = id == $scope.isEdit ? 0 : id;
    }

    $scope.edit = (id) => {
        window.open(base_url + '/services/edit/' + id);
    }

    $scope.viewKpi = (id) => {
        window.open(base_url + `/kpis/detail?unit_id=${id}&category=services`);
    }

    $scope.getAllCategory = () => {
        $http.get(base_url + 'services/ajax_get_catelogy').then(r => {
            if (r.data && r.data.status == 1) {
                $scope.category = r.data.data;
            } else toastr["error"]("Đã có lỗi xẩy ra. Vui lòng thử lại sau!");
        });
    }

    $scope.formatDate = (date, format) => {
        return moment(date).format(format);
    }

    function select2() {
        setTimeout(() => {
            $('.select2').select2();
        }, 250);
    }

    $scope.filterService = () => {
        $scope.pagingInfo.offset = 0;
        $scope.filter.offset = $scope.pagingInfo.offset;
        $scope.getAll();
    }

    $scope.getKpi = (value) => {
        return $sce.trustAs('html', value);
    }

    $scope.getAll = () => {
        $scope.loading = true;
        $scope.upfilter = angular.copy($scope.filter);
        $http.get(base_url + 'services/ajax_get_list_services?filter=' + JSON.stringify($scope.upfilter)).then(r => {
            delete $scope.loading;
            if (r.data && r.data.status == 1) {
                $scope.rows = r.data.data;
                $scope.pagingInfo.total = r.data.count;
                $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
                $scope.rows.forEach(element => {
                    element.active = Number(element.active);
                    element.category_id = element.category_id + '';
                });
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setTimeout(() => {
                    select2();
                }, 0);
            } else toastr["error"]("Đã có lỗi xẩy ra. Vui lòng thử lại sau!");
        });
    }

    $scope.getService = (val) => {
        let url = `services/ajax_get_services?nation_id=${val.nation_id}&store_type=${val.store_type}&type=${'profession'}`;
        $http.post(base_url + url).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.products = r.data.data;
            }
        })
    }

    $scope.changeService = (item) => {
        let data = {
            service_id: item.id,
            active: item.active,
            max_discount: item.max_discount,
            category_id: item.category_id
        }
        $http.post(base_url + 'services/ajax_change_service', data).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.isEdit = 0;
                toastr["success"]("Cập nhật thành công!");
            } else toastr["error"]("Đã có lỗi xẩy ra. Vui lòng thử lại sau!");
        });
    }

    $scope.openQuantitative = (val) => {
        $scope.quantitative(val);
        $scope.getService(val);
    }

    $scope.quantitative = (val) => {
        $scope.productQtt.service_id = val.id;
        $http.get(base_url + '/services/ajax_get_quantitative?service_id=' + val.id).then(r => {
            if (r.data && r.data.status == 1) {
                $('#ordernow').modal('show');
                $scope.qtt = r.data.data;
            }
        })
    }

    $scope.saveQuantity = () => {
        if ($scope.productQtt.quantity && Number($scope.productQtt.quantity) > 0 && $scope.productQtt.product_id > 0) {
            $http.post(base_url + '/services/ajax_set_quantity', $scope.productQtt).then(r => {
                if (r.data && r.data.status == 1) {
                    toastr["success"]("Thêm thành công!");
                    let tmp = {
                        id: $scope.productQtt.service_id
                    }
                    $scope.quantitative(tmp);
                }
            })
        }
    }

    $scope.deleteQtt = (val) => {
        let data = {
            id: val.id
        };
        $http.post(base_url + 'services/ajax_remove_quantity', data).then(r => {
            if (r.data && r.data.status == 1) {
                toastr["success"](r.data.message);
                let tmp = {
                    id: $scope.productQtt.service_id
                }
                $scope.quantitative(tmp);
            } else toastr["error"](r.data.message);
        })
    };

    //paging
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
    //end paging
})