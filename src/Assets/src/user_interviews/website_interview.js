app.controller('website_interview', function ($scope, $http, $sce) {
    var pi = $scope.pagingInfo = {
        itemsPerPage: 20,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };

    $scope.init = () => {
        $scope.isUserID = isUserID;
        $scope.isStep = 1;
        $scope.note = {};
        $scope.filter = {};
        $scope.filter.loading = false;
        $scope.filter.is_web = true;
        $scope.filter.web_status = '0';
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;
        $scope.getAll();
        setTimeout(() => {
            select2_img();
        }, 50);
        loadCKEDITOR();
    }

    $scope.doNext = (val) => {
        $scope.isStep = val;
        select2_img();
    }

    $scope.doChange = (val) => {
        if ($scope.isStep > val || $scope.isAction == 'VIEW') {
            $scope.isStep = val;
        }
    }

    $scope.getAll = () => {
        $scope.filter.loading = true;
        $http.get(base_url + '/user_interviews/ajax_get_list_interview?filter=' + JSON.stringify($scope.filter)).then(r => {
            $scope.filter.loading = false;
            if (r.data.status == 1) {
                $.each(r.data.data, function (key, value) {
                    if (value.note_process != '') {
                        value.note_process = JSON.parse(value.note_process);
                    }
                });
                $scope.rows = r.data.data;
                console.log($scope.rows);
                $scope.pagingInfo.total = r.data.count;
                $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
            } else {
                toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
            }
        });
    }
    $scope.openRefuse = (id) => {
        $('#exampleCheck1').attr('checked', 'checked');
        $('#inputEmail').css('display', 'block');
        $('#formRefuse').modal('show');
        $http.post(base_url + '/user_interviews/ajax_get_body_refuse_interview/' + id).then(r => {
            if (r.data && r.data.status == 1) {
                CKEDITOR.instances.bodySendEmail.setData(r.data.data);
            }
        });
    }

    $scope.openEmail = () => {
        $('#inputEmail').toggle(500);
        $('#body').toggle(500);
        if ($('#exampleCheck1').prop("checked") == false) {
            $('#formRefuse .modal-dialog').removeClass("modal-cus");
        } else {
            $('#formRefuse .modal-dialog').addClass("modal-cus");
        }
    }

    $scope.openInterview = (id, act) => {
        $scope.isStep = 1;
        $scope.isAction = act;
        if ($scope.isAction == 'VIEW') {
            getInterviewDetail(id);
        } else {
            $scope.note.id = id;
            $('#addNoteview').modal('show');
        }
    }

    $scope.openNoteview = (id, id_note, act, note) => {
        $scope.isAction = act;
        if ($scope.isAction == 'UPDATE' || $scope.isAction == 'EDIT') {
            $scope.note.id = id;
            $scope.note.note = note;
            $scope.note.id_note = id_note;
            $('#addNoteview').modal('show');
        } else {
            $error = confirm('Bạn muốn xóa không');
            if ($error == true) {
                getNoteDelete(id, id_note);
            } else {
                toastr["success"]('Yêu cầu của bạn đã hủy');
            }
        }
    }

    function getNoteDelete(id, id_note) {
        $http.post(base_url + '/user_interviews/ajax_delete_note?id=' + id + '&id_note=' + id_note).then(r => {
            if (r.data.status == 1) {
                toastr["success"]('Xóa thành công');
                $scope.getAll();
            } else {
                toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
            }
        });
    }

    function getInterviewDetail(id) {
        $http.get(base_url + '/user_interviews/ajax_get_website_interview_detail?id=' + id).then(r => {
            if (r.data.status == 1) {
                $('#addInterview').modal('show');
                $scope.interview = r.data.data;
                $scope.interview.id_date = $scope.interview.id_date && $scope.interview.id_date != '0000-00-00' ? moment($scope.interview.id_date).format('DD-MM-YYYY') : '';
                $scope.interview.birthday = $scope.interview.birthday && $scope.interview.birthday != '0000-00-00' ? moment($scope.interview.birthday).format('DD-MM-YYYY') : '';
                $scope.changeNation();
                $scope.changeProvice();
                $scope.handleChangeGroup($scope.interview.group_id);
                select2_img();
            } else {
                toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
            }
        });
    };

    $scope.refuseInterviews = (id) => {
        $scope.loading_send_email = true;
        if ($('#exampleCheck1').prop("checked") == true) {
            $scope.note.email = $('#exampleInputEmail1').val();
        } else {
            $scope.note.email = '';
        }
        $scope.note.body = CKEDITOR.instances.bodySendEmail.getData();
        $http.post(base_url + '/user_interviews/ajax_refuse_interview/' + id, $scope.note).then(r => {
            if (r.data.status == 1) {
                $('#addInterview').modal('hide');
                $('#formRefuse').modal('hide');
                toastr["success"]('Cập nhật thành công');

                if (r.data.status_send_email == 1) {
                    toastr["success"]('Gửi email thành công');
                } else if (r.data.status_send_email == 2) {
                    toastr["error"]('Gửi email thất bại!');
                }

                $scope.getAll();
            } else {
                toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
            }
            $scope.loading_send_email = false;
        });
    }

    $scope.submitNote = (id) => {
        $http.post(base_url + '/user_interviews/ajax_update_note?id=' + id, $scope.note).then(r => {
            if (r.data.status == 1) {
                $('#addNoteview').modal('hide');
                toastr["success"]('Cập nhật thành công');
                $scope.note.note_process = '';
                $scope.getAll();
            } else {
                toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
            }
        });
    }
    $scope.updateNoteDetail = (id, id_note) => {
        $http.post(base_url + '/user_interviews/ajax_updatedetail_note?id=' + id + '&id_note=' + id_note, $scope.note).then(r => {
            if (r.data.status == 1) {
                $('#addNoteview').modal('hide');
                toastr["success"]('Cập nhật thành công');
                $scope.getAll();
            } else {
                toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
            }
        });
    }
    $scope.confirmUI = (item) => {
        console.log(item);
        var a = confirm('Hoàn thành xét duyệt hồ sơ này!');
        if (a) {
            item.web_status = 2;
            var data = {};
            data.web_status = 2;
            data.id = item.id;
            data.group_id = item.group_id;
            // data.interview_request_id = item.interview_request_id;
            data.note = item.note;
            data.store_id = item.store_id;
            data.users = item.users;
            data.interview_request_id = item.interview_request_id;

            $http.post(base_url + 'user_interviews/ajax_confirm_an_interview', data).then(r => {
                if (r.data.status == 1) {
                    $('#addInterview').modal('hide');
                    $scope.getAll();
                } else {
                    toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
                }
            });
        }
    }
    $scope.handleChangeGroup = (val) => {
        $http.get(base_url + '/user_interviews/ajax_get_request_by_group?id=' + val).then(r => {
            if (r.data.status == 1) {
                $scope.requests = r.data.data;
                select2_img();
            } else {
                toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
            }
        });
    }
    $scope.changeNation = () => {
        $http.get(base_url + '/admin_users/ajax_get_provinces?nation_id=' + $scope.interview.nation_id).then(r => {
            if (r && r.data.status == 1) {
                $scope.provinces = r.data.data;
                select2_img();
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }
    $scope.changeProvice = () => {
        $http.get(base_url + '/admin_users/ajax_get_district/?province_id=' + $scope.interview.province_id).then(r => {
            if (r && r.data.status == 1) {
                $scope.districts = r.data.data;
                select2_img();
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    $scope.go2Page = function (page) {
        if (page < 0) return;
        var pi = $scope.pagingInfo;
        pi.currentPage = page;
        pi.from = pi.offset = (pi.currentPage - 1) * pi.itemsPerPage;
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = ($scope.pagingInfo.currentPage - 1) * $scope.pagingInfo.itemsPerPage;
        $scope.getAll();
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

    function loadCKEDITOR() {
        setTimeout(() => {
            $scope.bodySendEmail = CKEDITOR.replace('bodySendEmail', {
                uiColor: '#f2f3f5',
                // removePlugins: 'toolbar',
                height: '600',
                toolbarGroups: [{
                        name: 'document',
                        groups: ['mode', 'document', 'doctools']
                    },
                    {
                        name: 'clipboard',
                        groups: ['clipboard', 'undo']
                    },
                    {
                        name: 'editing',
                        groups: ['find', 'selection', 'spellchecker', 'editing']
                    },
                    {
                        name: 'forms',
                        groups: ['forms']
                    },
                    {
                        name: 'basicstyles',
                        groups: ['basicstyles', 'cleanup']
                    },
                    {
                        name: 'paragraph',
                        groups: ['list', 'indent', 'blocks', 'align', 'bidi', 'paragraph']
                    },
                    {
                        name: 'links',
                        groups: ['links']
                    },
                    {
                        name: 'insert',
                        groups: ['insert']
                    },
                    {
                        name: 'styles',
                        groups: ['styles']
                    },
                    {
                        name: 'colors',
                        groups: ['colors']
                    },
                    {
                        name: 'tools',
                        groups: ['tools']
                    },
                    {
                        name: 'others',
                        groups: ['others']
                    },
                    {
                        name: 'about',
                        groups: ['about']
                    }
                ]
            });
        }, 100);
    }

    $scope.openProfile = (item) => {
        $scope.profile = angular.copy(item);
        $('#profile').modal('show');
    }
})