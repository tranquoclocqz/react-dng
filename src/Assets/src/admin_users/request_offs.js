app.controller('offCtrl', function ($scope, $http, $sce) {

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
        $scope.rollEdit = rollEdit ? JSON.parse(rollEdit) : {};
        $scope.is_off = false;
        $scope.loading = false;
        $scope.isMaster = isMaster ? isMaster : 0;
        $scope.isDev = isDev ? isDev : 0;
        $scope.isHr = isHr ? isHr : 0;
        $scope.isAdmin = isAdmin ? isAdmin : 0;
        $scope.isView = 1;
        $scope.filter = {};
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;
        $scope.images = [];
        $scope.report = {};
        $scope.policy_user_off = policy_user_off;
        $scope.getAll();
        $scope.getDataReport();
        if ($scope.rollEdit && $scope.rollEdit.off) {
            $rol = $scope.rollEdit.off.find(r => { return r.id == $scope.currentUserId });
            $scope.is_off = $rol ? true : false;
        }
        loadCKEDITOR();
    }

    $scope.openAsset = (id) => {
        $('#asset').modal('show');
        getAssetPersonal(id);
    }

    $scope.openWebsite = (id) => {
        $('#website').modal('show');
        getOnlineAcounts(id);
    }

    $scope.getDataReport = () => {
        $http.get(base_url + '/admin_users/ajax_get_report_off').then(r => {
            if (r.data && r.data.status == 1) {
                $scope.report = r.data.data;
            }
        })
    }

    $scope.getClass = (item) => {
        let status = [0, 1, 3]
        if (status.includes(Number(item.off_status))) return item.class;
        return '';
    }

    $scope.handleFilter = () => {
        $scope.pagingInfo.currentPage = 1;
        $scope.pagingInfo.offset = 0;
        $scope.filter.offset = 0;
        $scope.filter.currentPage = 1;
        $scope.getAll();
        $scope.getDataReport();
    }

    $scope.viewDetail = (off) => {
        let url = base_url + `/staffs/add_order_quit/${off.off_id}`;
        window.open(url, '_blank');
    }

    $scope.changeView = (val, type) => {
        if (type) {
            $scope.stepViewUser = val;
            return;
        }

        if ($scope.isView == val) return;
        $scope.filter.status = val;
        $scope.isView = val;
        $scope.handleFilter();
    }

    $scope.changeGroups = () => {
        $http.get(base_url + '/admin_users/ajax_get_groups?filter=' + JSON.stringify($scope.user.groups)).then(r => {
            if (r && r.data.status == 1) {
                $scope.groups = r.data.data;
                select2();
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

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

    $scope.adminConfirm = (us, status) => {
        $scope.user = angular.copy(us);
        $scope.user.off_status = status;
        $scope.errorPercentSalary = 0;
        $scope.errorTextPercentSalary = "";
        $("#confirmOff").modal('show');
    }

    $scope.changeStatusOff = () => {
        if ($scope.user.off_status == 3 && ($scope.user.percent_salary == null || (typeof $scope.user.percent_salary == 'undefined')) && $scope.isAdmin == 1 && $scope.user.type == 4) {
            $scope.errorPercentSalary = 1;
            $scope.errorTextPercentSalary = 'Vui lòng nhập phần %';
            return false;
        }

        if ($scope.user.off_status == 3 && $scope.user.percent_salary && $scope.isAdmin == 1 && $scope.user.type == 4) {
            if (Number($scope.user.percent_salary) < -1 || Number($scope.user.percent_salary) > 100) {
                $scope.errorPercentSalary = 1;
                $scope.errorTextPercentSalary = 'Phần trăm lương từ 0 đến 100';
                return false;
            }
        }

        let data = {
            id: $scope.user.off_id,
            status: $scope.user.off_status,
            admin_note: $scope.user.admin_note,
            wp_id: $scope.user.wp_id,
            type: $scope.user.type,
            percent_salary: $scope.user.percent_salary
        }
        $scope.loading = true;
        $http.post(base_url + '/admin_users/ajax_admin_confirm_off', data).then(r => {
            if (r.data.status == 1) {
                toastr['success']('Xác nhận thành công!');
                $scope.loading = false;
                $("#confirmOff").modal('hide');
                $scope.getAll();
                $scope.getDataReport();
            } else {
                toastr['success'](res && res.message ? res.message : 'Có lổi xẩy ra. Vui lòng thử lại!');
            }
        });
    }

    $scope.setQuitBackWork = (val) => {
        $scope.userQuitBack = {
            id: val.id,
            type: val.type,
            off_id: val.off_id,
            status: val.type == 4 ? 14 : 15,
            reason_id: val.quit_type,
            date_start: moment(val.date).format('YYYY-MM-DD'),
            date_end: moment(val.off_date_end).format('YYYY-MM-DD'),
            images: [],
            is_return: 1,
            is_wp: 1,
            is_cls: 1,
            status_name: val.status_name,
            created_id: val.import_id,
            created_name: val.import_name,
            admin_id: val.admin_id,
            admin_name: val.admin_name,
            admin_note: val.admin_note,
            manager_name: val.manager_name,
            manager_id: val.confirm_id,
            manager_note: val.confirm_note,
            main_group_id: val.main_group_id,
            email: val.email,
            class: val.class,
        };

        $scope.stepQuit = 1;
        $('#configQuit').modal('show');
        getAssetPersonal(val.id);
        getOnlineAcounts(val.id);

        $('#inputChecked').prop('checked', false);
        $('#inputEmail').css('display', 'none');

        $('#stepQuit2').css('display', 'none');
        $('#body').css('display', 'none');
        $('#configQuit .modal-dialog').removeClass("modal-cus");

        select2();
    }

    $scope.openEmail = () => {
        $('#inputEmail').toggle(500);
    }

    $scope.confirmQuitBack = (type) => {
        $scope.stepQuit = type;
        if ($scope.stepQuit == 2) {
            $('#stepQuit2').css('display', 'block');
            if ($('#inputChecked').prop("checked") == true) {
                $('#configQuit .modal-dialog').addClass("modal-cus");
                $http.post(base_url + '/admin_users/ajax_get_body_email', $scope.userQuitBack).then(r => {
                    if (r.data && r.data.status == 1) {
                        CKEDITOR.instances.bodySendEmail.setData(r.data.data);
                        $('#body').css('display', 'block');
                    }
                });
            } else {
                $('#body').css('display', 'none');
            }
        }

        if ($scope.stepQuit == 3 || $scope.userQuitBack.isBack == 1) {

            if ($('#inputChecked').prop("checked") == true) { // nếu checked input gửi mail thì lấy email để gửi
                $scope.userQuitBack.email = $('#textInputEmail').val();
            } else { // gán giá trị email bằng rỗng
                $scope.userQuitBack.email = '';
            }

            $scope.userQuitBack.images = $scope.fileOut;
            $scope.userQuitBack.body = CKEDITOR.instances.bodySendEmail.getData();
            $scope.loading_send_email = true;
            $http.post(base_url + '/admin_users/ajax_set_user_quit_back_work', $scope.userQuitBack).then(r => {
                if (r.data && r.data.status == 1) {
                    toastr["success"]("Cập nhật nhân viên thành công!");
                    if (r.data.status_send_email == 1) {
                        toastr["success"]("Gửi email cảm ơn thành công!");
                    } else if (r.data.status_send_email == 2) {
                        toastr["error"]("Gửi email cảm ơn thất bại!");
                    }
                    $scope.getAll();
                    $scope.getDataReport();
                } else toastr["error"](r.data && r.data.status != 1 ? r.data.message : "Đã có lỗi xẩy ra. Vui lòng thử lại!");
                $scope.loading_send_email = false;
                $('#configQuit').modal('hide');
            });
        }
    }

    function getAssetPersonal(id) {
        $scope.isActiveSetOff = false;
        $scope.loadAS = true;
        $http.get(base_url + '/assets/ajax_get_personal_assets?user_id=' + id).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.assetsPersonal = r.data.data.data;
                $scope.isActiveSetOff = true;
                $scope.loadAS = false;
            } else toastr["error"]("Không thể lấy tài sản cá nhân! Vui lòng thử lại sau");
        });
    }

    function getOnlineAcounts(id) {
        $scope.isActiveOnlineAcounts = false;
        $scope.loadWebsite = true;
        $http.get(base_url + '/admin_users/ajax_get_online_acounts?id=' + id).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.onlineAcounts = r.data.data;
                $scope.isActiveOnlineAcounts = true;
                $scope.loadWebsite = false;
            } else toastr["error"]("Không thể lấy tài khoản website! Vui lòng thử lại sau");
        });
    }

    $scope.formatDate = (d, fm) => {
        return moment(d).format(fm);
    }

    $scope.getAll = () => {
        $scope.loading = true;
        $http.get(base_url + '/admin_users/ajax_get_request_off?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r.data.status == 1) {
                $scope.rows = r.data.data;
                $scope.pagingInfo.total = r.data.count;
                $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
                $scope.loading = false;
            } else {
                toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
            }
        });
    }

    function select2() {
        setTimeout(() => {
            $('.select2').select2();
        }, 200);
    }


    //--------------------IMAGE----------------------

    $scope.attachFile = () => {
        $('#inputImgOrder').click();
    }

    $scope.showImg = (url) => {
        $scope.currImg = url;
        $('#image').modal('show');
    }

    $scope.imageUpload = function (element) {
        var files = event.target.files; //FileList object

        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var reader = new FileReader();
            reader.onload = $scope.imageIsLoaded;
            reader.readAsDataURL(file);
        }
        $scope.saveImage(files)

    }

    $scope.imageIsLoaded = function (e) {
        if ($scope.images.length == 0) {
            $scope.images.push(e.target.result);
        } else {
            $scope.images[0] = e.target.result;
        }
    }

    $scope.saveImage = (files) => {
        for (var x = 0; x < files.length; x++) {
            var formData = new FormData();
            formData.append('file', files[x]);
            $http({
                url: base_url + '/admin_users/ajax_upload_image_user',
                method: "POST",
                data: formData,
                headers: { 'Content-Type': undefined }
            }).then(r => {
                if (r.data.status == 1) {
                    $scope.userQuitBack.images.push(r.data.data);
                } else {
                    toastr["error"]('hình ảnh hoặc kích thước hình ảnh không phù hợp!')
                }
            })
        }
    }

    $scope.converHtml = (htmlbd) => {
        return $sce.trustAsHtml(htmlbd);
    }

    $scope.removeImage = (url, index) => {
        $scope.user.images.splice(index, 1);
    }
    //--------------------IMAGE----------------------



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

    function loadCKEDITOR() {
        setTimeout(() => {
            $scope.bodySendEmail = CKEDITOR.replace('bodySendEmail', {
                uiColor: '#f2f3f5',
                // removePlugins: 'toolbar',
                height: '500',
                toolbarGroups: [
                    { name: 'document', groups: ['mode', 'document', 'doctools'] },
                    { name: 'clipboard', groups: ['clipboard', 'undo'] },
                    { name: 'editing', groups: ['find', 'selection', 'spellchecker', 'editing'] },
                    { name: 'forms', groups: ['forms'] },
                    { name: 'basicstyles', groups: ['basicstyles', 'cleanup'] },
                    { name: 'paragraph', groups: ['list', 'indent', 'blocks', 'align', 'bidi', 'paragraph'] },
                    { name: 'links', groups: ['links'] },
                    { name: 'insert', groups: ['insert'] },
                    { name: 'styles', groups: ['styles'] },
                    { name: 'colors', groups: ['colors'] },
                    { name: 'tools', groups: ['tools'] },
                    { name: 'others', groups: ['others'] },
                    { name: 'about', groups: ['about'] }
                ]
            });
        }, 100);
    }
})