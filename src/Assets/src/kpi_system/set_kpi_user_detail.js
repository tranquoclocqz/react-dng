app.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var model, modelSetter;

            attrs.$observe('fileModel', function (fileModel) {
                model = $parse(attrs.fileModel);
                modelSetter = model.assign;
            });

            element.bind('change', function () {
                scope.$apply(function () {
                    var length_ = element[0].files.length;

                    setTimeout(() => {
                        $('#' + attrs.name).parent('.pr').find('span.total').html(' [' + length_ + ' file đã được chọn]');
                        // $('#' + attrs.name).parent('.pr').find('.btn-save').removeClass('hide');
                    }, 100);

                    modelSetter(scope.$parent, element[0].files[0]);
                });
            });
        }
    };
}]);

app.controller('bg_user', function ($scope, $http, kpiSystemSvc) {

    var pi = $scope.pagingInfo = {
        itemsPerPage: 30,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };

    $scope.init = () => {
        $('.content').css('opacity', 1);
        $scope.isManager = isManager;
        $scope.isEdit = true;
        $scope.isUnlock = isUnlock;
        $scope.standar = {};
        $scope.total_point = 0;
        $scope.max_coefficient = 5;
        $scope.getGr();
        $scope.dateTime();
        let param_id = getParamsValue('id');
        if (param_id) {
            $scope.filter = {
                id: param_id,
            }
            $scope.getDetail();
        } else {
            $('.modal-content .modal-body').empty();
            $('.modal-content .modal-body').append('Sai đường dẫn');
        }
        $scope.getLevelComplain();
    }

    $scope.percentRate = (val, total) => {
        if (total && total > 0) {
            return (val / total) * 100;
        }
        return 0;
    }

    $scope.openModalC = () => {
        $('#changeC').modal('show');

        delete $scope.coefficient;
        delete $scope.end_date_sl;
        $scope.start_sl = 0;
        $scope.object_coefficients = [];
        $.each($scope.standar.ob_coefficient, function (index, value) {
            $scope.object_coefficients.push({
                criteria_user_id: $scope.standar.criteria_user_id,
                start_date: moment(value.start_date, 'YYYY-MM-DD').format('DD/MM/YYYY'),
                end_date: moment(value.end_date, 'YYYY-MM-DD').format('DD/MM/YYYY'),
                coefficient: value.coefficient
            });
            $scope.start_sl = moment(value.end_date, 'YYYY-MM-DD').format('D');
        });

        $scope.time_start = moment($scope.standar.date, 'MM/YYYY').format('DD/MM/YYYY');
        $scope.time_days = moment($scope.standar.date, 'MM/YYYY').daysInMonth();


    }

    $scope.checkS = (index, value) => {
        var show = true;
        if ((index + 1) <= value.range_f) {
            show = false;
        }
        // if ((index + 1) > value.range_e && value.range_e) {
        //     show = false;
        // }
        return show;
    }
    $scope.selectEnd = (index, value) => {
        //  $scope.cr_index = index;
        // $scope.object_stores[index].range_e = angular.copy(value.end);
        value.end_date = moment(parseInt(value.end) - 1 + '/' + $scope.standar.date, 'DD/MM/YYYY').add(1, 'days').format('DD/MM/YYYY');
        $scope.object_stores.forEach(($value, $index) => {
            if ($index > index) {
                $value.start_date = moment(value.end + '/' + $scope.standar.date, 'DD/MM/YYYY').add(1, 'days').format('DD/MM/YYYY');
                $value.range_f = parseInt(value.end) + 1;
                $value.end = '';
            }
        });
        $scope.select2();
    }
    $scope.deleteS = (index) => {
        $scope.object_stores.splice(index, 1);
    }

    $scope.checkD = (index) => {
        var d = false;
        if ($scope.object_stores && $scope.object_stores.length >= 3) {
            if (index + 1 <= $scope.object_stores.length - 2) {
                d = true;
            }
        }
        return d;
    }
    $scope.ds_delere = (index) => {
        var d = false;
        if ($scope.object_stores && $scope.object_stores.length >= 2) {
            if (index + 1 <= $scope.object_stores.length - 1) {
                d = true;
            }
        }
        // if ($scope.object_stores && $scope.object_stores.length == 1) {
        //     d = true;
        // }
        return d;
    }


    $scope.openSetting = () => {
        if (!$scope.object_stores) {
            $scope.object_stores = [];
        }
        var start_sl = angular.copy($scope.time_start_);
        var ob = {
            store_id: '',
            start_date: start_sl,
            end_date: '',
            number_day: "-1",
            end: '',
            range_f: 0
        };
        $scope.select2();
        if ($scope.object_stores.length == 0) {
            $scope.object_stores.push(ob);
        }
        $('#changeA').modal('show');
        $scope.getOffs();
    }

    $scope.addBussiness = () => {
        var end = 1,
            err = false;
        $scope.object_stores.forEach(element => {
            if (!element.store_id) {
                showMessErr("Chọn chi nhánh!");
                err = true;
                return;
            }
            if (!element.end) {
                showMessErr("Chọn ngày kết thúc!");
                err = true;
                return;
            }
            end = parseInt(element.end);
        });
        if (err) {
            return;
        }
        var start_sl = moment(end + '/' + $scope.standar.date, 'DD/MM/YYYY').add(1, 'days').format('DD/MM/YYYY');
        if (end == 1) {
            start_sl = moment(end + '/' + $scope.standar.date, 'DD/MM/YYYY').format('DD/MM/YYYY');
        }
        var ob = {
            store_id: '',
            start_date: start_sl == "Invalid date" ? '' : start_sl,
            end_date: '',
            number_day: "-1",
            end: '',
            range_f: end + 1
        };
        $scope.object_stores.push(ob);
        $scope.select2();
    }


    $scope.changeA = () => {
        var err = false;
        if ($scope.object_stores.length == 0) {
            showMessErr("Không có dữ liệu!");
            err = true;
            return;
        }
        $scope.object_stores.forEach(element => {
            if (!element.store_id) {
                showMessErr("Chọn chi nhánh!");
                err = true;
                return;
            }
            if (!element.end) {
                showMessErr("Chọn ngày kết thúc!");
                err = true;
                return;
            }
        });
        if (err) {
            return;
        }
        var data = [],
            strore_temp = [];
        
        $scope.object_stores.forEach(element => {
            if (strore_temp[element.store_id]) {
                err = true;
            }
            strore_temp[element.store_id] = 1;

            data.push({
                criteria_user_id: $scope.standar.criteria_user_id,
                start_date: moment(element.start_date, 'DD/MM/YYYY').format('YYYY/MM/DD'),
                end_date: moment(element.end_date, 'DD/MM/YYYY').format('YYYY/MM/DD'),
                number_days: element.number_day,
                store_id: element.store_id
            });
        });

        if (err) {
            showMessErr('Mỗi chi nhánh chỉ được phép tạo 1 dòng');
            return false;
        }
        var sent = {
            criteria_user_id: $scope.standar.criteria_user_id,
            data: data
        };

        $http.post(base_url + 'Kpi_system/changeA', JSON.stringify(sent)).then(r => {
            if (r && r.data.status == 1) {
                $scope.getDetail();
                showMessSuccess("Thành công!");
                $('#changeA').modal('hide');
                delete working_number_day;
            } else {
                showMessErr(r.data.message);
            }
        });
    }

    $scope.getOffs = () => {
        var data = {
            month: moment($scope.standar.date, "MM/YYYY").format("MM"),
            year: moment($scope.standar.date, "MM/YYYY").format("YYYY"),
            user_id: $scope.standar.user_id,
            criteria_user_id: $scope.standar.criteria_user_id
        }
        $http.get(base_url + 'Kpi_system/ajax_get_off?filter=' + JSON.stringify(data)).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.offData = r.data.data;
                $scope.data_ = r.data.data_;

                if ($scope.data_ && $scope.data_.length > 0)
                    $scope.object_stores = [];

                $scope.data_.forEach((element, index) => {
                    var ob = {
                        store_id: element.store_id,
                        start_date: element.date_s,
                        end_date: element.date_e,
                        number_day: element.number_days,
                        end: String(parseInt(element.end)),
                        range_f: parseInt(element.start) - 1
                    };
                    if (ob.range_f == 0) {
                        ob.range_f = "1";
                    }
                    $scope.object_stores.push(ob);
                });
                $scope.select2();
                $scope.setDate();
            } else if (r.data && r.data.status == 0) {
                showMessErr(r.data.message);
            } else {
                showMessErr("Đã có lỗi xẩy ra!");
            }
        })
    }

    $scope.setDate = () => {
        setTimeout(() => {
            $(".datepck").datepicker({
                dateFormat: "dd/mm/yy"
            });
        }, 100);
    }

    $scope.addObDay = () => {
        if (!$scope.coefficient) {
            showMessErr("Nhập hệ số!");
            return;
        } else if ($scope.coefficient > $scope.max_coefficient) {
            showMessErr("Hệ số không được lớn hơn " + $scope.max_coefficient);
            return;
        }
        if (!$scope.end_date_sl) {
            showMessErr("Chọn ngày kết thúc!");
            return;
        }

        if (!$scope.object_coefficients) {
            $scope.object_coefficients = [];
        } else {
            if ($scope.object_coefficients.length >= 3) {
                showMessErr("Phân quá nhiều ngày!");
                return;
            }
        }


        var ob = {
            criteria_user_id: $scope.standar.criteria_user_id,
            start_date: $scope.time_start,
            end_date: $scope.end_date_sl + '/' + $scope.standar.date,
            coefficient: $scope.coefficient
        };
        $scope.object_coefficients.push(ob);

        $scope.start_sl = $scope.end_date_sl;
        $scope.time_start = moment($scope.end_date_sl + '/' + $scope.standar.date, 'DD/MM/YYYY').add(1, 'days').format('DD/MM/YYYY');

        delete $scope.coefficient;
        delete $scope.end_date_sl;

    }

    $scope.undoD = () => {
        var ob = $scope.object_coefficients[$scope.object_coefficients.length - 1];

        $scope.start_sl = moment(ob.start_date, 'DD/MM/YYYY').format('DD');
        if ($scope.start_sl == 1) {
            $scope.start_sl = 0;
        }
        $scope.time_start = moment(ob.start_date, 'DD/MM/YYYY').format('DD/MM/YYYY');


        setTimeout(() => {
            $scope.object_coefficients.splice(-1, 1);
            $scope.$apply();
        }, 10);
    }

    $scope.changeC = () => {

        if ($scope.start_sl != $scope.time_days) {
            showMessErr("Chưa chọn đủ 1 tháng!");
            return;
        }

        if ($scope.object_coefficients && $scope.object_coefficients.length > 0) {

            var temp = angular.copy($scope.object_coefficients);

            temp.forEach(element => {
                element.start_date = moment(element.start_date, "DD/MM/YYYY").format("YYYY/MM/DD");
                element.end_date = moment(element.end_date, "DD/MM/YYYY").format("YYYY/MM/DD");
            });

            var data = {
                criteria_user_id: $scope.standar.criteria_user_id,
                data: temp
            };
            $scope.object_coefficients.load = true;
            $http.post(base_url + 'Kpi_system/changeC', JSON.stringify(data)).then(r => {
                delete $scope.object_coefficients;
                if (r && r.data.status == 1) {
                    $scope.getDetail();
                    showMessSuccess("Thành công!");
                    $('#changeC').modal('hide');
                } else if (r && r.data.status == 0) {
                    showMessErr(r.data.message);
                } else {
                    showMessErr("Đã có lỗi xẩy ra!");
                }
            });
        }

    }

    $scope.openDetailUser = () => {
        $('#cr_modal').modal('show');
        $scope.getCurent();
    }

    $scope.getCurent = () => {
        if ($('#infor').hasClass('show_')) {
            $('#infor').removeClass('show_');
            $('#user_').html('Doanh số cá nhân');
            return;
        }

        var data = {
            "month_start": moment($scope.standar.date, "MM/YYYY").format("MM"),
            "month_end": moment($scope.standar.date, "MM/YYYY").format("MM"),
            "year_start": moment($scope.standar.date, "MM/YYYY").format("YYYY"),
            "year_end": moment($scope.standar.date, "MM/YYYY").format("YYYY"),
            "user_id": $scope.standar.user_id
        }
        $scope.total = {
            sale: 0,
            target: 0,
            count_rate: 0,
            total_invoice: 0,
            bonus: 0,
            countr: 0,
            rate: 0
        }
        $scope.loading = true;
        $('#user_').addClass('loading');
        $http.get(base_url + 'Kpi_system/ajax_get_report_sale_users?filter=' + JSON.stringify(data)).then(r => {
            $('#user_').removeClass('loading');

            $('#infor').addClass('show_');
            $('#user_').html('Đóng cửa sổ');
            if (r.data && r.data.status == 1) {
                $scope.loading = false;
                $scope.rows = [];
                for (const p in r.data.data) {
                    r.data.data[p].cr_dt = moment(r.data.data[p].month, "MM-YYYY").format("MM/YYYY");

                    $scope.show_ = false;
                    if (r.data.data[p].total_sale_) {
                        $scope.show_ = true;
                    }

                    $scope.serve_show = false;
                    if (r.data.data[p].total_serve_) {
                        $scope.serve_show = true;
                    }


                    $scope.show_rate = false;
                    if (r.data.data[p].rate_) {
                        $scope.show_rate = true;
                    }



                    $scope.rows.push(r.data.data[p]);
                    $scope.total.sale += Number(r.data.data[p].total_sale);
                    $scope.total.target += r.data.data[p].total_target ? Number(r.data.data[p].total_target) : 0;
                    $scope.total.bonus += r.data.data[p].target ? Number(r.data.data[p].target.bonus) : 0;
                    if (r.data.data[p].rate) {
                        $scope.total.rate += Number(r.data.data[p].rate.rate);
                        $scope.total.total_invoice += Number(r.data.data[p].rate.total_invoice);
                        $scope.total.count_rate += Number(r.data.data[p].rate.count_rate);
                        $scope.total.countr++;
                    }
                }
            }
        });

        load_point_work(data);
    }


    $scope.caculaterRatio = (on, bot) => {
        on = on ? on : 0;
        bot = bot && bot > 0 ? bot : 1;
        return Math.round(on / bot, 2);
    }

    $scope.getLevelComplain = () => {
        $http.get(base_url + '/options/ajax_get_level_complain').then(r => {
            if (r.data) {
                $scope.complains = r.data;
            }
        })
    }

    $scope.openComplain = (id) => {
        window.open(base_url + '/customers/complain_detail/' + id);
    }

    $scope.showComplain = (val) => {
        if ($scope.isShowComplain == val) {
            return $scope.isShowComplain = '';
        }
        $scope.isShowComplain = val;
    }

    $scope.rentColor = (lv) => {
        color = "";
        if ($scope.complains) {
            $scope.complains.forEach(element => {
                if (element.level == lv) {
                    color = element.color;
                }
            });
        }
        return color;
    }

    $scope.format_date = (date, type) => {
        return moment(date).format(type);
    }

    function load_point_work(data) {
        $scope.loadingPoint = true;

        let eday = moment(data.year_start + '-' + data.month_start + '-01').clone().endOf('month').format('DD');

        let filter = {
            stores: [$scope.standar.main_store_id],
            date: "01/" + data.month_start + '/' + data.year_start + ' - ' + eday + "/" + data.month_end + '/' + data.year_end,
            isTotal: true,
            limit: 1,
            offset: 0
        };

        $http.get(base_url + 'statistics/ajax_report_customer_old_new?filter=' + JSON.stringify(filter)).then(r => {
            if (r.data.status == 1) {
                $scope.total = r.data.total;
            }
        })

        $http.get(base_url + 'Kpi_system/ajax_get_report_kpi?filter=' + JSON.stringify(data)).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.other = r.data.data;
            } else {
                showMessErr("Tính điểm chuyên cần đang có lỗi xẩy ra! Vui lòng thử lại sau.");
            }
        })

        $http.get(base_url + 'staffs/ajax_get_diligence_user?filter=' + JSON.stringify(data)).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.pointWork = [];
                $scope.totalPoint = 0;

                $scope.loadingPoint = false;
                $scope.pointWork = r.data.data;
                $scope.pointWork.forEach(e => {
                    $scope.totalPoint += Number(e.diligence);
                });
            } else {
                showMessErr("Tính điểm chuyên cần đang có lỗi xẩy ra! Vui lòng thử lại sau.");
            }
        })

    }

    $scope.formatMoney = (amount, decimalCount = 0, decimal = ".", thousands = ",") => {
        try {
            decimalCount = Math.abs(decimalCount);
            decimalCount = isNaN(decimalCount) ? 2 : decimalCount;

            const negativeSign = amount < 0 ? "-" : "";

            let i = parseInt(amount = Math.abs(Number(amount) || 0).toFixed(decimalCount)).toString();
            let j = (i.length > 3) ? i.length % 3 : 0;

            return negativeSign + (j ? i.substr(0, j) + thousands : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) + (decimalCount ? decimal + Math.abs(amount - i).toFixed(decimalCount).slice(2) : " đ");
        } catch (e) {
            console.log(e)
        }
    };

    $scope.get_point = (d) => {
        if ($scope.pointWork) {
            let point = $scope.pointWork.find(r => {
                return r.month == d
            });

            return point ? point.diligence : 0;
        }

    }


    $scope.dateTime = () => {
        setTimeout(() => {
            $(".date_").datepicker({
                dateFormat: "dd-mm-yy"
            });
        }, 1);
    }


    $scope.addMoreFile = (e) => {
        $(e.target).find('input').trigger('click');
    }

    $scope.changePoint = () => {
        $scope.total_point = 0;
        $scope.standar.obs.forEach(element => {
            if (element.value) {
                //element.value = Math.abs(element.value);
                $scope.total_point += parseFloat(element.value);
            }
        });
        $scope.total_point = Number($scope.total_point.toFixed(12));
    }

    $scope.fInt = (value) => {
        if (value)
            return parseInt(value)

        return 0;
    }


    $scope.getDetail = () => {
        $('#body_').addClass('loading');
        $http.get(base_url + 'Kpi_system/ajax_get_detail?filter=' + JSON.stringify($scope.filter)).then(r => {
            $('#body_').removeClass('loading');
            if (r && r.data.status == 1) {

                $scope.standar = r.data.data;
                if ($scope.standar.user_id == currentUserId && $scope.isManager) {
                    $scope.isEdit = false;
                }

                $scope.time_start = moment(r.data.data.date, 'MM/YYYY').format('DD/MM/YYYY');
                $scope.time_days = moment(r.data.data.date, 'MM/YYYY').daysInMonth();
                $scope.start_sl = 0;


                $scope.time_start_ = moment(r.data.data.date, 'MM/YYYY').format('DD/MM/YYYY');
                $scope.time_days_ = moment(r.data.data.date, 'MM/YYYY').daysInMonth();
                $scope.start_sl_ = 0;

                $scope.total_point = 0;
                $scope.standar.obs.forEach(element => {
                    if (element.value)
                        $scope.total_point += parseFloat(element.value);
                    element.note = element.note.replace(/(?:\r\n|\r|\n)/g, '<br>');

                });
                if ($scope.standar.is_save == false) {
                    $scope.addNew(0);
                }
                // $scope.standar.id = data.id;
                // $scope.standar.name = data.name;
                // $scope.standar.status = data.status;
                // $scope.standar.main_group_id = data.main_group_id;
                // $scope.standar.group_id = data.group_id;
                // $scope.standar.obs = data.obs;
                // $scope.standar.user_id = data.user_id;
                $scope.select2();
            } else if (r && r.data.status == 0) {
                alert(r.data.message);
            } else showMessErr("Đã có lỗi xẩy ra!");
        });
    }

    $scope.deleteSc = (value, index) => {
        if (confirm('Bạn có muốn xóa ghi chú') == true)
            $http.post(base_url + 'Kpi_system/deleteErrors', JSON.stringify(value)).then(r => {
                if (r && r.data.status == 1) {
                    $scope.getDetail();
                    showMessSuccess("Thành công!");
                } else if (r && r.data.status == 0) {
                    showMessErr(r.data.message);
                } else {
                    showMessErr("Đã có lỗi xẩy ra!");
                }
            });
        //    value.obs.splice(index, 1);

    }

    $scope.deleteIm = (value, file) => {
        var data = {
            id: value.id,
            file: file
        }
        $http.post(base_url + 'Kpi_system/deleteImg', JSON.stringify(data)).then(r => {
            if (r && r.data.status == 1) {
                $scope.getDetail();
                showMessSuccess("Thành công!");
            } else if (r && r.data.status == 0) {
                showMessErr(r.data.message);
            } else {
                showMessErr("Đã có lỗi xẩy ra!");
            }
        });
    }

    $scope.openUpdateNote = (item) => {
        $scope.currentKpi = item;
        $('#noteModal').modal('show');
    }

    $scope.setNote = () => {
        $scope.currentKpi.load = true;
        kpiSystemSvc.updateCurrentNote($scope.currentKpi).then(r => {
            $scope.currentKpi.load = false;
            $('#noteModal').modal('hide');
        })
    }

    $scope.fortmat_ = (number) => {
        if (!number || number == 0) {
            return 0;
        }
        if (isInt(number)) {
            return number;
        } else {
            return parseFloat(number).toFixed(2);
        }

    }


    $("body").on("change", '.file_upload', function (e) {
        $(e.target).addClass('loading');

        var fd = new FormData();
        var files = $(e.target)[0].files[0];

        fd.append('file', files);
        fd.append('folder', 'kpi_system');

        $http({
            method: 'post',
            url: 'Uploads/ajax_upload_to_filehost?func=kpi_set_kpi_user_detail',
            data: fd,
            headers: {
                'Content-Type': undefined
            },
        }).then(function successCallback(r) {
            $(e.target).removeClass('loading');
            if (r && r.data.status) {} else showMessErr(r.data.messages);
        });
    });

    function isInt(n) {
        return n % 1 === 0;
    }

    $scope.saveTheSc = (item, newTextArea, date, newTypeArea, e) => {
        let fd = new FormData();

        if (!newTypeArea) {
            showMessErr("Chọn loại ghi chú!");
            return;
        }
        if (!newTextArea) {
            showMessErr("Nhập ghi chú!");
            return;
        }
        if (!date) {
            date = moment().format('DD-MM-YYYY');
        }
        $(e.target).css('opacity', '0.5');
        $(e.target).css('pointer-events', 'none');

        if (document.forms['form_kpi']['file_' + item.id])
            for (let index = 0; index < document.forms['form_kpi']['file_' + item.id].files.length; index++) {
                fd.append('file_' + item.id + '[]', document.forms['form_kpi']['file_' + item.id].files[index]);
            }

        var data = {
            name: newTextArea,
            user_detail_id: item.idUFile,
            date: date,
            id: item.id,
            id_cf: $scope.standar.criteria_user_id,
            user_id: $scope.standar.user_id,
            type: newTypeArea
        };

        fd.append('data', JSON.stringify(data));

        // return;

        $http({
            url: base_url + '/Kpi_system/ajax_save_image',
            method: "POST",
            data: fd,
            headers: {
                'Content-Type': undefined
            }
        }).then(r => {
            $(e.target).css('opacity', '1');
            $(e.target).css('pointer-events', 'initial');

            var ind = -1;
            item.obs.forEach((element, index) => {
                if (!element.date) {
                    ind = index;
                }
            });
            item.obs.splice(e, 1);


            if (r.data && r.data.status == 1) {
                $scope.getDetail();


                setTimeout(() => {
                    $('input[type=file]').val('');
                    $('input[type=file]').parent('.pr').find('span.total').html('');
                    $('input[type=file]').parent('.pr').find('.btn-save').addClass('hide');
                    $scope.$apply();

                }, 100);

            } else if (r.data && r.data.status == 0) {
                showMessErr(r.data.message);

            } else {
                showMessErr("Upfile thất bại!");
            }

        })

        // if (!value.obs) {
        //     value.obs = []
        // }
        // value.obs.push({
        //     name: newTextArea,
        //     new: 1
        // })

        // newTextArea = "";
    }

    $scope.addMoreSub = (value) => {
        if (!value.obs) {
            value.obs = []
        }
        value.obs.push({
            name: '',
            temp: 1
        })
        $scope.dateTime();
    }

    $scope.getUser = () => {
        $http.get(base_url + 'Kpi_system/ajax_get_user').then(r => {
            if (r && r.data.status == 1) {
                $scope.users = r.data.data;
            } else showMessErr("Đã có lỗi xẩy ra!");
        });
    }


    $scope.getGr = () => {
        $http.get(base_url + 'Kpi_system/ajax_get_group_st').then(r => {
            $scope.standard_gr = r.data.data;
        })
    }


    $scope.getGroups = () => {
        $http.get(base_url + 'Kpi_system/ajax_get_groups').then(r => {
            $scope.groups = r.data.data;
        })
    }


    $scope.getStandards = () => {
        $http.get(base_url + '/Kpi_system/ajax_get_standards').then(r => {
            $scope.standards = r.data.data;
        })
    }

    $scope.changeStandard = (id = null) => {

        $scope.standards_ = [];
        if ($scope.standar.standard_ids) {
            if (id) {
                var index = $scope.standar.standard_ids.indexOf(id);
                $scope.standar.standard_ids.splice(index, 1);
            }
            $scope.standards.forEach(element => {
                if ($scope.standar.standard_ids.indexOf(element.id) >= 0) {
                    $scope.standards_.push(element);
                }
            });
        }
    }

    $scope.fresh = () => {
        $scope.standar = {};
        $scope.select2();
        $scope.changeStandard();
    }
    $scope.setUnDate = (value) => {
        delete $scope.filter[value];
        $scope.select2();
    }

    $scope.openDetail = (item) => {
        var e = angular.copy(item);

        $scope.standar.id = e.id;
        $scope.standar.name = e.name;
        $scope.standar.status = e.status;
        $scope.standar.main_group_id = e.main_group_id;
        $scope.standar.group_id = e.group_id;
        $scope.standar.obs = e.obs;
        $scope.standar.user_id = e.user_id;


        $scope.select2();
        $scope.changeStandard();
        $('#addBg').modal('show');
    }

    $scope.select2 = () => {
        setTimeout(() => {
            $('.select2').select2();
        }, 100);
    }

    function formatNumber(num) {
        if (!num) {
            return 0;
        }
        num = parseInt(num);
        return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    }

    $scope.getCriteriaUser = () => {
        $('#body_').addClass('loading');
        $http.get(base_url + 'Kpi_system/ajax_get_user_criterias?filter=' + JSON.stringify($scope.filter)).then(r => {
            $('#body_').removeClass('loading');
            if (r && r.data.status == 1) {
                $scope.data_ajax = r.data.data;
                $scope.pagingInfo.total = r.data.count;
                $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
            } else showMessErr("Đã có lỗi xẩy ra!");
        })
    }

    $scope.getVouchers = () => {
        $http.get(base_url + '/statistics/ajax_get_voucher').then(r => {
            $scope.vouchers = r.data.data;
        })
    }

    $scope.saveImages = (item, e) => {
        let fd = new FormData();
        $(e.target).css('opacity', '0.5');
        $(e.target).css('pointer-events', 'none');


        if (document.forms['form_kpi']['file_' + item.id].files)
            for (let index = 0; index < document.forms['form_kpi']['file_' + item.id].files.length; index++) {
                fd.append('file_' + item.id + '[]', document.forms['form_kpi']['file_' + item.id].files[index]);
            }

        fd.append('data', JSON.stringify({
            id: item.idUFile
        }));

        $http({
            url: base_url + '/Kpi_system/ajax_save_image',
            method: "POST",
            data: fd,
            headers: {
                'Content-Type': undefined
            }
        }).then(r => {
            $(e.target).css('opacity', '1');
            $(e.target).css('pointer-events', 'initial');

            if (r.data && r.data.status == 1) {
                $scope.getDetail();
                setTimeout(() => {
                    $('input[type=file]').val('');
                    $('input[type=file]').parent('.pr').find('span.total').html('');
                    $('input[type=file]').parent('.pr').find('.btn-save').addClass('hide');
                    $scope.$apply();

                }, 100);

            } else if (r.data && r.data.status == 0) {
                showMessErr(r.data.message);
            } else {
                showMessErr("Upfile thất bại!");
            }

        })
    }

    $scope.checkShow = (item) => {

        var check = true;
        if (item.obs)
            item.obs.forEach(element => {
                if (!element.date) {
                    check = false;
                }
            });
        return check;
    }


    $scope.addNew = (tus = null) => {



        if (tus == 2) {
            var check = true;
            $scope.standar.obs.forEach(element => {
                if (!element.value || element.value == "") {
                    check = false;
                }
            });
            if (!check) {
                showMessErr("Bạn cần nhập đẩy đủ điểm trước khi khóa đánh giá!");
                return;
            }
        }

        if (!tus || tus == 2) {
            var check = true;
            $scope.standar.obs.forEach(element => {
                if (element.value > element.max_point) {
                    check = false;
                }
            });
            if (!check) {
                showMessErr("Điểm vượt quá giới hạn!");
                return;
            }

        }

        $('#body_').addClass('loading');
        var data = {
            data: $scope.standar,
            start: moment('01/' + $scope.standar.date, 'DD/MM/YYYY').startOf('month').format('YYYY/MM/DD'),
            end: moment('01/' + $scope.standar.date, 'DD/MM/YYYY').endOf('month').format('YYYY/MM/DD')
        };

        if (tus == 1) {
            data.data.status = 1;
        } else if (tus == 2) {
            data.data.status = 2;
        }


        $http.post(base_url + 'Kpi_system/ajax_add_new_c_user', JSON.stringify(data)).then(r => {
            if (r && r.data.status == 1) {
                $scope.getDetail();
                if (tus !== 0)
                    showMessSuccess("Thành công!");
            } else if (r && r.data.status == 0) {
                showMessErr(r.data.message);
            } else {
                showMessErr("Đã có lỗi xẩy ra!");
            }
        });

    }
    $scope.dateInputInit = () => {
        if ($('.date').length) {
            //var start = $scope.start;
            //var end = $scope.end;
            if (typeof start === "undefined") {
                start = end = moment().subtract(1, 'days').format("MM/DD/YYYY");
            }
            if ($scope.filter.date) {
                var date = $scope.filter.date.split(' - '),
                    start = moment(date[0], 'DD/MM/YYYY'),
                    end = moment(date[1], 'DD/MM/YYYY');
            } else {
                var
                    start = moment(),
                    end = moment();
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


    //paging
    $scope.go2Page = function (page) {
        if (page < 0) return;
        var pi = $scope.pagingInfo;
        pi.currentPage = page;
        pi.from = pi.offset = (pi.currentPage - 1) * pi.itemsPerPage;
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = ($scope.pagingInfo.currentPage - 1) * $scope.pagingInfo.itemsPerPage;
        $scope.getCriteriaUser();
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

}).filter('to_trusted', ['$sce', function ($sce) {
    return function (text) {
        return $sce.trustAsHtml(text);
    };
}]);
app.filter('momentFormat', function () {
    return (value, format) => {
        return moment(value, 'YYYY-MM-DD HH:mm:ss').format(format);
    };
});