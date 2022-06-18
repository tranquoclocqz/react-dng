app.controller('accountCtrl', function($scope, $http, $sce) {

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
        $scope.isAccount = isAccount;
        $scope.isStore = isStore;
        $scope.isGroup = isGroup;
        $scope.filter_status = filter_status;
        $scope.filter = {};
        $scope.filter.dev = isDev;
        $scope.load = 0;
        $scope.note = {};
        $scope.plusDomain = [1];
        $scope.filter.down = 0;
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;
        $scope.filter.isDate = 1;
        $scope.loadding = true;
        $scope.search_user = {};
        $scope.search_confirm = {};
        $scope.search_related = {};
        $scope.search_user_verifier = {};

        if ($scope.filter_status) {
            $scope.filter.status = $scope.filter_status + '';
        }

        $scope.getAll();

        $scope.filter.status = '';

        setTimeout(() => {
            $scope.getStore();
            $scope.getGroup();
        }, 1000);
    }
    $scope.imageUpload = function(event) {
        var formData = new FormData();
        var files = event.target.files;
        $scope.loadding = true;
        if (files.length > 0) {
            for (var i = 0; i < files.length; i++) {
                formData.append("file[]", files[i]);
            }
            $http.post(base_url + '/requests/images', formData, {
                headers: { 'Content-Type': undefined }
            }).then(r => {
                if (r.data && r.data.status == 1) {
                    r.data.data.forEach(element => {
                        $scope.img.push(element);
                    });
                } else {
                    toastr["error"]('Có lổi xẩy ra. Vui lòng thử lại!');
                }
                $scope.loadding = false;
            }).catch(e => {
                toastr['error']("Đã có lỗi máy chủ API hình");
                $scope.loadding = false;
            });
        }
    }

    $scope.img_delete = (index) => {
        $scope.img.splice(index, 1);
    }
    $scope.linkToDetail = (item) => {
        window.open(base_url + 'requests/task_requets_detail/' + item.id);
    }
    $scope.openModal = (item, view) => {
        $scope.loadSubmitForm = false;
        $scope.view = view;
        $scope.search_note = {};
        $scope.list_note_search = [];
        $scope.search_note_list = {};
        $scope.list_sub_user_search = [];
        $scope.list_user_confirm = [];
        $scope.list_sub_user = [];
        $scope.search_verifier = {};
        $scope.list_search_verifier = [];
        $scope.search_supplier = {};
        $scope.list_search_supplier = [];
        $scope.search_construction = {};
        $scope.list_search_construction = [];
        $scope.load = 0;
        $scope.total = 0;
        $scope.note = {};
        $scope.img = [];
        $scope.images = [];
        $scope.listUser = [];
        $scope.coupon = "";
        $scope.note.type = item;
        $scope.note.store_id = "" + $scope.isStore;
        $scope.note.main_group_id = $scope.isGroup;
        if ($scope.note.type == 4 || $scope.note.type == 5) {
            $scope.note.pay = "2";
            $scope.note.pay_for_type = "2";
            $scope.get_current_user_bank();
        }
        if (item == 3) {
            $scope.note.product_id = 0;
            $scope.getSupplier();
            $scope.search_product = {};
        }
        $scope.getStoreUser();
        $('#accountModal').modal('show');
        select2();
    }

    $scope.get_current_user_bank = () => {
        let url = 'requests/get_user_bank?';
        $http.get(base_url + url).then(res => {
            if (res.data.status == 1) {
                $scope.userBankAccount = res.data.data.bank_account;
                $scope.userBankNumber = res.data.data.bank_number;
            } else toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
        }).catch(e => {
            toastr["error"]("Đã có lỗi xảy ra với máy chủ API");
        });
    }

    $scope.getAll = (is_go_page = false) => {
        $scope.loadding = true;
        $scope.listUser = [];

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

        $http.get(base_url + 'requests/get_task_requets?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r.data.status == 1) {
                $scope.rows = r.data.data.data;
                $scope.pagingInfo.total = r.data.data.count;
                $scope.pagingInfo.totalPage = Math.ceil(r.data.data.count / pi.itemsPerPage);
                $.each($scope.rows, function(key, value) {

                    $scope.rows[key].listUser = [];
                    $.each(value.list, function(k, v) {
                        $scope.rows[key].listUser.push(v);
                    });
                    $.each(value.list_user, function(i, val) {
                        let err = true;
                        $.each($scope.rows[key].listUser, function(k, v) {
                            if (val.id == v.id) {
                                err = false;
                            }
                        });
                        if (err == true) {
                            $scope.rows[key].listUser.push(val);
                        }
                    });
                });
                $scope.sumTask = r.data.data.sumTask;
                setTimeout(function() {
                    note_sort();
                }, 500);
                select2();
                $scope.loadding = false;
            } else toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
        });
    }
    $scope.click_ = (id) => {
        $scope.filter.down = id;
        $scope.getAll();
        if (id == 1) {
            $(".imgup").css('filter', 'brightness(0.5)');
            $(".imgdown").css('filter', 'brightness(1.5)');
        } else {
            $(".imgup").css('filter', 'brightness(1.5)');
            $(".imgdown").css('filter', 'brightness(0.5)');
        }
    }
    $scope.addCash = () => {
        if (!$scope.note.title || $scope.note.title == '') {
            return toastr["error"]('Vui lòng nhập tiêu đề!');
        }

        let number = Number($scope.note.price);
        if ($scope.note.type == 5 || $scope.note.type == 4) {
            if (number == 0 || !$scope.note.price) {
                return toastr["error"]('Vui lòng nhập số tiền!');
            }
        }

        if ($scope.list_user_confirm.length == 0) {
            return toastr["error"]('Vui lòng chọn người duyệt!');
        }

        if ($scope.list_sub_user.length == 0 && $scope.note.type != 1 && $scope.note.type != 2) {
            return toastr["error"]('Vui lòng chọn bộ phận xử lý!');
        }

        if (!$scope.note.store_id) {
            return toastr["error"]('Vui lòng chọn chi nhánh!');
        }

        if (($scope.note.type == 4 || $scope.note.type == 5) && $scope.note.pay_for_type == 2) {
            if (!$scope.note.supplier_id || $scope.note.supplier_id <= 0) {
                return toastr["error"]('Vui lòng chọn nhà cung cấp');
            }
        }

        if ($scope.note.type == 5 || $scope.note.type == 4) {
            if (!$scope.note.number_pay || $scope.note.number_pay == '') {
                return toastr["error"]('Vui lòng nhập số tài khoản ngân hàng!');
            }

            if (!$scope.note.name_pay || $scope.note.name_pay == '') {
                return toastr["error"]('Vui lòng nhập tên tài khoản ngân hàng!');
            }

            if (!$scope.note.bank_pay || $scope.note.bank_pay == '') {
                return toastr["error"]('Vui lòng nhập tên ngân hàng!');
            }
        }
        
        if (!$scope.note.note || $scope.note.note == '') {
            return toastr["error"]('Vui lòng nhập ghi chú');
        }

        if ($scope.list_sub_user.length > 0) {
            $scope.note.related_division = [];
            $scope.list_sub_user.forEach(element => {
                $scope.note.related_division.push(element.id);
            });
        }

        if ($scope.list_user_confirm.length > 0) {
            $scope.note.list_user_confirm = [];
            $scope.list_user_confirm.forEach(element => {
                $scope.note.list_user_confirm.push(element.id);
            });
        }

        $scope.loadSubmitForm = true;
        let fd = new FormData();
        let url_post;
        fd.append('data', JSON.stringify($scope.note));
        fd.append('data_img', JSON.stringify($scope.img));
        url_post = 'insert_task_requets';
        $scope.load++;
        if ($scope.load == 1) {
            $http.post(base_url + '/requests/' + url_post, fd, {
                headers: { 'Content-Type': undefined }
            }).then(r => {
                if (r.data && r.data.status == 1) {
                    toastr["success"](r.data.message ? r.data.message : 'Thành công!');
                    $scope.getAll();
                    $('#accountModal').modal('hide');
                    setTimeout(function() {
                        note_sort();
                    }, 500);
                    $scope.note.id = r.data.id;
                    $scope.note.user_created_id = $scope.isAccount;
                    $scope.images = [];

                    // if ($scope.note.type == 4 || $scope.note.type == 5) {
                        $scope.sendWpCreateTaskRequest($scope.note);
                    // } else {
                    //     $scope.sendMail($scope.note);
                    // }
                } else {
                    toastr["error"](r.data.message ? r.data.message : 'Có lổi xẩy ra. Vui lòng thử lại!');
                    $scope.load = 0;
                }
                $scope.loadSubmitForm = true;
            }).catch(e => {
                toastr['error']("Đã có lỗi máy chủ API");
                $scope.loadSubmitForm = true;
            });
        }
    }

    $scope.sendWpCreateTaskRequest = (item) => {
        $http.post(base_url + 'requests/send_wp_create_task_requests', item).then(r => {
            $scope.load = 0;
        });
    }

    $scope.sendMail = (item) => {
        $http.post(base_url + 'requests/send_message_task_requests', item).then(r => {
            $scope.load = 0;
        });
    }

    $scope.checkCoupon = (item) => {
        if ($scope.note.id_parents != item.id) {
            $scope.note.id_parents = item.id;
            $scope.coupon = "Mã phiếu(" + item.id + ") - " + item.title;
        } else {
            $scope.note.id_parents = 0;
            $scope.coupon = "";
        }
    }

    $scope.searchProduct = () => {
        let name = $scope.search_product.name;
        $scope.search_product.load = true;
        if (!name || name.length < 3) return true;
        if ($scope.filter_timer) {
            clearTimeout($scope.filter_timer);
        }
        $scope.filter_timer = setTimeout(() => {
            $scope._searchProduct(name);
        }, 350);
    }

    $scope._searchProduct = (name) => {
        let url = 'requests/task_get_product?filter=';
        $http.get(base_url + url + JSON.stringify(name)).then(res => {
            if (res.data.status == 1) {
                $scope.list_product = res.data.data;
            } else toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
            $scope.search_product.load = false;
        });
    }

    $scope.chooseItemSearchProduct = (item) => {
        $scope.note.product_id = item.id;
        $scope.search_product.parent_name = item.description;
        $scope.removeProductList();
    }

    $scope.removeProductList = () => {
        $scope.search_product.name = "";
        $scope.list_product = [];
    }
    $scope.removeProduct = () => {
        $scope.note.product_id = 0;
        $scope.search_product = {};
    }

    // $scope.linkToDetail = (i) => {
    //     window.open(base_url + 'requests/task_requets_detail/' + i.id, "_self");
    // }

    $scope.openDate = () => {
        $("#reportrange").css('display', 'block');
        $("#removerange").css('display', 'none');
        $scope.filter.isDate = 2;
    }

    function note_sort() {
        var items = document.getElementsByClassName("note_css");
        for (var i = 0; i < items.length; i++) {
            var divHeight = items[i].offsetHeight;
            var lines = divHeight / 18;
            if (lines < 2 || lines == 2) {
                items[i].parentElement.childNodes[3].style.display = "none";
            } else {
                items[i].parentElement.childNodes[1].style.display = "-webkit-box";
            }
        }
    }

    $scope.viewPrice = (item) => {
        let val = item;
        val = val.replace(/,/g, "")
        val += '';
        x = val.split('.');
        x1 = x[0];
        x2 = x.length > 1 ? '.' + x[1] : '';
        let rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2
    }

    $scope.searchUsertList = (view) => {
        let key = '';
        if (view == 1) {
            if (!$scope.search_user.key || $scope.search_user.key.length < 3) {
                return true;
            } else {
                key = $scope.search_user.key;
            }
        }
        if (view == 2) {
            if (!$scope.search_confirm.key || $scope.search_confirm.key.length < 3) {
                return true;
            } else {
                key = $scope.search_confirm.key;
            }
        }
        if (view == 3) {
            if (!$scope.search_related.key || $scope.search_related.key.length < 3) {
                return true;
            } else {
                key = $scope.search_related.key;
            }
        }
        if (view == 4) {
            if (!$scope.search_note.key || $scope.search_note.key.length < 3) {
                return true;
            } else {
                key = $scope.search_note.key;
            }
        }

        if (view == 5) {
            if (!$scope.search_note_list.key || $scope.search_note_list.key.length < 3) {
                return true;
            } else {
                key = $scope.search_note_list.key;
            }
        }

        if (view == 6) {
            if (!$scope.search_verifier.key || $scope.search_verifier.key.length < 3) {
                return true;
            } else {
                key = $scope.search_verifier.key;
            }
        }

        if (view == 7) {
            if (!$scope.search_user_verifier.key || $scope.search_user_verifier.key.length < 3) {
                return true;
            } else {
                key = $scope.search_user_verifier.key;
            }
        }

        if ($scope.search_timer) {
            clearTimeout($scope.search_timer);
        }

        $scope.search_timer = setTimeout(() => {
            $scope._searchUsertList(key, view);
        }, 350);
    }

    $scope._searchUsertList = (key, view) => {
        if (view == 1) {
            $scope.loadding_user1 = true;
        }
        if (view == 2) {
            $scope.loadding_user2 = true;
        }
        if (view == 3) {
            $scope.loadding_user3 = true;
        }
        if (view == 4) {
            $scope.loadding_user4 = true;
        }
        if (view == 6) {
            $scope.loadding_user6 = true;
        }
        if (view == 5) {
            $scope.loadding_user5 = true;
        }
        if (view == 7) {
            $scope.loadding_user7 = true;
        }
        $scope.search = {};
        $scope.search.key = key;
        let url = 'requests/task_get_user?filter=';
        $http.get(base_url + url + JSON.stringify($scope.search)).then(res => {
            if (res.data.status == 1) {
                if (view == 1) {
                    $scope.list_user_search = res.data.data;
                }
                if (view == 2) {
                    $scope.list_confirm_search = res.data.data;
                }
                if (view == 3) {
                    $scope.list_related_search = res.data.data;
                }
                if (view == 4) {
                    $scope.list_note_search = res.data.data;
                }
                if (view == 6) {
                    $scope.list_search_verifier = res.data.data;
                }
                if (view == 7) {
                    $scope.list_search_user_verifier = res.data.data;
                }
                if (view == 5) {
                    $scope.list_sub_user_search = res.data.data;
                    $scope.list_sub_user_search.forEach((element) => {
                        $dem = $scope.list_sub_user.filter(item => item.id == element.id);
                        if ($dem.length == 0) {
                            element.type = 0;
                        } else {
                            element.type = 1;
                        }
                    });
                }

            } else toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
            if (view == 1) {
                $scope.loadding_user1 = false;
            }
            if (view == 2) {
                $scope.loadding_user2 = false;
            }
            if (view == 3) {
                $scope.loadding_user3 = false;
            }
            if (view == 4) {
                $scope.loadding_user4 = false;
            }
            if (view == 6) {
                $scope.loadding_user6 = false;
            }
            if (view == 5) {
                $scope.loadding_user5 = false;
            }
            if (view == 7) {
                $scope.loadding_user7 = false;
            }
        }).catch(e => {
            toastr['error']("Đã có lỗi máy chủ API");
            if (view == 1) {
                $scope.loadding_user1 = false;
            }
            if (view == 2) {
                $scope.loadding_user2 = false;
            }
            if (view == 3) {
                $scope.loadding_user3 = false;
            }
            if (view == 4) {
                $scope.loadding_user4 = false;
            }
            if (view == 6) {
                $scope.loadding_user6 = false;
            }
            if (view == 5) {
                $scope.loadding_user5 = false;
            }
            if (view == 7) {
                $scope.loadding_user7 = false;
            }
        });
    }

    $scope.chooseUserSearch = (item, view) => {
        if (view == 1) {
            $scope.filter.user_id = item.id;
            $scope.search_user.name = item.name;
        }
        if (view == 2) {
            $scope.filter.user_confirm_id = item.id;
            $scope.search_confirm.name = item.name;
        }
        if (view == 3) {
            $scope.filter.related_division = item.id;
            $scope.search_related.name = item.name;
        }
        if (view == 7) {
            $scope.filter.user_verifier_id = item.id;
            $scope.search_user_verifier.name = item.name;
        }
        if (view == 4) { // chọn người duyệt
            let dem = $scope.list_user_confirm.filter(i => i.id == item.id);
            if (dem.length == 0) {
                $scope.list_user_confirm.unshift(item);
            }
            $scope.list_user_confirm.forEach((element) => {
                dem = $scope.list_user_confirm.filter(i => i.id == element.id);
                if (dem.length == 0) {
                    element.type = 0;
                } else {
                    element.type = 1;
                }
            });
        }
        if (view == 5) { // chọn bộ phận xử lý
            if (item.type == 0) {
                dem = $scope.list_sub_user.filter(i => i.id == item.id);
                if (dem.length == 0) {
                    $scope.list_sub_user.unshift(item);
                }
                $scope.list_sub_user_search.forEach((element) => {
                    dem = $scope.list_sub_user.filter(i => i.id == element.id);
                    if (dem.length == 0) {
                        element.type = 0;
                    } else {
                        element.type = 1;
                    }
                });
            } else {
                $scope.list_sub_user = $scope.list_sub_user.filter(i => i.id != i.id);
                $scope.list_sub_user_search.forEach((element) => {
                    dem = $scope.list_sub_user.filter(i => i.id == element.id);
                    if (dem.length == 0) {
                        element.type = 0;
                    } else {
                        element.type = 1;
                    }
                });
            }
        }
        if (view == 6) {
            $scope.note.user_verifier_id = item.id;
            $scope.search_verifier.name = item.name;
            $scope.search_verifier.image_url = item.image_url;
            $scope.search_verifier.description = item.description;
        }
        $scope.removeUserList(view);
    }

    $scope.removeUserList = (view) => {
        if (view == 1) {
            $scope.search_user.key = '';
            $scope.list_user_search = [];
        }
        if (view == 2) {
            $scope.search_confirm.key = '';
            $scope.list_confirm_search = [];
        }
        if (view == 3) {
            $scope.search_related.key = '';
            $scope.list_related_search = [];
        }
        if (view == 7) {
            $scope.search_user_verifier.key = '';
            $scope.list_search_user_verifier = [];
        }
        if (view == 4) {
            $scope.search_note.key = '';
            $scope.list_note_search = [];
        }
        if (view == 5) {
            $scope.search_note_list.key = '';
            $scope.list_sub_user_search = [];
        }
        if (view == 6) {
            $scope.search_verifier.key = '';
            $scope.list_search_verifier = [];
        }
    }

    $scope.removeUser = (view) => {
        if (view == 1) {
            $scope.search_user = {};
            $scope.filter.user_id = '';
            $scope.list_user_search = [];
        }
        if (view == 2) {
            $scope.search_confirm = {};
            $scope.filter.user_confirm_id = '';
            $scope.list_confirm_search = [];
        }
        if (view == 7) {
            $scope.search_user_verifier = {};
            $scope.filter.user_verifier_id = '';
            $scope.list_search_user_verifier = [];
        }
        if (view == 3) {
            $scope.search_related = {};
            $scope.filter.related_division = '';
            $scope.list_related_search = [];
        }
        if (view == 4) {
            $scope.search_note = {};
            $scope.note.user_confirm_id = '';
            $scope.list_note_search = [];
        }
        if (view == 6) {
            $scope.search_verifier = {};
            $scope.note.user_verifier_id = '';
            $scope.list_search_verifier = [];
        }
    }

    //Supplier
    $scope.searchSupplierList = () => {
        let key = '';

        if (!$scope.search_supplier.key || $scope.search_supplier.key.length < 3) {
            return true;
        } else {
            key = $scope.search_supplier.key;
        }
        if ($scope.search_timer) {
            clearTimeout($scope.search_timer);
        }

        $scope.search_timer = setTimeout(() => {
            $scope._searchSupplierList(key);
        }, 350);
    }

    $scope._searchSupplierList = (key) => {
        $scope.loadding_supplier = true;
        $scope.search = {};
        $scope.search.key = key;
        let url = 'requests/task_get_supplier?';
        $http.get(base_url + url + $.param($scope.search)).then(res => {
            if (res.data.status == 1) {
                $scope.list_search_supplier = res.data.data;
            } else toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
            $scope.loadding_supplier = false;
        }).catch(e => {
            $scope.loadding_supplier = false;
            toastr["error"]("Đã có lỗi xảy ra với máy chủ API");
        });
    }

    $scope.chooseSupplierSearch = (item) => {
        if ($scope.note.type == 4 || $scope.note.type == 5) {
            $scope.note.pay_for_type = "2";
            $scope.note.pay = "2";
            $scope.note.name_pay = item.bank_account;
            $scope.note.bank_pay = item.bank_name;
            $scope.note.number_pay = item.bank_number;
        }
        $scope.note.supplier_id = item.id;
        $scope.search_supplier.name = item.name;
        $scope.search_supplier.phone = item.phone;
        $scope.search_supplier.tax_code = item.tax_code;
        $scope.removeSupplierList();
    }

    $scope.removeSupplierList = () => {
        $scope.search_supplier.key = '';
        $scope.list_search_supplier = [];
    }

    $scope.removeSupplier = () => {
        $scope.search_supplier = {};
        $scope.note.supplier_id = '';
        $scope.note.name_pay = '';
        $scope.note.bank_pay = '';
        $scope.note.number_pay = '';
        $scope.list_search_supplier = [];
    }

    $scope.addBank = (type) => {
        $scope.note.name_pay = '';
        $scope.note.bank_pay = '';
        $scope.note.number_pay = '';
        if ($scope.note.supplier_id > 0) {
            if (type == 1) {
                $scope.note.pay_for_type = 2;
            }
            if (type == 2) {
                $scope.note.pay = 2;
            }
            if ($scope.note.pay_for_type == 2 && $scope.note.pay == 2) {
                $scope.search = {};
                $scope.search.id = $scope.note.supplier_id;
                let url = 'requests/task_get_supplier?';
                $http.get(base_url + url + $.param($scope.search)).then(res => {
                    if (res.data.status == 1) {
                        if (res.data.data.length > 0) {
                            $scope.note.name_pay = res.data.data[0].bank_account;
                            $scope.note.bank_pay = res.data.data[0].bank_name;
                            $scope.note.number_pay = res.data.data[0].bank_number;
                        }
                    } else toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
                }).catch(e => {
                    toastr["error"]("Đã có lỗi xảy ra với máy chủ API");
                });
            }
        }

        if (type == 2 && $scope.note.pay_for_type == 1) {
            $scope.note.name_pay = $scope.userBankAccount;
            $scope.note.bank_pay = 'ACB';
            $scope.note.number_pay = $scope.userBankNumber;
        }
    }

    //constructions
    $scope.searchConstructionList = () => {
        let key = '';

        if (!$scope.search_construction.key || $scope.search_construction.key.length < 3) {
            $scope.search_construction.open = 0;
            return toastr["error"]('Vui lòng hơn 3 ký tự!');
        } else {
            $scope.search_construction.open = 1;
            key = $scope.search_construction.key;
        }
        $scope._searchConstructionList(key);
    }

    //constructions
    $scope.searchConstructionList = () => {
        let key = '';

        if (!$scope.search_construction.key || $scope.search_construction.key.length < 3) {
            $scope.search_construction.open = 0;
            return toastr["error"]('Vui lòng hơn 3 ký tự!');
        } else {
            $scope.search_construction.open = 1;
            key = $scope.search_construction.key;
        }
        $scope._searchConstructionList(key);
    }

    $scope._searchConstructionList = (key) => {
        $scope.loadding_construction = true;
        $scope.search = {};
        $scope.search.key = key;
        let url = 'requests/task_get_construction?';
        $http.get(base_url + url + $.param($scope.search)).then(res => {
            if (res.data.status == 1) {
                $scope.list_search_construction = res.data.data;
                if ($scope.list_search_construction.length > 0) {
                    $scope.chooseConstructionSearch($scope.list_search_construction[0]);
                }
            } else toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
            $scope.loadding_construction = false;
        }).catch(e => {
            $scope.loadding_construction = false;
            toastr["error"]("Đã có lỗi xảy ra với máy chủ API");
        });
    }

    $scope.chooseConstructionSearch = (item) => {
        $scope.note.construction_id = item.id;
        $scope.search_construction.name = item.name;
        $scope.search_construction.code = item.code;
        $scope.removeConstructionList();
    }

    $scope.removeConstructionList = () => {
        $scope.search_construction.key = '';
        $scope.search_construction.open = 0;
        $scope.list_search_construction = [];
    }

    $scope.removeConstruction = () => {
        $scope.search_construction = {};
        $scope.note.construction_id = '';
        $scope.list_search_construction = [];
    }

    $scope.setTop = (item) => {
        if (item == 1) {
            return {
                "top": -55
            };
        }
        if (item == 2) {
            return {
                "top": -90
            };
        }
        if (item == 3) {
            return {
                "top": -125
            };
        }
        if (item == 4 || item > 4) {
            return {
                "top": -160
            };
        }
    }
    $scope.clearTextBank = () => {
        $scope.note.name_pay = $scope.userBankAccount;
        $scope.note.bank_pay = 'ACB';
        $scope.note.number_pay = $scope.userBankNumber;

    }
    $scope.remove_id_list = (id) => {
        $scope.list_sub_user = $scope.list_sub_user.filter(item => item.id != id);
    }

    $scope.remove_id_list_confirm = (id) => {
        $scope.list_user_confirm = $scope.list_user_confirm.filter(item => item.id != id);
    }

    $scope.getUser = () => {
        $http.get(base_url + 'requests/task_get_user').then(r => {
            if (r.data && r.data.status == 1) {
                $scope.allUser = r.data.data;
            }
        });
    }
    $scope.getStore = () => {
        $http.get(base_url + 'requests/task_get_store').then(r => {
            if (r.data && r.data.status == 1) {
                $scope.allStore = r.data.data;
            }
        });
    }
    $scope.getStoreUser = () => {
        $http.get(base_url + 'requests/task_get_store_user').then(r => {
            if (r.data && r.data.status == 1) {
                $scope.allStoreUser = r.data.data;
            }
            select2();
        });
    }
    $scope.getSupplier = () => {
        $http.get(base_url + 'requests/task_get_supplier').then(r => {
            if (r.data && r.data.status == 1) {
                $scope.allSupplier = r.data.data;
            }
        });
    }

    $scope.getGroup = () => {
        $http.get(base_url + 'requests/task_get_group').then(r => {
            if (r.data && r.data.status == 1) {
                $scope.allGroup = r.data.data;
            }
        });
    }

    $scope.attachFile = () => {
        $('#files_is').click();
    }

    $scope.handleFilter = () => {
        $scope.pagingInfo.currentPage = 1;
        $scope.pagingInfo.offset = 0;
        $scope.filter.offset = 0;
        $scope.getAll();
    }

    $scope.formatDate = (d, fm) => {
        return moment(d).format(fm);
    }
    $('body').on('click', ".show_note .color-note .note_click", function() {
        $(this).parent().parent().parent().find('.show_note .note_css').css('-webkit-line-clamp', 'inherit');
        $(this).css('display', 'none');
        $(this).parent().parent().parent().find('.show_note .note_show').css('display', 'block');
    });
    $('body').on('click', ".open-search", function() {
        $('.col-search').toggle(300);
    });

    $('body').on('click', ".show_note .color-note .note_show", function() {
        $(this).css('display', 'none');
        $(this).parent().parent().parent().find('.show_note .note_click').css('display', 'block');
        $(this).parent().parent().parent().find('.show_note .note_css').css('-webkit-line-clamp', '2');
    });

    function formatState(opt) {
        if (!opt.id) {
            return opt.text;
        }

        var optimage = $(opt.element).attr('data-image');
        if (!optimage) {
            return opt.text;
        } else {
            var $opt = $(
                '<span><img src="' + optimage + '" width="30px" style="border-radius: 50% 50%;" /> ' + opt.text + '</span>'
            );
            return $opt;
        }
    };

    function select2() {
        setTimeout(() => {
            $('.select2').select2({
                templateResult: formatState,
                templateSelection: formatState
            });
        }, 300);
    }
    //paging-----------------------------------

    $scope.go2Page = function(page) {
        if (page < 0) return;
        var pi = $scope.pagingInfo;
        pi.currentPage = page;
        pi.from = pi.offset = (pi.currentPage - 1) * pi.itemsPerPage;
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = ($scope.pagingInfo.currentPage - 1) * $scope.pagingInfo.itemsPerPage;
        $scope.getAll(true);
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
        //end paging

});