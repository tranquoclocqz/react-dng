app.controller('mainCtrl', function ($scope, $http, $sce, AdminStoreSvc) {

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
        $scope.currentUserId = id_current_user;
        $scope.isMaster = isMaster ? isMaster : 0;
        $scope.isDev = isDev ? isDev : 0;
        $scope.isHr = isHr ? isHr : 0;
        $scope.filter = {};
        $scope.isView = '';
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;
        $scope.filter.active = '1';
        $scope.getAll();
        $scope.rows = [];
        $scope.sexs = [{ id: 1, name: 'NAM' }, { id: 2, name: 'NỮ' }, { id: 3, name: 'KHÁC' }];
        $scope.positions = [];
        $scope.getAllPosition();
        $scope.getStatusUser();
        $scope.changeNation();
        $scope.changeProvice();
        $scope.getStores();
        $scope.loadLevel();
        $scope.loadDegrees();
        $scope.list_user_id = list_user_id;
        $scope.reviews = [];
        $scope.criteries = [];
        $scope.all_companies = all_companies;
        $scope.store_spa = store_spa;
        $scope.store_spa_tam = store_spa;
        $scope.store_tgld = store_tgld;
        $scope.store_tgld_tam = store_tgld;
        $scope.all_store_spa_tgld = all_store_spa_tgld;
        $scope.view = {
            type: 0,
            id: 0
        }
    }

    $scope.getStores = () => {
        AdminStoreSvc.getStoreByPermis({}).then(data => {
            $scope.list_store = data;
            select2();
        })
    }

    $scope.handleFilter = () => {
        // debugger
        $scope.pagingInfo.currentPage = 1;
        $scope.pagingInfo.offset = 0;
        $scope.filter.offset = 0;
        $scope.filter.currentPage = 1;
        $scope.getAll();
    }

    $scope.viewDetail = (data, type) => {
        if ($scope.view.id == data.id && $scope.view.type == type) {
            $scope.view = {
                type: 0,
                id: 0
            }
        } else {
            $scope.view = {
                type: type,
                id: data.id
            }
        }

    }

    $scope.getStoreName = (stores) => {
        let st = '';
        stores.forEach(element => {
            st += ' ' + element.store_name + ',';
        });
        return st.substring(0, st.length - 1);
    }

    $scope.checkInArray = (id) => {
        if (jQuery.inArray(id, $scope.list_user_id) != -1) {
            return true;
        } else {
            return false;
        }
    }

    $scope.getAll = () => {
        $http.get(base_url + '/admin_users/ajax_get_list_users?filter=' + JSON.stringify($scope.filter)).then(r => {

            if (r.data.status == 1) {
                $scope.rows = r.data.data;
                $scope.pagingInfo.total = r.data.count;
                $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
            } else {
                toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
            }
        });
    }
    $scope.exportExcel = () => {
        $scope.filter.is_excel = true;
        window.open(base_url + '/admin_users/ajax_get_list_users?filter=' + JSON.stringify($scope.filter));
        $scope.filter.is_excel = false;
        return;
    }

    $scope.redirctToDetail = (id) => {
        window.open(base_url + '/admin_users/history/' + id);
    }


    $scope.showHistoryEvaluation = (user_id) => {
        $scope.history_evaluation = 1;
        $http.get(base_url + '/admin_users/ajax_get_evaluation/' + user_id).then(r => {
            if (r.data.status == 1) {
                $scope.reviews = r.data.data;
                $scope.user_evaluation = r.data.user_evaluation;
                $scope.reviews.forEach(function (review) {
                    if (review.manage_reviews) {
                        let arr_manage_reviews = JSON.parse(review.manage_reviews);
                        review.total_manager = 0;
                        arr_manage_reviews.forEach(function (manage) {
                            if (manage.selected == true) {
                                review.total_manager++;
                            }
                        });
                    }

                    if (review.user_reviews) {
                        let arr_user_reviews = JSON.parse(review.user_reviews);
                        review.total_user = 0;
                        arr_user_reviews.forEach(function (user) {
                            if (user.selected == true) {
                                review.total_user++;
                            }
                        });
                    }
                });

                $('#modalHisroryEvaluation').modal('show');
            } else {
                toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
            }
        });
    }

    $scope.editRoleTVV = (user_id) => {
        $http.get(base_url + '/admin_users/ajax_get_user_detail?id=' + user_id).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.user = r.data.data;
                $scope.user.birthday = moment($scope.user.birthday).format('DD-MM-YYYY');
                $scope.user.id_date = moment($scope.user.id_date).format('DD-MM-YYYY');
                $scope.user.date_start = moment($scope.user.date_start).format('DD-MM-YYYY');

                $scope.user_stores_id = r.data.data.stores;
                $scope.user.user_permission = $scope.user.user_permission.map(i => { return i + ""; });

                if (getAllStores.length <= r.data.data.stores.length) {
                    $scope.checkedAllStores = true;
                } else {
                    $scope.checkedAllStores = false;
                }

                $scope.user.store_spa = [];
                $scope.user.store_spa_id = [];
                $scope.store_spa.forEach(item => {
                    if ($scope.user.stores.includes(item.id)) {
                        $scope.user.store_spa.push(item.id);
                        $scope.user.store_spa_id.push(item.id);
                    }
                });

                $scope.user.store_tgld = [];
                $scope.user.store_tgld_id = [];
                $scope.store_tgld.forEach(item => {
                    if ($scope.user.stores.includes(item.id)) {
                        $scope.user.store_tgld.push(item.id);
                        $scope.user.store_tgld_id.push(item.id);
                    }
                });

                $scope.stores = [];
                $scope.all_store_spa_tgld.forEach(item => {
                    if ($scope.user_stores_id.includes(item.id)) {
                        $scope.stores.push(item);
                    }
                });

                $('#modalRoleTVV').modal('show');
                $scope.changePermission();

                select2();
            }
        })
    }

    $scope.setAllStores = () => {
        $scope.stores = [];
        if ($scope.checkedAllStores == true) {
            $scope.user.stores = getAllStores;
            // lấy danh sách chi nhánh chính khi check chọn tất cả
            $scope.user.store_spa = [];
            $scope.store_spa.forEach(item => {
                $scope.user.store_spa.push(item.id);
            });

            $scope.user.store_tgld = [];
            $scope.store_tgld.forEach(item => {
                $scope.user.store_tgld.push(item.id);
            });

            $scope.stores = $scope.all_store_spa_tgld;
        } else {
            // lấy danh sách chi nhánh chính khi bỏ check chọn tất cả
            $scope.user.store_spa = $scope.user.store_spa_id;
            $scope.user.store_tgld = $scope.user.store_tgld_id;

            $scope.all_store_spa_tgld.forEach(item => {
                if ($scope.user_stores_id.includes(item.id)) {
                    $scope.stores.push(item);
                }
            });
        }
        select2();
    }

    $scope.changeStoreSpa = () => {
        if ($scope.all_store_spa_tgld.length == ($scope.user.store_spa.length + $scope.user.store_tgld.length)) {
            $scope.checkedAllStores = true;
        } else {
            $scope.checkedAllStores = false;
        }

        $scope.stores = [];
        let arrayStore = [...$scope.user.store_spa, ...$scope.user.store_tgld];
        $scope.all_store_spa_tgld.forEach(item => {
            if (arrayStore.includes(item.id)) {
                $scope.stores.push(item);
            }
        });
    }

    $scope.changeStoreTGLD = () => {
        if ($scope.all_store_spa_tgld.length == ($scope.user.store_spa.length + $scope.user.store_tgld.length)) {
            $scope.checkedAllStores = true;
        } else {
            $scope.checkedAllStores = false;
        }

        $scope.stores = [];
        let arrayStore = [...$scope.user.store_spa, ...$scope.user.store_tgld];
        $scope.all_store_spa_tgld.forEach(item => {
            if (arrayStore.includes(item.id)) {
                $scope.stores.push(item);
            }
        });
    }

    $scope.changePermission = () => {
        if ($scope.user.user_permission.length == 2) {
            $scope.store_spa = $scope.store_spa_tam;
            $scope.store_tgld = $scope.store_tgld_tam;
        } else if ($scope.user.user_permission.length == 0) {
            $scope.store_tgld = [];
            $scope.user.store_tgld = [];
            $scope.store_spa = [];
            $scope.user.store_spa = [];
        } else {
            $scope.user.user_permission.forEach(item => {
                if (item == 1) {
                    $scope.store_spa = $scope.store_spa_tam;
                    $scope.store_tgld = [];
                    $scope.user.store_tgld = [];
                }

                if (item == 4) {
                    $scope.store_tgld = $scope.store_tgld;
                    $scope.store_spa = [];
                    $scope.user.store_spa = [];
                }
            });
        }

        $scope.stores = [];
        let arrayStore = [...$scope.user.store_spa, ...$scope.user.store_tgld];
        $scope.all_store_spa_tgld.forEach(item => {
            if (arrayStore.includes(item.id)) {
                $scope.stores.push(item);
            }
        });
        select2();
    }

    $scope.saveRoleTVV = () => {
        $scope.loading = true;
        $scope.user.stores = [...$scope.user.store_spa, ...$scope.user.store_tgld];
        $http.post(base_url + '/admin_users/ajax_update_acount_user', $scope.user).then(r => {
            if (r.data && r.data.status == 1) {
                toastr["success"]("Cập nhật thành công!");
                $scope.loading = false;
                $scope.getAll();
            } else toastr["error"](r.data && r.data.status != 1 ? r.data.message : "Đã có lỗi xẩy ra!");
        });
    }

    $scope.loadLevel = () => {
        $http.get(base_url + '/admin_users/ajax_get_level_users').then(r => {
            if (r.data.status == 1) {
                $scope.levels = r.data.data;
            } else {
                toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
            }
        });
    }

    $scope.loadDegrees = () => {
        $http.get(base_url + '/admin_users/ajax_get_degree_users').then(r => {
            if (r.data.status == 1) {
                $scope.degrees = r.data.data;
            } else {
                toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
            }
        });
    }

    $scope.back_ = () => {
        $scope.history_evaluation = 1;
    }

    $scope.converHtml = (index, htmlbd, obligatory) => {
        $span = '';
        if (obligatory == 1) {
            $span = '<span class="obligatory"> (*)</span>';
        }
        return $sce.trustAsHtml(index + '. ' + htmlbd + $span);
    }

    $scope.showEvaluationDetail = (id, user_id) => {
        $http.get(base_url + '/admin_users/ajax_get_all_criteria?log_id=' + id + '&user_id=' + user_id).then(r => {
            if (r.data.status == 1) {
                $scope.history_evaluation = 0;
                $scope.criteries = r.data.data;
                $scope.list_manage_reviews = r.data.list_manage_reviews;
                $scope.manage_date = r.data.manage_date;
                $scope.list_user_reviews = r.data.list_user_reviews;
                $scope.user_date = r.data.user_date;
                $scope.user_evaluation = r.data.user_evaluation;

                for (var i = 0; i < $scope.criteries.length; i++) {
                    for (var j = 0; j < $scope.list_manage_reviews.length; j++) {
                        if ($scope.criteries[i].id == $scope.list_manage_reviews[j].id) {
                            $scope.criteries[i].selected_magnage = $scope.list_manage_reviews[j].selected;
                            $scope.criteries[i].note = $scope.list_manage_reviews[j].note;
                        }
                    }

                    for (var k = 0; k < $scope.list_user_reviews.length; k++) {
                        if ($scope.criteries[i].id == $scope.list_user_reviews[k].id) {
                            $scope.criteries[i].selected_user = $scope.list_user_reviews[k].selected;
                        }
                    }
                }

                $scope.totalCheckedUser = 0;
                for (var i = 0; i < $scope.list_user_reviews.length; i++) {
                    if ($scope.list_user_reviews[i].selected == true) {
                        $scope.totalCheckedUser += 1;
                    }
                }

                $scope.totalCheckedManage = 0;
                for (var i = 0; i < $scope.list_manage_reviews.length; i++) {
                    if ($scope.list_manage_reviews[i].selected == true) {
                        $scope.totalCheckedManage += 1;
                    }
                }
            } else {
                toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
            }
        });
    }

    //-----GET NATION ------------------

    $scope.changeNation = () => {

        $http.get(base_url + '/admin_users/ajax_get_provinces?nation_id=' + $scope.filter.nation_id).then(r => {
            if (r && r.data.status == 1) {
                $scope.provinces = r.data.data;
                select2();
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }
    $scope.changeProvice = () => {

        $http.get(base_url + '/admin_users/ajax_get_district/?province_id=' + $scope.filter.province_id).then(r => {
            if (r && r.data.status == 1) {
                $scope.districts = r.data.data;
                select2();
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    //-----GET NATION ------------------


    $scope.openModel = (val, act) => {
        $scope.getUserDetail(val);
    }

    $scope.getStatusUser = () => {
        $http.get(base_url + '/admin_users/ajax_get_status_user?type=2').then(r => {
            if (r.data && r.data.status == 1) {
                $scope.userStatus = r.data.data;
            }
        })
    }

    $scope.getAllPosition = () => {
        $http.get(base_url + '/admin_users/ajax_get_all_positions').then(r => {
            if (r.data.status == 1) {
                $scope.positions = r.data.data;
            }
        });
    }

    $scope.getUserDetail = (id) => {
        $http.get(base_url + '/admin_users/ajax_get_img_contact_user?id=' + id).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.user = r.data.data;
                $('#modaluser').modal('show');
            }
        })
    }


    $scope.formatDate = (d, fm) => {
        return moment(d).format(fm);
    }
    $scope.difference = (d1, d2) => {
        // debugger
        dt_now = new Date();
        dt1 = new Date(d1);
        if (d2 == '0000-00-00') {
            dt2 = dt_now;
        } else {
            dt2 = new Date(d2);
        }
        days = Math.floor((Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) - Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate())) / (1000 * 60 * 60 * 24));

        return $scope.getFormatedStringFromDay(days);
    }

    $scope.getFormatedStringFromDay = (numberOfDays) => {
        if (numberOfDays == 0) { return 0 + " ngày"; }
        var years = Math.floor(numberOfDays / 365);
        var months = Math.floor(numberOfDays % 365 / 30);
        var days = Math.floor(numberOfDays % 365 % 30);

        var yearsDisplay = years > 0 ? years + (years == 1 ? " năm, " : " năm, ") : "";
        var monthsDisplay = months > 0 ? months + (months == 1 ? " tháng, " : " tháng, ") : "";
        var daysDisplay = days > 0 ? days + (days == 1 ? " ngày" : " ngày") : "";
        return yearsDisplay + monthsDisplay + daysDisplay;
    }
    //ADD USER---------------------

    $scope.dzOptionsImg = {
        paramName: 'file',
        maxFilesize: '10',
        resizeWidth: 1200,
        url: base_url + '/admin_users/ajax_new_upload_image_user',
        acceptedFiles: 'image/*',
        dictDefaultMessage: 'Kéo thả hồ sơ tại đây'
    };

    $scope.dzCBImg = {
        'success': function (file, resp) {
            let res = JSON.parse(resp);
            if (res.status == 1) {
                $scope.user.images.push({
                    url: res.data.url,
                    file: res.data.file,
                    type: '1'
                });
            } else toastr['error']('Có lổi xẩy ra. Vui lòng thử lại!')
            $('.dz-image').remove();
        }
    };




    function copyPhoneToClipboard(str) {
        // Create new element
        var el = document.createElement('textarea');
        // Set value (string to be copied)
        el.value = str;
        // Set non-editable to avoid focus and move outside of view
        el.setAttribute('readonly', '');
        el.style = {
            position: 'absolute',
            left: '-9999px'
        };
        document.body.appendChild(el);
        // Select text inside element
        el.select();
        // Copy text to clipboard
        document.execCommand('copy');
        // Remove temporary element
        document.body.removeChild(el);
    }

    //--------------------IMAGE----------------------
    $scope.getImg = (img) => {
        return base_url + img;
    }
    //--------------------IMAGE----------------------


    $scope.showImg = (url) => {
        $scope.currentImageUrl = url;
        $('#image').modal('show');
    }

    $scope.removeImage = (url, index) => {
        $scope.user.images.splice(index, 1);
    }

    $scope.handleSaveImage = () => {
        $http.post(base_url + '/admin_users/ajax_update_img_profile', $scope.user).then(r => {
            if (r.data && r.data.status == 1) {
                toastr["success"]("Cập nhật thành công!");
            } else toastr["error"](r.data && r.data.status != 1 ? r.data.message : "Đã có lỗi xẩy ra!");
        });
    }

    function select2() {
        setTimeout(() => {
            $('.select2').select2();
        }, 200);
    }


    //paging-----------------------------------

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
});