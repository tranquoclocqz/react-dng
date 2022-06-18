app.directive('ngFile', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {

            element.bind('change', function () {

                $parse(attrs.ngFile).assign(scope, element[0].files)

                scope.$apply();

            });
        }
    };
}]);
app.controller('extractExcel', function ($scope, $http, $compile, $window, $timeout) {


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
        $scope.excel = {};
        $scope.excel.nation = '1';
        $scope.excel_step = 0;
        $scope.filter = {};
        $scope.filter.is_registed = 0;
        $scope.filter.limit = pi.itemsPerPage;
        $scope.filter.offset = pi.offset;
        $scope.triggerFunctionTagCare = {};
        $scope.option = 1;
        $scope.pass = true;

        $scope.dataSourceCare();
        $scope.getSourceExcel();
        $scope.triggerSourceExcel = {};
        $scope.getEmployy();
        $scope.changeCare();
        $scope.getStore();
        $scope.dataSourceCare();

        $scope.recive = {};
        $scope.recive.all_data = false;
        $scope.checkBoxNumber = '0';
    }

    $scope.suggessNumber = () => {
        var numberUser = ($scope.recive.users.length == 0 || !$scope.recive.users) ? $scope.employys.length : $scope.recive.users.length;
        // Kiễm tra tổng số data cần đảo phải phù hợp với số lượng nhân viên nhận data đảo
        if($scope.recives.total < numberUser){
            toastr["error"]("Tổng số data phải lớn hơn hoặc bằng nhân viên được nhận số !");
        }else{
            $scope.recive.extract = Math.round($scope.recives.total / numberUser);
        }
    }
    
    $scope.dataSourceCare = () => {
        $http.get(base_url + 'sale_care/ajax_get_data_source_care').then(r => {
            if (r && r.data.status == 1) {
                $scope.sourceCare = r.data.data;
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    $scope.getStore = () => {
        $http.get(base_url + 'sale_care/ajax_get_stores').then(r => {
            if (r && r.data.status == 1) {
                $scope.stores = r.data.data;
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    $scope.select2 = () => {
        setTimeout(() => {
            $('.select2').select2();
            $scope.$apply();
        }, 0);
    }


    $scope.changeCare = () => {
        $http.get(base_url + 'sale_care/ajax_get_care_tag').then(r => {
            if (r && r.data.status == 1) {
                $scope.list_key = r.data.data;
                $scope.extract_tag = angular.copy($scope.list_key);
                $scope.extract_tag.unshift({ name: "Chưa chăm sóc", id: 0 });
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    $scope.re_f = () => {
        $scope.insertPhones = undefined;
        $scope.updateQuery = undefined;
        $scope.deleteAr = undefined;
        $scope.searchFilter = undefined;
        $scope.checkBoxNumber = '0';
        setTimeout(() => {
            $('#userFrom .select2').select2('val', null);
            $('#unExtract.select2').select2('val', null);
        }, 0);
        $scope.select2();
    }

    $scope.convertToString = (items, ids) => {

        var string = "";
        var dem = 0;

        items.forEach((value, index) => {
            if (ids.indexOf(value.id) >= 0) {
                if (dem <= 1) {
                    if (string != "")
                        string = string + ",";
                    string = string + value.name;
                }
                dem++;
            }
        });
        if (ids.length > 2) {
            string = string + "...";
        }

        string = string + "(" + ids.length + ")";
        return string;

    }
    $scope.recivePhone_ = (e) => {
        $scope.recivePhone(e);

        $('#confirm').modal('show');
    }
    $scope.checkBox = () => {
        $scope.checkBoxNumber = $scope.checkBoxNumber == '0' ? '1' : '0';
        $scope.recivePhone();
    }
    $("#confirm").on("hidden.bs.modal", function () {
        $scope.checkBoxNumber = '0';
    });

    $scope.recivePhone = (e) => {
        if ($scope.pass == true) {
            var users = [];
            if (!$scope.recive.users || $scope.recive.users.length == 0) {
                users = $scope.employys.map(x => {
                    return x.id;
                })
            } else {
                users = $scope.recive.users;
            }
            var data = {
                users: users,
                care_date: $scope.recive.care_date,
                extract: $scope.recive.extract,
                option: $scope.option,
                userFrom: $scope.recive.userFrom,
                tag_ids: $scope.recive.tag_ids,
                created: $scope.recive.created,
                start: $scope.recive.start,
                end: $scope.recive.end,
                store_id: $scope.recive.store_id,
                checkBox: $scope.checkBoxNumber,
                source_id: $scope.recive.source_id,
            }
            if (e) {
                $(e.target).css('pointer-events', 'none');;
                $(e.target).text('Xử lý');
            }

            $('.small_loading').addClass('loading');
            $('#cfirm').css('pointer-events', 'none');
            $('#confirm .modal-body').addClass('loading');

            $http.get(base_url + 'sale_care/ajax_recive_phone?filter=' + JSON.stringify(data)).then(r => {
                if (e) {
                    $(e.target).css('pointer-events', 'initial');
                    $(e.target).text('Xác nhận');
                }
                $('.small_loading').removeClass('loading');
                $('#cfirm').css('pointer-events', 'initial');
                $('#confirm .modal-body').removeClass('loading');

                if (r && r.data.status == 1) {
                    $scope.recives = r.data.data;
                    $scope.insertPhones = r.data.insert;
                    $scope.updateQuery = r.data.update_qr;
                    $scope.deleteAr = r.data.delete;
                    $scope.searchFilter = r.data.filter;
                    if ($scope.searchFilter.start) {
                        $scope.searchFilter.start = moment($scope.searchFilter.start, "YYYY/MM/DD").format("DD/MM/YYYY");
                    }
                    if ($scope.searchFilter.end) {
                        $scope.searchFilter.end = moment($scope.searchFilter.end, "YYYY/MM/DD").format("DD/MM/YYYY");
                    }


                } else if (r && r.data.status == 0) {
                    //toastr["error"](r.data.message);
                    $scope.recives = {};
                    $scope.recives.total = 0;

                    $scope.re_f();

                } else toastr["error"]("Đã có lỗi xẩy ra!");
            });
        }
        $scope.recive.extract = 0;
        $scope.pass = true;
    }


    $scope.$watch('option', function (newValues, oldValues) {
        if (oldValues == newValues)
            return false;



        $scope.recives = undefined;
        $scope.insertPhones = undefined;
        $scope.updateQuery = undefined;
        setTimeout(() => {
            $('#userFrom .select2').select2('val', null);
            $('#unExtract.select2').select2('val', null);
        }, 0);
        $scope.recive = {};
        $scope.checkBoxNumber = '0';

        //  $scope.recive.checkBoxNumber = false;


    });



    $scope.confirmExtract = (e) => {

        var data = {
            phones: $scope.insertPhones,
            query: $scope.updateQuery,
            delete: $scope.deleteAr
        }


        $(e.target).css('pointer-events', 'none');
        $http.post(base_url + 'sale_care/ajax_confirm_extract', JSON.stringify(data)).then(r => {
            $(e.target).css('pointer-events', 'initial');
            if (r && r.data.status == 1) {
                $("#confirm").modal('hide');
                $scope.getSourceExcel();
                toastr["success"]("Thành công!");
            } else toastr["error"]("Đã có lỗi xẩy ra!");
            $scope.recives = undefined;
            $scope.recive = {};
            // $scope.checkBoxNumber = false;

            $scope.re_f();
        });

    }

    $scope.getEmployy = () => {
        $http.get(base_url + 'sale_care/ajax_get_sale').then(r => {
            if (r && r.data.status == 1) {
                $scope.employys = r.data.data;
                $scope.employys.push(sales_manager);
                console.log($scope.employys);
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }
    $('#extract').on('click', function (e) {
        $('.content_extract').slideToggle();
        //$scope.exFresh();
        $scope.$apply();
    })
    $('#openExcel').on('click', function (e) {
        $('.content_excel').slideToggle();
        $scope.exFresh();
        $scope.$apply();
    })
    var fdExel = new FormData(),
        fdExel_temp = new FormData();

    function preventDefaults(e) {
        e.preventDefault()
        e.stopPropagation()
    }

    function uploadExel(file) {
        $('#demo .wrap-info').html('');
        $('.cf_import').addClass('hidden');
        let limit = 1,
            flag_show_btn = 0;
        arrType = [
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            '.xlsx',
            '.xls',
        ],
            count_upload = 0,
            limit_size = 5342880, //5Mb
            block = '#modal_import .modal-body';
        $(".wrap-exel-upload .wrap-drop-img .note_title").text('Kiểm tra...');
        for (var x = 0; x < file.length; x++) {
            console.log(file[x].type);

            if (arrType.includes(file[x].type)) {
                if (count_upload < limit) {
                    if (file[x].size <= limit_size) {
                        fdExel.append("files[]", file[x]);
                        count_upload++;
                    } else toastr.error('File: ' + file[x].name + ' vượt quá quá kích thước cho phép!');
                } else {
                    toastr.error('Vượt quá số lượng cho phép!');
                    $('.wrap-exel-upload .wrap-drop-img .upload-area .note_title').html('Kéo thả vào đây<br/>hoặc<br/>nhấn vào đây để chọn file');
                    return;
                    break;
                }
            } else {
                toastr.error('File: ' + file[x].name + ' sai định dạng!');
                $('.wrap-exel-upload .wrap-drop-img .upload-area .note_title').html('Kéo thả vào đây<br/>hoặc<br/>nhấn vào đây để chọn file');
            }
        }
        if (fdExel.get('files[]') == null) return;

        $scope.checkExcel();
    }
    $(function () {
        /*  begin upload modal Exel*/
        $(".wrap-exel-upload .wrap-drop-img").on("drop", function (e) {
            e.preventDefault();
            e.stopPropagation();
        });

        // Drag enter
        $('.wrap-exel-upload .wrap-drop-img').on('dragenter', function (e) { //ra khỏi vùng chọn
            preventDefaults(e)
            $(".wrap-exel-upload .wrap-drop-img .note_title").html("Kéo thả vào đây<br/>hoặc<br/>nhấn vào đây để chọn file");
        });

        // Drag over
        $('.wrap-exel-upload .wrap-drop-img,.wrap-exel-upload .wrap-drop-img .upload-area').on('dragover', function (e) { //vào vùng chọn
            preventDefaults(e)
            $(".wrap-exel-upload .wrap-drop-img .note_title").text("Thả vào đây...");
        });

        // Drop
        $('.wrap-exel-upload .wrap-drop-img .upload-area').on('drop', function (e) {
            preventDefaults(e)
            $scope.uploadfiles = e.originalEvent.dataTransfer.files;
            uploadExel(e.originalEvent.dataTransfer.files);
        });

        // file selected
        $("#file-exel").change(function () {
            // $scope.uploadfiles = document.getElementById('file-exel').files;
            uploadExel(document.getElementById('file-exel').files);
            // uploadExel();
        });
    });


    $scope.dataSourceCare = () => {
        $http.get(base_url + 'sale_care/ajax_get_data_source_care').then(r => {
            if (r && r.data.status == 1) {
                $scope.sourceCare = r.data.data;


            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    $scope.getSourceExcel = () => {
        $('.tab-content').addClass('loading');
        var data = angular.merge($scope.filter, $scope.recive);
        $http.get(base_url + 'sale_care/ajax_get_source_excel?filter=' + JSON.stringify(data)).then(r => {
            $('.tab-content').removeClass('loading');

            if (r && r.data.status == 1) {
                $scope.source_excel = r.data.data;

                $scope.pagingInfo.total = r.data.count;
                $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    $scope.checkExcel = () => {
        var fd = new FormData();

        angular.forEach($scope.uploadfiles, function (file) {
            fd.append('file', file);
        });
        var data = JSON.stringify($scope.excel);
        fd.append('data', data);

        $http({
            method: 'post',
            url: 'sale_care/ajax_import_excel',
            data: fd,
            headers: {
                'Content-Type': undefined
            },
        }).then(function successCallback(r) {
            $('.wrap-exel-upload .wrap-drop-img .upload-area .note_title').html('Kéo thả vào đây<br/>hoặc<br/>nhấn vào đây để chọn file');

            if (r && r.data.status == 1) {
                $scope.errorExcelPhones = r.data.errors;
                $scope.detailExcelPhones = r.data.data;
                $scope.file_error = r.data.file;
                $scope.passDataExcel = r.data.pass;
            } else if (r && r.data.status == 0) {
                toastr["error"](r.data.message);


            } else toastr["error"]("Đã có lỗi xẩy ra!");

        });
    }

    $scope.importExcel = (event) => {
        if (!$scope.excel.source_id) {
            toastr["error"]("Chọn nguồn!");
            return false;
        }
        $(event.target).css('pointer-events', 'none');

        var data = $scope.passDataExcel.map(v => Object.assign(v, {
            source_id: $scope.excel.source_id
        }))

        $http.post(base_url + 'sale_care/ajax_save_data_excel', JSON.stringify(data)).then(r => {
            console.log(r);

            if (r && r.data.status == 1) {
                toastr["success"]("Thành công!");
                $scope.getSourceExcel();
                $scope.exFresh();
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });

    }
    $scope.exFresh = () => {
        $scope.errorExcelPhones = undefined;
        $scope.detailExcelPhones = undefined;
        $scope.file_error = undefined;
        $scope.passDataExcel = undefined;
    }


    $scope.go2Page = function (page) {
        if (page < 0) return;
        var pi = $scope.pagingInfo;
        pi.currentPage = page;
        pi.from = pi.offset = (pi.currentPage - 1) * pi.itemsPerPage;
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = ($scope.pagingInfo.currentPage - 1) * $scope.pagingInfo.itemsPerPage;
        $scope.getSourceExcel();
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