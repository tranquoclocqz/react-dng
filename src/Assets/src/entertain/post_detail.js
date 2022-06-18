app.controller('post_detail', function ($scope, $http) {
    var pi = $scope.pagingInfo = {
        itemsPerPage: 15,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };


    $scope.init = () => {
        var id_ctgr = location.pathname.split('entertain/post_detail/');
        id_post = id_ctgr[1] ? id_ctgr[1] : '';
        // $scope.checkLike(id_post);
        // $scope.getPostDetail(id_post);

        $scope.ramdom = [];
        $scope.post = {};
        $scope.filter = {};
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;
        $scope.employees = {};
        $scope.employees_row = {};
        $scope.getCategory();
        $scope.getPostByCate();
        $scope.getEmployee();
        $scope.getBranch();
        $scope.getEmployeePs();
        $scope.check = false;
        $scope.getEmployeeOption();
    }
    $scope.getPostDetail = (id_post) => {
        $http.get(base_url + '/entertain/ajax_get_post_detail/' + id_post).then(r => {
            if (r && r.data.status == 1) {

                //r.data.data.content=JSON.parse(r.data.data.content);
                $scope.post_detail_rs = r.data.data;
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        })
    }

    $scope.checkLike = (id_post) => {
        $http.get(base_url + '/entertain/ajax_check_like_post/' + id_post).then(r => {
            if (r && r.data.status == 1) {
                if (r.data.data.total > 0) {
                    $('#like').css('background', '#00a65a')
                }
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        })
    }

    $scope.showViews = (id_post) => {
        $http.get(base_url + '/entertain/ajax_get_user_view_post/' + id_post).then(r => {
            if (r && r.data.status == 1) {
                //r.data.data.content=JSON.parse(r.data.data.content);
                $scope.post_user_rs = r.data.data;
                $('#modal').modal('show');
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        })
    }

    $scope.showLike = (id_post) => {
        $http.get(base_url + '/entertain/ajax_get_user_like_post/' + id_post).then(r => {
            if (r && r.data.status == 1) {

                //r.data.data.content=JSON.parse(r.data.data.content);
                $scope.post_user_like_rs = r.data.data;
                $('#modal-like').modal('show')
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        })
    }


    //
    $scope.sendToWorkplace = () => {
        if ($scope.ramdom.length == 0) {
            toastr["error"]("Chọn nhân viên cần gửi!");
            return false;
        }
        $('button.load img').css('display', 'inline-block');
        $http.post(base_url + '/entertain/ajax_send_to_workplace/' + id_post, $scope.ramdom).then(r => {
            console.log(r);
            if (r && r.data.status == 1) {
                $scope.ramdom = [];
                toastr["success"]("Gửi thành công!");
                $('button.load img').css('display', 'none');
                $('#myModal').modal('hide');

            } else toastr["error"]("Đã có lỗi xẩy ra!");
        })
    }

    $scope.getPostByCate = () => {
        $http.get(base_url + '/entertain/ajax_get_post_by_cate?filter=' + $scope.filter.category_id).then(r => {
            if (r && r.data.status == 1) {
                $scope.posts = r.data.data;
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        })
    }

    $scope.getEmployeeOption = () => {
        $http.get(base_url + '/entertain/ajax_get_employee_option').then(r => {

            if (r && r.data.status == 1) {
                $scope.employeeoptions = r.data.data;
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        })
    }


    $scope.getCategory = () => {
        $http.get(base_url + '/entertain/ajax_get_category/').then(r => {
            if (r && r.data.status == 1) {
                $scope.categorys = r.data.data;
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        })
    }

    $scope.getEmployee = () => {
        $http.get(base_url + '/entertain/ajax_get_employee?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r && r.data.status == 1) {
                $scope.employees = r.data.data;
                $scope.employees_row = r.data.data_row;
                $scope.pagingInfo.total = r.data.count;
                $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
                if ($scope.ramdom.length < 1) {
                    $scope.checkEmployee();
                }
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        })
    }

    $scope.getEmployeeRamdom = () => {
        if (!$scope.numberRamdom || $scope.numberRamdom > $scope.pagingInfo.total || $scope.numberRamdom == 0) {
            toastr["error"]("Vui lòng nhập lại !");
            return false;
        }
        $scope.ramdom = getRandom($scope.employees_row, $scope.numberRamdom);
        $scope.checkEmployee();
        $scope.check = true;
    }

    $scope.checkEmployee = () => {
        $scope.employees.forEach(element => {
            element.check = false;
            $scope.ramdom.forEach(element2 => {
                if (element.id == element2.id) {
                    element.check = true;
                }
            });
        });
    }

    function getRandom(arr, n) {
        var result = new Array(n),
            len = arr.length,
            taken = new Array(len);
        if (n > len)
            throw new RangeError("getRandom: more elements taken than available");
        while (n--) {
            var x = Math.floor(Math.random() * len);
            result[n] = arr[x in taken ? taken[x] : x];
            taken[x] = --len in taken ? taken[len] : len;
        }
        return result;
    }

    $scope.getBranch = () => {
        $http.get(base_url + '/entertain/ajax_get_branch').then(r => {
            if (r && r.data.status == 1) {

                $scope.branchs = r.data.data;
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        })
    }

    $scope.getEmployeePs = () => {
        $http.get(base_url + '/entertain/ajax_get_employee_ps').then(r => {
            if (r && r.data.status == 1) {
                $scope.employee_ps = r.data.data;
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        })
    }

    $scope.addToRamdom = (item) => {
        if ($scope.ramdom.length == 0) {
            $scope.ramdom.push(item);
        } else {
            let index = -1;
            $scope.ramdom.forEach((element, vt) => {
                if (item.id == element.id) {
                    index = vt;
                }
            });
            if (index == -1) {
                $scope.ramdom.push(item);
            } else {
                $scope.ramdom.splice(index, 1);
            }
        }
        $scope.checkEmployee();
    }
    $scope.addToRamdomforoption = (item) => {
        if ($scope.ramdom.length == 0) {
            $scope.ramdom.unshift(item[0]);
        } else {
            let index = -1;
            $scope.ramdom.forEach((element, vt) => {
                if (item[0].id == element.id) {
                    index = vt;
                }
            });
            if (index == -1) {
                $scope.ramdom.unshift(item[0]);
            } else {
                $scope.ramdom.splice(index, 1);
            }
        }
        $scope.checkEmployee();
        $scope.employ = [];

    }

    $scope.openModal = (name) => {
        $('#myModal').modal('show');
    }


    //paging
    $scope.go2Page = function (page) {
        if (page < 0) return;
        var pi = $scope.pagingInfo;
        pi.currentPage = page;
        pi.from = pi.offset = (pi.currentPage - 1) * pi.itemsPerPage;
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = ($scope.pagingInfo.currentPage - 1) * $scope.pagingInfo.itemsPerPage;
        $scope.getEmployee();
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