 app.controller('report', function ($scope, $http, $compile, $sce) {
     $scope.init = () => {
         $('.content').css('opacity', 1);
         $scope.filter = {};
         $scope.filter.month = moment().format('MM');
         $scope.filter.year = moment().format('YYYY');
         $scope.filter.user = '0'
         $scope.normal_user_id = normal_user_id;
         $scope.is_send = '';
         $scope.ob = {};
         $scope.standar = {};
         $scope.img_account_df = base_url + 'assets/images/acount-df.png';
         $scope.dateInputInit();
         $scope.stores = all_stores;
         if ($scope.normal_user_id) {
             $scope.filter.store_id = store_id.toString();
             $scope.filter.month = moment(month, 'MM').format('MM');
             $scope.filter.year = moment(year, 'YYYY').format('YYYY');
             $scope.getKpiReport();
         }
     }

     $scope.openUpdateStoreNote = () => {
         $scope.obj_store_note = {
             show: true,
             value: angular.copy($scope.data_report.store_note),
             value_df: angular.copy($scope.data_report.store_note)
         }
     }

     $scope.updateStoreNote = () => {
         if ($scope.obj_store_note.value.length > 255) {
             showMessErr('Ghi chú tối đa 255 ký tự');
             return;
         }
         swal({
                 title: "Thông báo",
                 text: "Bạn có chắc chắn hành động này?",
                 type: "warning",
                 showCancelButton: true,
                 confirmButtonClass: "btn-danger",
                 confirmButtonText: "Xác nhận",
                 cancelButtonText: "Đóng",
                 closeOnConfirm: false,
                 showLoaderOnConfirm: false
             },
             function () {
                 $http.post(base_url + 'kpi_system/ajax_change_store_note', {
                     id: $scope.data_report.kpi_criteria_store_id,
                     note: $scope.obj_store_note.value
                 }).then(r => {
                     if (r.data.status) {
                         $scope.data_report.store_note = $scope.obj_store_note.value;
                         $scope.obj_store_note = {};
                         showMessSuccess("Thành công!");
                         swal.close();
                     } else {
                         showMessErr(r.data.message)
                     }
                 });
             });
     }

     $scope.openUpdateBonus = (value) => {
         value.open_edit_bonus = true;
         value.bonus_edit = parseNumber(value.bonus);
         value.bonus_note_edit = angular.copy(value.bonus_note);
     }

     $scope.updateBonus = (value) => {
         var item = angular.copy(value);
         item.bonus_edit = formatDefaultNumber(item.bonus_edit);

         if (item.bonus_edit && !item.bonus_note_edit) {
             showMessErr('Lý do thưởng không được bỏ trống');
             return;
         }
         if (item.bonus_note_edit.length > 255) {
             showMessErr('Lý do thưởng tối đa 255 ký tự');
             return;
         }

         swal({
                 title: "Thông báo",
                 text: "Bạn có chắc chắn hành động này?",
                 type: "warning",
                 showCancelButton: true,
                 confirmButtonClass: "btn-danger",
                 confirmButtonText: "Xác nhận",
                 cancelButtonText: "Đóng",
                 closeOnConfirm: false,
                 showLoaderOnConfirm: false
             },
             function () {
                 $http.post(base_url + 'kpi_system/ajax_change_bonus_user', {
                     id: item.criteria_user_id,
                     bonus: item.bonus_edit,
                     bonus_note: item.bonus_note_edit
                 }).then(r => {
                     if (r.data.status) {
                         $scope.getKpiReport();
                         showMessSuccess("Thành công!");
                         swal.close();
                     } else {
                         showMessErr(r.data.message)
                     }
                 });
             });
     }

     $scope.historyUpdate = (type, id) => {
         var name = '';
         if (type == 'kpi_change_invoice_refund') {
             name = 'Tổng tiền hoàn';
         } else if (type == 'kpi_change_salary_fund_store') {
             name = 'Phần trăm thưởng quỹ lương Chi nhánh';
         } else if (type == 'kpi_change_salary_fund_user') {
             name = 'Phần trăm hưởng cá nhân';
         } else if (type == 'kpi_change_bonus_user') {
             name = 'Thưởng';
         } else {
             showMessErr('Sai tham số');
             return;
         }
         $scope.obj_history_update = {
             load: true,
             list: [],
             name: name
         }
         var data_rq = {
             id: id,
             type: type
         }
         $('#modal-history').modal('show');
         $http.get(base_url + 'kpi_system/ajax_get_history_update?' + $.param(data_rq)).then(r => {
             $scope.obj_history_update.load = false;
             if (r.data.status == 1) {
                 var data = r.data.data;
                 $.each(data, function (index, value) {
                     value.note = value.note.slice(value.note.search(']') + 2);
                 });
                 $scope.obj_history_update.list = data;

             } else {
                 showMessErr(r.data.message);
             }
         });
     }

     $scope.openPercentUser = (value) => {
         value.show_edit_percent = true;
         value.percent_edit = value.percent + '';
     }

     $scope.changePercentUser = (value) => {
         var item = angular.copy(value);
         swal({
                 title: "Thông báo",
                 text: "Bạn có chắc chắn hành động này?",
                 type: "warning",
                 showCancelButton: true,
                 confirmButtonClass: "btn-danger",
                 confirmButtonText: "Xác nhận",
                 cancelButtonText: "Đóng",
                 closeOnConfirm: false,
                 showLoaderOnConfirm: false
             },
             function () {
                 $http.post(base_url + 'kpi_system/ajax_change_salary_fund_user', {
                     id: item.criteria_user_id,
                     percent: item.percent_edit
                 }).then(r => {
                     if (r.data.status) {
                         $scope.getKpiReport();
                         showMessSuccess("Thành công!");
                         swal.close();
                     } else {
                         showMessErr(r.data.message)
                     }
                 });
             });
     }

     $scope.openChangePercentSalaryFundStore = () => {
         $scope.obj_salary_fund_store = {
             show: true,
             value: angular.copy($scope.data_report.percent_salary_fund),
             value_df: angular.copy($scope.data_report.percent_salary_fund)
         }
     }

     $scope.changePercentSalaryFundStore = () => {
         if (!$scope.obj_salary_fund_store) {
             showMessErr('Vui lòng nhập phần trăm cần thay đổi');
             return;
         }

         swal({
                 title: "Thông báo",
                 text: "Bạn có chắc chắn hành động này?",
                 type: "warning",
                 showCancelButton: true,
                 confirmButtonClass: "btn-danger",
                 confirmButtonText: "Xác nhận",
                 cancelButtonText: "Đóng",
                 closeOnConfirm: false,
                 showLoaderOnConfirm: false
             },
             function () {
                 $http.post(base_url + 'kpi_system/ajax_change_salary_fund_store', {
                     id: $scope.data_report.kpi_criteria_store_id,
                     salary_fund: $scope.obj_salary_fund_store.value
                 }).then(r => {
                     if (r.data.status) {
                         $scope.obj_salary_fund_store = '';
                         $scope.getKpiReport();
                         showMessSuccess("Thành công!");
                         swal.close();
                     } else {
                         showMessErr(r.data.message)
                     }
                 });
             });
     }

     $scope.openChangeInvoiceRefund = () => {
         $scope.obj_invoice_refund = {
             show: true,
             value: parseNumber($scope.data_report.invoice_refund),
             value_df: parseNumber($scope.data_report.invoice_refund),
         }
     }

     $scope.changeInvoiceRefund = () => {
         var obj_edit = angular.copy($scope.obj_invoice_refund),
             refund = formatDefaultNumber(obj_edit.value);

         if (refund < 0) {
             showMessErr('Tổng tiền hoàn không được bé hơn 0');
             return;
         }
         swal({
                 title: "Thông báo",
                 text: "Bạn có chắc chắn hành động này?",
                 type: "warning",
                 showCancelButton: true,
                 confirmButtonClass: "btn-danger",
                 confirmButtonText: "Xác nhận",
                 cancelButtonText: "Đóng",
                 closeOnConfirm: false,
                 showLoaderOnConfirm: false
             },
             function () {
                 $http.post(base_url + 'kpi_system/ajax_change_invoice_refund', {
                     id: $scope.data_report.kpi_criteria_store_id,
                     refund: refund
                 }).then(r => {
                     if (r.data.status) {
                         $scope.obj_invoice_refund = '';
                         $scope.getKpiReport();
                         showMessSuccess("Thành công!");
                         swal.close();
                     } else {
                         showMessErr(r.data.message)
                     }
                 });
             });
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
     $scope.openModalA = () => {
         $('#changeA').modal('show');

         setTimeout(() => {
             $scope.select2();
         }, 100);
     }

     $scope.changeA = () => {
         if (!$scope.ob.number_days) {
             showMessErr("Nhập ngày số làm việc!");
             return;
         };

         var data = {
             id: $scope.data_report.kpi_criteria_store_id,
             number_days: $scope.ob.number_days
         };
         $http.post(base_url + 'Kpi_system/changeNumberD', JSON.stringify(data)).then(r => {
             if (r && r.data.status == 1) {
                 $scope.getKpiReport();
                 showMessSuccess();
                 $('#changeA').modal('hide');
                 delete $scope.ob.number_days;
                 $scope.select2();
             } else if (r && r.data.status == 0) {
                 showMessErr(r.data.message);
             } else {
                 showMessErr("Đã có lỗi xẩy ra!");
             }
         });
     }

     function isInt(n) {
         return n % 1 === 0;
     }

     $scope.renderExcel = () => {
         $scope.getKpiReport(1);
     }

     $scope.getKpiReport = (is_excel = 0) => {
         if (!$scope.filter.store_id) {
             showMessErr('Chọn chi nhánh!');
             return;
         }
         if (!$scope.filter.month) {
             showMessErr('Chọn tháng!');
             return;
         }
         var data = {
             'store_id': $scope.filter.store_id,
             'month_start': $scope.filter.month,
             'year_start': $scope.filter.year,
             'user_id': $scope.filter.user,
             'normol_user_id': $scope.normal_user_id,
             'is_excel': is_excel
         }
         $scope.load = true;
         $scope.obj_salary_fund_store = '';
         $scope.obj_invoice_refund = '';
         $http.get(base_url + 'Kpi_system/ajax_get_kpi_report_v2?filter=' + JSON.stringify(data)).then(r => {
             $scope.load = false;
             if (r.data.status) {
                 var data = r.data.data,
                     t = '';

                 if (is_excel) {
                     var $a = $('<a>');
                     $a.attr('href', data.url);
                     $a.attr('download', data.title_excel + '.xlsx');
                     $('body').append($a);
                     $a[0].click();
                     $a.remove();
                     return;
                 }
                 $.each(data.data, function (index, value) {
                     value.load_target = true;
                     value.percent = Number(value.percent);
                 });
                 $.each(data.text_salary_fund, function (index, value) {
                     t += value + `
                    `;
                 })
                 $scope.data_report = data;
                 $scope.data_report.max_percent_recive_salary_fund_store *= 100;
                 setTimeout(() => {
                     $('.text_salary_fund').attr('title', t);
                     $('.text_salary_fund').tooltip();
                 }, 100);
                 $scope.is_send = $scope.data_report.send_at;
                 $scope.obj_store_note = {};
                 $scope.getTargetUser();
             } else {
                 delete $scope.data_report;
                 showMessErr(r.data.message);
             }
         });
     }

     $scope.getTargetUser = () => {
         $http.post(base_url + 'invoices/ajax_get_target_with_user_ids', $scope.data_report.filter_users_target).then(r => {
             if (r.data.status == 1) {
                 var data = r.data.data;
                 $.each($scope.data_report.data, function (index, value) {
                     value.load_target = false;
                     if (!value.targeted) {
                         value.targeted = data[value.id] ? data[value.id] : 0;
                     }
                 });
             } else {
                 showMessErr(r.data.message);
             }
         });
     }

     $scope.select2 = () => {
         setTimeout(() => {
             $('.select2').select2();
         }, 1);
     }

     $scope.dateInputInit = () => {
         if ($('.date').length) {
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

     $scope.sendMessage = () => {
         swal({
                 title: "Thông báo",
                 text: "Bạn có chắc muốn gửi thông báo !",
                 type: "warning",
                 showCancelButton: true,
                 confirmButtonClass: "btn-danger",
                 confirmButtonText: "Xác nhận",
                 cancelButtonText: "Đóng",
                 closeOnConfirm: false,
                 showLoaderOnConfirm: false
             },
             function () {
                 const data_rp = $scope.data_report ? angular.copy($scope.data_report) : '';

                 if (!data_rp || data_rp.data.length == 0) {
                     swal("Thông báo", "Danh sách đánh giá KPI trống", "error");
                     return;
                 }

                 const data_report = data_rp.data;
                 const list_user_report = data_report.filter(item => item.criteria_user_id);
                 const is_complete = list_user_report.every(item => item.status == 2);

                 if (data_rp.send_at) {
                     swal("Thông báo", "Bạn không thể gửi lại tin nhắn", "error");
                     return;
                 }
                 if (!list_user_report.length) {
                     swal("Thông báo", "Danh sách đánh giá KPI trống", "error");
                     return;
                 }

                 if (!is_complete) {
                     swal("Thông báo", "Vui lòng hoàn tất đánh giá KPI trước khi gửi", "error");
                     return;
                 }

                 var data_rq = {
                     'list_user_report': list_user_report,
                     'criteria_store_id': data_rp.kpi_criteria_store_id,
                     'is_send': data_rp.send_at,
                     'month': data_rp.month,
                     'year': data_rp.year

                 }
                 $http.post(base_url + 'Kpi_system/send_message_to_user', JSON.stringify(data_rq)).then(r => {
                     if (r.data.status) {
                         $scope.is_send = true;
                         swal("Thông báo", r.data.message, "success");
                     } else {
                         swal("Thông báo", r.data.message, "error");
                     }
                 })
             });
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
 app.filter('momentFormat', function () {
     return (value, format = 'DD/MM/YYYY HH:mm') => {
         return moment(value, 'YYYY-MM-DD HH:mm:ss').format(format);
     };
 });