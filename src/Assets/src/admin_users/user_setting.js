app.controller('userCtrl', function ($scope, $http, $sce,AdminUserSvc) {

    var pi = $scope.pagingInfo = {
        itemsPerPage: 30,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    }; 

    $scope.init = () => {
        $scope.loadding = true;
        $scope.restFilter();
        $scope.filter.type = type;
        $scope.getAll();
    }
    
    $scope.restFilter = () =>{
        $scope.filter = {};
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;
        $scope.filter.type = "";
        $scope.filter.active = "";
        $scope.filter.key = "";
    }
    
    $scope.getAll = () => {
        $scope.loadding = true;
        AdminUserSvc.getListUserSetting($scope.filter).then(r => {
            $scope.rows = r.data;
            $scope.pagingInfo.total = r.count;
            $scope.pagingInfo.totalPage = Math.ceil(r.count / pi.itemsPerPage);
            $scope.loadding = false;
        }).catch(e => {
            $scope.loadInsert = false;
        });
    }

    $scope.getList = (type) => {
        $scope.filter.type = type;
        $scope.getAll();
    }
    $scope.openAdd = () => {
        d = new Date();
        $scope.insert = {};
        $scope.insert.type = $scope.filter.type;
        $('#openAdd').modal('show');
        select2();
    }

    $scope.createListCode = () => {
        $(".detail-dis").css('display','block');
        $("#btn_submit").css('display','none');
    }

    $scope.insertUser = () => {
        $scope.loadInsert = true;
        AdminUserSvc.insertUserSetting($scope.insert).then(r => {
            $('#openAdd').modal('hide');
            $scope.getAll();
            $scope.loadInsert = false;
        }).catch(e => {
            $scope.loadInsert = false;
        });
    }

    $scope.openUpdate = (item) => {
        $scope.update = angular.copy(item);
        $scope.update.type = $scope.filter.type;
        $('#openUpdate').modal('show');
        select2();
    }

    $scope.updateUser = () => {
        $scope.loadInsert = true;
        AdminUserSvc.updateUserSetting($scope.update).then(r => {
            $('#openUpdate').modal('hide');
            $scope.getAll();
            $scope.loadInsert = false;
        }).catch(e => {
            $scope.loadInsert = false;
        });
    }
    
    $scope.updateUserActive = (value, e) => {
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
                let data = {};
                data.type = $scope.filter.type;
                data.id = value.id;
                data.active = (value.active == 1) ? 0 : 1 ;
                $http.post(base_url + 'admin_users/update_user_setting',JSON.stringify(data)).then(r => {
                    if (r.data.status == 1) {
                        value.active = data.active;
                        toastr["success"](r.data.message);
                    } else toastr["error"](r.data.message);
                }).catch(e => {
                    toastr["error"]("Đã có lỗi xảy ra với máy chủ API");
                });
            });
    }

    $scope.openAddVoucher = (item) => {
        $scope.resetvoucher(angular.copy(item));
        $('#openAddVoucher').modal('show');
        select2();
    }

    $scope.insertDetailVoucher = () => {
        
        $scope.loadInsert = true;
        $http.post(base_url + 'marketings/save_detail_voucher',JSON.stringify($scope.voucher)).then(r => {
            if (r.data.status == 1) {
                $('#openAddVoucher').modal('hide');
                toastr["success"](r.data.message);
                $scope.getAll();
                select2();
            } else toastr["error"](r.data.message);
            $scope.loadInsert = false;
        }).catch(e => {
            $scope.loadInsert = false;
            toastr["error"]("Đã có lỗi xảy ra với máy chủ API");
        });
    }

    $scope.listVoucher = (item) => {
        $scope.loadInsert = true;
        $scope.listVoucherDetail(item);
        $scope.list = {};
        $('#listVoucher').modal('show');
    }

    $scope.listVoucherDetail = (item) => {
        let data = {
            'id' : item.id,
            'name' : item.name,
            'key' : $scope.filter.key
        }
        
        $http.post(base_url + 'marketings/list_voucher_detail',JSON.stringify(data)).then(r => {
            if (r.data.status == 1) {
                $scope.loadInsert = false;
                $scope.list = r.data.data;
            } else toastr["error"](r.data.message);
        }).catch(e => {
            $scope.loadInsert = false;
            toastr["error"]("Đã có lỗi xảy ra với máy chủ API");
        });
    }

    $scope.exportExcel = (item) => {
        let data = {
            'id' : item.id,
            'name' : item.name
        }
        
        $http.post(base_url + 'marketings/export_excel',JSON.stringify(data)).then(r => {
            if (r.data.status == 1) {
                var $a = $("<a>");
					$a.attr("href", r.data.file);
					$a.attr("download", r.data.fileName);
					$("body").append($a);
					$a[0].click();
					$a.remove();
            } else toastr["error"](r.data.message);
        }).catch(e => {
            $scope.loadInsert = false;
            toastr["error"]("Đã có lỗi xảy ra với máy chủ API");
        });
    }

    $scope.exportExcelDetail = (item) => {
        let data = {
            'id' : item.voucher_id,
            'name' : item.name,
            'user_id' : item.user_id,
            'created' : item.created
        }
        $http.post(base_url + 'marketings/export_excel',JSON.stringify(data)).then(r => {
            if (r.data.status == 1) {
                var $a = $("<a>");
					$a.attr("href", r.data.file);
					$a.attr("download", r.data.fileName);
					$("body").append($a);
					$a[0].click();
					$a.remove();
            } else toastr["error"](r.data.message);
        }).catch(e => {
            $scope.loadInsert = false;
            toastr["error"]("Đã có lỗi xảy ra với máy chủ API");
        });
    }

    $scope.updateDetailActive = (value, e) => {
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
                let data = {};
                data.voucher_id = value.voucher_id;
                data.user_id = value.user_id;
                data.created = value.created;
                data.active = (value.active == 1) ? 0 : 1 ;
                $http.post(base_url + 'marketings/update_detail_active',JSON.stringify(data)).then(r => {
                    if (r.data.status == 1) {
                        value.active = data.active;
                        toastr["success"](r.data.message);
                    } else toastr["error"](r.data.message);
                }).catch(e => {
                    toastr["error"]("Đã có lỗi xảy ra với máy chủ API");
                });
            });
    }

    $scope.getVoucherDetail = (item) => {
        window.open(base_url + 'marketings/voucher_details?id=' + item.id);
    }
    $scope.openSearch = (i) => {
        if(i == 1){
            $('.col-search').css('display','block');
        }else{
            $('.col-search').css('display','none');
        }
    }

    $scope.viewPrice = (item) => {
        let val = item;
        val = val.replace(/,/g, "");
        val += '';
        x = val.split('.');
        x1 = x[0];
        x2 = x.length > 1 ? '.' + x[1] : '';
        let rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
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
    
    function select2() {
        setTimeout(() => {
            $('.select2').select2();
        }, 300);
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
