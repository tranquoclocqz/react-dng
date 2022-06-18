angular.module('app', ['psi.sortable'])
    .controller('tasksCtrl', function($scope, $http, $compile, $sce) {
        var mouseX, mouseY, windowWidth, windowHeight;
        var popupLeft, popupTop;
        $scope.init = () => {
            $scope.createObject();
            setTimeout(() => {
                $('.task-dashboard').css('min-height', $(window).height() - 150 + 'px');
                $('.checkin-list').css('height', $(window).height() - 150 + 'px');
                $('.virtual-list').css('min-height', window.innerHeight + 'px');
            }, 200);
            $scope.getReportData();
            $('body').addClass('sidebar-collapse');
            $scope.getCategoriesData();
            $scope.RefreshCondition();
            $('input[name="datetimes"]').daterangepicker({
                singleDatePicker: true,
                timePicker: true,
                startDate: moment().startOf('hour'),
                "opens": "left",
                locale: {
                    format: 'DD/MM hh:mm A'
                }
            });
            var w = $(window).width();
            $('.task-content').css('max-width', w - 300);
        }
        $(window).scroll(function() {
            if ($(this).scrollTop() > 50) {
                $('.main-detail').css('padding', '10px 15px 0');
                $('.checkin-list').css('height', $(window).height() - 100 + 'px');
            } else {
                $('.main-detail').css('padding', '55px 15px 0');
                $('.checkin-list').css('height', $(window).height() - 150 + 'px');
            }
        });

        $scope.createObject = () => {
            $scope.col_name_edit = {};
            $scope.new_table_col = {};
            $scope.col_type_array = [];
            $scope.status_edit = false;
            $scope.status_type_array = [];
            $scope.filter_group_report = {};
            $scope.new_status = {};
            $scope.editing_status_element = {};
            $scope.detail_getData = {};
            $scope.breadcrumb = {};
            $scope.filter_group_users = [];
            $scope.list_parent_recent = [];
            $scope.checkin_condition = {};
            $scope.checkin_parent_groups = [];
            $scope.checkin_children_groups = [];
            $scope.checkin_children_users = [];
            $scope.duplicate_project = {};
            $scope.list_parent_drag = {};
            $scope.newTree = {};
            $scope.newTree.name = "Nhóm mới";
            $scope.newTree.type = "1";
            $scope.appendChildPeople = {};
            $scope.projectDetail = {};
            $scope.grouptDetail = {};
            $scope.appendPeople = {};
            $scope.groupDetail = {};
            $scope.detailReport = {};
            $scope.detailReportResult = {};
            $scope.editGroup = {};
            $scope.newTodoItem = {};
            $scope.position_change = {};
            $scope.listParent = {};
            $scope.popupType = 0;
            $scope.taskOutsideEdit = {};
            $scope.detailRepor = {};
            $scope.deleteGroup = {};
            $scope.parentGrroupCurrent = {};
            $scope.parentCollapse = {};
            $scope.newChild = $scope.editTask = {};
            $scope.peopleInModal = [];
            $scope.listParent.admin = [];
            $scope.listParent.user = [];
            $scope.appendPeople.parentUser = [];
            $scope.deletedTaskId = 0;
            $scope.deleteGroupId = 0;
            $scope.listPeople = [];
            $scope.listGroupPeople = [];
            $scope.appendChildPeople.value = '0';
            $scope.appendPeople.parentValue = '0';
            $scope.showPeople = false;
            $scope.directBtn = false;
            $scope.tasckCount = 0;
            $scope.chatList = [];
            $scope.checkin_item = {};
            $scope.checkin_report_list = [];
        }
        $scope.rundrag = () => {
            $scope.$apply(function() {
                $scope.list = ['first', 'second', 'third', 'final', 'last'];
            });
        }

        $scope.RefreshCondition = () => {

            // Refresh Condition
            $scope.taskCondition = {};
            $scope.taskCondition.sort = '0';
            $scope.taskCondition.user = '0';
            $scope.taskCondition.name = null;
            $scope.taskCondition.date = false;
            $scope.taskCondition.status = false;
            $scope.taskCondition.priority = false;
            $scope.taskCondition.storage = false;
            $scope.taskCondition.type = 1;

            $scope.taskCondition.listStatus = [];
            $scope.taskCondition.listPriority = [];
            $scope.taskCondition.peopleFilter = [];
            $scope.taskCondition.peopleFilterItem = '0';
        }
        $scope.hideSidebar = () => {

            if ($('.task-management-content').hasClass('hide-sidebar')) {
                $('.task-management-content').removeClass('hide-sidebar');
                var w = $(window).width();
                $('.task-content').css('width', w - 300);
            } else {
                $('.task-management-content').addClass('hide-sidebar');
                var w = $(window).width();
                $('.task-content').css('width', w);
            }

        }
        $(document).on('keydown', function(event) {
            if (event.key == "Escape") {
                $scope.$apply(function() {
                    if ($scope.showPeople == true) {
                        $scope.showPeople = !$scope.showPeople;
                    }
                })
            }
        });
        $scope.openAction = (event) => {
            $('.outside-form').removeClass('active');
            $('.my-in').removeClass('active');

            $(event.target).parents('.outside-form').addClass('active');
            $(event.target).addClass('active');

        }
        $scope.openParentAction = (event) => {
            $('.down-button').removeClass('active');
            $(event.target).parent().addClass('active');
            var wh = $(window).height();
            if (event.clientY + 270 > wh) {
                setTimeout(() => {
                    $('.parent-project-action, .duplicate-group').css({ "top": "unset", "bottom": "100%" });
                    $('.duplicate-group').css('flex-direction', 'column-reverse');
                }, 0);
            } else $('.parent-project-action, .duplicate-group').removeAttr('style');
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
            } else if (type = 'ymd-only') {
                var text_date = [year, month, day].join('-');
                return $sce.trustAsHtml(text_date);
            }
        }
        document.addEventListener("click", function(event) {

            // If user clicks inside the element, do nothing
            if (event.target.closest(".popup-custom, .onside, select, th")) return;

            // If user clicks outside the element, hide it!
            $('.popup-custom').hide();
            // $('.bg-dark').css('display', 'none');
        });
        document.addEventListener("click", function(event) {
            // If user clicks inside the element, do nothing
            if (event.target.closest(".parent-project-action, .down-button, .duplicate-group, .dz,.inp-group")) return;
            else $('.down-button').removeClass('active');
        });
        document.addEventListener("click", function(event) {
            // If user clicks inside the element, do nothing
            if (event.target.closest(".child-action-form, .my-in")) return;
            // If user clicks outside the element, hide it!
            $('.outside-form').removeClass('active');
            $('.my-in').removeClass('active');
            // $('.bg-dark').css('display', 'none');
        });

        document.addEventListener("click", function(event) {
            // If user clicks inside the element, do nothing
            if (event.target.closest(".index-detail")) {
                $scope.$apply(function() {
                    $scope.checkin_open_detail = false;
                });
                $('.detail-space').removeClass('active');
                $('html, body').css({
                    overflow: 'auto',
                    height: 'auto'
                });
            };
            // If user clicks outside the element, hide it!

            // $('.bg-dark').css('display', 'none');
        });


        $scope.getRealPosition = (pageX, pageY) => {
            mouseX = pageX - 100;
            mouseY = pageY;

            if (mouseX < 0)
                mouseX = 0;
            if (mouseY < 0)
                mouseY = 0;

            windowWidth = $(window).width() + $(window).scrollLeft();
            windowHeight = $(window).height() + $(window).scrollTop();
        }
        $scope.showPopup = (e) => {
            $('.popup-custom').show();
            var popupWidth = $('.popup-custom').outerWidth();
            var popupHeight = $('.popup-custom').outerHeight();

            popupLeft = mouseX;

            if (mouseY + popupHeight > windowHeight)
                popupTop = mouseY - popupHeight;
            else
                popupTop = mouseY;

            if (popupLeft < $('.outside-tablecustom').scrollLeft()) {
                popupLeft = $('.outside-tablecustom').scrollLeft();
            }

            if (popupTop < $(window).scrollTop()) {
                popupTop = $(window).scrollTop();
            }

            if (popupLeft < 0 || popupLeft == undefined)
                popupLeft = 0;
            if (popupTop < 0 || popupTop == undefined)
                popupTop = 0;

            var outer_w = $('.popup-custom').outerWidth();
            var w_w = $(window).width();
            if ((mouseX + 100) + outer_w > w_w) {
                popupLeft = w_w - outer_w;
            }
            $('.popup-custom').offset({ top: popupTop, left: popupLeft });
        }
        $scope.createNewStatus = (col_id, color) => {
            $scope.new_status.col_id = col_id;
            $scope.new_status.color = color;
            $http.post(base_url + '/Tasks_management/api_create_status', $scope.new_status).then(r => {
                if (r && r.data.status == 1) {
                    $scope.status_type_array = r.data.data;
                } else toastr["error"]('Có lỗi xảy ra!');
            });
        }
        $scope.change_status_name = (id, name) => {
            $scope.editing_status_element.id = id;
            $scope.editing_status_element.name = name;
            $http.post(base_url + '/Tasks_management/api_edit_status_name', $scope.editing_status_element).then(r => {
                if (r && r.data.status != 1) toastr["error"]('Có lỗi xảy ra!');
            });
        }
        $scope.remove_status_element = (id, event) => {
            $http.get(base_url + 'Tasks_management/api_remove_status_element/' + id).then(r => {
                if (r.data.status == 1) {
                    $(event.target).parents('.new-status-picker-color-option-viewing').remove();
                };
            })
        }
        $scope.changeStatus = (event, type, id, col_id = 0) => {
            $scope.status_edit = false;
            $('.status-picker-colors-view').addClass('reload');
            $http.get(base_url + 'Tasks_management/api_get_status_by_col_id/' + col_id).then(r => {
                if (r.data.status == 1) {
                    $scope.status_type_array = r.data.data;
                    $('.status-picker-colors-view').removeClass('reload');
                };
            })
            $scope.editTask.id = id;
            $scope.editTask.col_id = col_id;
            $scope.editTask.event = $(event.target);
            $scope.getRealPosition(event.pageX, event.pageY);
            $scope.popupType = type;
            var wh = window.innerHeight;
            setTimeout(() => {
                var dh = $('.content-pa').height();
                if ((event.clientY + dh) > (wh - 100)) {
                    event.clientY = wh - 100 - dh;
                }
                $('.content-pa').css('top', event.clientY);
            }, 100);
            setTimeout(() => {
                $('.select2').select2();
                $(".datepicker").datepicker({
                    dateFormat: "dd-mm-yy"
                });
                $("#widget").colorwheel();
            }, 2);
            if (type == 'colorpicker') {
                $scope.paCondition = 'colorpicker';
                $scope.showPeople = !$scope.showPeople;

            } else if (type == 'people') {
                $scope.paCondition = 'child';
                $scope.appendChildPeople.value = '0';
                $('.popup-custom').addClass('loading');
                $http.get(base_url + 'Tasks_management/api_get_project_people_by_id/' + id).then(r => {
                    if (r.data.data) {
                        $scope.peopleInModal = r.data.data.info;
                        $(event.target).parents('.custom-tr').addClass('active');
                        $scope.showPeople = !$scope.showPeople;
                        $('.popup-custom').removeClass('loading');
                        setTimeout(() => {
                            $('.select2').select2();
                        }, 2);
                    };
                })
            } else if (type == 'people-parent') {
                $scope.paCondition = 'parent';
                $('.popup-custom').addClass('loading');
                $http.get(base_url + 'Tasks_management/api_get_project_role_by_id/' + id).then(r => {
                    if (r.data.data) {
                        $scope.listParent.user = r.data.data;
                        $scope.is_parentAdmin = r.data.is_admin;
                        $scope.showPeople = !$scope.showPeople;
                        setTimeout(() => {
                            $('.select2').select2();
                        }, 2);
                    };
                })
            } else {
                if (type == 'time') {
                    $scope.editTask.end_time = $(event.target).text().trim();
                    setTimeout(() => {
                        $('input[name="datetimes"]').daterangepicker({
                            singleDatePicker: true,
                            timePicker: true,
                            "opens": "top",
                            locale: {
                                format: 'DD/MM hh:mm A'
                            }
                        });
                    }, 100);
                }
                $('.popup-custom').removeClass('loading');
                $scope.showPopup(event);
            }
        }
        $scope.editEndtime = () => {
            // $scope.editTask.end_time = formatDate($scope.editTask.end_time, 'ymd');
            var drp_end = $('#edit-end-time').data('daterangepicker');
            $scope.editTask.end_time = formatDate(drp_end.startDate, 'dmy');
            $http.post(base_url + '/Tasks_management/editEndtime', $scope.editTask).then(r => {
                if (r && r.data.status == 1) {
                    $scope.editTask.event.html($scope.editTask.end_time);
                    $('.popup-custom').css('display', 'none');
                } else toastr["error"]('Không có quyền thay đổi!');
            });
        }
        $scope.setNulTime = () => {
            $http.post(base_url + '/Tasks_management/setNulTime/' + $scope.editTask.id).then(r => {
                if (r && r.data.status == 1) {
                    $scope.editTask.event.html('').removeClass('failed');
                    $('.popup-custom').css('display', 'none');
                } else toastr["error"]('Không có quyền thay đổi!');
            });
        }
        $scope.hidePA = () => {
            $scope.showPeople = !$scope.showPeople;
            $('.custom-tr').removeClass('active');
        }
        $scope.addPeople = () => {
            $scope.appendChildPeople.id = $scope.editTask.id;
            var hasUser = false;
            if ($scope.peopleInModal) {
                hasUser = $scope.peopleInModal.find(r => {
                    return r[2] == $scope.appendChildPeople.value
                });
            }
            if (!hasUser) {
                $http.post(base_url + '/Tasks_management/appendPeople', $scope.appendChildPeople).then(r => {
                    if (r.data && r.data.status == 1) {
                        $scope.appendChildPeople.value = '0';
                        $scope.peopleInModal = r.data.data.info;
                        var innerTemp = '';
                        r.data.data.info.forEach(element => {
                            innerTemp = innerTemp + '<img src="' + element[1] + '" class="person-bullet-image person-bullet-component">';
                        });
                        setTimeout(() => {
                            if (!$scope.editTask.event.hasClass('person-bullet-component')) {
                                $scope.editTask.event.find('.multiple-person-cell-component').html(innerTemp);
                            } else {
                                $scope.editTask.event.parents('.custom-td').find('.multiple-person-cell-component').html(innerTemp);
                            }
                        }, 100);
                    }
                });
            } else toastr["error"]('Nhân viên đã tồn tại!');
        }
        $scope.addParentUser = () => {
            $scope.appendPeople.id = $scope.editTask.id;
            if ($scope.listParent.user) {
                var hasUser = $scope.listParent.user.find(r => {
                    return r.id == $scope.appendPeople.parentValue
                });
            }
            if (!hasUser) {
                $http.post(base_url + '/Tasks_management/addParentUser', $scope.appendPeople).then(r => {
                    if (r.data && r.data.status == 1) {
                        $scope.listParent.user = r.data.data;
                        $scope.appendPeople.parentValue = 0;
                        $scope.editTask.event.find('span.count').html(r.data.count);
                        $scope.is_parentAdmin = r.data.is_admin;
                    }
                });
            } else toastr["error"]('Nhân viên đã tồn tại!');

        }

        $scope.changeAdmin = (user_id, type) => {
            $scope.appendPeople.id = $scope.editTask.id;
            if (type == 1) $scope.appendPeople.is_admin = 0;
            else $scope.appendPeople.is_admin = 1;
            $scope.appendPeople.user_id = user_id;

            $http.post(base_url + '/Tasks_management/changeAdmin', $scope.appendPeople).then(r => {
                if (r.data && r.data.status == 1) {
                    $scope.listParent.user = r.data.data;
                }
            });
        }
        $scope.removeParentPeople = (id) => {
            $scope.editTask.userRemove = id;
            $http.post(base_url + '/Tasks_management/removeParentPeople', $scope.editTask).then(r => {
                if (r.data && r.data.status == 1) {
                    $scope.listParent.user = r.data.data;
                    $scope.is_parentAdmin = r.data.is_admin;
                    $scope.editTask.event.find('span.count').html(r.data.count);
                }
            });
        }
        $scope.setStatus_old = (value) => {
            $scope.editTask.status = value;
            $http.post(base_url + '/Tasks_management/editStatus_old', $scope.editTask).then(r => {
                if (r && r.data.status == 1) {
                    switch (value) {
                        case 0:
                            $scope.editTask.event.parent().html('<div class="working-on-it in-table">Đang làm</div>');
                            break;
                        case 1:
                            $scope.editTask.event.parent().html('<div class="waiting-reviews in-table">Chờ Duyệt</div>');
                            break;
                        case 2:
                            $scope.editTask.event.parent().html('<div class="task-done in-table">Hoàn thành</div>');
                            break;
                        default:
                            // code block
                    }
                } else toastr["error"]('Không có quyền thay đổi!');
                $('.popup-custom').css('display', 'none');
            });
        }
        $scope.setStatus = (value) => {
            $scope.editTask.status = value.id;
            $http.post(base_url + '/Tasks_management/editStatus', $scope.editTask).then(r => {
                if (r && r.data.status == 1) {
                    $scope.editTask.event.html('<div class="in-table" style="background:' + value.background_color + '">' + value.name + '</div>');
                } else toastr["error"]('Không có quyền thay đổi!');
                $('.popup-custom').css('display', 'none');
            });
        }
        $scope.setpriority = (value) => {
            $scope.editTask.priority = value;
            $http.post(base_url + '/Tasks_management/editPriority', $scope.editTask).then(r => {
                if (r && r.data.status == 1) {
                    switch (value) {
                        case 0:
                            $scope.editTask.event.parent().html('<div class="priority-normal in-table">Bình thường</div>');
                            break;
                        case 1:
                            $scope.editTask.event.parent().html('<div class="priority-high in-table">Cao</div>');
                            break;
                        case 2:
                            $scope.editTask.event.parent().html('<div class="priority-urgent in-table">Gấp</div>');
                            break;
                        default:
                            // code block
                    }
                } else toastr["error"]('Không có quyền thay đổi!');
                $('.popup-custom').css('display', 'none');
            });
        }
        $scope.openDetail = (event, type, text, id) => {
            $scope.showCheckinList = false;
            if ($(event.target).hasClass('quick-edit-name') || $(event.target).hasClass('editname-input') || $(event.target).hasClass('openfix')) {
                return true;
            } else {
                if (type == 'open') {
                    $('.main-detail').addClass('loading');
                    $http.get(base_url + 'Tasks_management/api_get_project_by_id/' + id).then(r => {
                        if (r.data.data) {
                            $scope.projectDetail = r.data.data;
                            $scope.projectDetail.start_time = formatDate(r.data.data.start_time, 'dmy');
                            $scope.projectDetail.end_time = formatDate(r.data.data.end_time, 'dmy');
                            $('#datetimes-start-detail').data('daterangepicker').setStartDate($scope.projectDetail.start_time);
                            $('.main-detail').removeClass('loading');
                            $scope.detail_getData.id = r.data.data.id;
                            $scope.detail_getData.type = 'child';
                            $http.post(base_url + '/Tasks_management/getBreadCrumbProject', $scope.detail_getData).then(r => {
                                if (r.data.status == 1) {
                                    $scope.breadcrumb = r.data.data;
                                }
                            });
                        };
                    })
                    $('.detail-space').addClass('active');
                    // $('html, body').css({
                    //     overflow: 'hidden',
                    //     height: '100%'
                    // });
                } else {
                    $('.detail-space').removeClass('active');
                    $('html, body').css({
                        overflow: 'auto',
                        height: 'auto'
                    });
                    $scope.checkin_open_detail = false;
                }
            }
        }

        $scope.newBoard = (parent_id, type, event) => {
            $scope.groupEvent = event;
            $scope.newTree.parent_id = parent_id;
            if (type == 'create') {
                $scope.newBoardStatus = 1;
            } else if (type == 'addpeople') {
                $scope.newBoardStatus = 2;
                $scope.get_listGroupPeopleByID();
            } else if (type == 'addchild') {
                $scope.newBoardStatus = 3;
                $scope.get_listChildGroupPeopleByID();
            }
        }
        $scope.get_listGroupPeopleByID = () => {
            $http.get(base_url + '/Tasks_management/get_listGroupPeopleByID/' + $scope.newTree.parent_id).then(r => {
                if (r.data && r.data.status == 1) {
                    $scope.is_parentAdmin = r.data.is_admin;
                    $scope.listParent.user = r.data.data;
                    $($scope.groupEvent.target).parents('.workspace-item-wrapper').find('span.letter').html(r.data.count);
                    setTimeout(() => {
                        $('.select2').select2();
                    }, 500);
                }
            });
        }
        $scope.get_listChildGroupPeopleByID = () => {
            $http.get(base_url + '/Tasks_management/get_listChildGroupPeopleByID/' + $scope.newTree.parent_id).then(r => {
                if (r.data && r.data.status == 1) {
                    $scope.is_parentAdmin = r.data.is_admin;
                    $scope.listParent.user = r.data.data;
                    setTimeout(() => {
                        $('.select2').select2();
                    }, 500);
                }
            });
        }
        $scope.createTree = () => {
            $http.post(base_url + '/Tasks_management/api_createTree', $scope.newTree).then(r => {
                if (r.data && r.data.status == 1) {
                    toastr["success"](r.data.message);
                    $('#boardModal').modal('hide');
                    $scope.getCategoriesData();
                }
            })
        }
        $scope.hideSpace = (e) => {
            if ($(e.target).hasClass('active')) {
                $(e.target).removeClass('active');
                $(e.target).parents('.workspace-item-component').find('.workspace-child-item ').slideDown();
            } else {
                $(e.target).addClass('active');
                $(e.target).parents('.workspace-item-component').find('.workspace-child-item').slideUp();
            }
        }

        $scope.getCategoriesData = () => {
            $http.get(base_url + 'Tasks_management/ajax_getProjectGroup').then(r => {
                if (r.data) {
                    $scope.relationType = 1;
                    $(".virtual-list").empty();
                    var $el = $(r.data.data).appendTo('.virtual-list');
                    $compile($el)($scope);
                };
            })
        }
        $scope.getRelationCategoriesData = () => {
            $http.get(base_url + 'Tasks_management/ajax_getRelationProjectGroup').then(r => {
                if (r.data.status == 1) {
                    $scope.relationType = 2;
                    $(".virtual-list").empty();
                    var $el = $(r.data.data).appendTo('.virtual-list');
                    $compile($el)($scope);
                } else {
                    $scope.relationType = 2;
                    $(".virtual-list").empty();
                    var $el = $(r.data.message).appendTo('.virtual-list');
                    $compile($el)($scope);
                }
            })
        }
        $scope.openGroup = (event, id) => {
            if (event.target.closest(".child-action, .child-action-form")) return;
            $('.description-line').addClass('reload');
            $scope.taskCondition.listStatus = [];
            $scope.taskCondition.listPriority = [];
            $scope.taskCondition.peopleFilterItem = 0;
            $scope.parentGrroupCurrent.groupId = 0;
            $scope.taskCondition.groupId = id;
            $scope.detailReport.group = id;
            $scope.directInrelaton = false;
            $scope.taskCondition.storage = false;
            $('.detail-space').removeClass('active');
            $scope.getTaskList();
            $scope.directBtn = true;
            $scope.getGroupById();
            $scope.dashboard = 0;
            $scope.detailReport.id_user = '0';
            $scope.getDetailReport();
            $scope.getColType();
            setTimeout(() => {
                runDrag_to_scroll();
            }, 500);
        }
        $scope.getColType = () => {
            $http.get(base_url + '/Tasks_management/ajax_getcolType').then(r => {
                if (r.data.status == 1) {
                    $scope.col_type_array = r.data.data;
                }
            });
        }
        $scope.getDetailReport = () => {
            $('.data').addClass('loading');
            $("#pie-chart, #bar-example").empty();
            $http.post(base_url + '/Tasks_management/getDetailReportbyID', $scope.detailReport).then(r => {
                if (r.data.status == 1) {
                    $scope.detailReportResult = r.data.data;
                    $('.custom-s2').css('background-image', 'url(' + r.data.img_url + ')');
                }
            });
        }
        $scope.createNewCol = (col_type, child_group) => {
            $scope.new_table_col.col_type = col_type;
            $scope.new_table_col.child_group = child_group;
            $http.post(base_url + '/Tasks_management/api_create_new_table_col', $scope.new_table_col).then(r => {
                if (r.data.status == 1) {
                    $scope.getTaskList();
                }
            });
        }
        $scope.getGroupById = () => {
            $http.get(base_url + '/Tasks_management/ajax_getCategoriesById/' + $scope.taskCondition.groupId).then(r => {
                if (r) {
                    $scope.group_admin = r.data.role;
                    $scope.groupDetail = r.data.data;
                    $('.description-line').removeClass('reload');
                    $('#inputSearchName').keyup(delay(function(e) {
                        $scope.getTaskList();
                    }, 500));
                    $http.get(base_url + '/Tasks_management/allEmployees').then(rs => {
                        if (rs) {
                            $scope.listPeople = rs.data.data;
                        }
                    });
                }
            });
        }

        function delay(callback, ms) {
            var timer = 0;
            return function() {
                var context = this,
                    args = arguments;
                clearTimeout(timer);
                timer = setTimeout(function() {
                    callback.apply(context, args);
                }, ms || 0);
            };
        }


        $scope.getTaskList = () => {
            $scope.dragParent = false;
            if ($scope.taskCondition.listStatus.length > 0 || $scope.taskCondition.listPriority.length > 0 || $scope.taskCondition.peopleFilterItem != 0) {
                $('.filter-group').removeClass('show');
                $('.filter-group').addClass('show');
            } else {
                $('.filter-group').removeClass('show');
            }
            $http.post(base_url + '/Tasks_management/getTaskList', $scope.taskCondition).then(r => {
                if (r.data && r.data.status == 1) {
                    $scope.list_parent_drag.list = r.data.parent_project;
                    $(".table-custom").empty();
                    $scope.grouptDetail = r.data.data;
                    var $el = $(r.data.projects).appendTo('.table-custom');
                    $compile($el)($scope);
                    setTimeout(() => {
                        $scope.scroll_animate();
                        $('.quick-task-creator, .be-collapsed .custom-tr.head-tr').css('max-width', $('.child-project').width());
                    }, 100);
                } else {
                    $(".table-custom").empty();
                    $(".table-custom").html(r.data.message);
                }
                $('.quick-task-creator input').focus(function() {
                    $(this).parent().addClass('active');
                });
                $('.quick-task-creator input').focusout(function() {
                    $(this).parent().removeClass('active');
                });
            });
        }
        $scope.scroll_animate = () => {
            $('.outside-tablecustom').scroll(function() {
                var x = $('.outside-tablecustom').scrollLeft();
                $('.custom-td.name-cell, .quick-task-creator').css('transform', 'translateX(' + x + 'px)');
                $('.left-bar, .down-button.onside').css('transform', 'translateX( ' + x + 'px)translateY(-50%)');
                if (x > 0) $('.table-custom').addClass('scrolling');
                else $('.table-custom').removeClass('scrolling');
            });
        }

        // drag to scroll

        function runDrag_to_scroll() {
            const slider = document.querySelector('.outside-tablecustom');
            let isDown = false;
            let startX;
            let scrollLeft;

            slider.addEventListener('mousedown', (e) => {
                isDown = true;
                slider.classList.add('moving');
                startX = e.pageX - slider.offsetLeft;
                scrollLeft = slider.scrollLeft;
            });
            slider.addEventListener('mouseleave', () => {
                isDown = false;
                slider.classList.remove('moving');
            });
            slider.addEventListener('mouseup', () => {
                isDown = false;
                slider.classList.remove('moving');
            });
            slider.addEventListener('mousemove', (e) => {
                if (!isDown) return;
                e.preventDefault();
                const x = e.pageX - slider.offsetLeft;
                const walk = (x - startX) * 3; //scroll-fast
                slider.scrollLeft = scrollLeft - walk;

            });
        }

        // end drag to scroll

        $scope.createTask = (type, parent_id = 0) => {
            if (type = 'parent') {
                $http.post(base_url + '/Tasks_management/createParentTask/' + $scope.taskCondition.groupId).then(r => {
                    if (r.data && r.data.status == 1) {
                        $scope.getTaskList();
                        setTimeout(() => {
                            $('.task-box:first-child .parent-name-form input').focus();
                        }, 1000);
                    }
                });
            }
        }
        $scope.changeGrname = (event, id) => {
            $scope.taskOutsideEdit.name = $(event.target).val();
            $scope.taskOutsideEdit.id = id;
            $http.post(base_url + '/Tasks_management/editName', $scope.taskOutsideEdit).then(r => {
                if (r.data.status == 1) {
                    $(event.target).parents('.name-box').find('.openfix').html($(event.target).val());
                }
            });
            $('.name-box').removeClass('active');
        }
        $scope.changeGrnameBySubmit = (event, id) => {
            $scope.taskOutsideEdit.name = $(event.target).children('input').val();
            $scope.taskOutsideEdit.id = id;
            $(event.target).parents('.name-box').find('.openfix').html($(event.target).val());
            $('.name-box').removeClass('active');
            $http.post(base_url + '/Tasks_management/editName', $scope.taskOutsideEdit).then(r => {});
        }
        $scope.changeParentName = (event, id) => {
            $scope.taskOutsideEdit.name = $(event.target).val();
            $scope.taskOutsideEdit.id = id;
            $(event.target).parent().find('.openfix').html($(event.target).val());
            $('.name-box').removeClass('active');
            $http.post(base_url + '/Tasks_management/editParentName', $scope.taskOutsideEdit).then(r => {});
        }
        $scope.changeParentNameBySubmit = (event, id) => {
            $scope.taskOutsideEdit.name = $(event.target).children('input').val();
            $scope.taskOutsideEdit.id = id;
            $('input.head-tit').focusout();
            $http.post(base_url + '/Tasks_management/editParentName', $scope.taskOutsideEdit).then(r => {});
        }
        $('.table-custom').on('focus', '.create-child-task ', function() {
            $(this).parent().addClass('active');
        })
        $('.table-custom').on('focusout', '.create-child-task ', function() {
            $(this).parent().removeClass('active');
        })
        $scope.createChildTask = (event, parent_id) => {
            $scope.newChild.name = $(event.target).parent().find('input').val();
            $scope.newChild.parent_id = parent_id;
            $http.post(base_url + '/Tasks_management/createChildTask', $scope.newChild).then(r => {
                if (r.data && r.data.status == 1) {
                    $scope.getTaskList();
                } else toastr["error"](r.data.message);
            });
        }
        $scope.removePeople = (index) => {
            if ($scope.peopleInModal.length > 1) {
                $scope.editTask.removePeople = $scope.peopleInModal[index][2];
                $http.post(base_url + '/Tasks_management/removePeople', $scope.editTask).then(r => {
                    if (r.data && r.data.status == 1) {
                        $scope.peopleInModal = r.data.data.info;
                        var innerTemp = '';
                        r.data.data.info.forEach(element => {
                            innerTemp = innerTemp + '<img src="' + element[1] + '" class="person-bullet-image person-bullet-component">';
                        });
                        setTimeout(() => {
                            if (!$scope.editTask.event.hasClass('person-bullet-component')) {
                                $scope.editTask.event.find('.multiple-person-cell-component').html(innerTemp);
                            } else {
                                $scope.editTask.event.parents('.custom-td').find('.multiple-person-cell-component').html(innerTemp);
                            }
                        }, 100);
                    }
                });
            } else toastr["error"]('Không thể xóa thành viên cuối cùng!');
        }
        $scope.attachFile = () => {
            $('#inputFileEdit').click();
        }
        $scope.imageUpload = function(element, type) {
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
                url: base_url + '/uploads/ajax_upload_to_filehost?func=tasks_task_management',
                method: "POST",
                data: formData,
                headers: { 'Content-Type': undefined }
            }).then(r => {
                if (r.data.status == 1) {
                    toastr["success"](r.data.message);
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
        $scope.deleteTask = () => {
            $http.get(base_url + 'Tasks_management/api_get_remove_task_by_id/' + $scope.deletedTaskId).then(r => {
                if (r.data.status == 1) {
                    $('#deleteModal').modal('hide');
                    $scope.getTaskList();
                } else toastr["error"](r.data.message);
            })
        }
        $scope.deleteParentTask = () => {
            $http.get(base_url + 'Tasks_management/api_get_removeParent_task_by_id/' + $scope.deletedTaskId).then(r => {
                if (r.data.status == 1) {
                    $('#deleteParentModal').modal('hide');
                    $scope.editParentInner.parents('.task-box').remove();
                };
            })
        }
        $scope.setDeleteParent = (event, parent_id) => {
                $scope.deletedTaskId = parent_id;
                $scope.editParentInner = $(event.target);
            }
            // $('.detail-space').on('mouseenter', function() {
            //     $('body').append('<div class="body-shadow"></div>')
            // })
            // $('.detail-space').on('mouseleave', function() {
            //     $('.body-shadow').remove();
            // })



        $scope.editProject = () => {
            var drp_start = $('#datetimes-start-detail').data('daterangepicker');
            // var drp_end = $('#datetimes-end-detail').data('daterangepicker');
            $scope.projectDetail.start_time = formatDate(drp_start.startDate, 'ymd');
            // $scope.projectDetail.end_time = formatDate(drp_end.startDate, 'ymd');
            $('.detail-area').addClass('loading');
            setTimeout(() => {
                $http.post(base_url + '/Tasks_management/api_edit_project', $scope.projectDetail).then(r => {
                    if (r && r.data.status == 1) {
                        $('.detail-area').removeClass('loading');
                        toastr["success"](r.data.message);
                        $scope.getTaskList();
                    } else toastr["error"](r.data.message);
                })
            }, 1);
        }
        $scope.taskSort = (type) => {
            switch (type) {
                case "status":
                    $scope.taskCondition.status = !$scope.taskCondition.status;
                    break;
                case "priority":
                    $scope.taskCondition.priority = !$scope.taskCondition.priority;
                    break;
                case "time":
                    $scope.taskCondition.date = !$scope.taskCondition.date;
                    break;
                default:
            }
            setTimeout(() => {
                $scope.getTaskList();
            }, 2);
        }

        $scope.editNameGroup = (event, id) => {
            $scope.editGroup.name = $(event.target).val();
            $scope.editGroup.id = id;
            $http.post(base_url + '/Tasks_management/editNameGroup', $scope.editGroup).then(r => {
                if (r && r.data.status == 1) {
                    $scope.getGroupById();
                    $(event.target).parents('.outside-form').find('.real-name').html($(event.target).val());
                    $('.workspace-child-item').removeClass('show-edit');
                }
            })
        }
        $scope.editNameGroupbySubmit = (event, id) => {
            $scope.editGroup.name = $(event.target).children('input').val();
            $scope.editGroup.id = id;
            $http.post(base_url + '/Tasks_management/editNameGroup', $scope.editGroup).then(r => {
                if (r && r.data.status == 1) {
                    $scope.getGroupById();
                    $(event.target).parents('.outside-form').find('.real-name').html($(event.target).val());
                    $('.workspace-child-item').removeClass('show-edit');
                }
            })
        }
        $scope.openGroupName = (event) => {
            $('.workspace-child-item').removeClass('show-edit');
            $('.outside-form').removeClass('active');
            var text = $(event.target).parents('.workspace-child-item').find('input.edit-group-name').val();
            $(event.target).parents('.workspace-child-item').addClass('show-edit').find('input.edit-group-name').val('').focus().val(text);
        }
        $scope.openGroupPeople = () => {
            $scope.showModal = !$scope.showModal;
        }
        $scope.openNameFix = (event) => {
            $(event.target).parent().addClass('active');
            setTimeout(() => {
                $(event.target).parent().find('.editname-input').focus();
            }, 100);
        }
        $scope.filterAreaStatus = (event) => {
            if ($(event.target).parent().hasClass('active')) {
                $(event.target).parent().removeClass('active');
            } else {
                $(event.target).parent().addClass('active');
            }
        }
        document.addEventListener("click", function(event) {
            // If user clicks inside the element, do nothing
            if (event.target.closest(".filter-i, .filter-area")) return;
            // If user clicks outside the element, hide it!
            $('.filter-group').removeClass('active');
            // $('.bg-dark').css('display', 'none');
        });

        $scope.taskFiler = (type) => {
            switch (type) {
                case 'running':
                    $scope.taskCondition.statusRunning = !$scope.taskCondition.statusRunning;

                    var aindex = ($scope.taskCondition.listStatus).indexOf(0);
                    if (aindex < 0) {
                        $scope.taskCondition.listStatus.push(0);
                    } else {
                        $scope.taskCondition.listStatus.splice(aindex, 1);
                    }
                    break;
                case 'done':
                    $scope.taskCondition.statusDone = !$scope.taskCondition.statusDone;
                    var aindex = $scope.taskCondition.listStatus.indexOf(2);
                    if (aindex < 0) {
                        $scope.taskCondition.listStatus.push(2);
                    } else {
                        $scope.taskCondition.listStatus.splice(aindex, 1);
                    }
                    break;
                case 'wait':
                    $scope.taskCondition.statusWait = !$scope.taskCondition.statusWait;
                    var aindex = $scope.taskCondition.listStatus.indexOf(1);
                    if (aindex < 0) {
                        $scope.taskCondition.listStatus.push(1);
                    } else {
                        $scope.taskCondition.listStatus.splice(aindex, 1);
                    }
                    break;
                case 'normal':
                    $scope.taskCondition.priorityNormal = !$scope.taskCondition.priorityNormal;
                    var aindex = $scope.taskCondition.listPriority.indexOf(0);
                    if (aindex < 0) {
                        $scope.taskCondition.listPriority.push(0);
                    } else {
                        $scope.taskCondition.listPriority.splice(aindex, 1);
                    }
                    break;
                case 'high':
                    $scope.taskCondition.priorityHigh = !$scope.taskCondition.priorityHigh;
                    var aindex = $scope.taskCondition.listPriority.indexOf(1);
                    if (aindex < 0) {
                        $scope.taskCondition.listPriority.push(1);
                    } else {
                        $scope.taskCondition.listPriority.splice(aindex, 1);
                    }
                    break;
                case 'sos':
                    $scope.taskCondition.prioritySos = !$scope.taskCondition.prioritySos;
                    var aindex = $scope.taskCondition.listPriority.indexOf(2);
                    if (aindex < 0) {
                        $scope.taskCondition.listPriority.push(2);
                    } else {
                        $scope.taskCondition.listPriority.splice(aindex, 1);
                    }
                    break;
                default:
                    // code block
            }
            $scope.getTaskList();
        }

        $scope.deleteTaskPeopleFilter = (id) => {
            $scope.taskCondition.peopleFilter.forEach(function callback(element, index) {
                if (element.id == id) {
                    $scope.taskCondition.peopleFilter.splice(index, 1);
                }
            })
            $scope.getTaskList();
        }
        $scope.setColor = (event) => {
            $scope.editTask.color = '#' + $('#widget').colorwheel('value');
            $http.post(base_url + '/Tasks_management/editColor', $scope.editTask).then(r => {
                if (r && r.data.status == 1) {
                    $scope.getTaskList();
                    $scope.showPeople = !$scope.showPeople;
                }
            });
        }
        $scope.deleteGroups = () => {
            $('.outside-form').removeClass('active');
            $http.get(base_url + '/Tasks_management/ajax_deleteGroup/' + $scope.deleteGroupId).then(r => {
                if (r && r.data.status == 1) {
                    $scope.getCategoriesData();
                } else toastr["error"](r.data.message);
                $('#deleteGroupModal').modal('hide');
            });
        }

        $scope.createProjectGroup = () => {
            $http.post(base_url + '/Tasks_management/ajax_createProjectGroup', $scope.newTree).then(r => {
                if (r && r.data.status == 1) {
                    $('#createProjectGroup').modal('hide');
                } else toastr["error"](r.data.message);
            });
        }
        $scope.addGroupPeople = (type) => {
            $scope.appendPeople.group_id = $scope.newTree.parent_id;
            if ($scope.listParent.user) {
                var hasUser = $scope.listParent.user.find(r => {
                    return r.id == $scope.appendPeople.parentValue
                });
            }
            if (!hasUser) {
                if (type == 'parent') {
                    $http.post(base_url + '/Tasks_management/add_GroupPeople', $scope.appendPeople).then(r => {
                        if (r.data && r.data.status == 1) {
                            $scope.appendPeople.parentValue = 0;
                            $scope.get_listGroupPeopleByID();
                        }
                    });
                } else {
                    $http.post(base_url + '/Tasks_management/add_ChildGroupPeople', $scope.appendPeople).then(r => {
                        if (r.data && r.data.status == 1) {
                            $scope.appendPeople.parentValue = 0;
                            $scope.get_listChildGroupPeopleByID();
                        }
                    });
                }
            } else toastr["error"]('Nhân viên đã tồn tại!');
        }
        $scope.removeGroupPeople = (id) => {
            $scope.deleteGroup.group_id = $scope.newTree.parent_id;
            $scope.deleteGroup.user = id;

            $http.post(base_url + '/Tasks_management/delete_GroupPeople', $scope.deleteGroup).then(r => {
                if (r.data && r.data.status == 1) {
                    $scope.get_listGroupPeopleByID();
                }
            });
        }
        $scope.removeChildGroupPeople = (id) => {
            $scope.deleteGroup.group_id = $scope.newTree.parent_id;
            $scope.deleteGroup.user = id;

            $http.post(base_url + '/Tasks_management/delete_ChildGroupPeople', $scope.deleteGroup).then(r => {
                if (r.data && r.data.status == 1) {
                    $scope.get_listChildGroupPeopleByID();
                }
            });
        }
        $scope.openStorageTask = () => {
            $scope.taskCondition.storage = !$scope.taskCondition.storage;
            $scope.getTaskList();
        }
        $scope.changeGroupAdmin = (user_id, admin_status) => {
            $scope.editGroup.group_id = $scope.newTree.parent_id;
            $scope.editGroup.user = user_id;
            if (admin_status == 1) { $scope.editGroup.is_admin = 0; } else $scope.editGroup.is_admin = 1;
            $http.post(base_url + '/Tasks_management/setAdmin_GroupPeople', $scope.editGroup).then(r => {
                if (r.data && r.data.status == 1) {
                    $scope.get_listGroupPeopleByID();
                }
            });
        }
        $scope.changeChildGroupAdmin = (user_id, admin_status) => {
            $scope.editGroup.group_id = $scope.newTree.parent_id;
            $scope.editGroup.user = user_id;
            if (admin_status == 1) { $scope.editGroup.is_admin = 0; } else $scope.editGroup.is_admin = 1;
            $http.post(base_url + '/Tasks_management/setAdmin_ChildGroupPeople', $scope.editGroup).then(r => {
                if (r.data && r.data.status == 1) {
                    $scope.get_listChildGroupPeopleByID();
                }
            });
        }
        $scope.duplicateProjectTo = (group_id, parent_id) => {

            $scope.duplicate_project.group_id = group_id;
            $scope.duplicate_project.parent_id = parent_id;

            $http.post(base_url + '/Tasks_management/duplicateRecord', $scope.duplicate_project).then(r => {
                if (r && r.data.status == 1) {
                    if (r.data.type == 0) {
                        $scope.getTaskList();
                    } else {
                        toastr["success"]('Sao chép thành công!');
                        $('.down-button').removeClass('active');
                    }
                }
            });
        }

        $scope.storageParent = (event, parent_id) => {
            $http.get(base_url + '/Tasks_management/storageParent/' + parent_id).then(r => {
                if (r && r.data.status == 1) {
                    $(event.target).parents('.task-box').remove();
                }
            });
        }
        $scope.reStorageParent = (event, parent_id) => {
            $http.get(base_url + '/Tasks_management/reStorageParent/' + parent_id).then(r => {
                if (r && r.data.status == 1) {
                    $(event.target).parents('.task-box').remove();
                }
            });
        }

        $scope.converHtml = (htmlbd) => {
            return $sce.trustAsHtml(htmlbd);
        }

        $scope.getReportData = () => {
            $scope.dashboard = 1;
            $scope.list_parent_recent_limit = 10;
            $("#bar-example, #pie-chart, #week-pie-chart").empty();
            $('.task-content').addClass('loading');
            $http.get(base_url + '/Tasks_management/getReportData').then(r => {
                if (r && r.data.status == 1) {
                    $scope.list_parent_recent = r.data.list_parent_recent;
                    $scope.total_array = r.data.total_array;
                    $scope.timeline = r.data.timeline;
                    $scope.listTodo = r.data.todo;
                    if (r.data.left30day.running == 0 && r.data.left30day.review == 0 && r.data.left30day.done == 0) {
                        var $el = $('<div class="no-item"></div>').appendTo('#pie-chart');
                        $compile($el)($scope);
                    } else {
                        new Morris.Donut({
                            element: 'pie-chart',
                            data: [
                                { label: "Đang làm", value: r.data.left30day.running },
                                { label: "Chờ duyệt", value: r.data.left30day.review },
                                {
                                    label: "Hoàn thành",
                                    value: r.data.left30day.done,
                                },
                            ],
                            labelColor: "#556b2f",
                            colors: ['rgb(253, 171, 61)', 'rgb(87, 155, 252)', 'rgb(0, 200, 117)']
                        });
                    }
                    if (r.data.total_array.running.left_7day == 0 && r.data.total_array.review.left_7day == 0 && r.data.total_array.done.left_7day == 0) {
                        var $el = $('<div class="no-item"></div>').appendTo('#week-pie-chart');
                        $compile($el)($scope);
                    } else {
                        new Morris.Donut({
                            element: 'week-pie-chart',
                            data: [
                                { label: "Đang làm", value: r.data.total_array.running.left_7day, labelColor: "#EC407A", },
                                { label: "Chờ duyệt", value: r.data.total_array.review.left_7day, labelColor: "#EC407A", },
                                {
                                    label: "Hoàn thành",
                                    value: r.data.total_array.done.left_7day,
                                },
                            ],
                            labelColor: "#556b2f",
                            colors: ['rgb(253, 171, 61)', 'rgb(87, 155, 252)', 'rgb(0, 200, 117)']
                        });
                    }
                    var $arrColors = ['#dc3545', '#ffc107', '#17a2b8', '#6dce45'];
                    new Morris.Bar({
                        element: 'bar-example',
                        data: [
                            { y: 'Quá hạn', a: r.data.total_array.bar_val.failed },
                            { y: 'Gần hết hạn', a: r.data.total_array.bar_val.commingsoon },
                            { y: 'Hôm nay', a: r.data.total_array.bar_val.today },
                            { y: 'Khác', a: r.data.total_array.bar_val.more },
                        ],
                        xkey: 'y',
                        ykeys: ['a'],
                        labels: ['Tổng'],
                        horizontal: true,
                        barColors: function(row, series, type) {
                            return $arrColors[row.x];
                        },
                    });
                    $('.task-content').removeClass('loading');
                    $('.quick-task-creator input').focus(function() {
                        $(this).parent().addClass('active');
                    });

                    $('.quick-task-creator input').focusout(function() {
                        $(this).parent().removeClass('active');
                    });
                }

                setTimeout(() => {
                    var $myGroup = $('#myGroup');
                    $myGroup.on('show.bs.collapse', '.collapse', function() {
                        $myGroup.find('.collapse.in').collapse('hide');
                    });
                }, 200);
            });
        }
        $scope.reportByGroup = (id) => {
            $scope.group_report_list = [];
            $('.form-filter').removeClass('selected');
            $scope.parentGrroupCurrent.groupId = id;
            $scope.taskCondition.groupId = 0;
            $scope.dashboard = 2;
            $("#bar-example, #pie-chart, #week-pie-chart").empty();
            $http.get(base_url + '/Tasks_management/getReportDataByGroupId/' + id).then(r => {
                if (r.data.status == 1) {
                    $scope.filter_group_users = r.data.list_users;
                    $scope.checkin_report_list = r.data.list_checkins;
                    $("#bar-example, #pie-chart, #week-pie-chart").empty();
                    $scope.totalcountGroup = r.data.normal.total;
                    $scope.storagecountGroup = r.data.storage.total;
                    $scope.timeline = r.data.timeline;
                    $scope.detailParentCount = r.data.parent_count;
                    if (r.data.normal.total == 0) {
                        var $el = $('<div class="no-item"></div>').appendTo('#pie-chart');
                        $compile($el)($scope);
                    } else {
                        new Morris.Donut({
                            element: 'pie-chart',
                            data: [
                                { label: "Đang làm", value: r.data.normal.running, labelColor: "#EC407A", },
                                { label: "Chờ duyệt", value: r.data.normal.review, labelColor: "#EC407A", },
                                {
                                    label: "Hoàn thành",
                                    value: r.data.normal.done,
                                },
                            ],
                            labelColor: "#556b2f",
                            colors: ['rgb(253, 171, 61)', 'rgb(87, 155, 252)', 'rgb(0, 200, 117)']
                        });
                    }


                    if (r.data.storage.total == 0) {
                        var $el = $('<div class="no-item"></div>').appendTo('#week-pie-chart');
                        $compile($el)($scope);
                    } else {
                        new Morris.Donut({
                            element: 'week-pie-chart',
                            data: [
                                { label: "Đang làm", value: r.data.storage.running, labelColor: "#EC407A", },
                                { label: "Chờ duyệt", value: r.data.storage.review, labelColor: "#EC407A", },
                                {
                                    label: "Hoàn thành",
                                    value: r.data.storage.done,
                                },
                            ],
                            labelColor: "#556b2f",
                            colors: ['rgb(253, 171, 61)', 'rgb(87, 155, 252)', 'rgb(0, 200, 117)']
                        });
                    }


                    var $arrColors = ['#dc3545', '#ffc107', '#17a2b8', '#6dce45'];
                    new Morris.Bar({
                        element: 'bar-example',
                        data: [
                            { y: 'Quá hạn', a: r.data.barData.failed },
                            { y: 'Gần hết hạn', a: r.data.barData.commingsoon },
                            { y: 'Hôm nay', a: r.data.barData.today },
                            { y: 'Khác', a: r.data.barData.more },
                        ],
                        xkey: 'y',
                        ykeys: ['a'],
                        labels: ['Tổng'],
                        horizontal: true,
                        barColors: function(row, series, type) {
                            return $arrColors[row.x];
                        },
                    });
                } else {
                    $('.third-dashboard').addClass('empty-data');
                }
            })
        }

        $scope.createTodoItem = () => {
            $('ul.to_do').addClass('reload');
            if ($scope.newTodoItem.content.length > 0) {
                $http.post(base_url + '/Tasks_management/api_createTodoItem', $scope.newTodoItem).then(r => {
                    if (r.data && r.data.status == 1) {
                        $scope.listTodo = r.data.data;
                        $scope.newTodoItem.content = '';
                        $('ul.to_do').removeClass('reload');
                    }
                })
            }
        }
        $scope.removeTodoItem = (id) => {
            $('ul.to_do').addClass('reload');
            $http.get(base_url + 'Tasks_management/api_remove_todo_item/' + id).then(r => {
                if (r.data.status == 1) {
                    $scope.listTodo = r.data.data;
                    $('ul.to_do').removeClass('reload');
                };
            })
        }
        $scope.getStoragedTask = () => {
            $scope.dashboard = 0;
            $http.post(base_url + '/Tasks_management/getStoragedTasks', $scope.parentGrroupCurrent).then(r => {
                if (r.data && r.data.status == 1) {
                    var $el = $(r.data.projects).appendTo('.table-custom');
                    $compile($el)($scope);
                }
            });
        }
        $scope.collapseParent = (event, project_id, status) => {
            $scope.parentCollapse.status = (status == 1) ? 0 : 1;
            $scope.parentCollapse.id = project_id;
            $http.post(base_url + '/Tasks_management/setParentCollapse', $scope.parentCollapse).then(r => {
                if (r.data && r.data.status == 1) {
                    var $el = $(event.target).parents('.task-box').replaceWith(r.data.projects);
                    $compile($(".task-box").contents())($scope);
                    setTimeout(() => {
                        $('.quick-task-creator, .be-collapsed .custom-tr.head-tr').css('max-width', $('.child-project').width());
                    }, 10);
                }
            });
        }
        $scope.setbgcolor = (color) => {
            return { "background-color": color };
        }
        $scope.changePosition = (event, id_parent) => {
            $scope.position_change.id_parent = id_parent;
            $scope.position_change.event = event;
            $http.get(base_url + '/Tasks_management/getProjectChildrenList/' + id_parent).then(r => {
                if (r.data.status == 1) {
                    $scope.position_change.list_drag = r.data.data;
                }
                $('#positionModal').modal('show');
            })
        }
        $scope.changePositionList = () => {
            $http.post(base_url + '/Tasks_management/changeChildrensPos', $scope.position_change).then(r => {
                if (r.data && r.data.status == 1) {
                    event = $scope.position_change.event;
                    var $el = $(event.target).parents('.task-box').replaceWith(r.data.projects);
                    $compile($(".task-box").contents())($scope);
                    $('#positionModal').modal('hide');
                }
            });
        }
        $scope.updateParentProjectSort = () => {
            $('ul.list-drag-child').addClass('reload');
            $http.post(base_url + '/Tasks_management/changeParentPos', $scope.list_parent_drag).then(r => {
                if (r.data && r.data.status == 1) {
                    $('ul.list-drag-child').removeClass('reload');
                    $scope.getTaskList();
                }
            });
        }
        $scope.gotoParentDrag = () => {
            $scope.dragParent = true;
        }
        $scope.getAdminGroupList = () => {
            $http.get(base_url + 'Tasks_management/ajax_getAdminGroupList').then(r => {
                if (r.data.status == 1) {
                    $scope.list_admingroup = r.data.data;
                };
            })
        }
        $scope.openCheckinList = (id_project, type) => {
            $('.down-button').removeClass('active');
            $scope.checkin_item.id_project = id_project;
            $scope.checkin_item.type = type;
            $scope.showCheckinList = true;
            $('#chat').addClass('reload');
            $http.post(base_url + '/Tasks_management/getProjectCheckin', $scope.checkin_item).then(r => {
                if (r.data.status == 1) {
                    $('.detail-space').addClass('active');
                    $('#chat').removeClass('reload');
                    $scope.chatList = r.data.data;
                    $scope.projectDetail.name = r.data.project_name;
                    $("#chat").animate({ scrollTop: $("#chat")[0].scrollHeight }, 500);
                }
            })
            $scope.detail_getData.id = id_project;
            $scope.detail_getData.type = (type == 1) ? 'parent' : 'child';
            $http.post(base_url + '/Tasks_management/getBreadCrumbProject', $scope.detail_getData).then(r => {
                if (r.data.status == 1) {
                    $scope.breadcrumb = r.data.data;
                }
            });
        }
        $scope.createCheckin = () => {
            $('#chat li').addClass('reload');
            $http.post(base_url + '/Tasks_management/ajax_createCheckin', $scope.checkin_item).then(r => {
                if (r.data && r.data.status == 1) {
                    $('.detail-space').addClass('active');
                    $('#chat li').removeClass('reload');
                    $scope.chatList = r.data.data;
                    $scope.checkin_item.text = '';
                    $("#chat").animate({ scrollTop: $("#chat")[0].scrollHeight }, 500);
                }
            });
        }
        $scope.getCheckinData = (type) => {
            if (type == "reset") {
                $scope.checkin_condition = {};
                $('.form-filter').removeClass('selected');
            }
            $http.post(base_url + 'Tasks_management/ajax_listCheckinCondition', $scope.checkin_condition).then(r => {
                if (r.data.status == 1) {
                    $scope.checkin_parent_groups = r.data.data.list_parent_group;
                    $scope.checkin_children_groups = r.data.data.list_child_group;
                    $scope.checkin_children_users = r.data.data.list_users;
                };
            })
            $scope.getFilterChekinData();
            $scope.dashboard = 3;
            setTimeout(() => {
                $(".datepicker").datepicker({
                    dateFormat: "dd-mm-yy"
                }).attr('autocomplete', 'off');
            }, 100);
        }
        $scope.openList = (event, type) => {
            if (type == 0) {
                $(event.target).parent().removeClass('active');
            } else $(event.target).parent().addClass('active');
        }
        $scope.createFilter = (type, text, value, event) => {
            $(event.target).parents('.form-filter').addClass('selected').find('.text-selected').html(text);
            switch (type) {
                case 'parent':
                    $scope.checkin_condition.id_group = value;
                    break;
                case 'child':
                    $scope.checkin_condition.id_group_child = value;
                    break;
                case 'user':
                    $scope.checkin_condition.id_user = value;
                    break;
                default:
            }
            $scope.getFilterChekinData();
            $http.post(base_url + 'Tasks_management/ajax_listCheckinCondition', $scope.checkin_condition).then(r => {
                if (r.data.status == 1) {
                    $scope.checkin_parent_groups = r.data.data.list_parent_group;
                    $scope.checkin_children_groups = r.data.data.list_child_group;
                    $scope.checkin_children_users = r.data.data.list_users;
                };
            })
        }
        $scope.cancelCheckinFilter = (type, event) => {
            switch (type) {
                case 'parent':
                    delete $scope.checkin_condition.id_group;
                    break;
                case 'child':
                    delete $scope.checkin_condition.id_group_child;
                    break;
                case 'user':
                    delete $scope.checkin_condition.id_user;
                    break;
                default:
            }
            $scope.getCheckinData('');
            $scope.getFilterChekinData();
            $(event.target).parents('.form-filter').removeClass('selected');
        }
        $scope.getFilterChekinData = () => {
            $http.post(base_url + '/Tasks_management/getDataCheckin', $scope.checkin_condition).then(r => {
                if (r.data && r.data.status == 1) {
                    $scope.checkin_report_list = r.data.data;
                }
            });
        }
        $scope.openParentDetail = (parent_id) => {
            $scope.checkin_open_detail = true;
            $http.get(base_url + '/Tasks_management/getListChildToReplaceByParent_id/' + parent_id).then(r => {
                if (r.data.status == 1) {
                    $(".table-custom").empty();
                    var $el = $(r.data.projects).appendTo('.table-custom.checkin');
                    $compile($el)($scope);
                }
            })
        }
        $scope.openCheckinDetail = () => {
            $http.post(base_url + '/Tasks_management/ajax_checkCheckinRole', $scope.checkin_item).then(r => {
                if (r.data && r.data.status == 1) {
                    if (r.data.data == true) {
                        if ($scope.checkin_item.type == 2) {
                            $scope.openDetail('', 'open', '', $scope.checkin_item.id_project)
                        } else {
                            $scope.openParentDetail($scope.checkin_item.id_project);
                        }
                    } else toastr["error"]('Không thể xem!');
                }
            });
        }
        $scope.test = function() {
            alert("hello!");
        }
        $scope.showProjectStatus = (status) => {
            var text = '';
            switch (status) {
                case '0':
                    text = 'Đang làm';
                    break;
                case '1':
                    text = 'Chờ duyệt';
                    break;
                case '2':
                    text = 'Hoàn thành';
                    break;
                default:
            }
            return $sce.trustAsHtml(text);
        }

        $scope.filter_group_report_func = (type, text, value, event) => {
            $('.form-filter ul').addClass('reload');
            $(event.target).parents('.form-filter').addClass('selected').find('.text-selected').html(text);
            $scope.filter_group_report.groupId = $scope.parentGrroupCurrent.groupId;
            $scope.filter_group_report.user = value;
            $http.post(base_url + '/Tasks_management/ajax_filter_group_report', $scope.filter_group_report).then(r => {
                if (r.data && r.data.status == 1) {
                    $scope.group_report_list = r.data.data;
                    $('.form-filter ul').removeClass('reload');
                }
            });
        }
        $scope.cancel_filter_group_report = (event) => {
            $(event.target).parents('.form-filter').removeClass('selected');
        }
        $scope.page_nav_parent_recent = () => {
            $http.get(base_url + '/Tasks_management/pageNavParent_recent/' + $scope.list_parent_recent_limit + 10).then(r => {
                if (r.data.status == 1 && r.data.data.length > ($scope.list_parent_recent_limit + 10)) {
                    $scope.list_parent_recent = r.data.data;
                } else toastr["error"]('Đã hiển thị hết!');
            })
        }
        $scope.edit_child_group_col_name = (event, col_id, action_class) => {
            $scope.col_name_edit.col_id = col_id;
            $scope.col_name_edit.value = $(event.target).val();
            action_class = '.' + action_class;
            $(action_class).val($(event.target).val());
            $http.post(base_url + '/Tasks_management/ajax_edit_child_group_col_name', $scope.col_name_edit).then(r => {
                if (r.data && r.data.status == 1) {
                    $(action_class).val($(event.target).val());
                }
            });

        }
        $scope.delete_child_group_col = (id) => {
            $http.get(base_url + '/Tasks_management/api_delete_child_group_col/' + id).then(r => {
                if (r.data.status == 1) {
                    $('#deleteColumnModal').modal('hide');
                    $scope.getTaskList();
                } else toastr["error"]('Đã hiển thị!');
            })
        }
        $scope.add_edit_to_progress = (event) => {
            $(event.target).parents('.progress').addClass('edit');
        }
        $scope.changeProgress = (event, type, project_id, col_id) => {

            if (type == "submit") var element = $(event.target).children('input');
            else {
                var element = $(event.target);
            }
            $scope.editTask.id = project_id;
            $scope.editTask.col_id = col_id;
            $scope.editTask.status = element.val();
            $http.post(base_url + '/Tasks_management/edit_progress_column', $scope.editTask).then(r => {
                if (r && r.data.status == 1) {
                    element.parents('.progress').removeClass('edit');
                    element.parents('.progress-bar').css({
                        'background-color': r.data.progress_color,
                        'width': r.data.value + '%',
                    });
                    element.val(r.data.value);
                } else toastr["error"]('Không có quyền thay đổi!');
                $('.popup-custom').css('display', 'none');
            });
        }
        $scope.create_new_progress = (event, project_id, col_id) => {
            $scope.editTask.id = project_id;
            $scope.editTask.col_id = col_id;
            $scope.editTask.status = 10;
            $http.post(base_url + '/Tasks_management/edit_progress_column', $scope.editTask).then(r => {
                if (r && r.data.status == 1) {
                    $scope.getTaskList();
                } else toastr["error"]('Không có quyền thay đổi!');
                $('.popup-custom').css('display', 'none');
            });
        }
        $scope.copy_to_clipboard = (event) => {

            var text_to_share = $(event.target).parent().find('input').val();
            // create temp element
            var copyElement = document.createElement("span");
            copyElement.appendChild(document.createTextNode(text_to_share));
            copyElement.id = 'tempCopyToClipboard';
            angular.element(document.body.append(copyElement));

            // select the text
            var range = document.createRange();
            range.selectNode(copyElement);
            window.getSelection().removeAllRanges();
            window.getSelection().addRange(range);

            // copy & cleanup
            document.execCommand('copy');
            window.getSelection().removeAllRanges();
            copyElement.remove();

            toastr["success"]('Đã copy vào clipboard!');
        }
    });