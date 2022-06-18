app.controller("inOutMainCtrl", function ($scope, $http, $filter, AssetSvc) {
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
    $scope.user_cancel_asset = JSON.parse(user_cancel_asset);
    $scope.user_input_asset = JSON.parse(user_input_asset);
    $scope.isView = 1;
    $scope.currStoreId = currStoreId;
    $scope.user_only_view = user_only_view;
    $scope.isAdmin = isAdmin;
    $scope.isManager = isManager;
    $scope.isLeader = isLeader;
    $scope.isDev = isDev;
    $scope.isHr = isHr;
    $scope.currentUserId = currentUserId;
    $scope.isReceptionist = isReceptionist;

    $scope.filter = {};
    $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
    $scope.filter.offset = $scope.pagingInfo.offset;
    $scope.filter.type = '1';
    if (user_id > 0) {
      $scope.filter.user_id = user_id.toString();
      $scope.isView = 3;
    }
    if (id > 0) {
      $scope.filter.id = id;
      $scope.isView = 2;
    }
    $scope.filterPer = {};
    $scope.filterPer.limit = $scope.pagingInfo.itemsPerPage;
    $scope.filterPer.offset = $scope.pagingInfo.offset;
    $scope.assets = [];
    $scope.selectProd = [];
    $scope.isViewHistory = 2;

    $scope.warehouses = warehouses;
    $scope.currWarehouse = [];
    $scope.serialNew = [];
    $scope.serials = [];
    $scope.images = [];
    $scope.user = [];
    $scope.isDoc = 0;
    $scope.assetDetail = [];
    $scope.storeRepair = [];
    $scope.dataHistory = [];
    $scope.dateView = "";
    $scope.getAll();
    $scope.getUserByGroupIds();
    $scope.warehousesFt = [];
    $scope.getWarehouseByCurrentStore();
  };

  $scope.cancelTran = () => {
    let data = {
      id: $scope.transaction.id
    };
    swal({
      title: "Bạn có chắc chắn. Hủy phiếu ?",
      text: "",
      type: "warning",
      showCancelButton: true,
      closeOnConfirm: false,
      showLoaderOnConfirm: true,
      cancelButtonText: "Hủy",
    }, function () {
      $scope.loading = true;
      $http.post(base_url + "assets/ajax_cancel_transaction_assets", data).then((r) => {
        if (r.data && r.data.status == 1) {
          toastr["success"](r.data.message);
          $("#modaladdoredit").modal("hide");
          $scope.getAll();
        } else {
          toastr["error"](r.data.message ? r.data.message : "Có lổi xẩy ra. Vui lòng thử lại!");
        }
        swal.close();
        $scope.loading = false;
      });
    });
  }

  $scope.printtran = () => {
    window.open(base_url + '/assets/print_transaction_assets?id=' + $scope.transaction.id, "_blank");
  }


  $scope.getMoney = (item, type) => {
    $('#modalMoney').modal('show');
    $scope.asset = item;
    let param = {
      dest_id: $scope.filter.dest_id,
      asset_id: item.asset_id
    };
    if (type == 2) {
      param.type = 2;
      param.dest_id = item.dest_id
    }
    $scope.loading = true;
    $http.get(`assets/ajax_get_asset_money?` + $.param(param)).then(r => {
      if (r.data && r.data.status == 1) {
        $scope.asset.quantity = 0;
        $scope.asset.cost = 0;
        $scope.asset.total_price = 0;
        $scope.assetMoney = r.data.data;
        $scope.assetMoney.forEach(e => {
          $scope.asset.total_price += formatNumber(e.total_cost);
          $scope.asset.quantity += formatNumber(e.quantity);
        });
        $scope.asset.cost = $scope.asset.total_price / $scope.asset.quantity
      }
      $scope.loading = false;
    })
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
    $http.get(`assets/ajax_get_asset_history?` + $.param(param)).then(r => {
      if (r.data && r.data.status == 1) {
        $scope.assetDetail = r.data.data;
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
        $scope.totalHis.inventory = $scope.totalHis.input - ($scope.totalHis.cancel + $scope.totalHis.move)
      }
      $scope.loading = false;
    });
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

  $scope.getDetailTransaction = (item) => {
    $('#detailTransaction').modal('show');
    $scope.loading = true;
    $http.get("assets/ajax_get_asset_transaction_detail?id=" + item.id).then(r => {
      if (r.data && r.data.status == 1) {
        $scope.transaction = r.data.data;
      }
      $scope.loading = false;
    });
  }

  $scope.recieveTransaction = (item) => {
    item.isAction = 'RECIEVE';
    angular.element(document.getElementById('detailTransactionCtrl')).scope().openDetail(item, 'inOutMainCtrl');
  }

  $scope.dowloadExcelTransaction = () => {
    window.open(base_url + '/assets/dowload_excel_transaction?filter=' + JSON.stringify($scope.filter));
  }

  $scope.checkRole = (type) => {
    if (type == 'CANCEL') {
      let has = $scope.user_cancel_asset.find(e => { return e == $scope.currentUserId });
      return has || $scope.isDev == 1 ? true : false;
    }
    if (type === 'INPUT') {
      let has = $scope.user_input_asset.find(e => { return e == $scope.currentUserId });
      return has || $scope.isDev == 1 ? true : false;
    }
    return false;
  }

  $scope.checkAll = (val) => {
    $scope.rows.forEach((e) => {
      e.isCheck = val ? 1 : 0;
    });
  };

  $scope.print_code = (type) => {
    if (type == 'PERSON') {
      let param = {
        dept_id: $scope.filter.dept_id,
        user_id: $scope.filter.user_id,

      }
      let url = "/assets/ajax_print_code_personal?" + $.param(param);
      window.open(base_url + url, "_blank");
    } else {
      let param = {
        date: $scope.dateView,
        asset_type: $scope.isViewHistory,

      };
      let url = "/assets/ajax_print_serials?" + $.param(param) + "&filter=" + JSON.stringify($scope.filter);
      window.open(base_url + url, "_blank");
    }
  }

  $scope.print_serial = () => {
    let url = base_url + "/assets/print_serial_store?dest_id=" + $scope.filter.dest_id;
    window.open(url, "_blank");
  }

  $scope.dowloadSerial = () => {
    let url = base_url + "/assets/dowload_serial_transaction?id=" + $scope.transaction.id
    window.open(url, "_blank");
  }

  $scope.showDocument = (val) => {
    $scope.isDoc = val == $scope.isDoc ? 0 : val;
  };

  $scope.sumQuantity = (item) => {
    return item.type == 1
      ? Number(item.total_serial_moved) + Number(item.total_serial)
      : Number(item.total_moved) + Number(item.total);
  };

  $scope.getUserByGroupIds = () => {
    let param = {
      groups: $scope.filter.dept_ids ? $scope.filter.dept_ids : [],
      store_id: $scope.filter.store_id
    };
    let url = base_url + "/admin_users/ajax_get_users?filter=" + JSON.stringify(param);
    $http.get(url).then((r) => {
      if (r.data && r.data.status == 1) {
        if (param.groups.length > 0) {
          $scope.users = r.data.data;
        } else {
          $scope.users = r.data.data;
          $scope.allUsers = r.data.data;
        }
        select2();
      }
    });
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

  $scope.getAll = () => {
    $scope.loadData = true;
    if ($scope.isView == 1) {
      AssetSvc.getAssetInventory($scope.filter).then(r => {
        $scope.rows = r.data;
        $scope.pagingInfo.total = r.count;
        $scope.pagingInfo.totalPage = Math.ceil(r.count / pi.itemsPerPage);
        $scope.loadData = false;
      })
      return;
    }
    if ($scope.isView == 2) {
      AssetSvc.getAssetTransaction($scope.filter).then(r => {
        $scope.rows = r.data;
        $scope.pagingInfo.total = r.count;
        $scope.pagingInfo.totalPage = Math.ceil(r.count / pi.itemsPerPage);
        $scope.loadData = false;
        $scope.filter.id = '';
      })
      return;
    }
    if ($scope.isView == 3) {
      AssetSvc.getAssetPerson($scope.filter).then(r => {
        $scope.rows = r.data;
        $scope.pagingInfo.total = r.count;
        $scope.pagingInfo.totalPage = Math.ceil(r.count / pi.itemsPerPage);
        $scope.loadData = false;
      })
      return;
    }

    $http.get(base_url + url + "?filter=" + JSON.stringify($scope.filter)).then((r) => {
      $scope.loadData = false;
      $scope.rows = r.data.data;
      $scope.pagingInfo.total = r.data.count;
      $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
    });
  };

  $scope.showImg = (url) => {
    $scope.currImg = url;
    $("#modalImg").modal("show");
  };

  $scope.openHistoryDetail = (date) => {
    if ($scope.dateView == date) {
      $scope.dateView = "";
    } else {
      $scope.dateView = date;
      $scope.getDataHistory(date);
    }
  };

  $scope.updateSerial = () => {
    $http
      .get(
        base_url +
        `/ assets / ajax_update_serial`
      )
      .then((r) => {
        if (r.data && r.data.status == 1) {
          toastr["success"]('Cập nhật serial thành công!')
        }
      })
  }

  $scope.getWarehouseByCurrentStore = () => {
    $http
      .get(base_url + "/warehouse/api_get_warehouse_by_current_store")
      .then((r) => {
        if (r.data && r.data.status == 1) {
          $scope.currWarehouse = r.data.data;
          $scope.warehousesFt =
            $scope.isAdmin == 0
              ? [...$scope.warehousesFt, ...$scope.currWarehouse]
              : $scope.warehousesFt;
        }
      });
  };

  $scope.filterAs = () => {
    $scope.filter.limit = pi.itemsPerPage;
    $scope.filter.offset = 0;
    $scope.pagingInfo.currentPage = 1;
    $scope.dateView = "";
    $scope.getAll();
  };

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


  $scope.print_Excel = () => {
    $scope.filter.is_export = 1;
    window.open(base_url + "/assets/ajax_get_inventory_assets?" + $.param($scope.filter));
    $scope.filter.is_export = 0;
  }

  $scope.importExcel = () => {
    window.open(base_url + '/dev/import_excel')
  }

  //Lấy thông tin 1 nhà vận chuyển
  $scope.getInformationTransporter = (id) => {
    let tran = $scope.transporters.find((e) => {
      return e.id == id;
    });
    return id && tran ? `${tran.name}(${tran.phone})` : "";
  };

  $scope.changeWH = () => {
    $scope.transaction.assets = [];
  };

  function select2() {
    setTimeout(() => {
      $(".select2").select2();
    }, 200);
  }

  function formatNumber(value) {
    if (value && value != '') {
      return Number((value + '').replace(/,/g, ""));
    } else {
      return 0;
    }
  }

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

  $scope.checkInputQuantity = (asset) => {
    return (
      asset &&
      (Number(asset.quantity_request) == 0 ||
        Number(asset.quantity_request) > Number(asset.total_quantity))
    );
  };

  $scope.changeView = (val, is_history) => {
    if (!is_history) {
      $scope.isView = val;
      $scope.rows = [];
      $scope.filter = {};
      $scope.filter.offset = 0;
      $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
      $scope.dateView = "";
      select2();
      $scope.filterAs();
    } else {
      $scope.isViewHistory = val;
      $scope.getDataHistory();
    }
  };

  $scope.getAssetBySerial = (serial) => {
    $http.get(
      base_url +
      "/assets/api_get_warehouse_trans_detail_by_serial?serial=" +
      serial
    )
      .then((r) => {
        if (r.data && r.data.status == 1) {
          let index = $scope.transaction.assets.findIndex((r) => {
            return r.asset_serial == serial;
          });
          $scope.transaction.assets[index].note = r.data.data.note;
        }
      });
  };

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

  $scope.closeModal = (id) => {
    $("#" + id).modal("hide");
  };

  $scope.checkHasSerial = (trans) => {
    if (trans) {
      let tran = trans.assets.filter((e) => {
        return e.type == 1 && (!e.asset_serial || e.asset_serial == "");
      });
      if (tran && tran.length > 0) {
        toastr["error"]("Bạn chưa thêm serial cho tài sản!");
        return false;
      } else return true;
    } else return false;
  };

  $scope.openModal = (action) => {
    angular.element(document.getElementById('modaladdoredit')).scope().openModal(action);
  };

  $scope.formatDate = (date, format) => {
    return moment(date).format(format);
  };

  $scope.getImg = (img) => {
    return base_url + img;
  };

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
});
