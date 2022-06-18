app.controller('productCtrl', function ($scope, $http, $sce) {

    var pi = $scope.pagingInfo = {
        itemsPerPage: 30,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };

    $scope.init = () => {
        $scope.token_crm = token_crm;
        $scope.token_website = token_website;
        $scope.all_nations = all_nations;
        $scope.company_id = company_id;
        $scope.error = [];
        $scope.product_groups = [];
        $scope.sumTask = 0;
        $scope.dem = 0;
        $scope.filter = {};
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;
        $scope.getListUpdate();
        $scope.getWebName();
        $scope.getProductGroups();
        select2();

    }

    $scope.getListUpdate = () => {
        $scope.update_refs = {};
        $http.get(base_url + 'product_websites/get_list_update').then(r => {
            if (r.data.status == 1) {
                if (r.data.data.length > 0) {
                    $scope.update_refs = r.data.data;
                    $scope.update_refs.forEach((element) => {
                        if (element.list_web) {
                            element.list_web = JSON.parse(element.list_web);
                        }
                    });
                }
                if (r.data.syncs.length > 0) {
                    $scope.syncs = r.data.syncs;
                }
            }
        });
    }

    //update_list_refs
    $scope.openUpdateRefs = () => {
        $('#openUpdateRefs').modal('show');
    }

    $scope.updateListRefs = (item) => {
        let url = base_url + "product_websites/update_list_refs";
        $http.post(url, item).then((r) => {
            if (r.data && r.data.status == 1) {
                $scope.getListUpdate();
                $('#openUpdateRefs').modal('hide');
                toastr['success']("Quá trình cập nhật đang tiến hành");
            } else {
                toastr['error']("Cập nhật thất bại");
            }
        });
    }
    $scope.openItemRefs = (id) => {
        $scope.refs = {};
        let url = base_url + "product_websites/get_refs?id=";
        $http.get(url + id).then((r) => {
            if (r.data && r.data.status == 1) {
                $scope.refs = r.data.data;
                $scope.refs.forEach((element) => {
                    if (element.list_web) {
                        element.list_web = JSON.parse(element.list_web);
                    }
                    if (element.list_status) {
                        element.list_status = JSON.parse(element.list_status).length;
                    } else {
                        element.list_status = 0;
                    }
                });
                $('#openItemRefs').modal('show');
            } else {
                toastr['error']("Cập nhật thất bại");
            }
        });
    }

    $scope.openItemRefsFinish = (id) => {
        $scope.refs = {};
        $scope.dem_refs = 0;
        let url = base_url + "product_websites/get_refs_finish?id=";
        $http.get(url + id).then((r) => {
            if (r.data && r.data.status == 1) {
                $scope.refs = r.data.data;
                $scope.refs.forEach((element) => {
                    if (element.list_web) {
                        element.list_web = JSON.parse(element.list_web);
                    }
                    if (element.list_status) {
                        element.list_status = JSON.parse(element.list_status);
                        element.total = element.list_status.length;
                        $scope.dem_refs++;
                    } else {
                        element.total = 0;
                    }

                });
                console.log($scope.refs);

                $('#openItemRefsFinish').modal('show');
            } else {
                toastr['error']("Cập nhật thất bại");
            }
        });
    }
    //
    $scope.getAll = () => {
        $scope.error = [];
        $scope.loadding = true;
        $http.get(base_url + 'product_websites/get_list?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r.data.status == 1) {
                $scope.rows = r.data.data;
                $scope.rows.forEach((item) => {
                    if (item.list_sub_groups != null) {
                        item.list_sub_groups = JSON.parse(item.list_sub_groups);
                    } else {
                        item.list_sub_groups = [];
                    }

                    if (item.attribute_name != null) {
                        item.attribute_name = JSON.parse(item.attribute_name);
                    } else {
                        item.attribute_name = [];
                    }

                    if (item.attribute_detail_sub != null) {
                        item.attribute_detail_sub = JSON.parse(item.attribute_detail_sub);
                    } else {
                        item.attribute_detail_sub = [];
                    }

                    if (item.attribute_detail_name != "") {
                        item.attribute_detail_name = JSON.parse(item.attribute_detail_name);
                    } else {
                        item.attribute_detail_name = [];
                    }
                });
                $scope.pagingInfo.total = r.data.count;
                $scope.website_count = r.data.count;
                $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
                $scope.sumTask = r.data.number;
                select2();
                $scope.loadding = false;
            } else if (r.data.status == 2) toastr["error"](r.data.data);
            else toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
        });
    }

    $scope.openModalErr = (item) => {
        $scope.err = item;
        $('#openModalErr').modal('show');
        select2();
    }
    //insert
    $scope.openListProduct = () => {
        $scope.dem = 0;
        $scope.dem_name = 0;
        $scope.dem_err = 0;
        $scope.check = 0;
        $scope.list_product_parent_search = [];
        $scope.search_product = {};
        $scope.insert = {};
        $scope.insert.webname = [];
        $scope.insert.listwebname = [];
        $scope.insert.product_group = "0";
        $scope.list_product = [];
        $scope.error_insert = [];
        $(".btn-insert-none").css("display", "block");
        $('#openListProduct').modal('show');
        select2();
    }

    $scope.insertListProduct = () => {
        $scope.dem++;
        if ($scope.dem == 1) {
            $("body").css("cursor", "wait");
            $(".btn-no-drop").css("cursor", "no-drop");
            $(".btn-insert-none").css("display", "none");
            $scope.error_insert = [];
            let url = base_url + "product_websites/insertListProduct";

            if ($scope.insert.webname.length == 0) {
                $("body").css("cursor", "unset");
                $(".btn-no-drop").css("cursor", "pointer");
                $(".btn-insert-none").css("display", "block");
                toastr['error']("Vui lòng chọn websites");
                $scope.dem = 0;
                return;
            }

            if ($scope.insert.webname.filter(i => i == 0).length > 0) {
                $scope.insert.listwebname = $scope.webdomain.map(function (e) {
                    return e.id;
                });
            } else {
                $scope.insert.listwebname = $scope.insert.webname;
            }
            if ($scope.list_product.length == 0) {
                $("body").css("cursor", "unset");
                $(".btn-no-drop").css("cursor", "pointer");
                $(".btn-insert-none").css("display", "block");
                toastr['error']("Vui lòng chọn sản phẩm");
                $scope.dem = 0;
                return;
            }

            $scope.insert.list_product = [];
            $scope.insert.list_product_id = [];
            $scope.insert.list_parent_id = [];

            $scope.list_product.forEach((item) => {
                item.err = [];
                let data = {
                    "product_id": item.id,
                    "name": item.description,
                    "name_en": item.description_usa,
                    "price": item.price,
                    "price_web": item.price_web,
                    "image_url": item.image_url,
                    "parent_id": item.parent_id
                };
                $scope.insert.list_product.push(data);
                $scope.insert.list_product_id.push(item.id);
                if (item.parent_id > 0) {
                    $scope.insert.list_parent_id.push(item.parent_id);
                }
            });

            $scope.insert.listwebname.forEach((item) => {
                $scope.webinsert = {};
                $scope.webinsert.web_id = item;
                $scope.webinsert.list_product = [];
                $scope.webinsert.list_product_id = [];
                $scope.webinsert.list_parent_id = [];
                $scope.webinsert.list_product = $scope.insert.list_product;
                $scope.webinsert.list_product_id = $scope.insert.list_product_id;
                $scope.webinsert.list_parent_id = $scope.insert.list_parent_id;
                $http.post(url, $scope.webinsert).then((r) => {
                    if (r.data && r.data.status == 1) {
                        let data_err = r.data.data;
                        $scope.list_product.forEach((item) => {
                            let arr_check = [];
                            arr_check = data_err.filter(i => i.id == item.id);
                            if (arr_check.length > 0) {
                                item.err.push(arr_check[0]);
                            }
                        });
                    } else {
                        if (r.data && r.data.status == 2) {
                            $scope.list_product.forEach((item) => {
                                item.err.push(r.data.data);
                            });
                        } else {
                            let data_err = r.data.data;
                            $scope.list_product.forEach((item) => {
                                let arr_check = [];
                                arr_check = data_err.filter(i => i.id == item.id);
                                if (arr_check.length > 0) {
                                    item.err.push(arr_check[0]);
                                }
                            });
                        }
                    }
                    $scope.check++;
                }).then(e => {
                    if ($scope.check == $scope.insert.listwebname.length) {
                        $scope.dem = 0;
                        $scope.list_product.forEach((item) => {
                            if (item.err.length > 0) {
                                $scope.dem_err++;
                            }
                        });
                        if ($scope.dem_err == 0) {
                            toastr['success']("Thêm thành công");
                        }
                        $("body").css("cursor", "unset");
                        $(".btn-no-drop").css("cursor", "pointer");
                    }
                }).catch(e => {
                    toastr['error']("Đã có lỗi máy chủ API");
                    $scope.check++;
                    $("body").css("cursor", "unset");
                    $(".btn-no-drop").css("cursor", "pointer");
                });
            });
        }
    }

    $scope.insertProductWeb = (item) => {
        $scope.webinsert = {};
        $scope.webinsert.product_id = item.id;
        $scope.webinsert.name = item.description;
        $scope.webinsert.name_en = item.description_usa;
        $scope.webinsert.price = item.price;
        $scope.webinsert.price_web = item.price_web;
        $scope.webinsert.image_url = item.image_url;
        $scope.webinsert.parent_id = (item.parent_id > 0 && item.parent_id != item.id) ? item.parent_id : 0;
        $scope.webinsert.web_id = $scope.filter.webname;
        $scope.webinsert.list_sub_groups = [];
        if (item.list_sub_groups.length > 0) {
            item.list_sub_groups.forEach(element => {
                $scope.webinsert.list_sub_groups.push(element.id);
            });
        }
        $scope.loadding = true;
        let url = base_url + "product_websites/insertProductWeb";

        $http.post(url, $scope.webinsert).then((r) => {
            if (r.data && r.data.status == 1) {
                toastr['success']("Thêm thành công");
                $scope.getAll();
            } else {
                toastr["error"](r.data.message);
            }
            $scope.loadding = false;
        }).catch(e => {
            toastr['error']("Đã có lỗi máy chủ API");
            $scope.loadding = false;
        });
    }

    $scope.searchProduct = () => {

        if (!$scope.search_product.name && $scope.search_product.name.length < 3) {
            return true;
        }
        if ($scope.filter_timer) {
            clearTimeout($scope.filter_timer);
        }
        $scope.filter_timer = setTimeout(() => {
            $scope.dem_name = 0;
            $scope._searchProduct($scope.search_product.name);
        }, 350);

    }

    $scope._searchProduct = (name) => {
        $scope.loadding_product = true;
        $scope.product = {};
        $scope.product.key = name;
        $scope.product.product_group = $scope.insert.product_group;
        let url = 'product_websites/get_product?filter=';
        $http.get(base_url + url + JSON.stringify($scope.product)).then(res => {
            if (res.data.status == 1) {
                $scope.list_product_parent_search = res.data.data;
                $scope.list_product_parent_search.forEach((element) => {
                    if (element.list_web) {
                        element.list_web = JSON.parse(element.list_web);
                    }
                    $dem = $scope.list_product.filter(item => item.id == element.id);
                    if ($dem.length == 0) {
                        element.type = 0;
                    } else {
                        element.type = 1;
                    }
                    element.key_web = 1;
                });
                select2();
            } else toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
            $scope.loadding_product = false;
        });
    }

    $scope.chooseItemSearchProduct = (i) => {
        if (i.type == 0) {
            $dem = $scope.list_product.filter(item => item.id == i.id);
            if ($dem.length == 0) {
                $scope.list_product.unshift(i);
            }
            $scope.list_product_parent_search.forEach((element) => {
                $dem = $scope.list_product.filter(item => item.id == element.id);
                if ($dem.length == 0) {
                    element.type = 0;
                } else {
                    element.type = 1;
                }
            });
        } else {
            $scope.list_product = $scope.list_product.filter(item => item.id != i.id);
            $scope.list_product_parent_search.forEach((element) => {
                $dem = $scope.list_product.filter(item => item.id == element.id);
                if ($dem.length == 0) {
                    element.type = 0;
                } else {
                    element.type = 1;
                }
            });
        }
        $scope.removeProduct();
    }

    $scope.removeProduct = () => {
        $scope.search_product = {};
        $scope.list_product_parent_search = [];
    }

    $scope.remove_id = (id) => {
        $scope.list_product = $scope.list_product.filter(item => item.id != id);
    }

    //update 

    $scope.openProductId = (item) => {

        let url = base_url + "product_websites/openProductId";
        $scope.data = {};
        $scope.data.id = item;
        $scope.data.web_id = $scope.filter.webname;

        $http.post(url, $scope.data).then((r) => {
            if (r.data && r.data.status == 1) {
                $scope.update = r.data.data;
                if ($scope.update.list_sub_groups != null) {
                    $scope.list_sub_groups = angular.copy($scope.update.list_sub_groups);
                } else {
                    $scope.list_sub_groups = [];
                }

                if ($scope.update.image_url != null) {
                    $('.wrap-upload').find('img').attr('src', $scope.update.image_url);
                }

                if ($scope.update.attribute_name != null) {
                    $scope.update.attribute_name = JSON.parse($scope.update.attribute_name);
                } else {
                    $scope.update.attribute_name = [];
                }

                if ($scope.update.attribute_detail_sub != null) {
                    $scope.update.attribute_detail_sub = JSON.parse($scope.update.attribute_detail_sub);
                } else {
                    $scope.update.attribute_detail_sub = [];
                }

                if ($scope.update.attribute_detail_name != null) {
                    $scope.update.attribute_detail_name = JSON.parse($scope.update.attribute_detail_name);
                } else {
                    $scope.update.attribute_detail_name = [];
                }

                $('#openUpdate').modal('show');
                select2();
            } else {
                toastr['error']("Đã có lỗi máy chủ API ");
            }
        }).catch(e => {
            toastr['error']("Đã có lỗi máy chủ API");
        });
    }

    $scope.openUpdate = (item) => {
        $scope.update = angular.copy(item);

        $scope.search_product = {};

        if (item.list_sub_groups != null) {
            $scope.list_sub_groups = angular.copy(item.list_sub_groups);
        } else {
            $scope.list_sub_groups = [];
        }

        if ($scope.update.image_url != null) {
            $('.wrap-upload').find('img').attr('src', $scope.update.image_url);
        }
        $('#openUpdate').modal('show');
        select2();
    }


    $scope.updateListWeb = () => {
        $scope.loadInsert = true;
        $scope.data = {};
        $scope.data.product_id = $scope.update.id;
        $scope.data.price = $scope.update.price;
        $scope.data.price_web = $scope.update.price_web;
        $scope.data.data = [];
        $scope.data.delete = [];
        let dem = [];
        $scope.update.list_sub_groups.forEach((i) => {
            dem = $scope.list_sub_groups.filter(item => item.id == i.id);
            if (dem.length == 0) {
                $scope.data.delete.push(i.id);
            }
        });
        $scope.list_sub_groups.forEach((item) => {
            $scope.data.data.push(item.id);
        });

        let url = base_url + "product_websites/updateListWeb";

        $http.post(url, $scope.data).then((r) => {
            if (r.data && r.data.status == 1) {
                if ($scope.filter.webname) {
                    $scope.getAll();
                } else {
                    $scope.get_list_update();
                }
                toastr['success']("Cập nhật thành công");
            } else {
                toastr['error']("Cập nhật thất bại");
            }
            $scope.loadInsert = false;
        }).catch(e => {
            toastr['error']("Đã có lỗi máy chủ API");
            $scope.loadInsert = false;
        });

    }

    $scope.searchProductList = () => {

        if (!$scope.search_product.name && $scope.search_product.name.length < 3) {
            return true;
        }
        if ($scope.filter_timer) {
            clearTimeout($scope.filter_timer);
        }
        $scope.filter_timer = setTimeout(() => {
            $scope._searchProductList($scope.search_product.name);
        }, 350);

    }

    $scope._searchProductList = (name) => {
        $scope.loadding_product = true;
        $scope.product = {};
        $scope.product.key = name;
        $scope.product.web_id = $scope.filter.webname;
        let url = 'product_websites/get_product_list?filter=';
        $http.get(base_url + url + JSON.stringify($scope.product)).then(res => {
            if (res.data.status == 1) {
                $scope.list_product_sub_search = res.data.data;
                $scope.list_product_sub_search.forEach((element) => {
                    $dem = $scope.list_sub_groups.filter(item => item.id == element.id);
                    if ($dem.length == 0) {
                        element.type = 0;
                    } else {
                        element.type = 1;
                    }
                });
                select2();
            } else toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
            $scope.loadding_product = false;
        });
    }

    $scope.chooseItemSearchProductList = (i) => {
        if (i.type == 0) {
            dem = $scope.list_sub_groups.filter(item => item.id == i.id);
            if (dem.length == 0) {
                $scope.list_sub_groups.unshift(i);
            }
            $scope.list_product_sub_search.forEach((element) => {
                dem = $scope.list_sub_groups.filter(item => item.id == element.id);
                if (dem.length == 0) {
                    element.type = 0;
                } else {
                    element.type = 1;
                }
            });
        } else {
            $scope.list_sub_groups = $scope.list_sub_groups.filter(item => item.id != i.id);
            $scope.list_product_sub_search.forEach((element) => {
                dem = $scope.list_sub_groups.filter(item => item.id == element.id);
                if (dem.length == 0) {
                    element.type = 0;
                } else {
                    element.type = 1;
                }
            });
        }
        $scope.removeProductList();
    }

    $scope.removeProductList = () => {
        $scope.search_product = {};
        $scope.list_product_sub_search = [];
    }

    $scope.remove_id_list = (id) => {
        $scope.list_sub_groups = $scope.list_sub_groups.filter(item => item.id != id);
    }

    //

    $scope.updateProductListWeb = () => {
        $scope.dem++;
        if ($scope.dem == 1) {
            $scope.error = [];
            $("body").css("cursor", "wait");
            $(".btn-no-drop").css("cursor", "no-drop");

            let url = base_url + "product_websites/updateProductListWeb";

            $http.post(url).then((r) => {
                if (r.data && r.data.status == 1) {
                    if ($scope.filter.webname) {
                        $scope.getAll();
                    } else {
                        $scope.get_list_update();
                    }
                    $scope.error = r.data.data;
                    toastr['success']("Cập nhật thành công");
                } else {
                    $scope.error = r.data.data;
                    toastr['error']("Cập nhật thất bại");
                }

                $("body").css("cursor", "unset");
                $(".btn-no-drop").css("cursor", "pointer");
                $scope.dem = 0;
            });
        }
    }



    $scope.updateProduct = (item) => {
        $scope.dem++;
        if ($scope.dem == 1) {
            $("body").css("cursor", "wait");
            $(".btn-no-drop").css("cursor", "no-drop");
            $scope.update = {};

            let url = base_url + "product_websites/update";

            $scope.update.id_web = $scope.filter.webname;
            $scope.update.product_id = item.id;
            $scope.update.price = item.price_update;
            $scope.update.price_web = item.price_web_update;

            $http.post(url, $scope.update).then((r) => {
                if (r.data && r.data.status == 1) {
                    $scope.getAll();
                    toastr['success'](r.data.data);
                } else toastr['error'](r.data.data);

                $("body").css("cursor", "unset");
                $(".btn-no-drop").css("cursor", "pointer");
                $scope.dem = 0;
            });
        }
    }

    $scope.updateProductWeb = (item) => {
        $scope.dem++;
        if ($scope.dem == 1) {
            $scope.error = [];
            $("body").css("cursor", "wait");
            $(".btn-no-drop").css("cursor", "no-drop");
            $scope.update = {};

            let url = base_url + "product_websites/updateProductWeb";

            $scope.update.product_id = item.id;
            $scope.update.name = item.description;
            $scope.update.price = item.price_update;
            $scope.update.price_web = item.price_web_update;

            $http.post(url, $scope.update).then((r) => {
                if (r.data && r.data.status == 1) {
                    $scope.get_list_update();
                    $scope.error = r.data.data;
                    toastr['success']("Cập nhật thành công");
                } else {
                    $scope.error = r.data.data;
                    toastr['error']("Cập nhật thất bại");
                }

                $("body").css("cursor", "unset");
                $(".btn-no-drop").css("cursor", "pointer");
                $scope.dem = 0;
            });
        }
    }

    $scope.openToken = () => {
        $scope.dem = 0;
        $scope.loadInsert = false;
        $scope.error_website = [];
        $scope.error_crm = [];
        $('#openToken').modal('show');
        select2();
    }

    $scope.updateTokenWebsite = () => {
        $scope.dem++;
        $scope.loadInsert = true;
        if ($scope.dem == 1) {
            let url = base_url + "product_websites/updateTokenWebsite";
            $http.post(url).then((r) => {
                $scope.error_website = [];
                if (r.data && r.data.status == 1) {
                    toastr['success']('Cập nhật thành công');
                    $scope.token_website = r.data.token_website;
                    $scope.error_website = r.data.data;
                    select2();
                } else {
                    $scope.error_website = r.data.data;
                    toastr['error']('Cập nhật thất bại');
                }
                $scope.loadInsert = false;
                $scope.dem = 0;
            }).catch(e => {
                $scope.loadInsert = false;
                toastr["error"]("Đã có lỗi xảy ra với máy chủ API");
            });
        }
        if ($scope.dem == 3) {
            toastr['error']('Vui lòng chờ xử lý');
        }
    }

    $scope.updateTokenCRM = () => {
        $scope.dem++;
        $scope.loadInsert = true;
        if ($scope.dem == 1) {
            let url = base_url + "product_websites/updateTokenCRM";
            $http.post(url).then((r) => {
                $scope.error_crm = [];
                if (r.data && r.data.status == 1) {
                    toastr['success']('Cập nhật thành công');
                    $scope.token_crm = r.data.token_crm;
                    $scope.error_crm = r.data.data;
                    select2();
                } else {
                    $scope.error_crm = r.data.data;
                    toastr['error']('Cập nhật thất bại');
                }
                $scope.loadInsert = false;
                $scope.dem = 0;
            }).catch(e => {
                $scope.loadInsert = false;
                toastr["error"]("Đã có lỗi xảy ra với máy chủ API");
            });
        }
        if ($scope.dem == 3) {
            toastr['error']('Vui lòng chờ xử lý');
        }
    }

    $scope.key_web = (item, key) => {
        item.key_web = key;
    }

    $scope.change_product_group = () => {
        $scope.removeProduct();
    }

    $scope.getWebName = () => {
        $http.get(base_url + 'product_websites/get_online_domains').then(r => {
            if (r.data.status == 1) {
                $scope.webname = r.data.data;
            } else toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
        });
    }

    $scope.getProductGroups = () => {
        $http.get(base_url + 'product_websites/get_product_group').then(r => {
            if (r.data.status == 1) {
                $scope.product_groups = r.data.data;
            } else toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
        });
    }

    $scope.linkToDetail = (id) => {
        let domain = $scope.webname.filter(item => item.id == $scope.filter.webname)[0].url;
        window.open('https://' + domain + '/?post_type=product&preview=true&p=' + id);
    }


    $scope.handleFilter = () => {
        $scope.pagingInfo.currentPage = 1;
        $scope.pagingInfo.offset = 0;
        $scope.filter.offset = 0;
        $scope.getAll();
    }

    $scope.formatDate = (d, fm) => {
        return moment(d).format(fm);
    }

    function select2() {
        setTimeout(() => {
            $('.select2').select2();
        }, 300);
    }
    //paging-----------------------------------

    $scope.viewPrice = (item) => {
        let val = item;
        val = val.replace(/,/g, "")
        val += '';
        x = val.split('.');
        x1 = x[0];
        x2 = x.length > 1 ? '.' + x[1] : '';
        let rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2
    }

    $scope.go2Page = function (page) {
        if (page < 0) return;
        var pi = $scope.pagingInfo;
        pi.currentPage = page;
        pi.from = pi.offset = (pi.currentPage - 1) * pi.itemsPerPage;
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = ($scope.pagingInfo.currentPage - 1) * $scope.pagingInfo.itemsPerPage;
        $scope.getAll();
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

    $(document).on('hidden.bs.modal', function () {
        if ($('.modal:visible').length) {
            $('body').addClass('modal-open');
        }
    });
    //end paging

});