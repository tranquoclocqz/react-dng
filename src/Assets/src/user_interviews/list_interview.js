app.controller('interViewCtrl', function ($scope, $http, $sce, AdminStoreSvc, listInterviewSvc, RatingUserInterviewSvc) {
    var pi = $scope.pagingInfo = {
        itemsPerPage: 10,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };
    const CKEDITOR_CONFIG = [{
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
    ];

    $scope.init = () => {
        $scope.isLoading = false;
        $('.box-1').css('opacity', '1');
        $scope.roleCreateRequestByPosition = roleCreateRequestByPosition;
        $scope.images = [];
        $scope.is_notification = false;
        $scope.isOpen = 'INTERVIERW';
        $scope.admin_stores = admin_stores;
        $scope.admin_stores_create = {};
        $scope.admin_stores_filter = {};
        $scope.ls_company = ls_company;
        $scope.ls_company_filter = ls_company;
        $scope.list_interviewer = list_interviewer;
        $scope.interview = {
            users: [],
            images: []
        };
        $scope.roleCreateRequest = {
            user: [],
            group: []
        }
        $scope.requests = [];
        $scope.isStep = 1;
        $scope.isView = (isView && isView != '') ? isView : 6;
        $scope.groups = [];
        $scope.selectedDate = '';
        $scope.selectedUser = [];
        $scope.ls_users = [];
        $scope.filter = {};
        $scope.user = {};
        $scope.user.images = [];
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;
        $scope.filter.find = MTD;
        $scope.current_group_id = current_group_id;
        $scope.current_user_id = id_current_user;
        $scope.is_hr = is_hr;
        $scope.is_dev = is_dev;
        $scope.is_admin = is_admin;
        $scope.searchDate = moment().format('YYYY-MM-DD');
        $scope.sexs = [{
            id: 1,
            name: 'NAM'
        }, {
            id: 2,
            name: 'NỮ'
        }, {
            id: 3,
            name: 'KHÁC'
        }];
        $scope.loading = true;
        $scope.ls_status = [];
        get_user_created();
        getRoleRequest();
        $scope.getInterviewSource();
        $scope.getStatus();
        $scope.handleFilter(false);
        $('input[name="datetimes1"]').daterangepicker({
            singleDatePicker: true,
            timePicker: true,
            timePicker24Hour: true,
            locale: {
                format: 'YYYY/MM/DD HH:mm:ss'
            }
        });
        $http.get(base_url + '/ajax/get_all_user').then(r => {
            if (r.data && r.data.status == 1) {
                $scope.ls_users = r.data.data;
            }
        });
        $scope.getStatusUser();
        $scope.getAllStore();
        $scope.loadStore();
        select2_img();
        loadCKEDITOR();

        setTimeout(() => {
            $scope.filter.date_filter = '';
        }, 200);


        var preview_id = getParamsValue('preview_id');
        if (preview_id) {
            $scope.openInterview(preview_id, 'VIEW');
        } else console.log('no value was found!');
    }

    $scope.loadStore = () => {
        AdminStoreSvc.getAll().then(r => {
            $scope.all_stores = r;
        });
    }

    $scope.dzOptionsImg = {
        paramName: 'file',
        maxFilesize: '10',
        resizeWidth: 1200,
        url: base_url + '/admin_users/ajax_new_upload_image_user',
        acceptedFiles: 'image/*',
        dictDefaultMessage: 'Kéo thả hình ảnh hồ sơ tại đây'
    };

    $scope.dzCBImg = {
        'success': function (file, resp) {
            let res = JSON.parse(resp);
            if (res.status == 1) {
                $scope.interview.images.push({
                    url: res.data.url,
                    file: res.data.file,
                    type: '1',
                    name: 'Chứng từ ' + ($scope.interview.images.length + 1)
                });
            } else toastr['error']('Có lổi xẩy ra. Vui lòng thử lại!')
            $('.dz-image').remove();
        }
    };

    $scope.dzOptionsImgRq = {
        paramName: 'file',
        maxFilesize: '10',
        resizeWidth: 1200,
        url: base_url + '/admin_users/ajax_new_upload_image_user',
        acceptedFiles: 'image/*',
        dictDefaultMessage: 'Kéo thả hồ sơ tại đây'
    };

    $scope.dzCBImgRq = {
        'success': function (file, resp) {
            let res = JSON.parse(resp);
            if (res.status == 1) {
                $scope.user.images.push({
                    url: res.data.url,
                    file: res.data.file,
                    type: 1,
                    name: 'Chứng từ ' + ($scope.user.images.length + 1)
                });
            } else toastr['error']('Có lổi xẩy ra. Vui lòng thử lại!')
            $('.dz-image').remove();
        }
    };



    $scope.showNotifi = () => {
        $scope.is_notification = !$scope.is_notification;
    }

    $scope.setNullDateFilter = () => {
        $scope.filter.date_filter = '';
    }

    $scope.doNext = (val) => {
        $scope.isStep = val;
        if (val == 2 && !$scope.interview.id) {
            get_infor_cv();
            // $scope.interview.is_student = 0;
        }
    }

    $scope.getInterviewSource = () => {
        $http.get(base_url + '/user_interviews/ajax_get_interview_source').then(r => {
            if (r.data && r.data.status == 1) {
                $scope.list_source = r.data.data;
            }
        });
    }

    function get_user_created() {
        $http.get(base_url + '/user_interviews/ajax_get_user_created_interview').then(r => {
            if (r.data && r.data.status == 1) {
                $scope.user_created = r.data.data;
            }
        });
    }

    function get_infor_cv() {
        $scope.hasInterview = {};
        $scope.hasStudent = {};
        $scope.hasUser = {};
        $http.post(base_url + '/user_interviews/ajax_check_cv_already_exist', $scope.interview).then(r => {
            $scope.disableSource = 0;
            if (r.data && r.data.status == 1) {
                if (r.data.hasStudent) {
                    $scope.hasStudent = r.data.hasStudent;
                    $scope.interview.source = '3';
                    $scope.disableSource = 1;
                    select2_img();
                }
                if (r.data.hasInterview) $scope.hasInterview = r.data.hasInterview;
                if (r.data.hasUser) $scope.hasUser = r.data.hasUser;
            }
        });
    }

    $scope.doChange = (val) => {
        if ($scope.isStep > val || $scope.isAction == 'VIEW') {
            $scope.isStep = val;
        }
    }

    $scope.changeNation = () => {
        if ($scope.interview.nation_id && $scope.interview.nation_id > 0) {
            $http.get(base_url + '/admin_users/ajax_get_provinces?nation_id=' + $scope.interview.nation_id).then(r => {
                if (r && r.data.status == 1) {
                    $scope.provinces = r.data.data;
                    select2_img();
                } else toastr["error"]("Đã có lỗi xẩy ra!");
            });
        }

    }



    $scope.changeProvice = () => {
        if ($scope.interview.province_id && $scope.interview.province_id > 0) {
            $http.get(base_url + '/admin_users/ajax_get_district/?province_id=' + $scope.interview.province_id).then(r => {
                if (r && r.data.status == 1) {
                    $scope.districts = r.data.data;
                    select2_img();
                } else toastr["error"]("Đã có lỗi xẩy ra!");
            });
        }
    }


    $scope.createUser = (interview) => {
        window.open(base_url + '/admin_users/add_user/0?interview_id=' + interview.id);
    }

    $scope.getStatus = () => {
        $http.get(base_url + '/admin_users/ajax_get_status_user?type=1').then(r => {
            if (r.data && r.data.status == 1) {
                $scope.ls_status = r.data.data;
            }
        })
    }

    $scope.getNoteInLog = (lgs) => {
        if (lgs && lgs.length > 0) {
            return lgs[lgs.length - 1].note ? lgs[lgs.length - 1].note : '';
        }
        return '';
    }

    $scope.handleAddUser = () => {
        let userId = $scope.selectedUser[0];
        let user = $scope.ls_users.find(r => {
            return r.id == userId
        });
        let userHas = $scope.interview.users.find(r => {
            return r.id == userId
        });
        if (!userHas) {
            $scope.interview.users.push(user);
        }
        $scope.selectedUser = [];
    }

    $scope.handleSearchDate = (val) => {
        $scope.filter.offset = 0;
        $scope.selectedDate = val.interview_time;
        $scope.filter.date = $scope.dateFormat(val.interview_time, 'YYYY-MM-DD');
        $scope.getAll();
    }

    $scope.changeState = (val) => {
        $scope.isView = val;
        $scope.filter.offset = 0;
        $scope.filter.store_id = '';
        $scope.filter.group_id = '';
        $scope.filter.status_id = '';
        $scope.filter.is_contact = '';
        $scope.filter.find = '';
        select2_img();
        $scope.filter.is_result = val;
        $scope.handleFilter();
    }


    $scope.getAll = () => {
        $scope.loading = true;
        $http.get(base_url + '/user_interviews/ajax_get_list_interview?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r.data.status == 1) {
                if ($scope.isView == 1 || $scope.isView == 2) {
                    $scope.loading = false;
                    $scope.rows = r.data.data;
                    $scope.pagingInfo.total = r.data.count;
                    $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
                    select2_img();
                }
            } else {
                toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
            }
        });
    }

    $scope.getAllUser = () => {
        $scope.loading = true;
        // $scope.filter.group_id = $scope.is_hr == 1 ? '' : current_group_id;
        $http.get(base_url + '/admin_users/ajax_get_users_probationary?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r.data.status == 1) {
                if ($scope.isView == 5) {
                    $scope.loading = false;
                    $scope.rows = r.data.data;
                    $scope.pagingInfo.total = r.data.count;
                    $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
                } else {
                    $scope.rows = [];
                }

            } else {
                toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
            }
        });
    }

    $scope.getAllRequestInterview = () => {
        $scope.loading = true;
        $http.get(base_url + '/user_interviews/ajax_get_request_interview?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r.data.status == 1) {
                if ($scope.isView == 6) {
                    $scope.loading = false;
                    $scope.rows = r.data.data;
                    $scope.pagingInfo.total = r.data.count;
                    $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
                } else {
                    $scope.rows = [];
                }
            } else {
                toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
            }
        });
    }

    $scope.openInterview = (id, type) => {
        $scope.hasUser = {};
        $scope.hasInterview = {};
        $scope.isOpen = 'INTERVIEW';
        $scope.isAction = type;
        $scope.isStep = 1;
        $scope.interview = {
            users: [],
            images: [],
        }
        if (id > 0) {
            getInterviewDetail(id);
        } else {
            $('#addInterview').modal('show');
            select2_img();;
        }

    }

    function getParamsValue(params) {
        var url = new URL(window.location.href);
        var c = url.searchParams.get(params);
        return c;
    }
    $scope.handleFilter = (firstCall) => {
        $scope.filter.offset = 0;
        $scope.pagingInfo.currentPage = 1;
        $scope.filter.find = !firstCall ? $scope.filter.find : '';
        if ($scope.isView == 5) $scope.getAllUser();
        if ($scope.isView == 6) $scope.getAllRequestInterview();
        if ($scope.isView == 1 || $scope.isView == 2) $scope.getAll();
    }

    function getInterviewDetail(id) {
        $http.get(base_url + '/user_interviews/ajax_get_interview_detail?id=' + id).then(r => {
            if (r.data.status == 1) {
                $('#addInterview').modal('show');
                $scope.interview = r.data.data;
                if ($scope.interview.source == '3') {
                    $scope.disableSource = 1;
                } else {
                    $scope.disableSource = 0;
                }
                $scope.interview.id_date = $scope.interview.id_date && $scope.interview.id_date != '0000-00-00' ? moment($scope.interview.id_date).format('DD-MM-YYYY') : '';
                $scope.interview.birthday = $scope.interview.birthday && $scope.interview.birthday != '0000-00-00' ? moment($scope.interview.birthday).format('DD-MM-YYYY') : '';
                $scope.changeNation();
                $scope.changeProvice();
                $scope.handleChangeGroup($scope.interview.group_id);
                $scope.changeCompanyInterview($scope.interview.company_id, 'create');
                select2_img();
            } else {
                toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
            }
        });
    };

    $scope.CoUInterview = () => {
        if ($scope.interview.images.length == 0 && $scope.interview.status_id == 3) {
            showMessErr('Vui lòng thêm hình ảnh hồ sơ!');
            return;
        }

        $scope.isLoading = true;
        $http.post(base_url + '/user_interviews/ajax_created_or_update_interview', $scope.interview).then(r => {
            if (r.data && r.data.status == 1) {
                toastr['success']('Thêm thành công!');
                $scope.interview = {};
                $scope.selectedUser = [];
                $scope.isView = 1;
                $('#addInterview').modal('hide');
                $scope.getAll();
            } else {
                toastr['error'](r.data && r.data.status == 0 ? r.data.message : 'Có lổi xẩy ra. Vui lòng thử lại!');
            }
            $scope.isLoading = false;
        });
    }

    $scope.dateFormat = (date, format) => {
        return date ? moment(date).format(format) : '';
    }


    $scope.redirctToDetail = (id) => {
        window.open(base_url + '/user_interviews/interviewees_detail/' + id);
    }

    // $scope.handleReceiveCV = (item, type) => {
    //     if (type && type == 'OPEN') {
    //         $scope.interview = item;

    //         $scope.receive = {};
    //         $scope.receive.created_wp_id = item.created_wp_id;
    //         $scope.receive.fullname = item.fullname;
    //         $scope.receive.user_created_name = item.user_created_name;
    //         $scope.receive.id = item.id;
    //         $scope.receive.status_id = 2;
    //         $scope.receive.users = item.user_ids;
    //         $scope.receive.interview_time = item.interview_time;
    //         $scope.receive.note = item.status_id == 1 ? '' : $scope.getNoteInLog(item.logs);
    //         $('#receiveCV').modal('show');
    //         select2_img();
    //     } else {
    //         $('#receiveCV').modal('hide');
    //         $http.post(base_url + '/user_interviews/api_recive_cv', $scope.receive).then(r => {
    //             if (r && r.data.status == 1) {
    //                 $scope.getAll();
    //             } else toastr["error"]("Đã có lỗi xẩy ra!");
    //         });
    //     }
    // }

    $scope.handleChangeStatus = (item, type, status) => {
        $scope.isOpen = 'INTERVIEW';
        $scope.interview = item;
        if (type && type == 'OPEN') {
            $scope.passInterview = {};
            $scope.passInterview.id = item.id;
            $scope.passInterview.is_cancel = status == 4 ? true : false;
            $scope.passInterview.users = item.users;
            $scope.interview.images = [];
            $http.get(base_url + `/user_interviews/ajax_get_image_interview?id=${item.id}&type=3`).then(r => {
                $scope.interview.images = r.data.data;
            });
            if (status == 3) {
                $scope.passInterview.group_id = item.group_id;
                $scope.passInterview.store_id = item.store_id;
                $scope.passInterview.type_id = item.type_id;
                $scope.passInterview.status_id = item.status_id;
                $scope.passInterview.salary = formatCurrency(item.salary);
                $scope.passInterview.subsidy = formatCurrency(item.subsidy);
                $scope.passInterview.date_start = item.date_start;
                $scope.passInterview.date_expires = item.date_expires;
                $scope.passInterview.interviewer_id = item.interviewer_id;
            }

            if (status == 4) {
                $scope.passInterview.status_id = item.status_id;
                $('#passInterview .modal-dialog').removeClass("modal-cus");
                $('#col').removeClass("col-sm-6 col-md-6 col-lg-6");
                $('#col').addClass("col-sm-12 col-md-12 col-lg-12");
            } else {
                $('#passInterview .modal-dialog').addClass("modal-cus");
                $('#col').addClass("col-sm-6 col-md-6 col-lg-6");
                $('#col').removeClass("col-sm-12 col-md-12 col-lg-12");
            }

            $scope.passInterview.status = status;

            let countLog = item.logs.length;

            if (countLog && countLog > 0) {
                CKEDITOR.instances.evaluateInterviewer.setData(item.logs[countLog - 1].evaluate);
            }
            select2_img();
            select2();
            $('#passInterview').modal('show');
        }
    }

    $scope.handleUpdateChangeStatus = () => {
        $scope.passInterview.fullname = $scope.interview.fullname;
        $scope.passInterview.created_wp_id = $scope.interview.created_wp_id;
        $scope.passInterview.status_id = $scope.passInterview.is_cancel ? 4 : $scope.passInterview.status_id;
        $scope.passInterview.salary = $scope.passInterview.is_cancel ? '' : formatNumber($scope.passInterview.salary);
        $scope.passInterview.subsidy = $scope.passInterview.is_cancel ? '' : formatNumber($scope.passInterview.subsidy);
        $scope.passInterview.evaluate = CKEDITOR.instances.evaluateInterviewer.getData();
        $scope.passInterview.images = $scope.interview.images;

        if ($scope.passInterview.status_id == 3) {
            if ($scope.passInterview.type_id == 0) {
                showMessErr('Vui lòng chọn hình thức làm việc!');
                return;
            }

            if (($scope.passInterview.type_id == 11 || $scope.passInterview.type_id == 12) && $scope.passInterview.date_expires == '00-00-0000') {
                showMessErr('Vui lòng chọn ngày kết thúc!');
                return;
            }
        }

        $('#passInterview').modal('hide');
        $http.post(base_url + '/user_interviews/api_change_status_interview', $scope.passInterview).then(r => {
            if (r && r.data.status == 1) {
                $scope.getAll();
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }


    $scope.saveContact = () => {
        $('#hasContact').modal('hide');
        $http.post(base_url + '/user_interviews/confirm_contact_interview', $scope.hasContact).then(r => {
            if (r && r.data.status == 1) {
                $scope.getAll();
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    $scope.getStatusUser = () => {
        $http.get(base_url + '/admin_users/ajax_get_status_user?type=2').then(r => {
            if (r.data && r.data.status == 1) {
                $scope.userStatus = r.data.data;
            }
        })
    }

    //Phân quyền cho user
    function getRoleRequest() {
        $http.get(base_url + '/user_interviews/ajax_get_option?name=' + 'USER_INTERVIEW').then(r => {
            if (r.data && r.data.status == 1) {
                $scope.roleCreateRequest = JSON.parse(r.data.data.value);
            }
        })
    }

    $scope.getRoleCreateRequest = () => {
        let hasUser = $scope.roleCreateRequest.user.find(r => {
            return r.id == $scope.current_user_id
        });
        let hasGroup = $scope.roleCreateRequest.group.find(r => {
            return r == $scope.current_group_id
        });

        return hasUser || hasGroup || $scope.is_dev == 1 ? true : false;
    }

    $scope.checkUserPV = (item) => {
        if (item && item.user_ids) {
            let hasId = item.user_ids.find(r => {
                return r == $scope.current_user_id
            });
            return hasId || $scope.is_dev == 1 ? true : false;
        }
        return false;
    }
    $scope.checkNOtEditAcount = (interview) => {
        if (interview.users && interview.users.length > 0) {
            let id = useinterview.usersrs.find(r => {
                return r == $scope.current_user_id
            });
            return id && (($scope.is_dev == 0 || $scope.is_hr == 0) && interview.status_id != 3) ? true : false;
        }
        return false;
    }

    $scope.getRoleEdit = (item) => {
        if (item && (item.user_ids || item.users)) {
            let hasId = null;
            if ($scope.isView == 5) {
                hasId = item.users.find(r => {
                    return r.user_id == $scope.current_user_id
                });
            } else {
                hasId = item.user_ids.find(r => {
                    return r == $scope.current_user_id
                });
            }
            let hasIdWeb = item.logs ? item.logs.find(r => {
                return r.web_confirm_id == $scope.current_user_id
            }) : false;

            return (hasIdWeb || hasId || item.user_created_id == $scope.current_user_id) ? true : false;
        }
        return false;
    }
    //-----------------


    //YÊU CẦU THAY ĐỔI HÌNH THỨC LÀM VIỆC

    const JOB_DISCUSSTION = `
    <strong>1: Công việc được giao, mức độ hoàn thành.</strong>
    <br>
    <br>
    <br>
    <strong>2: Phẩm chất, thái độ.</strong>
    <br>
    <br>
    <br>
    <strong>3: Tác phong.</strong>
    <br>
    <br>
    <br>
    <strong>4: Kỹ năng chuyên môn.</strong>
    <br>
    <br>
    <br>
    <strong>5: Kỹ năng giải quyết vấn đề.</strong>
    <br>
    <br>
    <br>
    <strong>6: Tinh thần trách nhiệm và kỉ luật.</strong>
    <br>
    <br>
    <br>
    `;
    $scope.handleRequestChangeStatus = async (item, type) => {
        $scope.user = item;
        $scope.requestChangeState = item.request ? item.request : {};
        $scope.requestChangeState.user_id = item.id;
        $scope.requestChangeState.isConfirm = type == 'CONFIRM' ? true : false;
        $scope.isOpen = 'USER';

        $scope.state_note = $scope.requestChangeState.note_probation ? JSON.parse($scope.requestChangeState.note_probation) : {};
        $('#requestChange').modal('show');
        $('#inputImgOrder').val('');
        $scope.user.images = [];
        if (item.request) {
            await $http.get(base_url + '/admin_users/ajax_get_image_request?id=' + item.request.id).then(r => {
                if (r.data && r.data.status == 1) {
                    $scope.user.images = r.data.data;
                }
            })
        }

        RatingUserInterviewSvc.getListRequestSalaryByUser({'user_id': item.id}).then(r => {
            $scope.listRequestSalary = r;
            $scope.select2();
        }).catch(e => {
            toastr["error"]("Đã có lỗi xảy ra!!!");
        });
    }

    $scope.select2 = () => {
        setTimeout(() => {
            $('.select2').select2();
        }, 100);
    }

    $scope.IsJsonString = (str) => {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }

    $scope.handleRequestSendEmail = (item) => {
        $('#body').css('display', 'none');
        $('#back').css('display', 'none');
        $('#submitSendEmail').css('display', 'none');
        $('#getBody').css('display', 'inline');
        $('#formSendEmail').css('display', 'block');
        $scope.interview = angular.copy(item);
        if (item.users[0].position_name) {
            $scope.interview.interview_position = item.users[0].position_name;
        }
        $scope.interview.fullname_receiver = angular.copy(item.fullname);
        $scope.interview.email_receiver = angular.copy(item.email);
        $scope.interview.hour_can_work_time = '8h00';
        $scope.interview.weekday_start = 'Thứ 2';
        $scope.interview.weekday_end = 'Chủ nhật';
        $scope.interview.hour_start = '8h00';
        $scope.interview.hour_end = '17h00';
        $scope.interview.try_time = '2 tháng';
        $scope.interview.number_day = '4 ngày';
        $scope.interview.sender = sender;
        $scope.interview.position_on_web = angular.copy(item.request_position);
        $scope.interview.interviewer = angular.copy(item.user_ids[0]);
        $scope.interview.interview_time = $scope.dateFormat(item.interview_time, 'DD/MM/YYYY HH:mm');
        if ($scope.interview.salary != null) {
            $scope.interview.salary = addCommas(angular.copy(item.salary)) + ' VNĐ';
        }
        $scope.interview.interview_time = $scope.dateFormat(angular.copy(item.interview_time), 'YYYY/MM/DD HH:mm:ss');
        $scope.interview.fullname = angular.copy(item.last_name) + ' ' + angular.copy(item.first_name);
        $scope.interview.can_work_time = angular.copy(item.date_start);

        if ($scope.interview.status_id == 4 || $scope.interview.status_id == 5 || $scope.interview.status_id == 8) {
            $('#modalSendEmail .modal-dialog').removeClass("modal-cus");
        } else {
            $('#modalSendEmail .modal-dialog').addClass("modal-cus");
        }

        if ($scope.interview.status_id == 2) {
            $scope.interview.reply_time = angular.copy(item.interview_time);
        } else if ($scope.interview.status_id == 3) {
            $scope.interview.reply_time = angular.copy(item.date_start);
        }

        $('.check_email').removeClass('has-error');
        $('.error_email').html('');

        $('#modalSendEmail').modal('show');
        select2_img();

    }

    $scope.changeInterviewer = () => {
        if ($scope.interview.interviewer) {
            $http.get(base_url + '/user_interviews/ajax_get_interviewer?id=' + $scope.interview.interviewer).then(r => {
                if (r.data.status == 1) {
                    $scope.interview.interview_position = r.data.data.position_name;
                } else {
                    toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
                }
            });
        };
    }

    $scope.changeAddress = () => {
        if ($scope.interview.store_id) {
            $http.get(base_url + '/user_interviews/ajax_get_store_address?id=' + $scope.interview.store_id).then(r => {
                if (r.data.status == 1) {
                    $scope.interview.store_address = r.data.data.address;
                } else {
                    toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
                }
            })
        }
    }

    function addCommas(num) {
        return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    }

    $scope.checkWeekDay = () => {
        if (parseInt($scope.interview.weekday_end) < parseInt($scope.interview.weekday_start)) {
            $('#weekday_end').addClass('has-error');
            $('#error_weekday_end').html('không hợp lệ');
            return false
        } else {
            $('#weekday_end').removeClass('has-error');
            $('#error_weekday_end').html('');
        }
    }

    $scope.sendEmail = () => {
        $scope.loading_send_email = true;
        $scope.interview.body = CKEDITOR.instances.bodySendEmail.getData();
        $http.post(base_url + '/user_interviews/ajax_send_email', $scope.interview).then(r => {
            if (r.data.status == 1) {
                toastr["success"]('Gửi email thành công');
                $('#modalSendEmail').modal('hide');
                $scope.getAll();
                select2_img();
            } else {
                toastr["error"]('Gửi email thất bại, xin vui lòng thử lại');
            }
            $scope.loading_send_email = false;
        });
    }

    $scope.getBody = () => {
        if (!$scope.interview.email_receiver || $scope.interview.email_receiver == "") {
            $('.check_email').addClass('has-error');
            return false
        } else {
            $('.check_email').removeClass('has-error');
        }

        if ($scope.interview.status_id == 2) {
            if (!$scope.interview.sender || $scope.interview.sender == "") {
                $('#sender').addClass('has-error');
                $('#error_sender').html('không được trống');
                return false
            } else {
                $('#sender').removeClass('has-error');
                $('#error_sender').html('');
            }

            if (!$scope.interview.interviewer || $scope.interview.interviewer == "") {
                $('#interviewer').addClass('has-error');
                return false
            } else {
                $('#interviewer').removeClass('has-error');
            }

            if ($scope.interview.interview_position == "") {
                $('#interview_position').addClass('has-error');
                return false
            } else {
                $('#interview_position').removeClass('has-error');
            }

            if (!$scope.interview.interview_time || $scope.interview.interview_time == "Invalid date") {
                $('#interview_time').addClass('has-error');
                $('#error_interview_time').html('không được trống');
                return false
            } else {
                $('#interview_time').removeClass('has-error');
                $('#error_interview_time').html('');
            }

            if ($scope.interview.store_address == "") {
                $('#interview_address').addClass('has-error');
                $('#error_interview_address').html('không được trống');
                return false
            } else {
                $('#interview_address').removeClass('has-error');
                $('#error_interview_address').html('');
            }
        }

        if ($scope.interview.status_id == 2 || $scope.interview.status_id == 3) {
            if (!$scope.interview.fullname_receiver || $scope.interview.fullname_receiver == "") {
                $('#fullname').addClass('has-error');
                return false
            } else {
                $('#fullname').removeClass('has-error');
            }

            if (!$scope.interview.position_on_web || $scope.interview.position_on_web == "") {
                $('#position_on_web').addClass('has-error');
                $('#error_position_on_web').html('không được trống');
                return false
            } else {
                $('#position_on_web').removeClass('has-error');
                $('#error_position_on_web').html('');
            }

            if (!$scope.interview.reply_time || $scope.interview.reply_time == "") {
                $('#reply_time').addClass('has-error');
                return false
            } else {
                $('#position_on_web').removeClass('has-error');
            }
        }

        if ($scope.interview.status_id == 3) {
            if (!$scope.interview.manager || $scope.interview.manager == "") {
                $('#manager').addClass('has-error');
                $('#error_manager').html('không được trống');
                return false
            } else {
                $('#manager').removeClass('has-error');
                $('#error_manager').html('');
            }

            if ($scope.interview.store_address == "") {
                $('#web_wish_adress').addClass('has-error');
                $('#error_web_wish_adress').html('không được trống');
                return false
            } else {
                $('#web_wish_adress').removeClass('has-error');
                $('#error_web_wish_adress').html('');
            }

            if (!$scope.interview.salary || $scope.interview.salary == "") {
                $('#salary').addClass('has-error');
                $('#error_salary').html('không được trống');
                return false
            } else {
                $('#salary').removeClass('has-error');
                $('#error_salary').html('');
            }

            if (!$scope.interview.can_work_time || $scope.interview.can_work_time == "") {
                $('#can_work_time').addClass('has-error');
                $('#error_can_work_time').html('không được trống');
                return false
            } else {
                $('#can_work_time').removeClass('has-error');
                $('#error_can_work_time').html('');
            }

            if (!$scope.interview.hour_can_work_time || $scope.interview.hour_can_work_time == "") {
                $('#hour_can_work_time').addClass('has-error');
                $('#error_hour_can_work_time').html('không được trống');
                return false
            } else {
                $('#hour_can_work_time').removeClass('has-error');
                $('#error_hour_can_work_time').html('');
            }

            if (!$scope.interview.try_time || $scope.interview.try_time == "") {
                $('#try_time').addClass('has-error');
                return false
            } else {
                $('#try_time').removeClass('has-error');
            }

            if (!$scope.interview.number_day || $scope.interview.number_day == "") {
                $('#number_day').addClass('has-error');
                return false
            } else {
                $('#number_day').removeClass('has-error');
            }

            if (!$scope.interview.hour_start || $scope.interview.hour_start == "") {
                $('#hour_start').addClass('has-error');
                $('#error_hour_start').html('không được trống');
                return false
            } else {
                $('#hour_start').removeClass('has-error');
                $('#error_hour_start').html('');
            }

            if (!$scope.interview.hour_end || $scope.interview.hour_end == "") {
                $('#hour_end').addClass('has-error');
                $('#error_hour_end').html('không được trống');
                return false
            } else {
                $('#hour_end').removeClass('has-error');
                $('#error_hour_end').html('');
            }

            if (parseInt($scope.interview.weekday_end) < parseInt($scope.interview.weekday_start)) {
                $('#weekday_end').addClass('has-error');
                $('#error_weekday_end').html('không hợp lệ');
                return false
            } else {
                $('#weekday_end').removeClass('has-error');
                $('#error_weekday_end').html('');
            }
        }

        $http.post(base_url + '/user_interviews/ajax_get_body_email', $scope.interview).then(r => {
            if (r.data && r.data.status == 1) {
                CKEDITOR.instances.bodySendEmail.setData(r.data.data);
                $('#body').css('display', 'block');
                $('#back').css('display', 'inline');
                $('#submitSendEmail').css('display', 'inline');
                $('#getBody').css('display', 'none');
                $('#formSendEmail').css('display', 'none');
                $('#modalSendEmail .modal-dialog').addClass("modal-cus");
            }
        });
    }

    $scope.back = () => {
        $('#formSendEmail').css('display', 'block');
        $('#body').css('display', 'none');
        $('#back').css('display', 'none');
        $('#submitSendEmail').css('display', 'none');
        $('#getBody').css('display', 'inline');

        if ($scope.interview.status_id == 4 || $scope.interview.status_id == 5 || $scope.interview.status_id == 8) {
            $('#modalSendEmail .modal-dialog').removeClass("modal-cus");
        }
    }

    $scope.sendRequest = (state) => {
        $scope.stateRequest = state;
        $('#submitRQ').click();
    }

    $scope.submitRequest = () => {
        // if ($scope.user.images.length == 0) {
        //     toastr['error']('Bạn chưa upload phiếu đánh giá!');
        //     return;
        // }

        if($scope.requestChangeState.status_id == 11 || $scope.requestChangeState.status_id == 12){
            if(moment($scope.requestChangeState.date_expires,'DD-MM-YYYY') < moment($scope.requestChangeState.date_start,'DD-MM-YYYY')){
                return showMessErr('Ngày kết thúc phải lớn hơn ngày áp dụng');
            }
        }

        $scope.requestChangeState.images = $scope.user.images;
        //$scope.requestChangeState.note = $scope.requestChangeState.note ? $scope.requestChangeState.note : CKEDITOR.instances.textboxMessage2.getData();
        $scope.requestChangeState.note_probation = $scope.state_note;
        $scope.requestChangeState.loading = true;
        $scope.requestChangeState.state = $scope.stateRequest;
        $http.post(base_url + '/user_interviews/ajax_add_request_change_state', $scope.requestChangeState).then(r => {
            $scope.requestChangeState.loading = false;
            $('#requestChange').modal('hide');
            if (r && r.data.status == 1) {
                toastr["success"]($scope.requestChangeState.id ? "Cập nhật thành công!" : "Tạo yêu cầu thành công!")
                $scope.getAllUser();
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        })
    }

    $scope.converHtml = (htmlbd) => {
        return $sce.trustAsHtml(htmlbd);
    }

    //----------------------------------------


    $scope.openUserHistory = (id) => {
        window.open(base_url + '/admin_users/history/' + id);
    }



    ///----IMAGE ---------------

    $scope.showDocument = (val) => {
        $scope.isDoc = val == $scope.isDoc ? 0 : val;
    }

    $scope.attachFile = () => {
        $('#inputImgOrder').click();
    }

    $scope.showImg = (url) => {
        $scope.currentImageUrl = url;
        window.open($scope.currentImageUrl, '_blank');
        // $('#image').modal('show');
    }

    // $scope.getUrlImg = (img) => {
    //     return base_url + img;
    // }

    $scope.viewImg = (url) => {
        $scope.currentImageUrl = url;
        $('#image').modal('show');
    }

    $scope.deleteImg = (key, id) => {
        $scope.transaction.images.splice(key, 1);
    }

    $scope.openFile = (url) => {
        window.open(url, '_blank');
    }

    $scope.removeImage = (url, index) => {
        $scope.user.images.splice(index, 1);
    }

    ///----IMAGE ---------------

    $scope.getAllStore = () => {
        $http.get(base_url + '/user_interviews/get_all_store').then(r => {
            if (r.data.status == 1) {
                $scope.filter.store_id = '';
                $scope.admin_stores_filter = r.data.data;
                select2_img();
            } else {
                toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
            }
        });
    }

    $scope.changeCompanyInterview = (id, type) => {
        $http.get(base_url + '/user_interviews/get_list_store_by_company_id?id=' + id).then(r => {
            if (r.data.status == 1) {
                if (type == 'filter') {
                    $scope.admin_stores_filter = r.data.data;
                }
                if (type == 'create') {
                    $scope.admin_stores_create = r.data.data;
                }
                select2_img();
            } else {
                toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
            }
        });
    }


    $scope.changeGroupInterview = (action) => {
        let filter = {
            group_id: $scope.requestInterview.group_id,
            status_list: [2, 3],
            store_id: $scope.requestInterview.store_id
        }
        $http.get(base_url + '/user_interviews/ajax_get_request_interview?filter=' + JSON.stringify(filter)).then(r => {
            if (r.data.status == 1) {
                $scope.request_interview_group = r.data.data;
                if ($scope.request_interview_group.length > 0) {
                    $scope.activeTableRequest = 1;
                } else {
                    $scope.activeTableRequest = 0;
                }
                $scope.tableRequestInterview = 0;

                // Nếu chọn công ty khi tạo yêu cầu nhân sự
                $scope.changeCompanyInterview($scope.requestInterview.company_id, 'create');
            } else {
                toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
            }
            $('#tableRequestInterview').css('display', 'none');
        });
    }

    $scope.showTableRequest = () => {
        $('#tableRequestInterview').slideToggle(300);
    }

    //Request interview

    $scope.openRequest = (val, type) => {
        $scope.hasInterviewRequest = {};

        $scope.isAction = type;
        getUserByGroups();
        if (val.id) {
            val.quantity = Number(val.quantity);
            $scope.requestInterview = val;
            CKEDITOR.instances.textboxMessage.setData(val.job_requirement);
            $scope.changeCompanyInterview(val.company_id, 'create');
        } else {
            $scope.requestInterview = {};
            CKEDITOR.instances.textboxMessage.setData('');
        }
        $scope.activeTableRequest = 0;
        $('#requestInterview').modal('show');
        $('#tableRequestInterview').css('display', 'none');

        $scope.disabledInput = 0;
        if ($scope.requestInterview.id && is_dev !=1 && $scope.requestInterview.status !=1 && !($scope.current_user_id==636 || $scope.current_user_id ==1692 || $scope.current_user_id ==1697)) {
            $scope.disabledInput = 1;
        }

        $scope.getListPosition();
      
        select2_img(100);
        select2();
    }

    $scope.getListPosition = () => {
        $http.get(base_url + '/user_interviews/get_list_position').then(r => {
            if (r.data.status == 1) {
                $scope.list_position = r.data.data;
                select2_img();
            } else {
                toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
            }
        });
    }

    function getUserByGroups() {
        let data = {
            group_id: [2]
        }
        $http.post(base_url + '/user_interviews/ajax_get_user_by_groups', data).then(r => {
            if (r.data.status == 1) {
                $scope.userConfirms = r.data.data;
            } else {
                toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
            }
        });
        select2_img(100);
    }


    $scope.getHTML = function (val) {
        if (val) return $sce.trustAsHtml(val);
        return '';
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

    $scope.changeRequestStatus = (request_id) => {
        listInterviewSvc.getRequestDetail(request_id).then(r => {
            $scope.interview.company_id = r.company_id;
            $scope.interview.store_id = r.store_id;
            $scope.changeCompanyInterview($scope.interview.company_id, 'create');
            select2();
        }).catch(e => {
            toastr["error"]("Đã có lỗi xảy ra!!!");
        });
    }

    $scope.addRequestInterview = () => {
        $scope.isLoading = true;
        $scope.requestInterview.job_requirement = CKEDITOR.instances.textboxMessage.getData();
        $http.post(base_url + '/user_interviews/ajax_add_request_interview', $scope.requestInterview).then(r => {
            $scope.hasInterviewRequest = {};
            if (r.data.status == 1) {
                $('#requestInterview').modal('hide');
                toastr["success"]('Tạo yêu cầu thành công!');
                CKEDITOR.instances.textboxMessage.setData('');
                $scope.getAllRequestInterview();
            } else if (r.data.status == 2) {
                $scope.hasInterviewRequest = r.data.data;
            } else {
                toastr["error"](r.data.message);
            }
            $scope.isLoading = false;
        }, function () {
            toastr["error"]('Lỗi hệ thống. Vui lòng thử lại sau!');
        });
    }

    $scope.handleChangeRequestInterview = (item, type) => {
        item.status = type;
        $http.post(base_url + '/user_interviews/ajax_change_status_interview_request', item).then(r => {
            if (r.data.status == 1) {
                toastr["success"]((type == 2 || type == 4) ? 'Duyệt thành công !' : 'Từ chối thành công !');
                $scope.getAllRequestInterview();
            } else {
                toastr["error"]('Cố lỗi xẩy ra vui lòng thử lại sau!');
            }
        });
    }

    //Request interview


    //paging
    $scope.go2Page = function (page) {
        if (page < 0) return;
        var pi = $scope.pagingInfo;
        pi.currentPage = page;
        pi.from = pi.offset = (pi.currentPage - 1) * pi.itemsPerPage;
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = ($scope.pagingInfo.currentPage - 1) * $scope.pagingInfo.itemsPerPage;
        if ($scope.isView == 5) {
            $scope.getAllUser();
        }
        if ($scope.isView == 6) {
            $scope.getAllRequestInterview();
        }
        if ($scope.isView != 5 && $scope.isView != 6) {
            $scope.getAll();
        }

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


    function select2() {
        setTimeout(() => {
            $('.select2').select2_img();
        }, 100);
    }


    $scope.checkkey = (event) => {
        var keys = {
            'up': 38,
            'right': 39,
            'down': 40,
            'left': 37,
            'escape': 27,
            'backspace': 8,
            'tab': 9,
            'enter': 13,
            'del': 46,
            '0': 48,
            '1': 49,
            '2': 50,
            '3': 51,
            '4': 52,
            '5': 53,
            '6': 54,
            '7': 55,
            '8': 56,
            '9': 57,
            'dash': 189,
            'subtract': 109
        };

        for (var index in keys) {
            if (!keys.hasOwnProperty(index)) continue;
            if (event.charCode == keys[index] || event.keyCode == keys[index]) {
                return; //default event
            }
        }
        event.preventDefault();
    }

    function formatCurrency(val) {
        if (val && val != '') {
            // let val = Number((value + '').replace(/,/g, ""));
            // this.appFormatVNChange.next(val.toLocaleString());
            val = val + '';
            val = val.replace(/,/g, "")
            val += '';
            let x = val.split('.');
            let x1 = x[0];
            let x2 = x.length > 1 ? '.' + x[1] : '';

            var rgx = /(\d+)(\d{3})/;

            while (rgx.test(x1)) {
                x1 = x1.replace(rgx, '$1' + ',' + '$2');
            }
            return x1 + x2;

        } else {
            return '';
        }
    }

    function formatNumber(value) {
        if (value && value != '') {
            return Number((value + '').replace(/,/g, ""));
        } else {
            return 0;
        }
    }

    $scope.formatSalary = () => {
        if ($scope.passInterview.salary && $scope.passInterview.salary != '') {
            $scope.passInterview.salary = formatCurrency($scope.passInterview.salary);
        } else {
            $scope.passInterview.salary = '';
        }
    }

    $scope.formatSubsidy = () => {
        if ($scope.passInterview.subsidy && $scope.passInterview.subsidy != '') {
            $scope.passInterview.subsidy = formatCurrency($scope.passInterview.subsidy);
        } else {
            $scope.passInterview.subsidy = '';
        }
    }

    $scope.openFormOff = (item) => {
        $scope.userOff = {
            id: item.id,
            date_start: item.date_start
        };
        $('#UserOff').modal('show');
    }

    $scope.setUserOff = () => {
        $('#UserOff').modal('hide');
        $http.post(base_url + '/user_interviews/ajax_set_user_off', $scope.userOff).then(r => {
            if (r.data.status == 1) {
                toastr["success"]('Cập nhật thành công !');
                $scope.handleFilter()
            } else {
                toastr["error"]('Cố lỗi xẩy ra vui lòng thử lại sau!');
            }
        });
    }

    function select2() {
        setTimeout(() => {
            $('.select2').select2();
        }, 200);
    }

    $scope.SetWork = (interview) => {
        let data = {
            is_work: interview.is_work == 0 ? 1 : 0,
            id: interview.id
        }
        swal({
            title: interview.is_work == 0 ? "Nhân sự có thể nhận việc ?" : "Nhân sự không nhận việc?",
            text: "",
            type: "warning",
            showCancelButton: true,
            closeOnConfirm: false,
            showLoaderOnConfirm: true,
            cancelButtonText: "Hủy",
        }, function () {
            $http.post(base_url + '/user_interviews/ajax_set_interview_work', data).then(r => {
                if (r.data.status == 1) {
                    $scope.handleFilter();
                    toastr.success('Cập nhật thành công!', 'Thông báo');
                    swal.close();
                } else {
                    toastr.error(r.data.message, 'Lỗi');
                }
            });
        });
    }

    $scope.getCheckNumber = (e) => {
        if (e.which != 8 && e.which != 0 && (e.which < 48 || e.which > 57)) {
            e.preventDefault();
        }
    }

    $scope.changeInputStart = () => {
        if ($scope.passInterview.date_start && $scope.passInterview.date_start != '' && $scope.passInterview.date_expires && $scope.passInterview.date_expires != '') {
            var days = diffDate($scope.passInterview.date_start, $scope.passInterview.date_expires);
            if (days < 0) {
                toastr["error"]("Ngày bắt đầu không thể lớn hơn ngày kết thúc!");
                $scope.passInterview.date_expires = '';
            }
        }
    }

    function diffDate(date_start, date_end) {
        var date_start = date_start.split('-');
        var startDate = new Date(date_start[2] + '-' + date_start[1] + '-' + date_start[0]);

        var date_end = date_end.split('-');
        var endDate = new Date(date_end[2] + '-' + date_end[1] + '-' + date_end[0]);

        const secondsInAMin = 60;
        const secondsInAnHour = 60 * secondsInAMin;
        const secondsInADay = 24 * secondsInAnHour;

        var remainingSecondsInDateDiff = (endDate - startDate) / 1000;
        var days = Math.floor(remainingSecondsInDateDiff / secondsInADay);
        return days;
    }

    $scope.formatNumber = (num) => {
        return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
    }

    function loadCKEDITOR() {
        setTimeout(() => {
            $scope.ckeditor = CKEDITOR.replace('textboxMessage', {
                uiColor: '#f2f3f5',
                // removePlugins: 'toolbar',
                height: '150',
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

            $scope.evaluateInterviewer = CKEDITOR.replace('evaluateInterviewer', {
                uiColor: '#f2f3f5',
                // removePlugins: 'toolbar',
                height: '150',
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

            $scope.evaluateInterviewer = CKEDITOR.replace('evaluateInterviewer', {
                uiColor: '#f2f3f5',
                // removePlugins: 'toolbar',
                height: '150',
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
})