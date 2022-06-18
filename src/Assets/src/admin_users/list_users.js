app.controller('userCtrl', function ($scope, $http, $sce) {

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
        $scope.is_seoul = true;
        $scope.lsStores = stores;
        $scope.lsStores_tam = stores;
        $scope.lsGroups = lsGroups;
        $scope.all_companies = all_companies;
        $scope.store_spa = store_spa;
        $scope.store_spa_tam = store_spa;
        $scope.store_tgld = store_tgld;
        $scope.store_tgld_tam = store_tgld;
        $scope.groups_spa = lsGroups;
        $scope.groups_spa_tam = lsGroups;
        $scope.groups_tgld = lsGroups;
        $scope.groups_tgld_tam = lsGroups;
        $scope.permissions = permissions;
        $scope.all_store_spa_tgld = all_store_spa_tgld;
        $scope.currentUserId = id_current_user;
        $scope.isMaster = isMaster ? isMaster : 0;
        $scope.isDev = isDev ? isDev : 0;
        $scope.isHr = isHr ? isHr : 0;
        $scope.filter = {};
        $scope.isView = '';
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;
        $scope.filter.active = '2';
        $scope.loadLevel();
        $scope.loadDegrees();
        $scope.getAll();
        $scope.rows = [];
        $scope.images = [];
        $scope.contract = {};
        $scope.contract.images = [];
        $scope.fileOut = [];
        $scope.user = {};
        $scope.user.images = [];
        $scope.fileImages = [];
        $scope.sexs = [{
            id: 1,
            name: 'NAM'
        }, {
            id: 2,
            name: 'NỮ'
        }, {
            id: 3,
            name: 'KHÁC'
        }];
        $scope.status = {
            open: 1
        };
        $scope.positions = [];
        $scope.getAllPosition();
        $scope.getStatusUser();
        $scope.view = {
            type: 0,
            id: 0
        }
        $scope.getRoleEdit();
        $scope.user_stores = [];
        $scope.list_user_id = list_user_id;
        $scope.is_main = true;
        $scope.is_popup = '';
        $scope.store = {
            textStore: 'Chọn chi nhánh',
            main_store_id: '',
            stores: []
        };
        $scope.transfer = {
            isStore: true,
            isGroup: true
        }
        $scope.user_cls = {};
        $scope.errorAcabizJobTitleId = 0;
        $scope.errorAcabizGroupId = 0;
        $scope.errorAcabizEmail = 0;
        $scope.errorAcabizPhone = 0;
        $scope.userUpdatePasswordAcabiz = {};

        $scope.state_note = [];
        $scope.currentDate = currentDate;
    }


    $scope.converHtml = (htmlbd) => {
        return $sce.trustAsHtml(htmlbd);
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

    $scope.newDecision = (new_decision) => {
        $scope.cbwork.new_decision = new_decision
        $('.newDecision').slideToggle(300);
    }

    $scope.moveDetail = (id) => {
        window.open(base_url + '/staffs/add_order_quit/' + id);
    }

    $scope.getStoreName = (storeId) => {
        let st = $scope.lsStores.find(r => {
            return r.id == storeId
        });

        return st ? st.description : '';
    }

    $scope.getGroupName = (groupId) => {
        let gr = $scope.lsGroups.find(r => {
            return r.id == groupId
        });
        return gr ? gr.description : '';
    }

    $scope.transferStore = () => {
        $scope.transfer.isStore = !$scope.transfer.isStore;
        $scope.filter.main_store_id = '';
        $scope.filter.stores = [];
    }

    $scope.transferGroup = () => {
        $scope.transfer.isGroup = !$scope.transfer.isGroup;
        $scope.filter.main_group_id = '';
        $scope.filter.groups = [];
    }

    // fix lỗi khi click bỏ 1 chi nhánh nào đó trong select2 multiple (chi nhánh), thì không thể scroll page được
    $('.select2').on('select2:open', function (e) {
        const evt = "scroll.select2";
        $(e.target).parents().off(evt);
        $(window).off(evt);
    });

    $scope.changeAction = (val) => {
        $scope.is_main = val;
        if (val == true) {
            $scope.filter.stores = [];
        } else {
            $scope.filter.main_store_id = '';
        }
        select2();
    }

    $scope.handleFilter = () => {
        let arrStore = [];
        if ($scope.filter.company_id == 4) {
            $scope.lsStores_tam.forEach((store, key) => {
                if (store.company_id == 4) {
                    arrStore.push(store);
                }
            });
        }

        if ($scope.filter.company_id != 4) {
            $scope.lsStores_tam.forEach((store, key) => {
                if (store.company_id != 4) {
                    arrStore.push(store);
                }
            });
        }

        $scope.lsStores = arrStore;

        if (!$scope.filter.company_id || $scope.filter.company_id == '') {
            $scope.lsStores = $scope.lsStores_tam;
        }


        $scope.pagingInfo.currentPage = 1;
        $scope.pagingInfo.offset = 0;
        $scope.filter.offset = 0;
        $scope.filter.currentPage = 1;
        $scope.getAll();

        select2();
    }

    $scope.showPopup = (val) => {
        $scope.is_popup = val;
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

    $scope.getAll = (is_go_page = false) => {
        if (!is_go_page) { // nếu không phải gọi từ hàm chuyển trang thì set lại limit trang 1
            $scope.pagingInfo = {
                itemsPerPage: 30,
                offset: 0,
                to: 0,
                currentPage: 1,
                totalPage: 1,
                total: 0
            };

            $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
            $scope.filter.offset = 0;
        }

        $http.get(base_url + '/admin_users/ajax_get_all_users?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r.data.status == 1) {
                $scope.rows = r.data.data;
                $scope.pagingInfo.total = r.data.count;
                $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
            } else {
                toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
            }
        });
    }

    $scope.redirctToDetail = (id) => {
        window.open(base_url + '/admin_users/history/' + id);
    }




    //ADD USER---------------------


    $scope.openModel = (val, act) => {
        $scope.isAction = act;
        $scope.isView = act;
        $scope.view = {};
        $scope.state_note = [];
        if (val == 0) {
            $scope.status.open = 1;
            $scope.status.edit = 0;
            $scope.user = {};
            $scope.user.images = [];
            $('#modaluser').modal('show');
        } else {
            $scope.status.edit = 1;
            $scope.status.id = val;
            $scope.getUserDetail();
        }
    }


    $scope.next = (val) => {
        if (val == 2) {
            $('#form1').click();
        } else {
            $('#form2').click();
        }
    }

    $scope.changeView = (val, state) => {
        $scope.status.open = val;
    }

    $scope.changeGroupsSpa = () => {
        if ($scope.user.groups_spa && $scope.user.groups_spa.length > 0 && $scope.user.company_id != 4) {
            $http.get(base_url + '/admin_users/ajax_get_groups?filter=' + JSON.stringify($scope.user.groups_spa)).then(r => {
                if (r && r.data.status == 1) {

                    $scope.groups = r.data.data;
                    select2();
                } else toastr["error"]("Đã có lỗi xẩy ra!");
            });
        }
    }

    $scope.changeGroupsTGLD = () => {
        if ($scope.user.groups_tgld && $scope.user.groups_tgld.length > 0 && $scope.user.company_id == 4) {
            $http.get(base_url + '/admin_users/ajax_get_groups?filter=' + JSON.stringify($scope.user.groups_tgld)).then(r => {
                if (r && r.data.status == 1) {
                    $scope.groups = r.data.data;
                    select2();
                } else toastr["error"]("Đã có lỗi xẩy ra!");
            });
        }
    }

    $scope.changeStoreSpa = () => {
        if ($scope.store_spa.length == $scope.user.store_spa.length) {
            $scope.checkedAllStoresSpa = true;
        } else {
            $scope.checkedAllStoresSpa = false;
        }

        $scope.stores = [];
        let arrayStore = [...$scope.user.store_spa, ...$scope.user.store_tgld];
        $scope.all_store_spa_tgld.forEach(item => {
            if (arrayStore.includes(item.id)) {
                $scope.stores.push(item);
            }
        });
    }

    $scope.changeCompany = () => {
        if ($scope.user.user_permission.length == 2) {
            $scope.user.user_permission = $scope.user.user_permission;
        } else if ($scope.user.company_id == 4) {
            $scope.user.user_permission = ['4'];
        } else {
            $scope.user.user_permission = ['1'];
        }

        if ($scope.user.company_id == 4) {
            $scope.changeGroupsTGLD();
        } else {
            $scope.changeGroupsSpa();
        }

        if ($scope.user.company_id == $scope.user.company_id_tam) {
            $scope.user.main_group_id = $scope.user.main_group_id_tam;
            $scope.user.lead_groups = $scope.user.lead_groups_tam;
        } else {
            $scope.user.main_group_id = '';
            $scope.user.lead_groups = [];
        }
        $scope.changePerm();
        select2();
    }

    $scope.changePerm = () => {
        $scope.disableSpa = 0;
        $scope.disableTGLD = 0;

        if (typeof $scope.user.user_permission === 'undefined') {
            $scope.user.user_permission = [];
        }

        if ($scope.user.company_id == 4) {
            if ($scope.user.user_permission.includes("4") == false || $scope.user.user_permission.length == 0) {
                $scope.user.user_permission.push("4");
                toastr["error"]("bắt buộc chọn chi nhánh TGLĐ!");
            }
        } else {
            if ($scope.user.user_permission.includes("1") == false || $scope.user.user_permission.length == 0) {
                $scope.user.user_permission.push("1");
                toastr["error"]("bắt buộc chọn chi nhánh SeoulSpa!");
            }
        }

        if ($scope.user.user_permission.length == 2) {
            $('#user_permission option').prop('selected', true);
        }

        if ($scope.user.user_permission && $scope.user.user_permission.length == 2) {
            $scope.store_spa = $scope.store_spa_tam;
            $scope.groups_spa = $scope.groups_spa_tam;
            $scope.store_tgld = $scope.store_tgld_tam;
            $scope.groups_tgld = $scope.groups_tgld_tam;

            $scope.disableSpa = 0;
            $scope.disableTGLD = 0;
        } else if ($scope.user.user_permission.length == 0) {
            $scope.store_tgld = [];
            $scope.user.store_tgld = [];
            $scope.store_spa = [];
            $scope.user.store_spa = [];
            $scope.groups_spa = [];
            $scope.groups_tgld = [];

            $scope.user.store_spa = [];
            $scope.user.groups_spa = [];
            $scope.user.store_tgld = [];
            $scope.user.groups_tgld = [];
        } else {
            $scope.user.user_permission.forEach(item => {
                if (item == 1) {
                    $scope.store_spa = $scope.store_spa_tam;
                    $scope.store_tgld = [];
                    $scope.user.store_tgld = [];
                    $scope.groups_tgld = [];

                    $scope.user.store_tgld = [];
                    $scope.user.groups_tgld = [];

                    $scope.disableSpa = 0;
                    $scope.disableTGLD = 1;
                }

                if (item == 4) {
                    $scope.store_tgld = $scope.store_tgld;
                    $scope.store_spa = [];
                    $scope.user.store_spa = [];
                    $scope.groups_spa = [];

                    $scope.user.store_spa = [];
                    $scope.user.groups_spa = [];

                    $scope.disableSpa = 1;
                    $scope.disableTGLD = 0;
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

    $scope.changeStoreTGLD = () => {
        if ($scope.store_tgld.length == $scope.user.store_tgld.length) {
            $scope.checkedAllStoresTGLD = true;
        } else {
            $scope.checkedAllStoresTGLD = false;
        }

        $scope.stores = [];
        let arrayStore = [...$scope.user.store_spa, ...$scope.user.store_tgld];
        $scope.all_store_spa_tgld.forEach(item => {
            if (arrayStore.includes(item.id)) {
                $scope.stores.push(item);
            }
        });
    }

    $scope.setAllStoresSpa = () => {
        $scope.stores = [];
        if ($scope.checkedAllStoresSpa == true) {
            $scope.user.stores = getAllStores;
            // lấy danh sách chi nhánh chính khi check chọn tất cả
            $scope.user.store_spa = [];
            $scope.store_spa.forEach(item => {
                $scope.user.store_spa.push(item.id);
            });

            $scope.stores = $scope.all_store_spa_tgld;
        } else {
            // lấy danh sách chi nhánh chính khi bỏ check chọn tất cả
            $scope.user.store_spa = $scope.user.store_spa_id;

            $scope.all_store_spa_tgld.forEach(item => {
                if ($scope.user_stores_id.includes(item.id)) {
                    $scope.stores.push(item);
                }
            });
        }
        select2();
    }

    $scope.setAllStoresTGLD = () => {
        $scope.stores = [];
        if ($scope.checkedAllStoresTGLD == true) {
            $scope.user.stores = getAllStores;
            // lấy danh sách chi nhánh chính khi check chọn tất cả
            $scope.user.store_tgld = [];
            $scope.store_tgld.forEach(item => {
                $scope.user.store_tgld.push(item.id);
            });

            $scope.stores = $scope.all_store_spa_tgld;
        } else {
            // lấy danh sách chi nhánh chính khi bỏ check chọn tất cả
            $scope.user.store_tgld = $scope.user.store_tgld_id;

            $scope.all_store_spa_tgld.forEach(item => {
                if ($scope.user_stores_id.includes(item.id)) {
                    $scope.stores.push(item);
                }
            });
        }
        select2();
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

    $scope.getUserDetail = () => {
        $http.get(base_url + '/admin_users/ajax_get_user_detail?id=' + $scope.status.id).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.user = r.data.data;

                $scope.user.birthday = moment($scope.user.birthday).format('DD-MM-YYYY');
                $scope.user.id_date = moment($scope.user.id_date).format('DD-MM-YYYY');
                $scope.user.date_start = moment($scope.user.date_start).format('DD-MM-YYYY');
                $scope.user.bank_number = parseInt($scope.user.bank_number);

                $scope.user_stores_id = r.data.data.stores;
                $scope.user.user_permission = $scope.user.user_permission.map(i => { return i + ""; });
                $scope.user.interviewReviews.forEach((item, key) => {
                    $scope.user.interviewReviews[key].state_note = item.note_probation ? JSON.parse(item.note_probation) : [];
                });

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

                $scope.groups_spa_user_tam = $scope.user.groups_spa;
                $scope.groups_tgld_user_tam = $scope.user.groups_tgld;
                $scope.user.company_id_tam = $scope.user.company_id;
                $scope.user.main_group_id_tam = $scope.user.main_group_id;
                $scope.user.lead_groups_tam = $scope.user.lead_groups;

                $('#modaluser').modal('show');
                $scope.changeNation();
                $scope.changeProvice();
                $scope.changePerm();
                $scope.changeCompany();

                if ($scope.store_spa.length == $scope.user.store_spa.length) {
                    $scope.checkedAllStoresSpa = true;
                } else {
                    $scope.checkedAllStoresSpa = false;
                }

                if ($scope.store_tgld.length == $scope.user.store_tgld.length) {
                    $scope.checkedAllStoresTGLD = true;
                } else {
                    $scope.checkedAllStoresTGLD = false;
                }

                select2();
            }
        })
    }

    $scope.saveInformationUser = () => {
        $scope.loading = true;
        $http.post(base_url + '/admin_users/ajax_update_info_user', $scope.user).then(r => {
            if (r.data && r.data.status == 1) {
                toastr["success"]("Cập nhật thành công!");
                $scope.loading = false;
                $scope.getAll();
            } else toastr["error"](r.data && r.data.status != 1 ? r.data.message : "Đã có lỗi xẩy ra!");
        });
    }

    $scope.saveAcountUser = () => {
        var confrim = 1;
        $scope.user.user_permission.forEach(per => {
            if (per == '4') {
                if ($scope.user.store_tgld.length == 0) {
                    toastr["error"]("Vui lòng chọn chi nhánh TGLĐ!");
                    confrim = 0;
                    return false;
                }

                if ($scope.user.groups_tgld.length == 0) {
                    toastr["error"]("Vui lòng nhóm quản trị TGLĐ!");
                    confrim = 0;
                    return false;
                }
            }

            if (per == '1') {
                if ($scope.user.store_spa.length == 0) {
                    toastr["error"]("Vui lòng chọn chi nhánh Spa!");
                    confrim = 0;
                    return false;
                }

                if ($scope.user.groups_spa.length == 0) {
                    toastr["error"]("Vui lòng nhóm quản trị Spa!");
                    confrim = 0;
                    return false;
                }
            }
        });


        if (confrim == 1) {
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
    }

    $scope.handleSaveImage = () => {
        $http.post(base_url + '/admin_users/ajax_update_img_profile', $scope.user).then(r => {
            if (r.data && r.data.status == 1) {
                toastr["success"]("Cập nhật thành công!");
            } else toastr["error"](r.data && r.data.status != 1 ? r.data.message : "Đã có lỗi xẩy ra!");
        });
    }

    $scope.formatDate = (d, fm) => {
        return moment(d).format(fm);
    }

    //ADD CONTRACT---------------

    $scope.changeContract = (item) => {
        $scope.user = item;
        $scope.isView = 'CONTRACT';
        $scope.contract = {};
        $scope.contract.images = [];
        $('#contact').modal('show');
    }

    $scope.addContact = () => {
        if ($scope.user.id) {
            $scope.contract.user_id = $scope.user.id;
            if (!$scope.contract.status_id) {
                $scope.contract.status_id = 17
            }
            $http.post(base_url + '/admin_users/change_status_user', $scope.contract).then(r => {
                if (r.data && r.data.status == 1) {
                    toastr["success"]("Gia hạn hoặc chuyển đổi hợp đồng thành công!");
                    $('#contact').modal('hide');
                    $scope.getAll();
                } else toastr["error"](r.data && r.data.status != 1 ? r.data.message : "Đã có lỗi xẩy ra. Vui lòng thử lại!");
            });
        }
    }

    //ADD CONTRACT--------------- 

    $scope.showModalCBWord = (item) => {
        $scope.user_id_cb = item.id;
        $('#modalCBWord').modal('show');
    }

    $scope.callBackCBWord = () => {
        $('#modalCBWord').modal('show');
        $('#cbwork').modal('hide');
    }

    $scope.userCBWork = (status) => {
        $('#modalCBWord').modal('hide');
        $('.newDecision').css("display", "none");

        $scope.cbwork = {
            id: $scope.user_id_cb,
            images: []
        }

        $scope.cbwork.status_id = status;

        $scope.cbwork.new_decision = 0;
        $scope.cbwork.onWP = 0;
        $scope.cbwork.onCRM = 0;

        $scope.cbwork.date_expires = '';
        if ($scope.cbwork.status_id == -1) {
            $scope.cbwork.date_start = $scope.currentDate;
        } else {
            $scope.cbwork.date_start = '';
            $scope.cbwork.onWP = 0;
            $scope.cbwork.onCRM = 0;
        }

        $('#cbwork').modal('show');
    }

    $scope.confirmUserWork = () => {
        if ($scope.cbwork.status_id == -1) { // nếu là hình thức tạm mở lại nhân sự
            if ($scope.cbwork.onWP == 0 && $scope.cbwork.onCRM == 0) {
                toastr.error('Bạn chưa chọn mở lại Workplace hay CRM!');
                return;
            }

            if (!$scope.cbwork.date_expires) {
                toastr["error"]("Vui lòng nhập ngày hết hạn!");
                return false;
            }

            if (!$scope.cbwork.note || $scope.cbwork.note == '') {
                toastr.error('Vui lòng nhập ghi chú!');
                return;
            }
        } else {
            if (!$scope.cbwork.date_start) {
                toastr["error"]("Vui lòng nhập ngày bắt đầu!");
                return false;
            }
        }

        var mess = 'Xác nhận mở khoá ';

        if ($scope.cbwork.onWP == 1 && $scope.cbwork.onCRM == 1) {
            mess = mess + ' Workplace và CRM'; 
        } else if ($scope.cbwork.onWP == 1) {
            mess = mess + ' Workplace';
        } else {
            mess = mess + ' CRM'; 
        }

        swal({
            title: "",
            text: $scope.cbwork.status_id == -1 ? mess : "Xác nhận nhân viên đi làm lại",
            type: "warning",
            showCancelButton: true,
            confirmButtonClass: "btn-danger",
            confirmButtonText: "Xác nhận",
            cancelButtonText: "Đóng",
            closeOnConfirm: true,
            showLoaderOnConfirm: true
        }, function () {
            $scope.cbloading = true;
            $http.post(base_url + '/admin_users/ajax_set_user_come_back', $scope.cbwork).then(r => {
                if (r.data && r.data.status == 1) {
                    $scope.cbloading = false;
                    $('#cbwork').modal('hide');
                    toastr["success"]("Cập nhật thành công!");
                    $scope.getAll();
                    if ($scope.cbwork.status_id == -1) {
                        window.open(base_url + 'staffs/off_unlock_user/' + r.data.data.id);
                    }
                } else {
                    $scope.cbloading = false;
                    toastr["error"](r.data && r.data.status != 1 ? r.data.message : "Đã có lỗi xẩy ra. Vui lòng thử lại!");
                }
            });
        });

        
    }

    //WORKPLCACE-------------------------

    $scope.createWP = () => {
        $('#wp').modal('hide');
        $http.post(base_url + '/admin_users/ajax_create_wp', $scope.dataWP).then(r => {
            if (r.data && r.data.status == 1) {
                toastr["success"]("Tạo thành công!");
                $scope.linkWP = r.data.claimLink;
                toastr['success']('Đã coppy link');
                copyPhoneToClipboard(r.data.claimLink);
            } else toastr["error"](r.data && r.data.status != 1 ? r.data.message : "Đã có lỗi xẩy ra. Vui lòng thử lại!");
        });
    }

    $scope.handleWP = (val, user) => {
        if (val == 2) {
            $scope.dataWP = angular.copy(user);
            $('#wp').modal('show');
            $('#modalOutsideAccount').modal('hide');
        }
        if (val == 1) {
            window.open('https://diemnhangroup.workplace.com/profile.php?id=' + user.wp_id);
        }

        if (val == 3) {
            $http.post(base_url + '/admin_users/ajax_get_back_wp', user).then(r => {
                if (r.data && r.data.status == 1) {
                    toastr['success']('Đã coppy link');
                    copyPhoneToClipboard(r.data.claimLink);
                    $('#modalOutsideAccount').modal('hide');
                } else toastr["error"](r.data && r.data.status != 1 ? r.data.message : "Đã có lỗi xẩy ra. Vui lòng thử lại!");
            });
        }

    }

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

    //WORKPLCACE-------------------------






    //-----GET NATION ------------------

    $scope.changeNation = () => {
        $http.get(base_url + '/admin_users/ajax_get_provinces?nation_id=' + $scope.user.nation_id).then(r => {
            if (r && r.data.status == 1) {
                $scope.provinces = r.data.data;
                select2();
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }
    $scope.changeProvice = () => {
        $http.get(base_url + '/admin_users/ajax_get_district/?province_id=' + $scope.user.province_id).then(r => {
            if (r && r.data.status == 1) {
                $scope.districts = r.data.data;
                select2();
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    //-----GET NATION ------------------









    //--------------------IMAGE----------------------

    $scope.removeImage = (url, index) => {
        if ($scope.isView == 'CONTRACT') {
            $scope.contract.images.splice(index, 1);
        } else {
            $scope.user.images.splice(index, 1);
        }

    }

    $scope.getImg = (img) => {
        return base_url + img;
    }

    $scope.dzOptionsImgCBWork = {
        paramName: 'file',
        maxFilesize: '10',
        resizeWidth: 1200,
        url: base_url + '/admin_users/ajax_new_upload_image_user',
        acceptedFiles: 'image/*',
        dictDefaultMessage: 'Kéo thả hồ sơ tại đây'
    };

    $scope.dzCBImgCBWork = {
        'success': function (file, resp) {
            let res = JSON.parse(resp);
            if (res.status == 1) {
                $scope.cbwork.images.push({
                    url: res.data.url,
                    file: res.data.file,
                    type: '1'
                });
            } else toastr['error']('Có lổi xẩy ra. Vui lòng thử lại!')
            $('.dz-image').remove();
        }
    };

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

    $scope.getUrlImg = (img) => {
        return base_url + img;
    }

    //--------------------IMAGE----------------------

    $scope.checkInArray = (id) => {
        if (jQuery.inArray(id, $scope.list_user_id) != -1) {
            return true;
        } else {
            return false;
        }
    }

    //ROLE EDIT USER 

    $scope.getRoleEdit = () => {
        $scope.RoleEdit = {
            acount: [],
            user: [],
            doc: []
        };
        $http.get(base_url + '/user_interviews/ajax_get_option?name=' + 'ROLE_EDIT_USER').then(r => {
            if (r.data && r.data.status == 1) {
                $scope.RoleEdit = JSON.parse(r.data.data.value);
            }
        })
    }

    $scope.checkRoleEdit = (type) => {
        if ($scope.isMaster == 1 || $scope.isDev == 1) return true;
        if ($scope.RoleEdit) {
            let role = [];
            if (type == 1) role = $scope.RoleEdit.acount ? $scope.RoleEdit.acount : [];
            if (type == 2) role = $scope.RoleEdit.user ? $scope.RoleEdit.user : [];
            if (type == 3) role = $scope.RoleEdit.doc ? $scope.RoleEdit.doc : [];
            if (type == 4) role = $scope.RoleEdit.off ? $scope.RoleEdit.off : [];

            let us = role.find(r => {
                return r.id == $scope.currentUserId
            });
            return us ? true : false;
        }
        return false;
    }
    //

    $scope.showImg = (url) => {
        $scope.currentImg = url;
        $('#image').modal('show');
    }

    function select2() {
        setTimeout(() => {
            $('.select2').select2();
        }, 200);
    }

    $scope.checkkey = (event) => {
        var keys = {
            'up': 38,
            'right': 39,
            'down': 40,
            'left': 37,
            'escape': 27,
            'backspace': 8,
            'tab': 9,
            'enter': 13,
            'del': 46,
            '0': 48,
            '1': 49,
            '2': 50,
            '3': 51,
            '4': 52,
            '5': 53,
            '6': 54,
            '7': 55,
            '8': 56,
            '9': 57,
            'dash': 189,
            'subtract': 109
        };

        for (var index in keys) {
            if (!keys.hasOwnProperty(index)) continue;
            if (event.charCode == keys[index] || event.keyCode == keys[index]) {
                return; //default event
            }
        }
        event.preventDefault();
    }


    function formatCurrency(val) {
        if (val && val != '') {
            // let val = Number((value + '').replace(/,/g, ""));
            // this.appFormatVNChange.next(val.toLocaleString());
            val = val + '';
            val = val.replace(/,/g, "")
            val += '';
            let x = val.split('.');
            let x1 = x[0];
            let x2 = x.length > 1 ? '.' + x[1] : '';

            var rgx = /(\d+)(\d{3})/;

            while (rgx.test(x1)) {
                x1 = x1.replace(rgx, '$1' + ',' + '$2');
            }
            return x1 + x2;

        } else {
            return '';
        }
    }

    $scope.formatSalary = () => {
        if ($scope.cbwork.salary && $scope.cbwork.salary != '') {
            $scope.cbwork.salary = formatCurrency($scope.cbwork.salary);
        } else {
            $scope.cbwork.salary = '';
        }
    }

    $scope.formatSubsidy = () => {
        if ($scope.cbwork.subsidy && $scope.cbwork.subsidy != '') {
            $scope.cbwork.subsidy = formatCurrency($scope.cbwork.subsidy);
        } else {
            $scope.cbwork.subsidy = '';
        }
    }

    // Create account user cls

    $scope.getInfoUser = (item) => {
        var code_cls = item.id;
        if (code_cls.length < 4) {
            for(let i = 0; i < (4 - item.id.length); i++) {
                code_cls = '0'+ code_cls;
            }
        }
        
        $scope.user_cls = {
            user_code_cls: code_cls,
            user_id: item.id,
            user_name: item.phone,
            password: '',
            first_name: item.first_name,
            last_name: item.last_name,
            phone: item.phone,
            email: item.email,
            gender: item.sex,
            type: '',
            group: '',
            organization: '',
            position: '',
        }

        if (item.id_cls) {
            $scope.user_cls.id_cls = item.id_cls
        }
    }

    $scope.resetFormAccCls = () => {
        $scope.user_cls.password = '';
        $scope.user_cls.type = '';
        $scope.user_cls.group = '';
        $scope.user_cls.organization = '';
        $scope.user_cls.position = '';
        $scope.select2();
    }

    $scope.openPopupUserAcountCls = () => {
        $scope.resetFormAccCls();
        $scope.getListUserGroupCls();
        $scope.getListOrgs();
        $scope.getListUserTypeCls();
        var input = $('.input-password-cls').find('input');
        if (input.attr("type") != "password") {
            input.removeClass('fa-eye fa-eye-slash"');
            input.attr("type", "password");
        }
        $('#createAccountCls').modal('show');
    }

    $scope.createAccountCls = () => {
        var data_rq = angular.copy($scope.user_cls);
        var reg_email = /^[a-zA-Z0-9][\-_\.\+\!\#\$\%\&\'\*\/\=\?\^\`\{\|]{0,1}([a-zA-Z0-9][\-_\.\+\!\#\$\%\&\'\*\/\=\?\^\`\{\|]{0,1})*[a-zA-Z0-9]@[a-zA-Z0-9][-\.]{0,1}([a-zA-Z][-\.]{0,1})*[a-zA-Z0-9]\.[a-zA-Z0-9]{1,}([\.\-]{0,1}[a-zA-Z]){0,}[a-zA-Z0-9]{0,}$/g;
        var name_key = {
                user_code_cls:'Mã người dùng',
                user_id:'Mã nhân viên crm',
                user_name:'Tên đăng nhập', 
                password:'Mật khẩu',
                first_name:'Tên',
                last_name:'Họ',
                phone:'Số điện thoại',
                email:'Email',
                gender:'Giới tính',
                type:'Kiểu người dùng',
                group:'Nhóm người dùng',
                organization:'Cơ cấu tổ chức',
                position:'Vị trí chức danh'
        };

        for (const key in data_rq) {
            if (!data_rq[key] && key != 'email_cls') {
                console.log(key);             
                showMessErr(name_key[key] + ' không được trống');                
                return;
            }
        }

        if (data_rq.user_code_cls.length < 4 || data_rq.user_code_cls.length > 30) {
            showMessErr('Mã người dùng phải từ 4 đến 30 ký tự');
            return;
        }

        if (data_rq.first_name.length > 30) {
            showMessErr('Tên phải nhỏ hơn 30 ký tự');
            return;
        }

        if (data_rq.last_name.length > 30) {
            showMessErr('Họ phải nhỏ hơn 30 ký tự');
            return;
        }

        if (data_rq.password.trim().length < 6) {
            showMessErr('Mật khẩu phải lớn hơn hoặc bằng 6 ký tự');
            return;
        }

        if (data_rq.user_name.length > 30 || data_rq.user_name.length < 4) {
            showMessErr('Tên đăng nhập phải từ 4 - 30 ký tự');
            return;
        }

        if (data_rq.email.length < 6) {
            showMessErr('Email phải lớn hơn 6 ký tự');
            return;
        }

        if (!data_rq.email.match(reg_email)) {
            showMessErr('Email không hợp lệ. Vui lòng kiểm tra lại!');
            return;
        }

        if (data_rq.phone.length > 12 || data_rq.phone.length < 9) {
            showMessErr('Số điện thoại không đúng');
            return;
        }

        $scope.load_create_cls = true;
        $http.post(base_url + 'admin_users/ajax_create_account_cls', data_rq).then(r => {
            $scope.load_create_cls = false;
            if (r.data.status == 1) {
                $scope.user_cls.id_cls = r.data.data;
                $scope.OutsideAccount.id_cls = r.data.data
                $scope.getAll();
                $('#createAccountCls').modal('hide');
                showMessSuccess(r.data.message);
            } else {
                showMessErr(r.data.message);
            }
        })
    }

    $scope.getListPositions = () => {
        $('#ls-positions .select2-container').addClass('loadingv2');
        $scope.user_cls.position = '';
        $scope.positions_cls = [];

        if (!$scope.user_cls.organization) {
            $('#ls-positions .select2-container').removeClass('loadingv2');
            $scope.select2();
            return;
        }
        var data_rq = {
            org: $scope.user_cls.organization
        }

        $http.get(base_url + 'admin_users/ajax_get_list_position_cls?' + $.param(data_rq)).then(r => {
            $('#ls-positions .select2-container').removeClass('loadingv2');
            if (r.data.status == 1) {
                $scope.positions_cls = r.data.data;
                $scope.select2();
            } else {
                showMessErr(r.data.message);
            }
        })
    }

    $scope.select2 = () => {
        setTimeout(() => {
            $('.select2').select2();
        }, 100);
    }

    $scope.getListOrgs = () => {
        $http.get(base_url + 'admin_users/ajax_get_list_organizational_cls').then(r => {
            if (r.data.status == 1) {
                $scope.listOrgs = r.data.data.pageLists;
            } else {
                showMessErr(r.data.message);
            }
        })
    }

    $scope.getListUserGroupCls = () => {
        $http.get(base_url + 'admin_users/ajax_get_list_user_group_cls').then(r => {
            if (r.data.status == 1) {
                $scope.listUserGroups = r.data.data.pageLists;
            } else {
                showMessErr(r.data.message);
            }
        })
    }

    $scope.getListUserTypeCls = () => {
        $http.get(base_url + 'admin_users/ajax_get_list_user_type_cls').then(r => {
            if (r.data.status == 1) {
                $scope.listUserTypes = r.data.data.pageLists;
            } else {
                showMessErr(r.data.message);
            }
        })
    }

    $scope.closePopup = () => {
        swal({
                title: "Thông báo",
                text: "Bạn có chắc chắn muốn đóng hộp thoại làm việc này?",
                type: "warning",
                showCancelButton: true,
                confirmButtonClass: "btn-danger",
                confirmButtonText: "Xác nhận",
                cancelButtonText: "Đóng",
                confirmButtonColor: "#dc3741",
                closeOnConfirm: true,
                showLoaderOnConfirm: true,
            },
            function (isConfirm) {
                if (isConfirm) {
                    $('#createAccountCls').modal('hide');
                }
            });
    }

    //paging-----------------------------------

    $scope.go2Page = function (page) {
        if (page < 0) return;
        var pi = $scope.pagingInfo;
        pi.currentPage = page;
        pi.from = pi.offset = (pi.currentPage - 1) * pi.itemsPerPage;
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = ($scope.pagingInfo.currentPage - 1) * $scope.pagingInfo.itemsPerPage;
        $scope.getAll(true);
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

    $scope.showModalOutsideAccount = (item) => {
        $scope.OutsideAccount = item;
        $scope.getInfoUser(angular.copy(item));
        $('#modalOutsideAccount').modal('show');
    }

    $(".toggle-password").click(function () {
        $(this).toggleClass("fa-eye fa-eye-slash");
        var input = $(this).closest('.input-password-cls').find('input');
        if (input.attr("type") == "password") {
            input.attr("type", "text");
        } else {
            input.attr("type", "password");
        }
    });
});

$(document).on('input', 'input[name="phone_cls"]', function () {
    var self = $(this)
    self.val(self.val().replace(/[^\d]{12,}/, '').replace(/\D/g, '').replace(/\s/g, ''));
});

$(document).on('input', 'input[name="password"]', function () {
    var self = $(this)
    self.val(self.val().replace(/\s/g, ''));
});

app.filter('momentFormat', function () {
    return (value, format) => {
        return moment(value, 'YYYY-MM-DD HH:mm:ss').format(format);
    };
});