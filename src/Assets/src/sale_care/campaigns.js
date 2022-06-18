
app.controller('campaigns', function ($scope, $http, $sce, $compile) {
    var pi = $scope.pagingInfo = {
        itemsPerPage: 20,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };

    $scope.init = () => {
        $('.opacity').css('opacity', '1');
        $scope.camp = {};
        $scope.filter = {};
        $scope.filter.active = 0;
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;
        $scope.triggerStoreUpdate = {};
        $scope.date_
        $scope.getCamp();
        $scope.getStore();
    }

    $scope.date_ = () => {
        setTimeout(() => {
            $("#date_complain").datepicker({
                dateFormat: "dd-mm-yy"
            });
        }, 100);
    }

    $scope.pasteExcel = (e) => {
        e.preventDefault();
        var cb;
        var clipText = '';
        if (window.clipboardData && window.clipboardData.getData) {
            cb = window.clipboardData;
            clipText = cb.getData('Text');
        } else if (e.clipboardData && e.clipboardData.getData) {
            cb = e.clipboardData;
            clipText = cb.getData('text/plain');
        } else {
            cb = e.originalEvent.clipboardData;
            clipText = cb.getData('text/plain');
        }
        var clipRows = clipText.split('\n');

        // if (clipRows.length >= 100) {
        //     toastr["error"]("Copy ít hơn 100 dòng!");
        //     return false;
        // }

        for (i = 0; i < clipRows.length; i++) {
            clipRows[i] = clipRows[i].split('\t');

        }

        var jsonObj = [];
        $scope.pasteObs = [];



        for (i = 0; i < clipRows.length - 1; i++) {

            var temp = {};

            //  var check = true;

            for (j = 0; j < clipRows[i].length; j++) {
                if (clipRows[i][j] != '\r') {
                    if (clipRows[i][j].length !== 0) {
                        clipRows[i][j] = clipRows[i][j].replace(/[\s]/g, '');
                        temp = clipRows[i][j];
                    }
                }
            }
            jsonObj.push(temp);
        }

        $http.post(base_url + 'sale_care/save_', JSON.stringify(jsonObj)).then(r => {
            if (r && r.data.status == 1) {
                toastr["success"]("Thành công!");
                $scope.datas = r.data.data;
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });

        console.log(jsonObj);


        // $scope.pasteObs.forEach(element => {

        // });
        //// console.log(jsonObj);

    }

    $scope.savePage = () => {
        $http.post(base_url + 'sale_care/save_page', JSON.stringify($scope.pages)).then(r => {
            if (r && r.data.status == 1) {
                toastr["success"]("Thành công!");
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }


    $scope.saveStore = () => {
        $http.post(base_url + 'sale_care/save_gg_store', JSON.stringify($scope.gg_stores)).then(r => {
            if (r && r.data.status == 1) {
                toastr["success"]("Thành công!");
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    $scope.getStore = () => {
        $http.get(base_url + 'sale_care/ajax_get_stores').then(r => {
            if (r && r.data.status == 1) {
                $scope.stores = r.data.data;
                $scope.stores.push({
                    id: -1,
                    name: 'Hồ Chí Minh'
                });
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    $scope.changeCamp = (value) => {
        $http.post(base_url + 'sale_care/save_gg_store', JSON.stringify($scope.gg_stores)).then(r => {
            if (r && r.data.status == 1) {
                toastr["success"]("Thành công!");
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    $scope.storeModal = () => {
        $('.dta_table').addClass('loading');
        $http.get(base_url + 'sale_care/ajax_get_gg_store').then(r => {
            if (r && r.data.status == 1) {
                $scope.gg_stores = r.data.data;
                if ($scope.dTable) {
                    $('.dta_table').DataTable().destroy();
                }
                angular.element(document).ready(function () {
                    setTimeout(() => {
                        $scope.dTable = $('.dta_table');
                        $scope.dTable.DataTable({
                            "retrieve": true
                        });
                        $scope.$apply();
                    }, 0);
                    $scope.select2();
                    $('.dta_table').removeClass('loading');
                });
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    $scope.pageModal = () => {
        $('.dta_table').addClass('loading');
        $http.get(base_url + 'sale_care/ajax_get_page_facebook').then(r => {
            if (r && r.data.status == 1) {
                $scope.pages = r.data.data;
                if ($scope.dTable) {
                    $('.dta_table').DataTable().destroy();
                }
                angular.element(document).ready(function () {
                    setTimeout(() => {
                        $scope.dTable = $('.dta_table');
                        $scope.dTable.DataTable({
                            "retrieve": true
                        });
                        $scope.$apply();
                    }, 0);
                    $scope.select2();
                    $('.dta_table').removeClass('loading');
                });
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    $('.dta_table').on('page.dt', function () {
        $scope.select2();
    });

    $scope.select2 = () => {
        setTimeout(() => {
            $('.select2').select2();
            $scope.$apply();
        }, 0);
    }

    $scope.exportE = (value) => {
        var data = {
            type: value
        }
        $http.post(base_url + 'sale_care/ajax_export_excel', JSON.stringify(data)).then(r => {
            console.log(r);
            window.open(base_url + 'sale_care/create_result', '_blank');
            if (r && r.data.status == 1) {
                toastr["success"]("Thành công!");
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    $scope.openValue = (value) => {
        value.open = !value.open;
        $scope.date_();
        if (value.open == false) {
            $scope.cr_item = value;

            $scope.save(value);
        }
    }


    $scope.activeCamp = (value) => {
        value.open = false;
        setTimeout(() => {
            $scope.$apply();
            $scope.save(value);
        }, 0);
    }



    $scope.save = (data) => {
        $http.post(base_url + 'sale_care/ajax_save_campaign', JSON.stringify(data)).then(r => {
            if (r && r.data.status == 1) {
                toastr["success"]("Thành công!");
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    $scope.saveCamp = (e) => {
        var data = {
            name: $scope.camp.name
        }
        $(e.target).css('pointer-events', 'none');
        $http.post(base_url + 'sale_care/ajax_save_campaign', JSON.stringify(data)).then(r => {
            $(e.target).css('pointer-events', 'initial');
            if (r && r.data.status == 1) {
                $scope.getCamp();
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    $scope.getCamp = () => {
        $('.table').addClass('loading');
        $http.get(base_url + 'sale_care/ajax_get_campaign?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r && r.data.status == 1) {
                $scope.camps = r.data.data;
                $scope.camps.map(
                    x => {
                        x.open = false;
                    }
                );
                $scope.pagingInfo.total = r.data.count;
                $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
            } else toastr["error"]("Đã có lỗi xẩy ra!");
            $('.table').removeClass('loading');
        });
    }

    $scope.go2Page = function (page) {
        if (page < 0) return;
        var pi = $scope.pagingInfo;
        pi.currentPage = page;
        pi.from = pi.offset = (pi.currentPage - 1) * pi.itemsPerPage;
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = ($scope.pagingInfo.currentPage - 1) * $scope.pagingInfo.itemsPerPage;
        $scope.getCamp();
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
})