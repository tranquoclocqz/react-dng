app.controller('salaryDetailCtrl', function ($scope, $http, $compile, $filter) {
    $scope.init = () => {
        $scope.feedback_id = feedback_id;
        $scope.obj_confirm = {
            status: 0,
            type: type,
            password: local_password,
            message: '',
            load: false,
            salaries_id: salaries_id
        };
        if (local_password) {
            $scope.getSalary();
        } else {
            $scope.openModalPassword();
        }
        $('#salaryDetailCtrl').fadeIn(0);
    }

    $scope.showTextValue = (value) => {
        if (!isNaN(value)) {
            return parseNumberIsFloat(value);
        }
        return value;
    }

    $scope.getSalary = () => {
        var data_rq = angular.copy($scope.obj_confirm);
        if (!data_rq.password) {
            showMessErr('Mật khẩu là bắt buộc');
            return;
        }
        $scope.obj_confirm.load = true;
        $http.post(base_url + 'salary_feedback/ajax_get_salary_detail', data_rq).then(r => {
            $scope.obj_confirm.load = false;
            if (r.data.status == 1) {
                var data = r.data.data;
                $scope.obj_confirm.status = 1;
                $scope.salary = data;
                $('#modal_password').modal('hide');
            } else {
                $scope.obj_confirm.message = r.data.message;
                showMessErr(r.data.message);
            }
        })
    }

    $scope.openModalPassword = () => {
        $('#modal_password').modal('show');
    };

    $scope.createFeedback = () => {
        var data_rq = angular.copy($scope.obj_edit);
        data_rq.type_ids = data_rq.list_type.filter(x => x.checked).map(x => x.id);

        if (!data_rq.type_ids.length) {
            showMessErr('Loại phản hồi không được bỏ trống');
            return;
        }

        if (!data_rq.handler.chooses.length && !data_rq.handler.mains.length) {
            showMessErr('Vui lòng chọn Người xử lý');
            return;
        }

        if (!data_rq.note) {
            showMessErr('Ghi chú không được bỏ trống');
            return;
        }

        data_rq.salaries_id = salaries_id;
        data_rq.main_hanlder_ids = data_rq.handler.mains.map(x => x.id);
        data_rq.choose_hanlder_ids = data_rq.handler.chooses.map(x => x.id);
        $scope.obj_edit.load = true;
        $http.post(base_url + 'salary_feedback/ajax_save', data_rq).then(r => {
            $scope.obj_edit.load = false;
            if (r.data.status == 1) {
                $('#modal_feedback_salary').modal('hide');
                $scope.feedback_id = r.data.data;
                showMessSuccess();
                $scope.goUrlFeedback();
            } else {
                showMessErr(r.data.message);
            }
        })
    }

    $scope.openFeedback = () => {
        if ($scope.feedback_id) {
            $scope.goUrlFeedback();
            return;
        }
        if (!allow_create) {
            showMessErr('Quá hạn phản hồi');
            return
        }
        $scope.obj_edit = {
            load: false,
            list_type: list_type,
            handler: {
                mains: [],
                groups: [],
                chooses: []
            },
            note: ''
        };
        $scope.obj_search_user = {
            show_rs: false,
            key: '',
            not_id: [],
            list: [],
        };
        $('#modal_feedback_salary').modal('show');
    }

    $scope.chooseType = () => {
        var list = angular.copy($scope.obj_edit.list_type);
        var list_checked = list.filter(x => x.checked);
        $scope.obj_edit.handler = {
            mains: [],
            groups: [],
            chooses: []
        };
        if (!list_checked.length) {
            return;
        }

        $.each(list_checked, function (index, value) {
            $scope.obj_edit.handler.mains = [...$scope.obj_edit.handler.mains, ...value.obj_handler_mans];
            $scope.obj_edit.handler.groups = [...$scope.obj_edit.handler.groups, ...value.obj_handler_groups];
        });
        $scope.obj_edit.handler.mains = arrayUniqueByKey(angular.copy($scope.obj_edit.handler.mains), 'id');
        $scope.obj_edit.handler.groups = arrayUniqueByKey(angular.copy($scope.obj_edit.handler.groups), 'id');
    }

    $scope.chooseHandler = (item, is_add = 1) => {
        if (is_add) {
            $scope.obj_search_user.key = '';
            $scope.obj_edit.handler.groups = $scope.obj_edit.handler.groups.filter(x => x.id != item.id);
            $scope.obj_edit.handler.chooses.push(item);
        } else {
            $scope.obj_edit.handler.chooses = $scope.obj_edit.handler.chooses.filter(x => x.id != item.id);
            $scope.obj_edit.handler.groups.unshift(item);
        }
    }

    $scope.hideRsFilterUser = () => {
        setTimeout(() => {
            $scope.obj_search_user.show_rs = false;
            $scope.$apply();
        }, 100)
    }

    $(document).on('focus', '#search-user', function () {
        setTimeout(() => {
            $scope.obj_search_user.show_rs = true;
            $scope.searchUser();
            $scope.$apply();
        }, 0)
    })

    $scope.searchUser = () => {
        var key = $scope.obj_search_user.key,
            list = angular.copy($scope.obj_edit.handler.groups);
        if (!key.length) {
            $scope.obj_search_user.list = list;
        } else {
            var expected = ToSlugDefault(key);
            $scope.obj_search_user.list = list.filter(item => ToSlugDefault(item.fullname).indexOf(expected) !== -1);
        }
    }

    $scope.goUrlFeedback = () => {
        _openTap(base_url + 'salary_feedback/edit/' + $scope.feedback_id);
    }
})