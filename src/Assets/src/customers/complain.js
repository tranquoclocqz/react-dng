setTimeout(() => {
    $('#complain').css('display', 'block');
    $("body").addClass("sidebar-collapse");
}, 500);

app.controller('LsComplainCtrl', function ($scope, $http, $sce, $window) {

    var pi = $scope.pagingInfo = {
        itemsPerPage: 30,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };


    $scope.init = () => {
        // $scope.base_url = <?php echo '"'.base_url().'"' ?>;
        $scope.selectedEmployee = [];
        $scope.store_id = 0;
        $scope.complain = {};
        $scope.getGroupComplain();
        $scope.filter = {};
        $scope.filter.consider = '';
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;
        $scope.filter.date = '';
        $scope.filter.complain_care = 0;
        $scope.filter.region_id = '0';
        $scope.filter.store_id = ['0'];
        $scope.isEditGrp = 0;
        $scope.groupComplains = [];
        $scope.inputGroupChange = 0;
        $scope.is_admin = is_admin;
        $scope.is_only_assistantmanager = is_only_assistantmanager;
        $scope.is_assistant = is_assistant;
        $scope.is_telesale = is_telesale;
        $scope.is_only_dev = is_only_dev;
        $scope.currentUserId = current_user_id;
        $scope.load = true;
        $scope.getLevelComplain();
        $scope.getComlains(false);
        setTimeout(function () {
            $scope.filter.date = '';
        }, 200)

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
            $("#datetimepicker1").data('daterangepicker').setStartDate(today);
        }, 50);
    }

    $scope.getLevelComplain = () => {
        $http.get(base_url + '/options/ajax_get_level_complain').then(r => {
            if (r.data) {
                $scope.complains = r.data;
            }
        })
    }
    $scope.rentColor = (lv) => {
        color = "";
        if ($scope.complains) {
            $scope.complains.forEach(element => {
                if (element.level == lv) {
                    color = element.color;
                }
            });
        }
        return color;
    }

    $scope.editGroup = (id, groupId) => {
        $scope.isEditGrp = id;
        $scope.inputGroupChange = groupId;
    }

    $scope.closeChangeGroup = () => {
        $scope.isEditGrp = 0;
    }

    $scope.changeGroup = (val) => {
        let data = {
            id: $scope.isEditGrp,
            type_id: val
        }
        $http.post(base_url + '/customers/ajax_change_type_complain', data).then(r => {
            if (r.data && r.data.status == 1) {
                toastr['success'](r.data.message);
                let index = $scope.rows.findIndex(r => {
                    return r.id == $scope.isEditGrp
                });
                let group = $scope.groupComplains.find(r => {
                    return r.id == val
                });
                $scope.rows[index].type_id = val;
                $scope.rows[index].type_name = group.name;
                $scope.isEditGrp = 0;

            }
        })
    }

    $scope.checkDay = (item) => {
        var duration = moment.duration(moment().diff(moment(item.created)));
        var hours = duration.asHours();

        if (hours >= 48) {
            return false;
        }
        return true;
    }

    $scope.sentMessToWP = (item) => {

        if (window.confirm('Bạn muốn gửi thông báo đến workplace?')) {
            $('table').addClass('loading');
            $http.post(base_url + '/customers/sent_complain_to_wp', item).then(r => {
                $('table').removeClass('loading');
                if (r && r.data.status == 1) {
                    toastr["success"]("Gửi thành công!");
                } else {
                    toastr["error"]("Chưa gửi được!");
                }
            })
        }

    }

    $scope.getGroupComplain = () => {
        $http.get(base_url + 'customers/get_list_complain_type').then(r => {
            if (r && r.data.status == 1) {
                $scope.groupComplains = r.data.data;
            }
        })
    }

    $scope.linkToDetail = (i) => {
        window.open(base_url + 'customers/complain_detail/' + i.id);
    }

    $scope.sendMessToGroup = () => {

        if ($scope.filter.group_id && $scope.filter.group_id.length == 0 || !$scope.filter.group_id) {
            toastr["error"]("Chọn nhóm cần gửi!");
            return false;
        }

        if ($scope.filter.note == '' || !$scope.filter.note) {
            toastr["error"]("Điền nội dung cần gửi!");
            return false;

        }
        $http.post(base_url + '/customers/api_sent_mess_group', JSON.stringify($scope.filter)).then(r => {
            if (r && r.data.status == 1) { } else toastr["error"]("Đã có lỗi xẩy ra!");
        })


    }

    $scope.approveRequestOffComplain = () => {
        $('#send_no').modal('show');
    }

    $scope.changerStore = () => {
        $http.get(base_url + '/ajax/get_user_by_store_id?store_id=' + $scope.complain.store_id).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.ls_employees = r.data.data;
            }
        })
    }

    $scope.changeConsidered = (id) => {

        let consider = $('#CP_' + id).prop('checked') ? true : false;

        let data = {
            complain_id: id,
            consider: consider,
        }

        $http.post(base_url + 'customers/ajax_change_consider', data).then(r => {
            if (r.data && r.data.status == 1) {
                toastr["success"]("Cập nhật thành công!");
            } else {
                $('#CP_' + id).prop('checked', !$('#CP_' + id).prop('checked'));
                toastr["error"]("Đã có lỗi xẩy ra. Vui lòng thử lại sau!");
            }
        },
            function error(response) {
                $('#CP_' + id).prop('checked', !$('#CP_' + id).prop('checked'));
                toastr["error"]("Lỗi hệ thống!");
            }
        );
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


    $('#is_modal').on('shown.bs.modal', function () {
        $scope.complain = {};
        console.log('đ');
        $scope.select2();
    });

    $scope.select2 = () => {
        setTimeout(() => {
            $('.select2').select2();
            $('.store_sl').select2('val', null);
            $('.user_sl').select2('val', null);
            $scope.$apply();
            select2_img();
        }, 300);
    }

    $scope.addNewComplain = () => {
        if (!$scope.complain.customer_complain_type_id) {
            toastr["error"]("Chọn kiểu phàn nàn!");
            return;
        }
        if (!$scope.complain.complain_date || $scope.complain.complain_date == "") {
            toastr["error"]("Chọn ngày xảy ra sự kiện!");
            return;
        }
        if (!$scope.complain.deadline || $scope.complain.deadline == "") {
            toastr["error"]("Chọn deadline!");
            return;
        }
        let start = new Date($scope.complain.complain_date);
        let end = new Date($scope.complain.deadline);
        if (start > end) {
            toastr["error"]("Ngày kết thúc không thể lớn hơn deadline!");
            return;
        }

        if (!$scope.complain.store_id) {
            toastr["error"]("Chọn chi nhánh bị khiếu nại!");
            return;
        }
        if (!$scope.complain.phone) {
            toastr["error"]("Nhập số ĐT!");
            return;
        }
        if (!$scope.complain.level) {
            toastr["error"]("Chọn Cấp độ khiếu nại!");
            return;
        }
        if (!$scope.complain.note) {
            toastr["error"]("Nhập ghi chú!");
            return;
        }

        if ($scope.complain.store_id && $scope.complain.customer_complain_type_id) {
            $scope.loadSubmit = true;
            $http.post(base_url + '/customers/ajax_add_complain', $scope.complain).then(r => {
                if (r.data && r.data.status == 1) {
                    $('#is_modal').modal('hide');
                    toastr["success"]("Đã thêm khiếu nại!");
                } else {
                    toastr["error"]("Đã có lổi xẩy ra. thử lại sau!");
                }
                $scope.loadSubmit = false;
                $scope.getComlains(false);
            })
        }
    }

    $scope.showMoreNote = (id) => {
        $('.showMoreNote' + id).css('display', 'none');
        $('.note' + id).css('-webkit-line-clamp', 'unset');
        $('.collapseNote' + id).css('display', 'block');
    }

    $scope.collapseNote = (id) => {
        $('.collapseNote' + id).css('display', 'none');
        $('.note' + id).css('-webkit-line-clamp', '3');
        $('.showMoreNote' + id).css('display', 'block');
    }

    $scope.showMoreNoteFinished = (id) => {
        $('.showMoreNoteFinished' + id).css('display', 'none');
        $('.note-finished' + id).css('-webkit-line-clamp', 'unset');
        $('.collapseNoteFinished' + id).css('display', 'block');
    }

    $scope.collapseNoteFinished = (id) => {
        $('.collapseNoteFinished' + id).css('display', 'none');
        $('.note-finished' + id).css('-webkit-line-clamp', '3');
        $('.showMoreNoteFinished' + id).css('display', 'block');
    }

    $scope.showMoreNoteCare = (id) => {
        $('.showMoreNoteCare' + id).css('display', 'none');
        $('.note-care' + id).css('-webkit-line-clamp', 'unset');
        $('.collapseNoteCare' + id).css('display', 'block');
    }

    $scope.collapseNoteCare = (id) => {
        $('.collapseNoteCare' + id).css('display', 'none');
        $('.note-care' + id).css('-webkit-line-clamp', '2');
        $('.showMoreNoteCare' + id).css('display', 'block');
    }

    $scope.getComlains = (is_go_page = false, filer_complain_care = 0) => {
        $scope.load = true
        if ($scope.filter.date && $scope.filter.date != '') {
            let date = $scope.filter.date.split('-');
            $scope.filter.from = moment(date[0]).format('YYYY-MM-DD');
            $scope.filter.to = moment(date[1]).format('YYYY-MM-DD');
        }

        $scope.filter.complain_care = filer_complain_care;

        if (!is_go_page) { // nếu không phải gọi từ hàm chuyển trang thì set lại limit trang 1
            $scope.pagingInfo = {
                itemsPerPage: 30,
                offset: 0,
                to: 0,
                currentPage: 1,
                totalPage: 1,
                total: 0
            };

            $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
            $scope.filter.offset = 0;
        }

        $scope.rows = [];
        $http.post(base_url + '/customers/ajax_get_ls_complain?filter=' + JSON.stringify($scope.filter)).then(r => {
            $scope.rows = r.data.data;
            $scope.pagingInfo.total = r.data.count;
            $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
            $scope.load = false
            setTimeout(function () {
                $scope.showBlock();
            }, 500);
        });
    }

    $scope.showBlock = () => {
        $scope.rows.forEach(function (row) {
            var el1 = document.getElementsByClassName('note' + row.id);
            if (el1[0].scrollHeight >= 54) { // nếu chiều cao lớn hơn 3 (mỗi dòng 18) dòng thì show (xem thêm)
                $('.block-event-show-note-' + row.id).css('display', 'block');
            }
            var el2 = document.getElementsByClassName('note-finished' + row.id);
            if (el2[0].scrollHeight >= 54) { // nếu chiều cao lớn hơn 3 (mỗi dòng 18) dòng thì show (xem thêm)
                $('.block-event-show-note-finished-' + row.id).css('display', 'block');
            }
            var el3 = document.getElementsByClassName('note-care' + row.id);
            if (el3.length > 0 && el3[0].scrollHeight >= 36) { // nếu chiều cao lớn hơn 2 (mỗi dòng 18) dòng thì show (xem thêm)
                $('.block-event-show-note-care-' + row.id).css('display', 'block');
            }
        });
    }

    $scope.format_date = (date, type) => {
        return moment(date).format(type);
    }

    $scope.deleteCare = (item, items) => {
        var data = angular.copy(item);
        Swal.fire({
            title: 'Bạn muốn xoá?',
            html: "Sau khi xoá, Dữ liệu này sẽ không thể phục hồi được?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            cancelButtonText: 'Hủy',
            confirmButtonText: 'Đồng ý',
            allowOutsideClick: false,
        }).then((result) => {
            if (result.value) {
                $http.post(base_url + '/customers/ajax_delete_complain_care', data).then(r => {
                    if (r && r.data.status == 1) {
                        Swal.fire("Thành công!", r.data.message, "success");
                        items.customer_complain_care.forEach((v, key) => {
                            if (item.id_care == v.id_care) {
                                items.customer_complain_care.splice(key, 1)
                            }
                        });
                    } else Swal.fire("Thông báo!", r.data.message, "error");
                });
            }
        })
    }

    $scope.saveCustomerCare = (item) => {
        $scope.loadSubmit = true;
        if (!item.care_note || item.care_note == '') {
            Swal.fire("Thông báo!", 'Vui lòng nhập ghi chú', "error");
            return false;
        }

        let data = {
            complain_care_id: item.id,
            care_note: item.care_note
        }

        $http.post(base_url + '/customers/ajax_add_customer_complain_care', data).then(r => {
            $scope.loadSubmit = false;
            if (r.data && r.data.status == 1) {
                item.care_note = '';
                item.customer_complain_care.unshift(r.data.data);
                item.count_complain_care = parseInt(item.count_complain_care) + 1;
                Swal.fire("Thành công!", r.data.message, "success");
                $('.noteCustomerCare' + item.id).css('display', 'none');
            } else {
                Swal.fire("Thông báo!", r.data.message, "error");
            }
        });
    }

    $scope.clickActive = (value = null, event = null) => {
        if ($(event.target).parents('tbody').hasClass('active_')) {
            $(event.target).parents('tbody').removeClass('active_');
        } else {
            $('table').find('tbody').removeClass('active_');
            $(event.target).parents('tbody').addClass('active_');
        }

    }

    //paging
    $scope.go2Page = function (page) {
        if (page < 0) return;
        var pi = $scope.pagingInfo;
        pi.currentPage = page;
        pi.from = pi.offset = (pi.currentPage - 1) * pi.itemsPerPage;
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = ($scope.pagingInfo.currentPage - 1) * $scope.pagingInfo.itemsPerPage;
        $scope.getComlains(true);
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

    $scope.getStoreByRegionId = () => {
        $scope.filter.store_id = [];

        if ($scope.filter.region_id == '0') {
            $scope.filter.store_id = ['0'];
        } else {
            list_store.forEach( (item) => {
                if (item.admin_region_id == $scope.filter.region_id) {
                    $scope.filter.store_id.push(item.id);
                }
            });
        }
        select2();
    }
});

function select2(timeout = 100, selector = '.content-wrapper .select2') {
    setTimeout(() => {
        jQuery(selector).select2();
    }, timeout);
}
