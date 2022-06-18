app.controller('commentDetailCtrl', function ($scope, $http, $sce) {
    $scope.init = () => {
        $scope.commentId = idComment;
        $scope.comment = {};
        $scope.getCommentDetail();
        $scope.is_popup = '';
        $scope.selectedUser = [];
        $scope.isAdmin = isAdmin;
        $scope.isManager = isManager;
        $scope.newMessage = {};
        $scope.lsUserTag = [];
        $scope.images = [];
        $scope.files = null;
        $scope.curentUserId = id_current_user;
        $scope.ls_penances = [];
        $scope.optionPenance = [
            {
                key: 1,
                value: 'Cảnh cáo'
            }, {
                key: 2,
                value: 'Trừ lương'
            }, {
                key: 3,
                value: 'Thôi việc'
            }
        ]

        autoCrollBottom();
        getMessage();
        getImageComplain();
        $scope.getPenance();

        setTimeout(() => {
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
        }, 100);

    }

    function loadRole() {
        $scope.roleAddUserHandel = $scope.curentUserId == 1 || $scope.curentUserId == 2 || $scope.curentUserId == 1323;
        let hasUser = $scope.comment.ls_user.find(r => { return r.user_id == $scope.curentUserId });
        $scope.roleAddPenance = hasUser ? true : false;
    }

    $scope.trustAsHtml = function (value) {
        return $sce.trustAsHtml(value.note);
    }

    $scope.getCommentDetail = () => {
        $http.get(base_url + '/admin_users/ajax_get_comment_detail?id=' + $scope.commentId).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.comment = r.data.data;
                $scope.comment.images = JSON.parse($scope.comment.images);
            }
        })
    }

    $scope.sendMessage = () => {
        $scope.newMessage.note = CKEDITOR.instances.textboxMessage.getData();
        let tag = [];
        $scope.lsUserTag.forEach(e => {
            $scope.newMessage.note = $scope.newMessage.note + '';
            if ($scope.newMessage.note.search(`value="${e.user_id}"`) >= 0) {
                tag.push(e);
            };
        })

        if (($scope.newMessage.note && $scope.newMessage.note != '') || ($scope.newUrlUpload && $scope.newUrlUpload != '')) {
            $scope.newMessage.comment_id = $scope.commentId;
            $scope.newMessage.image_url = $scope.newUrlUpload;
            $scope.newMessage.ls_user_tag = tag;
            $scope.lsUserTag = [];
            $http.post(base_url + '/admin_users/ajax_add_message_for_comment', $scope.newMessage).then(r => {
                if (r.data && r.data.status == 1) {
                    getMessage();
                    $scope.remove_image();
                    autoCrollBottom();
                    $scope.newMessage.note = '';
                    if (r.data.is_change_status == 1) {
                        $scope.getCommentDetail();
                    }
                }
            })
        }
        // if ($scope.newUrlUpload && $scope.newUrlUpload != '') {
        //     loadImageComplain();
        // }
        CKEDITOR.instances.textboxMessage.setData('');
    }

    $scope.countUser = (type) => {
        if ($scope.comment && $scope.comment.ls_user) {
            let us = $scope.comment.ls_user.filter(r => { return r.type == type });
            return us.length;
        } else return 0;
    }

    $scope.showpopup = (typeAddUser) => {
        $scope.is_popup = typeAddUser;
        $('#modalAddUser').modal('show');
    }

    $scope.chooseUser = () => {
        let userId = $scope.selectedUser[0];
        let type = $scope.is_popup == 'PROCESS' ? 1 : 2;
        if (userId) {
            let hasUser = $scope.comment.ls_user.find(r => { return r.user_id == userId && r.type == type });
            if (hasUser) {
                toastr['error']('Người này đã được thêm!');
            } else {
                $scope.addUser({ user_id: userId, type: type, idComment: $scope.commentId });
            }
        }
        $scope.selectedUser = [];
    }

    $scope.addUser = (data) => {
        $http.post(base_url + '/admin_users/ajax_add_user_comment', data).then(r => {
            if (r.data && r.data.status == 1) {
                toastr['success'](r.data.message);
                $scope.getCommentDetail();
            }
        })
    }

    $scope.deleteUser = (idUserComment) => {
        $http.post(base_url + '/admin_users/ajax_delete_user_comment', { idUserComment: idUserComment }).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.getCommentDetail(); f
            }
        })
    }

    $scope.handleTagName = (item) => {
        var newElement = CKEDITOR.dom.element.createFromHtml(`<span style="color: #1479fb;" value="${item.user_id}" >@${item.user_name}</span> `, $scope.ckeditor.document);
        CKEDITOR.instances.textboxMessage.insertElement(newElement);
        $scope.lsUserTag.push(item);
        $scope.selectedName = [];
    }

    function getMessage() {
        $http.get(base_url + '/admin_users/ajax_get_message_comment?id=' + $scope.commentId).then(r => {
            $scope.lsMessage = r.data ? r.data : [];
        });
    }

    function autoCrollBottom() {
        //auto croll bottom
        $('.messages').animate({
            scrollTop: $('.messages').get(0).scrollHeight
        }, 1500);
    }

    $scope.imageUpload = function (element) {
        var files = event.target.files; //FileList object

        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var reader = new FileReader();
            reader.onload = $scope.imageIsLoaded;
            reader.readAsDataURL(file);
        }
        $scope.files = files;
        $scope.saveImage(files);
    }

    $scope.imageIsLoaded = function (e) {
        if ($scope.images.length == 0) {
            $scope.images.push(e.target.result);
        } else {
            $scope.images[0] = e.target.result;
        }
    }

    $scope.chooseImg = () => {
        $('.ip-img').trigger('click');
    }

    $scope.remove_image = () => {
        $scope.images = [];
    }

    $scope.saveImage = (files) => {
        var formData = new FormData();
        formData.append('file', files[0]);
        $http({
            url: base_url + '/admin_users/ajax_upload_image',
            method: "POST",
            data: formData,
            headers: { 'Content-Type': undefined }
        }).then(r => {
            $scope.newUrlUpload = r.data ? r.data.urlImage : '';
            getImageComplain();
        })
    }

    $scope.addNewPenance = () => {
        $scope.penance.comment_id = $scope.commentId;
        let ls_user = [];
        $scope.penance.ls_user.forEach(e => {
            ls_user.push(JSON.parse(e));
        })
        $scope.penance.ls_user = ls_user;

        $scope.penance.import_id = $scope.curentUserId;
        $('#penance').modal('hide');
        $http.post(base_url + '/customers/ajax_create_penance', $scope.penance).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.getPenance();
                toastr['success']("Tạo biên bản thành công!");
                $scope.penance = {
                    formality: 1
                }
            } else {
                $scope.penance = {
                    formality: 1
                };
                toastr["error"](r.data.message ? r.data.message : 'Đã có lổi xẩy ra!')
            }
        })
    }

    $scope.getPenance = () => {
        $http.get(base_url + '/customers/ajax_get_penance?comment_hide_id=' + $scope.commentId).then(r => {
            if (r.data && r.data.status == 1) $scope.ls_penances = r.data.data;
        })
    }

    //hander image --------
    function getImageComplain() {
        $http.get(base_url + '/admin_users/ajax_get_images_comment?comment_hide_id=' + $scope.commentId).then(r => {
            if (r.data && r.data.status == 1) $scope.ls_images = r.data;
        })
    }

    $scope.showImg = (img) => {
        $scope.currImg = img
    }

    $scope.showRequestFinshedComment = () => {
        $('#model_approve_request').modal('show');
    }

    $scope.sendRequestOffComment = () => {
        if ($scope.complain.note_finished && $scope.complain.note_finished != '') {
            let data = {
                id: $scope.commentId,
                note_finished: $scope.complain.note_finished,
                user_request_id: $scope.curentUserId,
                status: 3
            }

            updateComment(data);
            $('#model_request').modal('hide');
        }
    }

    function updateComment(comment) {
        $http.post(base_url + '/admin_users/ajax_update_comment', comment).then(r => {
            if (r.data && r.data.status == 1) {
                toastr['success']('cập nhật thành công!');
                $scope.getCommentDetail()
            } else {
                toastr['success']('Có lỗi xẩy ra vui lòng thử lại!');
            }
        })
    }

    $scope.approveRequestOffComment = () => {
        let data = {
            id: $scope.commentId,
            status: 4
        }
        updateComment(data);
        $('#model_approve_request').modal('hide');
    }

}); 