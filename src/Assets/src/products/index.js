app.controller('productCtrl', function ($scope, $http, $sce) {

    var pi = $scope.pagingSearch = $scope.pagingInfo = {
        itemsPerPage: 30,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };

    $scope.init = () => {
        $('.box1').css('opacity', '1');
        $scope.token_crm = token_crm;
        $scope.token_website = token_website;
        $scope.all_nations = all_nations;
        $scope.is_admin = is_admin;
        $scope.is_acc = is_acc;
        $scope.is_only_assistantmanager = is_only_assistantmanager;
        $scope.company_id = company_id;
        $scope.loadding = true;
        $scope.restFilter();
        $scope.getAll();
        $scope.getProductGroup();
        $scope.getProductUnits();
        $scope.getProductAttributes();
        $scope.getDomain();
    }
    
    $scope.getDomain = () => {
        let filter = {
            "active" : 1,
            "type" : 1,
            "company_id" : $scope.company_id,
        };
        $http.get(base_url + 'online_domain/get_list?filter=' + JSON.stringify(filter)).then(r => {
            if (r.data.status == 1) {
                $scope.domain = r.data.data;
            }
        });
    }

    $scope.restFilter = () =>{
        $scope.filter = {};
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;
        $scope.filter.nation_id = "";
        $scope.filter.type = "";
        $scope.filter.store_type = "";
        $scope.filter.nation_id = "1";
        $scope.filter.group_id = "";
        $scope.filter.web_id = "";
        $scope.filter.active = "1";
        $scope.filter.key = "";
    }

    $scope.getAll = () => {
        $scope.loadding = true;
        $http.get(base_url + 'products/getlist?' + $.param($scope.filter)).then(r => {
            if (r.data.status == 1) {
                $scope.list_price = [];
                $scope.rows = r.data.data;
                $scope.rows.forEach((item) => {
                    if (item.list_sub_groups != null) {
                        item.list_sub_groups = JSON.parse(item.list_sub_groups);
                        item.list_sub_groups = item.list_sub_groups.sort(compare);
                    }else{
                        item.list_sub_groups = [];
                    }
                    if(item.attribute_detail_name != ""){
                        item.attribute_detail_name = JSON.parse(item.attribute_detail_name);
                    }

                    if(item.attribute_name != null){
                        item.attribute_name = JSON.parse(item.attribute_name);
                    }else{
                        item.attribute_name = [];
                    }

                    if(item.attribute_detail_sub != null){
                        item.attribute_detail_sub = JSON.parse(item.attribute_detail_sub);
                    }else{
                        item.attribute_detail_sub = [];
                    }
                    $scope.list_price.push(item.id);
                    if(item.list_domain != null){
                        item.list_domain = JSON.parse(item.list_domain);
                    }else{
                        item.list_domain = [];
                    }
                    item.show = 1;
                });

                if ($scope.list_price.length > 0 && $scope.company_id == 4) {
                    $scope.getListPrice($scope.list_price);
                }

                $scope.pagingInfo.total = r.data.count;
                $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
                select2();
                $scope.loadding = false;
            } else toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
        });
    }

    $scope.getListPrice = (data) => {
        $http.get(base_url + 'products/get_list_price?filter=' + JSON.stringify(data)).then(r => {
            if (r.data.status == 1) {
                $scope.list_price_hasaki = r.data.data;
                let dem;
                $.each($scope.rows, function (key, val) {
                    dem = $scope.list_price_hasaki.filter(item => item.id == val.id);
                    if (dem.length > 0) {
                        if (dem[0].price_new > 0) {
                            $scope.rows[key].price_new_hasaki = dem[0].price_new;
                        } else {
                            $scope.rows[key].price_new_hasaki = 0;
                        }
                        if (dem[0].price_old > 0) {
                            $scope.rows[key].price_old_hasaki = dem[0].price_old;
                        } else {
                            $scope.rows[key].price_old_hasaki = 0;
                        }
                    }
                });
            } else toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
        });
    }
    $scope.openSearch = (i) => {
        if (i == 1) {
            $('.col-search').css('display', 'block');
        } else {
            $('.col-search').css('display', 'none');
        }
    }
    //insert
    $scope.openAdd = () => {
        $scope.insert = {};
        $scope.insert.nation_id = "1";
        $scope.insert.type = "retail";
        if ($scope.company_id == 1) {
            $scope.insert.store_type = "1";
        }
        $('.wrap-upload').find('img').attr('src', '');
        $('#openAdd').modal('show');
        select2();
    }


    $scope.insertProduct = () => {
        $scope.loadInsert = true;
        let item = angular.copy($scope.insert)
        item.image_url = $('.product-image-url').val();

        let price, price_web;

        if (item.price) {
            price = Number(item.price.replace(/,/g, ""));
        }

        if (item.price_web) {
            price_web = Number(item.price_web.replace(/,/g, ""));
        }

        if (item.description.length > 255) {
            toastr["error"]('Tên sản phẩm không được quá 255 ký tự');
            $scope.loadInsert = false;
            return;
        } else if (price >= price_web && item.price_web != 0) {
            toastr["error"]('Giá thị trường phải lớn hơn giá bán');
            $scope.loadInsert = false;
            return;
        }

        if (item.description_usa) {
            if (item.description_usa.length > 255) {
                toastr["error"]('Tên sản phẩm tiếng anh không được quá 255 ký tự');
                $scope.loadInsert = false;
                return;
            }
        }
        $http.post(base_url + 'products/save', JSON.stringify(item)).then(r => {
            if (r.data.status == 1) {
                $('#openAdd').modal('hide');
                toastr["success"](r.data.message);
                $scope.getAll();
                select2();
            } else toastr["error"](r.data.message);
            $scope.loadInsert = false;
        }).catch(e => {
            $scope.loadInsert = false;
            toastr["error"]("Đã có lỗi xảy ra với máy chủ API");
        });


    }

    //ID
    $scope.openProduct = (id) => {
        $scope.update = {};
        $('.wrap-upload').find('img').attr('src', '');
        $http.get(base_url + 'products/get_id_product?id=' + id).then(r => {
            if (r.data.status == 1) {
                $scope.update = r.data.data;

                if ($scope.update.attribute_detail_name != "") {
                    $scope.update.attribute_detail_name = JSON.parse($scope.update.attribute_detail_name);
                } else {
                    $scope.update.attribute_detail_name = [];
                }
                if ($scope.update.list_sub_groups != null) {
                    $scope.update.list_sub_groups = JSON.parse($scope.update.list_sub_groups);
                } else {
                    $scope.update.list_sub_groups = [];
                }
                if ($scope.update.image_url != null) {
                    $('.wrap-upload').find('img').attr('src', $scope.update.image_url);
                }
                $scope.update.price = $scope.viewPrice(String($scope.update.price));
                $scope.update.price_web = $scope.viewPrice(String($scope.update.price_web));
                $scope.update.price_cost = $scope.viewPrice(String($scope.update.price_cost));
                $('#openUpdate').modal('show');
                select2();
            } else toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
        });
    }
    //update
    $scope.openUpdate = (item) => {
        $scope.update = angular.copy(item);
        if ($scope.update.attribute_detail_name == "") {
            $scope.update.attribute_detail_name = [];
        }
        if ($scope.update.image_url != null) {
            $('.wrap-upload').find('img').attr('src', $scope.update.image_url);
        } else {
            $('.wrap-upload').find('img').attr('src', '');
        }
        $scope.update.price = $scope.viewPrice(String($scope.update.price));
        $scope.update.price_web = $scope.viewPrice(String($scope.update.price_web));
        $scope.update.price_cost = $scope.viewPrice(String($scope.update.price_cost));
        $('#openUpdate').modal('show');
        select2();
    }

    $scope.openUpdateWeb = (item) => {
        $scope.search_product = {};
        $scope.update =  angular.copy(item);
        if($scope.update.attribute_detail_name == ""){
            $scope.update.attribute_detail_name = [];
        }
        if($scope.update.image_url != null){
            $('.wrap-upload').find('img').attr('src', $scope.update.image_url);
        }else{
            $('.wrap-upload').find('img').attr('src', '');
        }
        $scope.update.price = $scope.viewPrice(String($scope.update.price));
        $scope.update.price_web = $scope.viewPrice(String($scope.update.price_web));
        $scope.update.price_cost = $scope.viewPrice(String($scope.update.price_cost));
        
        $scope.list_sub_groups = item.list_sub_groups;
        $scope.pagingSearch = {
            itemsPerPage: 30,
            offset: 0,
            to: 0,
            currentPage: 1,
            totalPage: 1,
            total: 0
        };
        $('#openUpdateWeb').modal('show');
        select2();
    }
    
    $scope.openInsertWeb = (item) => {
        $scope.update =  angular.copy(item);
        $scope.err = [];
        $scope.flag = 1;
        $scope.btn_flag = 1;
        $scope.search_domain = {};
        $scope.list_id_domain = [];
        $scope.domain.forEach((val) => {
            let arr = item.list_domain.filter(i => i.id == val.id);
            if(arr.length > 0){
                val.check_type = 1;
                $scope.list_id_domain.push(val.id);
                val.product_web_id = arr[0].product_web_id;
            }else{
                val.check_type = 0;
                val.product_web_id = 0;
            }
            val.err = 0;
            
        });
        $scope.domain_list = $scope.domain.sort(compare);
        $('#openInsertWeb').modal('show');
        select2();
    }

    $scope.check_domain = (item) => {
        if($scope.list_id_domain){
            if($scope.list_id_domain.indexOf(item.id) !== -1){
                return true;
            }
        }
        return false;
    }

    $scope.check_all = () => {
        if($scope.flag == 1){
            return false;
        }
        return true;
    }
    $scope.disable_domain = (item) => {
        if(item.check_type == 1){
            return true;
        }
        return false;
    }

    $scope.add_domain = (item) => {
        if($scope.list_id_domain.indexOf(item.id) !== -1){
            $scope.list_id_domain = $scope.list_id_domain.filter(i => i.id != item);
        }else{
            $scope.list_id_domain.push(item);
        }
    }

    $scope.all_domain = () => {
        if($scope.flag == 1){
            $scope.list_id_domain = [];
            $scope.domain.forEach((val) => {
                $scope.list_id_domain.push(val.id);
            });
            $scope.flag = 2;
        }else{
            $scope.list_id_domain = [];
            $scope.domain.forEach((val) => {
                if(val.check_type == 1){
                    $scope.list_id_domain.push(val.id);
                }
            });
            $scope.flag = 1;
        }
    }
    function compare( a, b ) {
        if ( a.check_type <= b.check_type ){
          return -1;
        }
        if ( a.check_type > b.check_type ){
          return 1;
        }
        return 0;
    }

    $scope.searchDomain = () => {
        $scope.search_domain.name.length += '';
        if(!$scope.search_domain.name && $scope.search_domain.name.length < 3){
            $scope.domain_list =  $scope.domain;
            return true;
        }
        $scope.domain_list = $scope.domain.filter(i => ToSlug(i.url).indexOf(ToSlug($scope.search_domain.name)) !== -1);
       
    }
    $scope.insertWebsite = () => {
        let data = {};
        data.product_id = $scope.update.id;
        data.name = $scope.update.description;
        data.name_en = $scope.update.description_usa;
        data.price = $scope.update.price;
        data.price_web = $scope.update.price_web;
        data.image_url = $scope.update.image_url;
        data.parent_id = $scope.update.parent_id;
        data.list_id_domain = [];
        $scope.domain.forEach((val) => {
            if(val.check_type == 0){
                let arr = $scope.list_id_domain.filter(i => i == val.id);
                if(arr.length > 0){
                    data.list_id_domain.push(val.id);
                }
            }
        });
        if(data.list_id_domain.length == 0){
            return toastr["error"]("Vui lòng chọn website");
        }
        $scope.loadInsert = true;
        $scope.btn_flag = 2;
        $http.post(base_url + 'products/insertWebsite',JSON.stringify(data)).then(r => {
            if (r.data.status == 1) {
                toastr["success"](r.data.message);
                $scope.err = r.data.data.err; 
                $scope.data_id = r.data.data.data;
                console.log($scope.domain);
                $scope.domain.forEach((val) => {
                    let arr = $scope.err.filter(i => i.id == val.id);
                    let arrId = $scope.data_id.filter(i => i.id == val.id);
                    if(arr.length > 0){
                        val.err = 1;
                    }
                    if(arrId.length > 0 && val.product_web_id == 0){
                        val.product_web_id = arrId[0].product_web_id;
                    }
                });
                $scope.getAll();
                select2();
            } else {
                toastr["error"](r.data.message);
                $scope.err = r.data.data;
                $scope.domain.forEach((val) => {
                    let arr = $scope.err.filter(i => i.id == val.id);
                    if(arr.length > 0){
                        val.err = 1;
                    }
                });
            }
            $scope.loadInsert = false;
        }).catch(e => {
            $scope.loadInsert = false;
            toastr["error"]("Đã có lỗi xảy ra với máy chủ API");
        });
    }

    $scope.openModalErr = () => {
        $('#openModalErr').modal('show');
        select2();
    }

    $scope.updateProduct = () => {
        $scope.loadInsert = true;
        let item = angular.copy($scope.update)
        item.image_url = $('.product-image-url').val();

        let price, price_web;
        if (item.price) {
            price = Number(item.price.replace(/,/g, ""));
        }

        if (item.price_web) {
            price_web = Number(item.price_web.replace(/,/g, ""));
        }

        if (item.description.length > 255) {
            toastr["error"]('Tên sản phẩm không được quá 255 ký tự');
            $scope.loadInsert = false;
            return;
        }
        else if (price >= price_web && item.price_web != 0) {
            toastr["error"]('Giá thị trường phải lớn hơn giá bán');
            $scope.loadInsert = false;
            return;
        }

        if (item.description_usa) {
            if (item.description_usa.length > 255) {
                toastr["error"]('Tên sản phẩm tiếng anh không được quá 255 ký tự');
                $scope.loadInsert = false;
                return;
            }
        }

        $http.post(base_url + 'products/save', JSON.stringify(item)).then(r => {
            if (r.data.status == 1) {
                $('#openUpdate').modal('hide');
                toastr["success"](r.data.message);
                $scope.getAll();
                select2();
            } else toastr["error"](r.data.message);
            $scope.loadInsert = false;
        }).catch(e => {
            $scope.loadInsert = false;
            toastr["error"]("Đã có lỗi xảy ra với máy chủ API");
        });
    }

    $scope.addAttributeCRM = (name, list) => {
        let check;
        check = list.filter(item => item == name);
        if (check.length == 0) {
            list.push(name);
        }
    }

    $scope.deleteAttribute = (name, list) => {
        $scope.update.attribute_detail_name = list.filter(item => item != name);
    }

    $scope.searchProductList = () => {
        if(!$scope.search_product.name && $scope.search_product.name.length < 3){
            $scope.list_product_sub_search = [];
            $scope.pagingSearch = {
                itemsPerPage: 30,
                offset: 0,
                to: 0,
                currentPage: 1,
                totalPage: 1,
                total: 0
            };
            return true;
        }
        if ($scope.filter_timer) {
            clearTimeout($scope.filter_timer);
        }
        $scope.filter_timer = setTimeout(() => {
            $scope.product = {};
            $scope.pagingSearch = {
                itemsPerPage: 30,
                offset: 0,
                to: 0,
                currentPage: 1,
                totalPage: 1,
                total: 0
            };
            $scope.product.limit = $scope.pagingSearch.itemsPerPage;
            $scope.product.offset = $scope.pagingSearch.offset;
            $scope._searchProductList($scope.search_product.name);
        }, 350);
        
    }

    $scope._searchProductList = (name) => {
        $scope.loadding_product = true;
        $scope.product.key = name;
        $scope.product.group_id = $scope.update.group_id;
        $scope.product.id = $scope.update.id;
        $scope.product.parent_id = $scope.update.parent_id;
        let url = 'products/get_product_list?filter=';
        $http.get(base_url + url + JSON.stringify($scope.product)).then(res => {
            if (res.data.status == 1) {
                $scope.list_product_sub_search = res.data.data.data;
                $scope.dem_item = 0;
                $scope.list_product_sub_search.forEach((element)=>{
                    $dem = $scope.list_sub_groups.filter(item => item.id == element.id);
                    if($dem.length == 0){
                        element.type = 0;
                    }else{
                        element.type = 1;
                        $scope.dem_item++;
                    }
                });
                $scope.pagingSearch.total = res.data.data.count;
                $scope.pagingSearch.totalPage = Math.ceil(res.data.data.count / pi.itemsPerPage);
                select2();
            } else toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
            $scope.loadding_product = false;
        });
    }

    $scope.chooseItemSearchProductList = (i) => {
        dem = $scope.list_sub_groups.filter(item => item.id == i.id);
        if(dem.length == 0){
            $scope.list_sub_groups.unshift(i);
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

    $scope.updateListWeb = () =>{
        $scope.loadInsert = true;
        $scope.data = {};
        $scope.data.product_id = $scope.update.id;
        $scope.data.parent_id = $scope.update.parent_id;
        $scope.data.price = $scope.update.price;
        $scope.data.price_web = $scope.update.price_web;
        $scope.data.data = [];
        $scope.data.delete = [];
        let dem = [];
        $scope.update.list_sub_groups.forEach((i) => {
            dem = $scope.list_sub_groups.filter(item => item.id == i.id);
            if(dem.length == 0){
                $scope.data.delete.push(i.id);
            }
        });
        $scope.list_sub_groups.forEach((item) => {
            if(item.id != $scope.update.id){
                $scope.data.data.push(item.id);
            }
        });

        let url = base_url + "products/update_list_web"; 
      
        $http.post(url,$scope.data).then((r) => {
            if (r.data && r.data.status == 1) {
                $scope.getAll();   
                $('#openUpdateWeb').modal('hide');          
                toastr['success']("Cập nhật thành công");                
            }else {
                toastr['error']("Cập nhật thất bại");
            } 
            $scope.loadInsert = false;
        }).catch(e => {
            toastr['error']("Đã có lỗi máy chủ API"); 
            $scope.loadInsert = false;
        });
        
    }

    $scope.openToken = () =>{
        $scope.dem = 0;
        $scope.loadInsert = false;
        $scope.error_website = [];
        $scope.error_crm = [];
        $('#openToken').modal('show');
        select2();
    }

    $scope.updateTokenWebsite = () =>{
        $scope.dem++;
        $scope.loadInsert = true;
        if($scope.dem == 1){
            let url = base_url + "products/updateTokenWebsite";
            $http.post(url).then((r) => {
                $scope.error_website = [];
                if (r.data && r.data.status == 1) {
                    toastr['success']('Cập nhật thành công');
                    $scope.token_website = r.data.data.token_website;                
                    $scope.error_website = r.data.data.data;
                    select2();
                }else  {
                    $scope.error_website = r.data.data.data;
                    toastr['error']('Cập nhật thất bại');
                }
                $scope.loadInsert = false;
                $scope.dem = 0;
            }).catch(e => {
                $scope.loadInsert = false;
                toastr["error"]("Đã có lỗi xảy ra với máy chủ API");
            });
        }
        if($scope.dem == 3){
            toastr['error']('Vui lòng chờ xử lý');
        }
    }
    
    $scope.updateTokenCRM = () =>{
        $scope.dem++;
        $scope.loadInsert = true;
        if($scope.dem == 1){
            let url = base_url + "products/updateTokenCRM";
            $http.post(url).then((r) => {
                $scope.error_crm = [];
                if (r.data && r.data.status == 1) {
                    toastr['success']('Cập nhật thành công');     
                    $scope.token_crm = r.data.data.token_crm;           
                    $scope.error_crm = r.data.data.data;
                    select2();
                }else{
                    $scope.error_crm = r.data.data.data;
                    toastr['error']('Cập nhật thất bại');
                }  
                $scope.loadInsert = false;
                $scope.dem = 0;
            }).catch(e => {
                $scope.loadInsert = false;
                toastr["error"]("Đã có lỗi xảy ra với máy chủ API");
            });
        }
        if($scope.dem == 3){
            toastr['error']('Vui lòng chờ xử lý');
        }
    }
    //
    $scope.updateProductActive = (value, e) => {
        e.preventDefault();
        swal({
            title: "Bạn có chắc?",
            text: "Bạn có chắc hành động chỉnh sửa này!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            cancelButtonText: 'Hủy',
            confirmButtonText: 'Đồng ý',
            allowOutsideClick: false,
        }, function () {
            let data = {};
            data.id = value.id;
            data.active = (value.active == 1) ? 0 : 1;
            $http.post(base_url + 'products/updateProductActive', JSON.stringify(data)).then(r => {
                if (r.data.status == 1) {
                    value.active = data.active;
                    toastr["success"](r.data.message);
                    $scope.loadding = false;
                } else toastr["error"](r.data.message);
            });
        });
    }

    //
    $scope.getInvetoryProduct = (item) => {
        console.log(item);
        $scope.prodInventory = {};
        $scope.invetory = {};
        $scope.invetory.nation_id = item.nation_id;
        $scope.invetory.product_id = item.id;
        $scope.invetory.product_type = item.type;
        $('#mdInven').modal('show');
        $scope.loadInsert = true;
        $http.post(base_url + 'products/api_get_inventory_product', JSON.stringify($scope.invetory)).then(r => {
            $scope.invetory.name = item.description;
            $scope.invetory.code = item.code;
            $scope.invetory.price = item.price_new;
            if (r.data.status == 1) {
                $scope.prodInventory = r.data.data;

                toastr["success"](r.data.message);
                select2();
            } else toastr["error"](r.data.message);
            $scope.loadInsert = false;
        });

    }
    //
    $scope.getProductGroup = () => {
        $http.get(base_url + 'products/get_product_group').then(r => {
            if (r.data.status == 1) {
                $scope.list_product_groups = r.data.data;
                select2();
            } else toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
        });
    }

    $scope.getProductUnits = () => {
        $http.get(base_url + 'products/get_product_units').then(r => {
            if (r.data.status == 1) {
                $scope.list_product_units = r.data.data;
                select2();
            } else toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
        });
    }

    $scope.getProductAttributes = () => {
        $http.get(base_url + 'products/get_product_attributes').then(r => {
            if (r.data.status == 1) {
                $scope.list_product_attributes = r.data.data;
                select2();
            } else toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
        });
    }
    
    $scope.linkToDetail = (item) =>{
        window.open('https://'+item.url+'/?post_type=product&preview=true&p='+item.product_web_id);
    }

    $scope.converHtmlKPI = (value) => {
        return $sce.trustAsHtml(value);
    }
    $scope.viewPrice = (item) => {
        let val = item;
        val = val.replace(/,/g, "");
        val += '';
        x = val.split('.');
        x1 = x[0];
        x2 = x.length > 1 ? '.' + x[1] : '';
        let rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
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


    $scope.go3Page = function (page) {
        if (page < 0) return;
        var pi2 = $scope.pagingSearch;
        pi2.currentPage = page;
        pi2.from = pi2.offset = (pi2.currentPage - 1) * pi2.itemsPerPage;
        $scope.product.limit = $scope.pagingSearch.itemsPerPage;
        $scope.product.offset = ($scope.pagingSearch.currentPage - 1) * $scope.pagingSearch.itemsPerPage;
        $scope._searchProductList($scope.search_product.name);
        pi2.to = pi2.total < pi2.itemsPerPage ? pi2.total : pi2.itemsPerPage;
    }

    $scope.Previous2 = function (page) {
        if (page - 1 > 0) $scope.go3Page(page - 1);
        if (page - 1 == 0) $scope.go3Page(page);
    }
    //end paging

    $('#file_image_url').on('change', function () {
        var input = this;
        var formData = new FormData();
        if (input.files.length) {
            var arrType = [
                'image/jpg',
                'image/png',
                'image/jpeg'
            ],
                file = input.files[0];

            if (!arrType.includes(file.type)) {
                showMessErr(`File ${file.name} sai định dạng`);
                input.value = '';
                return;
            }
        }
        input.value = '';

        formData.append('file', file);
        formData.append('folder', 'product');
        $.ajax({
            url: base_url + 'uploads/ajax_upload_to_filehost?func=product_index',
            method: 'post',
            dataType: 'text',
            processData: false,
            crossOrigin: false,
            contentType: false,
            data: formData,
            beforeSend() {
                $('.wrap-upload').addClass('loading');
            },
            success(r) {
                r = JSON.parse(r);
                if (r.status) {
                    $('[name="image_url"]').val(r.data[0]);
                    $('.wrap-upload').find('img').attr('src', r.data[0]);
                } else {
                    showMessErr(r.message);
                }
            },
            complete() {
                $('.wrap-upload').removeClass('loading');
            },
            error() {
                showMessErrSystem();
            }
        })
    })

    $('#file_image_url_update').on('change', function () {
        var input = this;
        var formData = new FormData();
        if (input.files.length) {
            var arrType = [
                'image/jpg',
                'image/png',
                'image/jpeg'
            ],
                file = input.files[0];

            if (!arrType.includes(file.type)) {
                showMessErr(`File ${file.name} sai định dạng`);
                input.value = '';
                return;
            }
        }
        input.value = '';

        formData.append('file', file);
        formData.append('folder', 'product');
        $.ajax({
            url: base_url + 'uploads/ajax_upload_to_filehost?func=product_index',
            method: 'post',
            dataType: 'text',
            processData: false,
            crossOrigin: false,
            contentType: false,
            data: formData,
            beforeSend() {
                $('.wrap-upload').addClass('loading');
            },
            success(r) {
                r = JSON.parse(r);
                if (r.status) {
                    $('[name="image_url"]').val(r.data[0]);
                    $('.wrap-upload').find('img').attr('src', r.data[0]);
                } else {
                    showMessErr(r.message);
                }
            },
            complete() {
                $('.wrap-upload').removeClass('loading');
            },
            error() {
                showMessErrSystem();
            }
        })
    })
});
function removeImage() {
    swal({
        title: "Thông báo",
        text: "Bạn có chắc hành động này!",
        type: "warning",
        showCancelButton: true,
        confirmButtonClass: "btn-danger",
        confirmButtonText: "Xác nhận",
        cancelButtonText: "Đóng",
    },
        function () {
            $('.wrap-custom-upload img').attr('src', '');
            $('[name="image_url"]').val('');
        });
}

function ToSlug(title) {
    if (title == '') return '';
    //Đổi chữ hoa thành chữ thường
    slug = title.toLowerCase();

    //Đổi ký tự có dấu thành không dấu
    slug = slug.replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a');
    slug = slug.replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e');
    slug = slug.replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i');
    slug = slug.replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o');
    slug = slug.replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u');
    slug = slug.replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, 'y');
    slug = slug.replace(/đ/gi, 'd');
    //Xóa các ký tự đặt biệt
    slug = slug.replace(/\`|\~|\!|\@|\#|\||\$|\%|\^|\&|\*||∣|\+|\=|\,|\.|\/|\?|\>|\<|\'|\"|\:|\;|_/gi, '');
    //Đổi khoảng trắng thành ký tự gạch ngang
    //slug = slug.replace(/ /gi, " - ");
    //Đổi nhiều ký tự gạch ngang liên tiếp thành 1 ký tự gạch ngang
    //Phòng trường hợp người nhập vào quá nhiều ký tự trắng
    slug = slug.replace(/\-\-\-\-\-/gi, '-');
    slug = slug.replace(/\-\-\-\-/gi, '-');
    slug = slug.replace(/\-\-\-/gi, '-');
    slug = slug.replace(/\-\-/gi, '-');
    //Xóa các ký tự gạch ngang ở đầu và cuối
    slug = '@' + slug + '@';
    slug = slug.replace(/\@\-|\-\@|\@/gi, '');
    return slug
}