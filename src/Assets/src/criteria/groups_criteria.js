app.controller("groupsCriteriaCtrl", function ($scope, $http, $sce) {
  var pi = ($scope.pagingInfo = {
    itemsPerPage: 50,
    offset: 0,
    to: 0,
    currentPage: 1,
    totalPage: 1,
    total: 0,
  });

  $scope.init = () => {
    $(".box1").css("opacity", "1");
    $scope.isAdmin = isAdmin;
    $scope.currentUserId = currentUserId;
    $scope.isView = 1;
    $scope.filter = {};
    $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
    $scope.filter.offset = $scope.pagingInfo.offset;
    $scope.filterPer = {};
    $scope.filterPer.limit = $scope.pagingInfo.itemsPerPage;
    $scope.filterPer.offset = $scope.pagingInfo.offset;
    $scope.criteria = {};
    $scope.lsCriteria = {};
    $scope.groupsCriteria = {};
    $scope.groupsCriteria.ids = [];
    $scope.checkCriteriaLength = 0;

    $scope.getAll();
    $scope.getCriteria();
    loadCKEDITOR();

    setTimeout(() => {
      $scope.filter.date = "";
    }, 200);
  };

  $scope.getAll = () => {
    if ($scope.isView == 1) url = "/criteria/ajax_get_groups_criteria";
    if ($scope.isView == 2) url = "/criteria/ajax_get_criteria";

    $http.post(base_url + url + '?filter=' + JSON.stringify($scope.filter)).then(r => {
      $scope.rows = r.data.data;
      $scope.rows.forEach(element => {
        element.active = Number(element.active);
      });
      $scope.pagingInfo.total = r.data.count;
      $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
    });
  }

  $scope.getCriteria = () => {
    $http.post(base_url + '/criteria/ajax_get_ls_criteria').then(r => {
      $scope.lsCriteria = r.data.data;
    });
  }

  $scope.showModalAddGroupsCriteria = () => {
    $scope.groupsCriteria = {};
    $scope.groupsCriteria.ids = [];
    $('#modalAddGroupsCriteria').modal('show');
    select2();
  }

  $scope.showModalAddCriteria = () => {
    $scope.viewCriteria = 'ADD';
    $scope.criteria.name = "";
    $scope.criteria.obligatory = "0";
    CKEDITOR.instances.criteriaName.setData('');
    $('#modalCriteria').modal('show');
  }

  $scope.addCriteria = () => {
    var name = CKEDITOR.instances.criteriaName.getData();
    $scope.errorCriteriaName = name ? 0 : 1;
    if (!name) return false;

    swal({
      title: "Thông báo",
      text: "Bạn có chắc muốn thêm tiêu chí này?",
      type: "warning",
      showCancelButton: true,
      confirmButtonText: "Xác nhận",
      cancelButtonText: "Đóng",
      closeOnConfirm: false,
      confirmButtonColor: '#f39c12',
      showLoaderOnConfirm: true
    }, function() {
      $scope.loadSubmit = true;
      let data = {
        name: name,
        obligatory: $scope.criteria.obligatory
      }
      $http.post(base_url + '/criteria/ajax_create_criteria', data).then(r => {
        if (r.data && r.data.status == 1) {
            swal("Thông báo", r.data.message, "success");
            $('#modalCriteria').modal('hide');
            $scope.getAll();
        } else swal("Thông báo", r.data && r.data.status != 1 ? r.data.message : "Đã có lỗi xẩy ra. Vui lòng thử lại!", "error");
        $scope.loadSubmit = false;
      });
    });
  }

  $scope.showUpdateCriteria = (item) => {
    $scope.viewCriteria = 'EDIT';
    $scope.criteria = angular.copy(item);
    CKEDITOR.instances.criteriaName.setData($scope.criteria.name);
    $('#modalCriteria').modal('show');
  }

  $scope.updateCriteria = () => {
    var name = CKEDITOR.instances.criteriaName.getData();
    $scope.errorCriteriaName = name ? 0 : 1;
    if (!name) return false;

    swal({
      title: "Thông báo",
      text: "Bạn có chắc muốn cập nhật tiêu chí này?",
      type: "warning",
      showCancelButton: true,
      confirmButtonText: "Xác nhận",
      cancelButtonText: "Đóng",
      closeOnConfirm: false,
      confirmButtonColor: '#f39c12',
      showLoaderOnConfirm: true
    }, function() {
      $scope.loadSubmit = true;
      let data = {
        id: $scope.criteria.id,
        name: name,
        obligatory: $scope.criteria.obligatory
      }
      $scope.loadSubmit = true;
      $http.post(base_url + '/criteria/ajax_update_criteria', data).then(r => {
        if (r.data && r.data.status == 1) {
            swal("Thông báo", r.data.message, "success");
            $('#modalCriteria').modal('hide');
            $scope.getAll();
        } else swal("Thông báo", r.data && r.data.status != 1 ? r.data.message : "Đã có lỗi xẩy ra. Vui lòng thử lại!", "error");
        $scope.loadSubmit = false;
      });
    });
  }

  $scope.changeActiveCriteria = (item) => {
    let data = {
      criteria_id: item.id,
      active: item.active,
    }
    $http.post(base_url + 'criteria/ajax_change_criteria_active', data).then(r => {
        if (r.data && r.data.status == 1) {
          swal("Thông báo", r.data.message, "success");
        } else swal("Thông báo", r.data && r.data.status != 1 ? r.data.message : "Đã có lỗi xẩy ra. Vui lòng thử lại!", "error");
    });
  }

  $scope.changeActiveGroupCriteria = (item) => {
    let data = {
      group_criteria_id: item.id,
      active: item.active,
    }
    $http.post(base_url + 'criteria/ajax_change_group_criteria_active', data).then(r => {
        if (r.data && r.data.status == 1) {
          swal("Thông báo", r.data.message, "success");
        } else swal("Thông báo", r.data && r.data.status != 1 ? r.data.message : "Đã có lỗi xẩy ra. Vui lòng thử lại!", "error");
    });
  }

  $scope.changeView = (val) => {
    $scope.isView = val;
    $scope.rows = [];
    $scope.filter = {};
    $scope.filter.offset = 0;
    $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
    $scope.getAll();
    $scope.getCriteria();
  };

  $scope.handleFilter = () => {
    $scope.filter.offset = 0;
    $scope.pagingInfo.currentPage = 1;
    $scope.getAll();
  }

  $scope.checkGroupsCriteria = () => {
    $scope.errorGroupName = $scope.groupsCriteria.name ? 0 : 1;
    if (!$scope.groupsCriteria.name) return false;

    $scope.errorGroup = $scope.groupsCriteria.group_id ? 0 : 1;
    if (!$scope.groupsCriteria.group_id) return false;

    $scope.errorDateStart = $scope.groupsCriteria.date_apply ? 0 : 1;
    if (!$scope.groupsCriteria.date_apply) return false;

    $scope.errorLsIdCriteria = $scope.groupsCriteria.ids.length == 0 ? 1 : 0;
    if ($scope.groupsCriteria.ids.length == 0) return false;

    var arrId = [];
    $scope.groupsCriteria.ids.forEach((element, key) => {
      if (element == true) {
        arrId.push(key);
      }
    });

    $scope.lsCheckCriteria = $scope.lsCriteria.filter(word =>
      arrId.includes(parseInt(word.id))
    );

    $scope.groupsCriteria.lsId = arrId;

    $('#modalLsCriteriaCheck').modal('show');
  }

  $scope.addGroupsCriteria = () => {
    swal({
      title: "Thông báo",
      text: "Bạn có chắc muốn thêm nhóm tiêu chí?",
      type: "warning",
      showCancelButton: true,
      confirmButtonText: "Xác nhận",
      cancelButtonText: "Đóng",
      closeOnConfirm: false,
      confirmButtonColor: '#f39c12',
      showLoaderOnConfirm: true
    }, function() {
      $scope.loadSubmit = true;
      $http.post(base_url + '/criteria/ajax_create_group_criteria', JSON.stringify($scope.groupsCriteria)).then(r => {
        if (r.data && r.data.status == 1) {
            swal("Thông báo", r.data.message, "success");
            $('#modalAddGroupsCriteria').modal('hide');
            $('#modalLsCriteriaCheck').modal('hide');
            $scope.getAll();
        } else swal("Thông báo", r.data && r.data.status != 1 ? r.data.message : "Đã có lỗi xẩy ra. Vui lòng thử lại!", "error");
        $scope.loadSubmit = false;
      });
    });
  }

  $scope.showDetailGroupCriteria = (id) => {
    $http.get(base_url + '/criteria/ajax_get_groups_criteria_detail?id=' + id).then(r => {
      $scope.groupCriteriaDetail = r.data.data;
      $scope.groupCriteriaDetail.ls_criteria = $scope.lsCriteria.filter(word =>
        $scope.groupCriteriaDetail.ls_criteria.includes(word.id)
      );
      $('#modalGroupsCriteriaDetail').modal('show');
      select2();
    });
  }

  $scope.checkCriteria = () => {
    let checked = $scope.groupsCriteria.ids.filter(function (el) {
      return el != null && el == true;
    });
    $scope.checkCriteriaLength = checked.length;
  }

  $scope.checkDate = (item) => {
    if (item.created) {
        let current_date = new Date();
        let date = new Date(item.created);

        let one_day = 1000 * 60 * 60 * 24
        
        let Result = Math.round(current_date.getTime() - date.getTime()) / (one_day);
        
        let range = Result.toFixed(0);
        if (range > 1) {
            return false;
        } else {
            return true;
        }
    } else {
        return false;
    }
  }

  $scope.converHtml = (htmlbd) => {
    return $sce.trustAsHtml(htmlbd);
  }

  $scope.converHtmlGroupCriteria = (index, htmlbd, obligatory) => {
    $span = '';
    if (obligatory == 1) {
        $span = '<span class="obligatory"> (*)</span>';
    }
    return $sce.trustAsHtml(index + '. ' + htmlbd + $span);
}

  $scope.formatDate = (date, format) => {
    return moment(date).format(format);
  };

  //paging
  $scope.go2Page = function (page) {
    if (page < 0) return;
    var pi = $scope.pagingInfo;
    pi.currentPage = page;
    pi.from = pi.offset = (pi.currentPage - 1) * pi.itemsPerPage;
    $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
    $scope.filter.offset = ($scope.pagingInfo.currentPage - 1) * $scope.pagingInfo.itemsPerPage;
    $scope.getAll();
    pi.to = pi.total < pi.itemsPerPage ? pi.total : pi.itemsPerPage;
  };

  $scope.Previous = function (page) {
    if (page - 1 > 0) $scope.go2Page(page - 1);
    if (page - 1 == 0) $scope.go2Page(page);
  };

  $scope.getRange = function (paging) {
    var max = paging.currentPage + 3;
    var total = paging.totalPage + 1;
    if (max > total) max = total;
    var min = paging.currentPage - 2;
    if (min <= 0) min = 1;
    var tmp = [];
    return _.range(min, max);
  };
  //end paging

  function select2() {
    setTimeout(() => {
        $('.select2').select2();
    }, 200)
  }

  function loadCKEDITOR() {
    setTimeout(() => {
        $scope.ckeditor = CKEDITOR.replace('criteriaName', {
          uiColor: '#f2f3f5',
          height: '150',
          toolbarGroups: [
              { name: 'document', groups: ['mode', 'document', 'doctools'] },
              { name: 'clipboard', groups: ['clipboard', 'undo'] },
              { name: 'editing', groups: ['find', 'selection', 'spellchecker', 'editing'] },
              { name: 'forms', groups: ['forms'] },
              { name: 'basicstyles', groups: ['basicstyles', 'cleanup'] },
              { name: 'paragraph', groups: ['list', 'indent', 'blocks', 'align', 'bidi', 'paragraph'] },
              { name: 'links', groups: ['links'] },
              { name: 'insert', groups: ['insert'] },
              { name: 'styles', groups: ['styles'] },
              { name: 'colors', groups: ['colors'] },
              { name: 'tools', groups: ['tools'] },
              { name: 'others', groups: ['others'] },
              { name: 'about', groups: ['about'] }
          ],
          enterMode : CKEDITOR.ENTER_BR,
          entities_latin: false,
          entities_greek: false
        });
    }, 100);
  }
});
