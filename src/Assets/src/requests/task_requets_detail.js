app.controller('accountCtrl', function($scope, $http, $sce) {
    $scope.init = () => {
        $scope.current_user_id = current_user_id;
        $scope.idTask = idTask;
        $scope.curentUser = null;
        $scope.lsMessage = [];
        $scope.lsCustomer = [];
        $scope.newMessage = {};
        $scope.task = {};
        $scope.selectedPersonProcess = [];
        $scope.nationId = 0;
        $scope.is_popup = '';
        $scope.images = [];
        $scope.fnimg = [];
        $scope.userHandleComplain = [];
        $scope.penance = {};
        $scope.userJoinComplainAll = [];
        $scope.ls_images = [];
        $scope.parents_id = 0;
        $scope.lsUser = [];
        $scope.lsAllUser = [];
        $scope.lsAllUserTag = [];
        $scope.lsUserTag = [];
        $scope.upimg = [];
        $scope.imgInsert = [];
        $scope.isUser = 0;
        $scope.load = 0;
        $scope.penance.formality = 1;
        $scope.isUserHandler = 0; // người xử lý
        $scope.isDev = isDev ? isDev : 0;
        $scope.isAccountant = isAccountant ? isAccountant : 0;
        $scope.hasRoleUpdateSuccess = 0; // có quyền cập nhật trạng thái về đã duyệt
        $scope.priceAdvance = 0; // số tiền còn lại của tạm ứng
        $scope.isGroup = isGroup;
        $scope.role_task_request = role_task_request;
        $scope.isStore = isStore.toString();
        $scope.addFile = 0;
        getMessage();
        getTask();
        getUserJoinTask();
        $scope.oldComplains = [];
        $('.alert-dismissible').css('display', 'none');
        $scope.ckeditor = CKEDITOR.replace('textboxMessage', {
            uiColor: '#f2f3f5',
            // removePlugins: 'toolbar',
            height: '100',
            toolbarGroups: [
                { name: 'basicstyles', groups: ['basicstyles', 'cleanup'] },
                { name: 'paragraph', groups: ['list'] },
                { name: 'links', groups: ['links'] }
            ]
        });
        $scope.ckeditor.on("instanceReady", function(e) {
            var $frame = $(e.editor.container.$).find(".cke_wysiwyg_frame");
            if ($frame) $frame.attr("title", "");
        });
        setTimeout(() => {
            $scope.getStore();
        }, 1000);
        setTimeout(() => {
            autoCrollBottom();
            $scope.ckeditor.on('keyup', function(event) {
                alert(e.getData());
            });
        }, 2000);


    }

    $scope.handleTagName = (item) => {
        var newElement = CKEDITOR.dom.element.createFromHtml(`<span style="color: #1479fb;" value="${item.id}" >@${item.user_name}</span> `, $scope.ckeditor.document);
        CKEDITOR.instances.textboxMessage.insertElement(newElement);
        $scope.lsUserTag.push(item);
    }

    $scope.formatDateToTime = (date, type) => {
        return moment(date).format(type)
    }

    $scope.showImg = (img) => {
        console.log(img);
        $scope.currImg = img;
    }

    $scope.trustAsHtml = function(value) {
        return $sce.trustAsHtml(value.note);
    }

    //hander image --------
    $scope.attachFile = () => {
        $('#ip-img').click();
    }

    $scope.imageUpload = function(event) {
        $scope.loadUploadImage = true;
        var formData = new FormData();
        var files = event.target.files;
        if (files.length > 0) {
            for (var i = 0; i < files.length; i++) {
                formData.append("file[]", files[i]);
            }
            $http.post(base_url + '/requests/images', formData, {
                headers: { 'Content-Type': undefined }
            }).then(r => {
                if (r.data && r.data.status == 1) {
                    r.data.data.forEach(element => {
                        $scope.images.push(element);
                    });
                } else {
                    toastr["error"](r.data.message ? r.data.message : 'Có lổi xẩy ra. Vui lòng thử lại!');
                }
                $scope.loadUploadImage = false;
            }).catch(e => {
                toastr['error']("Đã có lỗi máy chủ API hình");
                $scope.loadUploadImage = false;
            });
        }
    }

    $scope.attachFileUpdate = () => {
        $('#file_update').click();
    }

    $scope.imageUploadUpdate = () => {
        $scope.loadUploadImage = true;
        var formData = new FormData();
        var files = event.target.files;
        if (files.length > 0) {
            for (var i = 0; i < files.length; i++) {
                formData.append("file[]", files[i]);
            }

            $http.post(base_url + '/requests/images', formData, {
                headers: { 'Content-Type': undefined }
            }).then(r => {
                if (r.data && r.data.status == 1) {
                    r.data.data.forEach(element => {
                        $scope.imageUpdate.push(element);
                    });
                } else {
                    showMessErr(r.data.message)
                }
                $scope.loadUploadImage = false;
            }).catch(e => {
                showMessErr("Đã có lỗi máy chủ API hình");
                $scope.loadUploadImage = false;
            });
        }
    }

    $scope.delete_image_update = (index) => {
        $scope.imageUpdate.splice(index, 1);
    }

    $scope.image_delete = (index) => {
        $scope.images.splice(index, 1);
    }

    $scope.remove_image = () => {
            $scope.images = [];
        }
        //end hander image --------

    function getMessage() {
        $http.post(base_url + 'requests/get_task_requets_detail_message', $scope.idTask).then(r => {
            $scope.lsMessage = (r.data.status == 1) ? r.data.data : [];
            $.each($scope.lsMessage, function(key, value) {
                if ($scope.lsMessage[key].image_url != '') {
                    $scope.lsMessage[key].image_url = JSON.parse($scope.lsMessage[key].image_url);
                    if ($scope.lsMessage[key].image_url.length > 0) {
                        $scope.lsMessage[key].image_url.forEach(function(val) {
                            $scope.ls_images.push(val);
                        });
                    }
                }
            })
        });

    }

    function getTask() {
        $scope.isUserConfirm = 0;
        $scope.isConfirm = 0;

        $http.post(base_url + 'requests/get_task_requets_detail', $scope.idTask).then(r => {
            $scope.isResult = 0;
            $scope.task = r.data ? r.data : {};
            $scope.task.image_children = [];
            if ($scope.task.image_finished) {
                $scope.task.image_finished = JSON.parse($scope.task.image_finished);
            } else {
                $scope.task.image_finished = [];
            }
            if ($scope.task.image_url) {
                $scope.task.image_url = JSON.parse($scope.task.image_url);
            } else {
                $scope.task.image_url = [];
            }
            $scope.task.pay_note = JSON.parse($scope.task.pay_note);
            if ($scope.task.price > 0) {
                $scope.task.price = $scope.viewPrice($scope.task.price);
            }
            if ($scope.lsAllUserTag.length == 0) {
                $scope.lsAllUserTag.push($scope.task.user_created);
            }
            if ($scope.lsAllUserTag.length > 0) {
                let err = true;
                $.each($scope.lsAllUserTag, function(k, v) {
                    if ($scope.task.user_id == v.id) {
                        err = false;
                    }
                });
                if (err == true) {
                    $scope.lsAllUserTag.push($scope.task.user_created);
                }
            }
            if ($scope.lsAllUserTag.length > 0 && $scope.task.user_id != $scope.task.user_confirm_id && $scope.task.user_confirm_id > 0) {
                let err = true;
                $.each($scope.lsAllUserTag, function(k, v) {
                    if ($scope.task.user_confirm_id == v.id) {
                        err = false;
                    }
                });
                if (err == true) {
                    $scope.lsAllUserTag.push($scope.task.manager_created);
                }
            }

            // thêm danh sách người duyệt vào tag comment
            $scope.lsAllUserTag = arrayUniqueByKey([...$scope.lsAllUserTag, ...$scope.task.list_user_confirm]);

            $.each($scope.task.list, function(key, value) {
                let err = true;
                if (value.id == current_user_id) {
                    $scope.isUser = 1;
                    $scope.isUser_Admin = 1;
                }
            });

            if ($scope.task.type == 5) { // số tiền còn lại của tạm ứng sau khi trừ đi số tiền quyết toán và hoàn ứng
                $scope.priceAdvance = parseInt($scope.task.price.replaceAll(',', ''));
            }

            $.each($scope.task.result, function(key, value) { // danh sách phiếu con
                if (value.img != "") {
                    $scope.task.result[key].img = JSON.parse(value.img);
                } else {
                    $scope.task.result[key].img = [];
                }
                $scope.task.result[key].pay_note = JSON.parse($scope.task.result[key].pay_note);
                if ($scope.task.result[key].status != 4 && $scope.task.result[key].status != 5) {
                    $scope.isResult = 1;
                }
                if ($scope.task.result[key].price > 0) {
                    $scope.task.result[key].price = $scope.viewPrice($scope.task.result[key].price);
                }
                let err = true;
                $.each($scope.lsAllUserTag, function(k, v) {
                    if (value.user_confirm_id == v.id) {
                        err = false;
                    }
                });
                if (err == true) {
                    $scope.array_rs = [];
                    $scope.array_rs['id'] = value.id;
                    $scope.array_rs['image_url'] = value.image_url;
                    $scope.array_rs['store_name'] = value.store_name;
                    $scope.array_rs['user_name'] = value.user_name;
                    $scope.array_rs['wp_id'] = value.wp_id;
                    $scope.lsAllUserTag.push($scope.array_rs);
                }
                $.each($scope.task.result[key].img, function(k, v) {
                    $scope.task.image_children.push(v);
                });

                // Quyền thêm người duyệt vào phiếu con
                $scope.task.result[key].hasRoleAddUserConfirm = 0
                $.each($scope.task.result[key].user_confirm_child, function(k, v) {
                    if (v.id == current_user_id) {
                        $scope.task.result[key].hasRoleAddUserConfirm = 1;
                        return false;
                    }
                });

                // quyền được duyệt phiếu con 
                $scope.task.result[key].hasConfirm = 0
                $.each($scope.task.result[key].user_confirm_child, function(k, v) {
                    if (v.id == current_user_id && v.confirm_date != null) {
                        $scope.task.result[key].hasConfirm = 1;
                        return false;
                    }
                });

                // tính số ngày từ khi đã hoàn thành phiếu
                $scope.task.result[key].diffDays = 0;
                if (value.status == 4 && value.request_finished_date) {
                    let date1 = new Date(value.request_finished_date);
                    let curretDate = new Date();
                    let diffTime = Math.abs(curretDate - date1);
                    let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    $scope.task.result[key].diffDays = diffDays;
                }

                if (value.status != 1 && value.status != 4 && value.status != 5) {
                    $scope.addFile = 1;
                }

                if (value.status == 4 && value.status == 4) {
                    $scope.priceAdvance = $scope.priceAdvance - parseInt(value.price.replaceAll(',', ''));
                }

            });

            $.each($scope.task.finalizations, function(key, value) { // danh sách phiếu quyết toán và hoàn ứng
                $scope.task.finalizations[key].img
                if (value.image_url != "") {
                    $scope.task.finalizations[key].img = JSON.parse(value.image_url);
                }

                $.each($scope.task.finalizations[key].img, function(k, v) {
                    $scope.task.image_children.push(v);
                });

                if (value.status != 4) {
                    $scope.priceAdvance = $scope.priceAdvance - parseInt(value.price.replaceAll(',', ''));
                }

                // Quyền thêm người duyệt vào phiếu con của quyết toán
                $scope.task.finalizations[key].hasRoleAddUserConfirm = 0
                $.each($scope.task.finalizations[key].user_confirm_child, function(k, v) {
                    if (v.id == current_user_id) {
                        $scope.task.finalizations[key].hasRoleAddUserConfirm = 1;
                        return false;
                    }
                });

                // quyền được duyệt phiếu con của quyết toán
                $scope.task.finalizations[key].hasConfirm = 0
                $.each($scope.task.finalizations[key].user_confirm_child, function(k, v) {
                    if (v.id == current_user_id && v.confirm_date != null) {
                        $scope.task.finalizations[key].hasConfirm = 1;
                        return false;
                    }
                });

                // tính số ngày từ khi đã hoàn thành phiếu
                $scope.task.finalizations[key].diffDays = 1;
                if (value.status == 3 && value.date_finished) {
                    let date1 = new Date(value.date_finished);
                    let curretDate = new Date();
                    let diffTime = Math.abs(curretDate - date1);
                    let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    $scope.task.finalizations[key].diffDays = diffDays;
                }
            });

            $scope.task.list_user_confirm.forEach(e => {
                if (e.id == current_user_id && e.confirm_date != null) {
                    $scope.isUserConfirm = 1;
                    return false;
                }
            });

            $scope.task.list_user_confirm.forEach(e => { // nếu user trong danh sách người duyệt
                if (e.id == current_user_id) {
                    $scope.isConfirm = 1;
                    return false;
                }
            });


            if ($scope.current_user_id == $scope.task.user_id) {
                $scope.isAdmin = 1;
            }

        });
    }

    $scope.formatNumber = (num) => {
        return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    }

    function getUserJoinTask() {
        $http.post(base_url + 'requests/get_task_requets_detail_users', $scope.idTask).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.lsAllUser = [];
                $scope.lsUser = [];
                $.each(r.data.data, function(key, value) {
                    if (value.type == 1) {
                        $scope.lsAllUser.push(value);
                    } else {
                        $scope.lsUser.push(value);
                    }
                    let err = true;
                    if (value.id == current_user_id && value.type == 2) {
                        $scope.isUser = 1;
                    }
                    $.each($scope.lsAllUserTag, function(k, v) {
                        if (value.id == v.id) {
                            err = false;
                        }
                    });
                    if (err == true) {
                        $scope.lsAllUserTag.push(value);
                    }
                });

                $scope.lsAllUser.forEach(e => {
                    if ($scope.current_user_id == e.id) {
                        $scope.isUserHandler = 1;
                        return false;
                    }
                });

                $scope.lsAllUser.forEach(e => {
                    if ($scope.role_task_request.includes(e.id)) {
                        $scope.hasRoleUpdateSuccess = 1;
                        return false;
                    }
                });
            }
        });
    }

    $scope.getListUserConfirmChild = () => {
        $http.post(base_url + 'requests/ajax_get_list_user_confirm', $scope.idChild).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.list_user_confirm_child = r.data.data;
            }
        });
    }

    $scope.getListUserConfirmChildFinalization = () => {
        $http.post(base_url + 'requests/ajax_get_list_user_confirm_finalization', $scope.idChild).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.list_user_confirm_child = r.data.data;
            }
        });
    }

    $scope.sendMessage = () => {
        $scope.newMessage.note = CKEDITOR.instances.textboxMessage.getData();
        let tag = [];
        $scope.lsUserTag.forEach(e => {
            $scope.newMessage.note = $scope.newMessage.note + '';
            if ($scope.newMessage.note.search(`value="${e.id}"`) >= 0) {
                tag.push(e);
            };
        })
        if (($scope.newMessage.note && $scope.newMessage.note != '') || ($scope.images && $scope.images.length > 0)) {
            $scope.newMessage.user_id = $scope.current_user_id;
            $scope.newMessage.task_request_id = $scope.idTask;
            $scope.newMessage.image_url = $scope.images;
            $scope.newMessage.ls_user_tag = tag;
            $scope.lsUserTag = [];
            $http.post(base_url + 'requests/insert_message_task_requets', $scope.newMessage).then(r => {
                getMessage();
                $scope.remove_image();
                $scope.newMessage.note = '';
                autoCrollBottom();
                if (tag.length > 0) {
                    $scope.sendMail($scope.newMessage);
                }
            })
        }
        CKEDITOR.instances.textboxMessage.setData('');
    }

    $scope.sendMail = (data) => {
        $http.post(base_url + 'requests/send_message_task_requets', data).then(r => {})
    }

    $scope.showModalfinalization = () => {
        $scope.loadSubmitForm = false;
        $scope.search_note = {};
        $scope.list_note_search = [];
        $scope.list_user_confirm_finalization = [];
        $scope.finalization = {};
        $scope.finalization.type = 1;
        $scope.isStepFinalization = 1;
        $scope.finalization.pay = $scope.task.pay;
        $scope.finalization.pay_for_type = $scope.task.pay_for_type;
        $scope.finalization.bank_pay = $scope.task.pay_note[2];
        $scope.finalization.name_pay = $scope.task.pay_note[1];
        $scope.finalization.number_pay = $scope.task.pay_note[0];
        $scope.finalization.construction_id = $scope.task.construction_id;
        $scope.finalization.supplier_id = $scope.task.supplier_id;
        $scope.finalization.store_id = $scope.task.store_id;
        $scope.finalization.title = $scope.task.title;
        $scope.finalization.main_group_id = $scope.isGroup;

        $scope.list_search_supplier = [];
        $scope.search_supplier = {};
        $scope.search_supplier.tax_code = $scope.task.supplier_tax_code;
        $scope.search_supplier.name = $scope.task.supplier_name;
        $scope.search_supplier.phone = $scope.task.supplier_phone;
        $scope.list_search_construction = [];
        $scope.search_construction = {};
        $scope.search_construction.name = $scope.task.construction_name;
        $scope.search_construction.code = $scope.task.construction_code;

        $scope.get_current_user_bank();

        select2();
    }

    $scope.chooseUserSearchFinalization = (item) => {
        let dem = $scope.list_user_confirm_finalization.filter(i => i.id == item.id);
        if (dem.length == 0) {
            $scope.list_user_confirm_finalization.unshift(item);
        }
        $scope.list_user_confirm_finalization.forEach((element) => {
            dem = $scope.list_user_confirm_finalization.filter(i => i.id == element.id);
            if (dem.length == 0) {
                element.type = 0;
            } else {
                element.type = 1;
            }
        });

        $scope.removeUserList();
    }

    $scope.chooseUserSearchPaymentChild = (item) => {
        let dem = $scope.list_user_confirm.filter(i => i.id == item.id);
        if (dem.length == 0) {
            $scope.list_user_confirm.unshift(item);
        }
        $scope.list_user_confirm.forEach((element) => {
            dem = $scope.list_user_confirm.filter(i => i.id == element.id);
            if (dem.length == 0) {
                element.type = 0;
            } else {
                element.type = 1;
            }
        });

        $scope.removeUserList();
    }

    $scope.nextFinalization = (view) => {
        if ($scope.finalization.type == '') {
            return toastr['error']("Vui lòng chọn hình thức!");
        }
        $scope.isStepFinalization = view;
    }

    $scope.createTaskRequestChild = () => {
        if (!$scope.finalization.price || $scope.finalization.price == '') {
            return toastr["error"]('Vui lòng nhập số tiền!');
        }

        var price = formatDefaultNumber($scope.finalization.price);
        if (price == 0) {
            return toastr["error"]('Vui lòng nhập số tiền khác 0');
        }
        if ($scope.finalization.type == 1) {

            if (price > $scope.priceAdvance) {
                return toastr["error"]('Số tiền không thể lớn hơn số tiền còn lại của tạm ứng!');
            }
        }

        if ($scope.finalization.type == 2 && $scope.finalization.price.replaceAll(',', '') > $scope.priceAdvance) {
            return toastr["error"]('Số tiền hoàn ứng không thể lớn hơn số tiền công nợ');
        }

        $scope.finalization.parents_id = $scope.idTask;
        if ($scope.list_user_confirm_finalization.length <= 0 && $scope.finalization.type != 2) {
            return toastr["error"]('Vui lòng bạn chọn người duyệt');
        }

        if (!$scope.finalization.note || $scope.finalization.note == '') {
            return toastr["error"]('Vui lòng nhập nội dung!');
        }

        if ($scope.list_user_confirm_finalization.length > 0) {
            $scope.finalization.list_user_confirm_finalization = [];
            $scope.list_user_confirm_finalization.forEach(element => {
                $scope.finalization.list_user_confirm_finalization.push(element.id);
            });
        }

        $scope.loadSubmitForm = true;
        let fd = new FormData();
        let url_post;
        fd.append('data', JSON.stringify($scope.finalization));
        fd.append('data_img', JSON.stringify($scope.images));
        url_post = 'ajax_task_request_finalization';
        $http.post(base_url + '/requests/' + url_post, fd, {
            headers: { 'Content-Type': undefined }
        }).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.remove_insert();
                toastr["success"](r.data.message ? r.data.message : 'Thành công!');
                $scope.images = [];
                getTask();
                $('#modal_finalization').modal('hide');
                $scope.finalization.idTask = $scope.idTask;
                $scope.finalization.user_created_id = $scope.current_user_id;
                $scope.sendWpCreateFinalization($scope.finalization);
            } else {
                toastr["error"](r.data.message ? r.data.message : 'Có lổi xẩy ra. Vui lòng thử lại!');
                $('#addOrder').modal('hide');
                $scope.load = 0;
            }
            $scope.loadSubmitForm = true;
        });
    }

    $scope.showModalPaymentChild = () => {
        $scope.loadSubmit = false;
        $scope.search_note = {};
        $scope.list_note_search = [];
        $scope.list_user_confirm_finalization = [];
        $scope.finalization = {};
        $scope.finalization.type = 3;
        $scope.finalization.pay = $scope.task.pay;
        $scope.finalization.pay_for_type = $scope.task.pay_for_type;
        $scope.finalization.bank_pay = $scope.task.pay_note[2];
        $scope.finalization.name_pay = $scope.task.pay_note[1];
        $scope.finalization.number_pay = $scope.task.pay_note[0];
        $scope.finalization.construction_id = $scope.task.construction_id;
        $scope.finalization.supplier_id = $scope.task.supplier_id;
        $scope.finalization.store_id = $scope.isStore;
        $scope.finalization.title = $scope.task.title;
        $scope.finalization.main_group_id = $scope.isGroup;

        if (!$scope.finalization.supplier_id || $scope.finalization.supplier_id == 0) {
            $scope.finalization.pay = '2';
            $scope.finalization.pay_for_type = '2';
        }

        $scope.list_search_supplier = [];
        $scope.search_supplier = {};
        $scope.search_supplier.tax_code = $scope.task.supplier_tax_code;
        $scope.search_supplier.name = $scope.task.supplier_name;
        $scope.search_supplier.phone = $scope.task.supplier_phone;
        $scope.list_search_construction = [];
        $scope.search_construction = {};
        $scope.search_construction.name = $scope.task.construction_name;
        $scope.search_construction.code = $scope.task.construction_code;

        $scope.get_current_user_bank();

        $('#modal_task_child').modal('show');
        select2();
    }

    // thêm phiếu thanh toán con
    $scope.createTaskPaymentChild = () => {
            if (!$scope.finalization.title || $scope.finalization.title == '') {
                return toastr["error"]('Vui lòng nhập tiêu đề!');
            }

            let number = Number($scope.finalization.price);
            if (number == 0) {
                return toastr["error"]('Vui lòng nhập số tiền!');
            }

            if ($scope.list_user_confirm_finalization.length == 0) {
                return toastr["error"]('Vui lòng chọn người duyệt!');
            }

            if ((!$scope.finalization.supplier_id || $scope.finalization.supplier_id <= 0) && $scope.finalization.pay_for_type == 2) {
                return toastr["error"]('Vui lòng chọn nhà cung cấp');
            }

            if (!$scope.finalization.number_pay || $scope.finalization.number_pay == '') {
                return toastr["error"]('Vui lòng nhập số tài khoản ngân hàng!');
            }

            if (!$scope.finalization.name_pay || $scope.finalization.name_pay == '') {
                return toastr["error"]('Vui lòng nhập tên tài khoản ngân hàng!');
            }

            if (!$scope.finalization.bank_pay || $scope.finalization.bank_pay == '') {
                return toastr["error"]('Vui lòng nhập tên ngân hàng!');
            }

            if ($scope.list_user_confirm_finalization.length > 0) {
                $scope.finalization.list_user_confirm_finalization = [];
                $scope.list_user_confirm_finalization.forEach(element => {
                    $scope.finalization.list_user_confirm_finalization.push(element.id);
                });
            }

            $scope.loadSubmit = true;
            $scope.finalization.parents_id = $scope.idTask;
            let fd = new FormData();
            let url_post;
            fd.append('data', JSON.stringify($scope.finalization));
            fd.append('data_img', JSON.stringify($scope.images));
            url_post = 'ajax_task_request_finalization';
            $http.post(base_url + '/requests/' + url_post, fd, {
                headers: { 'Content-Type': undefined }
            }).then(r => {
                if (r.data && r.data.status == 1) {
                    $scope.remove_insert();
                    toastr["success"](r.data.message ? r.data.message : 'Thành công!');
                    $scope.images = [];
                    getTask();
                    $('#modal_task_child').modal('hide');
                    $scope.finalization.idTask = $scope.idTask;
                    $scope.finalization.user_created_id = $scope.current_user_id;
                    $scope.sendWpCreateFinalization($scope.finalization);
                } else {
                    toastr["error"](r.data.message ? r.data.message : 'Có lổi xẩy ra. Vui lòng thử lại!');
                    $('#addOrder').modal('hide');
                    $scope.load = 0;
                }
                $scope.loadSubmit = false;
            });
        }
        // END thêm phiếu thanh toán con

    $scope.sendWpCreateFinalization = (item) => {
        $http.post(base_url + 'requests/send_wp_task_requets_finalization', item).then(r => {
            $scope.load = 0;
        });
    }

    $('#textboxMessage').on('keydown', function(event) {
        if (event.keyCode == 13)
            if (!event.shiftKey) {
                $scope.sendMessage();
            }
    });
    $scope.update_status = (value, status) => {
        let string_text = "Bạn có chắc hành động này!";
        if (status == 4 && $scope.isResult == 1) {
            toastr["error"]('Bạn chưa hoàn tất các yêu cầu khác !');
            return;
        }
        if (status == 3) {
            if ($scope.task.type == 3 || $scope.task.type == 4) {
                string_text = "Bạn thiếu chứng từ bàn giao. Bạn có chắc hành động này!";
            }
        }
        swal({
                title: "Thông báo",
                text: string_text,
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: "Xác nhận",
                cancelButtonText: "Đóng",
                closeOnConfirm: true
            },
            function() {
                value.status = status;
                value.current_user_id = $scope.current_user_id;
                $http.post(base_url + '/requests/update_task_requets_detail_status', value).then(r => {
                    if (r.data.status == 1) {
                        $scope.task.status = status;
                        toastr['success']("Cập nhật thành công!");
                        getTask();
                        $('#modalAdvance').modal('hide');
                        if (status == 2 || status == 4 || status == 6) { //gửi message tới người duyệt, người xử lý
                            $scope.sendWorduser($scope.task);
                        }
                        if (status == 1) {
                            $scope.sendMailadd($scope.task); //gửi message tới người xác nhận
                        }

                        if (status == 3) {
                            $scope.sendWpUserCreated($scope.task); //gửi message tới người xác nhận
                        }
                    } else {
                        toastr["error"]('Cập nhật thất bại');
                    }
                })
            });
    }

    $scope.update_finalization_child = (id) => {
        swal({
                title: "Thông báo",
                text: "Bạn có chắc hành động này!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: "Xác nhận",
                cancelButtonText: "Đóng",
                closeOnConfirm: true
            },
            function() {
                var data = {
                    id: id
                }
                $http.post(base_url + '/requests/update_finalization_child', data).then(r => {
                    if (r.data.status == 1) {
                        toastr['success']("Cập nhật thành công!");
                        getTask();
                    } else {
                        toastr["error"]('Cập nhật thất bại');
                    }
                })
            });
    }

    $scope.update_task_child = (id) => {
        swal({
                title: "Thông báo",
                text: "Bạn có chắc hành động này!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: "Xác nhận",
                cancelButtonText: "Đóng",
                closeOnConfirm: true
            },
            function() {
                var data = {
                    id: id,
                    status: 2
                }
                $http.post(base_url + '/requests/update_task_requets_detail_status', data).then(r => {
                    if (r.data.status == 1) {
                        toastr['success']("Cập nhật thành công!");
                        getTask();
                    } else {
                        toastr["error"]('Cập nhật thất bại');
                    }
                })
            });
    }

    $scope.update_user_confirm = () => {
        swal({
                title: "Thông báo",
                text: "Bạn có chắc hành động này!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: "Xác nhận",
                cancelButtonText: "Đóng",
                closeOnConfirm: true
            },
            function() {
                $scope.loadSubmitConfirm = true;
                let data = {
                    idTask: idTask,
                    user_confirm_id: current_user_id
                };
                $http.post(base_url + '/requests/ajax_update_user_confirm', data).then(r => {
                    if (r.data.status == 1) {
                        toastr['success']("Cập nhật thành công!");
                        getTask();
                    } else {
                        toastr["error"]('Cập nhật thất bại');
                    }
                    $scope.loadSubmitConfirm = false;
                })
            });
    }

    $scope.update_user_confirm_child = (idTk) => {
        swal({
            title: "Thông báo",
            text: "Bạn có chắc hành động này!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: "Xác nhận",
            cancelButtonText: "Đóng",
            closeOnConfirm: true
        }, function() {
            $scope.loadSubmitConfirmChild = true;
            let data = {
                idTask: idTk,
                user_confirm_id: current_user_id
            };
            $http.post(base_url + '/requests/ajax_update_user_confirm', data).then(r => {
                if (r.data.status == 1) {
                    toastr['success']("Cập nhật thành công!");
                    getTask();
                    $scope.getListUserConfirmChild();
                } else {
                    toastr["error"]('Cập nhật thất bại');
                }
                $scope.loadSubmitConfirmChild = false;
            })
        });
    }

    $scope.update_user_confirm_finalization = (idTk) => {
        swal({
            title: "Thông báo",
            text: "Bạn có chắc hành động này!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: "Xác nhận",
            cancelButtonText: "Đóng",
            closeOnConfirm: true
        }, function() {
            $scope.loadSubmitConfirmChild = true;
            let data = {
                idTask: idTk,
                user_confirm_id: current_user_id
            };
            $http.post(base_url + '/requests/update_user_confirm_finalization', data).then(r => {
                if (r.data.status == 1) {
                    toastr['success']("Cập nhật thành công!");
                    getTask();
                    $scope.getListUserConfirmChild();
                } else {
                    toastr["error"]('Cập nhật thất bại');
                }
                $scope.loadSubmitConfirmChild = false;
            });
        });
    }

    $scope.update_status_sub = (value, status) => {
        let string_text = "Bạn có chắc hành động này!";
        swal({
                title: "Thông báo",
                text: string_text,
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: "Xác nhận",
                cancelButtonText: "Đóng",
                closeOnConfirm: true
            },
            function() {
                value.status = status;
                value.current_user_id = $scope.current_user_id;
                $http.post(base_url + '/requests/update_task_requets_status_sub', value).then(r => {
                    if (r.data.status == 1) {
                        toastr['success']("Cập nhật thành công!");
                        $('#modalAdvanceSub').modal('hide');
                        getTask();
                    } else {
                        toastr["error"]('Cập nhật thất bại');
                    }
                })
            });
    }

    $scope.update_status_finalization = (idTk, status) => {
        swal({
                title: "Thông báo",
                text: 'Bạn có chắc hành động này!',
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: "Xác nhận",
                cancelButtonText: "Đóng",
                closeOnConfirm: true
            },
            function() {
                $scope.loadSubmitConfirmChild = true;
                let data = {
                    idTask: idTk,
                    user_confirm_id: current_user_id,
                    status: status
                };
                $http.post(base_url + '/requests/update_task_requets_status_finalization', data).then(r => {
                    if (r.data.status == 1) {
                        toastr['success']("Cập nhật thành công!");
                        getTask();
                    } else {
                        toastr["error"]('Cập nhật thất bại');
                    }
                    $scope.loadSubmitConfirmChild = false;
                })
            });
    }

    $scope.sendWorduser = (data) => {
        $http.post(base_url + 'requests/send_message_task_requests_user', data).then(r => {

        })
    }
    $scope.finishedFile = () => {
        $('#fn-img').click();
    }
    $scope.sendImgfinished = () => {
        $scope.datafn = {};
        $scope.datafn.img = $scope.fnimg;
        $scope.datafn.status = $scope.task.status;
        $scope.datafn.type = $scope.task.type;
        $scope.datafn.id = $scope.idTask;
        $http.post(base_url + '/requests/sendImgfinished', $scope.datafn).then(r => {
            if (r && r.data.status == 1) {
                $('#model_request').modal('hide');
                getTask();
                $scope.fnimg = [];
                if ($scope.datafn.img.length > 0) {
                    toastr['success']("Cập nhật thành công!");
                }
                $scope.task.status = 3;
            } else {
                $('#model_request').modal('hide');
            }
        })
    }
    $scope.model_requets = () => {
        $scope.fnimg = [];
    }
    $scope.fnUpload = function(event) {
        var formData = new FormData();
        var files = event.target.files;
        $scope.loadding = true;
        if (files.length > 0) {
            for (var i = 0; i < files.length; i++) {
                formData.append("file[]", files[i]);
            }
            $http.post(base_url + '/requests/images', formData, {
                headers: { 'Content-Type': undefined }
            }).then(r => {
                if (r.data && r.data.status == 1) {
                    r.data.data.forEach(element => {
                        $scope.fnimg.push(element);
                    });
                } else {
                    toastr["error"](r.data.message ? r.data.message : 'Có lổi xẩy ra. Vui lòng thử lại!');
                }
                $scope.loadding = false;
            }).catch(e => {
                toastr['error']("Đã có lỗi máy chủ API hình");
                $scope.loadding = false;
            });
        }
    }

    $scope.fn_delete = (index) => {
        $scope.fnimg.splice(index, 1);
    }

    $scope.fn_remove = () => {
        $scope.fnimg = [];
    }

    function autoCrollBottom() {
        $('.messages').animate({
            scrollTop: $('.messages').get(0).scrollHeight
        }, 1500);
    }

    $scope.deleteUserInComplain = (value, type) => {
        if (value.id == $scope.current_user_id) {
            return toastr['error']('Bạn không thể xóa chính mình');
        }
        $http.post(base_url + 'requests/ajax_delete_user_join_complain', value).then(r => {
            $scope.lsAllUserTag = [];
            getTask();
            getUserJoinTask();
            $scope.showpopup($scope.is_popup);
        })
    }

    $scope.deleteUserConfirm = (value, type) => {
        if (value.id == $scope.current_user_id) {
            return toastr['error']('Bạn không thể xóa chính mình');
        }
        value.Task_Id = $scope.idTask;
        $http.post(base_url + 'requests/ajax_delete_user_confirm', value).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.lsAllUserTag = [];
                getTask();
                $scope.getListUserConfirmChild();
                $scope.showpopup($scope.is_popup);
            } else {
                toastr["error"](r.data.message);
            }
        });
    }

    $scope.deleteUserConfirmFinalization = (value, type) => {
        if (value.id == $scope.current_user_id) {
            return toastr['error']('Bạn không thể xóa chính mình');
        }
        $http.post(base_url + 'requests/ajax_delete_user_confirm_finalization', value).then(r => {
            $scope.lsAllUserTag = [];
            getTask();
            $scope.getListUserConfirmChildFinalization();
            $scope.showpopup($scope.is_popup);
        })
    }

    $scope.showpopupUserConfirmChild = (idTk, list_user_confirm_child, view) => {
        $scope.idChild = idTk;
        $scope.list_user_confirm_child = list_user_confirm_child;
        $scope.is_popup = view;
    }

    $scope.addNewUserToTask = (data) => {
        $http.post(base_url + 'requests/ajax_join_user_to_task', data).then(r => {
            if (r.data && r.data.status == 1) {
                toastr['success']("Thêm thành công!");
                getUserJoinTask();
                $scope.sendWord(r.data.data);
            }
        })
    }

    $scope.addNewManagerToComlain = (data) => {
        $http.post(base_url + 'requests/ajax_join_manager_to_complain', data).then(r => {
            if (r.data && r.data.status == 1) {
                toastr['success']("Thêm thành công!");
                getTask();
                if (($scope.task.type != 4) || ($scope.task.type == 4 && $scope.task.status == 6)) {
                    $scope.sendWord(r.data.data);
                }
            } else {
                toastr['error']("Đã có lổi xẩy ra. Vui lòng thử lại!");
            }
        })
    }

    $scope.addNewVerifierToComlain = (data) => {
        $http.post(base_url + 'requests/ajax_join_verifier_to_complain', data).then(r => {
            if (r.data && r.data.status == 1) {
                toastr['success']("Thêm thành công!");
                getTask();
                $scope.sendWord(r.data.data);
            } else {
                toastr['error']("Đã có lổi xẩy ra. Vui lòng thử lại!");
            }
        })
    }

    $scope.addUserConfirm = (data) => {
        $scope.loaddingAddUserConfirm = true;
        $http.post(base_url + 'requests/ajax_join_user_confirm', data).then(r => {
            if (r.data && r.data.status == 1) {
                toastr['success']("Thêm thành công!");
                getTask();
                $scope.sendWordUserConfirm(r.data.data);
                $scope.getListUserConfirmChild();
            } else if (r.data && r.data.status == 0) {
                toastr['error'](r.data.message);
            } else {
                toastr['error']("Đã có lổi xẩy ra. Vui lòng thử lại!");
            }
            $scope.loaddingAddUserConfirm = false;
        });
    }

    $scope.addUserConfirmFinalization = (data) => {
        $scope.loaddingAddUserConfirm = true;
        $http.post(base_url + 'requests/ajax_join_user_confirm_finalization', data).then(r => {
            if (r.data && r.data.status == 1) {
                toastr['success']("Thêm thành công!");
                getTask();
                $scope.sendWordFinalization(r.data.data);
                $scope.getListUserConfirmChildFinalization();
            } else {
                toastr['error']("Đã có lổi xẩy ra. Vui lòng thử lại!");
            }
            $scope.loaddingAddUserConfirm = false;
        });
    }

    $scope.sendWord = (data) => {
        $http.post(base_url + 'requests/sendWord_task_requets', data).then(r => {});
    }

    $scope.sendWordUserConfirm = (data) => {
        $http.post(base_url + 'requests/sendWord_task_requets_user_confirm', data).then(r => {});
    }

    $scope.sendWordFinalization = (data) => {
        $http.post(base_url + 'requests/sendWord_task_requet_finalization', data).then(r => {});
    }

    $scope.chooseUser = (id) => {
        var data = {
            task_request_id: $scope.idTask,
            user_id: id,
            status: $scope.task.status,
            user_confirm_id: $scope.user_confirm_id,
            type_id: $scope.task.type,
        };

        if ($scope.is_popup == 'PROCESS') {
            data.type = 1;
            $scope.addNewUserToTask(data);
        }
        if ($scope.is_popup == 'FRIEND') {
            data.type = 2;
            $scope.addNewUserToTask(data);
        }

        if ($scope.is_popup == 'MANAGER') {
            data.type = 3;
            $scope.addNewManagerToComlain(data);
        }

        if ($scope.is_popup == 'CONFIRM') {
            $scope.addUserConfirm(data);
        }

        if ($scope.is_popup == 'CONFIRM_CHILD') {
            var data_child = {
                task_request_id: $scope.idChild,
                user_id: id
            };

            $scope.addUserConfirm(data_child);
        }

        if ($scope.is_popup == 'CONFIRM_FINALIZATION') {
            var data_child = {
                parent_id: idTask,
                task_request_finalization_id: $scope.idChild,
                user_id: id
            };

            $scope.addUserConfirmFinalization(data_child);
        }

        $scope.search_user = {};
        $scope.selectedUser = [];
    }
    $scope.showpopup = (value) => {
        $scope.is_popup = value;
        $scope.search_user = {};
        $scope.selectedUser = [];
    }

    $scope.get_task_requests_manager = (type) => {
        $scope.user = {};
        $scope.user.id = $scope.idTask;
        $http.post(base_url + '/requests/ajax_get_task_requests_manager', $scope.user).then(r => {
            if (r && r.data.status == 1) {
                $scope.selectedUser = r.data.data;
                select2();
            }
        })
    }

    $scope.searchUser = () => {
        if (!$scope.search_user.key || $scope.search_user.key.length < 3) {
            return true;
        }
        if ($scope.search_timer) {
            clearTimeout($scope.search_timer);
        }
        $scope.search_timer = setTimeout(() => {
            $scope._searchUser($scope.search_user.key);
        }, 350);

    }
    $scope._searchUser = (key) => {
        $scope.loadding_user = true;
        $scope.user = {};
        let url = "";
        if ($scope.is_popup == 'PROCESS') {
            url = "requests/ajax_get_task_requests_users";
            $scope.user.type = 1;
        } else {
            if ($scope.is_popup == 'FRIEND') {
                url = "requests/ajax_get_task_requests_users";
                $scope.user.type = 2;
            } else {
                if ($scope.is_popup == 'MANAGER') {
                    url = "requests/ajax_get_task_requests_manager";
                    $scope.user.type = 2;
                } else {
                    url = "requests/ajax_get_task_requests_verifier";
                }
            }
        }
        $scope.user.key = key;
        $scope.user.id = $scope.idTask;
        $http.post(base_url + url, $scope.user).then(r => {
            if (r && r.data.status == 1) {
                $scope.selectedUser = r.data.data;
                select2();
            }
            $scope.loadding_user = false;
        })
    }

    $scope.searchUsertList = () => {
        if (!$scope.search_note.key || $scope.search_note.key.length < 3) {
            return true;
        }
        if ($scope.search_timer) {
            clearTimeout($scope.search_timer);
        }
        $scope.search_timer = setTimeout(() => {
            $scope._searchUsertList($scope.search_note.key);
        }, 350);
    }

    $scope._searchUsertList = (key) => {
        $scope.loadding_user = true;
        $scope.search = {};
        $scope.search.key = key;
        let url = 'requests/task_get_user?filter=';
        $http.get(base_url + url + JSON.stringify($scope.search)).then(res => {
            if (res.data.status == 1) {
                $scope.list_note_search = res.data.data;
            } else toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
            $scope.loadding_user = false;
        });
    }

    $scope.searchUsertListFinalization = () => {
        var arr1 = $scope.task.list_user_confirm;
        var arr2 = $scope.lsAllUser;
        arr1.forEach((e, k) => {
            arr2.forEach(e1 => {
                if (e.id == e1.id) {
                    arr1.splice(k, 1)
                }
            });
        });

        $scope.list_note_search = [...arr1, ...arr2];
    }

    $scope.remove_id_list_confirm_finalization = (id) => {
        $scope.list_user_confirm_finalization = $scope.list_user_confirm_finalization.filter(item => item.id != id);
    }

    $scope.chooseUserSearch = (item, view) => {
        // if (view == 1) {
        //     $scope.note.user_confirm_id = item.id;
        // }
        // if (view == 2) {
        //     $scope.update.user_confirm_id = item.id;
        // }
        let dem = $scope.list_user_confirm.filter(i => i.id == item.id);
        if (dem.length == 0) {
            $scope.list_user_confirm.unshift(item);
        }
        $scope.list_user_confirm.forEach((element) => {
            dem = $scope.list_user_confirm.filter(i => i.id == element.id);
            if (dem.length == 0) {
                element.type = 0;
            } else {
                element.type = 1;
            }
        });

        // $scope.search_note.name = item.name;
        // $scope.search_note.image_url = item.image_url;
        // $scope.search_note.description = item.description;
        $scope.removeUserList();
    }

    $scope.removeUserList = () => {
        $scope.search_note.key = '';
        $scope.list_note_search = [];
    }

    $scope.removeUser = (view) => {
        if (view == 1) {
            $scope.note.user_confirm_id = '';
        }
        if (view == 2) {
            $scope.update.user_confirm_id = '';
        }
        $scope.search_note = {};
        $scope.note.user_confirm_id = '';
        $scope.list_note_search = [];
    }

    $scope.removeUserFinalization = () => {
        $scope.finalization.user_confirm_id = '';
        $scope.search_note = {};
        $scope.list_note_search = [];
    }

    $scope.setTop = (item) => {
        if (item == 1) {
            return {
                "top": -55
            };
        }
        if (item == 2) {
            return {
                "top": -90
            };
        }
        if (item == 3) {
            return {
                "top": -125
            };
        }
        if (item == 4 || item > 4) {
            return {
                "top": -160
            };
        }
    }

    $scope.getUser = () => {
        $http.get(base_url + 'requests/task_get_user').then(r => {
            if (r.data && r.data.status == 1) {
                $scope.allUser = r.data.data;
            }
        });
    }

    $scope.updateFile = () => {
        $('#files_up').click();
    }
    $scope.updatesubFile = () => {
        $('#files_sub').click();
    }
    $scope.upUpload = function(event) {
        $scope.loadding = true;
        var formData = new FormData();
        var files = event.target.files;
        if (files.length > 0) {
            for (var i = 0; i < files.length; i++) {
                formData.append("file[]", files[i]);
            }
            $http.post(base_url + '/requests/images', formData, {
                headers: { 'Content-Type': undefined }
            }).then(r => {
                if (r.data && r.data.status == 1) {
                    r.data.data.forEach(element => {
                        $scope.upimg.push(element);
                    });
                } else {
                    toastr["error"](r.data.message ? r.data.message : 'Có lổi xẩy ra. Vui lòng thử lại!');
                }
                $scope.loadding = false;
            }).catch(e => {
                toastr['error']("Đã có lỗi máy chủ API hình");
                $scope.loadding = false;
            });
        }
    }


    $scope.up_delete = (index) => {
        $scope.upimg.splice(index, 1);
    }

    $scope.up_remove = () => {
        $scope.upimg = [];
    }

    $scope.delete_img = (img_id) => {
        $scope.filter = {};
        $scope.filter.img_id = img_id;
        $scope.filter.id = $scope.idTask;
        $http.post(base_url + '/requests/update_img_task_requets', $scope.filter).then(r => {
            if (r.data && r.data.status == 1) {
                toastr["success"](r.data.message ? r.data.message : 'Xóa thành công!');
                $scope.update.image_url = $scope.update.image_url.filter(item => item.id != img_id);
                getTask();
            }
        });
    }
    $scope.delete_imgcd = (img_id, update) => {
        $scope.filter = {};
        $scope.filter.img_id = img_id;
        $scope.filter.id = update.idTk;
        $http.post(base_url + '/requests/update_img_task_requets', $scope.filter).then(r => {
            if (r.data && r.data.status == 1) {
                toastr["success"](r.data.message ? r.data.message : 'Xóa thành công!');
                getTask();
                $.each(update.img, function(k, v) {
                    if (v.id == img_id) {
                        update.img.splice(k, 1);
                        return true;
                    }
                });
            }
        });
    }
    $scope.delete_fnimg = (img) => {
        $scope.filter = {};
        $scope.filter.img_id = img.id;
        $scope.filter.id = $scope.idTask;
        if (img.user_id != $scope.current_user_id) {
            return toastr['error']('Bạn không thể xóa hình người khác');
        }
        $http.post(base_url + '/requests/update_fnimg_task_requets', $scope.filter).then(r => {
            if (r.data && r.data.status == 1) {
                toastr["success"](r.data.message ? r.data.message : 'Xóa thành công!');
                getTask();
            }
        });
    }

    $scope.openUpdate = (val, view) => {
        $scope.update = angular.copy(val);
        if ($scope.update.type == 4) {
            $scope.list_search_supplier = [];
            $scope.search_supplier = {};
            $scope.search_supplier.tax_code = $scope.update.supplier_tax_code;
            $scope.search_supplier.name = $scope.update.supplier_name;
            $scope.search_supplier.phone = $scope.update.supplier_phone;
            $scope.list_search_construction = [];
            $scope.search_construction = {};
            $scope.search_construction.name = $scope.update.construction_name;
            $scope.search_construction.code = $scope.update.construction_code;

        }
        $scope.update.user_confirm_id_sub = $scope.update.user_confirm_id;
        $scope.update.quantity = parseInt(val.quantity);
        $scope.upimg = [];
        if ($scope.update.type == 3) {
            $scope.search_product = {};
            $scope.getProduct($scope.update.product_id);
            $scope.getSupplier();
        }
        $scope.search_note = {};
        if (view == 'view') {
            $('#is_update').modal('show');
        } else {
            $('#sub_update').modal('show');
            $scope.search_note.name = $scope.update.user_name;
            $scope.search_note.image_url = $scope.update.image_url;
            $scope.search_note.description = $scope.update.store_name;
        }
        select2();
    }

    $scope.showModalUpdateTaskRequest = (task) => { // Cập nhật phiếu tạm ứng và phiếu thanh toán
        $scope.update = {};
        $scope.update.id = task.id;
        $scope.update.title = task.title;
        $scope.update.note = task.note;
        $scope.update.image_url = task.image_url;
        $scope.update.type = task.type;
        $scope.imageUpdate = [];
        task.image_url.forEach(e => {
            $scope.imageUpdate.push(e.file);
        });
        $scope.update.type = task.type;

        $scope.UpdateBankPay = task.supplier_id;
        $scope.update.pay_for_type = task.pay_for_type;
        $scope.update.pay = task.pay;
        $scope.update.supplier_id = task.supplier_id;
        $scope.search_supplier = {};
        $scope.search_supplier.name = task.supplier_name;
        $scope.search_supplier.phone = task.supplier_phone;
        $scope.search_supplier.tax_code = task.supplier_id;
        $scope.update.parents_id = task.parents_id;

        $('#modalUpdateTaskRequest').modal('show');
    }

    $scope.updateTaskRequest = () => {
        if ($scope.update.parents_id && $scope.update.parents_id == 0) {
            if ((!$scope.update.title || $scope.update.title == '') && ($scope.update.type == 4 || $scope.update.type == 5)) {
                return toastr["error"]('Vui lòng nhập tiêu đề!');
            }
        }

        if (!$scope.update.note || $scope.update.note == '') {
            return toastr["error"]('Vui lòng nhập nội dụng!');
        }

        let data = {
            'id': $scope.update.id,
            'type': $scope.update.type,
            'title': $scope.update.title,
            'note': $scope.update.note,
            'image_url': $scope.imageUpdate
        };

        data.supplier_id = $scope.update.supplier_id;
        data.pay_for_type = $scope.update.pay_for_type;
        data.pay = $scope.update.pay;

        if ($scope.update.pay_for_type == 2 && (!$scope.update.supplier_id || $scope.update.supplier_id == '' || $scope.update.supplier_id == 0)) {
            return toastr["error"]('Vui lòng chọn nhà cung cấp');
        }

        $scope.loadSubmitForm = true;
        let fd = new FormData();
        let url_post;
        fd.append('data', JSON.stringify(data));
        url_post = 'update_task_requet_detail';
        $http.post(base_url + '/requests/' + url_post, fd, {
            headers: { 'Content-Type': undefined }
        }).then(r => {
            if (r.data && r.data.status == 1) {
                toastr["success"](r.data.message ? r.data.message : 'Thành công!');
                getTask();
                $('#modalUpdateTaskRequest').modal('hide');
                $('#modalUpdateTaskRequestChild').modal('hide');
                getMessage();
            } else {
                toastr["error"](r.data.message ? r.data.message : 'Có lổi xẩy ra. Vui lòng thử lại!');
            }
            $scope.loadSubmitForm = false;
        });
    }

    $scope.showModalUpdateTaskRequestChild = (task) => { // Cập nhật phiếu con
        $scope.loadSubmitForm = false;
        $scope.update = {};
        $scope.update.id = task.idTk;
        $scope.update.title = task.title;
        $scope.update.note = task.note;
        $scope.update.image_url = task.image_url;
        $scope.update.type = task.type;
        $scope.imageUpdate = [];
        if (task.img) {
            task.img.forEach(e => {
                $scope.imageUpdate.push(e.file);
            });
        }

        $('#modalUpdateTaskRequestChild').modal('show');
    }

    $scope.showModalUpdateTaskRequestFinalization = (task) => { // Cập nhật phiếu quyết toán
        $scope.loadSubmitForm = false;
        $scope.update = {};
        $scope.update.id = task.idTk;
        $scope.update.note = task.note;
        $scope.update.image_url = task.img;
        $scope.imageUpdate = [];
        if (task.img) {
            task.img.forEach(e => {
                $scope.imageUpdate.push(e.file);
            });
        }

        $('#ModalUpdateTaskRequestFinalization').modal('show');
    }

    $scope.updateTaskRequestFinalization = () => {
        if (!$scope.update.note || $scope.update.note == '') {
            return toastr["error"]('Vui lòng nhập nội dung!');
        }

        let data = {
            'id': $scope.update.id,
            'title': $scope.update.title,
            'note': $scope.update.note,
            'image_url': $scope.imageUpdate
        };

        $scope.loadSubmitForm = true;
        let fd = new FormData();
        let url_post;
        fd.append('data', JSON.stringify(data));
        url_post = 'update_task_requet_finalization_detail';
        $http.post(base_url + '/requests/' + url_post, fd, {
            headers: { 'Content-Type': undefined }
        }).then(r => {
            if (r.data && r.data.status == 1) {
                toastr["success"](r.data.message ? r.data.message : 'Thành công!');
                getTask();
                $('#ModalUpdateTaskRequestFinalization').modal('hide');
            } else {
                toastr["error"](r.data.message ? r.data.message : 'Có lổi xẩy ra. Vui lòng thử lại!');
            }
            $scope.loadSubmitForm = false;
        });
    }

    $scope.updateCash = () => {
        let number = Number($scope.update.price);
        if (($scope.update.type == 5 || $scope.update.type == 4) && number == 0) {
            if (number == 0) {
                return toastr["error"]('Vui lòng nhập số tiền');
            }
        }
        $scope.loadSubmitUpdate = true;
        let fd = new FormData();
        let url_post;
        fd.append('data', JSON.stringify($scope.update));
        fd.append('data_img', JSON.stringify($scope.upimg));
        url_post = 'update_task_requets';
        $http.post(base_url + '/requests/' + url_post, fd, {
            headers: { 'Content-Type': undefined }
        }).then(r => {
            if (r.data && r.data.status == 1) {
                toastr["success"](r.data.message ? r.data.message : 'Thành công!');
                $('#is_update').modal('hide');
                $scope.lsAllUserTag = [];
                getTask();
                getUserJoinTask();
                $scope.up_remove();
            } else {
                $('#is_update').modal('hide');
                $scope.up_remove();
            }
            $scope.loadSubmitUpdate = false;
        });
    }
    $scope.updateSubCash = () => {
        let number = Number($scope.update.price);
        if (($scope.update.type == 5 || $scope.update.type == 4) && number == 0) {
            if (number == 0) {
                return toastr["error"]('Vui lòng nhập số tiền');
            }
        }
        let fd = new FormData();
        let url_post;
        fd.append('data', JSON.stringify($scope.update));
        fd.append('data_img', JSON.stringify($scope.upimg));
        url_post = 'update_task_requets_sub';
        $http.post(base_url + '/requests/' + url_post, fd, {
            headers: { 'Content-Type': undefined }
        }).then(r => {
            if (r.data && r.data.status == 1) {
                toastr["success"](r.data.message ? r.data.message : 'Thành công!');
                $('#sub_update').modal('hide');
                if ($scope.update.user_confirm_id != $scope.update.user_confirm_id_sub) {
                    $scope.update.idTask = $scope.idTask;
                    $scope.sendOrder($scope.update);
                }
                $scope.lsAllUserTag = [];
                getTask();
                getUserJoinTask();
                $scope.up_remove();
            } else {
                $('#sub_update').modal('hide');
                $scope.up_remove();
            }
        });
    }
    $scope.sendOrder = (data) => {
        $http.post(base_url + 'requests/send_message_task_requests_sub', data).then(r => {})
    }
    $scope.getStore = () => {
        $http.get(base_url + 'requests/task_get_store_user').then(r => {
            if (r.data && r.data.status == 1) {
                $scope.allStore = r.data.data;
            }
        });
    }

    $scope.getSupplier = () => {
        $http.get(base_url + 'requests/task_get_supplier').then(r => {
            if (r.data && r.data.status == 1) {
                $scope.allSupplier = r.data.data;
            }
        });
    }
    $scope.getProduct = (id) => {
        let url = 'requests/task_get_one_product?filter=';
        $http.get(base_url + url + JSON.stringify(id)).then(res => {
            if (res.data.status == 1) {
                $scope.search_product.parent_name = res.data.data;
            }
        });
    }
    $scope.searchProduct = () => {
        let name = $scope.search_product.name;
        $scope.search_product.load = true;
        if (!name || name.length < 3) return true;
        if ($scope.filter_timer) {
            clearTimeout($scope.filter_timer);
        }
        $scope.filter_timer = setTimeout(() => {
            $scope._searchProduct(name);
        }, 350);
    }

    $scope._searchProduct = (name) => {
        let url = 'requests/task_get_product?filter=';
        $http.get(base_url + url + JSON.stringify(name)).then(res => {
            if (res.data.status == 1) {
                $scope.list_product = res.data.data;
            } else toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
            $scope.search_product.load = false;
        });
    }

    $scope.chooseItemSearchProduct = (item, view) => {
        if (view == 'update') {
            $scope.update.product_id = item.id;
        }
        if (view == 'note') {
            $scope.note.product_id = item.id;
        }
        $scope.search_product.parent_name = item.description;
        $scope.removeProductList();
    }

    $scope.removeProductList = () => {
        $scope.search_product.name = "";
        $scope.list_product = [];
    }
    $scope.removeProduct = (view) => {
        if (view == 'update') {
            $scope.update.product_id = 0;
        }
        if (view == 'note') {
            $scope.note.product_id = 0;
        }
        $scope.search_product = {};
    }

    $scope.insertUpload = function(event) {

        var formData = new FormData();
        var files = event.target.files;
        $scope.loadding = true;
        if (files.length > 0) {
            for (var i = 0; i < files.length; i++) {
                formData.append("file[]", files[i]);
            }
            $http.post(base_url + '/requests/images', formData, {
                headers: { 'Content-Type': undefined }
            }).then(r => {
                if (r.data && r.data.status == 1) {
                    r.data.data.forEach(element => {
                        $scope.imgInsert.push(element);
                    });
                } else {
                    toastr["error"](r.data.message ? r.data.message : 'Có lổi xẩy ra. Vui lòng thử lại!');
                }
                $scope.loadding = false;
            }).catch(e => {
                toastr['error']("Đã có lỗi máy chủ API hình");
                $scope.loadding = false;
            });
        }

    }

    $scope.insert_delete = (index) => {
        $scope.imgInsert.splice(index, 1);
    }

    $scope.remove_insert = () => {
        $scope.imgInsert = [];
    }
    $scope.addFile = () => {
        $('#files_is').click();
    }
    $scope.clickOrder = (type) => {
        $scope.loadSubmitForm = false;
        $scope.search_note = {};
        $scope.list_note_search = [];
        $scope.list_user_confirm = [];
        $scope.note = {};
        $scope.note.id = $scope.idTask;
        $scope.note.store_id = $scope.task.store_id;
        $scope.note.type = type;

        if (type == '4') {
            $scope.note.pay_for_type = "1";
        }
        $scope.note.pay = "1";
        if (type == '3') {
            $scope.note.product_id = 0;
            $scope.search_product = {};
            $scope.getSupplier();
        }
        if (type == '4' && $scope.task.type == 4) {
            $scope.note.pay_for_type = "2";
            $scope.note.pay = "2";
            if ($scope.task.pay_note) {
                $scope.note.number_pay = $scope.task.pay_note[0];
                $scope.note.name_pay = $scope.task.pay_note[1];
                $scope.note.bank_pay = $scope.task.pay_note[2];
            }
        }
        $('#addOrder').modal('show');
        select2();
    }
    $scope.addCash = () => {
        $scope.load++;
        $scope.note.main_group_id = $scope.task.main_group_id;
        $scope.note.parents_id = $scope.idTask;
        $scope.note.status_id = $scope.task.status;
        if ($scope.note.type != 1) {
            if (!$scope.list_user_confirm || $scope.list_user_confirm.length == 0) {
                return toastr["error"]('Vui lòng bạn chọn người duyệt');
            }
        }

        if ($scope.list_user_confirm.length > 0) {
            $scope.note.list_user_confirm = [];
            $scope.list_user_confirm.forEach(element => {
                $scope.note.list_user_confirm.push(element.id);
            });
        }

        $scope.loadSubmitForm = true;
        let fd = new FormData();
        let url_post;
        fd.append('data', JSON.stringify($scope.note));
        fd.append('data_img', JSON.stringify($scope.imgInsert));
        url_post = 'insert_task_requets_detail';
        if ($scope.load == 1) {
            $http.post(base_url + '/requests/' + url_post, fd, {
                headers: { 'Content-Type': undefined }
            }).then(r => {
                if (r.data && r.data.status == 1) {
                    $scope.remove_insert();
                    toastr["success"](r.data.message ? r.data.message : 'Thành công!');
                    $scope.note.id = r.data.id;
                    $scope.imgInsert = [];
                    getTask();
                    getUserJoinTask();
                    $('#addOrder').modal('hide');
                    $scope.note.idTask = $scope.idTask;
                    $scope.note.user_created_id = $scope.current_user_id;
                    $scope.note.list_user_confirm_finalization = $scope.note.list_user_confirm
                    $scope.sendWpCreateFinalization($scope.note);
                } else {
                    toastr["error"](r.data.message ? r.data.message : 'Có lổi xẩy ra. Vui lòng thử lại!');
                    $('#addOrder').modal('hide');
                    $scope.load = 0;
                }
                $scope.loadSubmitForm = true;
            });
        }
    }
    $scope.sendMailadd = (item) => {
        $http.post(base_url + 'requests/send_message_task_requets_detail', item).then(r => {
            $scope.load = 0;
        });
    }

    $scope.sendWpUserCreated = (item) => {
        $http.post(base_url + 'requests/send_wp_task_requets_detail_user_created', item).then(r => {
            $scope.load = 0;
        });
    }

    $scope.searchSupplierList = () => {
        let key = '';

        if (!$scope.search_supplier.key || $scope.search_supplier.key.length < 3) {
            return true;
        } else {
            key = $scope.search_supplier.key;
        }
        if ($scope.search_timer) {
            clearTimeout($scope.search_timer);
        }

        $scope.search_timer = setTimeout(() => {
            $scope._searchSupplierList(key);
        }, 350);
    }

    $scope._searchSupplierList = (key) => {
        $scope.loadding_user = true;
        $scope.search = {};
        $scope.search.key = key;
        let url = 'requests/task_get_supplier?';
        $http.get(base_url + url + $.param($scope.search)).then(res => {
            if (res.data.status == 1) {
                $scope.list_search_supplier = res.data.data;
            } else toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
            $scope.loadding_user = false;
        });
    }

    // chọn nha cung cấp phiếu con
    $scope.searchSupplierListFinalization = () => {
        let key = '';

        if (!$scope.search_supplier.key || $scope.search_supplier.key.length < 3) {
            return true;
        } else {
            key = $scope.search_supplier.key;
        }
        if ($scope.search_timer) {
            clearTimeout($scope.search_timer);
        }

        $scope.search_timer = setTimeout(() => {
            $scope._searchSupplierListFinalization(key);
        }, 350);
    }

    $scope._searchSupplierListFinalization = (key) => {
        $scope.loadding_user = true;
        $scope.search = {};
        $scope.search.key = key;
        let url = 'requests/task_get_supplier?';
        $http.get(base_url + url + $.param($scope.search)).then(res => {
            if (res.data.status == 1) {
                $scope.list_search_supplier = res.data.data;
            } else toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
            $scope.loadding_user = false;
        });

        $scope.finalization.pay_for_type = '2';
        $scope.finalization.name_pay = '';
        $scope.finalization.bank_pay = '';
        $scope.finalization.number_pay = '';
    }

    $scope.chooseSupplierSearchFinalization = (item) => {
        $scope.finalization.supplier_id = item.id;
        $scope.finalization.name_pay = item.bank_name;
        $scope.finalization.bank_pay = item.bank_account;
        $scope.finalization.number_pay = item.bank_number;
        $scope.search_supplier.name = item.name;
        $scope.search_supplier.phone = item.phone;
        $scope.search_supplier.tax_code = item.tax_code;
        $scope.removeSupplierList();
    }

    $scope.removeSupplierFinalization = () => {
        $scope.search_supplier = {};
        $scope.finalization.supplier_id = '';
        $scope.finalization.name_pay = '';
        $scope.finalization.bank_pay = '';
        $scope.finalization.number_pay = '';
        $scope.list_search_supplier = [];
    }

    // end chọn nha cung cấp phiếu con

    $scope.chooseSupplierSearch = (item) => {
        $scope.update.pay_for_type = "2";
        $scope.update.pay = "2";
        $scope.update.supplier_id = item.id;
        $scope.update.name_pay = item.bank_name;
        $scope.update.bank_pay = item.bank_account;
        $scope.update.number_pay = item.bank_number;
        $scope.search_supplier.name = item.name;
        $scope.search_supplier.phone = item.phone;
        $scope.search_supplier.tax_code = item.tax_code;
        $scope.removeSupplierList();
    }

    $scope.chooseSupplierSearchUpdate = (item) => { // cập nhật nhà cung cấp
        $scope.update.supplier_id = item.id;

        if ($scope.update.pay_for_type == 2) {
            $scope.update.name_pay = item.bank_name;
            $scope.update.bank_pay = item.bank_account;
            $scope.update.number_pay = item.bank_number;
        }

        $scope.search_supplier.name = item.name;
        $scope.search_supplier.phone = item.phone;
        $scope.search_supplier.tax_code = item.tax_code;
        $scope.removeSupplierList();
    }

    $scope.removeSupplierUpdatePayment = () => {
        $scope.search_supplier = {};
        $scope.update.supplier_id = '';
        if ($scope.update.pay_for_type == 2) {
            $scope.update.name_pay = '';
            $scope.update.bank_pay = '';
            $scope.update.number_pay = '';
        }
        $scope.list_search_supplier = [];
    }

    $scope.removeSupplierList = () => {
        $scope.search_supplier.key = '';
        $scope.list_search_supplier = [];
    }

    $scope.removeSupplier = () => {
        $scope.search_supplier = {};
        $scope.update.supplier_id = '';
        $scope.update.name_pay = '';
        $scope.update.bank_pay = '';
        $scope.update.number_pay = '';
        $scope.list_search_supplier = [];
    }

    $scope.clearTextBank = () => {
        $scope.note.name_pay = '';
        $scope.note.bank_pay = '';
        $scope.note.number_pay = '';
    }

    $scope.addBank = (type) => {
        if ($scope.update.supplier_id > 0) {
            if (type == 1) {
                $scope.update.pay_for_type = 2;
            }
            if (type == 2) {
                $scope.update.pay = 2;
            }
            if ($scope.update.pay_for_type == 2 && $scope.update.pay == 2) {
                $scope.search = {};
                $scope.search.id = $scope.update.supplier_id;
                let url = 'requests/task_get_supplier?';
                $http.get(base_url + url + $.param($scope.search)).then(res => {
                    if (res.data.status == 1) {
                        if (res.data.data.length > 0) {
                            $scope.update.name_pay = res.data.data[0].bank_name;
                            $scope.update.bank_pay = res.data.data[0].bank_account;
                            $scope.update.number_pay = res.data.data[0].bank_number;
                        }
                    } else toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
                }).catch(e => {
                    toastr["error"]("Đã có lỗi xảy ra với máy chủ API");
                });
            }
        }
    }


    $scope.clearTextBankUpdate = () => {
        $scope.update.name_pay = '';
        $scope.update.bank_pay = '';
        $scope.update.number_pay = '';
    }

    $scope.addBankUpdate = (type) => {
        if ($scope.update.pay_for_type == 2 && $scope.update.pay == 2) {
            $scope.search = {};
            $scope.search.id = $scope.update.supplier_id;
            let url = 'requests/task_get_supplier?';
            $http.get(base_url + url + $.param($scope.search)).then(res => {
                if (res.data.status == 1) {
                    if (res.data.data.length > 0) {
                        $scope.update.name_pay = res.data.data[0].bank_name;
                        $scope.update.bank_pay = res.data.data[0].bank_account;
                        $scope.update.number_pay = res.data.data[0].bank_number;
                    }
                } else toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
            }).catch(e => {
                toastr["error"]("Đã có lỗi xảy ra với máy chủ API");
            });
        }
    }

    $scope.clearTextBankFinalization = () => {
        $scope.finalization.name_pay = $scope.userBankAccount;
        $scope.finalization.bank_pay = 'ACB';
        $scope.finalization.number_pay = $scope.userBankNumber;
    }

    $scope.addBankFinalization = (type) => {
        $scope.finalization.name_pay = '';
        $scope.finalization.bank_pay = '';
        $scope.finalization.number_pay = '';

        if ($scope.finalization.supplier_id > 0) {
            if (type == 1) {
                $scope.finalization.pay_for_type = 2;
            }
            if (type == 2) {
                $scope.finalization.pay = 2;
            }
            if ($scope.finalization.pay_for_type == 2 && $scope.finalization.pay == 2) {
                $scope.search = {};
                $scope.search.id = $scope.finalization.supplier_id;
                let url = 'requests/task_get_supplier?';
                $http.get(base_url + url + $.param($scope.search)).then(res => {
                    if (res.data.status == 1) {
                        if (res.data.data.length > 0) {
                            $scope.finalization.name_pay = res.data.data[0].bank_name;
                            $scope.finalization.bank_pay = res.data.data[0].bank_account;
                            $scope.finalization.number_pay = res.data.data[0].bank_number;
                        }
                    } else toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
                }).catch(e => {
                    toastr["error"]("Đã có lỗi xảy ra với máy chủ API");
                });
            }
        }
    }

    $scope.get_current_user_bank = () => {
        let url = 'requests/get_user_bank?';
        $http.get(base_url + url).then(res => {
            if (res.data.status == 1) {
                $scope.userBankAccount = res.data.data.bank_account;
                $scope.userBankNumber = res.data.data.bank_number;
            } else toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
        }).catch(e => {
            toastr["error"]("Đã có lỗi xảy ra với máy chủ API");
        });
    }

    $scope.searchConstructionList = () => {
        let key = '';

        if (!$scope.search_construction.key || $scope.search_construction.key.length < 3) {
            $scope.search_construction.open = 0;
            return toastr["error"]('Vui lòng hơn 3 ký tự!');
        } else {
            $scope.search_construction.open = 1;
            key = $scope.search_construction.key;
        }
        $scope._searchConstructionList(key);
    }

    $scope._searchConstructionList = (key) => {
        $scope.loadding_user = true;
        $scope.search = {};
        $scope.search.key = key;
        let url = 'requests/task_get_construction?';
        $http.get(base_url + url + $.param($scope.search)).then(res => {
            if (res.data.status == 1) {
                $scope.list_search_construction = res.data.data;
                if ($scope.list_search_construction.length > 0) {
                    $scope.chooseConstructionSearch($scope.list_search_construction[0]);
                }
            } else toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
            $scope.loadding_user = false;
        });
    }

    $scope.chooseConstructionSearch = (item) => {
        $scope.update.construction_id = item.id;
        $scope.search_construction.name = item.name;
        $scope.search_construction.code = item.code;
        $scope.removeConstructionList();
    }

    $scope.removeConstructionList = () => {
        $scope.search_construction.key = '';
        $scope.search_construction.open = 0;
        $scope.list_search_construction = [];
    }

    // Phiếu quyết toán

    $scope.searchConstructionListFinalization = () => {
        let key = '';

        if (!$scope.search_construction.key || $scope.search_construction.key.length < 3) {
            $scope.search_construction.open = 0;
            return toastr["error"]('Vui lòng hơn 3 ký tự!');
        } else {
            $scope.search_construction.open = 1;
            key = $scope.search_construction.key;
        }
        $scope._searchConstructionListFinalization(key);
    }

    $scope._searchConstructionListFinalization = (key) => {
        $scope.loadding_user = true;
        $scope.search = {};
        $scope.search.key = key;
        let url = 'requests/task_get_construction?';
        $http.get(base_url + url + $.param($scope.search)).then(res => {
            if (res.data.status == 1) {
                $scope.list_search_construction = res.data.data;
                if ($scope.list_search_construction.length > 0) {
                    $scope.chooseConstructionSearchFinalization($scope.list_search_construction[0]);
                }
            } else toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
            $scope.loadding_user = false;
        });
    }

    $scope.chooseConstructionSearchFinalization = (item) => {
        $scope.finalization.construction_id = item.id;
        $scope.search_construction.name = item.name;
        $scope.search_construction.code = item.code;
        $scope.removeConstructionListFinalization();
    }

    $scope.removeConstructionListFinalization = () => {
        $scope.search_construction.key = '';
        $scope.search_construction.open = 0;
        $scope.list_search_construction = [];
    }

    // Phiếu quyết toán

    $scope.removeConstruction = () => {
        $scope.search_construction = {};
        $scope.update.construction_id = '';
        $scope.list_search_construction = [];
    }

    function formatState(opt) {
        if (!opt.id) {
            return opt.text;
        }

        var optimage = $(opt.element).attr('data-image');
        if (!optimage) {
            return opt.text;
        } else {
            var $opt = $(
                '<span><img src="' + optimage + '" width="30px" style="border-radius: 50% 50%;" /> ' + opt.text + '</span>'
            );
            return $opt;
        }
    };

    function select2() {
        setTimeout(() => {
            $('.select2').select2({
                templateResult: formatState,
                templateSelection: formatState
            });
        }, 400);
    }

    $scope.checkCoupon = (item) => {
        if ($scope.update.parents_id.id != item.id) {
            $scope.update.parents_id.id = item.id;
            $scope.coupon = "Mã phiếu(" + item.id + ") - " + item.title;
        } else {
            $scope.update.parents_id.id = 0;
            $scope.coupon = "";
        }
    }
    $scope.viewPrice = (item) => {
        let val = item;
        val = val.replace(/,/g, "")
        val += '';
        x = val.split('.');
        x1 = x[0];
        x2 = x.length > 1 ? '.' + x[1] : '';
        let rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2
    }
    $scope.linkToDetail = (item) => {
        window.open(base_url + 'requests/task_requets_detail/' + item.id);
    }

    $scope.formatDate = (d, fm) => {
        return moment(d).format(fm);
    }
    $scope.clickAdvance = () => {
        $scope.note = {};
        $scope.note = angular.copy($scope.task);
        $('#modalAdvance').modal('show');
    }
    $scope.clickAdvanceSub = (item) => {
        $scope.note = {};
        $scope.note = angular.copy(item);
        $('#modalAdvanceSub').modal('show');
    }
    $('body').on('hidden.bs.modal', function() {
        if ($('.modal:visible').length) {
            $('body').addClass('modal-open');
        }
    });
});