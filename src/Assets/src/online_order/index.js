app.controller('confession_confirm', function ($scope, $http, $sce, $compile) {

    var pi = $scope.pagingInfo = {
        itemsPerPage: 20,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };

    $scope.init = () => {
        $('.box').css('opacity', "1");
        $scope.confirm = {};
        $scope.dateInputInit();

        $scope.filter = {};
        $scope.filter.nation_id = "0";
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;
        $scope.company_id = company_id;
        $scope.dem = 0;

        $scope.getDomain();
        $scope.getTag();
        setTimeout(() => {
            $scope.filter.date = "";
            let param_id = getParamsValue('id');
            if (param_id) {
                $scope.getOnlineOrder(param_id);
            } else {
                $scope.getOnlineOrder();
            }
        }, 100);
    }
    $scope.getDomain = () => {
        let filter = {
            "active": 1,
            "company_id": $scope.company_id,
        };
        $http.get(base_url + 'online_domain/get_list?filter=' + JSON.stringify(filter)).then(r => {
            if (r.data.status == 1) {
                $scope.domains = r.data.data;
            }
        });
    }

    $scope.getTag = async () => {
        $http.get(base_url + 'online_order/list_order_tag').then(r => {
            if (r && r.data.status == 1) {
                $scope.tag = r.data.data;
                select2();
            }
        });
    };

    $scope.changeTag = (item, id) => {
        if (id > 0) {
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
            }, function () {
                if (item.list_tag_id == null) {
                    item.list_tag_id = "[" + id + "]";
                    item.list_tag_id = JSON.parse(item.list_tag_id);
                } else {
                    item.list_tag_id.push(id);
                }
                $http.post(base_url + 'online_order/change_tag_order', item).then(r => {
                    if (r.data.status == 1) {
                        toastr["success"]("Thành công");
                        $scope.getOnlineOrder();
                        $scope.loadding = false;
                    } else toastr["error"]("Thất bại");
                });
            });
        }
    }

    $scope.getOnlineOrder = (id = null) => {
        var data = angular.copy($scope.filter);

        $('table tbody').addClass('loading');
        $http.get(base_url + '/online_order/ajax_get_online_order?filter=' + JSON.stringify(data)).then(r => {
            $('table tbody').removeClass('loading');

            if (r && r.data.status == 1) {
                $scope.orders = r.data.data;
                if ($scope.dem == 0) {
                    if (id) {
                        var Ckd = false;
                        $scope.orders.forEach(element => {
                            if (element.id == id) {
                                Ckd = true;
                                $scope.openInforModalDetail(element);
                                select2();
                            }
                            if (element.list_tag) {
                                element.list_tag_id = [];
                                element.list_tag.forEach(itag => {
                                    element.list_tag_id.push(itag.id);
                                });
                            }
                        });
                        if (!Ckd) {
                            $('#modalDetail').modal('show');
                        }
                    }
                    dem = 2;
                } else {
                    window.history.pushState("", "", base_url + '/online_order');
                    console.log(window.history.pushState("", "", base_url + '/online_order'));
                }
                $scope.orders.forEach(element => {
                    if (element.list_tag) {
                        element.list_tag_id = [];
                        element.list_tag.forEach(itag => {
                            element.list_tag_id.push(itag.id);
                        });
                    }
                });
                $scope.dem++;

                $scope.pagingInfo.total = r.data.count;
                $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    $scope.checkTag = (item, id) => {
        let err = true;
        if (item.list_tag_id != null) {
            jQuery.each(item.list_tag_id, function (index, value) {
                if (value == id) {
                    return err = false;
                }
            });
        }
        return err;
    }

    $scope.setbgcolor = (color) => {
        return {
            "background-color": color
        };
    }

    $scope.dateTime = () => {
        setTimeout(() => {
            $(".date_").datepicker({
                dateFormat: "dd-mm-yy"
            });
        }, 1);
    }
    $scope.dateInputInit = () => {
        if ($('.date').length) {
            //var start = $scope.start;
            //var end = $scope.end;
            if (typeof start === "undefined") {
                start = end = moment().subtract(1, 'days').format("MM/DD/YYYY");
            }
            // if ($scope.filter.date) {
            //     var date = $scope.filter.date.split(' - '),
            //         start = moment(date[0], 'DD/MM/YYYY'),
            //         end = moment(date[1], 'DD/MM/YYYY');
            // } else {
            //     var
            //         start = moment(),
            //         end = moment();
            // }

            var
                start = moment(),
                end = moment();
            setTimeout(() => {
                $('.date').daterangepicker({
                    opens: 'right',
                    alwaysShowCalendars: true,
                    startDate: start,
                    endDate: end,
                    ranges: {
                        'Hôm nay': [moment(), moment()],
                        'Hôm qua': [moment().subtract(1, 'days'), moment().subtract(1,
                            'days')],
                        '7 ngày trước': [moment().subtract(6, 'days'), moment()],
                        '30 ngày trước': [moment().subtract(29, 'days'), moment()],
                        'Tháng này': [moment().startOf('month'), moment().endOf('month')],
                        'Tháng trước': [moment().subtract(1, 'month').startOf('month'),
                            moment().subtract(1, 'month').endOf('month')
                        ]
                    },
                    locale: {
                        format: 'DD/MM/YYYY'
                    }
                });
            }, 100);
        }
    }



    $scope.openInforModalDetail = (value) => {
        $scope.cr_item = angular.copy(value);
        if ($scope.cr_item.list_tag) {
            $scope.cr_item.list_tag_id = [];
            $scope.cr_item.list_tag.forEach(itag => {
                $scope.cr_item.list_tag_id.push(itag.id);
            });
        }
        select2();
        $('#modalDetail').modal('show');
    }
    $scope.totalMoney_ = (item) => {
        var tong = 0;
        if (item)
            item.products.forEach(element => {
                tong += (element.product_pr * parseInt(element.quantity_));
            });
        return tong + parseInt(item.shipping_fee);
    }

    $scope.totalMoneyAmount_ = (item) => {
        var tong = 0;
        if (item)
            item.products.forEach(element => {
                tong += (element.product_pr * parseInt(element.quantity_));
            });
            tong = tong + parseInt(item.discount) + parseInt(item.shipping_fee);
        return tong;
    }

    $scope.changeNumber = (i) => {

        if (i.quantity_ == '') {
            i.quantity_ = 1;
        }
    }
    $scope.deletePr = (i, item) => {
        item.splice(i, 1);
    }

    $scope.updateOrder = (value, status = null) => {
        if (value.products.length == 0) {
            toastr["error"]("Không có sản phẩm nào!");
            return;
        }
        var data = {
            id: value.id,
            list_tag_id: value.list_tag_id,
            tags: value.tags,
            tvv_note: value.tvv_note,
            discount: value.discount,
            product: value.products,
            domain_id: value.domain_id
        };
        if (status) {

            data.status = status;
        }

        $('#modalDetail .modal-content').addClass('loading');

        $http.post(base_url + '/online_order/update_order', JSON.stringify(data)).then(r => {
            $('#modalDetail .modal-content').removeClass('loading');
            if (r && r.data.status == 1) {
                $('#modalDetail').modal('hide');
                $scope.getOnlineOrder();
                toastr["success"]("Thành công!");
            } else {
                toastr["error"]("Đã có lỗi xẩy ra!");
            }
        });
    }

    $scope.getTable = (tus) => {
        $scope.filter.status = tus;
        $scope.go2Page(1);
    }

    $scope.openInforModal = (value, status) => {
        $scope.cr_item = value;
        if (status == 1) {
            $scope.confirm.text = "Bạn muốn xác nhận đơn";
        } else if (status == -1) {
            $scope.confirm.text = "Bạn muốn hủy đơn";
        } else if (status == 3) {
            $scope.confirm.text = "Bạn muốn hoàn thành đơn";
        }
        $scope.confirm.status = status;

        $('#confirm').modal('show');
    }

    $scope.confirm_ = (value, status) => {
        var data = {
            id: value.id,
            domain_id: value.domain_id,
            status: status
        };
        $('.lb').css('pointer-events', 'none');
        $http.post(base_url + '/online_order/ajax_change_tus_order', JSON.stringify(data)).then(r => {
            if (r && r.data.status == 1) {
                $('.lb').css('pointer-events', 'initial');
                $('#confirm').modal('hide');
                toastr["success"]("Thành công!");
                $scope.getOnlineOrder();

            } else {
                toastr["error"]("Đã có lỗi xẩy ra!");
            }
        });
    }

    $scope.clickTag = (item, tag, e) => {
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
        }, function () {
            let data = {
                'id': item.id,
                'id_tag': tag,
                'tags': item.tags
            };
            $scope.updateOrderTag(data);
        });
    }

    $scope.updateOrderTag = (data) => {
        $scope.loading = true;
        $http.post(base_url + 'online_order/update_order_tag', JSON.stringify(data)).then(r => {
            if (r.data.status == 1) {
                toastr["success"]("Thành công");
                $scope.getOnlineOrder();
                $scope.loadding = false;
            } else toastr["error"]("Thất bại");
        });
    }

    $scope.openValue = (value) => {
        value.open = !value.open;
        if (value.open == false) {
            $scope.cr_item = value;
            $scope.save(value);
        }
    }


    $scope.totalMoney = (obs) => {
        var total = 0;
        obs.products.forEach(element => {
            total += parseInt(element.product_pr) * parseInt(element.quantity);
        });
        total = total + parseInt(obs.shipping_fee);
        return formatNumber(total);
    }

    $scope.totalMoneyAmount = (obs) => {
        var total = 0;
        obs.products.forEach(element => {
            total += parseInt(element.product_pr) * parseInt(element.quantity);
        });
        total = total + parseInt(obs.discount) + parseInt(obs.shipping_fee);
        return formatNumber(total);
    }

    function select2() {
        setTimeout(() => {
            $('.select2').select2();
        }, 300);
    }

    function formatNumber(num) {
        if (!num) {
            return 0;
        }
        num = parseInt(num);
        return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    }

    $('input').on("keypress", function (e) {
        if (e.keyCode == 13) {
            console.log(123);

            $scope.cr_item.open = !$scope.cr_item.open;
            $scope.save($scope.cr_item);
        }
    });

    $scope.save = (value) => {
        if (!value.quantity) {
            value.quantity = 0;
        }
        $http.post(base_url + '/online_order/ajax_save_detail', JSON.stringify(value)).then(r => {
            console.log(r);
            if (r && r.data.status == 1) {
                toastr["success"]("Thành công!");
            } else {
                value.quantity = $scope.cr_item.quantity;
                toastr["error"]("Đã có lỗi xẩy ra!");
            }
        });
    }

    $scope.go2Page = function (page) {
        if (page < 0) return;
        var pi = $scope.pagingInfo;
        pi.currentPage = page;
        pi.from = pi.offset = (pi.currentPage - 1) * pi.itemsPerPage;
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = ($scope.pagingInfo.currentPage - 1) * $scope.pagingInfo.itemsPerPage;
        $scope.getOnlineOrder();
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

});

app.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if (event.which === 13) {
                scope.$apply(function () {
                    scope.$eval(attrs.ngEnter);
                });
                event.preventDefault();
            }
        });
    };
})


app.directive('copyToClipboard', function () {
    return {
        restrict: 'A',
        link: function (scope, elem, attrs) {
            elem.click(function () {
                if (attrs.copyToClipboard) {
                    var $temp_input = $("<input>");
                    $("body").append($temp_input);
                    $temp_input.val(attrs.copyToClipboard).select();
                    document.execCommand("copy");
                    toastr["success"]("Copy tên SP Crm: " + attrs.copyToClipboard);
                    $temp_input.remove();
                }
            });
        }
    };
});