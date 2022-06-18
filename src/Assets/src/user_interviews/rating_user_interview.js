app.controller('interViewCtrl', function ($scope, $http, RatingUserInterviewSvc) {

    $scope.init = () => {
        $scope.is_hr = is_hr;
        $scope.is_dev = is_dev;
        $scope.user_id = user_id;
        $scope.current_user_id = current_user_id;
        $scope.requestChangeState = {};
        $scope.requestChangeState.id = '';
        // $scope.requestChangeState.request_salary_id = '0';
        $scope.state_note = {};

        $scope.errorJob = 0;
        $scope.errorAttitudes = 0;
        $scope.errorManners = 0;
        $scope.errorAdvanced = 0;
        $scope.errorSolving = 0;
        $scope.errorDisciplinary = 0;
        $scope.errorStatus_id = 0;
        $scope.errorDate_start = 0;
        $scope.errorDate_expires = 0;
        $scope.errorRequest_salary_id = 0;

        $scope.ViewState = 0;
        if (request) {
            $scope.requestChangeState = request;
            $scope.state_note = $scope.requestChangeState.note_probation ? JSON.parse($scope.requestChangeState.note_probation) : {};

            $scope.ViewState = $scope.requestChangeState.state;

            $scope.changeStatus();
        }

        $scope.requestChangeState.user_id = user_id;
        $scope.select2();
    }

    $scope.submitRequestState = (state) => {
        if($scope.requestChangeState.status_id == 11 || $scope.requestChangeState.status_id == 12){
            if(moment($scope.requestChangeState.date_expires,'DD-MM-YYYY') < moment($scope.requestChangeState.date_start,'DD-MM-YYYY')){
                return showMessErr('Ngày kết thúc phải lớn hơn ngày áp dụng');
            }
        }

        $scope.requestChangeState.note_probation = $scope.state_note;
        $scope.requestChangeState.state = state;

        let validate = validateSubmit();
        if (validate == false) {
            return;
        }

        let text = '';
        if (state == 1) {
            if ($scope.requestChangeState.id) {
                text = "Xác nhận cập nhật yêu cầu";
            } else {
                text = "Xác nhận tạo yêu cầu";
            }
           
        } else if (state == 2) {
            text = "Xác nhận duyệt yêu cầu";
        } else {
            text = "Xác nhận Từ chối yêu cầu";
        }

        swal({
            title: "",
            text: text,
            type: "warning",
            showCancelButton: true,
            confirmButtonClass: "btn-danger",
            confirmButtonText: "Xác nhận",
            cancelButtonText: "Đóng",
            closeOnConfirm: false,
            showLoaderOnConfirm: true
        }, function () {
            $scope.loadSubmit = true;

            RatingUserInterviewSvc.submitRequestChangeState($scope.requestChangeState).then(r => {
                window.location.replace(base_url + 'user_interviews/rating_user_interview/' + $scope.user_id + '?id=' + r.id);
            }).catch(e => {
                toastr["error"]("Đã có lỗi xảy ra!!!");
            });
        });
    }

    $scope.changeStatus = () => {
        $scope.listRequestSalary = [];
        RatingUserInterviewSvc.getListRequestSalaryByUser({'user_id': $scope.user_id}).then(r => {
            $scope.listRequestSalary = r;
            $scope.select2();
        }).catch(e => {
            toastr["error"]("Đã có lỗi xảy ra!!!");
        });
    }

    $scope.changeInputStart = () => {
        if ($scope.requestChangeState.date_start && $scope.requestChangeState.date_start != '' && $scope.requestChangeState.date_expires && $scope.requestChangeState.date_expires != '') {
            var days = diffDate($scope.requestChangeState.date_start, $scope.requestChangeState.date_expires);
            if (days < 0) {
                toastr["error"]("Ngày bắt đầu không thể lớn hơn ngày kết thúc!");
                $scope.requestChangeState.date_expires = '';
            }
        }
    }

    $scope.dateFormat = (date, format) => {
        return date ? moment(date).format(format) : '';
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
    
    function validateSubmit() {
        if (!$scope.state_note.job || $scope.state_note.job == '') {
            $scope.errorJob = 1;
            return false;
        } else {
            $scope.errorJob = 0;
        }

        if (!$scope.state_note.attitudes || $scope.state_note.attitudes == '') {
            $scope.errorAttitudes = 1;
            return false;
        } else {
            $scope.errorAttitudes = 0;
        }


        if (!$scope.state_note.manners || $scope.state_note.manners == '') {
            $scope.errorManners = 1;
            return false;
        } else {
            $scope.errorManners = 0;
        }


        if (!$scope.state_note.advanced || $scope.state_note.advanced == '') {
            $scope.errorAdvanced = 1;
            return false;
        } else {
            $scope.errorAdvanced = 0;
        }

        if (!$scope.state_note.solving || $scope.state_note.solving == '') {
            $scope.errorSolving = 1;
            return false;
        } else {
            $scope.errorSolving = 0;
        }

        if (!$scope.state_note.disciplinary || $scope.state_note.disciplinary == '') {
            $scope.errorDisciplinary = 1;
            return false;
        } else {
            $scope.errorDisciplinary = 0;
        }

        if (!$scope.requestChangeState.status_id || $scope.requestChangeState.status_id == '') {
            $scope.errorStatus_id = 1;
            return false;
        } else {
            $scope.errorStatus_id = 0;
        }

        if (!$scope.requestChangeState.request_salary_id || $scope.requestChangeState.request_salary_id == '') {
            $scope.errorRequest_salary_id = 1;
            return false;
        } else {
            $scope.errorRequest_salary_id = 0;
        }

        if (!$scope.requestChangeState.date_start || $scope.requestChangeState.date_start == '') {
            $scope.errorDate_start = 1;
            return false;
        } else {
            $scope.errorDate_start = 0;
        }

        if (($scope.requestChangeState.status_id == 11 || $scope.requestChangeState.status_id == 12) && (!$scope.requestChangeState.date_expires || $scope.requestChangeState.date_expires == '')) {
            $scope.errorDate_expires = 1;
            return false;
        } else {
            $scope.errorDate_expires = 0;
        }

        return true;
    }

    $scope.formatNumber = (num) => {
        return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
    }

    $scope.select2 = () => {
        setTimeout(() => {
            $('.select2').select2();
        }, 100);
    }
})