app.controller('projectCtrl', function ($scope, $http, $sce) {
    var pi = $scope.pagingInfo = {
        itemsPerPage: 15,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };
    var parent_element = {};
    $scope.init = () => {
        $scope.projectType = '';
        $scope.treeArray = [];
        $scope.treeArraySearch = [];
        $scope.newTree = {};
        $scope.searching = false;
        $scope.projectDetail = {};
        $scope.remind = {};
        $scope.RefeshPeopleEditArray();
        $scope.RefreshCondition();
        $scope.itemAdd = {};
        $scope.itemAdd.status = "1";
        $scope.projectArray = [];
        $scope.isCreator = false;
        $scope.get_project_by_current_creator();
        $scope.projectCondition.role = $scope.projectCondition.timeStatus = 'all';
        $('input[name="datetimes"]').daterangepicker({
            singleDatePicker: true,
            timePicker: true,
            startDate: moment().startOf('hour'),
            "opens": "left",
            locale: {
                format: 'DD/MM hh:mm A'
            }
        });
        $scope.RefeshPeopleArray();
        $(".hide-select2-dropdown").select2({
            dropdownCssClass: "hide-search"
        });
    }
    $scope.RefeshPeopleArray = () => {
        $scope.itemAdd.files = [];
        $scope.itemAdd.peopleGs = [];
        $scope.itemAdd.peopleTh = [];
        $scope.itemAdd.status = '1';
        $scope.itemAdd.view_type = '0';
        $scope.itemAdd.project_type = null;
        $('.tree li').removeClass('selected');
        $scope.lengthItemTh = $scope.itemAdd.peopleTh.length;
        $http.get(base_url + 'workflow/api_get_current_user').then(r => {
            if (r && r.data.status == 1) {
                $scope.itemAdd.peopleGs.push(r.data.data);
                $scope.lengthItemGs = 1;
            }
        })
        $('#datetimes-end-date').daterangepicker({
            singleDatePicker: true,
            timePicker: true,
            minDate: moment().startOf('hour'),
            "opens": "left",
            locale: {
                format: 'DD/MM hh:mm A'
            }
        });
    }
    $scope.RefreshCondition = () => {
        // Refresh Condition
        $scope.projectBtn = 'Nhóm công việc'
        $scope.projectCondition = {};
        $scope.projectCondition.sort = '0';
        $scope.projectCondition.user = '0';
        $scope.projectCondition.name = null;
        $scope.projectCondition.date = null;
        $scope.projectCondition.status = 1;
        $scope.projectCondition.type = 1;
        $('.search-tree').removeClass('selected');
        $scope.projectCondition.limit = $scope.pagingInfo.itemsPerPage;
        $scope.projectCondition.offset = $scope.pagingInfo.offset;
    }

    $scope.RefeshPeopleEditArray = () => {
        $scope.projectDetail.peopleGs = [];
        $scope.lengthEditItemGs = 0;
        $scope.projectDetail.peopleTh = [];
        $scope.lengthEditItemTh = 0;
        $('#datetimes-end-detail').addClass('pointer-disable');
    }
    $scope.selectMe = (event) => {
        if ($(event.target).hasClass('note-picker')) {
            $('.note-picker').removeClass('active');
            $(event.target).addClass('active');
        } else {
            if ($(event.target).hasClass('area-ins')) {
                return false;
            }
        }
    }

    document.addEventListener("click", function (event) {
        // If user clicks inside the element, do nothing
        if (event.target.closest(".detail-note, .note-picker, .area-ins")) return;
        // If user clicks outside the element, hide it!
        $('.note-picker').removeClass('active');
        // $('.bg-dark').css('display', 'none');
    });
    $('#sort-cond').on('change', function () { })
    $scope.cancelProject = () => {
        $http.get(base_url + 'workflow/api_cancel_project_by_id/' + $scope.projectDetail.id).then(r => {
            if (r && r.data.status == 1) {
                toastr["success"](r.data.message);
                $scope.get_project_by_current_creator();
                $scope.closeDetail();
                $('#cancelModal').modal('hide');
            } else {
                toastr["error"](r.data.message);
                $('#cancelModal').modal('hide');
            }
        })
    }
    // editProject(type) type = 0: không đóng modal, type = 1: đóng modal
    $scope.editProject = (type) => {
        var drp_start = $('#datetimes-start-detail').data('daterangepicker');
        var drp_end = $('#datetimes-end-detail').data('daterangepicker');
        $scope.projectDetail.start_time = formatDate(drp_start.startDate, 'ymd');
        $scope.projectDetail.end_time = formatDate(drp_end.startDate, 'ymd');
        $('.detail-area').addClass('loading');
        setTimeout(() => {
            $http.post(base_url + '/workflow/api_edit_project', $scope.projectDetail).then(r => {
                if (r && r.data.status == 1) {
                    $('.detail-area').removeClass('loading');
                    toastr["success"](r.data.message);
                    $scope.get_project_by_current_creator();

                    if (type == 1) {
                        $scope.closeDetail();
                    }
                } else toastr["error"](r.data.message);
            })
        }, 1);
    }
    $scope.saveDetailPeople = () => {
        if ($scope.addType == 'EGS' || $scope.addType == 'ETH') {
            $scope.editProject(0);
        }
    }
    $scope.deleteProject = () => {
        $http.post(base_url + 'workflow/api_delete_project_by_id', $scope.projectDetail).then(r => {
            if (r.data.status == 1) {
                toastr["success"](r.data.message);
                $scope.get_project_by_current_creator();
                $('#deleteModal').modal('hide');
                $scope.closeDetail();
            } else {
                $('#deleteModal').modal('hide');
                toastr["error"](r.data.message);
            }
        })
    }
    $scope.projectSearch = () => {
        $scope.searching = true;
        $scope.get_project_by_current_creator();
    }
    $scope.cancelSearch = () => {
        $scope.projectBtn = 'Nhóm công việc'
        $scope.searching = false;
        $scope.projectCondition.name = null;
        $scope.projectCondition.date = null;
        $scope.projectCondition.role = $scope.projectCondition.timeStatus = 'all';
        $scope.projectCondition.status = 1;
        $scope.projectCondition.user = '0';
        $('.type-project-item').removeClass('active');
        $('.type-project-item:first-child').addClass('active');
        $scope.get_project_by_current_creator();
    }

    function formatDate(date, type) {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();
        hour = d.getHours();
        minutes = d.getMinutes();
        if (hour < 10) hour = '0' + hour;
        if (minutes < 10) minutes = '0' + minutes;
        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;
        if (type == 'dmy') {
            return [day, month, year].join('-') + '  ' + hour + ':' + minutes;
        } else if (type = 'ymd') {
            return [year, month, day].join('-') + '  ' + hour + ':' + minutes;
        }
    }
    $scope.addItem = () => {
        var i = 0;
        $('.require').each(function () {
            if ($(this).val() == null || $(this).val() == "") {
                $(this).focus();
                return false;
            } else {
                i++;
            }
            if (i == $('.require').length) {
                if ($scope.itemAdd.project_type != null) {
                    $('.additem-area').addClass('loading');
                    var drp_start = $('#datetimes-start-date').data('daterangepicker');
                    var drp_end = $('#datetimes-end-date').data('daterangepicker');

                    $scope.itemAdd.start_time = formatDate(drp_start.startDate, 'ymd');
                    $scope.itemAdd.end_time = formatDate(drp_end.startDate, 'ymd');
                    $http.post(base_url + '/workflow/api_add_project', $scope.itemAdd).then(r => {

                        if (r && r.data.status == 1) {
                            toastr["success"](r.data.message);
                            $scope.get_project_by_current_creator();
                            $scope.itemAdd = {};
                            $('.additem-area').removeClass('loading');
                            $scope.addNew_stt(0)
                            $scope.RefeshPeopleArray();
                        } else toastr["error"](r.data.message);
                    })
                } else toastr["error"]('Chưa chọn loại công việc');
            }
        })
    }

    $('.add-item-area').on('change', '.staff-group', function () {
        var group = $(this).val();
        if (group) {
            $http.post(base_url + '/workflow/getUser/' + group).then(r => {
                var text = '';
                r.data.data.forEach(function (item) {
                    text = text + '<option value="' + item.id + '">' + item.last_name + item.first_name + '</option>'
                });
                $(this).parent().find('.staff-name').html(text);
                $(this).parent().find('.staff-name').removeAttr("disabled");
            })
        }
    })
    $scope.searchByStatus = (event, value) => {
        $('.type-project-item').removeClass('active');
        $(event.target).addClass('active');
        $scope.projectCondition.status = value;
        $scope.projectCondition.sort = '0';
        $scope.get_project_by_current_creator();
    }

    $scope.addPeople = (value) => {
        $('#people-modal').modal('show');
        switch (value) {
            case 1:
                $scope.addPeopleTitle = 'Thêm người thực hiện';
                $scope.addType = 'TH';
                break;
            case 2:
                $scope.addPeopleTitle = 'Thêm người giám sát';
                $scope.addType = 'GS';
                break;
            case 3:
                $scope.addPeopleTitle = 'Người giám sát';
                $scope.addType = 'EGS';
                break;
            case 4:
                $scope.addPeopleTitle = 'Người thực hiện';
                $scope.addType = 'ETH';
                break;

            default:
                break;
        }
        setTimeout(() => {
            $('.select2').select2();
        }, 1);
    }
    $scope.confirmAddPeople = () => {
        switch ($scope.addType) {
            case 'GS':
                $.each(($('#addd_admin_gs').select2('data')), function (key, value) {
                    var temp = {
                        id: value.id,
                        name: (value.text).slice(0, (value.text).indexOf("-") - 1)
                    }
                    let hasUser = $scope.itemAdd.peopleGs.find(r => { return r.id == temp.id });
                    if (!hasUser) {
                        $scope.itemAdd.peopleGs.push(temp);
                    } else toastr["error"]('Nhân viên đã tồn tại!');
                })
                if ($scope.itemAdd.peopleGs) {
                    $("#addd_admin_gs").select2("val", "");
                }
                $scope.lengthItemGs = $scope.itemAdd.peopleGs.length;
                break;
            case 'TH':
                $.each(($('#addd_admin_th').select2('data')), function (key, value) {
                    var temp = {
                        id: value.id,
                        name: (value.text).slice(0, (value.text).indexOf("-") - 1)
                    }
                    let hasUser = $scope.itemAdd.peopleTh.find(r => { return r.id == temp.id });
                    if (!hasUser) {
                        $scope.itemAdd.peopleTh.push(temp);
                    } else toastr["error"]('Nhân viên đã tồn tại!');
                })
                if ($scope.itemAdd.peopleTh) {
                    $("#addd_admin_th").select2("val", "");
                }
                $scope.lengthItemTh = $scope.itemAdd.peopleTh.length;
                break;
            case 'TH-OUTSIDE':
                $.each(($('#addd_admin_th_outside').select2('data')), function (key, value) {
                    var temp = {
                        id: value.id,
                        name: (value.text).slice(0, (value.text).indexOf("-") - 1)
                    }
                    let hasUser = $scope.itemAdd.peopleTh.find(r => { return r.id == temp.id });
                    if (!hasUser) {
                        $scope.itemAdd.peopleTh.push(temp);
                        toastr["success"]('Đã thêm người thực hiện' + (value.text).slice(0, (value.text).indexOf("-") - 1) + '!');
                    } else toastr["error"]('Nhân viên đã tồn tại!');

                })
                $scope.$apply(function () {
                    $scope.lengthItemTh = $scope.itemAdd.peopleTh.length;
                })
                // $scope.lengthItemTh = $scope.itemAdd.peopleTh.length;
                // console.log($scope.lengthItemTh);
                break;
            case 'GS-OUTSIDE':
                $.each(($('#addd_admin_gs_outside').select2('data')), function (key, value) {
                    var temp = {
                        id: value.id,
                        name: (value.text).slice(0, (value.text).indexOf("-") - 1)
                    }
                    let hasUser = $scope.itemAdd.peopleGs.find(r => { return r.id == temp.id });
                    if (!hasUser) {
                        $scope.itemAdd.peopleGs.push(temp);
                        toastr["success"]('Đã thêm người giám sát' + (value.text).slice(0, (value.text).indexOf("-") - 1) + '!');
                    } else toastr["error"]('Nhân viên đã tồn tại!');

                })
                $scope.$apply(function () {
                    $scope.lengthItemGs = $scope.itemAdd.peopleGs.length;
                })
                // $scope.lengthItemTh = $scope.itemAdd.peopleTh.length;
                // console.log($scope.lengthItemTh);
                break;
            case 'ETH':
                $.each(($('#edit_admin_th').select2('data')), function (key, value) {
                    var temp = {
                        id: value.id,
                        name: (value.text).slice(0, (value.text).indexOf("-") - 1)
                    }
                    let hasUser = $scope.projectDetail.peopleTh.find(r => { return r.id == temp.id });
                    if (!hasUser) {
                        $scope.projectDetail.peopleTh.push(temp);
                    } else toastr["error"]('Nhân viên đã tồn tại!');
                })
                if ($scope.projectDetail.peopleTh) {
                    $("#edit_admin_th").select2("val", "");
                }
                $scope.lengthEditItemTh = $scope.projectDetail.peopleTh.length;
                break;
            case 'EGS':
                $.each(($('#edit_admin_gs').select2('data')), function (key, value) {
                    var temp = {
                        id: value.id,
                        name: (value.text).slice(0, (value.text).indexOf("-") - 1)
                    }
                    let hasUser = $scope.projectDetail.peopleGs.find(r => { return r.id == temp.id });
                    if (!hasUser) {
                        $scope.projectDetail.peopleGs.push(temp);
                    } else toastr["error"]('Nhân viên đã tồn tại!');
                })
                if ($scope.projectDetail.peopleGs) {
                    $("#edit_admin_gs").select2("val", "");
                }
                $scope.lengthEditItemGs = $scope.projectDetail.peopleGs.length;
                break;

            default:
                break;
        }
    }
    $scope.removeFromPeople = (item) => {
        switch ($scope.addType) {
            case 'GS':
                $scope.itemAdd.peopleGs.find(r => {
                    if (r) {
                        if (r.id == item.id) {
                            var pos = $scope.itemAdd.peopleGs.indexOf(r);
                            $scope.itemAdd.peopleGs.splice(pos, 1);
                        }
                        $scope.lengthItemGs = $scope.itemAdd.peopleGs.length;
                    }
                });
                break;
            case 'TH':
                $scope.itemAdd.peopleTh.find(r => {
                    if (r) {
                        if (r.id == item.id) {
                            var pos = $scope.itemAdd.peopleTh.indexOf(r);
                            $scope.itemAdd.peopleTh.splice(pos, 1);
                        }
                        $scope.lengthItemTh = $scope.itemAdd.peopleTh.length;
                    }
                });
                break;
            case 'ETH':
                $scope.projectDetail.peopleTh.find(r => {
                    if (r) {
                        if (r.id == item.id) {
                            var pos = $scope.projectDetail.peopleTh.indexOf(r);
                            $scope.projectDetail.peopleTh.splice(pos, 1);
                        }
                        $scope.lengthEditItemTh = $scope.projectDetail.peopleTh.length;
                    }
                });
                break;
            case 'EGS':
                $scope.projectDetail.peopleGs.find(r => {
                    if (r) {
                        if (r.id == item.id) {
                            var pos = $scope.projectDetail.peopleGs.indexOf(r);
                            $scope.projectDetail.peopleGs.splice(pos, 1);
                        }
                        $scope.lengthEditItemGs = $scope.projectDetail.peopleGs.length;
                    }
                });
                break;
            default:
                break;
        }
    }
    $scope.get_project_by_current_creator = () => {
        $('.workflow-content').addClass('loading');
        $http.post(base_url + 'workflow/api_get_project_by_current_creator', $scope.projectCondition).then(r => {
            $scope.creator_name = r.data.creator_name;
            $scope.projectArray = (r.data.data);

            $scope.projectArray.forEach(element => {
                element.end_time = formatDate(element.end_time, 'dmy');
            });

            $scope.pagingInfo.total = r.data.count;
            $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
            if (r.data.data.length == 0) {
                $scope.noItem = true;
            } else {
                $scope.noItem = false;
            }
            $('.workflow-content').removeClass('loading');
        })
    }
    $scope.openDetail = (id) => {
        $http.get(base_url + 'workflow/api_get_project_by_id/' + id).then(r => {
            if (r.data.data) {
                $scope.isCreator = r.data.is_creator;
                $scope.projectDetail = r.data.data;
                var th = [];
                var gs = [];
                (r.data.data.info).forEach(element => {
                    var temp = {
                        name: element[0],
                        id: element[1],
                    }
                    if (temp) {
                        if (element[2] == 1) {
                            th.push(temp);
                        } else if (element[2] == 2) {
                            gs.push(temp);
                        }
                    }
                });
                $scope.projectDetail.peopleTh = th;
                $scope.projectDetail.peopleGs = gs;

                $scope.lengthEditItemGs = $scope.projectDetail.peopleGs.length;
                $scope.lengthEditItemTh = $scope.projectDetail.peopleTh.length;

                $scope.projectDetail.start_time = formatDate(r.data.data.start_time, 'dmy');
                $scope.projectDetail.end_time = formatDate(r.data.data.end_time, 'dmy');

                $('#datetimes-start-detail').data('daterangepicker').setStartDate($scope.projectDetail.start_time);
                $('#datetimes-end-detail').data('daterangepicker').setStartDate($scope.projectDetail.end_time);

                setTimeout(() => {
                    $('.detail-area').addClass('active');
                    $('.select2').select2();
                    $('html, body').animate({
                        scrollTop: $(".detail-area").offset().top
                    }, 400);
                }, 1);
            };
        })
    }

    // $scope.createRemind = () => {
    //     $scope.remind.id = $scope.projectDetail.id;
    //     $http.post(base_url+'workflow/createRemind', $scope.remind).then(r=>{
    //         console.log(r);
    //     })
    // }

    $scope.changeDetailStt = () => {
        var drp_start = $('#datetimes-start-detail').data('daterangepicker');
        var drp_end = $('#datetimes-end-detail').data('daterangepicker');
        $scope.projectDetail.start_time = formatDate(drp_start.startDate, 'ymd');
        $scope.projectDetail.end_time = formatDate(drp_end.startDate, 'ymd');
        $('#change-status').modal('hide');
    }
    $scope.closeDetail = () => {
        $('.detail-area').removeClass('active');
    }
    $scope.addNew_stt = (a) => {
        if (a == 1) {
            $('.additem-area').addClass('show');
            var nav = $('.detail-area');
            if (nav.length) {
                $('html, body').animate({
                    scrollTop: nav.offset().top
                }, 500);
            }

        } else {
            $('.additem-area').removeClass('show');
            $('.add-node').removeClass('active');
        }
    }
    $scope.attachFile = (type) => {
        if (type == 'create') {
            $('#inputFileCreate').click();
        } else {
            $('#inputFileEdit').click();
        }
    }
    $scope.imageUpload = function (element, type) {
        var files = event.target.files; //FileList object
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
            url: base_url + '/uploads/ajax_upload_to_filehost?func=workflow_project',
            method: "POST",
            data: formData,
            headers: { 'Content-Type': undefined }
        }).then(r => {
            if (r.data.status == 1) {
                if (type == 'create') {
                    $scope.itemAdd.files.push({ url_image: r.data.data[0], filename: r.data.data[0] });
                } else {
                    $scope.detail.files.push({ url_image: r.data.data[0], filename: r.data.data[0] });
                }
            } else {
                toastr["error"]('Tệp không hợp lệ!.')
            }
        })
    }
    $scope.deleteImg = (key, id, a) => {
        if (a == 'create') {
            $scope.itemAdd.files.splice(key, 1);
        } else {
            $scope.projectDetail.files.splice(key, 1);
        }
    }


    function delay(callback, ms) {
        var timer = 0;
        return function () {
            var context = this,
                args = arguments;
            clearTimeout(timer);
            timer = setTimeout(function () {
                callback.apply(context, args);
            }, ms || 0);
        };
    }
    $('#nameCond').keyup(delay(function (e) {
        $scope.projectSearch()
    }, 500));


    //paging
    $scope.go2Page = function (page) {
        if (page < 0) return;
        var pi = $scope.pagingInfo;
        pi.currentPage = page;
        pi.from = pi.offset = (pi.currentPage - 1) * pi.itemsPerPage;
        $scope.projectCondition.limit = $scope.pagingInfo.itemsPerPage;
        $scope.projectCondition.offset = ($scope.pagingInfo.currentPage - 1) * $scope.pagingInfo.itemsPerPage;
        $scope.get_project_by_current_creator();
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
    $('#datetimes-start-date').on('apply.daterangepicker', function (ev, picker) {
        $('#datetimes-end-date').removeClass('pointer-disable');
        $('#datetimes-end-date').daterangepicker({
            singleDatePicker: true,
            timePicker: true,
            minDate: picker.startDate.format('DD/MM hh:mm A'),
            "opens": "left",
            locale: {
                format: 'DD/MM hh:mm A'
            }
        });
    });
    $('#datetimes-start-detail').on('apply.daterangepicker', function (ev, picker) {
        $('#datetimes-end-detail').removeClass('pointer-disable');
        $('#datetimes-end-detail').daterangepicker({
            singleDatePicker: true,
            timePicker: true,
            minDate: picker.startDate.format('DD/MM hh:mm A'),
            "opens": "left",
            locale: {
                format: 'DD/MM hh:mm A'
            }
        });
    });



    $('#addd_admin_th_outside').on('select2:select', function (e) {
        $scope.addType = 'TH-OUTSIDE';
        $scope.confirmAddPeople();
        $('#addd_admin_th_outside').val(0).trigger('change');
    });
    $('#addd_admin_gs_outside').on('select2:select', function (e) {
        $scope.addType = 'GS-OUTSIDE';
        $scope.confirmAddPeople();
        $('#addd_admin_gs_outside').val(0).trigger('change');
    });
    $('#userView').on('select2:select', function (e) {

        $scope.projectCondition.user = $('#userView').val();
        $scope.projectSearch();
        setTimeout(() => {
            $('#userView').val(0).trigger('change');
        }, 2);
    });




    $('.tree li:has(ul)').addClass('parent_li').find(' > ul > li').hide('fast');
    $('.tree li:has(ul)').find('> span').html('<i class="fa fa-folder"></i>');
    $('.tree').on('click', 'li.parent_li > span', function (e) {
        var children = $(this).parent('li.parent_li').find(' > ul > li');
        if (children.is(":visible")) {
            children.hide('fast');
            $(this).find(' > i').addClass('fa-folder').removeClass('fa-folder-open');
        } else {
            children.show('fast');
            $(this).find(' > i').addClass('fa-folder-open').removeClass('fa-folder');
        }
        e.stopPropagation();
    });

    $('.default-tree').on('click', '.project-name', function () {
        $('.default-tree li').removeClass('selected');
        $(this).parent('li').addClass('selected');
        $scope.itemAdd.project_type = ($(this).parent('li').data('id'));
    })

    $('.tree').on('click', '.add-folder', function () {
        $('.add-node input').val('').focus();
        $('.add-node').addClass('active');
        $scope.newTree.parent_id = $(this).parent('li').data('id');
        parent_element = $(this).parent('li');
    })

    $scope.openCreateBox = (id) => {
        $('.add-node input').val('').focus();
        $('.add-node').addClass('active');
        $scope.newTree.parent_id = id;
    }
    $scope.hideAddNode = () => {
        $('.add-node').removeClass('active');
    }
    $scope.createTree = () => {
        $http.post(base_url + '/workflow/api_createTree', $scope.newTree).then(r => {
            if (r.data && r.data.status == 1) {
                var inserted_id = r.data.data;
                if (parent_element.hasClass('parent_li')) {
                    parent_element.find('> ul').append(`<li data-id="${inserted_id}" style="display: list-item;"><span style="margin-right: 5px;"><i class="fa fa-folder-open"></i></span>
                    <div style="display: inline-block" class="project-name">
                    ${$scope.newTree.name}
                    </div>
                    <div class="add-folder">
                        <i class="fa fa-plus-circle" aria-hidden="true"></i>
                    </div>
                    <div class="select-folder">
                        <i class="fa fa-check-circle-o" aria-hidden="true"></i>
                    </div></li>`);
                } else {
                    parent_element.addClass('parent_li').append(`<ul><li data-id="${inserted_id}" style="display: list-item;"><span style="margin-right: 5px;"><i class="fa fa-folder-open"></i></span>
                    <div style="display: inline-block" class="project-name">
                     ${$scope.newTree.name}
                    </div>
                    <div class="add-folder">
                        <i class="fa fa-plus-circle" aria-hidden="true"></i>
                    </div>
                    <div class="select-folder">
                        <i class="fa fa-check-circle-o" aria-hidden="true"></i>
                    </div></li></ul>`);
                }
                setTimeout(() => {
                    $('.add-node').removeClass('active');
                }, 2);
            } else return false;
        })
    }
});