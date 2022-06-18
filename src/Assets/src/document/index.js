
app.controller('document', function ($scope, $http, $sce, $interval) {
    var pi = $scope.pagingInfo = {
        itemsPerPage: 10,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };
    $scope.init = () => {

        let category_param = getParamsValue('category');
        if (!category_param) {
            $scope.cr_category_id = '-1';

        } else {
            $scope.cr_category_id = category_param;
        }

        $('.box').css('opacity', '1');




        $scope.filter = {};
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;
        $scope.filter.search_saperate = 0;



        $scope.doc = {};
        $scope.check_submit = 0;
        //  $scope.cr_category_id = '-1';
        $scope.type_mb = '-1';
        $scope.open = '0';

        $scope.dem = 0;

        $scope.getCategory();
        $scope.get_active_doc();
        $scope.getCompany();

        $scope.dateInputInit();

        setTimeout(() => {
            $scope.filter.date = "";
            $scope.getDocuments($scope.cr_category_id);

        }, 100);
    };

    $scope.changeSearchType = () => {
        $scope.filter.search_saperate = !$scope.filter.search_saperate;
        $scope.getDocuments($scope.cr_category_id);
    }

    $scope.openDetail = (item, option = null) => {
        var regex = /http.*/

        if (option) {
            //    href="document/doc_detail/{{value.id_rpl}}" target="_blank"
            var matchesRegex = regex.test(item.file);
            if (matchesRegex) {
                window.open(item.rpl_file, '_blank');
            } else {
                window.open("document/doc_detail/" + item.id_rpl, '_blank');
            }
            return;
        }
        var matchesRegex = regex.test(item.file);
        if (matchesRegex) {
            window.open(item.file, '_blank');
        } else {
            window.open("document/doc_detail/" + item.id, '_blank');
        }
    }

    $scope.dWord = (item) => {
        var regex = /http.*/
        var matchesRegex = regex.test(item.file);
        if (matchesRegex) {
            console.log(item.word_file);
            window.open(item.word_file, '_blank');
        } else {
            window.open("assets/uploads/documents/" + item.word_file, '_blank');
        }
    }

    $scope.rendUrl = (item) => {
        var regex = /http.*/
        var matchesRegex = regex.test(item.file);
        if (matchesRegex) {
            return item.word_file;
        }
        return "assets/uploads/documents/" + item.word_file;

    }


    $(".file_upload").on("change", function (e) {
        $(e.target).addClass('loading');
        var fd = new FormData();
        var files = $(e.target)[0].files[0];
        fd.append('file', files);
        if ($(e.target).attr('data-model') == "word_file") {
            fd.append('file_type', 'word');
        } else {
            fd.append('file_type', 'pdf');
        }
        $http({
            method: 'post',
            url: 'Uploads/ajax_upload_to_filehost?folder=document',
            data: fd,
            headers: {
                'Content-Type': undefined
            },
        }).then(function successCallback(r) {
            $(e.target).removeClass('loading');
            if (r && r.data.status) {
                $scope.doc[$(e.target).attr('data-model')] = r.data.data[0];
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    });


    $scope.renderExcel = () => {
        $http.get(base_url + '/document/ajax_get_documents_excel?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r && r.data.status == 1) {
                var $a = $("<a>");
                $a.attr("href", r.data.data);
                $a.attr("download", "Excel" + moment().format('YYYYMMDDHHIISS') + '.xlsx');
                $("body").append($a);
                $a[0].click();
                $a.remove();
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    $scope.dateInputInit = () => {
        if ($('.date').length) {
            if (typeof start === "undefined") {
                start = end = moment().subtract(1, 'days').format("MM/DD/YYYY");
            }
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

    $scope.getCompany = () => {
        $http.get(base_url + '/document/ajax_get_company').then(r => {
            if (r && r.data.status == 1) {
                $scope.companys = r.data.data;
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        })
    }

    $scope.deleteDoc = (doc) => {
        if (window.confirm('Bạn muốn xóa file trên?')) {
            $http.post(base_url + '/document/ajax_delete_doc', JSON.stringify(doc)).then(r => {
                if (r && r.data.status == 1) {
                    toastr["success"]("Xóa thành công!");
                    $('#create_modal').modal('hide');
                    $scope.getDocuments($scope.cr_category_id);
                } else toastr["error"]("Đã có lỗi xẩy ra!");
                $('#send_btn_mess').css('pointer-events', 'initial');

            })
        }
    }

    $scope.openModalSend = (value) => {
        $scope.cr_value = value;
        $('#confirm').modal('show');
    }

    $scope.sendMess = (value) => {
        $('#send_btn_mess').css('pointer-events', 'none');
        $http.post(base_url + '/document/ajax_sent_mess', JSON.stringify(value)).then(r => {
            if (r && r.data.status == 1) {
                toastr["success"]("Gửi thành công!");
                $('#confirm').modal('hide');
            } else toastr["error"]("Đã có lỗi xẩy ra!");
            $('#send_btn_mess').css('pointer-events', 'initial');
        })
    }

    $scope.changeOpen = (open) => {

        setTimeout(() => {
            $scope.$apply(function () {

                if ($scope.open == '0') {
                    $scope.doc.end_date = undefined;
                }
            })
        }, 10);

    }
    $scope.openModal = (item) => {
        $scope.doc = angular.copy(item);
        $scope.open = '0';
        if ($scope.doc.end_date) {
            $scope.open = '1';
        }

        setTimeout(() => {
            if ($scope.doc.storage_group_id && $scope.doc.storage_group_id != 0) {
                $('#storage_group_id').select2('val', $scope.doc.storage_group_id);
                console.log($('#doc_replace_id').val($scope.doc.storage_group_id).trigger('change'));
            } else {
                $('#storage_group_id').select2('val', null);
                console.log($('#doc_replace_id').val(null).trigger('change'));
            }

            if ($scope.doc.sign_id && $scope.doc.sign_id != 0) {
                $('#sign').select2('val', $scope.doc.sign_id);
                console.log($('#sign').select2('val', $scope.doc.sign_id));
            } else {
                $('#sign').select2('val', null);
                console.log($('#sign').select2('val', null));
            }
            if (item.group_ids) {
                $('#group_id').select2('val', item.group_ids);

            } else {
                $('#group_id').select2('val', null);
            }
            if (item.id_rpl && item.id_rpl != 0) {
                $('#doc_replace_id').val(item.id_rpl).trigger('change');
                console.log($('#doc_replace_id').val(item.id_rpl).trigger('change'));
            } else {
                $('#doc_replace_id').val(null).trigger('change');
                console.log($('#doc_replace_id').val(null).trigger('change'));
            }
        }, 10);
        $scope.select2();


        $('#create_modal').modal('show');
    }

    $scope.select2 = () => {
        setTimeout(() => {
            $('.select3').select2();
        }, 100);
    }

    $scope.clear = (name) => {

        setTimeout(() => {
            $('#' + name).select2('val', null);
            console.log($('#' + name).select2('val', null));
        }, 10);
        $scope.doc.sign_id = 0;

    }
    $scope.unset = (id) => {
        if (id == 1) {
            $scope.filter.group_id = undefined;
            $scope.getTable($scope.cr_category_id);
        } else if (id == 2) {
            $scope.filter.sign_id = undefined;
            setTimeout(() => {
                $('#sign_search').val(null).trigger('change');
                console.log($('#sign_search').val(null).trigger('change'));
            }, 0);
        }


    }
    $scope.get_active_doc = () => {
        $http.get(base_url + '/document/ajax_get_active_doc').then(r => {
            if (r && r.data.status == 1) {
                $scope.active_doc = r.data.data;
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        })
    }

    $scope.openConten = (file) => {
        $html = `<iframe src="assets/uploads/document/${file}" width="100%" height="400px">
                        </iframe>`
        $scope.html_note = $sce.trustAsHtml($html);

        $('#file_content').modal('show');
    }


    $scope.getTable = (act) => {
        $scope.filter.active = act;
        $scope.type_mb = act;
        $scope.getDocuments($scope.cr_category_id);
    }

    $scope.serchKey = (act) => {
        $scope.filter.active = act;
        $scope.type_mb = act;


        $scope.getDocuments($scope.cr_category_id);


    }



    $scope.getDocuments = (id) => {
        $('table').addClass('loading');
        $scope.filter.category_id = id;
        insertParam('category', id);
        $http.get(base_url + '/document/ajax_get_documents?filter=' + JSON.stringify($scope.filter)).then(r => {

            $('table').removeClass('loading');
            if (r && r.data.status == 1) {
                $scope.documents = r.data.data;
                $scope.cr_category_id = id;

                $scope.pagingInfo.total = r.data.count;
                $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        })
    }

    $scope.getCategory = () => {
        $http.get(base_url + '/document/ajax_get_category').then(r => {
            if (r && r.data.status == 1) {
                $scope.category = r.data.data;
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        })
    }

    $scope.check = (data) => {
        if (!data.name || data.name == '') {
            toastr["error"]("Nhập tên!");
            return false;
        }
        // if (!data.code || data.code == '') {
        //     toastr["error"]("Nhập code!");
        //     return false;
        // }
        if (!data.category_id) {
            toastr["error"]("Nhập loại!");
            return false;
        }
        if (!data.storage_group_id) {
            toastr["error"]("Chọn nơi lưu trữ!");
            return false;
        }
        if (!data.group_id || data.group_id && data.group_id.length == 0) {
            toastr["error"]("Chọn bộ phận có thể xem!");
            return false;
        }
        // if (!data.sign_id) {
        //     toastr["error"]("Chọn người ký!");
        //     return false;
        // }
        // if (!data.sign_date) {
        //     toastr["error"]("Chọn ngày ký!");
        //     return false;
        // }

        // if (!data.start_date) {
        //     toastr["error"]("Chọn ngày bắt đầu!");
        //     return false;
        // }

        // if ($scope.open == 1) {
        //     if (!data.end_date) {
        //         toastr["error"]("Chọn ngày kết thúc!");
        //         return false;
        //     }
        // }
        return true;
    }
    $scope.freshForm = () => {
        $scope.doc = {};
        setTimeout(() => {
            $('#sign').val(null).trigger('change');
            console.log($('#sign').val(null).trigger('change'));
            $('#storage_group_id').val(null).trigger('change');
            console.log($('#storage_group_id').val(null).trigger('change'));
            $('#doc_replace_id').val(null).trigger('change');
            console.log($('#doc_replace_id').val(null).trigger('change'));
            $('#group_id').select2('val', '');
            $("#file").val("");
        }, 100);

        $scope.select2();

        // setTimeout(() => {
        //     $('#group_id').select2('val', '');
        // }, 100);
    }

    $scope.setUser = () => {
        $scope.freshForm();
        $scope.open = '0';
    }
    $scope.save = () => {



        var fd = new FormData();
        // var files = document.getElementById('file').files[0],
        //     file_w = document.getElementById('file_w').files[0];;

        // fd.append('file', files);
        // fd.append('file_w', file_w);

        fd.append("data", angular.toJson($scope.doc));

        //$scope.freshForm();
        if (!$scope.doc.id) {
            if (!$scope.doc.file) {
                toastr["error"]("Chọn file!");
                return false;
            }
        }

        if (!$scope.doc.company_id) {
            toastr["error"]("Chọn công ty!");
            return false;
        }

        if ($scope.check($scope.doc) == false) {
            return false;
        }

        if ($scope.check_submit == 1) {
            return false;
        }
        $scope.check_submit = 1;
        // AJAX request
        $http({
            method: 'post',
            url: 'document/save',
            data: fd,
            headers: {
                'Content-Type': undefined
            },
        }).then(function successCallback(r) {

            $scope.check_submit = 0;
            if (r && r.data.status == 1) {
                toastr["success"]("Thành công!");
                $('#create_modal').modal('hide');
                $scope.freshForm();
                $scope.getDocuments($scope.cr_category_id);
                $scope.get_active_doc();
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }
    $scope.go2Page = function (page) {
        if (page < 0) return;
        var pi = $scope.pagingInfo;
        pi.currentPage = page;
        pi.from = pi.offset = (pi.currentPage - 1) * pi.itemsPerPage;
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = ($scope.pagingInfo.currentPage - 1) * $scope.pagingInfo.itemsPerPage;
        $scope.getDocuments($scope.cr_category_id);
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
}).filter('to_trusted', ['$sce', function ($sce) {
    return function (text) {
        return $sce.trustAsHtml(text);
    };
}])