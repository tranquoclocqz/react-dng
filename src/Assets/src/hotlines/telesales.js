//hỗ trợ reconnect socket; 
!function (a, b) { "function" == typeof define && define.amd ? define([], b) : "undefined" != typeof module && module.exports ? module.exports = b() : a.ReconnectingWebSocket = b() }(this, function () { function a(b, c, d) { function l(a, b) { var c = document.createEvent("CustomEvent"); return c.initCustomEvent(a, !1, !1, b), c } var e = { debug: !1, automaticOpen: !0, reconnectInterval: 1e3, maxReconnectInterval: 3e4, reconnectDecay: 1.5, timeoutInterval: 2e3 }; d || (d = {}); for (var f in e) this[f] = "undefined" != typeof d[f] ? d[f] : e[f]; this.url = b, this.reconnectAttempts = 0, this.readyState = WebSocket.CONNECTING, this.protocol = null; var h, g = this, i = !1, j = !1, k = document.createElement("div"); k.addEventListener("open", function (a) { g.onopen(a) }), k.addEventListener("close", function (a) { g.onclose(a) }), k.addEventListener("connecting", function (a) { g.onconnecting(a) }), k.addEventListener("message", function (a) { g.onmessage(a) }), k.addEventListener("error", function (a) { g.onerror(a) }), this.addEventListener = k.addEventListener.bind(k), this.removeEventListener = k.removeEventListener.bind(k), this.dispatchEvent = k.dispatchEvent.bind(k), this.open = function (b) { h = new WebSocket(g.url, c || []), b || k.dispatchEvent(l("connecting")), (g.debug || a.debugAll) && console.debug("ReconnectingWebSocket", "attempt-connect", g.url); var d = h, e = setTimeout(function () { (g.debug || a.debugAll) && console.debug("ReconnectingWebSocket", "connection-timeout", g.url), j = !0, d.close(), j = !1 }, g.timeoutInterval); h.onopen = function () { clearTimeout(e), (g.debug || a.debugAll) && console.debug("ReconnectingWebSocket", "onopen", g.url), g.protocol = h.protocol, g.readyState = WebSocket.OPEN, g.reconnectAttempts = 0; var d = l("open"); d.isReconnect = b, b = !1, k.dispatchEvent(d) }, h.onclose = function (c) { if (clearTimeout(e), h = null, i) g.readyState = WebSocket.CLOSED, k.dispatchEvent(l("close")); else { g.readyState = WebSocket.CONNECTING; var d = l("connecting"); d.code = c.code, d.reason = c.reason, d.wasClean = c.wasClean, k.dispatchEvent(d), b || j || ((g.debug || a.debugAll) && console.debug("ReconnectingWebSocket", "onclose", g.url), k.dispatchEvent(l("close"))); var e = g.reconnectInterval * Math.pow(g.reconnectDecay, g.reconnectAttempts); setTimeout(function () { g.reconnectAttempts++, g.open(!0) }, e > g.maxReconnectInterval ? g.maxReconnectInterval : e) } }, h.onmessage = function (b) { (g.debug || a.debugAll) && console.debug("ReconnectingWebSocket", "onmessage", g.url, b.data); var c = l("message"); c.data = b.data, k.dispatchEvent(c) }, h.onerror = function (b) { (g.debug || a.debugAll) && console.debug("ReconnectingWebSocket", "onerror", g.url, b), k.dispatchEvent(l("error")) } }, 1 == this.automaticOpen && this.open(!1), this.send = function (b) { if (h) return (g.debug || a.debugAll) && console.debug("ReconnectingWebSocket", "send", g.url, b), h.send(b); throw "INVALID_STATE_ERR : Pausing to reconnect websocket" }, this.close = function (a, b) { "undefined" == typeof a && (a = 1e3), i = !0, h && h.close(a, b) }, this.refresh = function () { h && h.close() } } return a.prototype.onopen = function () { }, a.prototype.onclose = function () { }, a.prototype.onconnecting = function () { }, a.prototype.onmessage = function () { }, a.prototype.onerror = function () { }, a.debugAll = !1, a.CONNECTING = WebSocket.CONNECTING, a.OPEN = WebSocket.OPEN, a.CLOSING = WebSocket.CLOSING, a.CLOSED = WebSocket.CLOSED, a });
//=====================-=============================

$(document).on('keypress', function (e) {
    if (e.which == 13) {
        $("button.btn.btn-default").click();
    }
});

