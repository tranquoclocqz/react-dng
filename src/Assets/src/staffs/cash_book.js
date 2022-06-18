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
        $scope.isAccount = isAccount;
        $scope.isID = isID;
        $scope.filter = {};
        $scope.load = 0;
        $scope.loadimg = 0;
        $scope.loadup = 0;
        $scope.dataInsert = {};
        $scope.dataStatus = {};
        $scope.plusDomain = [1];
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;
        $scope.getAll();
        $scope.getUser();
    }
    $scope.imageUpload = function (event) {
        var files = event.target.files;
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var reader = new FileReader();
            reader.onload = $scope.imageIsLoaded;
            reader.readAsDataURL(file);
        }
    }

    $scope.imageIsLoaded = function (e) {
        $scope.$apply(function () {
            $scope.img.push(e.target.result);
        });
    }

    $scope.img_delete = (index) => {
        $scope.img.splice(index, 1);
    }

    $scope.fileUpload = function (event) {
        var files = event.target.files;
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var reader = new FileReader();
            reader.onload = $scope.fileIsLoaded;
            reader.readAsDataURL(file);
        }
    }

    $scope.fileIsLoaded = function (e) {
        $scope.$apply(function () {
            $scope.file.push(e.target.result);
        });
    }

    $scope.file_delete = (index) => {
        $scope.file.splice(index, 1);
    }

    $scope.openModal = (item, view) => {
        $scope.view = view;
        $scope.load = 0;
        $scope.dataInsert = {};
        $scope.img = [];
        if (view == 'CREATE') {
            $scope.dataInsert.type = item;
            $scope.dataInsert.pay = "1";
            if ($scope.loadimg > 0) {
                document.getElementsByClassName('files_is')[0].value = "";
            }
            $scope.loadimg++;
            $scope.getType(item, 0);
        }
        $('#accountModal').modal('show');
        select2();
    }

    $scope.editModal = (item) => {
        $scope.dataInsert = angular.copy(item);
        $scope.dataStatus = angular.copy(item);
        $scope.load = 0;
        if (item.price) {
            $scope.dataInsert.price = $scope.viewPrice(item.price);
        }
        $scope.getType($scope.dataInsert.type, $scope.dataInsert.id_parents);
        if ($scope.loadup > 0 && ($scope.dataInsert.user_id == isAccount || isAccount == $scope.dataInsert.leader_id) && $scope.dataInsert.status != 6 && $scope.dataInsert.status != 4 && $scope.dataInsert.status != 5) {
            if ($scope.img.length > 0) {
                document.getElementsByClassName('files_up')[0].value = "";
            }
        }
        if ($scope.loadup > 0 && $scope.dataInsert.list_img == 1) {
            if ($scope.file.length > 0) {
                document.getElementsByClassName('files_success')[0].value = "";
            }
        }
        $('#editModal').modal('show');
        $scope.img = [];
        $scope.file = [];
        $scope.loadup++;
        select2();
    }
    $scope.openModalDetail = (id) => {
        $http.get(base_url + '/staffs/get_cash_book_detail?id=' + id).then(r => {
            if (r.data.status == 1) {
                $scope.dataInsert = r.data.data;
                if (!!$scope.dataInsert.file) {
                    $scope.dataInsert.file = JSON.parse($scope.dataInsert.file);
                    if ($scope.dataInsert.file.length) {
                        $scope.dataInsert.file_up = 1;
                    } else {
                        $scope.dataInsert.file_up = 0;
                    }
                }
                if (!!$scope.dataInsert.img) {
                    $scope.dataInsert.img = JSON.parse($scope.dataInsert.img);
                    if ($scope.dataInsert.img.length) {
                        $scope.dataInsert.img_up = 1;
                    } else {
                        $scope.dataInsert.img_up = 0;
                    }
                }
                if ($scope.dataInsert.price) {
                    $scope.dataInsert.price = $scope.viewPrice($scope.dataInsert.price);
                }
                if (!!$scope.dataInsert.related_division) {
                    $scope.dataInsert.related_division = $scope.dataInsert.related_division.split(',');
                    $scope.dataInsert.related_name = $scope.dataInsert.related_name.split(',');
                }
                $('#parentModal').modal('show');
                select2();
            } else toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
        });
    }
    $scope.new_status = (item) => {
        if ((item.user_id == $scope.isAccount && (item.status == 1 || item.status == 6) && item.cancel_status == 0 && item.list_bool == 0) || (item.id_parents > 0 && item.user_id == $scope.isAccount && (item.status == 6 || item.status == 5)) || item.status == 1) {
            return true;
        } else {
            return false;
        }
    }
    $scope.confirm_status = (item) => {
        if ((item.leader_id == $scope.isAccount && (item.status == 1 || item.status == 5) && item.cancel_status == 0) || item.status == 2) {
            return true;
        } else {
            return false;
        }
    }
    $scope.browser_status = (item) => {
        if ((item.manager_id == $scope.isAccount && (item.status == 1 || item.status == 2 || item.status == 5 || item.cancel_status == 1)) || item.status == 3) {
            return true;
        } else {
            return false;
        }
    }
    $scope.completed_status = (item) => {
        if ((item.list_manager > 0 && item.status != 6 && item.status != 5) || item.status == 4) {
            return true;
        } else {
            return false;
        }
    }
    $scope.refuse_status = (item) => {
        if (((item.manager_id == $scope.isAccount || (item.leader_id == $scope.isAccount && item.list_manager == 0)) || item.status == 5) && item.status != 3 && item.status != 6 && item.status != 4) {
            return true;
        } else {
            return false;
        }
    }

    $scope.cancel_status = (item) => {
        if (item.status == 6 || (item.status == 1 && item.user_id == $scope.isAccount) || (item.status == 3 && item.manager_id == $scope.isAccount) || (item.user_id == $scope.isAccount && item.type == 3 && item.cancel_status == 0) || (item.leader_id == $scope.isAccount && item.type == 3 && item.status == 3)) {
            return true;
        } else {
            return false;
        }
    }


    $scope.getAll = () => {
        $http.get(base_url + '/staffs/get_cash_book?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r.data.status == 1) {
                $.each(r.data.data, function (key, value) {
                    if (!!value.related_division) {
                        value.related_division = value.related_division.split(',');
                    } else {
                        value.related_division = [];
                    }
                    if (!!value.list) {
                        value.list = JSON.parse(value.list);
                    }
                    if (!!value.file) {
                        value.file = JSON.parse(value.file);
                        if (value.file.length) {
                            r.data.data[key].file_up = 1;
                        } else {
                            r.data.data[key].file_up = 0;
                        }
                    }
                    if (!!value.img) {
                        value.img = JSON.parse(value.img);
                        if (value.img.length) {
                            r.data.data[key].img_up = 1;
                        } else {
                            r.data.data[key].img_up = 0;
                        }
                    }
                });
                $scope.rows = r.data.data;
                $scope.pagingInfo.total = r.data.count;
                $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
                select2();
            } else toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
        });
    }

    $('#handling_select').on('select2:unselecting', function (event) {
        if ($scope.dataInsert.manager_id != isAccount) {
            $.each($scope.dataInsert.related_division, function (key, value) {
                if ((isAccount == value && event.params.args.data.id == isAccount)) {
                    toastr["error"]('Bạn không được xóa chính mình');
                    event.preventDefault();
                } else {
                    $.each($scope.dataInsert.list, function (k, val) {
                        if (val.status == 3 && value == event.params.args.data.id && val.id == value) {
                            toastr["error"]('Bạn không được xóa nhân viên này');
                            event.preventDefault();
                        }
                    });
                }
            });
        }
    })
    $scope.addCash = () => {
        $scope.load++;
        let number = Number($scope.dataInsert.price);
        if (($scope.dataInsert.type == 3 || $scope.dataInsert.type == 4) && number == 0) {
            if (number == 0) {
                return toastr["error"]('Vui lòng nhập số tiền');
            }
        }
        let fd = new FormData();
        let url_post;
        fd.append('data', JSON.stringify($scope.dataInsert));
        fd.append('data_img', JSON.stringify($scope.img));
        url_post = 'insert_cash_book';
        if ($scope.load == 1) {
            $http.post(base_url + '/staffs/' + url_post, fd, {
                headers: { 'Content-Type': undefined }
            }).then(r => {
                if (r.data && r.data.status == 1) {
                    toastr["success"](r.data.message ? r.data.message : 'Thành công!');
                    $('#accountModal').modal('hide');
                    $scope.getAll();
                    setTimeout(function () {
                        note_sort();
                    }, 500);
                    // $scope.sendMail($scope.dataInsert,$scope.isAccount);
                } else {
                    toastr["error"](r.data.message ? r.data.message : 'Có lổi xẩy ra. Vui lòng thử lại!');
                    $scope.load = 0;
                }
            });
        }
    }

    $scope.updateCash = () => {
        if ($scope.dataInsert.status == 6 && $scope.dataInsert.status != $scope.dataStatus.status) {
            $("#modalCancel").modal("show");
            $scope.dataCancel = {};
            $scope.dataCancel = $scope.dataInsert;
            $scope.dataCancel.idCancel = $scope.isAccount;
            return true;
        }
        let number = Number($scope.dataInsert.price);
        if (($scope.dataInsert.type == 3 || $scope.dataInsert.type == 4) && number == 0) {
            if (number == 0) {
                return toastr["error"]('Vui lòng nhập số tiền');
            }
        }
        if ($scope.dataInsert.img.length <= 0 && $scope.dataInsert.status == 4) {
            if ($scope.file.length <= 0) {
                return toastr["error"]('Vui lòng up hình ảnh bàn giao');
            }
        }
        if ($scope.dataInsert.status == 3 && $scope.dataInsert.related_division.length <= 0) {
            return toastr["error"]('Vui lòng chọn bộ phận liên quan');
        }
        $scope.load++;
        let fd = new FormData();
        let url_post;
        fd.append('data', JSON.stringify($scope.dataInsert));
        fd.append('data_img', JSON.stringify($scope.img));
        fd.append('data_file', JSON.stringify($scope.file));
        url_post = 'update_cash_book';
        if ($scope.load == 1) {
            $http.post(base_url + '/staffs/' + url_post, fd, {
                headers: { 'Content-Type': undefined }
            }).then(r => {
                if (r.data && r.data.status == 1) {
                    toastr["success"](r.data.message ? r.data.message : 'Thành công!');
                    $('#editModal').modal('hide');
                    $scope.getAll();
                    setTimeout(function () {
                        note_sort();
                    }, 500);
                    if (r.data.bool.manager_id) {
                        $scope.sendMailManager($scope.dataInsert, $scope.isAccount, r.data.bool.manager_id);
                    }
                    if (r.data.bool.leader_id) {
                        $scope.sendMailManager($scope.dataInsert, $scope.isAccount, r.data.bool.leader_id);
                    }
                    if ($scope.dataInsert.status == 3 || $scope.dataInsert.status == 4) {
                        $scope.sendMailmulti($scope.dataInsert, r.data.manager_id);
                    }
                    if ($scope.dataInsert.status == 4 && r.data.bool_completed == 1) {
                        $scope.sendCompleted($scope.dataInsert);
                    }
                    if ($scope.dataInsert.status == 5 && r.data.bool_cancel == 1) {
                        $scope.sendCompleted($scope.dataInsert);
                    }
                    $scope.load = 0;
                } else {
                    $('#editModal').modal('hide');
                    $scope.load = 0;
                }
            });
        }
    }

    $scope.sendCompleted = (item) => {
        $http.post(base_url + '/staffs/send_message_completed_cash_book', { item: item }).then(r => {
            $scope.load = 0;
        });
    }

    $scope.sendMail = (item, id) => {
        $http.post(base_url + '/staffs/send_message_cash_book', { item: item, id: id }).then(r => {
            $scope.load = 0;
        });
    }

    $scope.sendMailManager = (item, id, manager) => {
        $http.post(base_url + '/staffs/send_message_manager_cash_book', { item: item, id: id, manager: manager }).then(r => {
            $scope.load = 0;
        });
    }
    $scope.sendMailmulti = (item, manager) => {
        $http.post(base_url + '/staffs/send_multi_message_cash_book', { item: item, manager: manager }).then(r => {
            $scope.load = 0;
        });
    }
    $('body').on('click', ".show_note .color-note .note_click", function () {
        $(this).parent().parent().parent().find('.show_note .note_css').css('-webkit-line-clamp', 'inherit');
        $(this).css('display', 'none');
        $(this).parent().parent().parent().find('.show_note .note_show').css('display', 'block');
    });
    $('body').on('click', ".show_note .color-note .note_show", function () {
        $(this).css('display', 'none');
        $(this).parent().parent().parent().find('.show_note .note_click').css('display', 'block');
        $(this).parent().parent().parent().find('.show_note .note_css').css('-webkit-line-clamp', '2');
    });
    setTimeout(function () {
        note_sort();
    }, 500);
    function note_sort() {
        var items = document.getElementsByClassName("note_css");
        for (var i = 0; i < items.length; i++) {
            var divHeight = items[i].offsetHeight;
            var lines = divHeight / 18;
            if (lines < 2 || lines == 2) {
                items[i].parentElement.childNodes[3].style.display = "none";
                // ('.color-note').css('display','none');
            } else {
                items[i].parentElement.childNodes[1].style.display = "-webkit-box";
            }
        }
    }
    $scope.delete_img = (img_id, id, view) => {
        $scope.filter = {};
        $scope.filter.img_id = img_id;
        $scope.filter.id = id;
        $scope.filter.view = view;
        $http.post(base_url + '/staffs/update_img_cash_book', $scope.filter).then(r => {
            if (r.data && r.data.status == 1) {
                toastr["success"](r.data.message ? r.data.message : 'Xóa thành công!');
                if (view == 1) {
                    $scope.dataInsert.file = r.data.data;
                } else {
                    $scope.dataInsert.img = r.data.data;
                }
                select2();
            } else toastr["error"](r.data.message ? r.data.message : 'Có lổi xẩy ra. Vui lòng thử lại!');
        });
    }

    $scope.cashCancle = () => {
        $http.post(base_url + '/staffs/get_cash_book_cancle', $scope.dataCancel).then(r => {
            if (r.data.status == 1) {
                toastr["success"](r.data.message ? r.data.message : 'Hủy thành công!');
                $scope.dataCancel = {};
                $('#editModal').modal('hide');
                $('#modalCancel').modal('hide');
                $scope.getAll();
            } else toastr["error"](r.data.message ? r.data.message : 'Có lổi xẩy ra. Vui lòng thử lại!');
        });

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

    $scope.getUser = () => {
        $http.get(base_url + '/staffs/get_user').then(r => {
            if (r.data && r.data.status == 1) {
                $scope.allUser = r.data.data;
            }
        });
    }
    $scope.getType = (type, id) => {
        $scope.type = {
            'type': type, 'id_parents': id
        };
        $http.get(base_url + '/staffs/get_type?filter=' + JSON.stringify($scope.type)).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.allType = r.data.data;
            }
        });
    }

    $scope.handleFilter = () => {
        $scope.pagingInfo.currentPage = 1;
        $scope.pagingInfo.offset = 0;
        $scope.getAll();
    }

    $scope.formatDate = (d, fm) => {
        return moment(d).format(fm);
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