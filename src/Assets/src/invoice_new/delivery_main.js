const _url = base_url + 'invoice_new/',
    _obj_invoice = function () {
        return {
            load: true,
            invoice_id: 0,
            total: 0,
            visa: 0,
            price: 0,
            discount: 0,
            discount_type: 'amount',
            discount_change: 0,
            total_quatity: 0,
            ship_price: 0,
            shipper_id: '0',
            note: '',
            note_print: '',
            list_result: {
                products: [],
                services: [],
                units: [],
                debits: [],
                packages: [],
            },
            customer_id: 0,
            customer_phone: '',
            customer_name: '',
            fullAddress: '',
            name: '',
            phone: '',
            confirm_type: 'paid',
            confirm_amount: '',
            confirm_note: '',
            confirm_image_url: '',
        }
    };
app.run(function ($rootScope) {
    $rootScope.post = {
        message: ""
    };
})
app.controller('deliveryControler', function ($scope, $http, $compile, $sce) {
    $scope.init = () => {
        $scope.$mentions = {};
        $scope.choices = [{
            first: 'bob',
            last: 'barker',
            id: 11123
        }, {
            first: 'kenny',
            last: 'logins',
            id: '123ab-123'
        }, {
            first: 'kyle',
            last: 'corn',
            id: '123'
        }, {
            first: 'steve',
            last: 'rodriguez',
            id: 'hi'
        }, {
            first: 'steve',
            last: 'holt',
            id: '0-9'
        }, {
            first: 'megan',
            last: 'burgerpants',
            id: 'ab-'
        }];

        $('#deliveryControler').fadeIn();
        $scope.is_dev = is_dev;
        $scope.current_user_id = current_user_id;
        $scope.resetTabList();
        $scope.getAllShipper();
    };

    $scope.getLocation = () => {
        $scope.mess_gps_err = '';
        if (navigator.geolocation) {
            // navigator.geolocation.watchPosition($scope.setPosition, $scope.showErrorGPS);
            navigator.geolocation.getCurrentPosition($scope.setPosition, $scope.showErrorGPS);
        } else {
            $scope.mess_gps_err = 'Không hổ trợ trình duyệt này.';
        }
    }

    $scope.showErrorGPS = (data) => {
        $scope.mess_gps_err = `Người dùng Từ chối truy cập vị trí địa lý. Hãy kiểm tra quyền cho phép truy cập vị trí của ứng dụng trên điện thoại bạn nhé.`;
    }

    $scope.setPosition = (position) => {
        if (is_dev) return;
        if (!$scope.obj_shipper.id) return;

        $scope.updateGPS(position);

        if ($scope.time_gps) clearTimeout($scope.time_gps);

        $scope.time_gps = setTimeout(() => {
            $scope.getLocation();
            $scope.$apply();
        }, 5000);
    }

    $scope.updateGPS = (position) => {
        var latitude = position.coords.latitude,
            longitude = position.coords.longitude;

        if ($scope.load_gps) return;

        $scope.load_gps = true;
        $http.post(base_url + 'warehouse_shipper/ajax_update_gps_shipper', {
            shipper_id: $scope.obj_shipper.id,
            latitude: latitude,
            longitude: longitude,
        }).then(r => {
            if (r.data && r.data.status) {
                // console.log('update GPG success');
            } else {
                // console.log(r.data.message);
            }
            $scope.load_gps = false;
        }, function (data, status, headers, config) {
            showMessErrSystem('Lỗi cập nhật tọa độ shipper');
            $scope.load_gps = false;
        });
    }

    $scope.checkShowUrlImageCustomer = (_url) => {
        var url = angular.copy(_url) + '';
        if (url.slice(0, 4) == 'http') { } else {
            url = base_url + url;
        }
        return url;
    }

    $scope.getAllShipper = () => {
        $scope.load_list = true;

        $http.get(base_url + 'warehouse_shipper/ajax_get_shipper_delivery').then(r => {
            $scope.load_list = false;
            if (r.data && r.data.status) {
                var data = r.data.data,
                    _shippers = [{
                        id: 0,
                        user_id: '0',
                        name: 'Chọn shipper'
                    }];
                $scope.list_shipper = [..._shippers, ...data];

                var exit_ = $scope.list_shipper.find(x => x.user_id == $scope.current_user_id);
                if (!exit_) $scope.current_user_id = '0';

                $scope.convertShipper();
                $scope.getLocation();
            } else {
                showMessErr('Không lấy được danh sách nhà vận chuyển');
            }
        }, function (data, status, headers, config) {
            showMessErr('Không lấy được danh sách nhà vận chuyển');
        });
    }

    $scope.convertShipper = () => {
        var obj_shipper = $scope.list_shipper.find(x => x.user_id == $scope.current_user_id);
        $scope.obj_shipper = obj_shipper;

        $scope.chooseTabList();
    }

    $scope.uploadFile = (input) => {
        var formData = new FormData(),
            file = '';
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
        if (!file) return;
        formData.append('file', file);
        $scope.obj_invoice.load = true;
        $http({
            method: 'POST',
            url: base_url + 'uploads/ajax_upload_to_filehost?func=invoice_new_delivery_main',
            headers: {
                'Content-Type': undefined
            },
            data: formData
        }).then(r => {
            if (r.data && r.data.status) {
                $scope.obj_invoice.confirm_image_url = r.data.data[0];
            } else {
                showMessErr(r.data.message);
            }
            $scope.obj_invoice.load = false;
        }, function (response) {
            showMessErrSystem();
        });
    }
    $scope.changeShipper = () => {
        $scope.convertShipper();
        // $scope.resetTabList();
        $scope.chooseTabList($scope.obj_tab_list.type);
    }
    $scope.closeChat = () => {
        $scope.chatopening = false;
        $scope.chat_list = [];
        $("body").css("overflow", "auto");
    }
    $scope.getChat = (item) => {
        $("body").css("overflow", "hidden");
        $scope.currentChat = item;
        $('#chat-container #chat').css('height', 'calc(100% - 112px');
        let data = {};
        data.invoice_id = item.invoice_id;
        data.deli = true;
        $http.get(_url + 'get_invoice_chat_content?filter=' + JSON.stringify(data)).then(r => {
            $scope.chatopening = true;
            if (r && r.data.status == 1) {
                $scope.chat_list = r.data.data;
                $scope.choices = r.data.users;
                let participant_id = '';
                angular.forEach(r.data.participants, function (value, key) {
                    if (key == 0) participant_id += value.id;
                    else participant_id += ',' + value.id;
                });
                $scope.currentChat.participant_id = participant_id;
                autoSize();
                scrollChat();
            } else toastr["error"]('Đã có lỗi xảy ra!');
        })
    }
    $scope.sendMessages = (item, extendClass = '') => {
        item.newMess = $('.mention-highlight' + extendClass).html();
        if (!item.newMess || item.newMess.trim() == "") return false;
        let data = {};
        data.invoice_id = item.invoice_id;
        data.messages = item.newMess;
        data.text = $('.mention-highlight').text();
        data.customer_name = item.name;
        data.customer_phone = item.phone;
        data.total = item.total;
        data.participant_id = item.participant_id;
        data.mentionids = get_list_id($scope.post.message);
        if ($scope.sending) return false;
        $scope.sending = true;
        $http.post(_url + 'ajax_send_invoice_messages', data).then(r => {
            delete $scope.sending;
            if (r && r.data.status == 1) {
                $scope.chat_list = r.data.data.data;
                delete item.newMess;
                $scope.post.message = "";
                scrollChat();
            } else toastr["error"](r.data.messages);
        })
    }
    $scope.converHtml = (htmlbd) => {
        return $sce.trustAsHtml(htmlbd);
    }
    $scope.confirmRemoveFile = () => {
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
                    $scope.obj_invoice.confirm_image_url = '';
                });
            }
        })
    }

    $scope.showModalConfirmDelivered = (value) => {
        var item = angular.copy(value);
        $scope.openInvoiceDetail(item, 'confirm');
    }

    $scope.confirmDelivered = () => {
        var invoice = angular.copy($scope.obj_invoice);
        if (!invoice.confirm_note.length && 0) {
            showMessErr('Ghi chú không được bỏ trống');
            showInputErr('.confirm_note');
            return;
        }
        invoice.confirm_amount = formatDefaultNumber(invoice.confirm_amount);
        invoice.shipper_name = $scope.obj_shipper.name;

        $scope.obj_invoice.load = true;
        $http.post(_url + 'ajax_confirm_delivered', invoice).then(r => {
            if (r.data && r.data.status) {
                showMessSuccess('Cập nhật trạng thái thành công');
                $scope.chooseTabList();
                $('#modal_detail_online').modal('hide');
            } else {
                showMessErr(r.data.message);
            }
            $scope.obj_invoice.load = false;
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope.resetInvocieDetail = () => {
        $scope.obj_invoice = _obj_invoice();
    }

    $scope.openInvoiceDetail = (value, action = 'view') => {
        var item = angular.copy(value);
        $scope.resetInvocieDetail();

        $('#modal_detail_online').modal('show');
        $scope.obj_invoice.action = action;
        $scope.obj_invoice.invoice_id = item.invoice_id;
        $scope.obj_invoice.cod_amount = item.cod_amount;
        $scope.obj_invoice.visa = item.visa;
        $scope.obj_invoice.total = item.total;
        $scope.obj_invoice.invoice_id = item.invoice_id;
        $scope.obj_invoice.fullAddress = item.fullAddress;
        $scope.obj_invoice.name = item.name;
        $scope.obj_invoice.phone = item.phone;
        $scope.getInvoiceDetail();
    }

    $scope.getInvoiceDetail = () => {
        $scope.obj_invoice.load = true;
        $http.get(_url + 'ajax_get_invoice_detail?invoice_id=' + $scope.obj_invoice.invoice_id).then(r => {
            if (r.data && r.data.status) {
                var data = r.data.data;

                $.each(data.invoice_products, function (index, value) {
                    var quantity = parseInt(value.quantity);
                    value.quantity = quantity;
                    if ($scope.obj_invoice.is_return) {
                        value.note = '';
                    }
                });
                $scope.obj_invoice.list_result.products = data.invoice_products;

                $scope.obj_invoice.list_result.services = data.invoice_services;
                $scope.obj_invoice.list_result.packages = data.customer_packages;
                $scope.obj_invoice.list_result.units = data.customer_package_units.filter(x => x.type == 'product' && (x.quantity = 1));
                $scope.obj_invoice.list_result.debits = data.customer_package_debits;
            } else {
                showMessErr(r.data.message);
            }
            $scope.obj_invoice.load = false;
            $('.input-format-number').trigger('keyup');
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope.confirmChangeShipStatus = (value, ship_status_id) => {
        var text_confirm = '';
        if (ship_status_id == 1) {
            text_confirm = 'Chuyển trạng thái về Chờ lấy hàng';
        } else if (ship_status_id == 2) {
            text_confirm = 'Chuyển trạng thái về Đang giao';
        } else if (ship_status_id == 5) {
            text_confirm = 'Chuyển trạng thái về Đã giao hàng';
        }

        Swal.fire({
            title: 'Bạn có chắc?',
            text: text_confirm,
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
                        $scope.updateStatus(value, ship_status_id);
                    });
                });
            },
        }).then(function () { });
    }

    $scope.updateStatus = (value, ship_status_id) => {
        var item = angular.copy(value),
            data_rq = {
                invoice_id: item.invoice_id,
                ship_status_id: ship_status_id
            };

        $http.post(_url + 'ajax_delivered_update_ship_status_id', data_rq).then(r => {
            if (r.data && r.data.status) {
                showMessSuccess('Cập nhật trạng thái thành công');
                $scope.chooseTabList();
            } else {
                showMessErr(r.data.message);
            }
            Swal.close();
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope.resetTabList = () => {
        $scope.obj_tab_list = {
            type: 'wait',
        }
    }

    $scope.chooseTabList = (type = '') => {
        $scope.obj_tab_list.type = type ? type : $scope.obj_tab_list.type;
        $scope.resetSearchList();
        $scope.lists = [];
        $scope.getList();
    }

    $scope.resetSearchList = (clear = false) => {
        var _filter = $scope.filter_list && !clear ? $scope.filter_list : {};
        $scope.filter_list = {
            by_date_create: _filter.by_date_create ? _filter.by_date_create : false,
            date_created: _filter.date_created ? _filter.date_created : date_bw_today,
            key: _filter.key ? _filter.key : '',
            shipper_id: $scope.obj_shipper.id,
            limit: 5,
            offset: -5,
        }
    }

    $scope.loadMoreList = (e) => {
        var self = $(e);
        div = self.get(0);
        if (div.scrollTop + div.clientHeight >= div.scrollHeight) {
            $scope.getList();
        }
    }

    $scope.getList = () => {
        if (!$scope.filter_list.shipper_id) return;
        if ($scope.filter_list.offset >= 0) {
            if ($scope.lists.length != $scope.filter_list.offset + $scope.filter_list.limit) {
                return;
            }
        }
        $scope.filter_list.offset += $scope.filter_list.limit;

        var obj_search = angular.copy($scope.filter_list),
            dates_created = obj_search.date_created.split(' - '),
            dates_start = dates_created[0].split('/'),
            dates_end = dates_created[1].split('/'),
            create_start = dates_start[2] + '-' + dates_start[1] + '-' + dates_start[0],
            create_end = dates_end[2] + '-' + dates_end[1] + '-' + dates_end[0],
            obj_tab_list = angular.copy($scope.obj_tab_list),
            cr_tab_type = obj_tab_list.type;

        if (cr_tab_type == 'wait') { // chưa nhận
            obj_search.ship_status_id = [1];
        } else if (cr_tab_type == 'delivering') { // đang giao
            obj_search.ship_status_id = [2];
        } else if (cr_tab_type == 'delivered') { //  Đã giao thành công
            obj_search.ship_status_id = [3, 4, 5]; // 3: Đã chuyển hoàn, 4: Đã đối soát, 5: Giao thành công
        }

        if (obj_search.by_date_create) {
            obj_search.date_create_start = create_start;
            obj_search.date_create_end = create_end;
        }

        $scope.load_list = true;
        $http.post(_url + 'ajax_get_list_delivery_invoice_online', obj_search).then(r => {
            if (r.data && r.data.status) {
                var data = r.data.data;

                $.each(data, function (index, value) {
                    value.created = moment(value.created).format('DD/MM/YYYY HH:mm');
                    value.delivery_time = moment(value.delivery_time).format('DD/MM/YYYY HH:mm');
                });
                $scope.lists.push(...data);
            } else {
                showMessErr(r.data.message);
            }

            $scope.load_list = false;
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope.formatDefaultNumber = (num) => {
        return formatDefaultNumber(num)
    };

    $scope.showZoomImg = (src) => showZoomImg(src);

    $scope.$watch('post.message', function () {
        setTimeout(() => {
            let height = $('#chat-container .msger-inputarea').outerHeight();
            height += 59;
            $('#chat-container #chat').css('height', 'calc(100% - ' + height + 'px');
        }, 10);
    });
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

$('.alert-dismissible').remove();
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

function select2(timeout = 50) {
    setTimeout(() => {
        $('.select2').select2();
    }, timeout)
}

function showInputErr(selector = '') {
    if (selector) {
        $(selector).addClass('boder-err');
        setTimeout(() => {
            $(selector).removeClass('boder-err');
        }, 1500);
    }
    return false;
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
function scrollChat() {
    setTimeout(() => {
        if ($(".chat_box .body").length > 0) {
            $(".chat-scroll").scrollTop($(".chat-scroll")[0].scrollHeight);
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
function autoSize() {
    setTimeout(() => {
        autosize($('textarea.autosize'));
    }, 50);
}