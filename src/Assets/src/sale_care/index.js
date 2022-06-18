app.directive('ngFile', ['$parse', function($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {

            element.bind('change', function() {

                $parse(attrs.ngFile).assign(scope, element[0].files)

                scope.$apply();

            });
        }
    };
}]);

app.directive('copyToClipboard', function() {
    return {
        restrict: 'A',
        link: function(scope, elem, attrs) {
            elem.click(function() {
                if (attrs.copyToClipboard) {
                    var $temp_input = $("<input>");
                    $("body").append($temp_input);
                    $temp_input.val(attrs.copyToClipboard).select();
                    document.execCommand("copy");
                    toastr["success"]("Copy: " + attrs.copyToClipboard);
                    $temp_input.remove();
                }
            });
        }
    };
});


app.controller('date_off', function($scope, $http, $compile, $window, $timeout) {


    var pi = $scope.pagingInfo = {
        itemsPerPage: 1,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };
    $scope.options = [{
            'name': 'Chỉ hiển thị SĐT tạo',
            'id': 0
        },
        {
            'name': 'Chỉ hiển thị DATA mới',
            'id': 1
        },
        {
            'name': 'Chỉ hiển thị DATA đảo',
            'id': 2
        },
        {
            'name': 'Chỉ hiển thị DATA hủy hẹn',
            'id': 3
        }
    ]




    $scope.init = () => {
        $('.opacity').css('opacity', '1');

        $scope.open = true;
        $scope.pass = true;
        $scope.dTable;
        $scope.passSource = passSource;


        $scope.triggerFunctionTagCare = {};
        $scope.triggerFunction2 = {};
        $scope.triggerSeachSource = {};
        $scope.triggerFunction3 = {};
        $scope.triggerSourceDetail = {};
        $scope.triggerSourceExcel = {};
        $scope.triggerStore = {};
        $scope.triggerStoreUpdate = {};



        $scope.p = {};
        $scope.p = angular.copy(pi);
        $scope.p.itemsPerPage = 20;
        $scope.p.id = 0;

        $scope.excel = {};
        $scope.excel.nation = '1';
        $scope.excel_step = 0;

        $scope.filter = {};
        $scope.filter.is_registed = 0;
        $scope.filter.limit = $scope.p.itemsPerPage;
        $scope.filter.offset = $scope.p.offset;
        $scope.filter.date = moment().format("DD/MM/YYYY") + ' - ' + moment().format("DD/MM/YYYY");
        $scope.filter.option = '1';
        $scope.filter.sort = '1';
        $scope.filter.sort_date = '1';
        $scope.filter.sortTime = false;
        $scope.filter.isHide = 1;
        if (cr_user_p != 0) {
            $scope.filter.import_id = cr_user_p;
        }
        $scope.cr_type_extract = 0;
        $scope.cr_user_id = id_current_user;

        $scope.care = [];
        $scope.arraySentOther = [];

        resetMainObject();

        $scope.dateInputInit();
        $scope.genHtml('ajax_data', 'p', '#p');

        // $scope.cr_past_store = 0;
        //  $scope.cr_past_source = "2";

        $scope.temp = {
            name: '',
            phone: '',
            note: '',
            import_id: id_current_user,
            source_id: "0",
            store_id: "0",
            error: ""
        };
        $scope.getDataPhones($scope.filter.is_registed);


        setTimeout(() => {
            $scope.changeCare();
            $scope.dataSourceCare();
            $scope.getStore();
            $scope.getEmployy();
            $scope.getService();
            $scope.getCamp();
            $scope.get_campaign_mkt();
            $scope.datepicker_cus();
        }, 10);
    }

    function resetMainObject() {
        $scope.phoneData = {};
        $scope.phoneData.source_id = '0';
        $scope.phoneData.store_id = '0';
        $scope.phoneData.page_id = '0';

        $scope.phoneData.created = moment().format('DD/MM/YYYY');
    }

    $scope.findGetParameter = (parameterName) => {
        var result = 'TVV',
            tmp = [];
        location.search
            .substr(1)
            .split("&")
            .forEach(function(item) {
                tmp = item.split("=");
                if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
            });
        return result;
    }

    $scope.hidePhone = (e) => {
        $scope.filter.isHide = e;
        $scope.getDataPhones($scope.filter.is_registed);
    }




    $scope.selectPhone = (value) => {
        $scope.phoneData.name = value.name;
        $scope.phoneData.phone = value.phone;
        $scope.phoneData.store_id = value.id;
        $scope.customers = [];
        setTimeout(() => {
            $scope.select2();
        }, 10);
    }


    $scope.getCamp = () => {
        $http.get(base_url + 'sale_care/ajax_get_main_campaign').then(r => {
            if (r && r.data.status == 1) {
                $scope.camps = r.data.data;
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    $scope.get_campaign_mkt = () => {
        $http.get(base_url + 'sale_care/ajax_get_main_campaign_mkt').then(r => {
            if (r && r.data.status == 1) {
                $scope.campaign_mkt = r.data.data;
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    $scope.check_store = () => {
        $('#pasteExcel .modal-content').addClass('loading');
        $http.get(base_url + 'sale_care/ajax_get_gg_store').then(r => {
            $('#pasteExcel .modal-content').removeClass('loading');
            if (r && r.data.status == 1) {
                $scope.gg_stores = r.data.data;
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    $scope.changeSorcePaste = () => {
        $scope.temp.camp_id = $scope.cr_past_camp;
        $scope.temp.services = $scope.cr_past_service;
        if ($scope.pasteObs || $scope.pasteObs.length > 0) {
            $scope.pasteObs.map(x => {
                x.camp_id = $scope.cr_past_camp;
                x.services = $scope.cr_past_service;
            })
        }
    }

    $scope.searchPhone = () => {
        if (!$scope.phoneData.phone || $scope.phoneData.phone == "undefined" || $scope.phoneData.phone.length <= 3) {
            $scope.customers = [];
            return false;
        }
        var data = {
            phone: $scope.phoneData.phone
        }
        $('.loadPhone').css('opacity', 1);
        $http.get(base_url + 'sale_care/ajax_get_cus?filter=' + JSON.stringify(data)).then(r => {
            $('.loadPhone').css('opacity', 0);
            $(".table-search").removeClass('hide');

            if (r && r.data.status == 1) {
                $scope.customers = r.data.data;
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }


    $scope.renderService = (ids) => {

        var string = "";
        var dem = 0;
        if (ids && ids.length > 0) {

            if ($scope.services)
                $scope.services.forEach(element => {
                    if (ids.indexOf(element.id) >= 0) {
                        dem++;
                        string = string + element.name + (dem != ids.length ? "," : "");
                    }
                });
        }

        return string;
    }

    $scope.renderStore = (id) => {
        var string = "";
        if ($scope.stores)
            $scope.stores.forEach(element => {
                if (id == element.id) {
                    string = element.description;
                }
            });
        return string;
    }


    $scope.getStore = () => {
        $http.get(base_url + 'sale_care/ajax_get_stores').then(r => {
            if (r && r.data.status == 1) {
                $scope.stores = r.data.data;
                $scope.stores_ = angular.copy(r.data.data);
                $scope.stores.push({
                    id: -1,
                    name: 'Hồ Chí Minh',
                    description: 'Hồ Chí Minh'
                }, {
                    id: 0,
                    name: 'Chưa xác định',
                    description: 'Chưa xác định'
                });
                setTimeout(() => {
                    $('.select2').select2();
                }, 10);
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    $scope.getService = () => {
        $http.get(base_url + 'sale_care/ajax_get_service').then(r => {
            if (r && r.data.status == 1) {
                $scope.services = r.data.data;
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    $scope.openModalpaste = () => {
        $('#pasteExcel').modal('show');
        $scope.check_store();
        setTimeout(() => {
            $('.text-paste').focus();
        }, 150);
    }
    $("#pasteExcel").on("hidden.bs.modal", function() {

        setTimeout(() => {
            $scope.pasteObs = [];
            $scope.cr_past_camp = undefined;
            $scope.cr_past_service = undefined;
            $scope.$apply();
            $('.select2').select2();

        }, 0);
    });
    $scope.addOneRow = () => {
        if (!$scope.pasteObs) {
            $scope.pasteObs = [];
        }
        var data = angular.copy($scope.temp);

        $scope.pasteObs.push(data);
        $scope.checkNumber();

        $scope.select2();

    }

    $scope.addZero = () => {
        $scope.pasteObs.forEach(element => {
            element.phone = "0" + element.phone;
        });
        $scope.checkNumber();

    }
    $scope.spliceAllE = () => {
        for (var i = $scope.pasteObs.length - 1; i >= 0; i--) {
            if ($scope.pasteObs[i].error != "") {
                $scope.pasteObs.splice(i, 1);
            }
        }

        $scope.checkNumber();
    }

    $scope.splice_ = (value) => {

        for (var i = $scope.pasteObs.length - 1; i >= 0; i--) {
            if ($scope.pasteObs[i].phone == value) {
                $scope.pasteObs.splice(i, 1);
            }
        }

        $scope.checkNumber();

    }



    $scope.saveBatch = () => {
        $('.btn-batch').css('pointer-events', 'none');

        $http.post(base_url + 'sale_care/ajax_save_batch_phone', JSON.stringify($scope.pasteObs)).then(r => {
            $('.btn-batch').css('pointer-events', 'initial');
            if (r && r.data.status == 1) {
                toastr["success"]("Thành công!");
                $('#pasteExcel').modal('hide');
                $scope.getDataPhones($scope.filter.is_registed);

            } else if (r && r.data.status == 0) {
                toastr["error"](r.data.message);

                $scope.checkNumber(r.data.data);

            } else toastr["error"]("Đã có lỗi xẩy ra!");

        });
    }

    $scope.checkNumber = (phoneIsset = undefined) => {
        $scope.openPaste = true;
        var temp = [];
        if ($scope.pasteObs.length > 0)
            for (var i = $scope.pasteObs.length - 1; i >= 0; i--) {
                var dem = 0;
                $scope.pasteObs.forEach(value => {
                    if ($scope.pasteObs[i].phone == value.phone) {
                        dem++;
                        if (dem > 1) {
                            $scope.pasteObs.splice(i, 1);
                        }
                    }
                });

            }
        $scope.pasteObs.forEach(value => {
            value.error = "";
            var check = false;
            if (value.camp_id && value.camp_id.length > 0)
                $scope.camps.forEach(element => {
                    if (value.camp_id.indexOf(element.id) >= 0) {
                        check = true;
                    }
                });
            if (!check) {
                value.camp_id = [];
                // value.error = "Chương trình không hợp lệ!";
                // $scope.openPaste = false;
            }


            var check = false;
            if (value.services && value.services.length > 0)
                $scope.services.forEach(element => {
                    if (value.services.indexOf(element.id) >= 0) {
                        check = true;
                    }
                });
            if (!check) {
                value.services = [];
                // value.error = "Dịch vụ không hợp lệ!";
                // $scope.openPaste = false;
            }



            var check = false;
            if (value.source_id)
                $scope.sourceCare.forEach(element => {
                    if (element.id == value.source_id) {
                        check = true;
                    }
                });
            if (!check) {
                delete value.source_id
                value.error = "Nguồn không hợp lệ!";
                $scope.openPaste = false;
            }



            var check = false;
            if (value.store_id)
                $scope.stores.forEach(element => {
                    if (element.id == value.store_id) {
                        check = true;
                    }
                });
            if (!check) {
                delete value.store_id;
                value.error = "Chi nhánh không hợp lệ!";
                $scope.openPaste = false;
            }


            if (!value.name || value.name == "") {
                value.error = "Tên không được để trống!";
                $scope.openPaste = false;

            }
            if (!value.phone || value.phone.length == "") {
                value.error = "Số điện thoại không được để trống!";
                $scope.openPaste = false;

            }
            value.phone = value.phone.replace(/\s/g, '');
            var first_ = value.phone.substring(1, 0);

            if (value.phone && (value.phone.length != 10 || value.phone.indexOf('.') != -1 || value.phone.indexOf(',') != -1)) {
                value.error = "Số điện thoại không đúng định dạng!";
                $scope.openPaste = false;

            }
            if (first_ != 0) {
                value.error = "Số điện thoại bắt đầu bằng số 0!";
                $scope.openPaste = false;

            }

            if (isNaN(value.phone)) {
                value.error = "Số điện thoại chỉ bao gồm số!";
                $scope.openPaste = false;
            }

            if (phoneIsset) {
                phoneIsset.forEach(element => {
                    if (value.phone == element.phone) {
                        value.error = element.user + " đã nhập số này!";
                        $scope.openPaste = false;

                    }
                });
            }



        });

        //$scope.pasteObs = temp;

        return false;


    }


    // $scope.$watch('pasteObs', function(newValues, oldValues) {
    //    // console.log($scope.pasteObs);
    //     if (oldValues == newValues)
    //         return false;

    //     $scope.pasteObs.forEach(element => {
    //         $scope.checkNumber(element);
    //     });
    // });

    $scope.pasteExcel = (e) => {
        e.preventDefault();
        $('#pasteExcel').modal('show');
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

        if (clipRows.length >= 100) {
            toastr["error"]("Copy ít hơn 100 dòng!");
            return false;
        }

        for (i = 0; i < clipRows.length; i++) {
            clipRows[i] = clipRows[i].split('\t');

        }

        var jsonObj = [];
        $scope.pasteObs = [];


        var camp = [];
        var service = [];

        for (i = 0; i < clipRows.length; i++) {

            var item = {};
            var temp = angular.copy($scope.temp);

            //  var check = true;

            for (j = 0; j < clipRows[i].length; j++) {
                if (clipRows[i][j] != '\r') {


                    if (j == 0) {
                        temp.name = clipRows[i][j];
                    }

                    clipRows[i][j] = clipRows[i][j].replace(/[\s]/g, "");
                    if (j == 1) {
                        temp.phone = clipRows[i][j];
                    }
                    if (j == 3) {
                        temp.source_id = clipRows[i][j];
                        if (temp.source_id == "") {
                            temp.source_id = "0";
                        }
                    }
                    if (j == 4) {
                        var is_gg = clipRows[i][j];
                        $scope.gg_stores.forEach(element => {
                            if (element.gg_id == clipRows[i][j]) {
                                is_gg = element.store_id;
                            }
                        });
                        temp.store_id = is_gg;

                        if (temp.store_id == "") {
                            temp.store_id = "0";
                        }
                    }
                    if (j == 5) {
                        // if (service > 0) {
                        //     if (service != clipRows[i][j]) {
                        //         $scope.pasteObs = [];
                        //         toastr["error"]("Không cùng dịch vụ!");
                        //         return false;
                        //     }
                        // }
                        temp.services = JSON.parse('["' + clipRows[i][j] + '"]');
                        if (temp.services == "") {
                            temp.services = [];
                        }
                        // service = temp.services;
                    }
                    if (j == 6) {
                        // if (camp > 0) {
                        //     if (camp != clipRows[i][j]) {
                        //         $scope.pasteObs = [];
                        //         toastr["error"]("Không cùng chương trình!");
                        //         return false;
                        //     }
                        // }
                        temp.camp_id = JSON.parse('["' + clipRows[i][j] + '"]');
                        if (temp.camp_id == "") {
                            temp.camp_id = [];
                        }
                        // camp = temp.camp_id;
                    }
                    if (j == clipRows[i].length - 1 && clipRows[i].length > 7) {
                        temp.note = clipRows[i][j];
                    }
                }
            }

            // if (!temp.services) {
            //     temp.services = service;
            // }
            // if (!temp.camp_id) {
            //     temp.camp_id = camp;
            // }


            $scope.pasteObs.push(temp);

            jsonObj.push(item);
        }
        $scope.checkNumber();


        // $scope.cr_past_store = store;
        $scope.cr_past_camp = camp;
        $scope.cr_past_service = service;

        $scope.select2();

        // $scope.pasteObs.forEach(element => {

        // });
        //// console.log(jsonObj);

    }



    $scope.getAppHistory = (phone) => {
        var data = {
            phone: phone
        }
        $http.get(base_url + 'sale_care/ajax_get_app_history?filter=' + JSON.stringify(data)).then(r => {
            if (r && r.data.status == 1) {
                $scope.appHistorys = r.data.data;
                $('#appHistory').modal('show');
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    $scope.setToOther = () => {
        $('#sentModal').modal('show');
    }

    $scope.addToOther = (id) => {

        if ($scope.arraySentOther.length == 0) {
            $scope.arraySentOther.push(id);
        } else {
            var index = -1;
            $scope.arraySentOther.forEach((element, ind) => {
                if (element == id) {
                    index = ind;
                }
            });
            if (index > -1) {
                $scope.arraySentOther.splice(index, 1);
            } else {
                $scope.arraySentOther.push(id);
            }
        }
    }

    $scope.sentToOther = () => {
        var data = {
            phones: $scope.arraySentOther,
            user_id: $scope.reciveNumber
        }
        $http.post(base_url + 'sale_care/ajax_sent_other', JSON.stringify(data)).then(r => {
            if (r && r.data.status == 1) {
                toastr["success"]("Thành công!");
                $scope.getDataPhones($scope.filter.is_registed);
                $scope.arraySentOther = [];
                $('#sentModal').modal('hide');
            } else if (r && r.data.status == 0) {
                toastr["error"](r.data.message);
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }



    $scope.totalExcute = (items, care) => {
        if (items) {
            var total = 0;
            items.forEach(element => {
                if (!element.number || element.number < 0) {
                    element.number = 0;
                }
                total += element.number;
            });
            $scope.excuteTotal = total + care.length;
            return total + ' Số + ' + care.length + ' Số trùng = ' + (total + care.length);
        }


    }


    $scope.openAppDetail = (values) => {
        if (values.type == 2 || !values.appointment_id || values.appointment_id && values.appointment_id == 0) {
            return false;
        }
        var data = {
            appointment_id: values.appointment_id
        }
        $('.histo').css('pointer-events', 'none');
        $('body').css('cursor', 'wait');

        $http.get(base_url + 'sale_care/ajax_get_detail_app?filter=' + JSON.stringify(data)).then(r => {
            $('.histo').css('pointer-events', 'initial');
            $('body').css('cursor', 'initial');
            if (r && r.data.status == 1) {
                var data_ = angular.copy(r.data.data);
                data_.sale_care_id = values.id;
                data_.app_type = 'edit';
                if (data_.note) {
                    $('#appointment_app .lt_note').html('<b>Lễ tân :</b>' + data_.note);
                } else {
                    $('#appointment_app .lt_note').html('');
                }
                if (data_.cs_note) {
                    $('#appointment_app .cs_note').html('<b>CSKH :</b>' + data_.cs_note);
                } else {
                    $('#appointment_app .cs_note').html('');
                }
                if (data_.adv_note) {
                    $('#appointment_app .adv_note').html('<b>TVV :</b>' + data_.adv_note);
                } else {
                    $('#appointment_app .adv_note').html('');
                }
                $('#appointment_app .created_user_').html('<span class="text-success">*Người tạo: ' + data_.import_name + '</span>');

                angular.element(document.getElementById('btn-moreAttr')).scope().addMoreobject(data_);


                $('#appoint').modal('show');

            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    $scope.extractExcel = (step) => {
        if (!$scope.numberRecord || ($scope.numberRecord && $scope.numberRecord == 0)) {
            toastr["error"]("Nhâp tổng số cần trích!");
            return false;
        }

        if ($scope.numberRecord > $scope.totalNumberRecord.total) {
            toastr["error"]("Không thể trích quá tổng số khả dụng!");
            return false;
        }

        if ($scope.unExtract && $scope.unExtract.length == $scope.employys.length) {
            toastr["error"]("Không có nhân viên!");
            return false;
        }
        if (step > 1 && $scope.excuteTotal > $scope.numberRecord) {
            toastr["error"]("Số thực thi không thể quá tổng!");
            return false;
        }

        var temp = angular.copy($scope.employys);
        if ($scope.unExtract && $scope.unExtract.length > 0) {
            for (var i = temp.length - 1; i >= 0; i--) {
                if ($scope.unExtract.indexOf(temp[i].id) >= 0) {
                    temp.splice(i, 1);
                }
            }
        }

        var data = {
            limit: $scope.numberRecord,
            users: temp,
            step: step,
            data_insert: $scope.detailExtract ? $scope.detailExtract : [],
            phones: $scope.phones ? $scope.phones : [],
            cares: $scope.cares ? $scope.cares : []
        }



        $http.post(base_url + 'sale_care/ajax_extract_excel', JSON.stringify(data)).then(r => {
            if (r && r.data.status == 1) {
                if (step == 1) {
                    $scope.detailExtract = r.data.show;
                    $scope.detailExtract.forEach(element => {
                        element.number = parseInt(element.number);
                    });
                    $scope.cr_type_extract = step;
                    $scope.phones = r.data.data;
                    $scope.cares = r.data.care;


                    angular.element(document).ready(function() {
                        setTimeout(() => {
                            $scope.dTable = $('#user_table');
                            $scope.dTable.DataTable({
                                "retrieve": true
                            });
                            $scope.$apply();
                        }, 0);
                    });
                } else {
                    toastr["success"]("Thành công!");
                    $('#setExcel').modal('hide');
                    $scope.cr_type_extract = 0;

                }

            } else if (r && r.data.status == 0) {
                toastr["error"](r.data.message);
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    $("#setExcel").on("hidden.bs.modal", function() {
        $scope.cr_type_extract = 0;
        $scope.numberRecord = undefined;
        $('#user_table').DataTable().destroy();
        setTimeout(() => {
            $('#unExtract').select2('val', '');
            $scope.$apply();
        }, 0);
    });
    $("#openExcel").on("hidden.bs.modal", function() {
        setTimeout(() => {
            $scope.excel_step = 0;
            $('#file').val('').trigger('input');
            $scope.uploadfiles = undefined;
            $scope.$apply();
        }, 0);
    });

    $("#openTags").on("hidden.bs.modal", function() {
        setTimeout(() => {
            $('dta_table').DataTable().destroy();
        }, 0);
    });


    $scope.getEmployy = () => {

        $http.get(base_url + 'sale_care/ajax_get_sale').then(r => {
            if (r && r.data.status == 1) {
                $scope.employys = r.data.data;
                $scope.employys.unshift({
                    name: 'Tất cả TVV',
                    id: -1
                });
                if ([297, 274].indexOf(id_current_user) >= 0) {
                    $scope.employys.push({
                        name: 'HUỲNH THỊ LỆ QUYÊN - OFFLINE',
                        id: 2194
                    }, {
                        name: 'TĂNG THỊ THU HOA - OFFLINE',
                        id: 2049
                    }, {
                        name: 'VÕ TÙNG YÊN THẾ - OFFLINE',
                        id: 2157
                    }, {
                        name: 'PHẠM MINH TRUNG - OFFLINE',
                        id: 1860
                    }, {
                        name: 'NGÔ QUỐC ANH - OFFLINE',
                        id: 2117
                    }, {
                        name: 'LÊ TRẦN NHƯ - OFFLINE',
                        id: 1896
                    });
                };

                $scope.employys.push({
                    name: 'Bạn',
                    id: id_current_user
                });


                $scope.cancel_emps = angular.copy($scope.employys);
                $scope.cancel_emps.push({
                    name: 'Appmobile',
                    id: 1414
                }, {
                    name: 'Booking Website',
                    id: 204
                });


            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }
    $scope.openApp = () => {
        var data = {
            name: $scope.phoneData.name,
            phone: $scope.phoneData.phone,
            store_id: $scope.phoneData.store_id
        };

        if (!$scope.checkData()) {
            return false;
        }
        $scope.setDataModal(data);

        var changeObs = {
            source_id: $scope.phoneData.source_id,
            services: $scope.phoneData.services,
            camp_id: $scope.phoneData.camp_id,
            app_type : 'add'
        }

        angular.element(document.getElementById('btn-moreAttr')).scope().addMoreobject(changeObs);
    }


    $scope.saveNoteCan = (openApp = null) => {

        var data = {
            appointment_id: $scope.cr_value.appointment_id,
            note: $scope.cancel.note
        }

        $http.post(base_url + 'sale_care/ajax_save_cancel', JSON.stringify(data)).then(r => {
            if (r && r.data.status == 1) {
                if (openApp) {
                    $scope.setDataModal($scope.cr_value, 1);
                }
                $scope.go2Page(1, $scope.p);
                $scope.cancel = {};
                $('#cancel_note').modal('hide');
            }
        });
    }

    $scope.openCancelNote = (value) => {
        $scope.cr_value = value;
        if (value.appointment_id > 0) {
            $('#cancel_note').modal('show');
            return;
        }
    }


    $scope.setDataModal = (value, pass = null) => {
        $scope.cr_value = value;

        setTimeout(() => {
            var myInput = $("#nameForm");
            myInput.val(value.name);
            myInput.trigger('input');

            var myInput = $("#phoneForm");
            myInput.val(value.phone);
            myInput.trigger('input');

            var myInput = $("#customerIdForm");
            myInput.val(value.customer_id);
            myInput.trigger('input');

            var myInput = $("#is_offline");
            myInput.val($scope.filter.position);
            myInput.trigger('input');

            if ($('#invoiceIdForm').val() == '') {
                var myCheckbox = $("input[name=send_sms]");
                myCheckbox.trigger('click');
            }

            if (value.store_id > 0) {
                $('.storeForm .select2').select2('val', value.store_id);
            }

            if (value.appointment_id) {
                var myInput = $("#appointmentIdForm");
                myInput.val(value.appointment_id);
                myInput.trigger('input');
            }


            if (value.id) {
                $('#carePhoneIdForm').val(value.id).trigger('input');
            }

            if (value.note) {
                $('#appointment_app .lt_note').html('<b>Lễ tân :</b>' + value.note);
            } else {
                $('#appointment_app .lt_note').html('');
            }
            if (value.cs_note) {
                $('#appointment_app .cs_note').html('<b>CSKH :</b>' + value.cs_note);
            } else {
                $('#appointment_app .cs_note').html('');
            }
            if (value.adv_note) {
                $('#appointment_app .adv_note').html('<b>TVV :</b>' + value.adv_note);
            } else {
                $('#appointment_app .adv_note').html('');
            }
            $('#appointment_app .created_user_').html('');
            $scope.$apply();

            $('#cl_').trigger('click');
        }, 0);

        if (!value.id) {
            var changeObs = {
                source_id: 12
            }

            angular.element(document.getElementById('btn-moreAttr')).scope().addMoreobject(changeObs);
        }

        $('#appoint').modal('show');
    }

    $scope.getDataExcelCare = () => {




        var data = {
            user_id: id_current_user,
        }

        $http.post(base_url + 'sale_care/ajax_auto_get_excel', JSON.stringify(data)).then(r => {
            if (r && r.data.status == 1) {
                sessionStorage.setItem("date", moment().format('DD-MM-YYYY'));
                $scope.getDataPhones($scope.filter.is_registed);
            }
        });

    }



    $scope.importExcel = (e, event = null) => {


        $scope.openDetailError = false;
        var fd = new FormData();





        if (e == 1) {
            $scope.excel.step = 1;
            if (!$scope.excel.source_id) {
                toastr["error"]("Chọn nguồn!");

                return false;
            }
            if (!$scope.uploadfiles) {

                toastr["error"]("Chọn file!");

                return false;
            }
            if (event)
                $(event.target).css('pointer-events', 'none');

            angular.forEach($scope.uploadfiles, function(file) {
                fd.append('file', file);
            });

            var data = JSON.stringify($scope.excel);
        } else if (e == 2) {
            var data = JSON.stringify($scope.allExcelPhones);
        } else {
            var data = JSON.stringify($scope.passExcelPhones);
        }
        $('.content_excel').addClass('loading');

        fd.append('data', data);


        $http({
            method: 'post',
            url: 'sale_care/ajax_import_excel',
            data: fd,
            headers: {
                'Content-Type': undefined
            },
        }).then(function successCallback(r) {
            // Store response data
            if (event)
                $(event.target).css('pointer-events', 'initial');
            $('.content_excel').removeClass('loading');
            if (r && r.data.status == 1) {
                if (e == 1) {
                    $('input[name=file]').val('').trigger('input');
                    $scope.uploadfiles = undefined;
                    $scope.dataRaw = r.data.data;
                    $scope.file_error = r.data.file;

                    $scope.allExcelPhones = r.data.all;
                    $scope.passExcelPhones = r.data.pass;
                    $scope.excel_step = e;
                } else {
                    toastr["success"]('Thành công');
                    $scope.passExcelPhones = [];
                    $scope.allExcelPhones = [];
                    $('#openExcel').modal('hide');
                }
            } else if (r && r.data.status == 0) {
                toastr["error"](r.data.message);
            } else toastr["error"]("Đã có lỗi xẩy ra!");

        });
    }


    $scope.dataSourceCare = () => {
        $http.get(base_url + 'sale_care/ajax_get_data_source_care').then(r => {
            if (r && r.data.status == 1) {
                $scope.sourceCare = r.data.data;
                $scope.dataPages = r.data.data_page;
                $scope.sourceCare.unshift({
                    id: 0,
                    name: 'Chưa xác định',
                    description: 'Chưa xác định'
                })
                $scope.dataPages.unshift({
                    id: 0,
                    name: 'Chưa xác định',
                    description: 'Chưa xác định'
                })
                $scope.select2();
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    // $scope.openAddTag = () => {
    //     $scope.open = !$scope.open;
    //     $scope.care.id_care = undefined;
    //     $scope.care.note = undefined;
    //     setTimeout(() => {
    //         $('#modal_tag').select2('val', null);
    //        // console.log($('#modal_tag').select2('val', null));
    //     }, 10);
    // }


    $scope.clickActive = (value, event = null) => {

        if (!event) {
            $('table').find('tbody').removeClass('active_');
            return;
        }


        if ($(event.target).parents('tbody').hasClass('active_')) {
            $(event.target).parents('tbody').removeClass('active_');
        } else {
            $('table').find('tbody').removeClass('active_');
            $(event.target).parents('tbody').addClass('active_');
            $scope.getCallHistory_(value.phone)
        }
    }


    $scope.getCallHistory_ = (phone) => {
        $http.get(base_url + 'sale_care/ajax_get_care_result_by_phone/' + phone).then(r => {
            $scope.total_duration_time = r.data.total_duration_time;
            $scope.total_call_time = r.data.total_call_time;
            if (r && r.data.status == 1) {
                $('body').css('cursor', 'auto');
                $scope.call_result_details = r.data.data;
            }
        })
    }


    $scope.allPhone = (id) => {
        $scope.pass = false;
        $scope.filter.is_registed = id;
        $('.uncare').removeClass('cant_tounch');
        if ($scope.filter.cancel == 1) {
            $scope.go2Page(1, $scope.p);

            return;
        }
        if (id == -3) {
            $scope.filter.date = moment().subtract(1, 'days').format("DD/MM/YYYY") + ' - ' + moment().subtract(1, 'days').format("DD/MM/YYYY");
            $scope.go2Page(1, $scope.p);

            return;
        }
        if (id == 0) {
            $scope.filter.is_registed = 0;
            $scope.filter.sort_date = '1';
            $scope.filter.date = moment().format("DD/MM/YYYY") + ' - ' + moment().format("DD/MM/YYYY");

            $timeout(function() {
                $scope.triggerFunctionTagCare.trigger(-2);
                $scope.$apply()
                $scope.go2Page(1, $scope.p);
            });

        } else {
            if (id < 0) {
                $('.uncare').addClass('cant_tounch');
            }

            $scope.filter.date = '';
            $scope.go2Page(1, $scope.p);
        }
    }

    $scope.changeStatusApp = (item, status) => {
        var data = {
            id: item.id,
            arrival_status: status
        }
        $http.post(base_url + 'sale_care/ajax_change_status_app', JSON.stringify(data)).then(r => {
            if (r && r.data.status == 1) {
                toastr["success"]("Thành công!");
                $scope.getApp($scope.current_student.id);
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    $scope.setUnDate = (item) => {
        if (item == 1) {
            $scope.filter.date = undefined;
        } else if (item == 2) {
            $scope.filter.is_care = undefined;
        } else if (item == 3) {
            $scope.filter.status_care = undefined;
            setTimeout(() => {
                $('#modal_search').select2('val', null);
            }, 10);
        }
    }

    $scope.openInforModal = (item) => {

        $scope.current_student = angular.copy(item);

        $scope.current_student.is_registed = parseInt($scope.current_student.is_registed);
        $scope.current_student.note = $scope.current_student.note_scp;
        $scope.triggerStoreUpdate.trigger(item.store_id);

        $scope.select2();

        $('#infor').modal({
            show: true
        });
    }

    $scope.clickOutSide = () => {


        $scope.list_key = [];
    }

    $scope.deleteCare = (item, items) => {

        if (!confirm("Bạn muốn xóa chăm sóc!")) {
            return false;
        }
        var data = angular.copy(item);
        data.phone_id = items.id;
        data.import_id = items.import_id;
        data.created = moment(item.date, 'DD-MM-YYYY HH:mm').format('YYYY-MM-DD');

        $http.post(base_url + 'sale_care/ajax_delete_student_care', JSON.stringify(data)).then(
            r => {
                if (r && r.data.status == 1) {
                    toastr["success"]("Xóa thành công!");
                    $scope.getDataPhones($scope.filter.is_registed);
                } else if (r && r.data.status == 0) {
                    toastr["error"](r.data.message);
                } else toastr["error"]("Đã có lỗi xẩy ra!");
            });
    }

    $scope.changeCare = () => {
        $http.get(base_url + 'sale_care/ajax_get_care_tag').then(r => {
            if (r && r.data.status == 1) {
                $scope.list_key = r.data.data;
                $scope.tag_location = [];
                $scope.tag_options = [];
                $scope.list_key.forEach(element => {
                    element.location = parseInt(element.location);
                    element.exist_day = parseInt(element.exist_day);

                    if (element.location > 0) {
                        $scope.tag_location.push(element);
                    }
                    $scope.tag_options.push(element);
                });


                angular.element(document).ready(function() {
                    setTimeout(() => {
                        $scope.dTable = $('.dta_table');
                        $scope.dTable.DataTable({
                            "retrieve": true
                        });
                        $scope.$apply();
                    }, 0);
                });


            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    $scope.saveTagChange = () => {
        $http.post(base_url + 'sale_care/save_tag_change', JSON.stringify($scope.list_key)).then(r => {
            // console.log(r);

            if (r && r.data.status == 1) {
                $scope.changeCare();
                $('#openTags').modal('hide');
                toastr["success"]("Thành công!");
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }


    $scope.openModalSetExcel = () => {

        $http.get(base_url + 'sale_care/ajax_get_total_excel').then(
            r => {
                if (r && r.data.status == 1) {
                    $scope.unExtract = [];

                    $scope.totalNumberRecord = r.data.data;

                } else toastr["error"]("Đã có lỗi xẩy ra!");
            });
    }

    $scope.detail_care = (cr_index, cr_value) => {
        var data = {
            customer_id: cr_value.customer_id
        }

        $http.get(base_url + 'sale_care/ajax_get_data_source_care').then(r => {
            if (r && r.data.status == 1) {
                $scope.sourceCare = r.data.data;
                $scope.sourceCare.push({
                    id: 0,
                    name: 'Chưa xác định',
                    description: 'Chưa xác định'
                })
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    $scope.saveTagChange_ = (number) => {
        if (number == 2) {
            var data = {
                id_care: 7,
                phone_id: $scope.issetPhone.id,
                is_cancel: $scope.filter.cancel
            }
            $http.post(base_url + 'sale_care/ajax_save_phone_care', JSON.stringify(data)).then(
                r => {
                    if (r && r.data.status == 1) {
                        $scope.getDataPhones($scope.filter.is_registed);
                        $('.issetPhone').modal('hide');
                    } else toastr["error"]("Đã có lỗi xẩy ra!");
                });
        } else {
            $scope.phoneData.id = $scope.issetPhone.id;
            $scope.phoneData.source_id = $scope.issetPhone.source_id;

            $http.post(base_url + 'sale_care/ajax_save_sale_care_phones', JSON.stringify($scope.phoneData))
                .then(r => {
                    if (r && r.data.status == 1) {
                        $scope.getDataPhones($scope.filter.is_registed);
                    } else if (r && r.data.status == 0) {

                    } else {
                        toastr["error"]("Đã có lỗi xẩy ra!");
                        $scope.phoneData = {};
                        $scope.triggerFunction2.trigger(-2);
                    }

                });
        }

    }

    $scope.forceMaxLength = function(s, maxLength) {
        if (s.length > maxLength) {
            return Array.prototype.slice.apply(s, [0, maxLength - 3]).join('') + '...';
        } else {
            return s;
        }
    }

    $scope.getCancel = () => {
        if ($scope.filter.cancel) {
            delete $scope.filter.cancel
        } else {
            $scope.filter.cancel = 1;
        }
        $scope.go2Page(1, $scope.p);
    }

    $scope.savePhoneCare = (value, index) => {

        if (!$scope.care[index] || $scope.care[index] && !$scope.care[index].id_care) {
            toastr["error"]("Không để trống tên tag!");
            return false;
        }


        var data = angular.copy($scope.care[index]);
        data.phone_id = value.id;
        data.import_id = value.import_id;
        data.position = $scope.filter.position;
        data.name = value.name;
        data.phone = value.phone;
        data.store_id = value.store_id;
        data.appointment_id = value.appointment_id;
        data.is_cancel = $scope.filter.cancel;
        $('.btn-xn').css('pointer-events', 'none');


        $http.post(base_url + 'sale_care/ajax_save_phone_care', JSON.stringify(data)).then(
            r => {
                $('.btn-xn').css('pointer-events', 'initial');
                if (r && r.data.status == 1) {
                    toastr["success"]('Đã thêm chăm sóc');
                    $scope.care[index] = {};
                    // $scope.ajax_data.splice(index, 1);
                    // $scope.arraySentOther = [];
                    $scope.getDataPhones($scope.filter.is_registed);
                } else if (r && r.data.status == 0) {
                    toastr["error"](r.data.message);
                } else toastr["error"]("Đã có lỗi xẩy ra!");
            });
    }





    $scope.genHtml = (data_name, value_name, id) => {
        var $html = $(`<div class="dt-toolbar-footer">
                    <div class="col-sm-6 col-xs-12 hidden-xs">
                        <div ng-show="${data_name}.length > 0" class="dataTables_info" role="status" aria-live="polite">Hiển thị từ
                            {{${value_name}.offset
                        + 1}} đến {{ (${value_name}.offset + ${value_name}.itemsPerPage) > ${value_name}.total ? ${value_name}.total
                        : (${value_name}.offset
                        + ${value_name}.itemsPerPage)}} trong tổng {{${value_name}.total}}
                        </div>
                    </div>
                    <div class="col-xs-12 col-sm-6">
                        <div ng-show="${data_name}.length > 0" class="dataTables_paginate paging_simple_numbers">
                            <ul class="pagination">
                                <li ng-disable="${value_name}.currentPage==1"><span class="previous" ng-click="Previous(${value_name}.currentPage,${value_name})">Previous</span>
                                </li>
                                <li ng-if="${value_name}.currentPage > 4"><span href="#" ng-click="go2Page(1,${value_name})">1</span></li>
                                <li class="disabled" ng-if="${value_name}.currentPage > 4"><span href="#" onclick="event.preventDefault()">…</span>
                                </li>
                                <li ng-repeat="i in getRange(${value_name})" ng-class="{active: ${value_name}.currentPage == i}"><span href="#" class="pageIndex" ng-click="go2Page(i,${value_name})">{{i}}</span>
                                </li>
                                <li class="disabled" ng-if="(${value_name}.totalPage - currentPage) > 3"><span href="#" onclick="event.preventDefault()">…</span>
                                </li>
                                <li ng-if="(${value_name}.totalPage - ${value_name}.currentPage) > 3"><span ng-click="go2Page(${value_name}.totalPage,${value_name})" class="">{{${value_name}.totalPage}}</span></li>
                                <li><span class="next" ng-click="${value_name}.currentPage != ${value_name}.totalPage && go2Page(${value_name}.currentPage + 1,${value_name})">Next</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                `).appendTo(id);

        $compile($html)($scope);
    }

    $scope.getStudentCare = (id) => {
        $scope.filter1.id = id;
        $http.get(base_url + 'sale_care/ajax_get_student_care/1?filter=' + JSON.stringify($scope.filter1))
            .then(r => {
                if (r && r.data.status == 1) {

                    $scope.care_data = r.data.data;




                    $scope.p1.total = parseInt(r.data.count);
                    $scope.p1.totalPage = Math.ceil(r.data.count / $scope.p1.itemsPerPage);
                } else toastr["error"]("Đã có lỗi xẩy ra!");
            });
    }

    $scope.getApp = (id) => {
        $scope.filter2.id = id;
        $http.get(base_url + 'sale_care/ajax_get_student_care/2?filter=' + JSON.stringify($scope.filter1))
            .then(r => {

                if (r && r.data.status == 1) {
                    $scope.app_data = r.data.data;
                    $scope.p2.total = parseInt(r.data.count);
                    $scope.p2.totalPage = Math.ceil(r.data.count / $scope.p2.itemsPerPage);
                } else toastr["error"]("Đã có lỗi xẩy ra!");
            });
    }

    $scope.freshAdd = (event) => {
        setTimeout(() => {
            $scope.phoneData = {};
            $scope.select2();
            $scope.$apply();
        }, 0);
    }

    $("#infor").on("hidden.bs.modal", function() {
        $scope.freshAdd();
    });

    $("#issetPhone").on("hidden.bs.modal", function() {
        $scope.freshAdd();
    });

    $("#appoint").on("hidden.bs.modal", function() {
        $scope.freshAdd();
    });

    $scope.checkData = () => {
        if (!$scope.phoneData.name || $scope.phoneData.name == "") {
            toastr["error"]("Không để trống tên!");
            return false;
        }

        if (!$scope.phoneData.phone || $scope.phoneData.phone == "") {
            toastr["error"]("Không để trống số điện thoại!");
            return false;
        }

        if ($scope.phoneData.phone && $scope.phoneData.phone[0] != 0) {
            toastr["error"]("Số điện thoại bắt đầu bằng số 0");
            return false;
        }

        if ($scope.phoneData.phone.length < 9 || $scope.phoneData.phone.length > 11) {
            toastr["error"]("Sai số điện thoại!");
            return false;
        }

        if (!$scope.phoneData.source_id || $scope.phoneData.source_id == 0) {
            toastr["error"]("Chọn nguồn cho số điện thoại!");
            return false;
        }

        if (!$scope.phoneData.services || $scope.phoneData.services.length == 0) {
            toastr["error"]("Chọn dịch vụ cho số điện thoại!");
            return false;
        }

        if ($scope.phoneData.source_id == 5 && (!$scope.phoneData.page_id || $scope.phoneData.page_id == 0)) {
            toastr["error"]("Chọn page cho số điện thoại!");
            return false;
        }
        return true;
    }


    $scope.addPhoneData = (type = null) => {

        if (!$scope.checkData()) {
            return false;
        }

        $scope.phoneData.import_id = id_current_user;
        $('#add_btn').css('pointer-events', 'none');
        $('.btn-save').css('pointer-events', 'none');

        $http.post(base_url + 'sale_care/ajax_save_sale_care_phones', JSON.stringify($scope.phoneData))
            .then(r => {
                $('#add_btn').css('pointer-events', 'initial');
                $('.btn-save').css('pointer-events', 'initial');
                if (r && r.data.status == 1) {
                    $scope.getDataPhones($scope.filter.is_registed);
                    toastr["success"]("Tạo thành công!");
                    $('#infor').modal('hide');
                } else if (r && r.data.status == 0) {
                    toastr["error"](r.data.message);
                } else {
                    toastr["error"]("Đã có lỗi xẩy ra!");

                }
                clearDataPhone();
            });
    }

    function clearDataPhone() {
        resetMainObject();
        setTimeout(() => {
            $scope.select2();
        }, 50);
    }

    $scope.select2 = () => {
        setTimeout(() => {
            $('.select2').select2();
            $scope.$apply();
        }, 100);
    }

    $scope.save_phones = (type) => {
        $scope.phoneData = $scope.current_student;
        if ($scope.addPhoneData(type) == false) {
            $scope.phoneData = {};
        }
    }

    function parseQuery(queryString) {
        var query = {};
        var pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
        for (var i = 0; i < pairs.length; i++) {
            var pair = pairs[i].split('=');
            try {
                query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
            } catch (ex) {

            }


        }
        return query;
    }

    $scope.loadCancel = () => {
        $('.cancel_tr').css('pointer-events', 'none');
        $('.cancel_tr').css('cursor', 'wait');

        var data = {
            date: $scope.filter.date
        }
        $http.post(base_url + 'telesales_v2/ajax_add_cancel', JSON.stringify(data)).then(
            r => {
                $('.cancel_tr').css('pointer-events', 'initial');
                $('.cancel_tr').css('cursor', 'initial');
                if (r && r.data.status == 1) {
                    $scope.go2Page(1, $scope.p);
                } else if (r && r.data.status == 0) {
                    toastr["error"](r.data.message);
                } else toastr["error"]("Đã có lỗi xẩy ra!");
            });
    }

    $scope.sortByTime = () => {
        $scope.filter.sortTime = !$scope.filter.sortTime;
        $scope.go2Page(1, $scope.p);
    }


    $scope.getDataPhones = (is_registed) => {
        if (!$scope.filter.key || $scope.filter.key && $scope.filter.key.length == 0) {
            $('.date_search').removeClass('cant_tounch');
        } else {
            $('.date_search').addClass('cant_tounch');
        }

        if ($scope.filter.cancel == 1) {
            if (!$scope.filter.date) {
                toastr["error"]("Vui lòng chọn ngày!");
                $scope.filter.cancel = 0;
                return;
            }
        }
        $('.table-responsive').css('opacity', '0.5').addClass('loading');


        $scope.filter.is_registed = is_registed;

        if ($scope.filter.date && $scope.filter.date != '') {
            if (!$scope.filter.sort_date) {
                toastr["error"]("Vui lòng chọn kiểu lọc ngày!");
                return false;
            }
        }
        $('.form,.main_tab').addClass('cant_tounch');
        $scope.filter.position = $scope.findGetParameter('position');

        $http.get(base_url + 'sale_care/ajax_get_sale_care_phones?filter=' + JSON.stringify($scope.filter)).then(r => {
            $('.form,.main_tab').removeClass('cant_tounch');
            $('.table-responsive').css('opacity', '1').removeClass('loading');
            if (r && r.data.status == 1) {
                $scope.ajax_data = r.data.data;
                $scope.is_load = r.data.is_load;
                $scope.sortTime = $scope.filter.sortTime;
                if ($scope.ajax_data)
                    $scope.ajax_data.map(x => {
                        x.open = false;
                        if (x.services)
                            x.services = JSON.parse(x.services);
                        if (x.pramas_origin)
                            x.params = parseQuery(x.pramas_origin);

                        if ($scope.sourceCare)
                            $scope.sourceCare.forEach(element => {
                                if (element.id == x.update_source) {
                                    x.name_update = element.name;
                                }
                            });
                    });
                $scope.p.total = parseInt(r.data.count);
                $scope.p.totalPage = Math.ceil(r.data.count / $scope.p.itemsPerPage);

                if ($scope.filter.endPage == 1) {
                    $scope.p.currentPage = $scope.p.totalPage;
                    $scope.p.offset = ($scope.p.currentPage - 1) * $scope.p.itemsPerPage;
                }
                if (r.data.data && r.data.data.length > 0) {
                    $scope.get_call_results(r.data.data);
                    $scope.checkUsers(r.data.data);
                }
            } else if (r && r.data.status == 0) {
                $scope.ajax_data = [];
                toastr["error"](r.data.message);
            } else toastr["error"]("Đã có lỗi xẩy ra!");

        });
    }

    $scope.triggerSelect = () => {
        $scope.select2();
    }

    $scope.get_call_results = (arr) => {
        $http.post(base_url + 'sale_care/ajax_get_call_results', JSON.stringify(arr)).then(r => {
            if (r && r.data.status == 1) {
                $scope.ajax_data.forEach((element, index) => {
                    r.data.data.forEach(el => {
                        if (element.phone == el.phone) {
                            $scope.ajax_data[index].total_call = el.total;
                            $scope.ajax_data[index].total_false = el.total_false;
                        }
                    });
                });
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }



    $scope.checkUsers = (phones) => {
        $http.post(base_url + 'sale_care/ajax_check_user', JSON.stringify(phones)).then(
            r => {
                if (r && r.data.status == 1) {
                    $scope.ajax_data.forEach((element, index) => {
                        r.data.data.forEach(el => {
                            if (element.phone == el.phone) {
                                $scope.ajax_data[index].have_app = el.have_app;
                                $scope.ajax_data[index].have_cus = el.have_cus;
                                $scope.ajax_data[index].have_inv = el.have_inv;
                                $scope.ajax_data[index].customer_id = el.customer_id;
                            }
                        });
                    });
                } else if (r && r.data.status == 0) {
                    toastr["error"](r.data.message);
                } else toastr["error"]("Đã có lỗi xẩy ra!");
            });
    }

    $scope.getCallHistory = (phone) => {
        $('#user_table2').DataTable().destroy();
        $('.call-history').css('pointer-events', 'none');
        $http.get(base_url + 'sale_care/ajax_get_care_result_by_phone/' + phone).then(r => {
            $scope.total_duration_time = r.data.total_duration_time;
            $scope.total_call_time = r.data.total_call_time;
            if (r && r.data.status == 1) {
                $('.call-history').css('pointer-events', 'inherit');
                $scope.call_result_details = r.data.data;
                $('#call_result').modal('show');
                angular.element(document).ready(function() {
                    setTimeout(() => {
                        $('#user_table2').DataTable({
                            "columnDefs": [{
                                "defaultContent": "-",
                                "targets": "_all"
                            }]
                        });
                        $scope.$apply();
                    }, 0);
                });
            }
        })
    }
    $scope.dateInputInit = () => {
        if ($('.date').length) {
            //var start = $scope.start;
            //var end = $scope.end;
            if (typeof start === "undefined") {
                start = end = moment().format("MM/DD/YYYY");
            }
            setTimeout(() => {
                $('.date').daterangepicker({
                    opens: 'right',
                    alwaysShowCalendars: true,
                    startDate: moment(),
                    endDate: moment(),
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
                $('.single-date').daterangepicker({
                    singleDatePicker: true,
                    showDropdowns: true,
                    minYear: 2021,
                    maxDate: moment(),
                    maxYear: parseInt(moment().format('YYYY'), 10),
                    locale: {
                        format: 'DD/MM/YYYY'
                    }
                }, );
            }, 100);
        }
    }

    // var watch = $scope.$watchGroup(['filter.import_id', 'filter.date', 'filter.sort_date', 'filter.status_care', 'filter.source_id', 'filter.uncaredate', 'filter.option_', 'filter.camp_id'], function (newValues, oldValues) {
    //     if (newValues[0] == oldValues[0] && newValues[1] == oldValues[1] && newValues[2] == oldValues[2] && newValues[3] == oldValues[3] && newValues[4] == oldValues[4] && newValues[5] == oldValues[5] && newValues[6] == oldValues[6] && newValues[7] == oldValues[7]) return false;
    //     if ($scope.pass)
    //         $scope.go2Page(1, $scope.p);
    //     $scope.pass = true;
    // });

    $scope.loadData = () => {
        $scope.filter.sortTime = false;
        $scope.go2Page(1, $scope.p);
    }

    $scope.go2Page = function(page, item) {
        var pi = item;

        if (page < 0) {
            $scope.filter.endPage = 1;
            $scope.filter.limit = pi.itemsPerPage;
            $scope.getDataPhones($scope.filter.is_registed);
            return;
        }

        $scope.filter.endPage = 0;
        pi.currentPage = page;
        pi.from = pi.offset = (pi.currentPage - 1) * pi.itemsPerPage;
        if (pi.id == 1) {
            $scope.filter1.limit = pi.itemsPerPage;
            $scope.filter1.offset = pi.offset;
            $scope.getStudentCare($scope.current_student.id);
        } else if (pi.id == 2) {
            $scope.filter2.limit = pi.itemsPerPage;
            $scope.filter2.offset = pi.offset;
            $scope.getApp(0);
        } else {
            $scope.filter.limit = pi.itemsPerPage;
            $scope.filter.offset = pi.offset;
            $scope.getDataPhones($scope.filter.is_registed);
        }

        pi.to = pi.total < pi.itemsPerPage ? pi.total : pi.itemsPerPage
    }

    $scope.Previous = function(page, item) {
        if (page - 1 > 0) $scope.go2Page(page - 1, item);
        if (page - 1 == 0) $scope.go2Page(page, item);
    }

    $scope.getRange = function(paging) {
        var max = paging.currentPage + 3;
        var total = paging.totalPage + 1;
        if (max > total) max = total;
        var min = paging.currentPage - 2;
        if (min <= 0) min = 1;
        var tmp = [];
        return _.range(min, max);
    }

    //start tree group

    $scope.open_role_md = () => {
        $('#roleMd').modal('show');
        get_and_render_list();
    }

    function get_and_render_list(first = false) {
        $http.get('sale_care/ajax_get_groups_consultants?filter=' + JSON.stringify({
            all: false,
            get_users: true
        })).then(r => {
            if (r && r.data.status == 1) {
                $scope.groups = r.data.data;
                if (first) $scope.filter.selected_group = $scope.groups[0].id;
                let html = bind_fnc($scope.groups, 1);
                $(".list-groups").empty();
                var $el = $(html).appendTo('.list-groups');
                $compile($el)($scope);
            }
        })
    }

    function bind_fnc($list, is_main = 0) {
        var html = `
            <ul class=" ${is_main == 1 ? 'main-ul' : ''} w-100">
            `;
        $list.forEach((list, key) => {
            html += `
                <li class="group-item-li pointer ${($scope.filter.selected_group == list.id) ? 'active' : ''}">
                    <div class="fth">
                        <div class="text" ng-click="select_group_item(${list.id}, $event)">
                            <div class="no">${list.obs ? list.obs.length : 0}</div>
                            <div class="name">${list.name}</div>
                        </div>
                        <div class="action" ng-click="toggle_members(${list.id}, $event)"><i class="fa fa-angle-right" aria-hidden="true"></i></div>
                    </div>
                </li>
                `;
            if (list.obs && list.obs.length > 0) {
                html += `<div class="mb ${($scope.filter.selected_parent == list.id) ? 'open' : ''} ">`;
                list.obs.forEach((element, k) => {
                    if (element.active == 1) {
                        html += `<li class="child members pointer 
                        ${(k == list.obs.length - 1) ? 'last-c' : ''} 
                        ${($scope.filter.selected_member == element.id) ? 'selected' : ''}"
                        ng-click="select_members_item(${element.id}, ${list.id},$event)">`;
                        html += `<div>${element.name}</div>`;
                        html += `</li>`;
                    }
                });
            }
            html += `</div>`
            if (list.children && list.children.length > 0) {
                html += `<li class="child">`;
                html += bind_fnc(list.children);
                html += `</li>`;
            }
        });
        html += `</ul>`;
        return html;
    }

    $scope.select_group_item = (id) => {
        $scope.filter.selected_group = id;

        delete $scope.filter.selected_member;
        delete $scope.filter.selected_parent;

        $scope.loadData();
        get_and_render_list();
    }

    $scope.toggle_members = (parent_id, event) => {
        $scope.filter.selected_parent = parent_id;
        handle_unreload_list();
    }

    function handle_unreload_list() {
        let html = bind_fnc($scope.groups, 1);
        $(".list-groups").empty();
        var $el = $(html).appendTo('.list-groups');
        $compile($el)($scope);
    }

    $scope.select_members_item = (member_id, group_id, event) => {
        $scope.filter.selected_member = member_id;
        $scope.filter.selected_parent = group_id;
        delete $scope.filter.selected_group;
        $scope.loadData();
        get_and_render_list();
    }
    //end tree group
    
    $scope.datepicker_cus = () => {
        $(".datepicker_cus").datepicker({
            dateFormat: "dd-mm-yy",
            changeMonth: true,
            changeYear: true,
            defaultDate: '01-01-2000'
        });
    }
        
});
app.directive('ngEnter', function() {
    return function(scope, element, attrs) {
        element.bind("keydown keypress", function(event) {
            if (event.which === 13) {
                scope.$apply(function() {
                    scope.$eval(attrs.ngEnter);
                });
                event.preventDefault();
            }
        });
    };
})