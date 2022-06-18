app.controller('ComplainCtrl', function ($scope, $http, $sce, $window) {
    $scope.init = () => {
        $scope.isAdmin = isAdmin;
        $scope.isManager = isManager;
        $scope.havePerUpdateLevel = havePerUpdateLevel;
        $scope.havePerAddUserHandle = havePerAddUserHandle;
        $scope.havePerAddComplainant = havePerAddComplainant;
        $scope.havePerRequestFinished = havePerRequestFinished;
        $scope.havePerUpdateDealine = havePerUpdateDealine;
        $scope.havePerCreateDoc = havePerCreateDoc ;
        $scope.havePerConfirmFinished = havePerConfirmFinished;
        $scope.idCP = $('#idCP').val();
        $scope.curentUserId = $('#currentUserId').val();
        $scope.curentUser = null;
        $scope.lsMessage = [];
        $scope.lsCustomer = [];
        $scope.newMessage = {};
        $scope.selectedFriend = [];
        $scope.selectedPersonProcess = [];
        $scope.nationId = 0;
        $scope.is_popup = '';
        $scope.images = [];
        $scope.newUrlUpload = '';
        $scope.userHandleComplain = [];
        $scope.penance = {};
        $scope.userJoinComplainAll = [];
        $scope.ls_images = [];
        $scope.userComplainant = [];
        $scope.lsAllUser = [];
        $scope.lsUser = {};
        $scope.lsUserTag = [];
        $scope.getPenance();
        $scope.penance.formality = 1;
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
        loadImageComplain();
        getMessage();
        getComplain();
        getCurrentUser();
        getUserJoinComplain();
        $scope.oldComplains = [];
        getOldComplain($scope.idCP);
        //delete header alert
        $('.alert-dismissible').css('display', 'none');
        reloadMessage();
        setTimeout(() => {
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

        $scope.getLevelComplain();
        $scope.updateLevel = {};

        setTimeout(() => {
            autoCrollBottom();
            $scope.ckeditor.on('keyup', function (event) {
                alert(e.getData());
            });
        }, 1000);

        var today = new Date();
        let dte = moment(today).format('YYYY-MM-DD HH:mm:00');
        setTimeout(() => {
            $('#datetimepicker1').daterangepicker({
                singleDatePicker: true,
                timePicker: true,
                timePicker24Hour: true,
                autoApply: false,
                autoUpdateInput: false,
                drops: 'down',
                autoclose: false,
                locale: {
                    format: 'YYYY-MM-DD HH:mm:ss'
                },
            }).val(dte);
            $("#datetimepicker1").trigger("change");
            $('#datetimepicker1').on('apply.daterangepicker', function (ev, picker) {
                $(this).val(picker.startDate.format('YYYY-MM-DD HH:mm:ss'));
                $("#datetimepicker1").trigger("change");
            });
            // $("#datetimepicker1").data('daterangepicker').setStartDate(today);
        }, 50);
        select2_img();
    }

    function getOldComplain(cp_id) {
        $http.get(base_url + '/customers/ajax_get_complain_old?complain_id=' + cp_id).then(r => {
            if (r && r.data.status == 1) {
                $scope.oldComplains = r.data.data;
            }
            //  else toastr["error"]("Không tồn tại Khiếu nại!");
        })
    }



    $scope.handleTagName = (item) => {
        var newElement = CKEDITOR.dom.element.createFromHtml(`<span style="color: #1479fb;" value="${item.id}" >@${item.user_name}</span> `, $scope.ckeditor.document);
        CKEDITOR.instances.textboxMessage.insertElement(newElement);
        $scope.lsUserTag.push(item);
        $scope.selectedName = [];
    }

    $scope.showRequestFinshedComplain = () => {
        $('#model_approve_request').modal('show');
    }

    $scope.formatDateToTime = (date, type) => {
        return moment(date).format(type)
    }

    $scope.showImg = (img) => {
        $scope.currImg = img
    }

    $scope.sendRequestOffComplain = () => {
        if ($scope.complain.note_finished && $scope.complain.note_finished != '') {
            let data = {
                id: $scope.complain.id,
                note_finished: $scope.complain.note_finished,
                user_request_id: $scope.curentUserId,
                status: 3
            }
            update_complain(data);
            $('#model_request').modal('hide');
        }
    }

    $scope.approveRequestOffComplain = () => {
        let data = {
            id: $scope.complain.id,
            status: 4,
            user_approve_id: $scope.curentUserId
        }
        update_complain(data);
        $('#model_approve_request').modal('hide');
    }

    function update_complain(data) {
        $http.post(base_url + '/customers/update_complain', data).then(r => {
            if (r && r.data.status == 1) {
                toastr['success']("Đã gửi yêu cầu thành công!");
                getComplain();

            } else toastr["error"]("Đã có lỗi xẩy ra!");
        })
    }

    $scope.redirtToHistory = () => {
        window.open(base_url + '/customers/history/' + $scope.complain.customer_id)
    }

    $scope.chooseUser = () => {
        //type = 1 Người xử lí
        //type = 2 người bị khiếu nại
        //type = 0 người theo dõi
        //type = 3 admin

        var data = {
            customer_complain_id: $scope.idCP,
            type: 0,
            ls_user_id: $scope.selectedFriend
        };

        if ($scope.is_popup == 'PROCESS') data.type = 1;
        if ($scope.is_popup == 'COMPLAIN') data.type = 2;

        $scope.addNewUserToComlain(data);
        $scope.selectedFriend = [];
    }

    $scope.trustAsHtml = function (value) {
        return $sce.trustAsHtml(value.note);
    }

    //hander image --------
    function loadImageComplain() {
        $http.get(base_url + '/customers/ajax_get_images_complain?customer_complain_id=' + $scope.idCP).then(r => {
            if (r.data && r.data.status == 1) $scope.ls_images = r.data;
        })
    }
    $scope.attachFile = () => {
        $('#upload_image').click();
    }

    $scope.imageUpload = function (element) {
        var files = event.target.files; //FileList object

        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var reader = new FileReader();
            reader.onload = $scope.imageIsLoaded;
            reader.readAsDataURL(file);
        }
        $scope.saveImage(files)
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
            url: base_url + '/customers/ajax_upload_image',
            method: "POST",
            data: formData,
            headers: { 'Content-Type': undefined }
        }).then(r => {
            $scope.newUrlUpload = r.data ? r.data.urlImage : '';
        })
    }

    //end hander image --------


    function getMessage() {
        $http.get(base_url + '/customers/ajax_get_message?id=' + $scope.idCP).then(r => {
            $scope.lsMessage = r.data ? r.data : [];
            // $scope.lsMessage.forEach(e=>{
            //     e.note = e.note + `<i style="float:right;font-size:10px">${moment(e.created).format('DD/MM/YYYY HH:mm')}</i>`
            // })
        });
    }

    function getComplain() {
        $http.get(base_url + '/customers/ajax_get_complain?id=' + $scope.idCP).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.complain = r.data.data;
            } else {
                toastr['error']('Không tồn tại khiếu nại');
            }
        });
    }

    function getUserJoinComplain() {
        $http.get(base_url + '/customers/ajax_get_user_join_complain?idcp=' + $scope.idCP).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.lsUser = r.data.data;
                $scope.userJoinComplain = r.data.data.userRelate.slice(0, 4);
                $scope.lsAllUser = [];
                $scope.lsAllUser = $scope.lsAllUser.concat($scope.lsUser.userAdmin, $scope.lsUser.userHandle, $scope.lsUser.userRelate, $scope.lsUser.userSued);
            }
            $scope.checkRole()
        });
    }

    function getCurrentUser() {
        $http.get(base_url + '/ajax/get_current_user?id=' + $scope.curentUserId).then(r => {
            $scope.curentUser = r.data;
        });
    }

    $scope.sendMessage = () => {
        if ($scope.isSendMess) {
            $scope.newMessage.note = CKEDITOR.instances.textboxMessage.getData();
            let tag = [];
            $scope.lsUserTag.forEach(e => {
                $scope.newMessage.note = $scope.newMessage.note + '';
                if ($scope.newMessage.note.search(`value="${e.id}"`) >= 0) {
                    tag.push(e);
                };
            })
            if (($scope.newMessage.note && $scope.newMessage.note != '') || ($scope.newUrlUpload && $scope.newUrlUpload != '')) {
                $scope.newMessage.user_id = $scope.curentUserId;
                $scope.newMessage.customer_complain_id = $scope.idCP;
                $scope.newMessage.image_url = $scope.newUrlUpload;
                $scope.newMessage.ls_user_tag = tag;
                $scope.lsUserTag = [];
                $http.post(base_url + '/customers/ajax_send_message', $scope.newMessage).then(r => {
                    getMessage();
                    $scope.remove_image();
                    $scope.newMessage.note = '';
                    autoCrollBottom();
                    $scope.updateUserView();
                })
            }
            if ($scope.newUrlUpload && $scope.newUrlUpload != '') {
                loadImageComplain();
            }
            CKEDITOR.instances.textboxMessage.setData('');
        }
    }

    $('#textboxMessage').on('keydown', function (event) {
        if (event.keyCode == 13)
            if (!event.shiftKey) {
                $scope.sendMessage();
            }
    });

    $scope.addNewUserToComlain = (data) => {
        $http.post(base_url + '/customers/ajax_join_user_to_complain/', data).then(r => {
            if (r.data && r.data.status == 1) {
                toastr['success']("Thêm thành công!");
                getUserJoinComplain();
            } else {
                toastr['error']("Đã có lổi xẩy ra. Vui lòng thử lại!");
            }
        })
    }

    $scope.getPenance = () => {
        $http.get(base_url + '/customers/ajax_get_penance?customer_complain_id=' + $scope.idCP).then(r => {
            if (r.data && r.data.status == 1) $scope.ls_penances = r.data.data;
        })
    }

    $scope.addNewPenance = () => {
        $scope.penance.customer_complain_id = $scope.idCP;
        let ls_user = [];
        $scope.penance.ls_user.forEach(e => {
            ls_user.push(JSON.parse(e));
        })
        $scope.penance.ls_user = ls_user;
        console.log($scope.penance.ls_user);

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

    $scope.deleteUserInComplain = (value, type) => {
        $http.post(base_url + '/customers/ajax_delete_user_join_complain', value).then(r => {
            getUserJoinComplain();
        })
    }

    function autoCrollBottom() {
        //auto croll bottom
        $('.messages').animate({
            scrollTop: $('.messages').get(0).scrollHeight
        }, 1500);
    }

    $scope.showpopup = (value) => {
        $scope.is_popup = value;
    }

    $scope.updateUserView = () => {
        let data = {
            customer_complain_id: $scope.idCP
        }
        $http.post(base_url + '/customers/ajax_update_user_view', data).then(r => {
        })
    }

    $scope.checkRole = () => {
        let userAdmin = $scope.lsUser.userAdmin.find(r => r.user_id == $scope.curentUserId);
        let userHandle = $scope.lsUser.userHandle.find(r => r.user_id == $scope.curentUserId);
        let userRelate = $scope.lsUser.userRelate.find(r => r.user_id == $scope.curentUserId);
        let userSued = $scope.lsUser.userSued.find(r => r.user_id == $scope.curentUserId);

        $scope.isAdmin = userAdmin ? true : false;
        $scope.isManager = userHandle ? true : false;

        $scope.isUserRelate = userRelate ? true : false;
        $scope.isSued = userSued ? true : false;
        $scope.isSendMess = 1;
    }

    function reloadMessage() {
        getMessage();
        $scope.updateUserView();
    }

    $scope.getLevelComplain = () => {
        $http.get(base_url + '/options/ajax_get_level_complain').then(r => {
            if (r.data) {
                $scope.complains = r.data;
            }
        })
    }

    $scope.openComplain = (id) => {
        window.open(`${base_url}customers/complain_detail/${id}`);
    }

    $scope.showDescriptionLevel = (level) => {
        $scope.complains.forEach(element => {
            if (element.level == level) {
                Swal.fire({
                    title: 'Khiếu nại cấp độ ' + level,
                    html: element.description.replace(/(?:\r\n|\r|\n)/g, '<br>'),
                    // icon: 'question',
                    showConfirmButton: true,
                    showCancelButton: false,
                    allowOutsideClick: true,
                }).then((result) => {
                    if (result.value) {

                    }
                })
            }
        });
    }

    $scope.selectLevel = (value) => {
        Swal.fire({
            title: 'Bạn chọn khiếu nại cấp độ ' + value.level,
            html: value.description.replace(/(?:\r\n|\r|\n)/g, '<br>'),
            icon: 'question',
            showConfirmButton: true,
            showCancelButton: false,
            allowOutsideClick: true,
        }).then((result) => {
            if (result.value) {

            }
        })
    }

    $scope.showModalUpdateLevel = (complain) => {
        $('#model_update_level').modal('show');
        $scope.updateLevel.id = complain.id;
        $scope.updateLevel.level = complain.complain_level;
    }

    $scope.updateComplainLevel = () => {
        $http.post(base_url + '/customers/update_complain_level', JSON.stringify($scope.updateLevel)).then(r => {
            if (r && r.data.status == 1) {
                $scope.complain.complain_level = $scope.updateLevel.level;
                $('#model_update_level').modal('hide');
                Swal.fire(r.data.message, '', 'success');
            } else Swal.fire(r.data.message, '', 'error');
        });
    }

    $scope.showModalUpdateComplainEnd = () => {
        $scope.dataUpdateComplainEnd = angular.copy($scope.complain);

        let deadline = $scope.dataUpdateComplainEnd.deadline.split('/');
        let time = deadline[2].split(' ');

        $scope.dataUpdateComplainEnd.deadline = time[0] + '-' + deadline[1] + '-' + deadline[0] + ' ' + time[1];
        let setDate = new Date($scope.dataUpdateComplainEnd.deadline);
        $("#datetimepicker1").data('daterangepicker').setStartDate(setDate);
        $('#model_update_deadline').modal('show');
    }

    $scope.updateComplainEnd = () => {
        let arr_complain_date = $scope.dataUpdateComplainEnd.complain_date.split('/');
        $scope.dataUpdateComplainEnd.complain_date = arr_complain_date[2] + '-' + arr_complain_date[1] + '-' + arr_complain_date[0];
        let start = new Date($scope.dataUpdateComplainEnd.complain_date);
        let end = new Date($scope.dataUpdateComplainEnd.deadline);
        if (start > end) {
            toastr["error"]("Ngày kết thúc không thể lớn hơn deadline!");
            return;
        }

        $scope.loadSubmit = true;
        $http.post(base_url + '/customers/update_complain_end', JSON.stringify($scope.dataUpdateComplainEnd)).then(r => {
            if (r && r.data.status == 1) {
                let arr_deadline = $scope.dataUpdateComplainEnd.deadline.split('-');
                let time = arr_deadline[2].split(' ');

                $scope.complain.deadline = time[0] + '/' + arr_deadline[1] + '/' + arr_deadline[0] + ' ' + time[1];
                $('#model_update_deadline').modal('hide');
                Swal.fire(r.data.message, '', 'success');
            } else Swal.fire(r.data.message, '', 'error');
            $scope.loadSubmit = false;
        });
    }
});