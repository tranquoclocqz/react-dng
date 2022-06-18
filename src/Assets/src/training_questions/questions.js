angular.module('app_questions', [])
    .factory('Excel', function ($window) {
        var uri = 
            'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8;base64,',
            template = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" 
            xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets>
            <x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
            </x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>
            `,
            base64 = function (s) { return $window.btoa(unescape(encodeURIComponent(s))); },
            format = function (s, c) { return s.replace(/{(\w+)}/g, function (m, p) { return c[p]; }) };

        return {
            tableToExcel: function (tableId, worksheetName) {
                var table = $(tableId),
                    ctx = { worksheet: worksheetName, table: table.html() },
                    href = uri + base64(format(template, ctx));
                return href;
            }
        };
    })
    .controller('questions', function (Excel, $scope, $http, $compile, $filter) {
        
        $scope.exportToExcel = function (tableId) { // ex: '#my-table'
            var exportHref = Excel.tableToExcel(tableId, 'WireWorkbenchDataExport');
            console.log(exportHref)
            setTimeout(function () { location.href = exportHref; }, 100); // trigger download
        }

        var orderBy = $filter('orderBy');
        var pi = $scope.pagingInfo = {
            itemsPerPage: 50,
            offset: 0,
            to: 0,
            currentPage: 1,
            totalPage: 1,
            total: 0
        };

        $scope.go2Page = function (page) {
            if (page < 0) return;
            var pi = $scope.pagingInfo;
            pi.currentPage = page;
            pi.from = pi.offset = (pi.currentPage - 1) * pi.itemsPerPage;
            $scope.pagingInfo.currentPage = page;
            $scope.get_question();
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

        $scope.init = () => {
            $scope.get_question_type();
            $scope.get_group_question();
            $('.list-stores-tb').css('opacity', '1');
            $scope.get_question();
            $scope.set_btn(1);
            $scope.add_new_question(1);
        }

        $scope.quetions = {
            question: '',
            training_question_type_id: '1',
            image_url: '',
            created_user_id: '',
            active: 1,
            training_question_group_id: '',
        }

        $scope.chois_tab = 1;
        $scope.click_tab = val => {
            $scope.chois_tab = val;
        }

        $scope.add_question = 1;
        $scope.add_new_question = val => {
            $scope.add_question = val;
            $scope.chois_tab = 1;
        }

        $scope.question_answer = '';
        $scope.new_group_question_names = {
            name: '',
            active: 1,
        };

        $scope.set_val_question = () => {
            if ($scope.quetions.question == '') {
                toastr["error"]("Bạn chưa nhập câu hỏi");
                return false;
            }

            if ($scope.quetions.training_question_group_id == '') {
                toastr["error"]("Bạn cần chọn loại câu hỏi");
                $('.group-cauhoi').css('border-color', '#f60');
                return false;
            }
            let data = {
                question: $scope.quetions,
            }
            return (data);
        }
        $scope.add_questions = () => {
            let data = $scope.set_val_question();
            console.log(data);
            if (data) {
                $http.post(base_url + '/Training_questions/add_questions', JSON.stringify(data)).then(r => {
                    if (r && r.data.status == 1) {
                        toastr["success"](r.data.messeger);
                        $scope.get_question();
                        $scope.rs_question();
                    } else toastr["error"]("Đã có lỗi xảy ra!!!");
                });
            }
        }

        $scope.add_questions_ = () => {
            if($scope.quetions.training_question_group_id==''){
                toastr["error"]("Bạn chưa chọn nhóm câu hỏi");
                return;
            }
            if($scope.quetions.training_question_type_id==''){
                toastr["error"]("Bạn chưa chọn loại câu hỏi");
                return;
            }
            let data = {
                question: $scope.quetion_import,
                training_question_group_id : $scope.quetions.training_question_group_id,
                training_question_type_id : $scope.quetions.training_question_type_id,
            }

            $http.post(base_url + '/Training_questions/add_questions_', JSON.stringify(data)).then(r => {
                if (r && r.data.status == 1) {
                    toastr["success"](r.data.messeger);
                    $scope.get_question();
                    $scope.rs_question();
                    $('#show-modal-question').modal('hide');
                } else toastr["error"]("Đã có lỗi xảy ra!!!");
            });
        }

        $scope.update_quetion = () => {
            let data = $scope.set_val_question();
            $http.post(base_url + '/Training_questions/update_questions', JSON.stringify(data)).then(r => {
                if (r && r.data.status == 1) {
                    toastr["success"](r.data.messeger);
                    $scope.get_question();
                    $scope.rs_question();
                } else toastr["error"]("Đã có lỗi xảy ra!!!");
            });
        }

        $scope.type_quetion2 = (id) => {
            $scope.quetions.training_question_type_id = id;
        }

        $scope.quetios_type_check = {
            id: 0,
            name: 'Câu hỏi tự luận',
        }
        $scope.anwser = [];

        $scope.btn_add_stores = () => {
            var arr = [{
                name: $scope.question_answer,
                check: false
            }];

            if ($scope.question_answer !== "") {
                $scope.anwser = [...$scope.anwser, ...arr]
                $scope.question_answer = '';
            } else {
                toastr["error"]("Phải nhập vào dữ liệu!!!");
            }
        }

        $scope.remove_item = (item) => {
            var a = $scope.anwser.indexOf(item);
            $scope.anwser.splice(a, 1);
        }
        $scope.searchtext = '';

        $scope.get_question = () => {
            var data = {
                id_group: $scope.id_type_questinon,
                id_type: $scope.id_group_question,
                searchtext: $scope.searchtext,
                limit: $scope.pagingInfo.itemsPerPage,
                offset: ($scope.pagingInfo.currentPage - 1) * $scope.pagingInfo.itemsPerPage,
            }
            $http.post(base_url + '/Training_questions/get_question', JSON.stringify(data)).then(r => {
                if (r.data.status == 1) {
                    $scope.questions = r.data.data;
                    $scope.pagingInfo.total = r.data.count;
                    $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
                } else toastr["error"]("Đã có lỗi xảy ra!!!");
            })
        }


        $scope.get_question_type = () => {
            $http.get(base_url + '/Training_questions/get_question_type').then(r => {
                if (r.data.status == 1) {
                    $scope.type_quetion = r.data.data;
                } else toastr["error"]("Đã có lỗi xảy ra!!!");
            })
        }

        $scope.get_group_question = () => {
            $http.get(base_url + '/Training_questions/get_group_question').then(r => {
                if (r.data.status == 1) {
                    $scope.group_question_names = r.data.data;
                } else toastr["error"]("Đã có lỗi xảy ra!!!");
            })
        }

        $scope.id_type_questinon = '';
        $scope.id_group_question = '';

        $scope.add_group_question = () => {
            let data = {
                'arr': $scope.new_group_question_names
            };

            $http.post(base_url + '/Training_questions/add_group_question', JSON.stringify(data)).then(r => {
                if (r && r.data.status == 1) {
                    toastr["success"](r.data.messeger);
                    $scope.get_group_question();
                    $scope.new_group_question_names.name = '';
                } else toastr["error"]("Đã có lỗi xảy ra!!!");
            });
        }

        $scope.add_answer = () => {
            $scope.btn_add_stores();
        }

        $scope.update_stores_active_1 = (data) => {
            data = {
                question : {
                    id: data.id,
                    active: data.active=='0'?1:0,
                }
            };
            console.log(data);
            $http.post(base_url + '/Training_questions/update_questions', JSON.stringify(data)).then(r => {
                if (r && r.data.status == 1) {
                    toastr["success"](r.data.messeger);
                } else{
                    toastr["error"]("Đã có lỗi xảy ra!!!");
                    data.active = !data.active;
                } 
            });

        }

        $scope.set_btn = a => {
            if (a == 1) {
                $scope.add_save_btn = {
                    'type': 1,
                    'name': "Thêm câu hỏi"
                };
            } else if (a == 2) {
                $scope.add_save_btn = {
                    'type': 2,
                    'name': "Cập nhật câu hỏi"
                };
            }
        }

        $scope.rs_question = () => {
            $scope.quetions.id = '';
            $scope.quetions.question = '';
            $scope.quetions.image_url = '';
            $scope.quetions.active = 1;
            $scope.quetions.created_user_id = '';
            $scope.anwser = [];
            $scope.set_btn(1);
            select2();
            $scope.new_group_question_names.name = '';
        }

        $scope.edit_question = item2 => {
            $scope.item = angular.copy(item2);
            $('#show-modal-question').modal('show');
            $scope.quetions.question = $scope.item.question;
            $scope.quetions.id = $scope.item.id;
            $scope.quetions.active = $scope.item.active;
            $scope.quetions.image_url = $scope.item.image_url;
            $scope.quetions.training_question_type_id = $scope.item.training_question_type_id;
            $scope.quetions.training_question_group_id = $scope.item.training_question_group_id;
            $scope.quetions.created_user_id = $scope.item.created_user_id;
            select2();
            $scope.set_btn(2);
            $scope.add_new_question(1);
        }

        $scope.add_new_questions = () => {
            $('#show-modal-question').modal('show');
            $scope.rs_question();
        }

        $scope.isChecked_group = false;
        $scope.change_checkbox = () => {
            $scope.isChecked_group = !$scope.isChecked_group;
            $scope.list_question_remove.forEach(item => {
                item.checked = $scope.isChecked_group;
            });
        }

        $scope.data_id = '';
        $scope.delete_question_group = item => {
            $scope.data_id = item;
            let data = {
                'item': item
            }

            swal({
                title: "Bạn có chắc muốn xóa",
                text: "Bạn không thể hoàn nguyên điều này!",
                type: "warning",
                showCancelButton: true,
                cancelButtonText: "Hủy",
                closeOnConfirm: false,
                confirmButtonColor: '#f39c12',
                showLoaderOnConfirm: true
            }, function () {
                $http.post(base_url + '/Training_questions/remove_group_question', JSON.stringify(data)).then(r => {
                    if (r && r.data.status == 1) {
                        toastr["success"](r.data.messeger);
                        $scope.get_group_question();
                        swal("Thông báo!", 'xóa thành công!', "success");

                    } else if (r && r.data.status == 2) {
                        toastr["warning"](r.data.messeger);
                        $scope.list_question_remove = r.data.data;
                        $scope.list_question_remove.forEach(item => {
                            item.question = JSON.parse('[' + item.question + ']');
                            item.checked = false;
                        });
                        $('#show-modal-remove-group').modal('show');
                        swal("Thông báo!", 'Bạn cần xóa các câu hỏi của nhóm trước khi xóa nhóm!', "warning");
                    } else {
                        toastr["error"]("Đã có lỗi xảy ra!!!");
                        swal("Thông báo!", 'đã có lỗi sảy ra!', "error");
                    }
                });
            });
        }

        $scope.set_Checked_group = (item) => {
            item.checked = !item.checked;
        }

        $scope.delete_question = item => {
            var data = {
                'id': item
            }
            swal({
                title: "Bạn có chắc muốn xóa",
                text: "Bạn không thể hoàn nguyên điều này!",
                type: "warning",
                showCancelButton: true,
                cancelButtonText: "Hủy",
                closeOnConfirm: false,
                confirmButtonColor: '#f39c12',
                showLoaderOnConfirm: true
            }, function () {
                $http.post(base_url + '/Training_questions/delete_question', JSON.stringify(data)).then(r => {
                    if (r && r.data.status == 1) {
                        $scope.get_question();
                        toastr["success"](r.data.messeger);
                        swal("Thông báo!", 'Thành công!', "success");
                    } else toastr["error"]("Đã có lỗi xảy ra!!!")
                })
            });
        }

        $scope.get_item_check = (item) => {
            let data = [];
            $scope.list_question_remove.forEach(item => {
                if (item.checked) {
                    data.push(item.id);
                }
            });
            return data;
        }

        $scope.remove_questions_all = () => {
            let data = [];
            $scope.list_question_remove.forEach(item => {
                data.push(item.id);
            });

            $http.post(base_url + '/Training_questions/remove_questions', JSON.stringify(data)).then(r => {
                if (r && r.data.status == 1) {
                    $scope.get_question();
                    $('#show-modal-remove-group').modal('hide');

                    $scope.delete_question_group($scope.data_id);
                } else if (r && r.data.status == 0) {
                    toastr["info"](r.data.messeger);
                } else toastr["error"]("Đã có lỗi xảy ra!!!")
            })

        }

        $scope.remove_questions = () => {
            var data = $scope.get_item_check();
            if (data != '')
                $http.post(base_url + '/Training_questions/remove_questions', JSON.stringify(data)).then(r => {
                    if (r && r.data.status == 1) {
                        $scope.get_question();
                        toastr["success"](r.data.messeger);
                        $('#show-modal-remove-group').modal('hide');
                    } else if (r && r.data.status == 0) {
                        toastr["info"](r.data.messeger);
                    } else toastr["error"]("Đã có lỗi xảy ra!!!")
                })
            else toastr["error"]("Bạn chưa chọn câu hỏi cần xóa!!!")
        }

        $scope.update_stores_active_remove = item => {
            event.preventDefault();
        }


        $scope.edit_user_group = item => {
            $scope.new_group_question_names = item;
        }

        $scope.edit_group_question_names = '';
        $scope.edit_group = item => {
            $('#edit_group').modal('show');
            $('#edit_group input').focus();
            $scope.edit_group_question_names = angular.copy(item);
        }

        $scope.search_question = () => {
            $scope.get_question();
        }

        $scope.update_group_questions = () => {
            if ($scope.edit_group_question_names != '') {
                $http.post(base_url + '/Training_questions/update_group_question', JSON.stringify($scope.edit_group_question_names)).then(r => {
                    if (r && r.data.status == 1) {
                        $scope.get_question();
                        toastr["success"](r.data.messeger);
                        $scope.get_group_question();
                    } else toastr["error"]("Đã có lỗi xảy ra!!!")
                })
            }
        }


        $scope.imageUpload = function (element, type) {
            var files = event.target.files;
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                var reader = new FileReader();
                reader.onload = $scope.imageIsLoaded;
                reader.readAsDataURL(file);
            }
            $scope.saveImage(files, type)
        }


        $scope.saveImage = (files, type) => {
            var formData = new FormData();
            formData.append('file', files[0]);

            $http({
                url: base_url + '/Training_questions/ajax_upload_image_licen',
                method: "POST",
                data: formData,
                headers: {
                    'Content-Type': undefined
                }
            }).then(r => {
                if (r.data.status == 1) {
                    $scope.quetions.image_url = r.data.urlImage;
                } else {
                    toastr["error"]('Tệp không hơp lệ.')
                }
            })
        }

        $scope.delete_question_ = item => {
            // console.log(  $scope.quetion_import);
            $scope.quetion_import.splice($scope.quetion_import.indexOf(item), 1);
            // console.log(  $scope.quetion_import)
        }


        $scope.exelUpload = function (element, type) {
            var files = event.target.files;
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                var reader = new FileReader();
                reader.onload = $scope.imageIsLoaded;
                reader.readAsDataURL(file);
            }
            $scope.saveExel(files, type)
        }

        $scope.delete_import_question = () =>{
            $scope.quetion_import='';
            $scope.add_question = 1;
        }

        $scope.saveExel = (files, type) => {
            var formData = new FormData();
            formData.append('file', files[0]);

            $http({
                url: base_url + '/Training_questions/ajax_upload_exel_licen',
                method: "POST",
                data: formData,
                headers: {
                    'Content-Type': undefined
                }
            }).then(r => {
                if (r.data.status == 1) {
                    $scope.quetion_import = Object.values(r.data.data);
                    $scope.add_question = 0;
                    console.log($scope.quetion_import)
                } else {
                    toastr["error"]('Tệp không hơp lệ.')
                }
            })
        }

        $scope.clear_img = () => {
            $scope.quetions.image_url = '';
        }

        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            if (screen.width <= 768) $scope.is_mobile = true;
            else $scope.is_mobile = false;
        }  else $scope.is_mobile = false;

    }).directive('ngEnter', function () {
        return function (scope, elem, attrs) {
            elem.bind("keydown keypress", function (event) {
                if (event.which === 13) {
                    scope.$apply(function () {
                        scope.$eval(attrs.ngEnter);
                    });
                    event.preventDefault();
                }
            });
        };
    });

function select2() {
    setTimeout(() => {
        $('.select2').select2();
    }, 200);
}