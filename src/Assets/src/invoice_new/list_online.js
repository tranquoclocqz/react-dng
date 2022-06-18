const _url = base_url + 'invoice_new/',
    _obj_tab_transaction = function () {
        return {
            type: 'mpos',
        }
    },
    _obj_search_list_verify_payment = function () {
        return {
            key: '',
            date_start: moment(today_default, 'YYYY-MM-DD').add(-1, 'days').format('YYYY-MM-DD HH:mm:ss'),
            date_end: moment(today_default, 'YYYY-MM-DD').endOf('day').format('YYYY-MM-DD HH:mm:ss'),
            offset: -5,
            limit: 5,
            load: false,
        }
    },
    _obj_list_visa_trans = function () {
        return {
            key: '',
            date_end: '',
            offset: -10,
            limit: 10,
            load: false,
            list: [],
            list_df: [],
        }
    },
    _obj_mpos = () => {
        return {
            code: '',
            price: '',
            load: false
        }
    },
    _obj_bank = () => {
        return {
            id: '0',
            code: '',
            price: '',
            verify_payment_id: 0,
            image_url: '',
            confirm_type: 'image',
            load: false,
        }
    },
    _obj_vnpay = () => {
        return {
            code: '',
            price: '',
            check: false,
            payDate: '',
            load: false
        }
    },
    _obj_invoice = function () {
        return {
            load: true,
            invoice_id: 0,
            date: '',
            province_id: '0',
            district_id: '0',
            ward_id: '0',
            total: 0,
            visa: 0,
            price: 0,
            discount: 0,
            discount_type: 'amount',
            discount_change: 0,
            total_quatity: 0,
            ship_price: 0,
            shipper_id: '0',
            sale_user_id: '0',
            note: '',
            note_print: '',
            list_result: {
                products: [],
                services: [],
                units: [],
                debits: [],
                packages: [],
            },
            obj_edit: {
                product: {}
            },
            transaction: {
                list_mpos: [],
                mpos: _obj_mpos(),

                vnpay: _obj_vnpay(),
                list_vnpay: [],

                bank: _obj_bank(),
                list_bank: [],
            },
            customer_id: 0,
            customer_phone: '',
            customer_name: '',
            fullAddress: '',
            name: '',
            phone: '',
        }
    };
