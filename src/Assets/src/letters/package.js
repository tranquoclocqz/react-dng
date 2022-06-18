app.directive('stringToNumber', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, ngModel) {
            ngModel.$parsers.push(function (value) {
                return '' + value;
            });
            ngModel.$formatters.push(function (value) {
                return parseFloat(value);
            });
        }
    };
});

app.controller('package', function ($scope, $http, $sce) {
    var pi = $scope.pagingInfo = {
        itemsPerPage: 20,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };

    $scope.init = () => {
        $scope.objectGeneration();
        setTimeout(() => {
            $scope.dateInputInit();
            $scope.getAll();
        }, 10);
        $scope.lists = [];

        var preview_id = getParamsValue('preview_id');
        if (preview_id) {
            $scope.toDetail(preview_id);
        } else console.log('no value has found!');
    }
    $scope.objectGeneration = () => {
        $scope.filter = {};
        $scope.filter.store_id = '0';
        $scope.filter.status = '0';
        $scope.filter.user_id_created = '0';
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;
    }

    $scope.getAll = (pagingReload = true) => {
        if (pagingReload) {
            $scope.filter.offset = 0;
            $scope.pagingInfo.offset = 0;
            pi.currentPage = 1;
        }
        $scope.loading = true;
        $http.get('letters/ajax_get_package_request_via_api?filter=' + JSON.stringify($scope.filter)).then(r => {
            delete $scope.loading;
            if (r.data && r.data.status == 1) {
                $scope.rows = r.data.data.data;
                $scope.pagingInfo.total = r.data.data.total;
                $scope.pagingInfo.totalPage = Math.ceil(r.data.data.total / pi.itemsPerPage);
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
        })
    }
    $scope.opengenerator = () => {
        $http.get('letters/package_v2?is_request_ajax=1').then(r => {
            delete $scope.loading;
            if (r.data && r.data.status == 1) {
                $scope.gen_html = r.data.data;
                $('#genmd').modal('show');
            }
        })

    }
    $scope.editActive = (item) => {
        let data = {};
        data.id = item.id;
        data.active = item.active ? 1 : 0;
        $http.post('packages2/update_package_status', data).then(r => {
            if (r && r.data.status == 1) {
                toastr.success('Đã cập nhật');
            } else toastr["error"](r.data.messages);
        })
    }
    $scope.submitPackage = () => {
        let temp = angular.copy($scope.ObjDetail);
        let data = {};
        data.name = temp.name;
        data.store_type = temp.store_type;
        data.price_request = (temp.price + '').replace(/,/g, "");
        data.price_original = temp.price_original;
        data.services = temp.services;
        data.products = temp.products;

        if (!data.services.length && !data.products.length) {
            showMessErr('Chọn ít nhất một dịch vụ hoặc một sản phẩm');
            return false;
        }

        $scope.loading = true;
        $http.post('letters/ajax_submit_package_request', data).then(r => {
            delete $scope.loading;
            if (r && r.data.status == 1) {
                $scope.getAll();
                toastr.success('Đã thêm mới thành công');
                $('#addNewModal').modal('hide');
            } else toastr["error"](r.data.message);
        })
    }
    $scope.addPackage = () => {
        $scope.ObjDetail = {};
        $scope.ObjDetail.store_type = (current_company_id == 4) ? '4' : '1';
        $scope.change_bind_product();
        $scope.select2();
        $('#addNewModal').modal('show');
    }
    $scope.toDetail = (id) => {
        $scope.loading = true;
        $http.get('letters/ajax_get_package_request_via_api?filter=' + JSON.stringify({
            id: id
        })).then(r => {
            delete $scope.loading;
            if (r.data && r.data.status == 1) {
                $scope.detailRequest = r.data.data.data[0];
                $('#confirm_modal').modal('show');
            }
        })
    }
    $scope.changeSts = (status) => {
        data = angular.copy($scope.detailRequest);
        $scope.loading = true;
        $http.post('letters/ajax_submit_status_package_request', {
            id: data.id,
            status: status
        }).then(r => {
            delete $scope.loading;
            if (r && r.data.status == 1) {
                $scope.getAll();
                toastr.success('Đã cập nhật thành công');
                $('#confirm_modal').modal('hide');
            } else toastr["error"](r.data.message);
        })
    }
    $scope.change_bind_product = () => {
        $scope.ObjDetail.products = [];
        $scope.ObjDetail.services = [];
    }

    $scope.chooseItemSearchProductInsert = () => {
        if ($scope.search_product.item && $scope.search_product.item.id != 0 && $scope.search_product.quantity > 0) {
            let prd = $scope.search_product.item;
            let inst = {};
            inst.id = prd.id;
            inst.price = prd.price;
            inst.quantity = $scope.search_product.quantity;
            inst.description = prd.description;
            $scope.ObjDetail.products.push(inst);

            update_total();
        }
    }

    $scope.chooseItemSearchServiceInsert = () => {
        if ($scope.search_service.item && $scope.search_service.item.id != 0 && $scope.search_service.quantity > 0) {
            let item = $scope.search_service.item;
            let inst = {};
            inst.checked = item.checked;
            inst.id = item.id;
            inst.price = item.price;
            inst.quantity = $scope.search_service.quantity;
            inst.description = item.description;
            $scope.ObjDetail.services.push(inst);
            update_total();
        }
    }

    $scope.toggleRemovePackageUpdate = (type, index) => {
        if (type == 'ser') $scope.ObjDetail.services.splice(index, 1);
        else $scope.ObjDetail.products.splice(index, 1);
        update_total();
    }

    document.addEventListener("click", function (event) {
        // If user clicks inside the element, do nothing
        if (event.target.closest(".sv-i")) return;
        $scope.showSv = false;
        $scope.$apply();
    });
    document.addEventListener("click", function (event) {
        // If user clicks inside the element, do nothing
        if (event.target.closest(".pr-i")) return;
        $scope.showPr = false;
        $scope.$apply();
    });

    // Vinh search

    $scope._searchService = () => {
        $scope.showSv = true;
        if ($scope.search_service.key.length < 3) return false;
        $scope.search_service.load = true;
        $scope.search_service.store_type = $scope.ObjDetail.store_type;
        $http.get('services/ajax_search_service_by_key?filter=' + JSON.stringify($scope.search_service)).then(r => {
            $scope.search_service.load = false;
            if (r.data && r.data.status == 1) {
                var data = r.data.data;
                $.each(data, function (index, value) {
                    if (nation_id != 1) {
                        value.price /= 100;
                        value.price_max /= 100;
                        value.price_min /= 100;
                    }
                });
                $scope.search_service.list = data;
            }
        })
    }
    $scope.converHtml = (htmlbd) => {
        return $sce.trustAsHtml(htmlbd);
    }

    $scope._searchProduct = () => {
        $scope.showPr = true;
        if ($scope.search_product.key.length < 3) return false;
        $scope.search_product.load = true;
        $scope.search_product.store_type = $scope.ObjDetail.store_type;

        $http.get('products/ajax_search_product_retail_by_key?filter=' + JSON.stringify($scope.search_product)).then(r => {
            $scope.search_product.load = false;
            if (r.data && r.data.status == 1) {
                var data = r.data.data;
                $.each(data, function (index, value) {
                    if (nation_id != 1) {
                        value.price /= 100;
                        value.price_max /= 100;
                        value.price_min /= 100;
                    }
                });
                $scope.search_product.list = data;
            }
        })
    }

    $scope.selectItem = (item, key) => {
        var flag = true;
        ls_ser_deny.forEach(service => {
            if (service.unit_id == item.id) {
                $scope.search_service.key = "";
                flag = false;
                showMessErr('Dịch vụ này không được phép bán ở chi nhánh');
            }
        });

        if (flag) {
            $scope[key] = {
                key: item.description,
                list: [],
                load: false,
                item: item
            }
        }
    }

    $scope.searchInput = () => {
        $scope.search_service = {
            key: ""
        }
        $scope.search_product = {
            key: ""
        }
    }

    function update_total() {
        let total = 0;
        $scope.ObjDetail.products.forEach(element => {
            total += Number(element.price) * parseInt(element.quantity);
        });
        $scope.ObjDetail.services.forEach(element => {
            total += (Number(element.price) * parseInt(element.quantity));
        });
        $scope.ObjDetail.price = parseNumber(total);
        $scope.ObjDetail.price_original = total;
    }
    $scope.select2 = () => {
        setTimeout(() => {
            $('.select2').select2({
                nameselectionTitleAttribute: false
            });
        }, 50);
    }
    // paging
    $scope.go2Page = function (page) {
        if (page < 0) return;
        var pi = $scope.pagingInfo;
        pi.currentPage = page;
        pi.from = pi.offset = (pi.currentPage - 1) * pi.itemsPerPage;
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = ($scope.pagingInfo.currentPage - 1) * $scope.pagingInfo.itemsPerPage;
        $scope.getAll(false);
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

    $scope.dateInputInit = () => {
        $('.custom-daterange').daterangepicker({
            opens: 'right',
            alwaysShowCalendars: true,
            startDate: moment().subtract(6, 'days'),
            endDate: moment(),
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

app.filter('formatCurrency', function () {
    return (value, format = 0, nation = nation_id, noname = false) => {
        if (!value) return 0;
        value = Number(value);
        if (nation == 1) {
            return parseNumber(value.toFixed(0)) + (noname ? '' : ' đ');
        } else {
            return (Number(value) / (format ? 100 : 1)).toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") + (noname ? '' : ' $');
        }
    };
});