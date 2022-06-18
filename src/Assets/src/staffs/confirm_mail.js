
app.controller('confirm_mail', function ($scope, $http) {

    $('.box').css('opacity', '1');

    var pi = $scope.pagingInfo = {
        itemsPerPage: 15,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };

    var pi2 = $scope.pagingInfo2 = {
        itemsPerPage: 10,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };

    $scope.init = () => {
        $scope.checkSent = false;
        $scope.getgroup([1, 4, 2]);
        $scope.ckchild = 1;
        $scope.isCheckAll = {
            check: 0
        }
        $scope.load = false;
        $scope.numberShow = 0;
        $scope.numberEmployee = {
            number: 0,
            ids: []
        }
        $scope.useravid = {};
        $scope.currentGroupId;
        $scope.check = false;
        $scope.mail = {};
        $scope.mail.idob = [];
        $scope.mails = [];
        $scope.addNew = [];
        $scope.filter = {};

        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;

        $scope.filter.limit2 = $scope.pagingInfo2.itemsPerPage;
        $scope.filter.offset2 = $scope.pagingInfo2.offset;

        $scope.delete = [];
        $scope.dem = 0;
        $scope.checkShow = 0;


        // $scope.loadwaitmail = false;
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


        $scope.getEmployeeOption();
        $scope.getWaitMail();
        $scope.getMailCategory();

        $scope.getMailCategory2();

    }

    $scope.getAllEmployee = () => {
        $scope.load = true;
        $http.get(base_url + '/staffs/ajax_get_all_employee').then(r => {
            if (r && r.data.status == 1) {
                $scope.allemployee = r.data.data;
                $scope.numberEmployee.number = r.data.count;
                $scope.numberShow = $scope.numberEmployee.number;

                r.data.data.forEach(element => {

                    $scope.numberEmployee.ids.push(element.id);

                });

                $scope.load = false

            } else toastr["error"]("Đã có lỗi xẩy ra!");
        })

    }


    $scope.getAllgroup = () => {
        if ($scope.filter.group_id.length == 0) {
            $scope.numberEmployee.number = 0;
            $scope.numberShow = $scope.numberEmployee.number;
            $scope.numberEmployee.ids = [];
            return false
        }
        $scope.load = true;
        setTimeout(() => {
            $('#mySelect22').select2('val', '');
        }, 10);

        $http.get(base_url + '/staffs/ajax_get_all_group?filter=' + JSON.stringify($scope.filter)).then(r => {


            if (r && r.data.status == 1) {

                $scope.numberEmployee.number = r.data.count;

                r.data.data.forEach(element => {

                    $scope.numberEmployee.ids.push(element.user_id);

                });
                $scope.numberShow = $scope.numberEmployee.number;
                $scope.load = false


            } else toastr["error"]("Đã có lỗi xẩy ra!");
        })
    }

    $scope.getgroup = (ar) => {
        $http.get(base_url + '/staffs/ajax_get_group?filter=' + JSON.stringify(ar)).then(r => {
            if (r && r.data.status == 1) {
                $scope.userselect = r.data.data;
                console.log(r);

            } else toastr["error"]("Đã có lỗi xẩy ra!");
        })
    }

    $scope.getEpl = (type) => {
        setTimeout(() => {
            $('#mySelect22').select2('val', '');
        }, 10);
        if (type == 1) {
            $scope.getAllEmployee();
        }

        $scope.reset();
    }


    $scope.reset = () => {
        $scope.numberEmployee.number = 0;
        $scope.numberShow = $scope.numberEmployee.number;
        $scope.numberEmployee.ids = [];
    }

    $scope.$watch('mail.employee', function (newValue = [], oldValue = []) {

        if (oldValue.length == newValue.length) {
            if ($scope.temp) {
                $scope.numberShow = $scope.temp.length + $scope.numberEmployee.number;
            }
            return false;
        }
        $scope.temp = $scope.mail.employee;
        newValue.forEach(element => {
            if ($scope.numberEmployee.ids.indexOf(element) !== -1) {

                setTimeout(() => {
                    $('#mySelect22').select2('val', oldValue);
                }, 10);

                $scope.temp = oldValue;
                toastr["error"]("Đã có nhân viên này!");

            } else {
                toastr["success"]("Thành công!");
            }
        });
        $scope.numberShow = $scope.temp ? $scope.temp.length + $scope.numberEmployee.number : $scope.numberEmployee.number;
    });

    // $scope.addToNumberEmployee = (id) => {

    //     if ($scope.numberEmployee.ids.indexOf(id) !== -1) {
    //         toastr["error"]("Đã có nhân viên này!");
    //     } else {

    //         $('.select2-search-choice').remove();
    //         $scope.numberEmployee.ids.push(id);
    //         $scope.numberEmployee.number++;
    //         toastr["success"]("Thành công!");
    //     }

    // }

    $scope.open = (id) => {
        $http.post(base_url + '/staffs/ajax_open_mail', id).then(r => {

            if (r && r.data.status == 1) {
                $scope.getWaitMail();
                toastr["success"]("Đã đọc!");

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
            $http.post(base_url + '/staffs/ajax_dl_many_mail?id=' + JSON.stringify(array)).then(r => {

                if (r && r.data.status == 1) {
                    $scope.getWaitMail();
                    toastr["success"]("Xóa thành công!");
                } else toastr["error"]("Đã có lỗi xẩy ra!");
            })
        }


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


    $scope.deleteMail = (id) => {
        $http.post(base_url + '/staffs/ajax_delete_mail/' + id).then(r => {
            if (r && r.data.status == 1) {
                $scope.getWaitMail();
                toastr["success"]("Xóa thành công!");
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        })
    }

    $scope.getEmployeeOption = () => {

        $http.get(base_url + '/staffs/ajax_get_employee_option').then(r => {
            if (r && r.data.status == 1) {
                $scope.employeeoptions = r.data.data;
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        })
    }

    $scope.sentMail = () => {
        $('.load-small').css('display', 'inline-block');
        $scope.mail.idob = $scope.numberEmployee.ids
        if ($scope.mail.employee) {
            $scope.mail.employee.forEach(element => {
                $scope.mail.idob.push(element)
            });
        }

        $scope.mail.content = CKEDITOR.instances.textboxMessage.getData();
        $http.post(base_url + '/staffs/ajax_sent_mail', $scope.mail).then(r => {

            if (r && r.data.status == 1) {
                $scope.mail = {};
                $scope.reset();
                CKEDITOR.instances.textboxMessage.setData('');
                setTimeout(() => {
                    $("#mySelect22").select2("val", "");
                    $("#mySelect23").select2("val", "");
                    $("#mySelect").select("val", "");
                }, 10);
                $('.load-small').css('display', 'none');
                $('#myModal').modal('hide');
                $scope.getWaitMail();

                toastr["success"]("Gửi thành công!");
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
            if (element.delete == 0) {
                if (ck == 1) {
                    element.isCheck = 1;
                } else {
                    element.isCheck = 0;
                }
            }

        });
    }

    $scope.confirm = (item) => {

        $scope.checkSent = false;

        item.content = CKEDITOR.instances.textboxMessage2.getData();

        console.log(item.content == '');

        if (item.content == '') {
            toastr["error"]("Nhập nội dung thư!");
            return false;
        }
        if ($scope.mail.name == '') {
            toastr["error"]("Nhập tiêu đề thư!");
            return false;
        }


        $http.post(base_url + '/staffs/ajax_edit_mail/', item).then(r => {

            if (r && r.data.status == 1) {
                toastr["success"]("Sửa thành công!");
                $http.post(base_url + '/staffs/ajax_confirm_mail/' + item.id).then(r => {
                    if (r && r.data.status == 1) {
                        toastr["success"]("Duyệt thành công!");
                        $scope.getWaitMail();
                        $scope.checkSent = true;
                        if (id_current_user == 1 || id_current_user == 2 || id_current_user == 1429) {
                        } else {
                            $('#editModal').modal('hide');
                        }
                    } else toastr["error"]("Đã có lỗi xẩy ra!");

                });
            } else toastr["error"]("Đã có lỗi xẩy ra!");

        });



    }

    $scope.confirmToSent = (id) => {
        console.log($scope.useravid);

        if (!$scope.useravid.id) {
            toastr["error"]("Chọn người gửi!");
            return false;
        }

        var data = {
            id: id,
            content: CKEDITOR.instances.textboxMessage2.getData()
        }

        if (data.content == '') {
            toastr["error"]("Nhập nội dung thư!");
            return false;
        }

        $http.post(base_url + '/staffs/ajax_edit_mail_content/', JSON.stringify(data)).then(r => {

            if (r && r.data.status == 1) {
                toastr["success"]("Sửa thành công!");
                $http.post(base_url + '/staffs/ajax_confirm_to_sent/' + id, $scope.useravid.id).then(r => {

                    if (r && r.data.status == 1) {


                        toastr["success"]("Gửi thành công!");
                        $scope.useravid.id = undefined;
                        $scope.getWaitMail();
                        $('#editModal').modal('hide');
                    } else toastr["error"]("Đã có lỗi xẩy ra!");
                });
            } else toastr["error"]("Đã có lỗi xẩy ra!");

        });

    }

    $scope.changeMail = (item) => {
        console.log(item);

    }
    $scope.changeNumberIds = (ids) => {

        if (ids.length == 0) {
            toastr["error"]("Thêm nhân viên!");
        }

        var data = {
            cr_id: $scope.current_id,
            array: ids
        }

        $http.post(base_url + '/staffs/ajax_change_number_em/', JSON.stringify(data)).then(r => {
            if (r && r.data.status == 1) {
                toastr["success"]("Cập nhật thành công!");
                $scope.showDetailMail($scope.current_id);

            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });

    }

    $scope.getListUserRecive = (id) => {
        $http.get(base_url + '/staffs/ajax_get_list_user_recive/' + id + '?filter=' + JSON.stringify($scope.filter)).then(r => {

            if (r && r.data.status == 1) {
                console.log(r);

                $scope.ids_view = [];
                $scope.ids_viewed = [];
                r.data.view.forEach(element => {
                    $scope.ids_view.push(element);
                    if (element.is_read == 1 || element.is_read == 3) {

                        $scope.ids_viewed.push(element);
                    }
                });

                $scope.total_all = r.data.total.total_all;
                $scope.total_read = r.data.total.total_read;


                $scope.pagingInfo2.total = r.data.count;
                $scope.pagingInfo2.totalPage = Math.ceil(r.data.count / pi2.itemsPerPage);



            } else toastr["error"]("Đã có lỗi xẩy ra!");

        });
    }
    $scope.showDetailMail = (id) => {
        $scope.current_id = id;
        $scope.loadwaitmail = false;
        $scope.checkSent = false;
        $('#editModal').modal('show');
        $scope.getListUserRecive(id);
        $http.get(base_url + '/staffs/ajax_get_detail_mail/' + id).then(r => {


            if (r && r.data.status == 1) {
                $scope.mailDetail = r.data.data;
                $scope.current_mail_status = $scope.mailDetail.status;

                $scope.count = r.data.count;
                $scope.ids = [];

                $scope.useravid.id = $scope.mailDetail.sender_id;

                r.data.detail.forEach(element => {
                    $scope.ids.push(element.receiver_id);
                });

                // $scope.ids_view = [];
                // $scope.ids_viewed = [];

                // r.data.view.forEach(element => {
                //     console.log(element);
                //     $scope.ids_view.push(element);
                //     if (element.is_read == 1 || element.is_read == 3) {

                //         $scope.ids_viewed.push(element);
                //     }
                // });



                setTimeout(() => {
                    CKEDITOR.instances.textboxMessage2.setData(r.data.data.content);
                    if ($scope.mailDetail.status == 2) {
                        CKEDITOR.instances.textboxMessage2.setReadOnly(true);
                    } else {
                        CKEDITOR.instances.textboxMessage2.setReadOnly(false);
                    }
                }, 10);


                $scope.loadwaitmail = true;

            } else toastr["error"]("Đã có lỗi xẩy ra!");

        });
    }


    $scope.openCusModal = () => {

        $('#cusmodal').modal('show');
        if ($scope.ids) {
            setTimeout(() => {
                $('#selected').select2('val', $scope.ids);
            }, 10);
        }


    }

    $scope.getWaitMail = () => {
        $scope.waitmailload = false;
        $http.get(base_url + '/staffs/ajax_get_wait_mail/?filter=' + JSON.stringify($scope.filter)).then(r => {
            console.log(r);

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
                $scope.waitmailload = true;
            } else toastr["error"]("Đã có lỗi xẩy ra!");

        });
    }

    $scope.getMailCategory = () => {
        $http.get(base_url + '/staffs/ajax_get_mail_category').then(r => {
            if (r && r.data.status == 1) {
                $scope.mail_categorys = r.data.data;

                $scope.checkShow++;

            } else toastr["error"]("Đã có lỗi xẩy ra!");

        });
    }



    $scope.getMailCategory2 = () => {
        $http.get(base_url + '/staffs/ajax_get_mail_category').then(r => {
            if (r && r.data.status == 1) {
                $scope.mailc = r.data.data;
                $scope.mailc.forEach(element => {
                    element.check = false;
                });

                var first = {
                    id: -1,
                    name: 'TỔNG HỢP',
                    check: true
                }
                $scope.mailc.unshift(first);
            } else toastr["error"]("Đã có lỗi xẩy ra!");

        });
    }

    $scope.changeCate = (id) => {
        $scope.getWaitMail();
        $scope.mailc.forEach(element => {
            element.check = false;
            if (element.id == id) {
                element.check = true;
            }
        });
    }

    $scope.editMail = (item) => {

        item.content = CKEDITOR.instances.textboxMessage2.getData();
        if (item.content == '') {
            toastr["error"]("Nhập nội dung thư!");
            return false;
        }
        if (item.name == '') {
            toastr["error"]("Nhập tiêu đề thư!");
            return false;
        }

        $http.post(base_url + '/staffs/ajax_edit_mail/', item).then(r => {
            toastr["success"]("Sửa thành công!");
            $scope.getWaitMail();
            if (r && r.data.status == 1) {
            } else toastr["error"]("Đã có lỗi xẩy ra!");
            $('#editModal').modal('hide');
        });

    }

    //paging
    $scope.go2Page2 = function (page) {
        if (page < 0) return;
        var pi = $scope.pagingInfo2;
        pi.currentPage = page;
        pi.from = pi.offset = (pi.currentPage - 1) * pi.itemsPerPage;
        $scope.filter.limit2 = $scope.pagingInfo2.itemsPerPage;
        $scope.filter.offset2 = ($scope.pagingInfo2.currentPage - 1) * $scope.pagingInfo2.itemsPerPage;
        $scope.getListUserRecive($scope.current_id);
        pi.to = pi.total < pi.itemsPerPage ? pi.total : pi.itemsPerPage
    }
    $scope.Previous2 = function (page) {
        if (page - 1 > 0) $scope.go2Page2(page - 1);
        if (page - 1 == 0) $scope.go2Page2(page);
    }



    $scope.go2Page = function (page) {
        if (page < 0) return;
        var pi = $scope.pagingInfo;
        pi.currentPage = page;
        pi.from = pi.offset = (pi.currentPage - 1) * pi.itemsPerPage;
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = ($scope.pagingInfo.currentPage - 1) * $scope.pagingInfo.itemsPerPage;
        $scope.getWaitMail();
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

