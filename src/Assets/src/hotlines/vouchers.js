angular.module('app', []).controller('voucherCtrl', function ($scope, $http, $sce) {

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
        $scope.getAll();
    }
    
    $scope.restFilter = () =>{
        $scope.filter = {};
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;
        $scope.filter.type = "";
        $scope.filter.discount_type = "";
        $scope.filter.active = "";
        $scope.filter.key = "";
    }

    $scope.resetUpdate = (item) =>{
        $scope.update = {};
        $scope.update.id = item.id;
        $scope.update.name = item.name;
        $scope.update.type = item.type;
        $scope.update.discount = $scope.viewPrice(String(item.discount));
        $scope.update.discount_type = item.discount_type;
        $scope.update.max_use = item.max_use;
        $scope.update.exp_date = $scope.formatDate(item.exp_date,'DD-MM-YYYY');
    }
    

    $scope.getAll = () => {
        $scope.loadding = true;
        $http.get(base_url + 'hotlines/get_list_voucher?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r.data.status == 1) {
                $scope.rows = r.data.data;
                $scope.pagingInfo.total = r.data.count;
                $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
                select2();
                $scope.loadding = false;
            } else toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
        });
    }

    $scope.openAdd = () => {
        d = new Date();
        $scope.insert = {};
        $scope.insert.type = "1";
        $scope.insert.max_use = "1";
        $scope.insert.discount_type = "1";
        $scope.insert.exp_date = d.getDate()  + '-' + d.getMonth() + '-' +  d.getFullYear();
        $('.datepickerDate').datepicker({
            dateFormat: "dd-mm-yy",
            minDate: 0,
        });
        $('#openAdd').modal('show');
        select2();
    }

    $scope.insertVoucher = () => {
        $scope.loadInsert = true;
        $http.post(base_url + 'hotlines/saveVoucher',JSON.stringify($scope.insert)).then(r => {
            if (r.data.status == 1) {
                $('#openAdd').modal('hide');
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

    $scope.openUpdate = (item) => {
        $scope.resetUpdate(angular.copy(item));
        $('.datepickerDate').datepicker({
            dateFormat: "dd-mm-yy",
            minDate: 0,
        });
        $('#openUpdate').modal('show');
        select2();
    }

    $scope.updateVoucher = () => {
        $scope.loadInsert = true;

        $http.post(base_url + 'hotlines/saveVoucher',JSON.stringify($scope.update)).then(r => {
            if (r.data.status == 1) {
                $('#openUpdate').modal('hide');
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
    
    $scope.updateVoucherActive = (value, e) => {
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
                data.id = value.id;
                data.active = (value.active == 1) ? 2 : 1 ;
                $http.post(base_url + 'hotlines/updateVoucherActive',JSON.stringify(data)).then(r => {
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
        window.open(base_url + 'hotlines/voucher_details?id=' + item.id);
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
