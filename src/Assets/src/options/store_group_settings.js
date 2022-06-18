var time_blur = 250;

app.controller('store_group_settings', function ($scope, $http, $compile, $filter) {
    $scope.init = () => {
        $scope.loading = false;
        $scope.list = [];
        $scope.getList();
        $scope.list_service_removed = [];
        $scope.filter = {
            key: '',
            type: '',
            nation_id: 1,
            store_type: 3,
            list: {
                service: [],
                stores: []
            }
        };
    }

    $scope.getList = () => {
        $scope.list = [];
        $scope.loading = true;
        $http.get(base_url + 'options/ajax_get_store_groups').then(r => {
            $scope.loading = false;
            if (r.data.status) {
                $scope.list = r.data.data;
            } else {
                showMessErr(r.data.message);
            }
        })
    }
    $scope.addGroup = () => {
        $scope.data_edit = {
            id: 0,
            name: '',
            note: '',
            load: false,
            is_removed: true,
        }
        $scope.is_edit_name = true;
        $('#modal_edit_service_group').modal('show');
    }

    $scope.editGroup = (value, is_edit_name) => {
        var item = angular.copy(value);
        $scope.data_edit = {
            id: item.id,
            name: item.name,
            note: item.note,
            services: [],
            is_removed: false,
            load: true,
            nation_id: $scope.filter.nation_id,
            type: 'service',
        }
        $scope.filter.key = '';
        $scope.filter.type = 'service';
        $scope.list_service_removed = [];
        $scope.is_edit_name = is_edit_name ? true : false;
        $scope.getListServiceByGroup(item.id);
        $('#modal_edit_service_group').modal('show');
    }

    $scope.editStoreInGroup = (item, is_edit_store) => {
        $scope.data_edit = {
            id: item.id,
            name: item.name,
            stores: [],
            is_removed: false,
            load: true,
            nation_id: $scope.filter.nation_id,
            type: 'store',
        }
        $scope.filter.key = '';
        $scope.is_edit_store = is_edit_store ? true : false;
        $scope.filter.type = 'store';
        $scope.getListStoreInGroup(item.id);
        $scope.getListStoreNotInGroup();
        $('#modal_edit_branch_store').modal('show');
    }

    $scope.getListStoreInGroup = (id) => {
        $http.get(base_url + 'options/ajax_get_list_store_by_group_id?id=' + id).then(r => {
            $scope.data_edit.load = false;
            if (r.data.status) {
                $scope.data_edit.stores = r.data.data;
            } else {
                showMessErr(r.data.message);
            }
        })
    }

    $scope.getListStoreNotInGroup = () => {
        $http.get(base_url + 'options/ajax_get_list_store_not_group_id').then(r => {
            $scope.data_edit.load = false;
            if (r.data.status) {
                $scope.data_store = r.data.data;
            } else {
                showMessErr(r.data.message);
            }
        });
    }
    $scope.getListServiceByGroup = (id) => {
        $http.get(base_url + 'options/ajax_get_store_service_defaults?id=' + id).then(r => {
            $scope.data_edit.load = false;
            if (r.data.status) {
                $scope.data_edit.services = r.data.data;
            } else {
                showMessErr(r.data.message);
            }
        })
    }

    $scope.save = () => {
        //kiem tra xem ten co nhập chưa
        if (!$scope.data_edit.name) {
            showMessErr("Tên nhóm không được trống");
            return false;
        }

        $scope.data_edit.load = true;
        $http.post(base_url + 'options/ajax_edit_store_group', $scope.data_edit).then(r => {
            $scope.data_edit.load = false;
            if (r.data.status) {
                showMessSuccess();
                $('#modal_edit_service_group').modal('hide');
                $scope.getList();
            } else {
                showMessErr(r.data.message);
            }
        })
    }
    $scope.saveStore = () => {
        $scope.data_edit.load = true;
        $http.post(base_url + 'options/ajax_edit_service_store', $scope.data_edit).then(r => {
            $scope.data_edit.load = false;
            if (r.data.status) {
                showMessSuccess();
                $('#modal_edit_branch_store').modal('hide');
            } else {
                showMessErr(r.data.message);
            }
        })
    }

    $scope.toggeDelete = (item) => {
        var index;
        if ($scope.data_edit.type == 'service') {
            index = $scope.data_edit.services.indexOf(item);
            if (item.id) {
                item.is_remove = !item.is_remove;
            } else {
                $scope.data_edit.services.splice(index, 1);
            }
        } else if ($scope.data_edit.type == 'store') {
            index = $scope.data_edit.stores.indexOf(item);
            if (item.store_new) {
                $scope.data_edit.stores.splice(index, 1);
                $scope.data_store.push(item);
            } else {
                item.is_remove = !item.is_remove;
            }
        }

    }
    $scope.focusInSearch = (e) => {
        $(e).parent().find('.fa-search').addClass('text-danger');
        setTimeout(() => {
            $scope.filter.show_rs = true;
            $scope.$apply();
        }, time_blur + 1);
    }

    $scope.focusOutSearch = (e) => {
        $(e).parent().find('.fa-search').removeClass('text-danger');
        setTimeout(() => {
            $scope.filter.show_rs = false;
            $scope.$apply();
        }, time_blur);
    }

    $scope.searchWithType = () => {
        var filter = angular.copy($scope.filter),
            key = filter.key,
            type = $scope.data_edit.type;

        if (key.length < 3) return;
        $scope.filter.limit = 20;
        $scope.filter.offset = 0;
        $scope.filter.list.product = [];
        $scope.filter.list.service = [];
        if ($scope.filter_timer) {
            clearTimeout($scope.filter_timer);
        }
        $scope.filter_timer = setTimeout(() => {
            if (type == 'product') {
                $scope.searchProduct();
            } else if (type == 'service') {
                $scope.searchService();
            }
        }, 350);
    }

    $scope.searchService = () => {
        var filter = angular.copy($scope.filter),
            key = filter.key,
            not_id = [];
        if (key.length < 3) return;

        $scope.data_edit.services.forEach(item => {
            not_id.push(item.unit_id);
        });

        var data_rq = {
            key: key,
            store_type: filter.store_type,
            nation_id: filter.nation_id,
            not_id: not_id
        };
        $scope.filter.load = true;
        $http.post(base_url + 'services/ajax_get_service_by_key', data_rq).then(r => {
            if (r.data && r.data.status) {
                $scope.filter.list.service = r.data.data;
            } else {
                showMessErr(r.data.message);
            }
            $scope.filter.load = false;
        }, function (data, status, headers, config) {
            showMessErrSystem('Không thể tìm dịch vụ');
        });
    }

    $scope.searchStoreGroup = () => {
        var filter = angular.copy($scope.filter),
            key = filter.key;
        if (key.length < 3) return;

        $scope.filter.list.stores = $scope.data_store.filter(item => ToSlug(item.description).indexOf(key) !== -1);
    }

    $scope.chooseService = (item) => {
        var service = {
            unit_id: item.id,
            description: item.description,
            price: item.price,
            nation_id: item.nation_id,
            is_add: true
        };
        $scope.data_edit.services.unshift(service);
        $scope.filter.key = '';
    }

    $scope.chooseStore = (item) => {
        var store = {
            id: item.id,
            description: item.description,
            store_new: true
        };
        $scope.data_edit.stores.unshift(store);
        $scope.data_store.splice($scope.data_store.findIndex(v => v.id === item.id), 1);
        $scope.filter.key = '';
    }
});

app.filter('formatCurrency', function () {
    return (value, nation_id, noname = false) => {
        if (!value) return 0;
        value = Number(value);
        if (nation_id == 1) {
            return parseNumber(value) + (noname ? '' : ' đ');
        } else {
            return (Number(value) / 100).toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") + (noname ? '' : ' $');
        }
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