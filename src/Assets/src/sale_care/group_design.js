app.controller('group_designs', function ($scope, $http, $sce, $compile) {
    $scope.init = () => {
        console.log(1);
        $scope.getSource();
    }

    $scope.getSource = () => {
        $http.get('sale_care/ajax_get_groups_consultants?filter=' + JSON.stringify({
            all: false,
            get_users: true
        })).then(r => {
            if (r && r.data.status == 1) {
                $scope.groups = r.data.data;
                let html = bind_fnc($scope.groups, 1);
                $(".list-groups").empty();
                var $el = $(html).appendTo('.list-groups');
                $compile($el)($scope);
            }
        });
    }

    function bind_fnc($list, is_main = 0) {
        var html = `
            <ul class=" ${is_main == 1 ? 'main-ul' : ''} w-100">
            `;
        $list.forEach((list, key) => {
            html += `
                <li class="group-item-li pointer ${($scope.group_detail && $scope.group_detail.id == list.id) ? 'active' : ''}" ng-click="get_group_detail(${list.id}, $event)">
                    <div class="fth">
                        <div class="text">
                            <div class="no">${list.obs ? list.obs.length : 0}</div>
                            <div class="name">${list.name}</div>
                        </div>
                        <div class="action"><i class="fa fa-caret-right" aria-hidden="true"></i></div>
                    </div>
                </li>
                `;
            if (list.children && list.children.length > 0) {
                html += `<li class="child">`;
                html += bind_fnc(list.children);
                html += `</li>`;
            }
        });
        html += `</ul>`;
        return html;
    }
    $scope.get_group_detail = (id, event = 0) => {
        if (event) {
            $('.list-groups li').removeClass('active');
            $(event.target).parent().closest('li').addClass('active');
        }
        $scope.loading = true;
        $http.get('sale_care/ajax_get_detail_group_consultants/' + id).then(r => {
            delete $scope.loading;
            if (r && r.data.status == 1) {
                $scope.group_detail = r.data.data;
                if ($scope.group_detail.people.length > 0) {
                    $scope.group_detail.people.forEach(element => {
                        element.is_leader = element.is_leader == 1 ? true : false;
                    });
                }
            }
        });
        get_consultant_free();
        resetNewMember();
    }
    $scope.confirmRemove = () => {
        $http.post('sale_care/remove_consultant_group/' + $scope.group_detail.id).then(r => {
            if (r && r.data.status == 1) {
                toastr["success"]("Removed");
                delete $scope.group_detail;
                $('#confirmModal').modal('hide');
                $scope.getSource();
            }
        });
    }
    $scope.updateGroup = () => {
        let data = {
            id: $scope.group_detail.id,
            name: $scope.group_detail.name
        };
        $http.post('sale_care/update_consultant_group', data).then(r => {
            if (r && r.data.status == 1) {
                toastr["success"]("Updated");
                $scope.getSource();
            }
        });
    }
    $scope.genMem = () => {
        if ($scope.appendMember.id == 0) return false;
        let data = {
            user_id: $scope.appendMember.id,
            group_id: $scope.group_detail.id,
            is_leader: $scope.appendMember.is_leader ? 1 : 0
        };
        $http.post('sale_care/append_member_consultant_group', data).then(r => {
            if (r && r.data.status == 1) {
                $scope.get_group_detail($scope.group_detail.id);
            }
        });
    }

    function get_consultant_free() {
        $http.get('sale_care/ajax_get_consultant_free').then(r => {
            if (r && r.data.status == 1) {
                $scope.consultant_free = r.data.data;
                setTimeout(() => {
                    $('.select2-consultant').select2();
                }, 50);
            }
        });
    }

    function resetNewMember() {
        $scope.appendMember = {};
        $scope.appendMember.id = '0';
    }

    $scope.changeMember = (item) => {
        let data = {
            id: item.id,
            is_leader: item.is_leader
        };
        $http.post('sale_care/ajax_update_consultant_user_group', data).then(r => {
            if (r && r.data.status == 1) {
                toastr["success"]("Updated");
            }
        });
    }
    $scope.removeMember = (id) => {
        $http.post('sale_care/remove_member_consultant_group/' + id).then(r => {
            if (r && r.data.status == 1) {
                $scope.get_group_detail($scope.group_detail.id);
                toastr["success"]("Removed");
            }
        });
    }

    $scope.readyCreate = () => {
        $scope.new_group = {
            parent_id: $scope.group_detail ? $scope.group_detail.id : 0
        }
        $('#genModal').modal('show');
    }

    $scope.genNewGroup = () => {
        $http.post('sale_care/generate_consultant_group', $scope.new_group).then(r => {
            if (r && r.data.status == 1) {
                toastr["success"]("Updated");
                $('#genModal').modal('hide');
                $scope.getSource();
            }
        });
    }
})