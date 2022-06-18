app.directive('stringToNumber', function() {
    return {
        require: 'ngModel',
        link: function(scope, element, attrs, ngModel) {
            ngModel.$parsers.push(function(value) {
                return '' + value;
            });
            ngModel.$formatters.push(function(value) {
                return parseFloat(value);
            });
        }
    };
});

app.controller('index', function($scope, $http, $sce) {
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
        $scope.getAll();
        $scope.lists = [];
    }
    $scope.objectGeneration = () => {
        $scope.filter = {};
        $scope.filter.active = '1';
        $scope.filter.type = '0';
        $scope.filter.nation_id = '1';
        $scope.filter.store_type = (current_company_id == 4) ? '4' : '0';
        $scope.filter.key = '';
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;
        $scope.bindcurrent_company_id = current_company_id;
    }

    $scope.getAll = (pagingReload = true) => {
        if (pagingReload) {
            $scope.filter.offset = 0;
            $scope.pagingInfo.offset = 0;
            pi.currentPage = 1;
        }
        $scope.loading = true;
        $http.get('packages/ajax_get_list_package?filter=' + JSON.stringify($scope.filter)).then(r => {
            delete $scope.loading;
            if (r.data && r.data.status == 1) {
                $scope.lists = r.data.data.list;
                angular.forEach($scope.lists, function(value, key) {
                    $scope.lists[key].active = value.active == 1;
                });
                $scope.pagingInfo.total = r.data.data.total;
                $scope.pagingInfo.totalPage = Math.ceil(r.data.data.total / pi.itemsPerPage);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        })
    }

    $scope.editActive = (item) => {
        let data = {};
        data.id = item.id;
        data.active = item.active ? 1 : 0;
        $http.post('packages/update_package_status', data).then(r => {
            if (r && r.data.status == 1) {
                toastr.success('Đã cập nhật');
            } else toastr["error"](r.data.messages);
        })
    }
    $scope.submitPackage = () => {
        
        let temp = angular.copy($scope.ObjDetail);
        let data = {};
        data.active = temp.active;
        data.allow_discount = temp.allow_discount;
        data.category_package_id = temp.category_package_id;
        data.description = temp.description;
        data.description_usa = temp.description_usa;
        data.introduce = temp.introduce;
        data.max_use = temp.max_use;
        data.min_use = temp.min_use;
        data.month_use = temp.month_use;
        data.nation_id = temp.nation_id;
        if (temp.package_value) {
            data.package_value = (temp.package_value + '').replace(/,/g, "");
        }
        data.price = (temp.price + '').replace(/,/g, "");
        data.percent = temp.percent ? temp.percent : 0;
        data.price_max = temp.price_max;
        data.price_usa = temp.price_usa;
        data.package_saleof = temp.package_saleof ? temp.package_saleof : 0;
        data.product_saleof = temp.product_saleof ? temp.product_saleof : 0;
        data.service_saleof = temp.service_saleof ? temp.service_saleof : 0;
        data.type = temp.type;
        data.use_allow = temp.use_allow;
        data.category_id = temp.category_id;
        data.store_type = temp.store_type;
        

        data.services = temp.services;
        data.products = temp.products;

        if (temp.id) data.id = temp.id;

        $http.post('packages/ajax_submit_package', data).then(r => {
            if (r && r.data.status == 1) {
                $scope.getAll();
                if (data.id) toastr.success('Đã cập nhật');
                else {
                    toastr.success('Đã thêm mới thành công');
                }
                $('#addNewModal').modal('hide');
            } else toastr["error"](r.data.message);
        })
    }
    $scope.addPackage = () => {
        $scope.ObjDetail = {};
        $scope.ObjDetail.nation_id = '1';
        $scope.ObjDetail.store_type = (current_company_id == 4) ? '4' : '1';
        $scope.ObjDetail.type = 'normal';
        $scope.change_bind_product();
        $scope.select2();
        $('#addNewModal').modal('show');
    }
    $scope.change_bind_product = () => {
        $scope.ObjDetail.products = [];
        $scope.ObjDetail.services = [];
    }
    $scope.openDetail = (item) => {
        let data = {};
        data.id = item.id;
        data.nation_id = item.nation_id;
        data.store_type = item.store_type;
        $http.get('packages/ajax_get_package_detail?filter=' + JSON.stringify(data)).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.ObjDetail = r.data.data;
                $scope.ObjDetail.package_value = parseNumber($scope.ObjDetail.package_value);
                $scope.ObjDetail.price = parseNumber($scope.ObjDetail.price);
                $scope.lsProduct = r.data.products;
                $scope.lsServices = r.data.services;
                angular.forEach($scope.ObjDetail.services, function(value, key) {
                    $scope.ObjDetail.services[key].guarantee = value.guarantee == 1;
                });
                $scope.select2();
                $('#addNewModal').modal('show');
            }
        })
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
        console.log($scope.search_service);
        if ($scope.search_service.item && $scope.search_service.item.id != 0 && $scope.search_service.quantity > 0) {
            let item = $scope.search_service.item;
            let inst = {};
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
        if ($scope.search_service.key.length < 3) return false;
        $scope.search_service.load = true;
        $scope.search_service.store_type = $scope.ObjDetail.store_type;
        $scope.search_service.nation_id = $scope.ObjDetail.nation_id;
        $scope.showSv = true;
        $http.get('services/ajax_search_service_by_key?filter=' + JSON.stringify($scope.search_service)).then(r => {
            $scope.search_service.load = false;
            if (r.data && r.data.status == 1) {
                $scope.search_service.list = r.data.data;
            }
        })
    }
    $scope.converHtml = (htmlbd) => {
        return $sce.trustAsHtml(htmlbd);
    }

    $scope._searchProduct = () => {

        if ($scope.search_product.key.length < 3) return false;
        $scope.search_product.load = true;
        $scope.search_product.store_type = $scope.ObjDetail.store_type;
        $scope.search_product.nation_id = $scope.ObjDetail.nation_id;
        $scope.showPr = true;
        $http.get('products/ajax_search_product_retail_by_key?filter=' + JSON.stringify($scope.search_product)).then(r => {
            $scope.search_product.load = false;
            if (r.data && r.data.status == 1) {
                $scope.search_product.list = r.data.data;
            }
        })
    }

    $scope.selectItem = (item, key) => {
        $scope[key] = {
            key: item.description,
            list: [],
            load: false,
            item: item
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
            total += parseInt(element.price) * parseInt(element.quantity);
        });
        $scope.ObjDetail.services.forEach(element => {
            total += (parseInt(element.price) * parseInt(element.quantity));
        });
        $scope.ObjDetail.price = parseNumber(total);
    }
    $scope.select2 = () => {
            setTimeout(() => {
                $('.select2').select2({
                    nameselectionTitleAttribute: false
                });
            }, 50);
        }
        // paging
    $scope.go2Page = function(page) {
        if (page < 0) return;
        var pi = $scope.pagingInfo;
        pi.currentPage = page;
        pi.from = pi.offset = (pi.currentPage - 1) * pi.itemsPerPage;
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = ($scope.pagingInfo.currentPage - 1) * $scope.pagingInfo.itemsPerPage;
        $scope.getAll(false);
        pi.to = pi.total < pi.itemsPerPage ? pi.total : pi.itemsPerPage
    }

    $scope.Previous = function(page) {
        if (page - 1 > 0) $scope.go2Page(page - 1);
        if (page - 1 == 0) $scope.go2Page(page);
    }


    $scope.getRange = function(paging) {
        var max = paging.currentPage + 3;
        var total = paging.totalPage + 1;
        if (max > total) max = total;
        var min = paging.currentPage - 2;
        if (min <= 0) min = 1;
        var tmp = [];
        return _.range(min, max);
    }
});