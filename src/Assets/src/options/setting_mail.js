app.controller('setting_mail', function ($scope, $http) {


    var pi = $scope.pagingInfo = {
        itemsPerPage: 15,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };

    $scope.init = () => {
        $scope.isCheckAll = {
            check: 0
        }
        $scope.checkEdit = false;
        $scope.currentGroupId;
        $scope.check = false;
        $scope.mail = {};
        $scope.mails = [];
        $scope.edit = [];
        $scope.filter = {};
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;
        $scope.delete = [];
        $scope.dem = 0;
        $scope.checkShow = 0;
        $scope.editc = {};

        $scope.mail_category = {};
        $scope.getMailCategory();

        setTimeout(() => {
            $scope.ckeditor = CKEDITOR.replace('textboxMessage', {
                uiColor: '#f2f3f5',
                // removePlugins: 'toolbar',
                height: '100',
                toolbarGroups: [
                    { name: 'basicstyles', groups: ['basicstyles', 'cleanup'] },
                    { name: 'paragraph', groups: ['list'] },
                    { name: 'links', groups: ['links'] },
                    { name: 'colors', groups: ['TextColor', 'BGColor'] },
                    { name: 'insert', groups: ['Iframe', 'Youtube'] },
                    { name: 'colors' },
                ]
            });
            $scope.ckeditor = CKEDITOR.replace('textboxMessage2', {
                uiColor: '#f2f3f5',
                // removePlugins: 'toolbar',
                height: '100',
                toolbarGroups: [
                    { name: 'basicstyles', groups: ['basicstyles', 'cleanup'] },
                    { name: 'paragraph', groups: ['list'] },
                    { name: 'links', groups: ['links'] },
                    { name: 'colors', groups: ['TextColor', 'BGColor'] },
                    { name: 'insert', groups: ['Iframe', 'Youtube'] },
                    { name: 'colors' },
                ]
            });

        }, 100);
        $scope.getMail(-1);

    }

    // $scope.$watch('isCheckAll.check', function (newValue, oldValue) {
    //     console.log(newValue, oldValue);

    //     if (newValue === oldValue) {
    //         return;
    //     }
    //     alert("$watch triggered!");
    // });

    $scope.open = (id) => {
        $http.post(base_url + '/staffs/ajax_open_mail', id).then(r => {

            if (r && r.data.status == 1) {
                $scope.getMail(-1);
                toastr["success"]("Đã đọc!");

            } else toastr["error"]("Đã có lỗi xẩy ra!");

        });
    }


    $scope.openEdit = (item) => {

        $scope.mail_categorys.forEach(element => {
            element.open = false;
            if (element.id == item.id) {
                element.open = true;
                $scope.editc = item;
            }
        });
    }

    $scope.updateCategory = () => {

        $http.post(base_url + '/options/ajax_edit_category_mail', JSON.stringify($scope.editc)).then(r => {

            if (r && r.data.status == 1) {
                $scope.getMailCategory();
                toastr["success"]("Đã cập nhật!");

            } else toastr["error"]("Đã có lỗi xẩy ra!");

        });
    }

    $scope.deleteArray = () => {

        var array = [];
        $scope.mails.forEach(element => {
            if (element.isCheck == 1) {
                array.push(element.id)
            }
        });
        if (array.length > 0) {
            $http.post(base_url + '/options/ajax_delete_many_mail?id=' + JSON.stringify(array)).then(r => {

                if (r && r.data.status == 1) {
                    $scope.getMail(-1);
                    toastr["success"]("Xóa thành công!");
                } else toastr["error"]("Đã có lỗi xẩy ra!");
            })
        }

    }

    $scope.deleteMail = (id) => {
        $http.post(base_url + '/options/ajax_delete_mail_template/' + id).then(r => {
            if (r && r.data.status == 1) {
                $scope.getMail(-1);
                toastr["success"]("Xóa thành công!");
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        })
    }


    $scope.updateMailTempalte = () => {

        $scope.mail.content = CKEDITOR.instances.textboxMessage.getData();
        $http.post(base_url + '/options/ajax_update_mail_template', $scope.mail).then(r => {
            if (r && r.data.status == 1) {
                $scope.mail = {};
                CKEDITOR.instances.textboxMessage.setData('');
                $('#myModal').modal('hide');
                $scope.getMail(-1);
                toastr["success"]("Tạo thành công!");

            } else toastr["error"]("Đã có lỗi xẩy ra!");

        });
    }
    $scope.editfc = (item) => {
        $scope.mailedit = item;
        CKEDITOR.instances.textboxMessage2.setData(item.content);


        $('#modaledit').modal('show');

    }

    $scope.editMailTemplate = () => {
        $scope.mailedit.content = CKEDITOR.instances.textboxMessage2.getData();
        $http.post(base_url + '/options/ajax_edit_mail_template', $scope.mailedit).then(r => {
            if (r && r.data.status == 1) {

                $('#modaledit').modal('hide');
                $scope.getMail(-1);

                toastr["success"]("Cập nhật thành công!");

            } else toastr["error"]("Đã có lỗi xẩy ra!");

        });
    }

    $scope.toDelete = (item) => {
        $scope.mails.forEach(element => {
            if (element.id == item.id) {
                if (element.isCheck == 0) {
                    element.isCheck = 1;
                } else {
                    element.isCheck == 0
                }
            }
        });

        $scope.checkDelete() = true;

    }

    $scope.allToDelete = (ck) => {

        $scope.mails.forEach(element => {
            if (ck == 1) {
                element.isCheck = 1;
            } else {
                element.isCheck = 0;
            }

        });

    }

    $scope.checkDelete = (id) => {
        $scope.isCheckAll.check = 0;

        $scope.mails.forEach(element => {
            if (id) {
                if (element.id == id) {
                    element.isCheck = !element.isCheck;
                }
            }

            if (element.isCheck == 1) {
                $scope.isCheckAll.check = 1;
                return false;
            }
        });

    }


    $scope.getMail = (id_group) => {
        $scope.currentGroupId = id_group;
        $http.get(base_url + '/options/ajax_get_mail_templte/' + id_group + '?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r && r.data.status == 1) {
                $scope.mails = r.data.data;
                $scope.mails.forEach(element => {
                    element.isCheck = 0;
                });
                $scope.mails2 = r.data.data;
                $scope.pagingInfo.total = r.data.count;
                $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);

                $scope.checkShow++;
                $scope.checkDelete();


            } else toastr["error"]("Đã có lỗi xẩy ra!");

        });
    }



    //paging
    $scope.go2Page = function (page) {
        if (page < 0) return;
        var pi = $scope.pagingInfo;
        pi.currentPage = page;
        pi.from = pi.offset = (pi.currentPage - 1) * pi.itemsPerPage;
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = ($scope.pagingInfo.currentPage - 1) * $scope.pagingInfo.itemsPerPage;
        $scope.getMail($scope.currentGroupId);
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


    $scope.addMailCategory = () => {
        $http.post(base_url + '/options/ajax_add_mail_category', $scope.mail_category).then(r => {
            if (r && r.data.status == 1) {

                toastr["success"]("Thêm thành công!");
                $scope.mail_category = {};
                $scope.getMailCategory();
                $('#categorymodal').modal('hide');

            } else toastr["error"]("Đã có lỗi xẩy ra!");

        });
    }

    $scope.getMailCategory = () => {
        $http.get(base_url + '/options/ajax_get_mail_category').then(r => {

            if (r && r.data.status == 1) {
                $scope.mail_categorys = r.data.data;
                $scope.mail_categorys.forEach(element => {
                    element.open = false;
                });

            } else toastr["error"]("Đã có lỗi xẩy ra!");

        });
    }
});