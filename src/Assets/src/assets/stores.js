app.controller("storeCtrl", function ($scope, $http, AdminGroupSvc, WarehouseSvc, AdminUserSvc, AssetSvc, AdminStoreSvc) {
  var pi = ($scope.pagingInfo = {
    itemsPerPage: 50,
    offset: 0,
    to: 0,
    currentPage: 1,
    totalPage: 1,
    total: 0,
  });

  $scope.dzOptionsFile = {
    paramName: 'file',
    maxFilesize: '10',
    resizeWidth: 1200,
    acceptedFiles: 'image/*',
    url: base_url + '/uploads/ajax_upload_to_filehost?func=asset_history&folder=asset',
    dictDefaultMessage: 'Kéo thả hồ sơ tại đây',
  };

  $scope.dzCBFile = {
    'success': function (file, resp) {
      let res = JSON.parse(resp);
      if (res.success == 1) {
        $scope.transaction.images.push({
          url: res.data[0]
        });
      } else toastr['error'](res.message);
      $('.dz-image').remove();
    }
  };

  $scope.init = () => {
    $(".box1").css("opacity", "1");
    $scope.warehouses = warehouses;
    let wh = $scope.warehouses.find(r => { return r.store_id == storeId });
    $scope.warehouse_id = wh ? wh.id : 0;
    $scope.isView = 2;
    $scope.filter = {};
    $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
    $scope.filter.offset = $scope.pagingInfo.offset;
    $scope.isViewHistory = 2;

    if (user_id > 0) {
      $scope.filter.store_id = '8';
      $scope.getUserByGroupIds();
      $scope.filter.user_id = user_id.toString();
      $scope.isView = 3;
    }

    if (id > 0) {
      $scope.isView = 2;
      $scope.filter.id = id;
    }

    $scope.getAll();
    select2();
    $scope.loadData();
    $scope.loadStore();
    $scope.serials = [];
    setTimeout(() => {
      $scope.filter.date = '';
    }, 100);
  };

  $scope.loadStore = () => {
    AdminStoreSvc.getAll().then(r => {
        $scope.stores = r;
    });
  }

  $scope.getHistory = (asset, type) => {
    $scope.asset = asset;
    $('#modalHistory').modal('show');
    let param = {
      dest_id: asset.dest_id,
      asset_id: asset.asset_id
    };
    if (type == 2) param.type = 2;
    $scope.loading = true;

    AssetSvc.getHistoryAsset(param).then(data => {
      $scope.assetDetail = data;
      $scope.totalHis = {
        input: 0,
        move: 0,
        cancel: 0,
        inventory: 0
      }
      $scope.assetDetail.forEach(e => {
        if (e.dest_id == asset.dest_id && (e.type == 1 || e.type == 2) && e.status == 5) {
          $scope.totalHis.input += formatNumber(e.quantity);
        } else if (e.source_id == asset.dest_id && (e.type == 2 || e.type == 1) && e.status == 5) {
          $scope.totalHis.move += formatNumber(e.quantity);
        } else if (e.type == 3 && e.status == 5 && e.source_id == asset.dest_id) {
          $scope.totalHis.cancel += formatNumber(e.quantity);
        }
      });
      $scope.totalHis.inventory = $scope.totalHis.input - ($scope.totalHis.cancel + $scope.totalHis.move);
      $scope.loading = false;
    })
  }

  $scope.getClassType = (type) => {
    if (type == 1) return 'label-primary';
    if (type == 2) return 'label-warning';
    if (type == 3) return 'label-danger';
    return 'label-default';
  }

  $scope.getClassStatus = (status) => {
    if (status == 1) return 'label-primary';
    if (status == 2) return 'label-info';
    if (status == 3) return 'label-warning';
    if (status == 4) return 'label-danger';
    if (status == 5) return 'label-success';
    if (status == 6) return 'label-danger';
    return 'label-default';

  }

  $scope.print_asset = (type, dest_id) => {
    if (type == 'PERSON') {
      window.open(base_url + '/assets/print_personal?user_id=' + dest_id);
    }
    if (type == 'STORE_DATE') {
      window.open(base_url + `/assets /print_store?dest_id = ${dest_id} & date=${$scope.dateView}`);
    }
    if (type == 'STORE') {
      window.open(base_url + `/assets/print_report_store?filter=${JSON.stringify($scope.filter)}`);
    }
  }

  $scope.getClassType = (type) => {
    if (type == 1) return 'label-primary';
    if (type == 2) return 'label-warning';
    if (type == 3) return 'label-danger';
    return 'label-default';
  }

  $scope.getClassStatus = (status) => {
    if (status == 1) return 'label-primary';
    if (status == 2) return 'label-info';
    if (status == 3) return 'label-warning';
    if (status == 4) return 'label-danger';
    if (status == 5) return 'label-success';
    if (status == 6) return 'label-danger';
    return 'label-default';

  }

  $scope.showImg = (url) => {
    $scope.currImg = url;
    $("#modalImg").modal("show");
  };

  $scope.getDetailTransaction = (item, action) => {
    item.isAction = action;
    angular.element(document.getElementById('detailTransactionCtrl')).scope().openDetail(item, 'storeCtrl');
  }

  $scope.openHistoryDetail = (date) => {
    if ($scope.dateView == date) {
      $scope.dateView = "";
    } else {
      $scope.dateView = date;
    }
  };

  $scope.filterAsset = () => {
    $scope.pagingInfo.offset = 0;
    $scope.filter.offset = $scope.pagingInfo.offset;
    $scope.getAll();
  };

  $scope.formatDate = (date, format) => {
    return moment(date).format(format);
  };
  $scope.getImg = (img) => {
    return base_url + img;
  };

  $scope.loadData = () => {
    AssetSvc.getAllGroups({ 'active': 1 }).then(r => {
      $scope.assetgroups = r.data;
    })
    AdminGroupSvc.getAll().then(r => {
      $scope.groups = r;
    })
  };

  $scope.closeModal = (id) => {
    $(`#${id}`).modal("hide");
  };

  $scope.filterAs = () => {
    $scope.filter.limit = pi.itemsPerPage;
    $scope.filter.offset = 0;
    $scope.pagingInfo.currentPage = 1;
    $scope.dateView = "";
    $scope.getAll();
  };

  $scope.getUserByGroupIds = () => {
    let param = {
      groups: $scope.filter.dept_ids ? $scope.filter.dept_ids : [],
      is_main_group: false,
      store_id: $scope.filter.store_id,
    };
    $scope.loadingUser = true;
    AdminUserSvc.findUser(param).then(data => {
      $scope.loadingUser = false;
      if (param.groups.length > 0) {
        $scope.users = data;
      } else {
        $scope.users = data;
        $scope.allUsers = data;
      }
      select2();
    })
  };

  $scope.changeView = (val) => {
    $scope.isView = val;
    $scope.rows = [];
    $scope.filter = {};
    $scope.filter.offset = 0;
    $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
    $scope.filter.store_id = currentUser.main_store_id + '';
    if (val == 1) {
      $scope.filter.type = '1';
      $scope.filter.dest_id = $scope.warehouses[0].id + "";
    }
    if (val == 3) $scope.getUserByGroupIds();
    select2();
    $scope.getAll();
  };

  function select2() {
    setTimeout(() => {
      $(".select2").select2();
    });
  }

  $scope.print_docs = () => {
    window.open(base_url + `/assets/print_report_store?filter=${JSON.stringify($scope.filter)}`);
  }

  $scope.getAssets = (dest_id, typeas) => {
    $scope.assets = [];
    $scope.transaction.assets = [];
    let param = {
      type: typeas,
      dest_id: dest_id
    };
    AssetSvc.findAssetInventory(param).then(r => {
      $scope.assets = r;
    })
  };

  $scope.print_Excel = () => {
    $scope.filter.is_export = 1;
    window.open(base_url + "/assets/ajax_get_inventory_assets?" + $.param($scope.filter));
    $scope.filter.is_export = 0;
  }

  $scope.getAll = () => {
    $scope.load = true;
    if ($scope.isView == 1) {
      if ($scope.filter.type == 2) delete $scope.filter.dest_id;

      let param = angular.copy($scope.filter);
      if (!param.dest_ids || param.dest_ids.length == 0) {
        param.dest_ids = $scope.warehouses.map(r => { return r.id });
      }

      AssetSvc.getAssetInventory(param).then(r => {
        $scope.rows = r.data;
        $scope.pagingInfo.total = r.count;
        $scope.pagingInfo.totalPage = Math.ceil(r.count / pi.itemsPerPage);
        $scope.load = false;

      })
      return;
    }

    if ($scope.isView == 2) {
      $scope.filter.is_include_store = true;
      let param = angular.copy($scope.filter);
      if (!param.dest_ids || param.dest_ids.length == 0) {
        param.dest_ids = $scope.warehouses.map(r => { return r.id });
      }
      AssetSvc.getAssetTransaction(param).then(r => {
        $scope.rows = r.data; ` `
        $scope.pagingInfo.total = r.count;
        $scope.pagingInfo.totalPage = Math.ceil(r.count / pi.itemsPerPage);
        $scope.load = false;
        $scope.filter.id = '';
        $scope.rows.forEach(tran => {
          loadRole(tran);
        });

      })
      return;
    }

    if ($scope.isView == 3) {
      AssetSvc.getAssetPerson($scope.filter).then(r => {
        $scope.rows = r.data;
        $scope.pagingInfo.total = r.count;
        $scope.pagingInfo.totalPage = Math.ceil(r.count / pi.itemsPerPage);
        $scope.load = false;
      })
      return;
    }
  };

  function loadRole(tran) {
    let hasRc = $scope.warehouses.find(r => {
      return tran.dest_id == r.id
    });
    if (hasRc && tran.type == 2 && (tran.status == 3 || tran.status == 4)) tran.isRecieve = true;
  }

  $scope.openModal = (action) => {
    let option = {
      //Chỉ cho phép tạo phiếu chuyển kho
      type: [2]
    }
    angular.element(document.getElementById('modaladdoredit')).scope().openModal(action, 'storeCtrl', option);
  };

  $scope.getQuantityCheck = () => {
    if ($scope.rows) {
      let assets = $scope.rows.filter((r) => {
        return r.isCheck == 1;
      });
      return assets.length;
    }
    return 0;
  };

  $scope.checkAll = (val) => {
    $scope.rows.forEach((e) => {
      e.isCheck = val ? 1 : 0;
    });
  };

  $scope.handlePerson = (type) => {
    $scope.isAction = 'PERSON';
    let assets = [];
    $scope.rows.forEach(r => {
      if (r.isCheck == 1) {
        r.type = r.asset_type;
        r.total_quantity = r.quantity;
        r.quantity_request = 1;
        assets.push(r);
      }
    });

    if (assets.length == 0) {
      toastr['error']('Bạn chưa chọn tài sản!');
      return;
    }
    let user = $scope.allUsers.find(r => { return r.id == $scope.filter.user_id });

    if (!user) {
      toastr['error']('Không tìm thấy nhân sự!');
      return;
    }
    $scope.transaction = {
      user_id: user.id,
      user_name: user.user_name,
      type: type,
      assets: assets,
      images: []
    }
    $('#handlePerson').modal('show');
  }

  $scope.submitForm = () => {
    let isStore = $scope.isAction == 'STORE' ? true : false;

    if ($scope.transaction.type == 1 || $scope.transaction.type == 2) {
      if (!$scope.transaction.dest_id || $scope.transaction.dest_id == 0) {
        toastr["error"]("Bạn chưa chọn kho nhận!");
        $scope.loading = false;
        return;
      }
    }

    if ($scope.transaction.type == 5 && !isStore) {
      if (!$scope.transaction.user_id || $scope.transaction.user_id == 0) {
        toastr["error"]("Bạn chưa chọn người nhận!");
        $scope.loading = false;
        return;
      }
    }

    if (_.includes([2, 3], $scope.transaction.type) && isStore) {
      if (!$scope.transaction.source_id || $scope.transaction.source_id == 0) {
        toastr["error"]("Bạn chưa chọn kho xuất!");
        $scope.loading = false;
        return;
      }
    }

    $scope.loading = true;
    if ($scope.transaction.assets.length == 0) {
      toastr["error"]("Bạn chưa chọn tài sản!");
      $scope.loading = false;
      return;
    }
    let checkSerial = $scope.transaction.assets.find((as) => {
      if (as.type == 1) return !as.asset_serial || as.asset_serial == "";
    });
    if (checkSerial) {
      toastr["error"]("Bạn chưa nhập serial!");
      $scope.loading = false;
      return;
    }

    let checkQuantity = $scope.transaction.assets.find((as) => {
      if (as.type == 2)
        return (
          Number(as.quantity_request) > Number(as.total_quantity) ||
          as.quantity_request == 0
        );
    });

    if (checkQuantity) {
      toastr["error"]("Số lượng không hợp lệ!");
      $scope.loading = false;
      return;
    }

    let url = '';
    //Xuất hủy cá nhân
    if ($scope.transaction.type == 3 && !isStore) url = base_url + "assets/ajax_cancel_person_assets";
    //Thu hồi cá nhân
    if ($scope.transaction.type == 2 && !isStore) url = base_url + "assets/ajax_revoke_person_assets";
    //Cấp cá nhân
    if ($scope.transaction.type == 5 && !isStore) url = base_url + "assets/ajax_provider_person_assets";
    let tran = angular.copy($scope.transaction);
    tran.assets.forEach(e => {
      e.cost = formatNumber(e.cost);
    });
    $http.post(url, tran).then((r) => {
      if (r.data && r.data.status == 1) {
        toastr["success"]("Tạo phiếu thành công");
        $("#modaladdoredit").modal("hide");
        $('#handlePerson').modal('hide');
        $scope.getAll();
      } else {
        toastr["error"](r.data.message ? r.data.message : "Có lổi xẩy ra. Vui lòng thử lại!");
      }
      $scope.loading = false;
    });
  };

  // IMAGE----------

  //paging
  $scope.go2Page = function (page) {
    if (page < 0) return;
    var pi = $scope.pagingInfo;
    pi.currentPage = page;
    pi.from = pi.offset = (pi.currentPage - 1) * pi.itemsPerPage;
    $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
    $scope.filter.offset =
      ($scope.pagingInfo.currentPage - 1) * $scope.pagingInfo.itemsPerPage;
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

  $scope.checkkey = (event) => {
    var keys = {
      up: 38,
      right: 39,
      down: 40,
      left: 37,
      escape: 27,
      backspace: 8,
      tab: 9,
      enter: 13,
      del: 46,
      "0": 48,
      "1": 49,
      "2": 50,
      "3": 51,
      "4": 52,
      "5": 53,
      "6": 54,
      "7": 55,
      "8": 56,
      "9": 57,
      dash: 189,
      subtract: 109,
    };

    for (var index in keys) {
      if (!keys.hasOwnProperty(index)) continue;
      if (event.charCode == keys[index] || event.keyCode == keys[index]) {
        return; //default event
      }
    }
    event.preventDefault();
  };

  function formatNumber(value) {
    if (value && value != '') {
      return Number((value + '').replace(/,/g, ""));
    } else {
      return 0;
    }
  }
});
