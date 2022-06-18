app.directive("whenScrolled", function () {
    return {
        restrict: 'A',
        link: function (scope, elem, attrs) {
            // we get a list of elements of size 1 and need the first element
            raw = elem[0];
            // we load more elements when scrolled past a limit
            elem.bind("scroll", function () {
                if (raw.scrollTop + raw.offsetHeight + 5 >= raw.scrollHeight) {
                    scope.$apply(attrs.whenScrolled);
                }
            });
        }
    }
});

app.directive('onErrorSrc', function () {
    return {
        link: function (scope, element, attrs) {
            element.bind('error', function () {
                if (attrs.src != attrs.onErrorSrc) {
                    attrs.$set('src', attrs.onErrorSrc);
                }
            });
        }
    }
});
app.controller('index', function ($scope, $http, $sce, $compile) {
    $scope.init = () => {
        ObjectGeneration();
        $scope.getAll();
        $scope.current_user_id = user_id;
        setTimeout(() => {
            $scope.background_loading = true;
        }, 200);
    }


    function ObjectGeneration() {

        $scope.filter = {};
        $scope.filter.status = 1;
        $scope.filter.tags = [];

        $scope.newWork = {};
        $scope.newWork.remind_type = '1';
        $scope.newWork.status = '1';
        $scope.newWork.files = [];
    }
    $scope.getAllWithStatus = (status) => {
        $scope.filter.status = status;
        $scope.getAll();
    }
    $scope.getAll = () => {
        $scope.list_loading = true;
        $http.get(base_url + 'works/ajax_get_current_user_works?filter=' + JSON.stringify($scope.filter)).then(r => {
            $scope.list_loading = false;
            if (r && r.data.status == 1) {
                $scope.rows = r.data.data;
                $scope.dataCount = r.data.count;
            } else toastr["error"](r.data.messages);
        })
    }
    $scope.converHtml = (htmlbd) => {
        return $sce.trustAsHtml(htmlbd);
    }
    $scope.openDetail = (id, type = 'all', fromParent = false) => {
        delete $scope.multiType;
        $scope.fromParent = fromParent;
        $scope.chatshow = false;
        $scope.reply_status = false;
        var filter = {
            id: id,
            type: type
        };
        $http.get(base_url + 'works/ajax_get_work_details?filter=' + JSON.stringify(filter)).then(r => {
            if (r && r.data.status == 1) {
                $scope.showType = 'detail';
                $scope.workDetail = r.data.data;
                $scope.chatList = r.data.comments;
                setTimeout(() => {
                    $("#chat").animate({
                        scrollTop: $("#chat")[0].scrollHeight
                    }, 0);
                    autoSize();
                }, 50);
            } else toastr["error"](r.data.messages);
        })
    }
    $scope.backtoParentComment = (id) => {
        $('.focusing').removeClass('focusing');
        var elmnt = document.getElementById("chatItem" + id);
        elmnt.scrollIntoView();
        $("#chatItem" + id).addClass('focusing');
    }
    $scope.close_rep = () => {
        $scope.reply_status = false;
    }
    $scope.reply_message = (item) => {
        $scope.reply_status = true;
        $scope.reply_detail = item;
        $('#chatTextID').focus();
        // $("#chat").animate({ scrollTop: $("#chat")[0].scrollHeight }, 300);
    }

    $scope.imageUpload = function (element, type = 'chat') {
        var files = event.target.files; //FileList object
        if (files.length == 0) return false;
        for (var i = 0; i < files.length; i++) {

            var file = files[i];
            var reader = new FileReader();

            reader.onload = function (readerEvent) {
                // var avatarImg = new Image();
                // var src = reader.result;
            }
            reader.readAsDataURL(file);
        }
        // $scope.saveImage(files)
        $scope.$apply(function () {
            if (type == 'chat') {
                $scope.onAttackFiles = files;
            }
            if (type == 'create') {
                $scope.saveImage(files, 'create');
            }
        });
    }
    $scope.removeFile = (index) => {
        delete $scope.onAttackFiles;
    }
    $scope.saveImage = (files, type = 'chat') => {
        var formData = new FormData();
        formData.append('file', files[0]);
        let fileType = files[0].name.split('.').pop();
        let codeType = ['jpeg', 'png', 'jpg', 'hex'].includes(fileType.toLowerCase()) ? 2 : 3;
        console.log(fileType);
        console.log(codeType);
        formData.append('file_extension', fileType);

        $scope.loading = true;
        $http({
            url: base_url + '/uploads/ajax_upload_to_filehost?func=works_index',
            method: "POST",
            data: formData,
            headers: {
                'Content-Type': undefined
            }
        }).then(r => {
            $scope.loading = false;
            if (r.data.status == 1) {
                if (type == 'chat') {
                    var data = {
                        work_id: $scope.workDetail.id,
                        content: r.data.data[0],
                        type: codeType,
                        parent_id: ($scope.reply_status) ? $scope.reply_detail.id : 0
                    }
                    $http.post(base_url + 'works/ajax_send_comment', data).then(r => {
                        $scope.send_comment_disabled = false;
                        if (r && r.data.status == 1) {
                            $scope.reply_status = false;
                            $scope.chatList = r.data.comments;
                            delete $scope.onAttackFiles;
                            $("#chat").animate({
                                scrollTop: $("#chat")[0].scrollHeight
                            }, 300);
                        } else toastr["error"](r.data.messages);
                    })
                }
                if (type == 'create') {
                    $scope.newWork.files = ($scope.newWork.files) ? $scope.newWork.files : [];
                    $scope.newWork.files.push({
                        file_type: r.data.file_type,
                        url: r.data.data[0]
                    })
                }
            } else {
                toastr["error"](r.data.message)
            }
        })
    }
    $scope.createChildWork = () => {
        if ($('#newc').length > 0) {
            return false;
        }
        $scope.newChild = {};
        var $el = $(`
        <div class="child-3-item d-flex ai-c new-child">
                <i class="fa fa-circle-o mgr-5" aria-hidden="true"></i>
                <input type="text" class="form-control work-child" id="newc" ng-model="newChild.name" placeholder="Công việc phụ mới.." ng-blur="confirmcreate()" />
        </div>
        `).appendTo('#be-appended');
        $compile($el)($scope);
        // $(".height-50").animate({ scrollTop: $(".height-50")[0].scrollHeight }, 300);
        setTimeout(() => {
            $('#newc').focus();
        }, 200);
    }
    $scope.createtag = () => {
        if ($('#newt').length > 0) {
            return false;
        }
        $scope.newTag = {
            color: '#fffff'
        };
        var $el = $(`
        <div class="w-100 d-flex ai-c j-sb po-r detail-multi-item newtag">
                        <div class="box-col"  ng-style="{'background-color': newTag.color}"></div>
                        <div class="d-flex j-sb ai-c" style="width: calc(100% - 40px)">
                            <input type="text" class="form-control work-child" id="newt" ng-model="newTag.name" placeholder="Tag mới.." ng-blur="confirmcreateTag()" />
                        </div>
                    </div>
        `).appendTo('.tags-outline');
        $compile($el)($scope);
        // $(".height-50").animate({ scrollTop: $(".height-50")[0].scrollHeight }, 300);
        setTimeout(() => {
            $('#newt').focus();
        }, 200);
    }
    $scope.confirmcreateTag = () => {
        if (!$scope.newTag.name || $scope.newTag.name == '') {
            $('.newtag').remove();
            return false;
        }
        $http.post(base_url + 'works/create_tag', $scope.newTag).then(r => {
            if (r && r.data.status == 1) {
                $('.newtag').remove();
                let work_id = ($scope.showType == 'detail') ? $scope.workDetail.id : 0;
                get_tags_realtions(work_id);
            }
        })

    }
    $scope.removeFile = (i) => {
        $scope.newWork.files.splice(i, 1);
    }
    $scope.send_comment = () => {
        $scope.send_comment_disabled = true;
        if ($scope.onAttackFiles && $scope.onAttackFiles.length > 0) {
            $scope.saveImage($scope.onAttackFiles);
        }
        if (!$scope.workDetail.chatText || $scope.workDetail.chatText == '') return false;
        var data = {
            work_id: $scope.workDetail.id,
            content: $scope.workDetail.chatText,
            parent_id: ($scope.reply_status) ? $scope.reply_detail.id : 0
        }
        $http.post(base_url + 'works/ajax_send_comment', data).then(r => {
            $scope.send_comment_disabled = false;
            if (r && r.data.status == 1) {
                $scope.reply_status = false;
                $scope.chatList = r.data.comments;
                delete $scope.workDetail.chatText;
                $("#chat").animate({
                    scrollTop: $("#chat")[0].scrollHeight
                }, 300);
                autoSize();
            } else toastr["error"](r.data.messages);
        })
    }
    $scope.homeback = () => {
        if ($scope.showType == 'detail' && $scope.fromParent) {
            $scope.openDetail($scope.workDetail.parent_id);
        } else {
            delete $scope.showType;
            $scope.getAll();
        }
    }
    $scope.showChat = () => {
        $scope.chatshow = !$scope.chatshow;
    }

    function jqElementReset() {
        $scope.select2();
        autoSize();
        timePicker();
        dateRangePicker();
    }
    $scope.openCreator = () => {
        $scope.vertical_open = true;
        $scope.verticalType = 'creator';
        jqElementReset();
        setTimeout(() => {
            $('#workname').focus();
            $('#workname').click();
        }, 50);
    }
    $scope.repOpenCreator = () => {
        $scope.changedetails = 0;
        $scope.repVertical = true;
        $scope.verticalType = 'edit';
        $scope.newWork = angular.copy($scope.workDetail);
        $scope.newWork.user_ids = [];
        angular.forEach($scope.workDetail.users, function (value, key) {
            $scope.newWork.user_ids.push(value.id);
        });
        if ($scope.workDetail.deadline_date != null) {
            $scope.newWork.deadline = true;
            if ($scope.workDetail.deadline_time != null) {
                $('#deadlinetime').val($scope.workDetail.deadline_time);
                $scope.newWork.time = true;
            }
        }
        jqElementReset();
        setTimeout(() => {
            $('#workname').focus().trigger('input');
        }, 50);
    }
    $scope.backEdit = () => {
        delete $scope.repVertical;
        delete $scope.verticalType;
        newWorkReset();
    }
    document.addEventListener("click", function (event) {
        if (event.target.closest(".fixed-button, .work-creator, .selection, .select2-selection__choice__remove, .preview-item, .multi-select")) return;
        else {
            $scope.$apply(function () {
                $scope.vertical_open = false;
            });
        }
    });
    $scope.select2 = () => {
        setTimeout(() => {
            $('.select2').select2();
        }, 50);
    }

    function autoSize() {
        setTimeout(() => {
            autosize($('textarea.autosize'));
        }, 50);
    }
    $scope.detailModal = (type) => {
        $scope.detailModalType = type;
        $('#detailModal').modal('show');
        if (type == 'images') {
            setTimeout(() => {
                $('#be-appended-img').html('');

                var appendHtml = `<div class="imgdetail-slider owl-carousel owl-theme">`;
                angular.forEach($scope.workDetail.files, function (value, key) {
                    if (value.file_type == 2) {
                        appendHtml += `<div class="imgdetail-slider-item po-r">
                        <img src="${base_url + value.url}" class="w-100" alt="">
                    </div>`;
                    }
                });
                appendHtml += `</div>`;
                $('#be-appended-img').html(appendHtml);
                setTimeout(() => {
                    $('.imgdetail-slider').owlCarousel({
                        loop: true,
                        margin: 0,
                        nav: false,
                        items: 1,
                        dots: true,
                        autoplay: false,
                        autoplayTimeout: 5000
                    });
                    $('.owl-prev').html('<i class="fa fa-angle-left" aria-hidden="true"></i>');
                    $('.owl-next').html('<i class="fa fa-angle-right" aria-hidden="true"></i>');
                }, 100);
            }, 10);


        }
    }

    function timePicker() {
        setTimeout(() => {
            $('.bs-timepicker').timepicker();
        }, 50);
    }

    function dateRangePicker() {
        setTimeout(() => {
            $('.custom-daterange2').daterangepicker({
                opens: 'right',
                alwaysShowCalendars: true,
                singleDatePicker: true,
                startDate: moment(),
                // maxDate: moment(),
                maxYear: parseInt(moment().format('YYYY'), 10),
                locale: {
                    format: 'DD/MM/YYYY',
                }
            });
        }, 50);
    }
    $scope.changeCreateWorkStatus = () => {
        $scope.createshow = !$scope.createshow;
        if ($scope.createshow) {
            var temp = $scope.newWork.name;
            newWorkReset();
            $scope.newWork.name = temp;
        }
    }
    $scope.confirmcreate = () => {
        if (!$scope.newChild.name || $scope.newChild.name == '') {
            $('.new-child').remove();
            return false;
        }

        newWorkReset();
        $scope.newWork.parent_id = $scope.workDetail.id;
        $scope.newWork.name = $scope.newChild.name;

        $scope.generateNewWork('child')
    }

    function newWorkReset() {
        $scope.newWork = {};
        $scope.newWork.remind_type = '1';
        $scope.newWork.status = '1';
        $scope.newWork.files = [];
        jqElementReset();
    }
    $scope.confirm_update = () => {
        $scope.changedetails = 0;
        $scope.generateNewWork();
    }
    $scope.generateNewWork = (type = 'parent') => {
        // $scope.vertical_open = false;
        if ($scope.changedetails == 1 && $scope.newWork.status == '2' && $scope.newWork.parent_id == 0) {
            $scope.md_confirm = 'confirmUpdate';
            return false;
        }
        $scope.newWork.deadline_time = $('#deadlinetime').val();
        $scope.newWork.remind_hours = $('#remind_time').val();

        // if (!$scope.newWork.user_ids || $scope.newWork.user_ids.length <= 0) {
        //     toastr.error('Hãy chọn nhân viên liên quan!');
        //     return false;
        // }
        if ($scope.newWork.time && $scope.newWork.deadline_time == "") {
            toastr.error('Nhập thời gian deadline đầy đủ!');
            return false;
        }
        if ($scope.newWork.remind_status && (!$scope.newWork.remind_days || $scope.newWork.remind_days.length <= 0 || $scope.newWork.remind_time == "")) {
            toastr.error('Nhập đầy đủ thông tin nhắc nhở!');
            return false;
        }
        if ($scope.verticalType == 'edit') {
            $scope.newWork.type = 'edit';
        }
        $http.post(base_url + 'works/ajax_generate_new_work', $scope.newWork).then(r => {
            if (r && r.data.status == 1) {
                if ($scope.verticalType == 'edit') {
                    toastr.success('Đã chỉnh sửa!');
                    $scope.openDetail($scope.workDetail.id);
                    $scope.backEdit();
                    $scope.md_confirm = false;
                    return true;
                }
                toastr.success('Đã tạo thành công!');
                $scope.getAll();
                $scope.vertical_open = false;
                if (type == 'child') {
                    $('.new-child').remove();
                    $scope.openDetail($scope.workDetail.id);
                }
                newWorkReset();
            } else toastr["error"](r.data.messages);
        })
    }
    $scope.setChangeStatus = () => {
        $scope.changedetails = 1;
    }
    $scope.remindaySelect = () => {
        if ($scope.newWork.remind_days[0] == '0') {
            $scope.newWork.remind_days = ['0'];
            $scope.select2();
        }
    }

    $scope.fileSelect = () => {
        $('#inputFileEdit').click();
    }

    function get_tags_realtions(work_id = 0) {
        $http.get(base_url + 'works/ajax_get_tags_realtions/' + work_id).then(r => {
            if (r && r.data.status == 1) {
                $scope.tags_currents = r.data.data;
            } else toastr["error"](r.data.messages);
        })
    }
    $scope.changeTag = (item) => {
        item.selected = !item.selected;
    }
    $scope.multiSelect = (type) => {
        $scope.multiType = type;
        switch (type) {
            case 'tags':
                let work_id = ($scope.newWork.id) ? $scope.newWork.id : 0;

                if ($scope.showType == 'detail') {
                    work_id = $scope.workDetail.id;
                }
                get_tags_realtions(work_id);
                break;
            case 'notification':
                get_notifications();
                break;
            default:
                break;
        }
    }

    function get_notifications() {
        $http.get(base_url + 'works/ajax_get_notification').then(r => {
            if (r && r.data.status == 1) {
                $scope.notification_data = r.data.data;
            } else toastr["error"](r.data.messages);
        })
    }
    $scope.multiselectBack = () => {
        delete $scope.multiType;
    }
    $scope.openConfirm = (type, item = {}) => {
        if (type != 'removetag' && type != 'statusEdit') {
            if ($scope.workDetail.created_user_id != $scope.current_user_id) return false;
        }
        $scope.md_confirm = type;
        switch (type) {
            case 'removetag':
                $scope.tag_onside = item;
                break;
            case 'deadlineEdit':
                jqElementReset();
                break;
            case 'statusEdit':
                break;
            case 'noteEdit':
                $scope.newWork.note = $scope.workDetail.note;
                break;
            case 'nameEdit':
                $scope.newWork.name = $scope.workDetail.name;
                break;
            case 'peopleEdit':
                $scope.newWork.user_ids = [];
                angular.forEach($scope.workDetail.users, function (value, key) {
                    $scope.newWork.user_ids.push(value.id);
                });
                jqElementReset();
                break;
            default:
                break;
        }
    }
    $scope.updateElementDetail = (type, value = 0) => {
        var data = {
            id: $scope.workDetail.id
        }
        if (type == 'status') data.status = value;
        if (type == 'note') data.note = $scope.newWork.note;
        if (type == 'people') data.user_ids = $scope.newWork.user_ids;
        if (type == 'name') data.name = $scope.newWork.name;

        if (type == 'deadline') {
            if ($scope.newWork.deadline) {
                data.deadline_time = $('#deadlinetime2').val();
            }
            data.deadline_date = $scope.newWork.deadline_date;
        }
        $http.post(base_url + 'works/ajax_update_work', data).then(r => {
            if (r && r.data.status == 1) {
                $scope.openDetail($scope.workDetail.id);
                newWorkReset();
                delete $scope.md_confirm;
            }
        })
    }
    $scope.deleteWork = () => {
        $http.get(base_url + 'works/ajax_remove_work/' + $scope.workDetail.id).then(r => {
            if (r && r.data.status == 1) {
                delete $scope.md_confirm;
                $scope.homeback();
            } else toastr["error"](r.data.messages);
        })
    }
    $scope.confirmRemove = () => {
        switch ($scope.md_confirm) {
            case 'removetag':
                $http.get(base_url + 'works/ajax_remove_tag/' + $scope.tag_onside.id).then(r => {
                    if (r && r.data.status == 1) {
                        let work_id = ($scope.newWork.id) ? $scope.newWork.id : 0;
                        get_tags_realtions(work_id);
                        delete $scope.md_confirm;
                    } else toastr["error"](r.data.messages);
                })
                break;
            default:
                break;
        }
    }
    $scope.closeConfirmMd = () => {
        delete $scope.md_confirm;
    }
    $scope.saveMultiTypeChanges = () => {
        switch ($scope.multiType) {
            case 'tags':
                $scope.newWork.tags = [];
                angular.forEach($scope.tags_currents, function (value, key) {
                    if (value.selected) {
                        $scope.newWork.tags.push(value);
                    }
                });
                if ($scope.showType == 'detail') {
                    work_id = $scope.workDetail.id;
                    let data = {
                        work_id: work_id,
                        tags: $scope.newWork.tags
                    };
                    $http.post(base_url + 'works/ajax_edit_work_tags', data).then(r => {
                        if (r && r.data.status == 1) {
                            toastr["success"](r.data.messages);

                            $scope.openDetail($scope.workDetail.id)
                        } else toastr["error"](r.data.messages);
                    })
                }
                break;
            default:
                break;
        }
        delete $scope.multiType;
    }
    $scope.openColorBoard = (item) => {
        if ($scope.current_user_id != item.user_id) {
            return false;
        }
        angular.forEach($scope.tags_currents, function (value, key) {
            value.colorboard = false;
        });
        item.colorboard = true;
    }
    document.addEventListener("click", function (event) {
        if (event.target.closest(".box-col, .color-board")) return;
        else {
            angular.forEach($scope.tags_currents, function (value, key) {
                value.colorboard = false;
            });
            $scope.$apply();
        }
    });
    $scope.updateTagColor = (tag, color) => {
        let data = {
            id: tag.id,
            color: color
        };
        $http.post(base_url + 'works/ajax_edit_tags_color', data).then(r => {
            if (r && r.data.status == 1) {
                tag.color = color;
            } else toastr["error"](r.data.messages);
        })
    }
    $scope.openEditTag = (item) => {
        if ($scope.current_user_id != item.user_id) {
            return false;
        }
        angular.forEach($scope.tags_currents, function (value, key) {
            value.editname = false;
        });
        $scope.oldTagname = angular.copy(item.name);
        item.editname = true;
        setTimeout(() => {
            $('#tagname' + item.id).focus();
        }, 100);
    }
    $scope.updateTagname = (item) => {
        if (item.name == $scope.oldTagname) {
            item.editname = false;
            return false;
        }
        let data = {
            id: item.id,
            name: item.name
        };
        $http.post(base_url + 'works/ajax_edit_tags_name', data).then(r => {
            if (r && r.data.status == 1) {
                item.editname = false;
            } else toastr["error"](r.data.messages);
        })
    }
    $scope.openFilter = () => {
        $scope.opft = !$scope.opft;
        if (!$scope.opft) {
            $scope.filter.tags = [];
            $scope.getAll();
        }
        get_tags_realtions();
    }
    $scope.selectTagFilter = (item) => {
        if (item.selected_os) {
            delete item.selected_os;
            const index = $scope.filter.tags.indexOf(item.id);
            if (index > -1) {
                $scope.filter.tags.splice(index, 1);
            }
        } else {
            item.selected_os = true;
            $scope.filter.tags.push(item.id);
        }
        $scope.getAll();
    }
});