var handler_invoice_tgld = company_id == 4 && [2403].includes(cr_user_id);
$('.alert-dismissible').remove();
app = angular.module('app', ['ui.mention']);
app.run(function ($rootScope) {
    $rootScope.post = {
        message: ""
    };
})
app.controller('onlineListCtrl', function ($scope, $http, $compile, $sce) {
    var pi = $scope.pagingInfo2 = {
        itemsPerPage: 30,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };
    $scope.init = () => {
        $scope.$mentions = {};
        $scope.choices = [{
            'first': 'f',
            'last': 'f',
            'id': 0
        }];

        $scope.cur_tab = -1;
        $scope.is_mobile = is_mobile;
        $scope.date_bw_today = date_bw_today;
        $scope.load_list = true;
        $scope.load_address = false;
        $scope.all_stores = all_stores;
        $scope.user_per_store_ids = user_per_store.map(x => Number(x.id));
        $scope.resetSearchList();
        $scope.lists = {};
        $scope.getListWarehouseStocks();
        $scope.getListStatus();
        $scope.resetSearchProduct();
        $scope.resetEditStatus();
        $scope.resetListInvoiceImage()
        $scope.resetEditCreateOrder();
        $scope.resetMoneyCheck();
        $scope.resetChangeStoreInvoice();
        $scope.resetSearchUserCollaborator();
        $scope.resetConfirmCancel();
        $scope.resetMap();
        $scope.resetListInvoiceDelivery();
        $scope.cashbook_bank = banks;
        $scope.vnpay = vnpay;
        $scope.is_accountant = is_accountant;
        $scope.is_act_inventory = is_act_inventory;
        $scope.is_dev = is_dev;
        $scope.cr_user_id = cr_user_id;
        $scope.is_admin = is_admin;
        $scope.is_consultant = is_consultant;
        $scope.is_only_assistantmanager = is_only_assistantmanager;
        $scope.transport_types = [{
                type: 'road',
                name: 'Đường bộ',
            },
            {
                type: 'fly',
                name: 'Đường bay',
            },
            {
                type: 'xfast',
                name: 'Xfast',
            },
        ];
        $scope.obj_invoice = {};
        $scope.shippers = [];
        $scope.parseInt = parseInt;
        select2();
        $scope.activeTab2 = 2;
        $scope.mobileStep = 0;
    };

    $scope.searchTransCode = (item) => {
        var key = item.trans_code_edit;
        item.obj_trans_exist = null;
        if (key.length < 5) return true;

        if ($scope.filter_timer) {
            clearTimeout($scope.filter_timer);
        }
        $scope.filter_timer = setTimeout(() => {
            $scope._searchTransCode(item);
        }, 350);
    }

    $scope._searchTransCode = (item) => {
        var data_rq = {
            trans_code: item.trans_code_edit,
            id: item.id > 0 ? item.id : 0,
        };
        item.load_search_trans_code = true;
        $http.get(_url + 'ajax_check_trans_code?' + $.param(data_rq)).then(r => {
            if (r.data && r.data.status) {
                var data = r.data.data;
                item.obj_trans_exist = data;
            } else {
                showMessErr(r.data.message);
            }
            item.load_search_trans_code = false;
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope.chooseItemVisaTransaction = (value) => {
        var item = angular.copy(value);

        $scope.obj_invoice.transaction.bank.choose_visa_trans = item;
        var _exit_bank = $scope.cashbook_bank.find(x => x.id == item.bank_id);
        if (_exit_bank) {
            $scope.obj_invoice.transaction.bank.id = item.bank_id;
        } else {
            showMessErr('Ngân hàng khách thanh toán không phù hợp.');
            return;
        }
        $scope.obj_invoice.transaction.bank.price = parseNumber(item.amount_remain);
        $scope.obj_invoice.transaction.bank.model_manual = true;
    }

    $scope.removeChooseItemVisaTransaction = () => {
        Swal.fire({
            title: "Bạn có chắc chắn?",
            html: 'Bỏ chọn giao dịch này',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            cancelButtonText: 'Hủy',
            confirmButtonText: 'Đồng ý',
            allowOutsideClick: false,
        }).then((result) => {
            if (result.isConfirmed) {
                $scope.$apply(() => {
                    $scope.obj_invoice.transaction.bank.choose_visa_trans = {};
                });
            }
        });
    }

    $scope.resetListVisaTransactions = () => {
        var key = $scope.obj_list_visa_trans && $scope.obj_list_visa_trans.key ? $scope.obj_list_visa_trans.key : '';
        $scope.obj_list_visa_trans = _obj_list_visa_trans();
        $scope.obj_list_visa_trans.key = key;
    }

    $scope.sumbitGetListVisaTransactions = () => {
        $scope.resetListVisaTransactions();
        $scope._getListVisaTransactions();
    }

    $scope.scollMoreListVisaTrans = (e) => {
        var self = $(e);
        div = self.get(0);
        if (div.scrollTop + div.clientHeight >= div.scrollHeight) {
            $scope._getListVisaTransactions();
        }
    }

    $scope._getListVisaTransactions = () => {
        if ($scope.obj_list_visa_trans.offset >= 0) {
            if ($scope.obj_list_visa_trans.list.length != $scope.obj_list_visa_trans.offset + $scope.obj_list_visa_trans.limit) {
                return;
            }
        }
        $scope.obj_list_visa_trans.offset += $scope.obj_list_visa_trans.limit;
        $scope.obj_list_visa_trans.load = true;
        $scope.obj_list_visa_trans.date_end = angular.copy($scope.obj_invoice.date);
        var obj_search = angular.copy($scope.obj_list_visa_trans);
        obj_search.list = [];
        obj_search.list_df = [];

        $http.get(_url + 'ajax_get_list_visa_transaction?' + $.param(obj_search)).then(r => {
            if (r.data && r.data.status) {
                let data = r.data.data,
                    _list = angular.copy($scope.obj_list_visa_trans.list);
                $.each(data, function (index, value) {
                    value.transfer_time = moment(value.transfer_date, 'YYYY-MM-DD HH:mm:ss').format('HH:mm');
                    value.transfer_date = moment(value.transfer_date, 'YYYY-MM-DD HH:mm:ss').format('DD/MM/YYYY HH:mm');
                    value.payment_identifier = value.payment_identifier ? value.payment_identifier : '---';
                });
                _list.push(...data);
                $scope.obj_list_visa_trans.list = _list;
                $scope.obj_list_visa_trans.list_df = _list;
            } else {
                showMessErr(r.data.message);
            }
            $scope.obj_list_visa_trans.load = false;
        }, function (data, status, headers, config) {
            showMessErrSystem()
        });
    }

    $scope.clearEditInPopupVisa = () => {
        $scope.obj_invoice.transaction.mpos = _obj_mpos();
        $scope.obj_invoice.transaction.vnpay = _obj_vnpay();
        $scope.obj_invoice.transaction.bank = _obj_bank();
    }

    $scope.resetMap = () => {
        $scope.obj_map = {
            map: false,
            markers: [],
            infowindow: [],
            list_shipper: [],
            obj_choose: {},
            choose_shipeper_id: 0
        }
    }

    $scope.chooseShipperInMap = (shipper_id) => {
        $scope.resetListInvoiceDelivery();
        $scope.obj_map.choose_shipeper_id = shipper_id;
        $scope.obj_invoice_delivery.shipper_info = $scope.obj_map.shipper_delivery.find(x => x.id == shipper_id);
        $scope.chooseTabInInvoiceDelivery();
    }

    $scope.resetListInvoiceDelivery = () => {
        $scope.obj_invoice_delivery = {
            load: false,
            shipper_id: 0,
            shipper_info: {},
            list: [],
            tab: 'wait',
            ship_status_id: [],
            offset: 0,
            limit: 20,
        }
    }

    $scope.chooseTabInInvoiceDelivery = (tab = '') => {
        $scope.obj_invoice_delivery.tab = tab ? tab : $scope.obj_invoice_delivery.tab;
        $scope.getListInvoiceDelivery();
    }

    $scope.getListInvoiceDelivery = () => {
        var data_rq = angular.copy($scope.obj_invoice_delivery),
            tab = data_rq.tab;

        data_rq.shipper_id = $scope.obj_map.choose_shipeper_id;
        if (tab == 'wait') { // chưa nhận
            data_rq.ship_status_id = [1];
        } else if (tab == 'delivering') { // đang giao
            data_rq.ship_status_id = [2];
        } else if (tab == 'delivered') { //  Đã giao thành công
            data_rq.ship_status_id = [3, 4, 5]; // 3: Đã chuyển hoàn, 4: Đã đối soát, 5: Giao thành công
        }

        $scope.obj_invoice_delivery.load = true;
        $http.post(_url + 'ajax_get_list_delivery_invoice_online', data_rq).then(r => {
            if (r.data && r.data.status) {
                var data = r.data.data;

                $.each(data, function (index, value) {
                    value.created = moment(value.created).format('DD/MM/YYYY HH:mm');
                    value.delivery_time = value.delivery_time ? moment(value.delivery_time).format('DD/MM/YYYY HH:mm') : value.delivery_time;
                    value.ship_status_id += '';
                    value.ship_status_name = shipStatusInfo(value.ship_status_id).name;
                    value.ship_status_class_name = shipStatusInfo(value.ship_status_id).class_name;
                    value.phone = '****' + value.phone.slice(-6);
                });
                $scope.obj_invoice_delivery.lists = data;
            } else {
                showMessErr(r.data.message);
            }
            $scope.obj_invoice_delivery.load = t = false;
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope.getShipperDelivery = () => {
        if ($scope.cur_tab != 4) return;

        $http.get(base_url + 'warehouse_shipper/ajax_get_shipper_delivery').then(r => {
            if (r.data && r.data.status) {
                $scope.obj_map.shipper_delivery = r.data.data;

                $.each($scope.obj_map.shipper_delivery, function (index, value) {
                    value.latitude = value.latitude ? Number(value.latitude) : null;
                    value.longitude = value.longitude ? Number(value.longitude) : null;

                    value.updated_at_df = value.updated_at;
                    value.updated_at = value.updated_at ? moment(value.updated_at).format('DD/MM/YYYY HH:mm:ss') : '---';
                    value.created = moment(value.created).format('DD/MM/YYYY HH:mm:ss');

                    var start = moment(value.updated_at_df),
                        end = moment(),
                        duration = moment.duration(end.diff(start)),
                        diff_h = duration.asHours();

                    value.visible_marker = diff_h <= 2 && (value.latitude && value.longitude); // hiện logo

                    if ($scope.obj_map.choose_shipeper_id == value.id) {
                        $scope.obj_invoice_delivery.shipper_info = value;
                    }
                });

                if ($scope.obj_map.markers.length) { // có khởi tạo điểm r. thì hàm này sẽ update lai vị trí
                    $.each($scope.obj_map.shipper_delivery, function (index, value) {
                        var _id = value.id;
                        if ($scope.obj_map.markers[_id]) {
                            $scope.obj_map.markers[_id].setPosition(new google.maps.LatLng(value.latitude, value.longitude));
                        } else {
                            $scope.obj_map.markers[_id] = new CustomMarker(new google.maps.LatLng(value.latitude, value.longitude), $scope.obj_map.map, value.logo, _id)
                        }

                        setTimeout(() => { //time 500 vì đợi g map no vẽ ra
                            $scope.obj_map.markers[_id].setVisible(value.visible_marker);
                        }, 500);
                    });
                } else {
                    $scope.initMap();
                }

                if ($scope.time_gps) clearTimeout($scope.time_gps);
                $scope.time_gps = setTimeout(() => {
                    $scope.getShipperDelivery();
                    $scope.$apply();
                }, 30000);
            } else {
                showMessErr('Không lấy được danh sách nhà vận chuyển');
            }
        }, function (data, status, headers, config) {
            showMessErr('Không lấy được danh sách nhà vận chuyển');
        });
    }

    $scope.initMap = () => {
        var shipper_delivery = angular.copy($scope.obj_map.shipper_delivery);

        $scope.obj_map.map = new google.maps.Map(document.getElementById('map_wrapper'), {
            zoom: 11,
            center: new google.maps.LatLng(latitude_df, longitude_df), // seoulcenter
            mapId: 'c7af3225c4854370',
            gestureHandling: "greedy", // zoom not use Ctrl
        });
        for (let i = 0; i < shipper_delivery.length; i++) {
            const value = shipper_delivery[i],
                _id = value.id;

            $scope.obj_map.markers[_id] = new CustomMarker(new google.maps.LatLng(value.latitude, value.longitude), $scope.obj_map.map, value.logo, _id)
            setTimeout(() => {
                $scope.obj_map.markers[_id].setVisible(value.visible_marker);
            }, 350);
        }
    }

    function CustomMarker(latlng, map, imageSrc, id) {
        this.latlng_ = latlng;
        this.imageSrc = imageSrc;
        this.setMap(map);
        this.id = id;
    }

    CustomMarker.prototype = new google.maps.OverlayView();

    CustomMarker.prototype.draw = function () {
        // Check if the div has been created.
        var self = this,
            div = self.div_,
            _id = self.id;

        if (!div) {
            div = self.div_ = document.createElement('div');
            div.className = "customMarker marker-" + _id;

            var img = document.createElement("img");
            img.src = self.imageSrc;
            div.appendChild(img);
            var me = self;
            google.maps.event.addDomListener(div, "click", function () {
                var cr_shipper = $scope.obj_map.shipper_delivery.find(x => x.id == _id),
                    _html = `<b>${cr_shipper.name}</b>` + (cr_shipper.phone ? `<br><i class="fa fa-phone"></i> ${cr_shipper.phone}` : '') + `<br><i class="fa fa-clock-o"></i> ${cr_shipper.updated_at}`;

                // var infowindow = new google.maps.InfoWindow({
                //     id: _id,
                //     content: _html,
                //     position: self.getPosition()
                // });
                // infowindow.open($scope.obj_map.map);
                $scope.chooseShipperInMap(_id);
                google.maps.event.trigger(me, "click");

                // if ($scope.obj_map.map.getZoom() < 16) $scope.obj_map.map.setZoom(16);
                // $scope.obj_map.map.setCenter(self.getPosition());
            });

            var panes = self.getPanes();
            panes.overlayImage.appendChild(div);
        }

        var point = self.getProjection().fromLatLngToDivPixel(self.latlng_);
        if (point) {
            div.style.left = point.x + 'px';
            div.style.top = point.y + 'px';
        }
    };

    CustomMarker.prototype.remove = function () {
        if (this.div_) {
            this.div_.parentNode.removeChild(this.div_);
            this.div_ = null;
        }
    };

    CustomMarker.prototype.setVisible = function (visible) {
        if (this.div_) {
            if (visible) {
                this.div_.style.display = 'table';
                this.visible = true;
            } else {
                this.div_.style.display = 'none';
                this.visible = false;
            }
        }
    };

    CustomMarker.prototype.getVisible = function () {
        return this.visible;
    };

    CustomMarker.prototype.setPosition = function (position) {
        this.latlng_ = position;
        var point = this.getProjection().fromLatLngToDivPixel(this.latlng_);
        if (point) {
            this.div_.style.left = point.x + 'px';
            this.div_.style.top = point.y + 'px';
        }
    };

    CustomMarker.prototype.getPosition = function () {
        return this.latlng_;
    };

    $scope.openPopupAddShipPrice = (value) => {
        $scope.obj_add_ship_price = angular.copy(value);
        $scope.obj_add_ship_price.ship_price = '';
        $scope.obj_add_ship_price.cr_item = value;
        $('#modal_add_ship_price').modal('show');
        setTimeout(() => {
            $('#modal_add_ship_price input').focus();
        }, 250);
    }

    $scope.addShipPrice = () => {
        var _obj = angular.copy($scope.obj_add_ship_price),
            ship_price = formatDefaultNumber(_obj.ship_price);

        if (!ship_price) {
            showMessErr('Phí ship phải lớn hơn 0');
            return;
        }

        $scope.obj_add_ship_price.load = true;
        $http.post(_url + 'ajax_update_ship_price', {
            invoice_id: _obj.invoice_id,
            ship_price: ship_price
        }).then(r => {
            if (r.data && r.data.status) {
                var data = r.data.data;
                showMessSuccess();
                $('#modal_add_ship_price').modal('hide');
                $scope.obj_add_ship_price.cr_item.total = data.total;
                $scope.obj_add_ship_price.cr_item.ship_price = data.ship_price;
            } else {
                showMessErr(r.data.message);
            }
            $scope.obj_add_ship_price.load = false;
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });

    }

    $scope.parseNumToArr = (number) => {
        var arr = [];
        for (let i = 1; i <= number; i++) {
            arr.push(i);
        }
        return arr;
    }

    // $scope.updateDeliveryTime = (value) => {
    //     var delivery_time = $('.datetimepicker-' + value.invoice_id).val(),
    //         created = moment(value.created, 'DD/MM/YYYY HH:mm');
    //     if (!delivery_time) {
    //         showMessErr('Thời gian giao hàng không được bỏ trống');
    //         return;
    //     }

    //     delivery_time = moment(delivery_time, 'DD/MM/YYYY HH:mm');
    //     if (delivery_time < created) {
    //         showMessErr('Thời gian giao hàng không thể bé hơn thời gian tạo đơn');
    //         return;
    //     }
    //     var del_time_rq = delivery_time.format('YYYY-MM-DD HH:mm'),
    //         data_rq = {
    //             invoice_id: value.invoice_id,
    //             delivery_time: del_time_rq,
    //         };
    //     value.load = true;
    //     $http.post(_url + 'ajax_update_delivery_time', data_rq).then(r => {
    //         if (r.data && r.data.status) {
    //             showMessSuccess();
    //             value.delivery_time_df = del_time_rq;
    //             value.delivery_time = moment(del_time_rq, 'YYYY-MM-DD HH:mm:ss').format('DD/MM/YYYY');
    //             value.edit_delivery_time = false;
    //         } else {
    //             showMessErr(r.data.message);
    //         }
    //         value.load = false;
    //     }, function (data, status, headers, config) {
    //         showMessErrSystem();
    //     });
    // }
    $scope.updateDeliveryTime = (value) => {
        var del_time_rq = moment(value.delivery_time, 'DD/MM/YYYY').format('YYYY-MM-DD') + ' ' + moment().format('HH:mm:ss'),
            data_rq = {
                invoice_id: value.invoice_id,
                delivery_time: del_time_rq,
            };
        value.load = true;
        $http.post(_url + 'ajax_update_delivery_time', data_rq).then(r => {
            if (r.data && r.data.status) {
                showMessSuccess();
                value.edit_delivery_time = false;
            } else {
                showMessErr(r.data.message);
            }
            value.load = false;
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope.toggleEditDeliveryTime = (value) => {
        if (value.edit_delivery_time) {
            value.edit_delivery_time = false;
        } else {
            value.edit_delivery_time = true;
            $('.datepicker-' + value.invoice_id).datepicker({
                minDate: new Date(value.created_df)
            });
            setTimeout(() => {
                $('.datepicker-' + value.invoice_id).datepicker("show");
            }, 0);
        }
    }
    // $scope.toggleEditDeliveryTime = (value) => {
    //     if (value.edit_delivery_time) {
    //         value.edit_delivery_time = false;
    //     } else {
    //         value.edit_delivery_time = true;
    //         var _vertical = value.is_last_child ? 'top' : 'bottom';
    //         $('.datetimepicker-' + value.invoice_id).datetimepicker().data("DateTimePicker").destroy();
    //         setTimeout(() => {
    //             $('.datetimepicker-' + value.invoice_id).datetimepicker({
    //                 date: value.delivery_time_df,
    //                 format: 'DD/MM/YYYY HH:mm',
    //                 minDate: moment(value.created_df).format('YYYY-MM-DD'),
    //                 widgetPositioning: {
    //                     horizontal: 'left',
    //                     vertical: _vertical,
    //                 },
    //             }).on('dp.show', function (e) {
    //                 $(this).parent().find('.bootstrap-datetimepicker-widget [title]').removeAttr('title');
    //             });

    //             $('.datetimepicker-' + value.invoice_id).datetimepicker("show");
    //         }, 0);
    //     }
    // }

    $('.table-content, #chat-modal').on('focus', '.create-child-task ', function () {
        $(this).parent().addClass('active');
    })
    $('.table-content, #chat-modal').on('focusout', '.create-child-task ', function () {
        $(this).parent().removeClass('active');
    })

    $scope.converHtml = (htmlbd) => {
        return $sce.trustAsHtml(htmlbd);
    }
    $scope.$watch('post.message', function () {
        setTimeout(() => {
            let height = $('#chat-container .msger-inputarea').outerHeight();
            height += 59;
            $('#chat-container #chat').css('height', 'calc(100% - ' + height + 'px');
        }, 10);
    });
    $scope.changeMobileStep = (value = 0) => {
        $scope.mobileStep = value;
    }
    $scope.getchat = (item, is_mess = false) => {
        $scope.chatopening = false;
        item.seen = 1;
        if (item.chatbox) {
            item.chatbox = false;
            return true;
        }
        $scope.post.message = "";
        $('#chat-container #chat').css('height', 'calc(100% - 112px');
        if (is_mess) $scope.chatopening = true;
        angular.forEach($scope.lists, function (value, key) {
            $scope.lists[key].chatbox = false;
        });
        angular.forEach($scope.chat_list, function (value, key) {
            $scope.chat_list[key].chatbox = false;
        });
        let data = {};
        data.invoice_id = item.invoice_id;
        $http.get(_url + 'get_invoice_chat_content?filter=' + JSON.stringify(data)).then(r => {
            if (r && r.data.status == 1) {
                item.chat_list = r.data.data;
                item.chatbox = true;
                item.unread_message = 0;
                if ($scope.activeTab == 1 || $scope.activeTab == 2) {
                    $scope.changeMobileStep(1);
                    $scope.itemDetail = angular.copy(item);
                    $scope.itemDetail.invoice_detail = r.data.invoice_detail;
                    $scope.itemDetail.participants = r.data.participants;
                } else {
                    if ($scope.is_mobile) $scope.chatdetails = item;
                    $scope.chatMobile = true;
                    setTimeout(() => {
                        $('#chat-modal').modal('show');
                    }, 100);
                }
                autoSize();
                $scope.choices = r.data.users;
                scrollChat();
            } else toastr["error"]('Đã có lỗi xảy ra!');
        })
    }

    function scrollChat() {
        setTimeout(() => {
            if ($(".chat-scroll").length > 0) {
                $(".chat-scroll").scrollTop($(".chat-scroll")[0].scrollHeight);
            }
            if ($(".chat-scroll2").length > 0) {
                $(".chat-scroll2").animate({
                    scrollTop: $(".chat-scroll2")[0].scrollHeight
                }, 300);
            }
            if ($(".chat-scroll3").length > 0) {
                $(".chat-scroll3").scrollTop($(".chat-scroll3")[0].scrollHeight);
            }
            $('.create-child-task').focus();
        }, 100);
    }

    function get_list_id(text) {
        let temp = text.split(' ');
        let list = [];
        for (let index = 0; index < temp.length; index++) {
            if (temp[index].includes('$#$')) {
                list.push(temp[index].replace('$#$', ''));
            }
        }
        return list;
    }
    $scope.sendMessages = (item, extendClass = '') => {
        item.newMess = $('.mention-highlight' + extendClass).html();
        if (!item.newMess || item.newMess.trim() == "") return false;
        let data = {};
        data.invoice_id = item.invoice_id;
        data.messages = item.newMess;
        data.text = $('.mention-highlight').text();
        data.customer_name = item.customer_name;
        data.customer_phone = item.customer_phone;
        data.total = item.total;
        data.participant_id = item.participant_id;
        data.mentionids = get_list_id($scope.post.message);
        if ($scope.sending) return false;
        $scope.sending = true;
        $http.post(_url + 'ajax_send_invoice_messages', data).then(r => {
            delete $scope.sending;
            if (r && r.data.status == 1) {
                item.chat_list = r.data.data.data;
                if ($scope.is_mobile) {
                    $scope.chatdetails = item;
                }
                delete item.newMess;
                $scope.post.message = "";
                setTimeout(() => {
                    $("#chat").animate({
                        scrollTop: $("#chat")[0].scrollHeight
                    }, 300);
                }, 100);
                scrollChat();
            } else toastr["error"](r.data.messages);
        })
    }
    // tag invoice
    $scope.removeInvoiceTagLog = (tag) => {
        $http.post(_url + 'ajax_remove_invoice_tag_logs', {
            id: tag.id
        }).then(r => {
            if (r.data && r.data.status) {
                showMessSuccess('Xóa tag thành công');
                $scope.getListInvoiceTagLog();
            } else {
                showMessErr(r.data.message);
            }
            Swal.close();
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope.addInvoiceTag = (invoice, tag) => {
        var item = angular.copy(invoice),
            tag_id = tag.id;

        $http.post(_url + 'ajax_add_invoice_tag_logs', {
            invoice_id: item.invoice_id,
            tag_id: tag_id,
        }).then(r => {
            if (r.data && r.data.status) {
                showMessSuccess('Thêm tag thành công');
                $scope.getListInvoiceTagLog();
            } else {
                showMessErr(r.data.message);
            }
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope.getListInvoiceTag = () => {
        $scope.invoice_tag = [];
        $http.get(_url + 'ajax_get_list_invoice_tags').then(r => {
            if (r.data && r.data.status) {
                let data = r.data.data;
                $scope.invoice_tags = data;
            } else {
                showMessErr(r.data.message);
            }
            select2(100);
        }, function (data, status, headers, config) {
            showMessErrSystem('Không thể lấy danh sách tag');
        });
    }

    $scope.getListInvoiceTagLog = () => {
        var invoice_ids = $scope.lists.map(x => x.invoice_id);
        if (!invoice_ids.length) return;

        $http.post(_url + 'ajax_get_list_invoice_tag_logs', {
            invoice_ids: invoice_ids
        }).then(r => {
            if (r.data && r.data.status) {
                let data = r.data.data,
                    tab_log = [];
                $.each(data, function (key, value) {
                    if (typeof tab_log[value.invoice_id] == 'undefined') {
                        tab_log[value.invoice_id] = [];
                    }
                    tab_log[value.invoice_id].push(value);
                });

                angular.forEach($scope.lists, function (value, key) {
                    value.invoice_tag_logs = [];
                    var invoice_id = value.invoice_id;
                    if (typeof tab_log[invoice_id] != 'undefined') {
                        value.invoice_tag_logs = tab_log[invoice_id];
                    }
                });
            } else {
                showMessErr(r.data.message);
            }
        }, function (data, status, headers, config) {
            showMessErrSystem('Không thể lấy danh sách tag');
        });
    }

    //tab
    $scope.resetChooseTypeTransactions = () => {
        $scope.obj_tab_transaction = _obj_tab_transaction();
    }

    $scope.chooseTabTransaction = (type) => {
        $scope.obj_tab_transaction.type = type;
        if (type == 'bank' && !$scope.obj_list_visa_trans.list_df.length) {
            $scope.sumbitGetListVisaTransactions();
        }
    }

    $scope.resetSearchListVerifyPayment = () => {
        $scope.list_verify_payments = [];
        var key = angular.copy(typeof $scope.obj_search_list_verify_payment != 'undefined' ? $scope.obj_search_list_verify_payment.key : '');
        $scope.obj_search_list_verify_payment = _obj_search_list_verify_payment();
        $scope.obj_search_list_verify_payment.key = key;
    }

    $scope.submitGetListVerifyPayment = () => {
        $scope.resetSearchListVerifyPayment();
        $scope.getListVerifyPayment();
    }

    $scope.loadMoreListVerifyPayment = (e) => {
        var self = $(e);
        div = self.get(0);
        if (div.scrollTop + div.clientHeight >= div.scrollHeight) {
            $scope.getListVerifyPayment();
        }
    };

    $scope.getListVerifyPayment = () => {
        if ($scope.obj_search_list_verify_payment.offset >= 0) {
            if ($scope.list_verify_payments.length != $scope.obj_search_list_verify_payment.offset + $scope.obj_search_list_verify_payment.limit) {
                return;
            }
        }
        $scope.obj_search_list_verify_payment.load = true;
        $scope.obj_search_list_verify_payment.offset += $scope.obj_search_list_verify_payment.limit;
        $http.get(base_url + 'verify_payment/ajax_get_list_verify_payment_for_invoice?' + $.param($scope.obj_search_list_verify_payment)).then(r => {
            if (r.data && r.data.status) {
                var data = r.data.data;
                $.each(data, function (index, value) {
                    value.confirm_time = moment(value.confirm_time, 'YYYY-MM-DD HH:mm:ss').format('HH:mm DD/MM/YYYY');
                    value.created = moment(value.created, 'YYYY-MM-DD HH:mm:ss').format('HH:mm DD/MM/YYYY');
                    value.import_time = moment(value.import_time, 'YYYY-MM-DD HH:mm:ss').format('HH:mm DD/MM/YYYY');
                    var image_url = value.image;
                    if (image_url.substr(0, 4) != 'http') {
                        image_url = base_url + image_url;
                    }
                    value.image_url = image_url;
                })
                $scope.list_verify_payments.push(...data);
            } else {
                showMessErr(r.data.message);
            }
            $scope.obj_search_list_verify_payment.load = false;
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope.confirmchooseItemPayment = (value) => {
        var item = angular.copy(value),
            text_cf = `Chọn giao dịch khách <b>${item.name}</b>?`;

        Swal.fire({
            title: 'Bạn có chắc chắn?',
            html: text_cf,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            cancelButtonText: 'Hủy',
            confirmButtonText: 'Đồng ý',
            allowOutsideClick: false,
        }).then((result) => {
            if (result.isConfirmed) {
                $scope.chooseItemPayment(item);
            }
        })
    }

    $scope.chooseItemPayment = (item) => {
        $scope.uploadFileVisaWithUrl(item);
    }

    $scope.uploadFileVisaWithUrl = (value) => {
        var item = angular.copy(value),
            url = item.image,
            verify_payment_id = item.id;

        $scope.obj_invoice.transaction.bank.load = true;
        $http.post(base_url + 'uploads/ajax_upload_image_with_url', {
            folder: 'visas',
            url: url
        }).then(r => {
            if (r.data && r.data.status) {
                var data = r.data.data,
                    file_name = data.file_name;
                $scope.obj_invoice.transaction.bank.image_url = file_name;
                $scope.obj_invoice.transaction.bank.verify_payment_id = verify_payment_id;
            } else {
                showMessErr(r.data.message);
            }
            $scope.obj_invoice.transaction.bank.load = false;
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }
    // -------
    $scope.resetMposTransactions = () => {
        $scope.mpos_transactions = {
            list: [],
            load: false
        }
    }

    $scope.chooseItemMposTransaction = (value) => {
        var item = angular.copy(value),
            price = item.transfer_amount,
            transfer_status = Number(item.transfer_status),
            code = item.transfer_authcode; // mã chuẩn chi

        if ([101, 102].includes(transfer_status)) {
            showMessErr('Trạng thái không phù hợp để chọn');
            return;
        }
        if (code == '000000') {
            code = item.transfer_code; // mã giao dịch
        }

        if ($scope.obj_invoice.transaction.mpos.price) {
            price = $scope.obj_invoice.transaction.mpos.price;
        }
        price = parseNumber(price);

        $scope.obj_invoice.transaction.mpos = {
            code: code,
            price: price,
            invoice_visa_transaction_id: item.id,
        }
    }


    $scope.getListMposTransactions = () => {
        var data_rq = {
            date: $scope.obj_invoice.date,
            store_id: $scope.obj_invoice.store_id,
        };

        $scope.mpos_transactions.load = true;
        $scope.mpos_transactions.list = [];
        $http.get(_url + 'ajax_get_list_mpos_transactions?' + $.param(data_rq)).then(r => {
            if (r.data && r.data.status) {
                let data = r.data.data;
                $.each(data, function (index, value) {
                    value.transfer_code = value.transfer_code.toString().slice(-8);
                    value.transfer_date = moment(value.transfer_date, 'YYYY-MM-DD HH:mm:ss').format('HH:mm');
                })
                $scope.mpos_transactions.list = data;
            } else {
                showMessErr(r.data.message);
            }
            $scope.mpos_transactions.load = false;
        }, function (data, status, headers, config) {
            showMessErrSystem()
        });
    }
    $scope.updateConfirmTypeBank = () => {
        var bank_id = $scope.obj_invoice.transaction.bank.id,
            bank = $scope.cashbook_bank.filter(item => item.id === bank_id);
        if (bank.length) {
            $scope.obj_invoice.transaction.bank.confirm_type = bank[0].confirm_type;
        }
    }

    $scope.saveMpos = () => {
        var item = angular.copy($scope.obj_invoice.transaction.mpos),
            price = formatDefaultNumber(item.price),
            code = item.code;

        if (!$scope.checkCodeMpos(code)) return;
        if (price > 0) {
            $scope.obj_invoice.transaction.mpos.load = true;

            $http.post(_url + 'ajax_add_mpos', {
                invoice_id: $scope.obj_invoice.invoice_id,
                price: price,
                code: code,
            }).then(r => {
                if (r.data && r.data.status == 1) {
                    var data = r.data.data;
                    $scope.obj_invoice.visa = data.invoice_update.visa;
                    $scope.obj_invoice.cr_item.visa = data.invoice_update.visa;
                    $scope.getInvoiceVisa();
                    showMessSuccess();
                    $scope.obj_invoice.transaction.mpos = _obj_mpos();
                } else {
                    showMessErr(r.data.message);
                }
                $scope.obj_invoice.transaction.mpos.load = false;
            }, function (data, status, headers, config) {
                showMessErrSystem();
            });
        } else {
            showMessErr('Số tiền thanh toán phải lớn hơn 0!')
            showInputErr('.vs_mpos_price');
            return;
        }
    }

    $scope.confirmRemoveMpos = (key) => {
        Swal.fire({
            title: 'Bạn có chắc?',
            text: 'Bạn không thể hoàn nguyên điều này!',
            icon: 'warning',
            showCancelButton: true,
            cancelButtonText: 'Hủy',
            confirmButtonText: 'Đồng ý',
            allowOutsideClick: false,
            showLoaderOnConfirm: true,
            preConfirm: function () {
                return new Promise(function (resolve, reject) {
                    $scope.$apply(function () {
                        var cur_obj = $scope.obj_invoice.transaction.list_mpos[key];
                        $scope._removeVisa(cur_obj.id, 1);
                    });
                });
            },
        }).then(function () {});
    }

    $scope.checkCodeMpos = (code = '') => {
        var len = code.length;
        if (len < 6 || len > 8) {
            showMessErr('Vui lòng nhập 6 đến 8 chữ số của mã giao dịch Mpos!')
            showInputErr('.vs_mpos_code');
            return false;
        }
        if (code == '000000') {
            showMessErr('Mã chuẩn chi là số 0 thì nhập 8 số cuối của mã GIAO DỊCH!')
            showInputErr('.vs_mpos_code');
            return false;
        }
        return true;
    }

    $scope.uploadFileVisa = (input, verify_payment_id = 0) => {
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
        $scope.obj_invoice.transaction.bank.load = true;
        $http({
            method: 'POST',
            url: base_url + 'invoices_v2/ajax_upload_visa_sale_online_temp',
            headers: {
                'Content-Type': undefined
            },
            data: formData
        }).then(r => {
            if (r.data && r.data.status) {
                $scope.obj_invoice.transaction.bank.image_url = r.data.data;
                $scope.obj_invoice.transaction.bank.verify_payment_id = verify_payment_id;
            } else {
                showMessErr(r.data.message);
            }
            $scope.obj_invoice.transaction.bank.load = false;
        }, function (response) {
            showMessErrSystem();
        });
    }

    $scope.confirmRemoveFileVisa = () => {
        Swal.fire({
            title: "Bạn có chắc chắn?",
            html: "Sau khi xóa, bạn sẽ không hoàn nguyên!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            cancelButtonText: 'Hủy',
            confirmButtonText: 'Đồng ý',
            allowOutsideClick: false,
        }).then((result) => {
            if (result.isConfirmed) {
                $scope.$apply(() => {
                    $scope._removeFileVisa($scope.obj_invoice.transaction.bank.image_url);
                    $scope.obj_invoice.transaction.bank.image_url = '';
                });
            }
        })
    }

    $scope._removeFileVisa = (url) => {
        $scope.obj_invoice.transaction.bank.load = true;
        $http.post(base_url + 'invoices_v2/ajax_remove_visa_sale_online_temp', {
            file_url: url
        }).then(r => {
            if (r.data && r.data.status) {
                showMessSuccess();
            }
            $scope.obj_invoice.transaction.bank.load = false;
        }, function (data, status, headers, config) {
            showMessErrSystem()
        });
    }

    $scope.saveBank = () => {
        var item = angular.copy($scope.obj_invoice.transaction.bank),
            price = formatDefaultNumber(item.price),
            code = item.code,
            confirm_type = item.confirm_type,
            bank_id = item.id,
            verify_payment_id = item.verify_payment_id,
            image_url = item.image_url,
            invoice_visa_transaction_id = (item.choose_visa_trans && item.choose_visa_trans.id > 0) ? item.choose_visa_trans.id : 0,
            cr_bank = $scope.cashbook_bank.find(item => item.id === bank_id);

        if (!cr_bank) {
            showMessErr('Vui chọn tài khoản thụ hưởng');
            showInputErr('.vs_bank_id');
            return;
        }

        if (confirm_type == 'image' && !image_url) {
            showMessErr('Vui lòng up chứng từ');
            showInputErr('.vs_bank_image_url');
            return;
        }
        if (confirm_type == 'code' && !code.length) {
            showMessErr('Vui lòng nhập mã thanh toán');
            showInputErr('.vs_bank_code');
            return;
        }
        if (price == 0) {
            showMessErr('Số tiền thanh toán phải lớn hơn 0!');
            showInputErr('.vs_bank_price');
            return;
        }

        if (invoice_visa_transaction_id) {
            if (price > Number(item.choose_visa_trans.amount_remain)) {
                showMessErr('Số tiền thanh toán vượt mức giao dịch đang chọn!');
                showInputErr('.vs_bank_price');
                return;
            }
        }

        $scope.obj_invoice.transaction.bank.load = true;

        $http.post(_url + 'ajax_add_bank', {
            invoice_id: $scope.obj_invoice.invoice_id,
            code: code,
            price: price,
            bank_id: bank_id,
            image_url: image_url,
            verify_payment_id: verify_payment_id,
            confirm_type: cr_bank.confirm_type,
            invoice_visa_transaction_id: invoice_visa_transaction_id,
        }).then(r => {
            if (r.data && r.data.status == 1) {
                var data = r.data.data;
                $scope.obj_invoice.visa = data.invoice_update.visa;
                $scope.obj_invoice.cr_item.visa = data.invoice_update.visa;
                $scope.getInvoiceVisa();
                if (verify_payment_id > 0) $scope.submitGetListVerifyPayment();
                if (invoice_visa_transaction_id > 0) $scope.sumbitGetListVisaTransactions();
                showMessSuccess();
                $scope.obj_invoice.transaction.bank = _obj_bank();
            } else {
                showMessErr(r.data.message);
            }
            $scope.obj_invoice.transaction.bank.load = false;
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope._removeVisa = (invoice_visa_id, type = 1) => {
        $scope.load_tab_transaction = true;
        $http.post(_url + 'ajax_remove_visa', {
            id: invoice_visa_id,
            invoice_id: $scope.obj_invoice.invoice_id,
        }).then(r => {
            if (r.data && r.data.status == 1) {
                var data = r.data.data;
                $scope.obj_invoice.visa = data.invoice_update.visa;
                $scope.obj_invoice.cr_item.visa = data.invoice_update.visa;
                $scope.getInvoiceVisa();
                Swal.fire({
                    icon: 'success',
                    title: 'Thành công',
                    text: 'Xóa thành công!'
                });
                if (type == 1) $scope.getListMposTransactions();
                if (type == 2) $scope.sumbitGetListVisaTransactions();
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi!',
                    text: r.data.message
                });
            }
            $scope.load_tab_transaction = false;
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope.confirmRemoveBank = (key) => {
        Swal.fire({
            title: 'Bạn có chắc?',
            text: 'Bạn không thể hoàn nguyên điều này!',
            icon: 'warning',
            showCancelButton: true,
            cancelButtonText: 'Hủy',
            confirmButtonText: 'Đồng ý',
            allowOutsideClick: false,
            showLoaderOnConfirm: true,
            preConfirm: function () {
                return new Promise(function (resolve, reject) {
                    $scope.$apply(function () {
                        var cur_obj = $scope.obj_invoice.transaction.list_bank[key];
                        $scope._removeVisa(cur_obj.id, 2);
                    });
                });
            },
        }).then(function () {});
    }

    $scope.checkVnpay = () => {
        var obj_vnpay = angular.copy($scope.obj_invoice.transaction.vnpay),
            price = formatDefaultNumber(obj_vnpay.price),
            txnId = obj_vnpay.code,
            payDate = obj_vnpay.payDate,
            data_rq = {
                txnId: txnId,
                store_id: store_id,
                payDate: '',
                invoice_type_sale: 5,
            };

        if (!txnId) {
            showMessErr('Vui lòng nhập số hóa đơn VNPAY');
            showInputErr('.vs_vnpay_code');
            return;
        }

        if (payDate) {
            if (payDate.length != 14) {
                showMessErr('Ngày khách thanh toán sai định dạng');
                showInputErr('.vs_vnpay_payDate');
                return;
            }

            payDate = payDate.replace(' / ', '/').replace(' / ', '/').split('/');
            data_rq.payDate = payDate[2] + '-' + payDate[1] + '-' + payDate[0];
        } else {
            showMessErr('Vui lòng điền ngày khách thanh toán VNPAY');
            return;
        }

        $scope.obj_invoice.transaction.vnpay.check = false;
        $scope.obj_invoice.transaction.vnpay.load = true;
        $.ajax({
            url: base_url + 'vnpay/check_transaction',
            type: 'post',
            data: data_rq,
            dataType: 'json',
            success: function (response) {
                if (response.status) {
                    var data = response.data;
                    $scope.$apply(() => {
                        $scope.obj_invoice.transaction.vnpay.check = true;
                        $scope.obj_invoice.transaction.vnpay.price = price > 0 ? price : data.debitAmount;
                    });

                    Swal.fire({
                        icon: 'success',
                        confirmButtonText: 'Đồng ý',
                        title: 'Thành công',
                        width: (window.innerWidth > 768) ? '' : '60 vw',
                        html: `<table class="table table-bordered table-striped table-vcenter" style="color: #000;">
                                    <tbody>
                                        <tr>
                                            <td>Số tiền:</td>
                                            <td><h3><b>${data.debitAmount} đ</b></h3></td>
                                        </tr>
                                        <tr>
                                            <td>Ngân hàng:</td>
                                            <td>${data.bankCode}</td>
                                        </tr>
                                        <tr>
                                            <td>Mã thanh toán:</td>
                                            <td><b>${data.txnId}</b></td>
                                        </tr>
                                        <tr>
                                            <td>Thời gian:</td>
                                            <td>${data.payDate}</td>
                                        </tr>
                                    </tbody>
                                </table>`
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Lỗi!',
                        text: response.message
                    });
                }
                $('.vs_vnpay_price').trigger('keyup');
            },
            complete: function () {
                $scope.$apply(() => {
                    $scope.obj_invoice.transaction.vnpay.load = false;
                })
            },
            error: function () {
                showMessErrSystem();
            }
        });
    }

    $scope.saveVnpay = () => {
        var item = angular.copy($scope.obj_invoice.transaction.vnpay),
            price = formatDefaultNumber(item.price),
            code = item.code;
        if (!item.check) {
            showMessErr('Mã VNPAY chưa được xác thực!')
            return;
        }
        if (price > 0) {
            $scope.obj_invoice.transaction.vnpay.load = true;
            $http.post(_url + 'ajax_add_vnpay', {
                invoice_id: $scope.obj_invoice.invoice_id,
                price: price,
                code: code,
            }).then(r => {
                if (r.data && r.data.status == 1) {
                    var data = r.data.data;
                    $scope.obj_invoice.visa = data.invoice_update.visa;
                    $scope.obj_invoice.cr_item.visa = data.invoice_update.visa;
                    $scope.getInvoiceVisa();
                    showMessSuccess();
                    $scope.obj_invoice.transaction.vnpay = _obj_vnpay();
                    $scope.obj_invoice.transaction.vnpay.payDate = moment($scope.obj_invoice.date, 'YYYY-MM-DD').format('DD / MM / YYYY');
                } else {
                    showMessErr(r.data.message);
                }
                $scope.obj_invoice.transaction.vnpay.load = false;
            }, function (data, status, headers, config) {
                showMessErrSystem();
            });
        } else {
            showMessErr('Số tiền thanh toán phải lớn hơn 0!')
            showInputErr('.vs_vnpay_price');
            return;
        }
    }

    $scope.confirmRemoveVnpay = (key) => {
        Swal.fire({
            title: 'Bạn có chắc?',
            text: 'Bạn không thể hoàn nguyên điều này!',
            icon: 'warning',
            showCancelButton: true,
            cancelButtonText: 'Hủy',
            confirmButtonText: 'Đồng ý',
            allowOutsideClick: false,
            showLoaderOnConfirm: true,
            preConfirm: function () {
                return new Promise(function (resolve, reject) {
                    $scope.$apply(function () {
                        var cur_obj = $scope.obj_invoice.transaction.list_vnpay[key];
                        $scope._removeVisa(cur_obj.id, 3);
                    });
                });
            },
        }).then(function () {});
    }
    //end tab

    $scope.checkShowUrlImageVisa = checkShowUrlImageVisa;

    $scope.toggleEditTransCode = (item) => {
        item.edit_trans_code = !item.edit_trans_code;
        item.trans_code_edit = angular.copy(item.trans_code);
    }

    $scope.saveEditTransCode = (value, trans_code) => {
        Swal.fire({
            title: 'Bạn có chắc chắn?',
            text: 'Bạn không thể hoàn nguyên điều này!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            cancelButtonText: 'Hủy',
            confirmButtonText: 'Đồng ý',
            allowOutsideClick: false,
        }).then((result) => {
            if (result.value) {
                $scope.$apply(() => {
                    $scope.obj_list_invoice_visa.load = true;
                    $.ajax({
                        url: base_url + 'ketoan/mpos/ajax_update_trans_code',
                        data: {
                            invoice_visa_id: value.id,
                            trans_code: trans_code,
                        },
                        type: "POST",
                        dataType: 'json',
                        success: function (response) {
                            if (response.status) {
                                showMessSuccess();
                                $scope.$apply(() => {
                                    $scope.showModalListInvoiceVisa($scope.obj_list_invoice_visa.invoice_choose);
                                })
                            } else {
                                $scope.obj_list_invoice_visa.load = false;
                                showMessErr(response.message);
                            }
                        },
                        error: function () {
                            showMessErrSystem();
                        }
                    })
                })
            }
        })
    }

    $scope.confirmVisa = (value, confirm) => {
        var item = angular.copy(value),
            invoice_choose = angular.copy($scope.obj_list_invoice_visa.invoice_choose);

        data_rq = {
            invoice_id: item.invoice_id,
            confirm: confirm,
            visa_id: item.id,
            trans_code: item.trans_code_edit,
            phone: invoice_choose.phone,
            customer_name: invoice_choose.name,
            image_url: item.type == 2 ? $scope.checkShowUrlImageVisa(item.value) : '',
            store_name: invoice_choose.store_name,
        };
        Swal.fire({
            title: 'Bạn có chắc chắn?',
            text: 'Bạn không thể hoàn nguyên điều này!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            cancelButtonText: 'Hủy',
            confirmButtonText: 'Đồng ý',
            allowOutsideClick: false,
        }).then((result) => {
            if (result.value) {
                $scope.$apply(() => {
                    $scope.obj_list_invoice_visa.load = true;
                    $.ajax({
                        url: base_url + 'ketoan/mpos/ajax_confirm_transfer',
                        data: data_rq,
                        type: "POST",
                        dataType: 'json',
                        success: function (response) {
                            if (response.status) {
                                showMessSuccess();
                                $scope.$apply(() => {
                                    $scope.showModalListInvoiceVisa(invoice_choose);
                                })
                            } else {
                                $scope.obj_list_invoice_visa.load = false;
                                showMessErr(response.message);
                            }
                        },
                        error: function () {
                            showMessErrSystem();
                        }
                    })
                })
            }
        })
    }

    $scope.showModalListInvoiceVisa = (_value) => {
        var item = angular.copy(_value);
        $scope.obj_list_invoice_visa = {
            load: true,
            invoice_choose: item,
            choose_code: '',
            choose_image: '',
            list_mpos: [],
            list_vnpay: [],
            list_bank: [],
        }
        $('#modal_invoice_visa').modal('show');
        $http.get(_url + 'ajax_get_invoice_visa_by_invoice_id?invoice_id=' + item.invoice_id).then(r => {
            if (r.data && r.data.status) {
                var list = r.data.data,
                    mpos = [],
                    vnpays = [],
                    banks = [],
                    choose_default = '';
                $.each(list, function (key, value) {
                    if (value.type == 1) {
                        mpos.push(value);
                    } else if (value.bank_id == 9) {
                        vnpays.push(value);
                    } else {
                        if (value.type == 2) value.trans_code_edit = '';
                        banks.push(value);
                    }
                });

                if (mpos.length) {
                    choose_default = 'mpos';
                } else if (vnpays.length) {
                    choose_default = 'vnpay';
                } else {
                    choose_default = 'bank'
                }

                $scope.obj_list_invoice_visa.list_mpos = mpos;
                $scope.obj_list_invoice_visa.list_vnpay = vnpays;
                $scope.obj_list_invoice_visa.list_bank = banks;

                $scope.chooseItemShowVisa(choose_default, 0);
            } else {
                showMessErr(r.data.message);
            }
            $scope.obj_list_invoice_visa.load = false;
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope.chooseItemShowVisa = (type, key) => {
        $scope.obj_list_invoice_visa.choose_code = '';
        $scope.obj_list_invoice_visa.choose_image = '';
        $scope.obj_list_invoice_visa.list_mpos.filter(x => x.current_choose = false);
        $scope.obj_list_invoice_visa.list_vnpay.filter(x => x.current_choose = false);
        $scope.obj_list_invoice_visa.list_bank.filter(x => x.current_choose = false);
        if (type == 'mpos') {
            $scope.obj_list_invoice_visa.list_mpos[key].current_choose = true;
            $scope.obj_list_invoice_visa.choose_code = $scope.obj_list_invoice_visa.list_mpos[key].value;
        } else if (type == 'vnpay') {
            $scope.obj_list_invoice_visa.list_vnpay[key].current_choose = true;
            $scope.obj_list_invoice_visa.choose_code = $scope.obj_list_invoice_visa.list_vnpay[key].value;
        } else {
            $scope.obj_list_invoice_visa.list_bank[key].current_choose = true;
            var _bank = angular.copy($scope.obj_list_invoice_visa.list_bank[key]);
            if (_bank.type == 2) {
                $scope.obj_list_invoice_visa.choose_image = _bank.value;
            } else {
                $scope.obj_list_invoice_visa.choose_code = _bank.value;
            }
        }
    }

    $scope.showModalLog = (_value) => {
        var item = angular.copy(_value);
        $('#modal_log').modal('show');
        $scope.obj_log_invoice = {
            load: true,
            list: []
        }
        $http.get(_url + 'ajax_get_invoice_online_log?invoice_id=' + item.invoice_id).then(r => {
            if (r.data && r.data.status == 1) {
                var data = r.data.data;
                $.each(data, function (index, value) {
                    value.created = moment(value.created).format('DD/MM/YYYY HH:mm');
                });
                $scope.obj_log_invoice.list = data;
            } else {
                showMessErr(r.data.message);
            }
            $scope.obj_log_invoice.load = false;
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope.resetSendMessConfirm = () => {
        $scope.obj_send_mess_confirm = {
            load: false,
            invoice_id: 0,
            note: '',
            name: '',
            phone: '',
            total: 0,
            visa: 0,
        }
    }

    $scope.showModalSendMessConfirm = (value) => {
        var item = angular.copy(value);
        $scope.resetSendMessConfirm();
        $scope.obj_send_mess_confirm.note = item.note;
        $scope.obj_send_mess_confirm.name = item.name;
        $scope.obj_send_mess_confirm.phone = item.phone;
        $scope.obj_send_mess_confirm.total = item.total;
        $scope.obj_send_mess_confirm.visa = item.visa;
        $scope.obj_send_mess_confirm.invoice_id = item.invoice_id;
        $('#modal_send_mess_confirm').modal('show');
    }

    $scope.sendMessConfirm = () => {
        $scope.obj_send_mess_confirm.load = true;
        $http.post(_url + 'ajax_sent_mess_confirm', {
            invoice_id: $scope.obj_send_mess_confirm.invoice_id,
            note: $scope.obj_send_mess_confirm.note
        }).then(r => {
            if (r.data && r.data.status) {
                showMessSuccess();
                $('#modal_send_mess_confirm').modal('hide');
            } else {
                showMessErr(r.data.message);
            }
            $scope.obj_send_mess_confirm.load = false;
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope.openInvoice = (item) => {
        window.open(base_url + 'invoices/detail/' + item.invoice_id);
    }

    $scope.showInvoiceImage = (item) => {
        $scope.resetListInvoiceImage();
        $('#modal_invoice_image').modal('show');
        $scope.getInvoiceImageUploaded(item.invoice_id)
    }

    $scope.getInvoiceImageUploaded = (invoice_id) => {
        $scope.obj_list_invoice_image.load = true;
        $http.get(_url + 'ajax_get_img_invoice_upload?invoice_id=' + invoice_id).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.obj_list_invoice_image.list = r.data.data;
            } else {
                showMessErr(r.data.message);
            }
            $scope.obj_list_invoice_image.load = false;
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope.chooseHandler = (hand = null, invoice) => {
        var handler_id = hand ? hand.id : 0;
        if (invoice.handler_id == handler_id) return;

        Swal.fire({
            title: 'Thay đổi người xử lý?',
            html: hand ? ('Chọn: <b>' + hand.fullname + '</b>') : 'Không có người xử lý',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            cancelButtonText: 'Hủy',
            confirmButtonText: 'Đồng ý',
            allowOutsideClick: false,
            showLoaderOnConfirm: true,
            preConfirm: function () {
                return new Promise(function (resolve, reject) {
                    $scope.$apply(function () {
                        $scope._chooseHandler(hand, invoice);
                    });
                });
            },
        }).then(function () {});
    }

    $scope._chooseHandler = (hand = null, invoice) => {
        var handler_id = hand ? hand.id : 0,
            data_rq = {
                invoice_id: invoice.invoice_id,
                handler_id: handler_id,
            };
        $http.post(_url + 'ajax_update_handler_id_invoice_online', data_rq).then(r => {
            if (r.data && r.data.status) {
                invoice.handler_id = handler_id;
                invoice.handler_logo = handler_id > 0 ? hand.image_url : img_no;
                showMessSuccess();
            } else {
                showMessErr(r.data.message);
            }
            Swal.close();
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }


    $scope.chooseShipper = (shipper = null, invoice) => {
        var shipper_id = shipper ? shipper.id : 0;
        if (invoice.shipper_id == shipper_id) return;

        if (shipper_id && !is_dev) {
            if (shipper.shipper_type_id != 0) {
                showMessErr('Shipper không phù hợp. Vào chức năng Tạo mã vận đơn (nếu được phân quyền) để chọn Shipper này.');
                return;
            }
        }

        Swal.fire({
            title: 'Thay đổi nhà vận chuyển?',
            html: shipper ? ('Chọn: <b>' + shipper.name + '</b>') : 'Không có nhà vận chuyển',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            cancelButtonText: 'Hủy',
            confirmButtonText: 'Đồng ý',
            allowOutsideClick: false,
            showLoaderOnConfirm: true,
            preConfirm: function () {
                return new Promise(function (resolve, reject) {
                    $scope.$apply(function () {
                        $scope._chooseShipper(shipper, invoice);
                    });
                });
            },
        }).then(function () {});
    }

    $scope._chooseShipper = (shipper = null, invoice) => {
        var shipper_id = shipper ? shipper.id : 0,
            data_rq = {
                invoice_id: invoice.invoice_id,
                shipper_id: shipper_id,
            };
        $http.post(_url + 'ajax_update_shipper_invoice_online', data_rq).then(r => {
            if (r.data && r.data.status) {
                var data = r.data.data;
                invoice.shipper_id = shipper_id;
                invoice.shipper_logo = shipper_id > 0 ? shipper.logo : img_no;
                invoice.handler_id = data.handler_id;
                invoice.handler_logo = data.handler_logo;

                showMessSuccess();
            } else {
                showMessErr(r.data.message);
            }
            Swal.close();
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope.printInvoice = () => {
        var invoice_ids = [];
        $('.table-content>tbody .item-checkbox:checked').each(function (index, element) {
            invoice_ids.push($(this).attr('data-invoice_id'));
        });

        if (!invoice_ids.length) {
            showMessErr('Vui lòng chọn ít nhất 1 phiêu thu');
            return;
        }
        var data_rq = {
            invoice_ids: invoice_ids
        };
        window.open(_url + 'print_invoice_online?' + $.param(data_rq), '', 'left=0,top=0,width=800,height=600,toolbar=0,scrollbars=0,status=0');
        $('.table-content>tbody .item-checkbox:checked').attr('checked', false);
    }

    $scope.printDetail = () => {
        var invoice_ids = [];
        $('.table-content>tbody .item-checkbox:checked').each(function (index, element) {
            invoice_ids.push($(this).attr('data-invoice_id'));
        });

        if (!invoice_ids.length) {
            showMessErr('Vui lòng chọn ít nhất 1 phiêu thu');
            return;
        }
        var data_rq = {
            invoice_ids: invoice_ids
        };
        window.open(_url + 'print_invoice_online_detail?' + $.param(data_rq), '', 'left=0,top=0,width=800,height=600,toolbar=0,scrollbars=0,status=0');
        $('.table-content>tbody .item-checkbox:checked').attr('checked', false);
    }

    $scope.searchProduct = () => {
        var key = $scope.filter_product.key;
        if (key.length < 3) return true;

        if ($scope.filter_timer) {
            clearTimeout($scope.filter_timer);
        }
        $scope.filter_timer = setTimeout(() => {
            $scope._searchProduct();
        }, 350);
    }

    $scope.getByTab = (tab, chanetab = true, reload = false) => {
        $scope.cur_tab = tab;
        if (tab == 3) {
            $scope.initReport();
        } else if (tab == 4) {
            $scope.getShipperDelivery();
            $('body').addClass('sidebar-collapse');
        } else {
            $scope.chatFilter = {};
            $scope.chatFilter.limit = $scope.pagingInfo2.itemsPerPage;
            $scope.chatFilter.offset = $scope.pagingInfo2.offset = 0;
            $scope.pagingInfo2.currentPage = 1;
            // $scope.filter_list.chat = tab;
            $scope.activeTab = tab;
            delete $scope.filter_list.chat;
            if (chanetab) {
                $scope.activeTab2 = tab;
                $scope.filter_list.chat = tab;
            }
            setTimeout(() => {
                scrollChat();
            }, 100);
            if ($scope.is_mobile) $scope.changeMobileStep(0);
            if (!$scope.chatopening || reload) {
                if (tab == 1 || tab == 2) {
                    $scope.chatFilter.chat = tab;
                    $scope.get_list_invoice_by_chat('ajax_get_list_online');
                } else if (tab == 0) {
                    $scope.get_list_invoice_by_chat();
                }
                return;
            }
        }
    }

    $scope.get_list_chat_scroll = () => {
        if ($scope.pagingInfo2.total > $scope.chat_list.length) {
            $scope.chatFilter.limit += 20;
            $scope.chatFilter.offset = 0;
            $scope.get_list_invoice_by_chat('ajax_get_list_online');
        }
    }

    $scope.get_list_invoice_by_chat = (fun_url = 'get_list_invoice_chat') => {
        $scope.loadingChat = true;
        let data = angular.copy($scope.chatFilter);
        data.store_id = $scope.all_stores.map(x => x.id);
        data.ship_status_id = ['0']
        $http.post(_url + fun_url, data).then(r => {
            $scope.loadingChat = false;
            if (r && r.data.status == 1) {
                $scope.chat_list = r.data.data.list;
                $.each($scope.chat_list, function (index, value) {
                    value.obj_user_collaborator = value.obj_user_collaborator ? JSON.parse(value.obj_user_collaborator) : null;
                    value.showLast = value.last_chat_content.first_name + ': ' + value.last_chat_content.messages;
                    value.ship_status_id += '';
                    value.ship_status_name = shipStatusInfo(value.ship_status_id).name;
                    value.ship_status_class_name = shipStatusInfo(value.ship_status_id).class_name;
                    if ($scope.activeTab == 1 || $scope.activeTab == 2) {
                        value.created_df = value.created;
                        // value.delivery_time_df = value.delivery_time;
                        value.delivery_time = value.delivery_time ? moment(value.delivery_time).format('DD/MM/YYYY') : '';
                        value.created = moment(value.created).format('DD/MM/YYYY HH:mm');
                        value.updated_at = value.updated_at ? moment(value.updated_at).format('DD/MM/YYYY HH:mm') : '---';
                        value.status_class_name = statusName(value.status_id);
                        value.show_xfast = false;
                        if (!value.shipper_code && value.invoice_type_sale == 5 && value.shipper_type_id == 1) {
                            var obj_stock = $scope.list_warehouse_stocks.find(x => Number(x.store_id) == Number(value.store_id));
                            value.show_xfast = obj_stock && (value.province_id == obj_stock.province_id);
                        }
                        value.invoice_tag_logs = [];
                        value.filter_tag = {
                            key: '',
                            list: []
                        }
                    } else {
                        $("html, body").animate({
                            scrollTop: 0
                        }, 0);
                    }
                });

                $scope.pagingInfo2.total = r.data.data.count;
                $scope.pagingInfo2.totalPage = Math.ceil(r.data.data.count / pi.itemsPerPage);
            } else toastr["error"]('Đã có lỗi xảy ra!');
        })
    }

    $scope._searchProduct = () => {
        $scope.filter_product.load = true;
        $http.get(base_url + 'products/ajax_get_product_retail_by_key?key=' + $scope.filter_product.key).then(r => {
            if (r.data && r.data.status) {
                var data = r.data.data;
                // filter bỏ ra nhưng thằng product đã lấy r
                if ($scope.filter_list.products.length) {
                    var product_ids = $scope.filter_list.products.map(x => x.id);
                    data = data.filter(x => !product_ids.includes(x.id));
                }
                $scope.filter_product.list = data;
            } else {
                showMessErr(r.data.message);
            }
            $scope.filter_product.load = false;
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope.resetSearchUserCollaborator = () => {
        $scope.filter_user_collaborator = {
            key: '',
            load: false,
            list: [],
            show_rs: false,
            is_collabor: 1,
            type: 'product',
        }
    }

    $scope.chooseProductInFllter = (item) => {
        $scope.filter_product.key = '';
        $scope.filter_user_collaborator.key = '';
        var product = angular.copy(item);
        $scope.filter_list.products.push({
            id: product.id,
            description: product.description,
            image_url: product.image_url,
        });
    }

    $scope.chooseProductGroup = (item) => {
        $scope.filter_user_collaborator.key = '';
        var product_group = angular.copy(item);
        $scope.filter_list.product_groups.push({
            group_id: product_group.group_id,
            name: product_group.name,
        });
        $scope.searchUserCollaborator();
    }

    $scope.chooseUserCollaborator = (value) => {
        $scope.filter_user_collaborator.key = '';
        var item = angular.copy(value);
        $scope.filter_list.collabors.push({
            user_id: item.id,
            customer_id: item.customer_id,
            first_name: item.first_name,
            last_name: item.last_name,
            image_url: item.image_url,
        });
        $scope.searchUserCollaborator();
    }

    $scope.chooseUserCreateInvoice = (value) => {
        $scope.filter_user_collaborator.key = '';
        var item = angular.copy(value);
        $scope.filter_list.create_invoices.push({
            id: item.id,
            customer_id: item.customer_id,
            first_name: item.first_name,
            last_name: item.last_name,
            image_url: item.image_url,
        });
        $scope.searchUserCollaborator();
    }

    $scope.chooseUserSaleInvoice = (value) => {
        $scope.filter_user_collaborator.key = '';
        var item = angular.copy(value);
        $scope.filter_list.sale_invoices.push({
            id: item.id,
            first_name: item.first_name,
            last_name: item.last_name,
            image_url: item.image_url,
        });
        $scope.searchUserCollaborator();
    }

    $scope.chooseUserHandlerInvoice = (value) => {
        $scope.filter_user_collaborator.key = '';
        var item = angular.copy(value);
        $scope.filter_list.handler_invoices.push({
            id: item.id,
            first_name: item.first_name,
            last_name: item.last_name,
            image_url: item.image_url,
        });
        $scope.searchUserCollaborator();
    }

    $scope.chooseInvoiceTag = (value) => {
        $scope.filter_user_collaborator.key = '';
        var item = angular.copy(value);
        $scope.filter_list.invoice_tags.push({
            id: item.id,
            name: item.name,
            back_color: item.back_color,
        });
        $scope.searchUserCollaborator();
    }

    $scope.removeTagCollabor = (key) => {
        $scope.filter_list.collabors.splice(key, 1);
    }

    $scope.removeTagCreateInvoice = (key) => {
        $scope.filter_list.create_invoices.splice(key, 1);
    }

    $scope.removeTagSaleInvoice = (key) => {
        $scope.filter_list.sale_invoices.splice(key, 1);
    }

    $scope.removeTagHandlerInvoice = (key) => {
        $scope.filter_list.handler_invoices.splice(key, 1);
    }

    $scope.removeTagProduct = (key) => {
        $scope.filter_list.products.splice(key, 1);
    }

    $scope.removeTagProductGroup = (key) => {
        $scope.filter_list.product_groups.splice(key, 1);
        $scope._searchProductGroup();
    }

    $scope.removeTagInvoiceTag = (key) => {
        $scope.filter_list.invoice_tags.splice(key, 1);
    }

    $scope.hideRsFilterUserCollaborator = () => {
        setTimeout(() => {
            $scope.filter_user_collaborator.show_rs = false;
            $scope.$apply();
        }, 250)
    }

    $scope.hideRsFilterProduct = () => {
        setTimeout(() => {
            $scope.filter_product.show_rs = false;
            $scope.$apply();
        }, 250)
    }

    $('.search-filter-user-collaborator').on('focus', function () {
        setTimeout(() => {
            $scope.filter_user_collaborator.show_rs = true;
            $scope.$apply();
        }, 0)
    })

    $('#search-filter-input-product').on('focus', function () {
        setTimeout(() => {
            $scope.filter_product.show_rs = true;
            $scope.$apply();
        }, 0)
    })

    // search customer
    $scope.searchUserCollaborator = () => {
        var key = $scope.filter_user_collaborator.key,
            type = $scope.filter_user_collaborator.type;
        if (['collabor', 'product', 'create_invoice', 'sale_invoice'].includes(type)) {
            if (key.length < 3) return true;
            $scope.filter_user_collaborator.list = [];
            if ($scope.filter_timer) {
                clearTimeout($scope.filter_timer);
            }
            $scope.filter_timer = setTimeout(() => {
                $scope._searchUserCollaborator();
            }, 350);
        } else if (type == 'handler_invoice') {
            $scope._searchHandler();
        } else if (type == 'product_group') {
            $scope._searchProductGroup();
        } else if (type == 'invoice_tag') {
            $scope._searchInvoiceTag();
        }
    }

    $scope._searchHandler = () => {
        var key = $scope.filter_user_collaborator.key,
            handler_ids = $scope.filter_list.handler_invoices.map(x => x.id);
        $scope.filter_user_collaborator.list = angular.copy($scope.list_handler.filter(item => ToSlug(item.fullname).indexOf(key) !== -1 && !(handler_ids.includes(item.id))));
    }

    $scope._searchInvoiceTag = () => {
        var key = $scope.filter_user_collaborator.key,
            invoice_tag_ds = $scope.filter_list.invoice_tags.map(x => x.id);
        $scope.filter_user_collaborator.list = angular.copy($scope.invoice_tags.filter(item => ToSlug(item.name).indexOf(key) !== -1 && !(invoice_tag_ds.includes(item.id))));
    }

    $scope.searchInvoicetagInTable = (value) => {
        var key = value.filter_tag.key,
            invoice_tag_ds = value.invoice_tag_logs.map(x => x.tag_id);
        value.filter_tag.list = angular.copy($scope.invoice_tags.filter(item => ToSlug(item.name).indexOf(key) !== -1 && !(invoice_tag_ds.includes(item.id))));
    }

    $scope._searchProductGroup = () => {
        var key = $scope.filter_user_collaborator.key,
            product_group_ids = $scope.filter_list.product_groups.map(x => x.group_id);
        $scope.filter_user_collaborator.list = angular.copy($scope.list_product_groups.filter(item => ToSlug(item.name).indexOf(key) !== -1 && !(product_group_ids.includes(item.group_id))));
    }

    $scope._searchUserCollaborator = () => {
        $scope.filter_user_collaborator.load = true;
        var obj_filter = angular.copy($scope.filter_user_collaborator),
            type = obj_filter.type;
        if (type == 'collabor') {
            var data_rq = {
                    key: obj_filter.key,
                    is_collabor: obj_filter.is_collabor,
                },
                url_rq = base_url + 'admin_users/ajax_search_user_by_key?' + $.param(data_rq);
        } else if (['create_invoice', 'sale_invoice'].includes(type)) {
            var data_rq = {
                    key: obj_filter.key,
                },
                url_rq = base_url + 'admin_users/ajax_search_user_by_key?' + $.param(data_rq);
        } else {
            var data_rq = {
                    key: obj_filter.key,
                },
                url_rq = base_url + 'products/ajax_get_product_retail_by_key?' + $.param(data_rq);
        }
        $http.get(url_rq).then(r => {
            if (r.data && r.data.status) {
                let data = r.data.data;
                if (type == 'collabor') {
                    if ($scope.filter_list.collabors.length) {
                        var customer_ids = $scope.filter_list.collabors.map(x => x.customer_id);
                        data = data.filter(x => !customer_ids.includes(x.customer_id));
                    }
                } else if (type == 'create_invoice') {
                    if ($scope.filter_list.create_invoices.length) {
                        var created_ids = $scope.filter_list.create_invoices.map(x => x.id);
                        data = data.filter(x => !created_ids.includes(x.id));
                    }
                } else if (type == 'sale_invoice') {
                    if ($scope.filter_list.sale_invoices.length) {
                        var sale_ids = $scope.filter_list.sale_invoices.map(x => x.id);
                        data = data.filter(x => !sale_ids.includes(x.id));
                    }
                } else if (type == 'product') {
                    if ($scope.filter_list.products.length) {
                        var product_ids = $scope.filter_list.products.map(x => x.id);
                        data = data.filter(x => !product_ids.includes(x.id));
                    }
                }
                $scope.filter_user_collaborator.list = data;
            } else {
                showMessErr(r.data.message);
            }
            $scope.filter_user_collaborator.load = false;
        }, function (data, status, headers, config) {
            showMessErrSystem()
        });
    }

    $scope.getListStatus = () => {
        $scope.listStatus = [];
        $.each([-1, 1, 2, 3, 4, 5], function (index, id) {
            $scope.listStatus.push({
                id: id,
                name: shipStatusInfo(id).name
            })
        });
    }

    $scope.getListHandler = () => {
        $scope.list_handler = [];
        $http.get(_url + 'ajax_get_list_handler_invoice_online').then(r => {
            if (r.data && r.data.status) {
                var data = r.data.data;

                data.push({
                    id: 0,
                    first_name: 'Không có',
                    last_name: 'Không có',
                    fullname: 'Không có',
                    image_url: img_no,
                });
                $scope.list_handler = data.filter(x => x.fullname = (x.fullname ? x.fullname : (x.last_name + ' ' + x.first_name)));
            } else {
                showMessErr('Không lấy được danh sách người xử lý');
            }
        }, function (data, status, headers, config) {
            showMessErr('Không lấy được danh sách người xử lý');
        });
    }

    $scope.resetChangeStoreInvoice = () => {
        $scope.obj_change_store_invoice = {
            invoice_id: 0,
            shipper_id: 0,
            store_id: '0',
            load: false,
        }
    }

    $scope.resetMoneyCheck = () => {
        $scope.obj_money_check = {
            load: false,
            data: [],
            message: ''
        }
    }

    $scope.resetSearchProduct = () => {
        $scope.filter_product = {
            key: '',
            load: false,
            list: [],
            show_rs: false,
        }
    }

    $scope.resetEditStatus = () => {
        $scope.obj_edit_status = {
            ship_status_id: '1',
            load: false,
            invoice_ids: [],
            cr_item: {},
            reload: false
        }
    }

    $scope.resetListInvoiceImage = () => {
        $scope.obj_list_invoice_image = {
            load: false,
            list: [],
        }
    }

    $scope.resetEditCreateOrder = () => {
        $scope.obj_create_order = {
            load: false,
            show_btn_submit: true,
            shipper_type_id: 0,
            warehouse_shipper_api_id: 0,
            shipper_id: 0,
            shipper_logo: '',
            shipper_name: '',
            create_type: 'manual',
            cr_item: {},
            obj_type: {
                auto: {
                    transport_type: 'road',
                    isFreeship: false,
                    fee: 0,
                },
                manual: {
                    shipper_code: '',
                    isFreeship: false,
                    fee: 0,
                }
            },
        }
    }

    $scope.getListWarehouseStocks = () => {
        $scope.list_warehouse_stocks = [];
        $http.get(base_url + 'warehouse/api_get_warehouses').then(r => {
            if (r.data && r.data.status) {
                $scope.list_warehouse_stocks = r.data.data;
                $scope.getList();
                $scope.getAllShipper();
                $scope.getListProductGroup();
                $scope.getListHandler();
                $scope.getListInvoiceTag();
            } else {
                showMessErr('Không lấy được dữ liệu kho chi nhánh');
            }
        }, function (data, status, headers, config) {
            showMessErr('Không lấy được dữ liệu kho chi nhánh');
        });
    }

    $scope.getAllShipper = () => {
        $scope.all_shippers = [];
        $http.get(base_url + 'warehouse_shipper/ajax_get_all_shipper').then(r => {
            if (r.data && r.data.status) {
                var data = r.data.data;
                $scope.all_shippers = data;
                select2();
            } else {
                showMessErr('Không lấy được danh sách nhà vận chuyển');
            }
        }, function (data, status, headers, config) {
            showMessErr('Không lấy được danh sách nhà vận chuyển');
        });
    }

    $scope.getListProductGroup = () => {
        $scope.list_product_groups = [];
        $http.get(base_url + 'product_groups/ajax_get_list_product_group').then(r => {
            if (r.data && r.data.status) {
                $scope.list_product_groups = r.data.data;
            } else {
                showMessErr('Không lấy được danh sách nhóm sản phẩm');
            }
        }, function (data, status, headers, config) {
            showMessErr('Không lấy được danh sách nhóm sản phẩm');
        });
    }


    // get list shiper current store
    $scope.getListShipperStore = (store_id) => {
        $scope.obj_create_order.load = true;
        $http.get(base_url + 'warehouse_shipper/ajax_get_list_shipper_store_for_invoice?store_id=' + store_id).then(r => {
            $scope.obj_create_order.load = false;
            if (r.data && r.data.status) {
                let data = r.data.data;
                $scope.shippers = data;
                $scope.changeShipper();
            } else {
                showMessErr(r.data.message);
            }
        }, function (data, status, headers, config) {
            showMessErrSystem()
        });
    }

    $scope.changeShipper = () => {
        $scope.obj_create_order.show_btn_submit = true;
        $scope.obj_create_order.obj_type.auto.fee = 0;
        var obj_create_order = angular.copy($scope.obj_create_order),
            shipper_id = obj_create_order.shipper_id,
            obj_shipper = $scope.shippers.find(x => x.id == shipper_id),
            logo = img_no,
            name = 'Chưa chọn Shipper',
            api_key = '',
            warehouse_shipper_api_id = 0,
            shipper_type_id = 0;
        if (obj_shipper) {
            logo = obj_shipper.logo;
            name = obj_shipper.name;
            api_key = obj_shipper.api_key;
            warehouse_shipper_api_id = obj_shipper.warehouse_shipper_api_id;
            shipper_type_id = obj_shipper.shipper_type_id;

            var obj_stock = $scope.list_warehouse_stocks.find(x => x.store_id == obj_create_order.cr_item.store_id);
            if (obj_stock) {
                if (shipper_type_id == 1 || api_key) {
                    if (obj_stock.province_id == 0 || obj_stock.district_id == 0 || obj_stock.ward_id == 0) {
                        showMessErr('Kho chi nhánh chưa cập nhật địa chỉ lấy hàng. Liên hệ DEV');
                        $scope.obj_create_order.show_btn_submit = false;
                    } else if (shipper_type_id == 1) {
                        $scope.updateFeeShip({
                            shipper_type_id: shipper_type_id,
                            shipper_api_key: obj_shipper.api_key,
                            shipper_api_secret: obj_shipper.api_secret,
                            from: {
                                province_name: obj_stock.province_name,
                                district_name: obj_stock.district_name,
                                ward_name: obj_stock.ward_name,
                                address: obj_stock.address,
                                province_id: obj_stock.province_id,
                                district_id: obj_stock.district_id,
                                ward_id: obj_stock.ward_id,
                            },
                            to: {
                                province_name: obj_create_order.cr_item.province_name,
                                district_name: obj_create_order.cr_item.district_name,
                                ward_name: obj_create_order.cr_item.ward_name,
                                address: obj_create_order.cr_item.address,
                                province_id: obj_create_order.cr_item.province_id,
                                district_id: obj_create_order.cr_item.district_id,
                                ward_id: obj_create_order.cr_item.ward_id,
                            }
                        });
                    }
                }
            } else {
                showMessErr('Không tồn tại Kho chi nhánh này');
            }
        }

        if (api_key) {
            $scope.obj_create_order.create_type = 'auto';
        } else {
            $scope.obj_create_order.obj_type.manual.shipper_code = obj_create_order.cr_item.shipper_code;
            $scope.obj_create_order.obj_type.manual.fee = parseNumber(obj_create_order.cr_item.pay_shipper);
            $scope.obj_create_order.create_type = 'manual';
        }

        $scope.obj_create_order.shipper_logo = logo;
        $scope.obj_create_order.shipper_name = name;
        $scope.obj_create_order.warehouse_shipper_api_id = warehouse_shipper_api_id;
        $scope.obj_create_order.shipper_type_id = shipper_type_id;
    }

    $scope.updateFeeShip = (data_rq) => {
        $scope.obj_create_order.load = true;
        $http.post(_url + 'ajax_get_fee_ship', data_rq).then(r => {
            if (r.data && r.data.status) {
                if (r.data.data.status) {
                    $scope.obj_create_order.obj_type.auto.fee = r.data.data.data.fee;
                } else {
                    showMessErr(r.data.data.message);
                }
            } else {
                showMessErr(r.data.message);
            }
            $scope.obj_create_order.load = false;
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope.confirmCreateOrder = (value) => {
        var obj_stock = $scope.list_warehouse_stocks.find(x => x.store_id == value.store_id);
        if (obj_stock) {
            if (!value.warehouse_shipper_api_id) {
                showMessErr('Chưa khởi tạo api cho nhà vận chuyển. Vui lòng liên hệ DEV!');
                return;
            }
            Swal.fire({
                title: 'Tạo mã vận đơn?',
                html: `Lấy hàng: ${obj_stock.name} - ${obj_stock.address}`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                cancelButtonText: 'Hủy',
                confirmButtonText: 'Đồng ý',
                allowOutsideClick: false,
            }).then((result) => {
                if (result.value) {
                    $scope.createOrder(value);
                }
            })
        } else {
            showMessErr('Không tồn tại Kho chi nhánh này');
        }
    }

    $scope.createOrder = () => {
        var obj_create_order = angular.copy($scope.obj_create_order),
            item = obj_create_order.cr_item,
            store_id = item.store_id,
            shipper_id = obj_create_order.shipper_id,
            warehouse_shipper_api_id = obj_create_order.warehouse_shipper_api_id,
            transport_type = 'road',
            isFreeship = 0,
            shipper_pay = 0,
            shipper_code = item.shipper_code,
            create_type = obj_create_order.create_type,
            invoice_id = item.invoice_id,
            obj_stock = $scope.list_warehouse_stocks.find(x => x.store_id == item.store_id);

        if (Number(shipper_id)) {
            if (create_type == 'manual') {
                shipper_code = obj_create_order.obj_type.manual.shipper_code;
                shipper_pay = formatDefaultNumber(obj_create_order.obj_type.manual.fee);
                // if (!shipper_code) {
                //     showMessErr('Mã vận đơn không được bỏ trống khi Tạo vận đơn thủ công!');
                //     return;
                // }
                // if (!shipper_pay) {
                //     showMessErr('Phí shipper không được bỏ trống khi Tạo vận đơn thủ công!');
                //     return;
                // }
            } else {
                transport_type = obj_create_order.obj_type.auto.transport_type;
                isFreeship = obj_create_order.obj_type.auto.isFreeship ? 1 : 0;
                shipper_pay = obj_create_order.obj_type.auto.fee;

                if (!Number(warehouse_shipper_api_id)) {
                    showMessErr('Chưa khởi tạo api cho nhà vận chuyển. Vui lòng liên hệ DEV!');
                    return;
                }
            }

            var data_rq = {
                invoice_id: invoice_id,
                transport_type: transport_type,
                isFreeship: isFreeship,
                store_id: store_id,
                shipper_id: shipper_id,
                shipper_code: shipper_code,
                shipper_pay: shipper_pay,
                create_type: create_type,
                sender: {
                    phone: obj_stock.phone,
                    province_name: obj_stock.province_name,
                    district_name: obj_stock.district_name,
                    ward_name: obj_stock.ward_name,
                    province_id: obj_stock.province_id,
                    district_id: obj_stock.district_id,
                    ward_id: obj_stock.ward_id,
                    address: obj_stock.address,
                }
            };

            $scope.obj_create_order.load = true;
            $http.post(_url + 'ajax_create_order_online', data_rq).then(r => {
                if (r.data && r.data.status) {
                    if (r.data.data.status) {
                        $scope.getList();
                        // $scope.updateShipperInvoice({
                        //     invoice_id: invoice_id,
                        //     shipper_id: shipper_id,
                        //     shipper_type_id: shipper_type_id,
                        //     warehouse_shipper_api_id: warehouse_shipper_api_id,
                        // });
                        showMessSuccess('Tạo mã vận đơn thành công');
                        $('#modal_create_order').modal('hide');
                    } else {
                        showMessErr(r.data.data.message);
                        $scope.obj_create_order.load = false;
                    }
                } else {
                    showMessErr(r.data.message);
                    $scope.obj_create_order.load = false;
                }
            }, function (data, status, headers, config) {
                showMessErrSystem();
            });
        } else {
            if (is_dev) {
                Swal.fire({
                    title: 'Bạn có chắc chắn?',
                    text: `Hành động này có thể sẽ xóa mã vận đơn và phí ship trả cho nhà vận chuyển`,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    cancelButtonText: 'Hủy',
                    confirmButtonText: 'Đồng ý',
                    allowOutsideClick: false,
                }).then((result) => {
                    if (result.value) {
                        $scope.obj_create_order.load = true;
                        $http.post(_url + 'ajax_remove_shipper_invoice_online', {
                            invoice_id: invoice_id
                        }).then(r => {
                            if (r.data && r.data.status) {
                                $scope.getList();
                                showMessSuccess();
                                $('#modal_create_order').modal('hide');
                            } else {
                                showMessErr(r.data.message);
                                $scope.obj_create_order.load = false;
                            }
                        }, function (data, status, headers, config) {
                            showMessErrSystem();
                        });
                    }
                })
            } else {
                showMessErr('Vui lòng chọn nhà vận chuyển!');
                return;
            }
        }
    }

    $scope.showModalCreateOrder = (item) => {
        $scope.resetEditCreateOrder();
        $scope.obj_create_order.cr_item = item;
        $scope.obj_create_order.shipper_id = angular.copy(item.shipper_id);
        var is_freeship = item.is_freeship == 'yes' ? true : false;
        $scope.obj_create_order.obj_type.manual.isFreeship = is_freeship;
        $scope.obj_create_order.obj_type.auto.isFreeship = is_freeship;
        $('#modal_create_order').modal('show');
        $scope.getListShipperStore(item.store_id);
    }

    $scope.confirmCancelOrder = (value) => {
        if (!value.warehouse_shipper_api_id) {
            showMessErr('Không xác định shipper api!');
            return;
        }

        Swal.fire({
            title: 'Hủy mã vận đơn?',
            text: `Bạn không thể hoàn nguyên điều này`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            cancelButtonText: 'Hủy',
            confirmButtonText: 'Đồng ý',
            allowOutsideClick: false,
        }).then((result) => {
            if (result.value) {
                $scope.cancelOrder(value);
            }
        })
    }

    $scope.checkXfast = (value) => {
        // if (!value.warehouse_shipper_api_id) {
        //     showMessErr('Không xác định shipper api!');
        //     return;
        // }else 
        if (!value.api_key) {
            showMessErr('Không tìm thấy api_key. Vui lòng liên hệ DEV!');
            return;
        }
        var obj_stock = $scope.list_warehouse_stocks.find(x => x.store_id == value.store_id);

        value.load = true;
        $http.post(_url + 'ajax_GHTK_check_xfast', {
            // warehouse_shipper_api_id: value.warehouse_shipper_api_id,
            api_key: value.api_key,
            pick_province: obj_stock.province_name,
            pick_district: obj_stock.district_name,
            pick_ward: obj_stock.ward_name,
            pick_street: obj_stock.address,
            cus_province: value.province_name,
            cus_district: value.district_name,
            cus_ward: value.ward_name,
            cus_street: value.address,
        }).then(r => {
            if (r.data && r.data.status) {
                var response = r.data.data;
                Swal.fire({
                    text: response.message,
                    icon: response.status ? 'success' : 'error',
                });
            } else {
                showMessErr(r.data.message);
            }
            value.load = false;
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope.cancelOrder = (value) => {
        var item = angular.copy(value);

        if (!item.api_key) {
            showMessErr('Không tìm thấy api_key. Vui lòng liên hệ DEV!');
            return;
        }
        var data_rq = {
            invoice_id: item.invoice_id,
            api_key: item.api_key,
            shipper_type_id: item.shipper_type_id,
            shipper_code: item.shipper_code,
        };
        value.load = true;
        $http.post(_url + 'ajax_cancel_order_online', data_rq).then(r => {
            if (r.data && r.data.status) {
                $scope.getList();
                showMessSuccess('Hủy mã vận đơn thành công')
            } else {
                showMessErr(r.data.message);
            }
            value.load = false;
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope.resetConfirmCancel = () => {
        $scope.obj_confirm_cancel = {
            load: false,
            note: '',
            item: {},
        }
    }

    $scope.confirmChangeShipStatus = (value, ship_status_id) => {
        if (!is_dev && !Number(value.shipper_id) && ![-1, 1].includes(ship_status_id)) {
            showMessErr('Vui lòng chọn Shipper cho đơn hàng này để thay đổi trạng thái');
            return;
        }

        $scope.resetConfirmCancel();
        if (ship_status_id == -1) {
            $scope.obj_confirm_cancel.item = value;
            $('#modal_confirm_cancel').modal('show');
            return;
        } else {
            Swal.fire({
                title: 'Bạn có chắc?',
                text: 'Chuyển trạng thái đơn hàng!',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                cancelButtonText: 'Hủy',
                confirmButtonText: 'Đồng ý',
                allowOutsideClick: false,
            }).then((result) => {
                if (result.value) {
                    $scope.updateStatus(value, ship_status_id);
                }
            })
        }
    }

    $scope.updateStatus = (value, ship_status_id, cancel_note = '') => {
        var item = angular.copy(value),
            data_rq = {
                invoice_id: item.invoice_id,
                ship_status_id: ship_status_id
            };

        if (ship_status_id == -1) {
            data_rq.cancel_note = '' + cancel_note;
        }
        value.load = true;
        $scope.obj_confirm_cancel.load = true;
        $http.post(_url + 'ajax_update_ship_status_id', data_rq).then(r => {
            if (r.data && r.data.status) {
                var data = r.data.data;
                showMessSuccess('Cập nhật trạng thái thành công');
                value.ship_status_id = ship_status_id + '';
                value.ship_status_name = shipStatusInfo(ship_status_id).name;
                value.ship_status_class_name = shipStatusInfo(ship_status_id).class_name;
                value.note = data.note;
                value.handler_id = data.handler_id;
                value.handler_logo = data.handler_logo;

                value.delivery_time_df = data.delivery_time;
                value.delivery_time = data.delivery_time ? moment(data.delivery_time).format('DD/MM/YYYY') : '';
                value.edit_delivery_time = false;

                value.finish_time = data.finish_time;
            } else {
                showMessErr(r.data.message);
            }
            value.load = false;
            $scope.obj_confirm_cancel.load = false;
            $('#modal_confirm_cancel').modal('hide');
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope.openChangeStoreInvoice = (value) => {
        var item = angular.copy(value);
        $scope.resetChangeStoreInvoice();
        $scope.obj_change_store_invoice.shipper_id = item.shipper_id;
        $scope.obj_change_store_invoice.store_id = item.store_id;
        $scope.obj_change_store_invoice.invoice_id = item.invoice_id;
        $('#modal_change_store_invoice').modal('show');
        select2();
    }

    $scope.changeStoreInvoice = () => {
        var item = angular.copy($scope.obj_change_store_invoice);

        $scope.obj_change_store_invoice.load = true;
        $http.post(_url + 'ajax_change_store_invoice_online', item).then(r => {
            if (r.data && r.data.status) {
                showMessSuccess('Thay đổi chi nhánh thành công');
                $('#modal_change_store_invoice').modal('hide');
                $scope.getList();
            } else {
                showMessErr(r.data.message);
            }
            $scope.obj_change_store_invoice.load = false;
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope.toggleRemoveProduct = (item) => {
        var index = $scope.obj_invoice.list_result.products.indexOf(item);
        $scope.obj_invoice.list_result.products.splice(index, 1);
        $scope.updateInvoice();
    }

    $scope.updateInvoice = () => {
        var cr_invoice = angular.copy($scope.obj_invoice),
            price = 0,
            discount_change = formatDefaultNumber(cr_invoice.discount_change),
            discount_type = cr_invoice.discount_type,
            ship_price = formatDefaultNumber(cr_invoice.ship_price),
            total = 0,
            list_result = cr_invoice.list_result,
            list_product = list_result.products,
            list_service = list_result.services,
            list_package = list_result.packages,
            list_debit = list_result.debits,
            list_unit = list_result.units,
            total_quatity = 0;

        if (list_unit.length) {
            var units_pro = list_unit.filter(x => x.type == 'product');
            total_quatity += units_pro.length;
        }

        if (list_product.length) {
            price += list_product.map(o => parseFloat(o.total)).reduce((a, c) => {
                return a + c;
            });

            total_quatity += list_product.map(o => parseInt(o.quantity)).reduce((a, c) => {
                return a + c;
            });
        }

        if (list_service.length) {
            price += list_service.map(o => parseFloat(o.total)).reduce((a, c) => {
                return a + c;
            });
        }

        if (list_package.length) {
            price += list_package.map(o => parseFloat(o.pay)).reduce((a, c) => {
                return a + c;
            });
        }

        if (list_debit.length) {
            price += list_debit.map(o => parseFloat(o.total)).reduce((a, c) => {
                return a + c;
            });
        }

        if (discount_type == 'percent') {
            discount = price * discount_change / 100;
        } else {
            discount = discount_change;
        }
        total = price - discount + ship_price;

        $scope.obj_invoice.discount = discount;
        $scope.obj_invoice.total = total;
        $scope.obj_invoice.price = price;
        $scope.obj_invoice.total_quatity = total_quatity;
    }

    $scope.totalItem = (value) => {
        var item = angular.copy(value),
            quantity = item.quantity ? item.quantity : 1,
            total_format = $scope.priceSale(item) * quantity;

        return parseFloat(total_format);
    }

    $scope.priceSale = (value) => {
        var item = angular.copy(value),
            price = formatDefaultNumber(item.price),
            price_sale = price,
            discount_type = item.discount_type,
            discount = formatDefaultNumber(item.discount);

        if (price > 0 && discount > 0) {
            if (discount_type == 'percent') {
                price_sale = price - (price * discount / 100);
            } else {
                price_sale = price - discount;
            }
        }
        return price_sale;
    }

    $scope.saveInvoice = () => {
        var invoice = angular.copy($scope.obj_invoice),
            list_product = invoice.list_result.products,
            flag_err = false;

        invoice.discount = formatDefaultNumber(invoice.discount);
        invoice.ship_price = formatDefaultNumber(invoice.ship_price);
        invoice.total = formatDefaultNumber(invoice.total);
        if (list_product && list_product.length) {
            $.each(list_product, function (key, pro) {
                pro.price = parseFloat(pro.price);
                pro.discount = formatDefaultNumber(pro.discount);
                pro.sale_user_id = invoice.sale_user_id;

                var discount_amount = 0;
                if (pro.discount_type == 'percent') {
                    if (pro.discount > 100) {
                        showMessErr(pro.name + ': giảm giá không hợp lệ!');
                        flag_err = true;
                        return false;
                    }
                    // discount_amount = pro.price * pro.discount / 100;
                } else if (pro.discount_type == 'amount') {
                    if (pro.discount > pro.price) {
                        showMessErr(pro.name + ': giảm giá không hợp lệ!');
                        flag_err = true;
                        return false;
                    }
                    // discount_amount = pro.discount;
                }
                // pro.discount_type = 'amount';
                // pro.discount = discount_amount;
            });
        } else {
            showMessErr('Vui lòng chọn sản phẩm cần trả!');
            return;
        }

        if (flag_err) return;

        if (invoice.total < 0) {
            showMessErr('Giảm giá sai!');
            return;
        }
        invoice.list_product = list_product;
        $scope._saveInvoice(invoice);
    }

    $scope._saveInvoice = (invoice) => {
        $scope.obj_invoice.load = true;
        $http.post(_url + 'ajax_add_invoice_online_return', invoice).then(r => {
            if (r.data && r.data.status) {
                $('#modal_edit').modal('hide');
                showMessSuccess('Tạo Phiếu thu hoàn trả thành công');
                $scope.getList();
            } else {
                showMessErr(r.data.message);
            }
            $scope.obj_invoice.load = false;
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope.chooseTypeDiscountInvoice = (type) => {
        $scope.obj_invoice.discount_type = type;
        $scope.updateInvoice();
    }

    $scope.resetEditInvocie = () => {
        $scope.obj_invoice = _obj_invoice();
    }

    $scope.searchByInvoiceId = (invoice_id) => {
        $scope.resetSearchList();
        $scope.filter_list.or_invoice_id = invoice_id;
        $scope.getList();
        $('[href="#home"]').trigger('click');
        window.history.pushState('', '', window.location.origin + window.location.pathname);
    }

    $scope.resetSearchList = () => {
        $scope.pagingInfo = {
            itemsPerPage: 50,
            offset: 0,
            to: 0,
            currentPage: 1,
            totalPage: 1,
            total: 0,
        };

        $scope.filter_list = {
            by_time: false, // có lọc theo tg hay không
            type_time: 'created', // loại tg là gì
            value_time: date_bw_today,
            key: '',
            store_id: ['0'],
            ship_status_id: ['0'],
            shipper_id: ['0'],
            or_invoice_id: or_invoice_id,
            exit_shipper_code: '0',
            invoice_type_sale: '0',
            collabors: [],
            create_invoices: [],
            sale_invoices: [],
            handler_invoices: [],
            products: [],
            product_groups: [],
            invoice_tags: [],
            limit: $scope.pagingInfo.itemsPerPage,
            offset: $scope.pagingInfo.offset,
        }
    }

    $scope.getList = (is_excel = 0) => {
        $("html, body").animate({
            scrollTop: 0
        }, 0);
        $('.table-content>tbody .item-checkbox:checked').attr('checked', false);
        $scope.filter_list.key = '';
        var obj_search = angular.copy($scope.filter_list),
            shipper_id = obj_search.shipper_id,
            collabors = obj_search.collabors,
            create_invoices = obj_search.create_invoices,
            sale_invoices = obj_search.sale_invoices,
            handler_invoices = obj_search.handler_invoices,
            invoice_tags = obj_search.invoice_tags,
            products = obj_search.products,
            product_groups = obj_search.product_groups,
            values_time = obj_search.value_time.split(' - '),
            times_start = values_time[0].split('/'),
            times_end = values_time[1].split('/'),
            _start = times_start[2] + '-' + times_start[1] + '-' + times_start[0],
            _end = times_end[2] + '-' + times_end[1] + '-' + times_end[0];

        if (obj_search.by_time) {
            if (obj_search.type_time == 'created') {
                obj_search.date_create_start = _start;
                obj_search.date_create_end = _end;
            } else if (obj_search.type_time == 'delivery_time') {
                obj_search.delivery_time_start = _start;
                obj_search.delivery_time_end = _end;
            } else if (obj_search.type_time == 'finish_time') {
                obj_search.finish_time_start = _start;
                obj_search.finish_time_end = _end;
                obj_search.ship_status_id = ['4']; // nếu lọc theo tg đối soát thì chỉ lấy đơn Đã đối soát
            }
        }

        if (obj_search.store_id.length) {
            if (obj_search.store_id.includes('0')) { // chọn tất cả
                obj_search.store_id = $scope.all_stores.map(x => x.id);
            }
        } else {
            showMessErr('Vui lòng chọn chi nhánh');
            return;
        }

        if (shipper_id.length) {
            // if (shipper_id.includes('0')) { // chọn tất cả
            //     shipper_id = $scope.all_shippers.map(x => x.id);
            // }
        } else {
            showMessErr('Vui lòng chọn nhà vận chuyển');
            return;
        }

        if (collabors.length) {
            obj_search.customer_id = collabors.map(x => x.customer_id);
        }

        if (create_invoices.length) {
            obj_search.import_id = create_invoices.map(x => x.id);
        }

        if (sale_invoices.length) {
            obj_search.sale_user_id = sale_invoices.map(x => x.id);
        }

        if (handler_invoices.length) {
            obj_search.handler_id = handler_invoices.map(x => x.id);
        }

        if (invoice_tags.length) {
            obj_search.invoice_tag_id = invoice_tags.map(x => x.id);
        }

        if (products.length) {
            obj_search.product_id = products.map(x => x.id);
        }

        if (product_groups.length && !product_groups.includes('0')) {
            obj_search.product_group_id = product_groups.map(x => x.group_id);
        }
        if ($scope.activeTab == 1 || $scope.activeTab == 2) {
            obj_search.offset = $scope.pagingInfo2.offset;
            obj_search.limit = $scope.pagingInfo2.itemsPerPage;
        }
        obj_search.is_excel = is_excel;

        $scope.load_list = true;
        $http.post(_url + 'ajax_get_list_online', obj_search).then(r => {
            if (r.data && r.data.status) {
                var data = r.data.data;
                if (is_excel) {
                    $.each(data, function (index, value) {
                        value.total = Number(value.total);
                        value.discount = Number(value.discount);
                        value.obj_invoice_details = JSON.parse(value.obj_invoice_details);
                        $.each(value.obj_invoice_details, function (key, pro) {
                            pro.total = pro.total.toFixed(1);
                        });
                        value.obj_customer_package_units = JSON.parse(value.obj_customer_package_units);
                        value.date = moment(value.date).format('DD-MM-YYYY');
                    });
                    $scope.data_export = data;
                    setTimeout(() => {
                        exportExel();
                    }, 200);
                } else {
                    var list = data.list,
                        count = data.count,
                        list_l = list.length;

                    $.each(list, function (index, value) {
                        value.created_df = value.created;
                        // value.delivery_time_df = value.delivery_time;
                        value.delivery_time = value.delivery_time ? moment(value.delivery_time).format('DD/MM/YYYY') : '';
                        value.created = moment(value.created).format('DD/MM/YYYY HH:mm');
                        value.updated_at = value.updated_at ? moment(value.updated_at).format('DD/MM/YYYY HH:mm') : '---';
                        value.ship_status_name = shipStatusInfo(value.ship_status_id).name;
                        value.ship_status_class_name = shipStatusInfo(value.ship_status_id).class_name;
                        value.status_class_name = statusName(value.status_id);
                        value.show_xfast = false;
                        if (!value.shipper_code && value.invoice_type_sale == 5 && value.shipper_type_id == 1) {
                            var obj_stock = $scope.list_warehouse_stocks.find(x => Number(x.store_id) == Number(value.store_id));
                            value.show_xfast = obj_stock && (value.province_id == obj_stock.province_id);
                        }
                        value.obj_user_collaborator = value.obj_user_collaborator ? JSON.parse(value.obj_user_collaborator) : null;
                        value.invoice_tag_logs = [];
                        value.filter_tag = {
                            key: '',
                            list: []
                        }
                        value.is_last_child = list_l > 2 && (index >= list_l - 2) && index != 0; // lấy 2 thằng cuối nếu list lớn hơn 2;
                    });

                    if ($scope.activeTab == 1 || $scope.activeTab == 2) {
                        $scope.chat_list = r.data.data.list;
                        $scope.pagingInfo2.total = r.data.data.count;
                        $scope.pagingInfo2.totalPage = Math.ceil(r.data.data.count / pi.itemsPerPage);
                    } else {
                        $scope.lists = list;
                        $scope.pagingInfo.total = count;
                        $scope.pagingInfo.totalPage = Math.ceil(count / $scope.pagingInfo.itemsPerPage);
                        $scope.getListInvoiceTagLog();
                    }
                    autoSize();
                }
            } else {
                showMessErr(r.data.message);
            }

            $scope.load_list = false;
            setTimeout(() => {
                handleCheckbox();
            }, 100)
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope.shipStatusInfo = (stt_id) => {
        return shipStatusInfo(stt_id);
    }

    $scope.addInvoice = () => {
        window.open(_url + 'sale_online');
    }

    $scope.openInvoiceDetail = (value, is_return = 1) => {
        var item = angular.copy(value);
        $scope.resetEditInvocie();
        $scope.clearEditInPopupVisa();
        $scope.resetMposTransactions();
        $scope.resetListVisaTransactions();
        $scope.resetSearchListVerifyPayment();
        $scope.resetChooseTypeTransactions();

        if (is_return == 1) {
            if (value.invoice_type_sale != 5) {
                showMessErr('Loại đơn hàng không phù hợp để tạo Đơn chuyển hoàn!');
                return;
            }
            if ([-1, 3].includes(parseInt(item.ship_status_id))) {
                showMessErr('Trạng thái đơn hàng không phù hợp để tạo Đơn chuyển hoàn!');
                return;
            }
            if (!item.warehouse_shipper_api_id) {
                showMessErr('Chưa khởi tạo api cho nhà vận chuyển! Vui lòng liên hệ DEV!');
                return;
            }
            $scope.obj_invoice.note = 'Hoàn từ đơn hàng ' + item.invoice_id;
        } else {
            $scope.obj_invoice.note = item.note;
            $scope.obj_invoice.note_print = item.note_print;
            $scope.obj_invoice.ship_price = item.ship_price;
        }

        $('#modal_edit').modal('show');
        $scope.obj_invoice.is_return = is_return;
        if (!is_return) {
            $scope.obj_invoice.ship_price = item.ship_price;
        }

        $scope.obj_invoice.cr_item = value;
        $scope.obj_invoice.invoice_type_sale = item.invoice_type_sale;
        $scope.obj_invoice.ship_status_id = item.ship_status_id;
        $scope.obj_invoice.discount_change = item.discount > 0 ? item.discount : item.discount * -1;
        $scope.obj_invoice.cod_amount = item.cod_amount;
        $scope.obj_invoice.visa = item.visa;
        $scope.obj_invoice.invoice_id = item.invoice_id;
        $scope.obj_invoice.store_id = item.store_id;
        $scope.obj_invoice.customer_id = item.customer_id;
        $scope.obj_invoice.date = item.date;
        $scope.getInvoiceDetail();
        if ($scope.obj_invoice.visa > 0) $scope.getInvoiceVisa();
        $scope.obj_invoice.transaction.vnpay.payDate = moment($scope.obj_invoice.date, 'YYYY-MM-DD').format('DD / MM / YYYY');
    }

    $scope.getInvoiceDetail = () => {
        $scope.obj_invoice.load = true;
        $http.get(_url + 'ajax_get_invoice_detail?invoice_id=' + $scope.obj_invoice.invoice_id).then(r => {
            if (r.data && r.data.status) {
                var data = r.data.data;

                $.each(data.invoice_products, function (index, value) {
                    var quantity = Number(value.quantity);
                    value.quantity_default = quantity;
                    value.quantity = quantity;
                    if ($scope.obj_invoice.is_return) {
                        value.note = '';
                    }
                });
                $scope.obj_invoice.list_result.products = data.invoice_products;

                if ($scope.obj_invoice.is_return) {
                    var _unit_products = [];
                    $.each(data.customer_package_units, function (index, value) {
                        if (value.type == 'product') {
                            var quantity = Number(value.quantity);
                            value.quantity_default = quantity;
                            value.quantity = quantity;
                            value.total = Number(value.price);
                            value.id = value.unit_id;

                            _unit_products.push(value);
                        }
                    });
                    $scope.obj_invoice.list_result.products.push(..._unit_products);

                } else {
                    $scope.obj_invoice.list_result.services = data.invoice_services;
                    $scope.obj_invoice.list_result.packages = data.customer_packages;
                    $scope.obj_invoice.list_result.units = data.customer_package_units;
                    $scope.obj_invoice.list_result.debits = data.customer_package_debits;
                }
            } else {
                showMessErr(r.data.message);
            }
            $scope.updateInvoice();
            $scope.obj_invoice.load = false;
            $('.input-format-number').trigger('keyup');
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope.getInvoiceVisa = () => {
        $scope.obj_invoice.load_visa = true;
        $http.get(_url + 'ajax_get_invoice_visa_by_invoice_id?invoice_id=' + $scope.obj_invoice.invoice_id).then(r => {
            if (r.data && r.data.status) {
                var data = r.data.data,
                    mpos = [],
                    vnpays = [],
                    banks = [];
                $.each(data, function (key, value) {
                    if (value.type == 1) {
                        mpos.push(value);
                    } else if (value.bank_id == 9) {
                        vnpays.push(value);
                    } else {
                        banks.push(value);
                    }
                });

                $scope.obj_invoice.transaction.list_vnpay = vnpays;
                $scope.obj_invoice.transaction.list_bank = banks;
                $scope.obj_invoice.transaction.list_mpos = mpos;
            } else {
                showMessErr(r.data.message);
            }
            $scope.obj_invoice.load_visa = false;
            $scope.updateInvoice();
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope.changeQuantity = (item) => {
        if (!item.quantity || item.quantity < 1) {
            item.quantity = 1;
        } else if (item.quantity > item.quantity_default) {
            item.quantity = angular.copy(item.quantity_default);
        }
        item.total = $scope.totalItem(item)
        $scope.updateInvoice();
    }

    $scope.openModalMoneyCheck = () => {
        $scope.resetMoneyCheck();
        $('#modal_money_check').modal('show');
    }

    $scope.sumbitMoneyCheck = () => {
        var input = document.getElementById('input-money-check'),
            fd = new FormData(),
            file = input.files[0];

        if (!file) {
            showMessErr('Vui lòng chọn file');
            showInputErr('.input-upload-exel');
            return;
        }
        $scope.resetMoneyCheck();
        $scope.obj_money_check.load = true;
        fd.append('file', file);
        $http({
            method: 'POST',
            url: _url + 'ajax_GHTK_money_check',
            headers: {
                'Content-Type': undefined
            },
            data: fd
        }).then(r => {
            if (r.data && r.data.status) {
                var data = r.data.data;
                $scope.obj_money_check.data = data.data;
                if (data.status) {
                    showMessSuccess();
                } else {
                    $scope.obj_money_check.message = data.message;
                }
            } else {
                showMessErr(r.data.message);
            }
            $scope.obj_money_check.load = false;
        }, function (response) {
            showMessErrSystem();
        });
        input.value = '';
    }

    $scope.checkPermit = (name, name_children = '') => {
        var ids = [];
        if (name_children) {
            ids = permit_invoice_online[name][name_children];

            if (name == 'ship_status_not_onl') {
                if (name_children == 'stt_2_5') {
                    if (is_only_receptionist) { // lễ tân có quyền chỉnh đơn chi nhánh họ được phân quyền
                        return true;
                    }
                }
            }
        } else {
            ids = permit_invoice_online[name];
        }
        return ids.includes(cr_user_id);
    }

    $scope.checkShow = (type, value = null) => {
        if (type == 'change_delivery_time') { // edit ngày giao hàng
            return $scope.checkPermit('change_delivery_time');
        } else if (type == 'confirm_visa') { // Xác nhận chứng từ
            if ($scope.checkPermit('confirm_visa') && value.confirm == 0) {
                return true;
            }
        } else if (type == 'edit_trans_code') {
            return $scope.checkPermit('edit_trans_code');
        } else if (type == 'add_visa') {
            if ($scope.checkPermit('add_visa') && value.invoice_type_sale == 5 && !value.is_return && ['1', '2', '5'].includes(value.ship_status_id)) {
                return true;
            }
        } else if (type == 'remove_visa') {
            if ($scope.checkPermit('remove_visa') && value.invoice_type_sale == 5 && !value.is_return && ['1', '2', '5'].includes(value.ship_status_id)) {
                return true;
            }
        } else if (type == 'menu_change_handler') {
            if (
                is_dev ||
                (
                    ['1', '2'].includes(value.ship_status_id) &&
                    value.invoice_type_sale == 5 &&
                    $scope.checkPermit('change_handler') && [0, cr_user_id].includes(Number(value.handler_id))
                )
            ) {
                return true;
            }
        } else if (type == 'add') { // tạo mới
            if (
                is_dev ||
                is_accountant ||
                is_consultant ||
                is_only_assistantmanager || [2521].includes(cr_user_id) ||
                handler_invoice_tgld) {
                return true;
            }
        } else if (type == 'return_invoice') { // Chuyển hoàn
            return $scope.checkPermit('return_invoice');
        } else if (type == 'money_check') { // đối soát excel
            return $scope.checkPermit('money_check');
        } else if (type == 'change_stt') {
            if (
                (
                    $scope.checkPermit('ship_status', 'stt_1') ||
                    $scope.checkPermit('ship_status', 'stt_2_5') ||
                    $scope.checkPermit('ship_status_not_onl', 'stt_2_5') ||
                    $scope.checkPermit('ship_status', 'stt_3') ||
                    $scope.checkPermit('ship_status', 'stt_4')
                ) &&
                value.invoice_type_sale == 5 || is_dev) {
                return true;
            }
        } else if (type == 'edit_invoice_tag_log') {
            if (is_dev || [cr_user_id].includes(Number(value.handler_id) || cr_user_id == value.import_id) || handler_invoice_tgld) {
                return true;
            }
        } else if (type == 'menu_change_shipper') { // chọn shipper
            if (
                ['1', '2', '5'].includes(value.ship_status_id) &&
                value.invoice_type_sale == 5 &&
                !value.shipper_code &&
                (
                    (
                        value.store_id != 47 && // đơn chi nhánh khác Trung Tâm online
                        $scope.checkPermit('change_shipper_not_onl')
                    ) ||
                    $scope.checkPermit('change_shipper')

                ) && [0, cr_user_id].includes(Number(value.handler_id)) ||
                is_dev
            ) {
                return true;
            }
        } else if (type == 'change_stt_cancel') { // Hủy
            if (
                ['1', '2'].includes(value.ship_status_id) &&
                !value.shipper_code &&
                (
                    cr_user_id == value.import_id ||
                    (
                        (
                            (
                                value.store_id != 47 && // đơn chi nhánh khác Trung Tâm online
                                $scope.checkPermit('ship_status_not_onl', 'stt_cancel_undo_cancel')
                            ) ||
                            $scope.checkPermit('ship_status', 'stt_cancel_undo_cancel')
                        ) && [0, cr_user_id].includes(Number(value.handler_id))
                    )
                ) ||
                (is_dev && !['-1'].includes(value.ship_status_id))
            ) {
                return true;
            }
        } else if (type == 'change_stt_undo_cancel') { // Bỏ hủy
            if (
                ['-1'].includes(value.ship_status_id) &&
                (
                    !value.shipper_code &&
                    (
                        cr_user_id == value.import_id ||
                        (
                            (
                                (
                                    value.store_id != 47 && // đơn chi nhánh khác Trung Tâm online
                                    $scope.checkPermit('ship_status_not_onl', 'stt_cancel_undo_cancel')
                                ) ||
                                $scope.checkPermit('ship_status', 'stt_cancel_undo_cancel')
                            ) && [0, cr_user_id].includes(Number(value.handler_id))
                        )
                    ) ||
                    is_dev
                )
            ) {
                return true;
            }
        } else if (type == 'change_stt_1') { // Chờ giao hàng trong chức năng chuyển trạng thái
            if (
                ['2', '5'].includes(value.ship_status_id) &&
                $scope.checkPermit('ship_status', 'stt_1') && [0, cr_user_id].includes(Number(value.handler_id)) ||
                (is_dev && !['1'].includes(value.ship_status_id))
            ) {
                return true;
            }
        } else if (type == 'change_stt_2') { //2: Đang giao hàng 
            if (
                ['1', '5'].includes(value.ship_status_id) &&
                (
                    (
                        (
                            value.store_id != 47 && // đơn chi nhánh khác Trung Tâm online
                            (
                                $scope.checkPermit('ship_status_not_onl', 'stt_2_5') &&
                                (
                                    !is_only_receptionist ||
                                    is_only_receptionist && $scope.user_per_store_ids.includes(Number(value.store_id))
                                )
                            )

                        ) ||
                        $scope.checkPermit('ship_status', 'stt_2_5')
                    ) && [0, cr_user_id].includes(Number(value.handler_id))
                ) ||
                (is_dev && !['2'].includes(value.ship_status_id))
            ) {
                return true;
            }
        } else if (type == 'change_stt_3') { //3: Đã chuyển hoàn
            if (
                ['1', '2'].includes(value.ship_status_id) && $scope.checkPermit('ship_status', 'stt_3') ||
                (is_dev && !['3'].includes(value.ship_status_id))
            ) {
                return true;
            }
        } else if (type == 'change_stt_4') { // 4: Đã đối soát
            if (
                ['1', '2', '5'].includes(value.ship_status_id) &&
                $scope.checkPermit('ship_status', 'stt_4') ||
                (is_dev && !['4'].includes(value.ship_status_id))
            ) {
                return true;
            }
        } else if (type == 'change_stt_5') { // 5: Giao thành công
            if (
                ['1', '2'].includes(value.ship_status_id) &&
                (
                    (
                        (
                            value.store_id != 47 && // đơn chi nhánh khác Trung Tâm online
                            $scope.checkPermit('ship_status_not_onl', 'stt_2_5')
                        ) ||
                        $scope.checkPermit('ship_status', 'stt_2_5')
                    ) && [0, cr_user_id].includes(Number(value.handler_id))
                ) ||
                (is_dev && !['5'].includes(value.ship_status_id))
            ) {
                return true;
            }
        } else if (type == 'create_order') { // Tạo mã vận đơn
            if (
                value.invoice_type_sale == 5 &&
                (!['-1'].includes(value.ship_status_id) &&
                    ($scope.checkPermit('create_order') || is_dev)
                )
            ) {
                return true;
            }
        } else if (type == 'cancel_order') { // hủy mã vận đơn
            if (
                value.shipper_code &&
                value.invoice_type_sale == 5 &&
                ($scope.checkPermit('cancel_order') || is_dev)
            ) {
                return true;
            }
        } else if (type == 'change_store_invoice') { // chuyển chi nhánh
            if (
                (
                    ['1'].includes(value.ship_status_id) &&
                    !value.shipper_code &&
                    value.invoice_type_sale == 5
                ) &&
                (cr_user_id == value.import_id || $scope.checkPermit('change_store_invoice')) ||
                is_dev
            ) {
                return true;
            }
        } else if (type == 'add_ship_price') {
            if (
                value.invoice_type_sale == 5 &&
                value.ship_price == 0 &&
                !value.shipper_code &&
                (
                    ['1', '2', '5'].includes(value.ship_status_id) &&
                    (
                        (
                            value.store_id != 47 && // đơn chi nhánh khác Trung Tâm online
                            $scope.checkPermit('add_ship_price_not_onl')
                        ) ||
                        $scope.checkPermit('add_ship_price')
                    ) && [0, cr_user_id].includes(Number(value.handler_id)) ||
                    is_dev
                )
            ) {
                return true;
            }
        }else if(type == 'export_excel'){
            if(is_dev || is_accountant || [cr_user_id].includes(2521)){
                return true;
            }
        }

        return false;
    }

    $scope.go2Page = function (page) {
        if (page < 0) return;
        var pi = $scope.pagingInfo;
        pi.currentPage = page;
        pi.from = pi.offset = (pi.currentPage - 1) * pi.itemsPerPage;
        $scope.filter_list.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter_list.offset = ($scope.pagingInfo.currentPage - 1) * $scope.pagingInfo.itemsPerPage;
        $scope.filter_list.or_invoice_id = 0;
        window.history.pushState('', '', window.location.origin + window.location.pathname);
        $scope.getList();
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

    // paging2
    $scope.go2Page2 = function (page) {
        if (page < 0) return;
        var pi = $scope.pagingInfo2;
        $scope.pagingInfo2.currentPage = page;
        pi.from = pi.offset = (pi.currentPage - 1) * pi.itemsPerPage;
        $scope.chatFilter.limit = $scope.pagingInfo2.itemsPerPage;
        $scope.chatFilter.offset = ($scope.pagingInfo2.currentPage - 1) * $scope.pagingInfo2.itemsPerPage;
        $scope.get_list_invoice_by_chat();
        pi.to = pi.total < pi.itemsPerPage ? pi.total : pi.itemsPerPage
    }

    $scope.Previous2 = function (page) {
        if (page - 1 > 0) $scope.go2Page2(page - 1);
        if (page - 1 == 0) $scope.go2Page2(page);
    }
    // end paging



    $scope.formatDefaultNumber = (num) => {
        return formatDefaultNumber(num)
    };

    $scope.showZoomImg = (src) => showZoomImg(src);

    $scope.testSm = () => {
        console.log($scope.post)
    }

    //----------Processs report --------------------

    $scope.initReport = () => {
        // $scope.stores = stores;
        if ($scope.isHasloadReport) {
            return;
        } else $scope.isHasloadReport = true;

        $scope.filterReport = {
            offset: 0,
            limit: 20,
            type_search: ['product_id'],
            store_ids: []
        };
        $scope.loading = {
            total: true,
            userTotal: true,
            userNumber: true,
            product: true
        };
        $scope.isChangeDate = true;
        $scope.colorDefault = ["#b91314", "#b79419", "#4de47c", "#726dd3", "#d54c69", "#5a1632", "#605481", "#b18b9c", "#df49ed", "#f54fc6", "#a9d1da", "#83ad05", "#1a09f5", "#cf33d9", "#d641a8", "#bba638", "#ca6e1a", "#5b82f3", "#d9ce5", "#162db0", "#9881f0", "#522750", "#8afd97", "#c91fe2", "#9a9585"];
        $scope.option_search = [{
                id: 'group_product_id',
                name: 'Nhóm sản phẩm'
            },
            {
                id: 'import_id',
                name: 'Người tạo'
            },
            {
                id: 'user_sale_id',
                name: 'Người bán'
            },
            {
                id: 'user_handler_id',
                name: 'Người xử lý'
            },
        ];
        $scope.getGroupProduct();
        $scope.loadDescription();
        setTimeout(() => {
            setDefaultDate();
            loadReport();
            $('.box-op').css('opacity', 1);
        }, 200);
    }

    $scope.changeOptionReport = () => {
        $scope.option_search.forEach(e => {
            if (!$scope.filterReport.type_search.find(r => {
                    return r == e.id
                })) {
                if (e.id == 'import_id') {
                    resetUserSearchimport_id();
                }
                if (e.id == 'user_sale_id') {
                    resetUserSearchuser_sale_id();
                }
                if (e.id == 'user_handler_id') {
                    resetUserSearchuser_handler_id();
                }
                if (e.id == 'group_product_id') {
                    $scope.filterReport.group_product_id = [];
                }
            }
        });
    }

    function getRandomColor() {
        let cls = [];
        for (let index = 0; index < 50; index++) {
            const randomColor = Math.floor(Math.random() * 16777215).toString(16);
            let color = "#" + randomColor;
            cls.push(color);
        }
        return cls;
    }

    $scope.loadDescription = () => {
        $scope.description = {
            total: 'Số lượng đơn / Tổng tiền',
            delivery: 'Số lượng đơn / Tổng tiền',
            return: 'Số lượng đơn / Tổng tiền',
            discount: 'Tiền giảm giá đơn hàng mới'
        };
        $is_prd = $scope.filterReport.type_search == 'product_id' && $scope.filterReport.product_id && $scope.filterReport.product_id.length != 0;
        $is_grprd = $scope.filterReport.type_search == 'group_product_id' && $scope.filterReport.group_product_id && $scope.filterReport.group_product_id.length != 0;
        if ($is_prd || $is_grprd) {
            $scope.description = {
                total: 'Số lượng SP / Tổng tiền SP',
                delivery: 'Số lượng SP / Tổng tiền SP',
                return: 'Số lượng SP / Tổng tiền SP',
                discount: 'Tiền giảm giá SP mới'
            };
        }

    }

    $scope.handlerFilter = () => {
        $scope.filterReport.user_sale_id = $scope.filter_list.sale_invoices ? $scope.filter_list.sale_invoices.map(r => {
            return r.id
        }) : [];
        $scope.filterReport.import_id = $scope.filter_list.create_invoices ? $scope.filter_list.create_invoices.map(r => {
            return r.id
        }) : [];
        $scope.filterReport.user_handler_id = $scope.filter_list.handler_invoices ? $scope.filter_list.handler_invoices.map(r => {
            return r.id
        }) : [];
        $scope.filterReport.product_id = $scope.filter_list.products ? $scope.filter_list.products.map(r => {
            return r.id
        }) : [];
        $scope.filterReport.group_product_id = $scope.filter_list.product_groups ? $scope.filter_list.product_groups.map(r => {
            return r.group_id
        }) : [];
        loadReport();
    }

    function loadReport() {
        $scope.getReportNewOld();
        if ($scope.isChangeDate) {
            $scope.getReportQuantityInvoiceUser();
            $scope.getReportTotalInvoiceUser();
            $scope.getReportProducts();
            $scope.isChangeDate = false;
        }
    }


    $scope.getReportNewOld = () => {
        $scope.loading.total = true;
        getFormatDataFilter();
        $http.get(base_url + '/statistics/ajax_get_report_old_new_online?filter=' + JSON.stringify($scope.filterReport)).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.total = r.data.data;
                $scope.loading.total = false;
                $scope.loadDescription();
            }
        })
    }

    $scope.getReportQuantityInvoiceUser = () => {
        getFormatDataFilter();
        let ft = angular.copy($scope.filterReport);
        ft.order_by = 'quantity';
        $scope.loading.userNumber = true;
        $http.get(base_url + '/statistics/ajax_get_report_top_users?filter=' + JSON.stringify(ft)).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.quantityUsers = r.data.data;
                $scope.loading.userNumber = false;
                $scope.setHeight();
            }
        })
    }

    $scope.getReportTotalInvoiceUser = () => {
        getFormatDataFilter();
        let ft = angular.copy($scope.filterReport);
        ft.order_by = 'total';
        $scope.loading.userTotal = true;
        $http.get(base_url + '/statistics/ajax_get_report_top_users?filter=' + JSON.stringify(ft)).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.totalUsers = r.data.data;
                $scope.loading.userTotal = false;
                $scope.setHeight();
            }
        })
    }

    $scope.getReportProducts = (val_limit) => {
        getFormatDataFilter();
        $scope.loading.product = val_limit ? false : true;
        ft = angular.copy($scope.filterReport);
        ft.limit = val_limit ? ft.limit + val_limit : 20;

        $scope.isGetSuccessProduct = false;
        $http.get(base_url + '/statistics/ajax_get_top_sale_product?filter=' + JSON.stringify(ft)).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.quantityProducts = r.data.data;
                $scope.totalProduct = r.data.count;
                $scope.loading.product = false;
                $scope.isGetSuccessProduct = true;
                $scope.setHeight();
            }
        })
    }

    angular.element(document.querySelector('.body-box')).bind('scroll', function () {
        let heightWhenScroll = $('.body-box').scrollTop() + $('.body-box').height();
        let ht = $scope.quantityProducts.length * 44 - 70
        if (heightWhenScroll >= ht && $scope.isGetSuccessProduct && $scope.totalProduct != $scope.quantityProducts.length) {
            $scope.getReportProducts($scope.quantityProducts.length - 10);
        }
    });

    $scope.setHeight = () => {
        if (!$scope.loading.userTotal && !$scope.loading.product && !$scope.loading.userNumber) {
            let arr = [
                $scope.quantityProducts.length,
                $scope.totalUsers.length,
                $scope.quantityUsers.length
            ];
            let max = Math.max(...arr) * 44;
            getColor(max / 44);
            if ($(window).width() > 765) {
                if (max < 400) {
                    max = 400;
                } else max = max + 20;

                if (max > 920) {
                    max = 920;
                    $('.box-top').css('max-height', max + 'px');
                    $('.box-top').css('overflow-y', 'auto');
                }
                $('.box-top').css('min-height', max + 'px');
            }
        }
    }

    function getColor(lenght) {
        if (lenght > $scope.colorDefault.length) {
            $scope.colorDefault = $scope.colorDefault.concat(getRandomColor());
        }
        return $scope.colorDefault;
    }

    function setDefaultDate() {
        $scope.filterReport.date = moment().format('01/MM/YYYY') + ' - ' + moment().format('DD/MM/YYYY')
    }

    function getFormatDataFilter() {
        let d1 = $scope.filterReport.date.split('-')[0].trim();
        let d2 = d1.split('/');
        let d3 = $scope.filterReport.date.split('-')[1].trim();
        let d4 = d3.split('/');
        $scope.filterReport.start_date = d2[2] + '-' + d2[1] + '-' + d2[0];
        $scope.filterReport.end_date = d4[2] + '-' + d4[1] + '-' + d4[0];
    }

    $scope.changeDate = () => {
        $scope.isChangeDate = true;
    }

    $scope.isShow = (type) => {
        if ($scope.filterReport && $scope.filterReport.type_search) {
            let has = $scope.filterReport.type_search.find(r => {
                return r == type
            });
            return has ? true : false;
        }
        return false;
    }

    $scope.getGroupProduct = () => {
        $scope.group_products = [];
        $http.get(base_url + '/ajax/ajax_get_group_products').then(r => {
            if (r.data && r.data.status == 1) {
                $scope.group_products = r.data.data;
                select2Level(100);
                setTimeout(() => {
                    $(".select_st").select2({
                        placeholder: "Chi nhánh"
                    });
                }, 200);
            }
        })
    }
});
app.directive("whenScrolled", function () {
    return {
        restrict: 'A',
        link: function (scope, elem, attrs) {
            // we get a list of elements of size 1 and need the first element
            raw = elem[0];
            // we load more elements when scrolled past a limit
            elem.bind("scroll", function () {
                if (raw.scrollTop + raw.offsetHeight + 5 >= raw.scrollHeight) {
                    scope.$apply(attrs.whenScrolled);
                }
            });
        }
    }
});
app.directive('mentionExample', function () {
    return {
        require: 'uiMention',
        link: function link($scope, $element, $attrs, uiMention) {
            /**
             * $mention.findChoices()
             *
             * @param  {regex.exec()} match    The trigger-text regex match object
             * @todo Try to avoid using a regex match object
             * @return {array[choice]|Promise} The list of possible choices
             */
            uiMention.findChoices = function (match, mentions) {
                return $scope.choices
                    // Remove items that are already mentioned
                    .filter(function (choice) {
                        return !mentions.some(function (mention) {
                            return mention.id === choice.id;
                        });
                    })
                    // Matches items from search query
                    .filter(function (choice) {
                        return ~(removeVietnameseTones((choice.first + ' ' + choice.last).toLowerCase().replace(/\s/g, ''))).indexOf(removeVietnameseTones(match[1]).toLowerCase());
                    });
            };
            uiMention.mentions.push($scope.choices[0], $scope.choices[1]);
            // $scope.$apply();
        }
    };
});

app.directive('enterSubmit', function () {
    return {
        restrict: 'A',
        link: function (scope, elem, attrs) {

            elem.bind('keydown', function (event) {
                var code = event.keyCode || event.which;
                if (code === 13) {
                    var content = this.value;
                    var caret = getCaret(this);
                    let tag_check = scope.old && scope.old.length && (scope.post.message && scope.post.message != '' && check_last_typing_is_tag(scope.post.message));
                    if (event.shiftKey || tag_check) {
                        // this.value = content.substring(0, caret) + "\n" + content.substring(caret, content.length);
                        // event.stopPropagation();
                    } else {
                        this.value = content.substring(0, caret) + content.substring(caret, content.length);
                        event.preventDefault();
                        scope.$apply(attrs.enterSubmit);
                    }
                }
                scope.old = angular.copy(scope.$mention.choices);
            });
        }
    }
});

function check_last_typing_is_tag(text) {
    let temp = text.split(' ');
    if ((temp[temp.length - 1] == "" || temp[temp.length - 1] == '/n') && temp[temp.length - 2].includes('$#$')) return true;
    return false;
}

function getCaret(el) {
    if (el.selectionStart) {
        return el.selectionStart;
    } else if (document.selection) {
        el.focus();
        var r = document.selection.createRange();
        if (r == null) {
            return 0;
        }
        var re = el.createTextRange(),
            rc = re.duplicate();
        re.moveToBookmark(r.getBookmark());
        rc.setEndPoint('EndToStart', re);
        return rc.text.length;
    }
    return 0;
}

function removeVietnameseTones(str) {
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    str = str.replace(/Đ/g, "D");
    // Some system encode vietnamese combining accent as individual utf-8 characters
    // Một vài bộ encode coi các dấu mũ, dấu chữ như một kí tự riêng biệt nên thêm hai dòng này
    str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // ̀ ́ ̃ ̉ ̣  huyền, sắc, ngã, hỏi, nặng
    str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // ˆ ̆ ̛  Â, Ê, Ă, Ơ, Ư
    // Remove extra spaces
    // Bỏ các khoảng trắng liền nhau
    str = str.replace(/ + /g, " ");
    str = str.trim();
    // Remove punctuations
    // Bỏ dấu câu, kí tự đặc biệt
    str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g, " ");
    return str;
}

function shipStatusInfo(id) {
    id = parseInt(id);
    var obj_return = {
        name: '',
        class_name: ''
    };
    switch (id) {
        case -1:
            obj_return = {
                name: 'Hủy',
                class_name: 'label-danger'
            }
            break;
        case 1:
            obj_return = {
                name: 'Chờ lấy hàng',
                class_name: 'label-warning'
            }
            break;

        case 2:
            obj_return = {
                name: 'Đang giao hàng',
                class_name: 'label-primary'
            }
            break;

        case 3:
            obj_return = {
                name: 'Đã chuyển hoàn',
                class_name: 'label-danger'
            }
            break;

        case 4:
            obj_return = {
                name: 'Đã đối soát',
                class_name: 'label-success'
            }
            break;

        case 5:
            obj_return = {
                name: 'Giao thành công',
                class_name: 'label-info'
            }
            break;

        default:
            obj_return = {
                name: 'Không xác định',
                class_name: 'label-default'
            }
            break;
    }
    return obj_return;
}

function statusName(id) {
    id = parseInt(id);
    var name = '';
    if ([1, 7, 9, 10, 20, 127, 128, 49, 410].includes(id)) {
        name = 'label-warning';
    } else if ([2, 3, 4, 12, 21, 123, 45].includes(id)) {
        name = 'label-info';
    } else if ([5, 6, 11].includes(id)) {
        name = 'label-success';
    } else if ([-1].includes(id)) {
        name = 'label-dark';
    } else if ([8].includes(id)) {
        name = 'label-danger';
    }
    return name;
}

jQuery(document).on('click', '.input-number-decrement, .input-number-increment', function () {
    var self = $(this),
        oldValue = self.parent().find("input"),
        max = oldValue.attr('max') ? oldValue.attr('max') : 10000,
        min = oldValue.attr('min') ? oldValue.attr('min') : 0,
        oldValue = oldValue.val() > 0 ? oldValue.val() : 0,
        newVal = oldValue;
    if (self.hasClass('input-number-increment')) {
        if (parseFloat(oldValue) + 1 <= parseInt(max))
            newVal = parseFloat(oldValue) + 1;
    } else {
        if (parseFloat(oldValue) - 1 >= parseInt(min))
            newVal = parseFloat(oldValue) - 1;
    }

    self.parent().find("input").val(newVal).trigger('input');
});

function showPopup(popup) {
    jQuery(popup).addClass('active').animate({
        scrollTop: 0
    }, 0);
    jQuery('body').addClass('popup-open');
}

function hidePopup(popup) {
    jQuery(popup).removeClass('active');
    jQuery('body').removeClass('popup-open');
}

function togglePopup(popup) {
    if (jQuery(popup).hasClass('active')) {
        hidePopup(popup);
    } else {
        showPopup(popup);
    }
}

function hideAllPopup() {
    hidePopup('.popup');
}

jQuery(document).on('click', '[date-toggle="popup"]', function () {
    let self = jQuery(this),
        target = self.attr('data-target');
    if (target) {
        jQuery(target).addClass('active').animate({
            scrollTop: 0
        }, 0);
    }
    jQuery('body').addClass('popup-open');
})

jQuery(document).on('click', '[data-dismiss=popup]', function () {
    let self = jQuery(this);
    self.closest('.popup').removeClass('active');
    jQuery('body').removeClass('popup-open');
})

function forcusSearchProduct() {
    $('#search-filter-input-product').focus().trigger('input');
}

function handleCheckbox() {
    const checkboxes = document.querySelectorAll('.table-list .item-checkbox');

    let lastChecked;

    function handleCheck(e) {
        let inBetween = false;
        if (e.shiftKey && this.checked) {
            checkboxes.forEach(checkbox => {
                if (checkbox.disabled) return;
                if (checkbox === this || checkbox === lastChecked) {
                    inBetween = !inBetween;
                }
                if (inBetween) {
                    checkbox.checked = true;
                }
            });
        }
        lastChecked = this;
    }
    checkboxes.forEach(checkbox => checkbox.addEventListener('click', handleCheck));
}


function checkFile(input) {
    var arrType = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        '.xlsx',
        '.xls',
        '.csv',
        'application/octet-stream',
    ];
    if (!arrType.includes(input.files[0].type)) {
        showMessErr(`File ${input.files[0].name} sai định dạng`);
        input.value = '';
    }
}

function select2(timeout = 50) {
    setTimeout(() => {
        $('.select2').select2();
    }, timeout)
}

function ToSlug(title) {
    if (title == '' || !title) return '';
    //Đổi chữ hoa thành chữ thường

    slug = title.toLowerCase();
    slug = slug.replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a');
    slug = slug.replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e');
    slug = slug.replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i');
    slug = slug.replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o');
    slug = slug.replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u');
    slug = slug.replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, 'y');
    slug = slug.replace(/đ/gi, 'd');
    //Xóa các ký tự đặt biệt
    slug = slug.replace(/\`|\~|\!|\@|\#|\||\$|\%|\^|\&|\*|\(|\)|\+|\=|\,|\.|\/|\?|\>|\<|\'|\"|\:|\;|_/gi, '');
    //Đổi khoảng trắng thành ký tự gạch ngang
    slug = slug.replace(/ /gi, " - ");
    //Đổi nhiều ký tự gạch ngang liên tiếp thành 1 ký tự gạch ngang
    //Phòng trường hợp người nhập vào quá nhiều ký tự trắng
    slug = slug.replace(/\-\-\-\-\-/gi, '-');
    slug = slug.replace(/\-\-\-\-/gi, '-');
    slug = slug.replace(/\-\-\-/gi, '-');
    slug = slug.replace(/\-\-/gi, '-');
    //Xóa các ký tự gạch ngang ở đầu và cuối
    slug = '@' + slug + '@';
    slug = slug.replace(/\@\-|\-\@|\@/gi, '');
    return slug;
}

function autoSize() {
    setTimeout(() => {
        autosize($('textarea.autosize'));
    }, 50);
}

jQuery(function ($) {
    $.datepicker.regional["vi-VN"] = {
        closeText: "Đóng",
        prevText: "Trước",
        nextText: "Sau",
        currentText: "Hôm nay",
        monthNames: ["Tháng một", "Tháng hai", "Tháng ba", "Tháng tư", "Tháng năm", "Tháng sáu", "Tháng bảy", "Tháng tám", "Tháng chín", "Tháng mười", "Tháng mười một", "Tháng mười hai"],
        monthNamesShort: ["Một", "Hai", "Ba", "Bốn", "Năm", "Sáu", "Bảy", "Tám", "Chín", "Mười", "Mười một", "Mười hai"],
        dayNames: ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"],
        dayNamesShort: ["CN", "Hai", "Ba", "Tư", "Năm", "Sáu", "Bảy"],
        dayNamesMin: ["CN", "T2", "T3", "T4", "T5", "T6", "T7"],
        weekHeader: "Tuần",
        firstDay: 1,
        isRTL: false,
        showMonthAfterYear: false,
        yearSuffix: ""
    };

    $.datepicker.setDefaults($.datepicker.regional["vi-VN"]);
    $.datepicker.setDefaults({
        dateFormat: 'dd/mm/yy'
    });
});

function exportExel() {
    var table = document.getElementById('table_excel'),
        html = table.outerHTML,
        url = 'data:application/vnd.ms-excel,' + encodeURIComponent(html), // Set your html table into url 
        elem = document.createElement('a');
    elem.setAttribute('href', url);
    elem.setAttribute('download', `export_iol_${moment().format('DD_MM_YYYY')}.xls`); // Choose the file name
    elem.click();
}

$(document).on({
    hover: function (e) {
        if ($(e.target).closest('#map_wrapper')) {
            $('#map_wrapper [title]').removeAttr('title');
            $('[role="tooltip"]').remove();
        }
    },
    click: function (e) {
        if ($(e.target).closest('#map_wrapper')) {
            $('#map_wrapper [title]').removeAttr('title');
            $('[role="tooltip"]').remove();
        }
    }
});

app.filter('convertToHumanDate', function () {
    return (value, onlyDate) => {
        return onlyDate ? moment(value, 'YYYY-MM-DD HH:mm:ss').format('DD/MM/YYYY') : moment(value, 'YYYY-MM-DD HH:mm:ss').format('DD/MM/YYYY HH:mm');
    };
});