app.controller('accountCtrl', function ($scope, $http, $sce) {

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
        $scope.number_pass_click = 0;
        $scope.number_role_click = 0;
        $scope.number_err_click = 0;
        $scope.plusDomain = [1];
        $scope.isDev = isDev;
        $scope.isID = isID;
        $scope.isAd = isAd;
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;
        $scope.getAll();
        $scope.getAllWebsite();
        $scope.domain_id = [];
        $scope.dropMultisel = true;

    }
    $scope.changeView = (id) => {
        $scope.isView = id;
        select2();
    }
    $scope.getAll = () => {
        if (isDev == 0) {
            $http.get(base_url + 'marketings/ajax_get_login?filter=' + JSON.stringify($scope.filter)).then(r => {
                if (r.data.status == 1) {
                    $scope.rows = r.data.data;
                    $scope.pagingInfo.total = r.data.count;
                    $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
                } else {
                    toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
                }
            });
        } else {
            $http.get(base_url + 'marketings/ajax_get_account_websites?filter=' + JSON.stringify($scope.filter)).then(r => {
                if (r.data.status == 1) {
                    $.each(r.data.data, function (i, value) {
                        value.list_domain = JSON.parse(value.list_domain);
                        value.list_domain.reverse();
                    });

                    $scope.rows = r.data.data;
                    $scope.pagingInfo.total = r.data.count;
                    $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
                    $scope.domain_id = [];
                    $scope.arrays = [];
                } else {
                    toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
                }
            });
        }
    }

    $scope.getAllWebsite = () => {
        let url = base_url + "marketings/ajax_get_website_online";
        $http.get(url).then((r) => {
            if (r.data && r.data.status == 1) {
                $scope.AllWebsites = r.data.data;
            }
        });
    }

    $scope.deleteUser = (id) => {
        $scope.id = id;
        let url = base_url + "marketings/ajax_get_accounts_deleteUser";
        $http.post(url,$scope.id).then((r) => {
            if (r.data && r.data.status == 1) {
                $scope.getAccountManager();
                toastr['success']('Cập nhật thành công');
                select2();
            }
        });
    }

    $scope.getAccountManager = () => {
        let url = base_url + "marketings/ajax_get_accounts_manager";
        $http.get(url).then((r) => {
            if (r.data && r.data.status == 1) {
                $scope.accountsManager = r.data.data;
            }
        });
    }
    $scope.getEmail = () => {
        let url = base_url + "marketings/ajax_get_email";
        $http.post(url,$scope.account.user_id).then((r) => {
            if (r.data && r.data.status == 1) {
                if (r.data.data) {
                    $scope.account.email = r.data.data.email;
                }
                $scope.account.password = r.data.pass;
            }
        });
    }
    $scope.getPassword = () => {
        let url = base_url + "marketings/generate_password";
        $http.get(url).then((r) => {
            if (r.data && r.data.status == 1) {
                $scope.account.password = r.data.password;
            }
        });
    }
    $scope.addAccountManager = () => {
        let url = base_url + "marketings/ajax_get_account_manager";
        $http.post(url,$scope.account.user_id).then((r) => {
            if (r.data && r.data.status == 1) {
                toastr['success']('Cập nhật thành công');
                $scope.account.user_id = 0;
                $scope.getAccountManager();
                select2();
            } else toastr['error']('Cập nhật thất bại');
        });
    }

    $scope.addAll = (item, role) => {
        if ($scope.arrays && $scope.arrays.length > 0) {
            if ($('.check-li-' + role).data("check") == 1) {
                $('.check-li-' + role).data("check", 2);
                $('.check-sub-' + role).data("check", 2);
                $.each(item, function (key, val) {
                    if ($scope.addInone(val, role) == true) {
                        var html = '<button type="button" class="btn btn-light btn-select" title="' + val.url + '">' + val.url + '</button>';
                        $('.multiSel-' + role).append(html);
                    }
                });
                $('.check-li-' + role).addClass('col-check');
            } else {
                $('.multiSel-' + role).empty();
                $('.check-li-' + role).data("check", 1);
                $('.check-sub-' + role).data("check", 1);
                $('.check-li-' + role).removeClass('col-check');
                $scope.removeAll(role);
            }
        } else {
            $('.check-sub-' + role).data("check", 2);
            $('.check-li-' + role).data("check", 2);
            $('.check-li-' + role).addClass('col-check');
            $.each(item, function (key, val) {
                $scope.arrays.push({ 'id': val.id, 'role': role, 'url': val.url });
                var html = '<button type="button" class="btn btn-light btn-select" title="' + val.url + '">' + val.url + '</button>';
                $('.multiSel-' + role).append(html);
            });
        }
    }
    $scope.removeAll = (role) => {
        $scope.arrays_sub = [];
        $.each($scope.arrays, function (key, val) {
            if (role != val.role) {
                $scope.arrays_sub.push(val);
            }
        });
        $scope.arrays = $scope.arrays_sub;
    }
    $scope.addInone = (item, role) => {
        let check = false;
        $.each($scope.arrays, function (key, val) {
            if (val.id == item.id) {
                check = true;
            }
        });
        if (check == false) {
            $scope.arrays.push({ 'id': item.id, 'role': role, 'url': item.url });
            return true;
        } else {
            return false;
        }
    }
    $scope.addItembox = (item, role) => {
        let check = false;
        let k;
        if ($scope.arrays && $scope.arrays.length > 0) {
            $.each($scope.arrays, function (key, val) {
                if (val.id == item.id && val.role == role) {
                    check = true;
                    k = key;
                }
            });
        }
        if (check == false) {
            $scope.arrays.push({ 'id': item.id, 'role': role, 'url': item.url });
        } else {
            $scope.arrays.splice(k, 1);
        }
    }
    $scope.check = (item, role) => {
        var check = false;
        if ($scope.arrays && $scope.arrays.length > 0) {
            $scope.arrays.map(x => {
                if (item.id == x.id && role == x.role) {
                    check = true;
                }
            })
        }
        return check;
    }
    $scope.checkPermission = (role) => {
        var check = 0;
        if ($scope.arrays && $scope.arrays.length > 0) {
            $scope.arrays.map(x => {
                if (role == x.role) {
                    check++;
                }
            })
        }
        if ($('.check-li-' + role).data("check") == 2 && check == 0) {
            $('.check-li-' + role).data("check", 1);
            return true;
        } else {
            return false;
        }

    }
    $scope.checkbox_ = (id, role) => {
        var check = true;
        if ($scope.arrays && $scope.arrays.length > 0) {
            $.each($scope.arrays, function (key, val) {
                if (val.id == id) {
                    check = false;
                    if (val.role == role) {
                        check = true;
                    }
                }
            });
        }
        return check;
    }
    $scope.disblebEdit = (id) => {
        let err = true;
        $scope.account.list_domain.forEach(element => {
            if (element.domain_id == id) {
                err = false;
            }
        });
        return err;
    }

    function select2() {
        setTimeout(() => {
            $('.select2').select2();
        }, 200);
    }

    $scope.openModal = (item, type) => {
        $scope.search_user = {};


        $scope.modelType = type;
        $scope.data_url = '';
        $scope.noteError = [];
        $scope.arrays = [];
        $scope.domain_id = [];
        $('.btn-none').css('display', 'block');
        $scope.number_pass_click = 0;
        $scope.number_role_click = 0;
        $scope.number_err_click = 0;
        $scope.account = {};
        $scope.filter.role_one = '4';
        if (item) {
            $scope.account = angular.copy(item);
        }
        if (type == 'createManager') {
            $scope.account.user_id = 0;
            $scope.getAccountManager();
        } else {
            if (type == 'edit') {
                // $scope.getAllUser();
            } else {
                // $scope.getAllAccount();
                $scope.account.user_id = 0;
                $(".multiSel").empty();
                $scope.isView = 1;
            }
        }
        select2();
        $('#accountModal').modal('show');
    }

    $scope.searchUsertList = () => {
        let key = '';
        if(!$scope.search_user.key || $scope.search_user.key.length < 3){
            return true;
        }else{
            key = $scope.search_user.key;
        }
        if ($scope.search_timer) {
            clearTimeout($scope.search_timer);
        }
        $scope.search_timer = setTimeout(() => {
            $scope._searchUsertList(key);
        }, 350);
    }

    $scope._searchUsertList = (key) => {
        $scope.loadding_user = true;
        $scope.search = {};
        $scope.search.key = key;
        let url = 'marketings/ajax_get_accounts?filter=';
        $http.get(base_url + url + JSON.stringify($scope.search)).then(res => {
            if (res.data.status == 1) {
                $scope.list_user_search = res.data.data;
            } else toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
            $scope.loadding_user = false;
        });
    }

    $scope.chooseUserSearch = (item,view) => {
        if(view == 1){
            $scope.account.user_id = item.id;
            $scope.account.email = item.email;
        }
        if(view == 2){
            $scope.account.user_id = item.id;
        }
        $scope.search_user.image_url = item.image_url;
        $scope.search_user.description = item.description;
        $scope.search_user.name = item.user_name;
        $scope.removeUserList();
    }

    $scope.removeUserList = () => {
        $scope.search_user.key = '';
        $scope.list_user_search = [];
    }

    $scope.removeUser = () => {
        $scope.search_user = {};
        $scope.account.user_id = 0;
        $scope.account.email = '';
        $scope.list_user_search = [];
    }

    $scope.updatePassword = (account) => {
        let data = {
            email: account.email,
            password: account.password
        }
        $("body").css('cursor', 'progress');
        $("body").addClass("loadbook");
        $('.btn-pass').html('<i class="fa fa-spinner fa-spin"></i> Cập nhật');
        $http.post(base_url + "marketings/ajax_update_password_account", data).then(r => {
            if (r.data && r.data.status == 1) {
                toastr['success']('Cập nhật thành công');
                $scope.number_err_click = 0;
                $scope.getAll();
            } else {
                if ($scope.number_err_click == 0)
                    toastr["error"](r.data && r.data.status != 1 ? r.data.message : "Có lổi xẩy ra. Vui lòng thử lại!");
                $scope.number_err_click++;
            }
            $("body").removeClass("loadbook");
            $("body").css('cursor', 'pointer');
            $('.btn-pass').html('<i class="fa fa-edit"></i> Cập nhật');
            $scope.loading = false;
        })
    }
    $scope.updateLock = (item,e) => {
        e.preventDefault();
        swal({
            title: "Bạn có chắc?",
            text: "Bạn có chắc hành động chỉnh sửa này!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            cancelButtonText: 'Hủy',
            confirmButtonText: 'Đồng ý',
            allowOutsideClick: false,
            }, function() {
                let email  = item.email,
                inlock = item.inlock;
                $("body").css('cursor','progress');
                $("body").addClass("loadbook");
                $http.post(base_url + "marketings/ajax_update_lock_account",{
                    email: email,
                    inlock: inlock
                }).then(r => {
                    if (r.data && r.data.status == 1) {
                        $("body").removeClass("loadbook");
                        $("body").css('cursor','pointer');
                        toastr['success'](r.data.message ? r.data.message : "Cập nhật thành công");
                        $scope.getAll();
                        select2();
                    }else{
                        $("body").removeClass("loadbook");
                        $("body").css('cursor','pointer');
                        toastr['error']('Cập nhật thất bại');
                    }
                })
            });
    }

    $scope.updateRole = (account, domain) => {
        let data = {
            email: account.email,
            url: domain.url,
            domain_id: domain.domain_id,
            role: domain.role
        }
        $("body").css('cursor', 'progress');
        $("body").addClass("loadbook");
        $http.post(base_url + "marketings/ajax_update_role_account", data).then(r => {
            if (r.data && r.data.status == 1) {
                toastr['success']('Cập nhật thành công');
                $scope.number_role_click = 0;
                $scope.getAll();
            } else {
                if ($scope.number_role_click == 0)
                    toastr["error"](r.data && r.data.status != 1 ? r.data.message : "Có lổi xẩy ra. Vui lòng thử lại!");
                $scope.number_role_click++;
            }
            $("body").removeClass("loadbook");
            $("body").css('cursor', 'pointer');
            $scope.loading = false;
        })
    }
    $scope.addOneDomain = (account) => {
        $scope.dataDomain = {
            'user_id': account.user_id,
            'name_collaborator': account.name_collaborator,
            'email': account.email,
            'password': account.password,
            'domain_id': $scope.filter.domain_one,
            'role': $scope.filter.role_one,
        };
        $("body").css('cursor', 'progress');
        $("body").addClass("loadbook");
        $('.btn-Update').html('<i class="fa fa-spinner fa-spin"></i> Thêm');
        $http.post(base_url + "marketings/ajax_add_onedomain",  $scope.dataDomain).then(r => {
            if (r.data && (r.data.status == 1 || r.data.status == 3)) {
                $scope.noteError = [];
                if (r.data.status == 1) {
                    toastr['success']('Tạo thành công!');
                } else {
                    $scope.noteError.push(r.data.message);
                }
                if (r.data.data) {
                    $scope.account.list_domain.unshift({
                        'domain_id': $scope.filter.domain_one,
                        'domain_name': r.data.data,
                        'url': r.data.data,
                        'role': $scope.filter.role_one,
                    });
                }
                $scope.filter.domain_one = "";
                $scope.number_pass_click = 0;
                $scope.getAll();
                select2();
            } else {
                if ($scope.number_pass_click == 0)
                    toastr["error"](r.data && r.data.status != 1 ? r.data.message : "Có lổi xẩy ra. Vui lòng thử lại!");
                $scope.number_pass_click++;
            }
            $("body").removeClass("loadbook");
            $("body").css('cursor', 'pointer');
            $('.btn-Update').html('<i class="fa fa-plus"></i> Thêm');
            $scope.loading = false;
        })
    }
    $scope.addAccount = () => {
        $scope.number_role_click++;
        if ($scope.arrays.length == 0) {
            if ($scope.number_role_click == 1) {
                return toastr["error"]("Yêu cầu bạn chọn website vệ tinh");
            }
        } else {
            $scope.number_role_click = 0;
        }

        $scope.dataAccount = {
            'domain_id': $scope.arrays,
            'account': $scope.account,
            'isView': $scope.isView
        };
        $("body").css('cursor', 'progress');
        $("body").addClass("loadbook");
        $scope.number_role_click++;
        if($scope.number_role_click < 2){
            $http.post(base_url + "marketings/ajax_add_account", $scope.dataAccount).then(r => {
                if (r.data && r.data.status == 1) {
                    $("body").removeClass("loadbook");
                    $("body").css('cursor', 'pointer');
                    $('#accountModal').modal('hide');
                    $(".multiSel").empty();
                    $scope.arrays = [];
                    toastr['success']('Tạo thành công!');
                    $scope.getAll();
                    select2();
                } else {
                    if (r.data && r.data.status == 3) {
                        $("body").removeClass("loadbook");
                        $("body").css('cursor', 'pointer');
                        $(".btn-Insert").css('display', 'none');
                        $(".multiSel").empty();
                        $scope.arrays = [];
                        $scope.data_url = r.data.data;
                        toastr['error'](r.data.message);
                        $scope.getAll();
                        select2();
                    } else {
                        $("body").removeClass("loadbook");
                        $("body").css('cursor', 'pointer');
                        $scope.number_pass_click++;
                        if ($scope.number_pass_click == 1) {
                            toastr["error"](r.data && r.data.status != 1 ? r.data.message : "Có lổi xẩy ra. Vui lòng thử lại!");
                        }
                        $scope.number_role_click = 0;
                    }
                }
                $scope.loading = false;
            })
        } else {
            return false;
        }
    }


    $('body').on('click', ".dropMultisel dt a", function () {
        for (i = 0; i < 5; i++) {
            if (i != $(this).parent().parent().parent().find('.dropMultisel').data('id')) {
                $('.mutliSelect-' + i).css('display', 'none');
            }
        }
        console.log($(this).parent().parent().parent().find('.dropMultisel dd .mutliSelect'));
        $(this).parent().parent().parent().find('.dropMultisel dd .mutliSelect').slideToggle('fast');
    });

    $("body").on('click', ".dropMultisel dd ul li a", function () {
        $(".dropMultisel dd ul").hide();
    });

    function getSelectedValue(id) {
        return $("#" + id).find("div a span.value").html();
    }

    $(document).bind('click', function (e) {
        var $clicked = $(e.target);
        if (!$clicked.parents().hasClass("dropMultisel")) $(".dropMultisel dd .mutliSelect").hide();
    });

    $('body').on('click', '.mutliSelect li', function () {
        var title = $(this).closest('.mutliSelect').find('li').data('name'),
            title = $(this).data('name');
        if ($(this).data('check') == 1) {
            $(this).data('check', '2');
            if (title) {
                var html = '<button type="button" class="btn btn-light btn-select" title="' + title + '">' + title + '</button>';
                $(this).closest('.dropMultisel').find('.multiSel').append(html);
            }
        } else {
            $(this).data('check', '1');
            $('button[title="' + title + '"]').remove();
            var ret = $(".hida");
            $('.dropMultisel dt a').append(ret);
        }
    });
    $("body").on("keyup", ".mutliSelect .myInput", function () {
        var value = $(this).closest('.mutliSelect').find('.myInput').val().toLowerCase();
        $(this).closest('.mutliSelect').find("ul li").filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
        });
    });
    $scope.handleFilter = () => {
        $scope.pagingInfo.currentPage = 1;
        $scope.pagingInfo.offset = 0;
        $scope.getAll();
    }

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