app.controller('callCtrl', function ($scope, $http) {
    var call = this;
    // var socket = new ReconnectingWebSocket(`ws://kerio.seoulspa.vn:10432?user=<?php  echo get_current_user_name()?>&pass=d$nmA!93H&line=131`, null, { debug: true, reconnectInterval: 3000 });
    const socket = new WebSocket('ws://kerio.seoulspa.vn:10432?user=' + user_name + '&pass=d$nmA!93H&line=131');
    call.init = () => {
        call.listCustomer = [];
        call.lsCushasConnect = [];
        call.customer = {};
        call.orderNow = {};
        call.invoices = {};
        call.appointment = [];
        call.showPopup = 0;
        call.isload = true;
        call.isShowCall = 0;
        call.isConnect = true;
        $('.box1').css('opacity', '1');
        call.getHistoryCall();
        call.getUser();
        setTimeClose();

        $scope.filter = {};
        $scope.type = {};
        $scope.filter.store_id = '1';
        $scope.isRestart = false;
    }
    $scope.restartSocket = () => {
        $scope.isRestart = true;
        $http.get(base_url + '/hotlines/ajax_restart_hotlines').then(r => {
            if (r.data) {
                $scope.isRestart = false;
            }
        })
    }

    socket.onopen = function (event) {
        $scope.$apply(function () {
            call.isConnect = true;
        });
        $('.status').removeClass('label-danger');
        $('.status').removeClass('cus1');
        $('.status').addClass('label-success');
        $('.status').html('ĐÃ KẾT NỐI')
        $('.box-main').removeClass('box-danger');
        $('.box-main').addClass('box-success');
        $('#restartSocket').css('display', 'none');
        call.listCustomer = [];
    }

    socket.onmessage = function (msg) {
        try {
            var data = JSON.parse(msg.data);
        } catch (error) {
            var data = msg.data;
        }
        if (data && data.status) {
            var xx = call.listCustomer;
            console.log('----begin----')
            console.log('data trả về', data);
            console.log('mảng hiện tại', xx);
            console.log('----end----')
            $scope.$apply(function () {
                var index = call.listCustomer.findIndex(i => { return i.callid == data.callid; });
                var indexhas = call.lsCushasConnect.findIndex(i => { return i.callid == data.callid; });
                data.avatar = data.avatar === '' ? './assets/images/noimg.png' : data.avatar;

                var timeNow = getTime();
                data.time = timeNow.time;
                data.timeOut = new Date();
                data.date = moment().format('DD/MM/YYYY')

                
                if (data.status == -2 && index != -1) {
                    // nếu trả về -2 thì xóa luôn
                    call.listCustomer.splice(index, 1);
                }

                if (data.status != -2 && (data.status === 1 || index < 0)) {
                    // trường hợp gọi đến hoặc chưa có dữ liệu trong tham số hiện tại
                    call.listCustomer.unshift(data);
                    call.lsCushasConnect.unshift(data);
                    call.playSound();

                } else {
                    call.listCustomer[index] = data;
                    if (data.status == -1) {
                        call.lsCushasConnect[indexhas].call_status = call.lsCushasConnect[indexhas].status == 4 ? 'Answered' : 'Missed';

                    } else {
                        call.lsCushasConnect[indexhas] = data;
                    }
                }
            })
        } else {
            $('.msg').prepend(`<span class="text-primary">${decodeURI(msg.data)}</span><br>`)
        }
    }

    //set time remove call stop
    setTimeClose = function () {
        setTimeout(() => {
            var tmp = [];
            call.listCustomer.forEach(i => {
                var timeOut = new Date();
                if (i.status == -1 && (timeOut - i.timeOut) >= 5000) {
                    var index = call.listCustomer.findIndex(e => { return e.callid == i.callid; });
                    $scope.$apply(function () {
                        call.listCustomer.splice(index, 1);

                    });
                }

            });
            setTimeClose();
        }, 2500);
    };

    socket.onclose = function () {
        handlerErr();
    }

    socket.onerror = function () {
        handlerErr();
    }

    handlerErr = function () {
        $scope.$apply(function () {
            call.isConnect = false;
        });
        $('.status').removeClass('label-success')
        $('.status').addClass('label-danger');
        $('.status').addClass('cus1');
        $('.status').html('Có sự cố xẩy ra. Đang cố gắng kết nối lại....');
        $('.box-main').removeClass('box-success');
        $('.box-main').addClass('box-danger');
        $('#restartSocket').css('display', 'block');

    }

    call.viewComplain = item => {
        $.ajax({
            url: "ajax/popup_detail_complain",
            type: "post",
            dataType: "text",
            data: { customer_id: item.customer_id },
            success: function (result) {
                if (result) {
                    $('#show_comlain').html(result);
                    $('#modal_complain').modal('show');
                }
            }
        });
    }

    call.getUser = () => {
        $.ajax({
            url: "hotlines/get_type_user",
            type: "get",
            dataType: "text",
            success: function (result) {
                if (result && result == 'SHOW') {
                    compactLayoutInTivi();
                }
            }
        });
    }

    call.showPopupOrder = (item) => {
        if (item.appointment_id) {
            window.open(base_url + 'appointments/add/' + item.appointment_id);
        } else {
            console.log(item);
            window.open(base_url + `appointments/add?customer_id=${item.customer_id}&store_input=${item.store_id}&phone_input=${item.phone}&name_input=${item.name == 'Unknown' ? '' : item.name}`);
        }
    }

    call.getCustomerDetail = (data) => {
        call.isload = true;
        call.title = 'Hóa đơn khách hàng';
        call.invoices = {};
        call.showPopup = 1;
        call.customer = data;
        $('#invoices').modal('show');

        $.ajax({
            url: "hotlines/get_invoices_cus",
            type: "post",
            dataType: "json",
            data: data,
            success: function (result) {
                if (result && result.status == 1) {
                    $scope.$apply(function () {
                        call.invoices = result.data;
                        call.isload = false;
                    })
                } else {
                    $('#invoices').modal('hiden');
                    toastr["error"]("Đã có sự cố xẩy ra. Vui lòng thử lại!");
                }
            }
        });
    }

    call.getHistoryCus = (data) => {
        if (data.customer_id > 0) {
            call.isload = true;
            call.title = 'Lịch sử đặt lịch';
            call.appointment = [];
            call.customer = data;
            call.showPopup = 2;
            $('#invoices').modal('show');
            $.ajax({
                url: "appointments/get_aptm_history",
                type: "post",
                dataType: "json",
                data: data,
                success: function (result) {
                    if (result && result.status == 1) {
                        $scope.$apply(function () {
                            call.appointment = result.data;
                            call.isload = false;
                        })
                    } else {
                        $('#invoices').modal('hiden');
                        toastr["error"]("Đã có sự cố xẩy ra. Vui lòng thử lại!");
                    }
                }
            });
        }
    }

    call.showPopupPhone = (cus) => {
        call.history_call = [];
        call.isShowCall = cus.id == call.isShowCall ? 0 : cus.id;
        call.customer = cus;
        call.isload = true;
        $.ajax({
            url: "hotlines/get_history_phone",
            type: "post",
            dataType: "json",
            data: cus,
            success: function (result) {
                $scope.$apply(function () {
                    if (result && result.status == 1) {
                        call.history_call = result.data;
                        call.isload = false;
                    } else {
                        toastr["error"](result.message);
                    }
                })
            }
        });

    }

    call.redictToCusDetail = (cus) => {
        if (cus.customer_id > 0) {
            window.open(base_url + 'customers/history/' + cus.customer_id);
        }
    }

    //get date = 'mm/dd/yyyy'
    getTime = () => {
        var now = {};

        var today = new Date();
        var date = today.toJSON().slice(0, 10);
        var s = today.getMinutes() < 10 ? '0' + today.getMinutes() : today.getMinutes();
        now.date = date.slice(5, 7) + '/'
            + date.slice(8, 10) + '/'
            + date.slice(0, 4);
        now.time = today.getHours() + ":" + s;
        return now;
    }

    call.formatNumber = (num) => {
        return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    }

    call.getHistoryCall = () => {

        $.ajax({
            url: "hotlines/get_history_call",
            type: "get",
            dataType: "json",
            success: function (result) {
                if (result && result.status == 1) {
                    $scope.$apply(function () {
                        call.lsCushasConnect = result.data;
                        call.lsCushasConnect.forEach(e => {
                            let arr = e.time.split(' ');
                            e.date = arr[0];
                            e.time = arr[1];
                        });
                    });
                } else {
                    call.lsCushasConnect = [];
                    toastr["error"](result.message);
                }
            }
        });
    }

    compactLayoutInTivi = () => {
        $('.alert-dismissible').remove();
        $('.sidebar-toggle').click();
        $('.navbar-static-top').remove();
        $('.main-footer').remove();
        toggleFullScreen(document.body);
        reloadPage();
    }

    function reloadPage() {
        setTimeout(() => {
            document.location.reload(true);
            reloadPage();
        }, 900000);
    }

    function toggleFullScreen(elem) {
        if ((document.fullScreenElement !== undefined && document.fullScreenElement === null) || (document.msFullscreenElement !== undefined && document.msFullscreenElement === null) || (document.mozFullScreen !== undefined && !document.mozFullScreen) || (document.webkitIsFullScreen !== undefined && !document.webkitIsFullScreen)) {
            if (elem.requestFullScreen) {
                elem.requestFullScreen();
            } else if (elem.mozRequestFullScreen) {
                elem.mozRequestFullScreen();
            } else if (elem.webkitRequestFullScreen) {
                elem.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
            } else if (elem.msRequestFullscreen) {
                elem.msRequestFullscreen();
            }
        } else {
            if (document.cancelFullScreen) {
                document.cancelFullScreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitCancelFullScreen) {
                document.webkitCancelFullScreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    }

    call.playSound = () => {
        var snd = new Audio("./assets/uploads/audio/beep.mp3");
        snd.play();
    }
})