app.controller("transactionCtrl", function ($scope, $http, AdminStoreSvc, WarehouseSvc, AdminUserSvc, AssetSvc, AdminGroupSvc, $filter) {

    $scope.dzOptionsFile = {
        paramName: 'file',
        maxFilesize: '10',
        resizeWidth: 1200,
        acceptedFiles: 'image/*',
        url: base_url + '/uploads/ajax_upload_to_filehost?func=marketing_data?func=assets_add_transaction?folder=asset',
        dictDefaultMessage: 'Kéo thả hồ sơ tại đây',
        params: {
            folder: 'asset'
        }
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
        //warehouse by perrmis
        $scope.warehouses = warehouses;
        //Thêm điều kiện được tạo phiếu
        $scope.alowType = [];
    }

    $scope.openModal = (action, response, option) => {

        if (option) {
            if (option.type) $scope.alowType = option.type;
        }

        //Mã reponse khi tạo phiếu thành công----------------
        $scope.ressponse = response ? response : '';
        //----------------

        $scope.serials = [];
        $scope.serialExists = [];

        $scope.isAction = action;
        // type: action == 'STORE' ? "1" : "5",
        $scope.transaction = {
            type: action == 'STORE' ? "" : "5",
            dest_id: 0,
            assets: [],
            images: []
        };
        $scope.loadStore();
        $("#modaladdoredit").modal("show");
        select2();
    };

    $scope.checkAlowType = (type) => {
        if ($scope.alowType.length == 0) return true;
        
        if ($scope.alowType.find(r => { return r == type })) return true;
        return false;
    }

    $scope.loadStore = () => {
        AdminStoreSvc.getAll().then(r => {
            $scope.stores = r;
        });

        //all warehouse
        let param = {
            ignore_company: true,
            types: ['BRANCH', 'ASSETS']
        }
        WarehouseSvc.getAll(param).then(data => {
            $scope.allWarehouse = data;
        });
    }

    $scope.handleProd = () => {
        let checkAsset = $scope.transaction.assets.find(
            (i) => i.asset_id == $scope.selectProd[0]
        );
        if (!checkAsset) {
            let asset = $scope.assets.find((i) => i.id == $scope.selectProd[0]);
            let prd = {
                asset_id: asset.id,
                asset_code: asset.code,
                asset_name: asset.name,
                serial_code: asset.serial_code,
                quantity_request: 1,
                total_quantity: asset.total_quantity,
                type: asset.type,
                note: "",
                cost: (asset.type == 2 && asset.cost) ? asset.cost : 0
            };
            if ($scope.transaction.type != 1 && prd.type == 1) {
                let source_id = $scope.isAction == 'STORE' || ($scope.isAction == 'PERSON' && $scope.transaction.type == 5) ? $scope.transaction.source_id : $scope.transaction.user_id;
                $scope.getSerialByAssetId(prd.asset_id, source_id, prd);
            } else {
                $scope.transaction.assets.unshift(prd);
                $scope.countTotalCost();
            }
            $scope.selectProd = [];
        } else {
            toastr["error"]("Bạn đã chọn tài sản này!");
            $scope.selectProd = [];
        }
        select2();
    };

    $scope.getSerialByAssetId = (as_id, dest_id = 0, data) => {
        let param = {
            dest_id: dest_id,
            asset_id: as_id,
            is_repair: $scope.isAction == "REPAIR" ? 1 : 0
        };
        $http.get(base_url + "/assets/ajax_get_serials?" + $.param(param)).then((r) => {
            if (r.data && r.data.status == 1) {
                $scope.serials[as_id] = r.data.data;
                $scope.transaction.assets.unshift(data);
            }
        });
    };


    $scope.countTotalCost = () => {
        let lsId = [];
        $scope.transaction.total = 0;
        $scope.transaction.count_quantity = 0;
        $scope.transaction.assets.forEach(asset => {
            let hasId = lsId.find(r => { return asset.asset_id == r });
            if (!hasId) lsId.push(asset.asset_id);
            $scope.transaction.total += formatNumber(asset.quantity_request) * formatNumber(asset.cost);
            $scope.transaction.count_quantity += formatNumber(asset.quantity_request);
        });
        $scope.transaction.count_product = lsId.length;
    }

    $scope.getInfoAsset = (as) => {
        if (!_.isEmpty(as.total_quantity)) {
            let cost = isViewCost ? '_' + ($filter('number')(formatNumber(as.cost))) + ' đ' : '';
            return ` ${as.code} - ${as.name}${cost} (${as.total_quantity})`;
        } else {
            return `${as.code} - ${as.name}`;
        }
    };

    $scope.checkInputQuantity = (asset) => {
        return (
            asset && Number(asset.quantity_received) > Number(asset.quantity)
        );
    };

    $scope.changeWarehouseSource = () => {
        //Lấy tài sản và tồn kho tại chi nhánh xuất
        if ($scope.isAction != 'STORE') type = 2;
        $scope.getAssets($scope.transaction.source_id, 1);
        $scope.transaction.assets = [];
    }

    $scope.getAssets = (source_id, typeas) => {
        $scope.assets = [];
        let param = {
            type: typeas,
            source_id: source_id ? source_id : 0
        };
        AssetSvc.findAssetInventory(param).then(data => {
            $scope.assets = data;
        })
    };

    function select2() {
        setTimeout(() => {
            $('.select2').select2();
        }, 100);
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
        //Nhập kho
        if ($scope.transaction.type == 1 && isStore) url = base_url + "assets/ajax_import_assets";
        //Chuyển kho
        if ($scope.transaction.type == 2 && isStore) url = base_url + "assets/ajax_transfer_assets";
        //Xuất hủy
        if ($scope.transaction.type == 3 && isStore) url = base_url + "assets/ajax_cancel_assets";
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
            } else {
                toastr["error"](r.data.message ? r.data.message : "Có lổi xẩy ra. Vui lòng thử lại!");
            }
            $scope.loading = false;

            angular.element(document.getElementById($scope.ressponse)).scope().getAll();
        });
    };

    function formatNumber(value) {
        if (value && value != '') {
            return Number((value + '').replace(/,/g, ""));
        } else {
            return 0;
        }
    }

    $scope.deleteAsset = (asset, index) => {
        if ($scope.transaction.type != 1 && $scope.serials[asset.asset_id]) {
            $scope.serials[asset.asset_id].forEach((serial) => {
                if (serial.asset_serial == asset.asset_serial) {
                    serial.is_use = 0;
                }
            });
        }
        $scope.transaction.assets.splice(index, 1);
        $scope.countTotalCost();
    };

    $scope.handleSelectSerial = ($i, asset) => {
        $scope.serials[asset.asset_id].forEach((serial) => {
            if (serial.asset_serial == asset.asset_serial) {
                serial.is_use = 1;
                asset.cost = serial.cost;
            }
        });
    };

    $scope.addSerial = (value, index) => {
        let data = {
            asset_code: value.asset_code,
            asset_id: value.asset_id,
            asset_name: value.asset_name,
            asset_serial: "",
            serial_code: value.serial_code,
            quantity_request: value.quantity_request,
            cost: $scope.transaction.type == 1 ? value.cost : 0,
            type: value.type,
            is_new: "1",
        };
        $scope.transaction.assets.splice(index + 1, 0, data);
        //get list serial when edit tran
        let check =
            $scope.transaction.id &&
            $scope.transaction.transaction_type != 1 &&
            data.type == 1 &&
            !$scope.lsSerialchecked[data.asset_id];
        if (check)
            getInventorySerialAssetsId(
                $scope.transaction.source_id,
                data.asset_id,
                1
            );

        $scope.countTotalCost();
    };

    $scope.countCost = (value, index) => {
        if ($scope.transaction.type != 1) return;
        value.quantity_request = $filter('number')(formatNumber(value.quantity_request));
        value.cost = $filter('number')(formatNumber(value.cost));
        let total = formatNumber(value.quantity_request) * formatNumber(value.cost);
        $scope.transaction.assets[index].total_cost = total;
        $scope.countTotalCost();
    }


    $scope.isShowTotal = (value) => {
        return formatNumber(value.quantity_request) > 1 && formatNumber(value.cost) > 0 ? true : false;
    }

    $scope.createSerial = () => {
        let prd = $scope.transaction.assets.filter((r) => {
            return r.type == 1;
        });
        let prods = [];
        prd.forEach((element) => {
            if (
                !prods.find((r) => {
                    return r.asset_id == element.asset_id;
                })
            ) {
                prods.push(element);
            }
        });
        let tmp = [];
        $http
            .post(base_url + "/assets/ajax_create_serial", { assets: prods })
            .then((r) => {
                if (r.data && r.data.status == 1) {
                    $scope.serialNew = r.data.data;
                    $scope.transaction.assets.forEach((e) => {
                        if (e.type == 1) {
                            let sr = $scope.serialNew.find((r) => {
                                return e.asset_id == r.asset_id;
                            });
                            let index = tmp.findIndex((r) => {
                                return e.asset_id == r.asset_id;
                            });
                            if (index >= 0) {
                                if (sr.number && r.number != "") {
                                    e.asset_serial =
                                        e.serial_code +
                                        "_" +
                                        (sr.number + tmp[index].number + 1 + "").padStart(6, "0");
                                    tmp[index].number = tmp[index].number + 1;
                                } else {
                                    e.asset_serial = e.serial_code + "_";
                                }
                            } else {
                                if (sr.number && r.number != "") {
                                    tmp.push({ asset_id: e.asset_id, number: 0 });
                                    e.asset_serial =
                                        e.serial_code + "_" + (sr.number + "").padStart(6, "0");
                                } else {
                                    e.asset_serial = e.serial_code + "_";
                                }
                            }
                        }
                    });
                }
            });
    };

    $scope.isExistSerial = (serial) => {
        if (!serial) return true;
        let hasSerial = $scope.serialExists.find((sr) => {
            return sr.asset_serial === serial;
        });
        return hasSerial ? true : false;
    };


    $scope.changeTypeAsset = () => {
        $scope.filter.dept_ids = [];
        $scope.filter.dest_id = '';
    }

    $scope.showImg = (url) => {
        $scope.currImg = url;
        $("#modalImgAdd").modal("show");
    };

    $scope.closeModalImageAdd = () => {
        $("#modalImgAdd").modal("hide");
    }

    $scope.changeType = () => {
        //Lấy danh sách tài sản khi nhập kho
        if ($scope.transaction.type == 1) {
            $scope.getAssets(0, 1);
        }
        $scope.transaction.assets = [];
        $scope.transaction.dest_id = '';
        $scope.transaction.source_id = '';
        $scope.transaction.user_id = '';
        select2();
    };

    $scope.getUserByGroupIds = () => {
        let param = {
            is_main_store: true,
            store_id: $scope.transaction.store_id,
        };
        $scope.loadingUser = true;
        AdminUserSvc.findUser(param).then(data => {
            $scope.loadingUser = false;
            $scope.allUsers = data;
            select2();
        })
    };
})