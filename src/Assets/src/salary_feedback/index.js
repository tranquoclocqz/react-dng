app.controller('salary_feedback', function ($scope, $http, $sce) {
    $scope.init = () => {
        $scope.is_handler = 0;
        $scope.allow_edit = allow_edit;
        $scope.feedback_id = feedback.id;
        $scope.salaries = salaries;
        $scope.feedback = feedback;

        $scope.id_current_user = id_current_user;
        $scope.images = [];
        $scope.list_all_user_tag = [];
        $scope.list_user_tag = [];
        $scope.load = false;
        $scope.getResults();
        $scope.getUserJoin();
        $scope.kpi_id = '';
        $scope.list_images = [];
        $scope.obj_new_message = {};
        $scope.loadUploadImage = false;
        $scope.getMessages();
        $scope.ckeditor = CKEDITOR.replace('textboxMessage', {
            uiColor: '#f2f3f5',
            height: '100',
            toolbarGroups: [{
                    name: 'basicstyles',
                    groups: ['basicstyles', 'cleanup']
                },
                {
                    name: 'paragraph',
                    groups: ['list']
                },
                {
                    name: 'links',
                    groups: ['links']
                }
            ]
        });

        $scope.ckeditor.on("instanceReady", function (e) {
            var $frame = $(e.editor.container.$).find(".cke_wysiwyg_frame");
            if ($frame) $frame.attr("title", "");
        });

        setTimeout(() => {
            autoCrollBottom();
        }, 2000);
        select2_img();
        $('#salary_feedback').fadeIn(0);
    }

    $scope.openModalFinish = () => {
        $scope.obj_cofirm = {
            load: false,
            status: 3,
            finish_number: '',
            finish_note: '',
            result_id: '0',
        };
        $('#modal_finish').modal('show');
        select2_img(200);
    }

    $scope.openKpi = () => {
        if ($scope.kpi_id === '') {
            $scope.getLinkKpi();
        } else {
            if ($scope.kpi_id == 0) {
                showMessErr('Không tìm thấy Chi tiết đánh giá KPI của nhân viên này');
                return;
            }
            window.open(base_url + 'kpi_system/set_kpi_user_detail?id=' + $scope.kpi_id);
        }
    }

    $scope.getLinkKpi = () => {
        $scope.load_kpi = true;
        var data_rq = {
            'salaries_id': feedback.salaries_id,
            'user_id': feedback.user_id
        };
        $http.get(base_url + 'salary_feedback/ajax_get_kpi_user_detai_by_feedback?' + $.param(data_rq)).then(r => {
            $scope.load_kpi = false;
            if (r.data.status) {
                $scope.kpi_id = r.data.data;
                $scope.openKpi();
            } else {
                showMessErr(r.data.message);
            }
        }, function (data, status, headers, config) {
            showMessErrSystem()
        });
    }

    $scope.getUserJoin = () => {
        $scope.load = true;
        $http.get(base_url + 'salary_feedback/ajax_get_feedback_users?feedback_id=' + $scope.feedback_id).then(r => {
            $scope.load = false;
            if (r.data.status) {
                var data = r.data.data,
                    is_handler = 0;
                $.each(data.handlers, function (index, value) {
                    if (value.id == id_current_user) {
                        is_handler = 1;
                        return true;
                    }
                });
                $scope.is_handler = is_handler;
                $scope.handlers = data.handlers;
                $scope.followers = data.followers;
                $scope.list_all_user_tag = data.all;
            } else {
                showMessErr(r.data.message);
            }
        }, function (data, status, headers, config) {
            showMessErrSystem()
        });
    }

    $scope.openModalAddUser = (type) => {
        $scope.obj_search_user = {
            show_rs: false,
            key: '',
            not_id: [],
            list: [],
            type: type
        };
        $('#modal_add_user').modal('show');
        setTimeout(() => {
            $('#search-user').trigger('focus');
        }, 300);
    }

    $scope.removeUser = (user, type) => {
        var item = angular.copy(user);
        Swal.fire({
            title: 'Bạn có chắc?',
            text: 'Xóa nhân viên này',
            icon: 'warning',
            showCancelButton: true,
            cancelButtonText: 'Hủy',
            confirmButtonText: 'Đồng ý',
            allowOutsideClick: false,
            showLoaderOnConfirm: true,
            preConfirm: function () {
                return new Promise(function (resolve, reject) {
                    $scope.$apply(function () {
                        $scope._removeUser(item, type);
                    });
                });
            },
        }).then(function () {});
    }

    $scope._removeUser = (user, type) => {
        $scope.load = true;
        $http.post(base_url + 'salary_feedback/ajax_remove_feedback_user', {
            feedback_id: $scope.feedback_id,
            user_id: user.id,
            type: type == 'handler' ? 1 : 2
        }).then(r => {
            $scope.load = false;
            if (r.data.status == 1) {
                showMessSuccess();
                Swal.close();
                $scope.getUserJoin();
            } else {
                Swal.fire('', r.data.message, 'error');
            }
        })
    }

    $scope.chooseUser = (user) => {
        var item = angular.copy(user);
        Swal.fire({
            title: 'Bạn có chắc?',
            text: 'Thêm nhân viên này',
            icon: 'warning',
            showCancelButton: true,
            cancelButtonText: 'Hủy',
            confirmButtonText: 'Đồng ý',
            allowOutsideClick: false,
            showLoaderOnConfirm: true,
            preConfirm: function () {
                return new Promise(function (resolve, reject) {
                    $scope.$apply(function () {
                        $scope._chooseUser(item);
                    });
                });
            },
        }).then(function () {});
    }

    $scope._chooseUser = (user) => {
        $scope.load = true;
        $http.post(base_url + 'salary_feedback/ajax_add_feedback_user', {
            feedback_id: $scope.feedback_id,
            user_id: user.id,
            type: $scope.obj_search_user.type == 'handler' ? 1 : 2
        }).then(r => {
            $scope.load = false;
            if (r.data.status == 1) {
                showMessSuccess();
                Swal.close();
                $scope.getUserJoin();
                $scope.obj_search_user.key = '';
            } else {
                Swal.fire('', r.data.message, 'error');
            }
        })
    }

    $scope.hideRsFilterUser = () => {
        setTimeout(() => {
            $scope.obj_search_user.show_rs = false;
            $scope.$apply();
        }, 250)
    }

    $(document).on('focus', '#search-user', function () {
        setTimeout(() => {
            $scope.obj_search_user.show_rs = true;
            $scope.$apply();
        }, 0)
    })

    $scope.searchUser = () => {
        var key = $scope.obj_search_user.key;
        if (key.length < 4) return true;

        if ($scope.filter_timer) {
            clearTimeout($scope.filter_timer);
        }
        $scope.filter_timer = setTimeout(() => {
            $scope._searchUser();
        }, 350);
    }

    $scope._searchUser = () => {
        $scope.obj_search_user.load = true;
        var not_ids = angular.copy($scope.obj_search_user.type == 'handler' ? $scope.handlers : $scope.followers),
            data_rq = {
                key: $scope.obj_search_user.key,
                not_ids: not_ids.map(x => x.id)
            };
        $http.get(base_url + 'admin_users/ajax_search_user_by_key?' + $.param(data_rq)).then(r => {
            if (r.data.status) {
                var data = r.data.data;
                $scope.obj_search_user.list = data;
            } else {
                showMessErr(r.data.message);
            }
            $scope.obj_search_user.load = false;
        }, function (data, status, headers, config) {
            showMessErrSystem()
        });
    }

    $scope.changeSatus = (status) => {
        Swal.fire({
            title: 'Bạn có chắc?',
            text: 'Chuyển trạng thái về ' + (status == 2 ? 'Đang xử lý' : 'Hủy'),
            icon: 'warning',
            showCancelButton: true,
            cancelButtonText: 'Hủy',
            confirmButtonText: 'Đồng ý',
            allowOutsideClick: false,
            showLoaderOnConfirm: true,
            preConfirm: function () {
                return new Promise(function (resolve, reject) {
                    $scope.$apply(function () {
                        $scope._changeSatus(status);
                    });
                });
            },
        }).then(function () {});
    }

    $scope._changeSatus = (status) => {
        $http.post(base_url + 'salary_feedback/ajax_update_status', {
            feedback_id: $scope.feedback_id,
            status: status
        }).then(r => {
            $scope.load = false;
            if (r.data.status == 1) {
                showMessSuccess();
                $scope.feedback = r.data.data.item;
                Swal.close();
            } else {
                Swal.fire('', r.data.message, 'error');
            }
        })
    }

    $scope.openSalaryTemp = () => {
        $('#modal_salary_temp').modal('show');
        $scope.obj_salary_temp = {
            load: true,
            html: ''
        };
        var data_rq = {
            salaries_id: salaries.id,
            user_id: feedback.user_id,
            feedback_id: feedback.id,
            type: 1
        };
        $http.get(base_url + 'salary_feedback/ajax_get_salary_detail?' + $.param(data_rq)).then(r => {
            $scope.obj_salary_temp.load = false;
            if (r.data.status == 1) {
                $scope.obj_salary_temp.salary = r.data.data;
            } else {
                showMessErr(r.data.message);
            }
        });
    }

    $scope.showTextValue = (value) => {
        if (!isNaN(value)) {
            return parseNumberIsFloat(value);
        }
        return value;
    }

    $scope.diffDate = (start, end) => {
        var obj = moment.utc(moment(end, "YYYY-MM-DD HH:mm:ss").diff(moment(start, "YYYY-MM-DD HH:mm:ss"))),
            day = obj.format("DD"),
            str_day = '';
        if (day > 1) {
            str_day = day;
        } else {
            str_day = 0;
        }
        return str_day + ' ngày ' + obj.format("HH:mm") + ' phút';
    }

    $scope.getResults = () => {
        $scope.load = true;
        $http.get(base_url + 'salary_feedback/ajax_get_salary_feedback_results?feedback_id=' + $scope.feedback_id).then(r => {
            $scope.load = false;
            if (r.data.status == 1) {
                $scope.list_results = r.data.data;
            } else {
                showMessErr(r.data.message);
            }
            select2_img();
        });
    }

    $scope.saveResult = () => {
        var data_rq = angular.copy($scope.obj_cofirm);
        if (data_rq.status == $scope.feedback.status && data_rq.result_id == $scope.feedback.result_id) {
            showMessErr('Chưa tìm thấy sự thay đổi dữ liệu để thực hiện hành động này');
            return;
        }
        if (data_rq.status == 3) {
            if (!Number(data_rq.result_id)) {
                showMessErr('Chọn kết quả phản hồi trước khi muốn Hoàn tất');
                return;
            }
            if (!data_rq.finish_note) {
                showMessErr('Nhập lý do kết thúc phản hồi');
                return;
            }
        }
        data_rq.feedback_id = $scope.feedback_id;
        data_rq.finish_number = formatDefaultNumber(data_rq.finish_number);
        $scope.obj_cofirm.load = true;
        $http.post(base_url + 'salary_feedback/ajax_update_status', data_rq).then(r => {
            $scope.obj_cofirm.load = false;
            if (r.data.status) {
                showMessSuccess();
                $scope.feedback = r.data.data.item;
                $('#modal_finish').modal('hide');
            } else {
                showMessErr(r.data.message);
            }
        })
    }

    $scope.getMessages = () => {
        $scope.loadMessage = true;
        $http.get(base_url + 'salary_feedback/ajax_get_messages?feedback_id=' + $scope.feedback_id).then(r => {
            $scope.loadMessage = false;
            if (r.data.status == 1) {
                $scope.list_message = r.data.data;
                $scope.list_images = [];
                $scope.list_message.forEach((item) => {
                    item.image_url = item.image_url ? JSON.parse(item.image_url) : [];
                    if (item.image_url.length) {
                        $scope.list_images = $scope.list_images.concat(item.image_url)
                    }
                })
            } else {
                showMessErr(r.data.message);
            }
        });
    }

    $scope.sendMessage = () => {
        $scope.obj_new_message.content = CKEDITOR.instances.textboxMessage.getData();

        let tag = [];
        $scope.list_user_tag.forEach(e => {
            $scope.obj_new_message.content = $scope.obj_new_message.content + '';
            if ($scope.obj_new_message.content.search(`value="${e.id}"`) >= 0) {
                tag.push(e);
            };
        })
        if (($scope.obj_new_message.content && $scope.obj_new_message.content != '') || ($scope.images && $scope.images.length > 0)) {
            $scope.obj_new_message.user_id = $scope.id_current_user;
            $scope.obj_new_message.feedback_id = $scope.feedback_id;
            $scope.obj_new_message.image_url = $scope.images;
            $scope.obj_new_message.ls_user_tag = tag;
            $scope.list_user_tag = [];
            $scope.images = [];
            $scope.sending = true;
            $http.post(base_url + 'salary_feedback/ajax_insert_messages', $scope.obj_new_message).then(r => {
                $scope.sending = false;
                if (r.data.status == 1) {
                    $scope.getMessages();
                    $scope.remove_image();
                    $scope.obj_new_message.content = '';
                    autoCrollBottom();
                    $scope.feedback = r.data.data.item;
                }
            })
        }
        CKEDITOR.instances.textboxMessage.setData('');
    }

    $scope.attachFile = () => {
        $('#ip-img').click();
    }

    $scope.imageUpload = function (event) {
        $scope.loadUploadImage = true;
        var formData = new FormData();
        var files = event.target.files;
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var reader = new FileReader();
            reader.onload = $scope.imageIsLoaded;
            reader.readAsDataURL(file);
            formData.append("file[]", files[i]);
        }
        formData.append('multiple', 'multiple');
        $http({
            url: base_url + 'uploads/ajax_upload_to_filehost?folder=salary_feed_back_message',
            method: "POST",
            data: formData,
            headers: {
                'Content-Type': undefined
            }
        }).then(r => {
            $scope.loadUploadImage = false;
            if (r.data.status == 1) {
                r.data.data.forEach(element => {
                    $scope.images.push(element);
                });
            } else {
                showMessErr(r.data.message);
            }

        })
    }

    $scope.deleteImagePreview = (index) => {
        $scope.images.splice(index, 1);
    }

    $scope.formatDateToTime = (date, type) => {
        return moment(date).format(type)
    }

    $scope.converHtml = (htmlbd) => {
        return $sce.trustAsHtml(htmlbd);
    }

    function autoCrollBottom() {
        $('.messages').animate({
            scrollTop: $('.messages').get(0).scrollHeight
        }, 1500);
    }

    $scope.remove_image = () => {
        $scope.images = [];
    }

    $scope.handleTagName = (item) => {
        var newElement = CKEDITOR.dom.element.createFromHtml(`<span style="color: #1479fb;" value="${item.id}" >@${item.fullname}</span> `, $scope.ckeditor.document);
        CKEDITOR.instances.textboxMessage.insertElement(newElement);
        $scope.list_user_tag.push(item);
    }

    $scope.showImgInMess = (imgs) => {
        $scope.list_img_in_modal = imgs;
        $('#modal_img').modal('show');
    }

    $scope.showZoomImg = showZoomImg;
    $scope.parseNumber = parseNumber;

    $scope.checkShow = (type) => {
        if (['salary_temp', 'kpi'].includes(type)) {
            if ($scope.is_handler || allow_edit || feedback.user_id == id_current_user) {
                return true;
            }
        }
        return false;
    }
})

app.filter('momentFormat', function () {
    return (value, format = 'DD/MM/YYYY HH:mm') => {
        return moment(value, 'YYYY-MM-DD HH:mm:ss').format(format);
    };
});