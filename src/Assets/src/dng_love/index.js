app = angular.module('app', []);
app.directive("whenScrolled", function() {
    return {
        restrict: 'A',
        link: function(scope, elem, attrs) {
            // we get a list of elements of size 1 and need the first element
            raw = elem[0];
            // we load more elements when scrolled past a limit
            elem.bind("scroll", function() {
                if (raw.scrollTop + raw.offsetHeight + 5 >= raw.scrollHeight) {
                    scope.$apply(attrs.whenScrolled);
                }
            });
        }
    }
});
app.directive('onErrorSrc', function() {
    return {
        link: function(scope, element, attrs) {
            element.bind('error', function() {
                if (attrs.src != attrs.onErrorSrc) {
                    attrs.$set('src', attrs.onErrorSrc);
                }
            });
        }
    }
});
app.controller('index', function($scope, $http, $sce) {
    $scope.init = () => {
        $scope.base_url = base_url;
        $scope.user_id = user_id;
        $scope.token = token;
        $scope.gameClose = check_time;

        $scope.qr_link = `<img src="https://chart.googleapis.com/chart?cht=qr&amp;chl=type=love%26heart_type_id=3%26receiver_id=${$scope.user_id}&amp;chs=200x200&amp;chld=L|0">`
        $scope.qr_link_download = base_url + 'dng_love/download_qr?user_id=' + $scope.user_id;
        $scope.getAll();

        // step by step
        $scope.swSelection = '1';
        // END step by step


        $scope.rankingFilter = {};
        $scope.rankingFilter.type = 'receive';
        $scope.rankingFilter.time = '0';
        $scope.balabnceShow = false;
        $scope.giftLoading = false;
        $scope.showType = 1;
        $scope.newTrans = {};

        $scope.extendSelect = true;
        $scope.peopleSelect = false;
        $scope.homeStep = 0;
        $scope.employeeFilter = {};
        $scope.employeeFilter.store_id = '-1'
        $scope.balanceFilter = {};
        $scope.historyFilter = {};
        $scope.historyFilter.type = 'all';
        $scope.sencondStep = 0;
        $scope.get_employess();
        $scope.get_heart_ranking();
        setTimeout(() => {
            $('.app-contain').removeClass('loading');
        }, 50);
        setTimeout(() => {
            checkUrlsParams();
        }, 100);
        $scope.reloadList = true;

        $scope.convertDetail = {};
    }
    $scope.fns = () => {
        $scope.multipleSelection = !$scope.multipleSelection;
        $scope.select2();
    }
    $scope.loadmoreTrans = () => {
        $scope.history_limit += 4;
        $scope.get_current_user_history();
    }

    function checkUrlsParams() {
        var url_string = window.location.href;
        var url = new URL(url_string);

        var qr_param = url.searchParams.get("type");
        if (!qr_param) return false;
        $scope.newTrans.note = 'Thanh toán QRCode';
        $scope.qr_scan = true;
        $scope.changeShowtype(2, 'heart');

        var receiver_param = url.searchParams.get("receiver_id");
        if (receiver_param) {
            $http.get(base_url + 'dng_love/get_detail_employee/' + receiver_param).then(r => {
                $scope.newTrans.sendSelectedPeoples = r.data.data;
                $scope.newTrans.note = 'Thanh toán QRCode';
            })
        }
        var heart_type_param = url.searchParams.get("heart_type_id");
        if (heart_type_param) {
            $scope.cannot_change_heart = true;
            $http.get(base_url + 'dng_love/get_detail_heart/' + heart_type_param).then(r => {
                $scope.newTrans.gift = r.data.data;
            })
        }
    }
    $scope.bind_val = () => {
        if ($('#step_ii').select2('data')) {
            $scope.selectedGroupName = $('#step_ii').select2('data')[0].text;
        }
        $scope.filLoading = true;
        let data = angular.copy($scope.employeeFilter);
        $http.get(base_url + 'dng_love/ajax_get_employess/1?filter=' + JSON.stringify(data)).then(r => {
            $scope.data_search = r.data.data;
            $scope.filLoading = false;
        })
    }
    $scope.toStep = (step) => {
        if ($scope.employeeFilter.store_id != -1) {
            $scope.swSelection = step;
            if ($('#step_i').select2('data')) {
                $scope.selectedStoreName = $('#step_i').select2('data')[0].text;
            }
            if (step == 2) {
                $scope.filLoading = true;
                $http.get(base_url + 'dng_love/ajax_get_employess/1?filter=' + JSON.stringify($scope.employeeFilter)).then(r => {
                    $scope.data_search = r.data.data;
                    $scope.filLoading = false;
                })
            }
            $scope.employeeFilter.group_id = '0'
            $scope.select2();
        }
    }
    $scope.appendTolist = () => {
        angular.forEach($scope.data_search, function(value, key) {
            if ($scope.check_people_selected(value.id) == -1) $scope.TempSendSelectedPeoples.push(value);
        });

        $scope.multipleSelection = false;
        $scope.employeeFilter.store_id = '-1';
        $scope.employeeFilter.group_id = '0';
        $scope.swSelection = 1;
        $scope.selectedStoreName = '';
        $scope.selectedGroupName = '';
        $scope.select2();
    }
    $scope.$watch('TempSendSelectedPeoples', function(newValue, oldValue) {
        setTimeout(() => {
            var x = $('.multi-selected').outerHeight();
            $('.popup-result').css('height', window.innerHeight - (120 + x) + 'px');
        }, 15);
    }, true);
    $scope.resetSelected = () => {
        $scope.TempSendSelectedPeoples = [];
    }

    function owlCarouselReset() {
        $('.gift-slider').owlCarousel({
            loop: true,
            margin: 0,
            nav: true,
            items: 1,
            dots: false,
            autoplay: true,
            autoplayTimeout: 5000

        });
        $('.gift-category-slider').owlCarousel({
            loop: false,
            margin: 0,
            nav: false,
            items: 5,
            dots: true,
            autoplay: false,
            autoplayTimeout: 5000
        });
        $('.owl-prev').html('<i class="fa fa-angle-left" aria-hidden="true"></i>');
        $('.owl-next').html('<i class="fa fa-angle-right" aria-hidden="true"></i>');
    }
    $scope.select2 = () => {
        setTimeout(() => {
            $('.select2').select2();
        }, 0);
    }
    $scope.get_policy = () => {
        $http.get(base_url + 'dng_love/ajax_get_the_policy').then(r => {
            $scope.the_policy = r.data.data;
        })
    }

    function reloadToken() {
        $http.get(base_url + 'dng_love/reload_token?user_id=' + $scope.user_id + '&token=' + $scope.token).then(r => {})
    }
    $scope.openHomeStep = (type) => {
        $scope.homeStep = type;
        $scope.showType = 0;
        switch (type) {
            case 'notification':
                $scope.notiFilter = {};
                $scope.notiFilter.limit = 15;
                $scope.get_notifications('all', false);
                break;
            case 'balance':
                $scope.balanceFilter = {};
                $scope.balanceFilter.type = 1;
                $scope.getAllOfBalance();
                reloadToken();
                break;
            case 'giftShop':
                $scope.giftFilter = {};
                $scope.gift_data = {};
                $scope.getGifts(true);
                $scope.getGiftCategories();
                break;
            case 'history':
                $scope.reply_status = true;
                $scope.history_limit = 10;
                $scope.histories = {};
                $scope.get_current_user_history();
                break;
            case 'ranking':
                $scope.rankingFilter.type = 'receive';
                $scope.rankingFilter.time = '0';
                $scope.get_heart_ranking();
                break;
            case 'shareSendTrans':
                $scope.notifiStatus = false;
                $scope.uploadShare = false;
                break;
            case 'policy':
                $scope.get_policy();
                break;
            case 'qrcode':
                setTimeout(() => {

                }, 50);
                break;
            case 'newyear':
                $scope.game_play = 1;
                $scope.firework_time = 1;
                $scope.fwConvert = true;
                getNewYearHistoties();
                break;
            case 'gameRank':
                $scope.grFilter = {
                    'type': 1,
                    'limit': 10
                }
                $scope.getgame_Rank(1, 10);
                break;
            case 'gameBag':
                getGameBag();
                break;
            default:
                break;
        }
        setTimeout(() => {
            $('.be-scroll').css('height', window.innerHeight - 60 + 'px');
            $('.be-scroll.ranking').css('height', window.innerHeight - 105 + 'px');
        }, 200);
    }

    $scope.hideConvert = (action = false) => {
        $scope.fwConvert = action;
    }

    function getGameBag() {
        $http.get(base_url + 'dng_love/get_game_bag').then(r => {
            if (r.data.status == 1) {
                $scope.game_bag = r.data.data;
            }
        })
    }
    $scope.getgame_Rank = (type = 0, limit = 0) => {
        if (type != 0) $scope.grFilter.type = type;
        $scope.grFilter.limit = (limit == 0) ? 10 : limit;
        $http.get(base_url + 'dng_love/get_game_ranking?filter=' + JSON.stringify($scope.grFilter)).then(r => {
            if (r.data.status == 1) {
                $scope.game_ranking = r.data.data;
            }
        })
    }

    function getNewYearHistoties() {
        $http.get(base_url + 'dng_love/get_new_y_his').then(r => {
            if (r.data.status == 1) {
                $scope.ny_his = r.data.data;
                $scope.balance_event = r.data.balance_data;
                $scope.closeSteal = r.data.closeCheck;
            }
        })
    }




    function getMobileOperatingSystem() {
        var userAgent = navigator.userAgent || navigator.vendor || window.opera;

        // Windows Phone must come first because its UA also contains "Android"
        if (/windows phone/i.test(userAgent)) {
            return "wd";
        }

        if (/android/i.test(userAgent)) {
            return "ad";
        }

        // iOS detection from: http://stackoverflow.com/a/9039885/177710
        if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
            return "ip";
        }
        return "unknown";
    }
    $scope.converHtml = (htmlbd) => {
        return $sce.trustAsHtml(htmlbd);
    }
    $scope.get_heart_ranking = (type = 'receive', limit = 10, heart_type = 'red', time = -1) => {
        $scope.rankingLoading = true;
        $scope.rankingFilter.type = type;
        $scope.rankingFilter.limit = limit;
        $scope.rankingFilter.heartTytpe = heart_type;
        // if (heart_type = 'black') {
        //     $scope.rankingFilter.type = 'receive';
        // }

        if (time != -1) {
            $scope.rankingFilter.time = time;
        }

        $http.get(base_url + 'dng_love/ajax_get_heart_ranking?filter=' + JSON.stringify($scope.rankingFilter)).then(r => {
            $scope.ranking_data = r.data.data;
            $scope.rankingLoading = false;
        })
    }
    $scope.loadMoreRank = () => {
        if ($scope.ranking_data.count > $scope.rankingFilter.limit) {
            $scope.rankingFilter.limit += 7;
            $scope.get_heart_ranking($scope.rankingFilter.type, $scope.rankingFilter.limit);
        } else return false;
    }
    $scope.get_current_user_history = (type = null) => {
        if (type != null) {
            $scope.historyFilter.type = type;
        } else {
            if ($scope.histories.count < $scope.historyFilter.limit) return false;
        }
        $scope.historyFilter.limit = $scope.history_limit;
        $http.get(base_url + 'dng_love/ajax_get_current_user_history?filter=' + JSON.stringify($scope.historyFilter)).then(r => {
            $scope.histories = {};
            $scope.histories.list = r.data.data;
            $scope.histories.current_user = r.data.current_user;
            $scope.histories.count = r.data.count;
        })
    }

    $scope.getGifts = (reload = false) => {
        $scope.loading = true;
        $('.owl-carousel').owlCarousel('refresh');
        $http.get(base_url + 'dng_love/ajax_get_all_gifts?filter=' + JSON.stringify($scope.giftFilter)).then(r => {
            $scope.loading = false;
            $scope.gift_data.all = r.data.data.all;
            if (reload == true) {
                $scope.gift_data.spotlight = r.data.data.spotlight;
                setTimeout(() => {
                    $('.gift-slider').owlCarousel({
                        loop: true,
                        margin: 0,
                        nav: true,
                        items: 1,
                        dots: false,
                        autoplay: false,
                        autoplayTimeout: 5000
                    });
                    $('.owl-prev').html('<i class="fa fa-angle-left" aria-hidden="true"></i>');
                    $('.owl-next').html('<i class="fa fa-angle-right" aria-hidden="true"></i>');
                }, 100);
            }
        })
    }
    $scope.getGiftCategories = () => {
        $http.get(base_url + 'dng_love/ajax_get_all_gift_Cat').then(r => {
            $scope.gift_cat_data = r.data.data;
            setTimeout(() => {
                $('.gift-category-slider').owlCarousel({
                    loop: false,
                    margin: 0,
                    nav: false,
                    items: 5,
                    dots: true,
                    autoplay: false,
                    autoplayTimeout: 5000
                });
                $('.owl-prev').html('<i class="fa fa-angle-left" aria-hidden="true"></i>');
                $('.owl-next').html('<i class="fa fa-angle-right" aria-hidden="true"></i>');
            }, 100);
        })
    };

    $scope.filterGift = (type, item) => {
        if (type == 1) {
            $scope.giftFilter.catItem = item;
            $scope.giftFilter.cat_id = item.id;
        } else if (type == 0) {
            delete $scope.giftFilter.catItem;
            delete $scope.giftFilter.cat_id;
        }
        $scope.getGifts();
    }
    $scope.getAllOfBalance = (type = 1) => {
        $scope.giftLoading = true;
        $scope.balanceFilter.type = type;
        $http.get(base_url + 'dng_love/ajax_get_all_of_balance?filter=' + JSON.stringify($scope.balanceFilter)).then(r => {
            $scope.allOfBalance = r.data.data;
            $scope.in_use_code = r.data.in_use;
            $scope.giftLoading = false;
        })
    }
    $scope.swipeLeft = function() {
        console.log(1);
    };
    $scope.readNotifi = (item) => {
        if (item.is_read == 1) return false;
        $http.get(base_url + 'dng_love/set_viewed_notifi/' + item.id).then(r => {
            if (r.data && r.data.status == 1) {
                item.is_read = 1;
            }
        })
    }
    $scope.removeNotification = (item, i) => {
        $http.get(base_url + 'dng_love/ajax_remove_notifi/' + item.id).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.recent_transactions.splice(i, 1);
            }
        })
    }
    $scope.sendReply = (item) => {
        if (!item.reply_value || item.reply_value == '') {
            toastr["error"]('Vui lòng nhập nội dung!');
            return false;
        }
        if (!$scope.reply_status) {
            toastr["error"]('Đang gửi!');
            return false;
        }
        $scope.reply_status = false;
        $http.post(base_url + 'dng_love/ajax_reply_transaction', item).then(r => {
            $scope.reply_status = true;
            if (r && r.data.status == 1) {
                item.notification_id = 1;
                item.reply = false;
                toastr.success('Gửi trả lời thành công!!');
            } else toastr["error"](r.data.messages);
        })
    }
    $scope.openReply = (index) => {
        var count = 0;
        angular.forEach($scope.histories.list, function(value, key) {
            value.reply = false;
            count++;
        });
        if (count == $scope.histories.list.length) {
            $scope.histories.list[index].reply = true;
        }
    }
    $scope.get_notifications = (type = false, limit = false) => {
        if (type) {
            $scope.notiFilter.type = type;
        }
        if (limit) {
            $scope.notiFilter.limit += 10;
            if ($scope.notiFilter.limit > $scope.notifi_count) {
                return false;
            }
        }
        $http.get(base_url + 'dng_love/get_current_user_notifications?filter=' + JSON.stringify($scope.notiFilter)).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.recent_transactions = r.data.data;
                $scope.notifi_count = r.data.count;
            }
        })
    }
    $scope.get_black_heart_price = () => {
        $http.get(base_url + 'dng_love/get_black_heart_price').then(r => {
            if (r.data && r.data.status == 1) {
                $scope.black_heart_price = r.data.data;
            }
        })
    }
    $scope.changeShowtype = (type, child_type = null) => {
        $scope.getAll();

        $scope.newTrans = {};
        $scope.TempSendSelectedPeoples = [];

        $scope.checkAdd = {}
        $scope.showType = type;
        $scope.showChildType = child_type;
        $scope.select2();
        setTimeout(() => {
            autosize($('textarea.autosize'));
        }, 50);
        switch (type) {
            case 1:
                setTimeout(() => {
                    $('.ranking-results').removeClass('loading');
                }, 200);
                break;
            case 2:
                // $scope.getRecentTransaction();
                if (child_type == 'rp') {
                    $scope.get_black_heart_price();
                }
                break;
            case 3:

                break;
            default:
                break;
        }
    }

    $scope.getRecentTransaction = () => {
        $http.get(base_url + 'dng_love/ajax_get_recent_people_trans').then(r => {
            $scope.recent_people_trans = r.data.data;
        })
    }
    $scope.getAll = () => {
        $http.get(base_url + 'dng_love/ajax_get_current_user_data?filter=' + JSON.stringify($scope.filter)).then(r => {
            $scope.fulldata = r.data.data;
        })
    }
    $scope.get_employess = (type = 0, limit = 0) => {
        $scope.employee_search = 1;
        let data = angular.copy($scope.employeeFilter);
        if (data.text && data.text.trim().toLowerCase() == 'dong phuong') {
            data.text = 'đông phương';
        }
        if (limit > 0) $scope.employeeFilter.limit = limit;
        $http.get(base_url + 'dng_love/ajax_get_employess?filter=' + JSON.stringify(data)).then(r => {
            $scope.employees = r.data.data;
            if (type == 1) {
                $scope.multipleSelection = false;
            }
        })
    }

    $scope.get_people_to_fire = (limit = 9) => {
        let data = { limit: limit };
        $http.get(base_url + 'dng_love/ajax_get_employess?filter=' + JSON.stringify(data)).then(r => {
            $scope.fire_employees = r.data.data;
            $scope.reloadList = false;
        })
    }
    $scope.get_employess_event = () => {
        $http.get(base_url + 'dng_love/ajax_get_employess_event?filter=' + JSON.stringify($scope.employeeFilter)).then(r => {
            $scope.revenger_fire_employees = r.data.data;
            $scope.changeFireListType('revenger');
        })
    }

    $scope.changeFireListType = (type) => {

        $scope.employee_search = (type == 'revenger') ? 2 : 1;
        $scope.listtype = type;
    }

    $scope.removePeopleText = () => {
        $scope.employeeFilter.text = '';
        $scope.get_employess();
    }
    $scope.check_people_selected = (id) => {
        if ($scope.TempSendSelectedPeoples) {
            return $scope.TempSendSelectedPeoples.findIndex(
                (i, index) => i.id === id
            );
        } else return -1;
    }
    $scope.removeSelection = (index) => {
        $scope.TempSendSelectedPeoples.splice(index, 1);
    }
    $scope.selectItemOfNewTrans = (item, type) => {
        switch (type) {
            case 'user':
                if (!$scope.extendSelect) {
                    // Sửa lại chọn 1 người
                    $scope.TempSendSelectedPeoples = [];
                    $scope.TempSendSelectedPeoples.push(item);
                    $scope.confirmSendPeople();
                } else {
                    var index = $scope.check_people_selected(item.id)
                    if (index >= 0) {
                        $scope.TempSendSelectedPeoples.splice(index, 1);
                    } else $scope.TempSendSelectedPeoples.push(item);
                }
                break;
            case 'gift':
                $scope.peopleSelect = false;
                $scope.newTrans.gift = item;
                break;
            default:
                break;
        }
        $scope.checkAddTrans();
    }

    $scope.fClick = (type) => {
        if (type == 1 && $scope.qr_scan) {
            return false;
        }
        if (type == 2 && $scope.cannot_change_heart) {
            return false;
        }
        $scope.peopleSelect = !$scope.peopleSelect;
        $scope.popupType = type;
        $scope.TempSendSelectedPeoples = ($scope.newTrans.sendSelectedPeoples) ? angular.copy($scope.newTrans.sendSelectedPeoples) : [];
        if (type == 2) {
            $scope.getAllOfBalance();
        }
    }
    $scope.confirmSendPeople = () => {
        $scope.newTrans.sendSelectedPeoples = angular.copy($scope.TempSendSelectedPeoples);
        $scope.peopleSelect = !$scope.peopleSelect;
        $scope.checkAddTrans();
    }
    $scope.giftItem = (item) => {
        $scope.homeStep = 0;
        $scope.showType = 2;
        $scope.newTrans = {};
        $scope.newTrans.gift = item;
        $scope.showChildType = 'heart';

    }
    $scope.useItem = (item) => {
        console.log(item);
    }
    $scope.checkAddTrans = (type = 'heart') => {
        $scope.checkAdd = {}
        $scope.checkAdd.reveiver = false;
        $scope.checkAdd.gift = false;
        $scope.checkAdd.quantity = false;
        $scope.checkAdd.note = false;
        if (!$scope.newTrans.sendSelectedPeoples || $scope.newTrans.sendSelectedPeoples.length <= 0) $scope.checkAdd.reveiver = true;

        if (type == 'heart') {
            if (!$scope.newTrans.gift) $scope.checkAdd.gift = true;
            if ($scope.newTrans.gift && $scope.newTrans.gift.id == 0 && (!$scope.newTrans.quantity || $scope.newTrans.quantity == 0)) $scope.checkAdd.quantity = true;
        }

        if (!$scope.newTrans.note || $scope.newTrans.note == '') $scope.checkAdd.note = true;
        if ($scope.checkAdd.reveiver || $scope.checkAdd.gift || $scope.checkAdd.note || $scope.checkAdd.quantity) {
            return false;
        }
        return true;
    }
    $scope.readyToCreateTrans = (type) => {
        if ($scope.showChildType == 'rp') {
            if (($scope.fulldata.balance - $scope.black_heart_price) < 0) {
                toastr.error('Bạn cần tối thiểu ' + $scope.black_heart_price + ' Tim đỏ để tiếp tục!');
                return false;
            }
            $scope.newTrans.gift = {
                'name': 'Tim đen',
                'id': 0,
            };
        }

        if (!$scope.checkAddTrans(type)) {
            return false;
        }
        if ($scope.newTrans.gift.TYPE == 'heart' && (!$scope.newTrans.quantity || $scope.newTrans.quantity == 0)) {
            toastr.error('Vui lòng nhập số lượng');
            return false;
        }
        // if ($scope.newTrans.gift.TYPE == 'gift') $scope.newTrans.quantity = 1;
        $scope.createTranSuccess = false;
        $scope.notifiStatus = true;
        $scope.notifiType = type == 'heart' ? 'confirmTrans' : 'confirmReportTrans';
    }

    $scope.viewGiftDetail = (item, type = 'buy') => { 

        $scope.giftLoading = true;

        $scope.plusCheck = false;
        $scope.notifiStatus = true;
        $scope.notifiType = 'giftDetail';
        $scope.newGiftTranfer = {};
        $scope.newGiftTranfer.quantity = 1;
        $scope.newGiftTranfer.id = item.id;
        $scope.newGiftTranfer.gift_name = item.name;

        $scope.giftDetailType = type;
        $scope.giftDetail = item;
        if (type == 'use') {
            $scope.usingSteps = 1;
            delete $scope.selectedDateList;
        }
        setTimeout(() => {
            $scope.giftLoading = false;
            $scope.$apply();
        }, 300);
    }
    $scope.checkquantity = (type) => {
        if (type == 'up') {
            $scope.newGiftTranfer.quantity++;
        } else {
            $scope.newGiftTranfer.quantity--;
        }
        var total = $scope.newGiftTranfer.quantity * $scope.giftDetail.price;
        if (total > $scope.fulldata.balance) {
            $scope.newGiftTranfer.quantity = $scope.newGiftTranfer.quantity - 1;
            toastr.error('Số dư không đủ!!')
        }
        if ($scope.newGiftTranfer.quantity < 0) $scope.newGiftTranfer.quantity = 0;
    }
    $scope.giftTransfer = () => {
        $scope.newGiftTranfer.gift_id = $scope.giftDetail.id;
        $scope.newGiftTranfer.action_role = $scope.giftDetail.action_role;
        $scope.newGiftTranfer.heart_type_exchange = $scope.giftDetail.heart_type_exchange;
        $http.post(base_url + 'dng_love/ajax_create_gift_transfer', $scope.newGiftTranfer).then(r => {
            if (r && r.data.status == 1) {
                toastr.success('Đổi thành công!!');
                $scope.getAll();
                $scope.notifiStatus = false;
            } else toastr["error"](r.data.message);
        })
    }
    $scope.get_time_keeping = (limit_type) => {
        if (limit_type) $scope.time_keeping_limit += 10;
        if ($scope.time_keeping_limit > 35) return false;
        $http.get(base_url + 'dng_love/ajax_get_timeKeeping/' + $scope.time_keeping_limit).then(r => {
            if (r && r.data.status == 1) {
                $scope.list_keeping = r.data.data;
                $scope.total_timekeeping = r.data.count;
            } else toastr["error"](r.data.messages);
        })
    }
    $scope.selectKeepingDate = (item) => {
        let d = new Date();
        let n = d.getMonth();
        if (n + 1 != item.month) {
            toastr["error"]('Đồng hồ chỉ áp dụng cho các ngày trong tháng!');
            return false;
        }
        $scope.tempTimekeeping = item;
    }
    $scope.closeNotifiModal = () => {
        if ($scope.usingSteps > 1) {
            $scope.usingSteps--;
            return;
        }
        $scope.notifiStatus = false;
        $scope.evenNone = false;

    }
    $scope.giftUsing = async() => {
        if (($scope.giftDetail.id == 7 || $scope.giftDetail.id == 8 || $scope.giftDetail.id == 9)) {
            switch ($scope.usingSteps) {
                case 1:
                    delete $scope.tempTimekeeping;
                    $scope.time_keeping_limit = 15;
                    $scope.get_time_keeping(false);
                    $scope.usingSteps++;
                    break;
                case 2:
                    // console.log($scope.tempTimekeeping);
                    // return;
                    // if ($scope.giftDetail.id == 8) {
                    //     $scope.newGiftTranfer.using_note = $scope.tempTimekeeping;
                    //     $scope.detail_using_gift($scope.newGiftTranfer);
                    //     return;
                    // }

                    if (!$scope.tempTimekeeping) return;
                    if ($scope.giftDetail.id == 7) $scope.tempTimekeeping.type = 1;
                    if ($scope.giftDetail.id == 8) $scope.tempTimekeeping.type = 2;
                    $http.post(base_url + 'dng_love/ajax_check_keepingtime', $scope.tempTimekeeping).then(r => {
                        if (r && r.data.status == 1) {
                            if (r.data.data.accept) {
                                $scope.newGiftTranfer.quantity = r.data.data.watch_quantity;
                                $scope.newGiftTranfer.timekeeping_id = $scope.tempTimekeeping.id;
                                $scope.usingSteps++;
                            } else {
                                toastr["warning"](r.data.message);
                                return;
                            }
                        } else {
                            toastr["error"](r.data.message);
                            return false;
                        }
                    })
                    break;
                case 3:
                    if (!$scope.newGiftTranfer.timekeeping_id) {
                        toastr["error"]('Vui lòng chọn ngày sử dụng!');
                        $scope.usingSteps--;
                        return false;
                    }
                    $scope.detail_using_gift($scope.newGiftTranfer);
                    break;
                default:
                    break;
            }
            return true;
        }
        if ($scope.giftDetail.gift_type == 1) $scope.usingSteps++;
        if ($scope.usingSteps == 3 || $scope.giftDetail.gift_type != 1) {
            $scope.detail_using_gift($scope.newGiftTranfer);
        }
    }
    $scope.detail_using_gift = async(item) => {
        $scope.transferloading = true;
        await $http.post(base_url + 'dng_love/ajax_using_gift', item).then(r => {
            $scope.transferloading = false;
            if (r && r.data.status == 1) {
                toastr.success('Đổi thành công!!');
                $scope.getAllOfBalance();
                $scope.notifiStatus = false;
                $scope.usingSteps++;
            } else toastr["error"](r.data.messages);
        })
    }
    $scope.share_event = (item) => {
        $scope.gameShare = true;
        $scope.gameShareObject = angular.copy(item);
    }
    $scope.hideGshare = () => {
        $scope.gameShare = false;
    }
    $scope.sendingGShare = () => {
        if ($scope.bumbing) {
            toastr["warning"]('Đang thực hiện');
            return false;
        }
        $scope.bumbing = true;
        $http.post(base_url + 'dng_love/ajax_sending_g_share', $scope.gameShareObject).then(r => {
            $scope.bumbing = false;
            if (r && r.data.status == 1) {
                toastr.success('Đã chia sẻ!');
                $scope.gameShare = false;
            } else toastr["error"](r.data.messages);
        })
    }
    $scope.toShare = (item) => {
        $scope.uploadShare = false;
        var tempGiftName = '';
        if (item.gift_name) {
            var tempGiftName = item.gift_name;
        } else tempGiftName = item.heart_type_name;

        $scope.newTrans = {
            'gift': {
                'id': item.gift_id,
                'name': tempGiftName,
                'img_url': item.img_url
            },
            'quantity': item.quantity,
            'note': item.note,
            'sendSelectedPeoples': [{
                'id': item.receive_user_id,
                'user_name': item.receiver_name,
            }],
            'sender': {
                'id': item.send_user_id,
                'user_name': item.sender_name
            }
        }
        $scope.openHomeStep('shareSendTrans');
    }
    $scope.createTrans = () => {
        if ($scope.evenNone) {
            toastr["warning"]('Đang thực hiện');
            return false;
        }
        
        $scope.evenNone = true;
        var data = {}
        data.receive_user_id = $scope.newTrans.sendSelectedPeoples;
        data.gift = {
            type: $scope.newTrans.gift.TYPE,
            id: $scope.newTrans.gift.id,
            name: $scope.newTrans.gift.name,
            action_role: $scope.newTrans.gift.action_role
        }
        data.quantity = ($scope.newTrans.quantity + '').replace(/,/g, "");
        if (!$scope.newTrans.quantity || $scope.newTrans.quantity == 'undefined' || data.quantity <= 0) {
            toastr["warning"]('Vui lòng kiểm tra số lượng!');
            return false;
        }
        data.note = $scope.newTrans.note;

        // console.log(data);
        // return false;

        if ($scope.notifiType == 'confirmReportTrans') {
            data.gift_name = 'Tim đen';
            $http.post(base_url + 'dng_love/ajax_create_report_transaction', data).then(r => {
                $scope.evenNone = false;
                if (r && r.data.status == 1) {
                    $scope.createTranSuccess = true;
                    $scope.employeeFilter.text = '';
                } else toastr["error"](r.data.messages);
            })
        } else {
            $http.post(base_url + 'dng_love/ajax_create_transaction', data).then(r => {
                $scope.evenNone = false;
                if (r && r.data.status == 1) {
                    $scope.createTranSuccess = true;
                    $scope.evenNone = false;
                    $scope.employeeFilter.text = '';
                } else toastr["error"](r.data.message);
            })
        }
    }
    $scope.homeBack = () => {
        $scope.notifiStatus = false;
        $scope.showType = 1;
        $scope.newTrans = {};
        $scope.getAll();
        setTimeout(() => {
            $('.ranking-results').removeClass('loading');
        }, 200);
    }
    $scope.homebackTop = () => {

        if ($scope.game_play == 2 || $scope.homeStep == 'gameRank' || $scope.homeStep == 'historiesGame' || $scope.homeStep == 'gameBag') {
            $scope.game_play = 1;
            $scope.homeStep = 'newyear';
            return true;
        }

        $scope.rankingFilter.time = '0';
        $scope.get_heart_ranking('receive', 10);
        $scope.getAll();
        if ($scope.homeStep == 'shareSendTrans' && !$scope.uploadShare) {
            $scope.confirmModalContent = 'Chưa hoàn thành tác vụ, thoát ngay dữ liệu sẽ bị mất!';
            $('#confirmModal').modal('show');
            return false;
        }
        $scope.homeStep = 0
        $scope.showType = 1;
        setTimeout(() => {
            $('.ranking-results').removeClass('loading');
        }, 200);
        if ($scope.game_play == 2) {
            $scope.game_play = 1;
            $scope.get_employess();
        }
    }
    $scope.confirmAction = (type) => {
        switch (type) {
            case 'homeback':
                $('#confirmModal').modal('hide');
                $scope.newTrans = {};
                $scope.homeStep = 0
                $scope.showType = 1;
                setTimeout(() => {
                    $('.ranking-results').removeClass('loading');
                }, 200);
                break;
            default:
                break;
        }
    }
    $scope.openCodeDetail = (item) => {
        $scope.sencondStep = 'code-detail';
        $scope.codeDetailItem = item;
    }
    $scope.backToSecondStep = () => {
        $scope.sencondStep = 0;
    }
    $scope.updateCodeActive = (code, type) => {
        var data = {
            'id': code.id,
            'active': code.active,
            'type': type,
            'gift_name': code.name
        }
        $http.post(base_url + 'dng_love/ajax_update_CodeActive', data).then(r => {
            if (r && r.data.status == 1) {
                toastr.success(r.data.messages);
                $scope.getAllOfBalance(2);
                if (type == 'request') {
                    code.active = 2;
                } else {
                    code.active = 0;
                }
            } else toastr["error"](r.data.messages);
        })
    }

    $scope.attachFile = () => {
        $('#inputFileEdit').click();
    }
    $scope.imageUpload = function(element) {
        var files = event.target.files; //FileList object
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var reader = new FileReader();
            reader.onload = function(readerEvent) {
                var avatarImg = new Image();
                var src = reader.result;
                avatarImg.src = src;
                document.getElementById("dataUrl").innerText = src;
                avatarImg.onload = function() {
                    var c = document.getElementById("myCanvas");
                    var ctx = c.getContext("2d");
                    ctx.canvas.width = avatarImg.width;
                    ctx.canvas.height = avatarImg.height;
                    ctx.drawImage(avatarImg, 0, 0);
                };
            }
            reader.readAsDataURL(file);
        }
        $scope.saveImage(files)
    }
    $scope.saveImage = (files) => {
        var formData = new FormData();
        formData.append('file', files[0]);
        $scope.loading = true;
        $http({
            url: base_url + '/dng_love/ajax_upload_image_license',
            method: "POST",
            data: formData,
            headers: {
                'Content-Type': undefined
            }
        }).then(r => {
            $scope.loading = false;
            if (r.data.status == 1) {
                if ($scope.gameShare) {
                    $scope.gameShareObject.img_url = r.data.url;
                    return true;
                }
                $scope.newTrans.img_url = r.data.url;
            } else {
                toastr["error"](r.data.message)
            }
        })
    }
    $scope.sendingShare = () => {
        $scope.loading = true;
        var data = {
            'receiver_id': $scope.newTrans.sendSelectedPeoples[0].id,
            'gift_name': $scope.newTrans.gift.name,
            'gift_id': $scope.newTrans.gift.id,
            'note': $scope.newTrans.note,
            'share_note': $scope.newTrans.share_note,
            'gift_quantity': $scope.newTrans.quantity,
            'image_url': ($scope.newTrans.img_url) ? $scope.newTrans.img_url : '',
            'sender_id': ($scope.newTrans.sender) ? $scope.newTrans.sender.id : null,
        }
        $http.post(base_url + 'dng_love/send_WP_transaction', data).then(r => {
            $scope.loading = false;
            if (r && r.data.status == 1) {
                toastr.success('Đã đăng bài!!');
                $scope.uploadShare = true;
                $scope.newTrans.successMess = 'https://diemnhangroup.workplace.com/' + r.data.post_id;
            } else {
                toastr["error"](r.data.message);
            }
        })
    }
    $scope.extendSelection = () => {
        $scope.extendSelect = !$scope.extendSelect;
    }

    $scope.hideSteal = () => {
        $scope.stealStatus = false;
    }
});