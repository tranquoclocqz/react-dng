

app.controller('mailbox', function ($scope, $http) {
    $('.box').css('opacity', '1');
    var pi = $scope.pagingInfo = {
        itemsPerPage: 15,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };

    $scope.init = () => {
        $scope.oldValue = [];
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
        $scope.currentGroupId;
        $scope.check = false;
        $scope.mail = {};
        $scope.mail.idob = [];
        $scope.mails = [];
        $scope.addNew = [];
        $scope.filter = {};
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;



        $scope.delete = [];
        $scope.dem = 0;
        $scope.checkShow = 0;
        setTimeout(() => {
            $scope.ckeditor = CKEDITOR.replace('textboxMessage', {
                uiColor: '#f2f3f5',
                // removePlugins: 'toolbar',
                // plugins: 'autotag',
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
        $scope.getMail();
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
        // $scope.mail.employee = [];
        //console.log($scope.mail.employee);

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
                $scope.numberEmployee.ids = [];
                $scope.numberEmployee.number = r.data.count;
                r.data.data.forEach(element => {
                    $scope.numberEmployee.ids.push(element.user_id);
                });
                $scope.numberShow = $scope.numberEmployee.number;
                $scope.load = false
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
                console.log($scope.numberEmployee);
                console.log($scope.mail.employee);
                $scope.mail.employee = oldValue;
                // setTimeout(() => {
                //     $('#mySelect22').select2('val', oldValue);
                // }, 10);

                $scope.temp = oldValue;
                toastr["error"]("Đã có nhân viên này!");

            } else {
                return false;
            }
        });
        $scope.numberShow = $scope.temp ? $scope.temp.length + $scope.numberEmployee.number : $scope.numberEmployee.number;
    });

    // $scope.addToNumberEmployee = (ids) => {
    //     console.log($scope.numberEmployee.ids)
    //     ids.forEach(element => {
    //         if ($scope.numberEmployee.ids.indexOf(element) !== -1) {
    //             console.log($scope.numberEmployee);
    //             console.log($scope.mail.employee);
    //             $scope.mail.employee = $scope.oldValue;
    //             // setTimeout(() => {
    //             //     $('#mySelect22').select2('val', oldValue);
    //             // }, 10);

    //             //$scope.temp = oldValue;
    //             toastr["error"]("Đã có nhân viên này!");

    //         } else {
    //             $scope.oldValue = ids;
    //             return false;
    //         }
    //     });
    //     $scope.numberShow = $scope.oldValue.length + $scope.numberEmployee.number;

    // }

    $scope.open = (id) => {
        $http.post(base_url + '/staffs/ajax_open_mail', id).then(r => {

            if (r && r.data.status == 1) {
                $scope.getMail();
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
            $http.post(base_url + '/staffs/ajax_delete_many_mail?id=' + JSON.stringify(array)).then(r => {

                if (r && r.data.status == 1) {
                    $scope.getMail();
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
                $scope.getMail();
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
        if ($scope.mail.employee) {
            $scope.mail.idob = $scope.numberEmployee.ids.concat($scope.mail.employee);
        } else {
            $scope.mail.idob = $scope.numberEmployee.ids;
        }

        $scope.mail.content = CKEDITOR.instances.textboxMessage.getData();


        if ($scope.mail.idob.length == 0) {

            toastr["error"]("Chọn người nhận!");
            return false;
        }

        if (!$scope.mail.name || $scope.mail.name == '') {
            toastr["error"]("Nhập tiêu đề thư!");
            return false;
        }

        if (!$scope.mail.group_id) {
            toastr["error"]("Chọn nhóm thư!");
            return false;
        }

        if ($scope.mail.content == '' || !$scope.mail.content) {
            toastr["error"]("Nhập nội dung thư!");
            return false;
        }

        $('.load-small').css('display', 'inline-block');


        $http.post(base_url + '/staffs/ajax_sent_mail', $scope.mail).then(r => {

            if (r && r.data.status == 1) {
                console.log(r);

                $scope.mail = {};
                $scope.reset();
                CKEDITOR.instances.textboxMessage.setData('');
                //   $scope.oldValue = [];
                setTimeout(() => {
                    $("#mySelect22").select2("val", "");
                    $("#mySelect23").select2("val", "");
                    $("#mySelect").select("val", "");
                }, 10);
                $('.load-small').css('display', 'none');
                $('#myModal').modal('hide');
                $scope.getMail();
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






    $scope.getMail = () => {
        //$('.table >.cover').css('opacity','0');
        //$('.table >.cover:before').css('opacity','1');
        $scope.waitmailload = false;
        $http.get(base_url + '/staffs/ajax_get_mail?filter=' + JSON.stringify($scope.filter)).then(r => {
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

    $scope.openCusModal = () => {

        $('#cusmodal').modal('show');
        var temp = [];
        if ($scope.temp) {
            temp = $scope.numberEmployee.ids.concat($scope.temp)
        } else {
            temp = $scope.numberEmployee.ids;
        }
        console.log(temp);

        if (temp) {
            setTimeout(() => {
                $('#selected').select2('val', temp);
            }, 10);
        }


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

                //   $scope.filter.idgroup = -1;

            } else toastr["error"]("Đã có lỗi xẩy ra!");

        });
    }

    $scope.changeCate = (id) => {
        $scope.getMail();
        $scope.mailc.forEach(element => {
            element.check = false;
            if (element.id == id) {
                element.check = true;
            }
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
        $scope.getMail();
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