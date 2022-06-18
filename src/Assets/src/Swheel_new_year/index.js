//  Setup variables
var wheel = $("#ICON_QUA"),
    active = $("#mui_ten"),
    currentRotation,
    lastRotation = 0,
    key_spin = 0,
    tolerance,
    deg,
    flag = true,
    message_out = '';

//  Random degree


function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function ajaxGetKeyPin() {
    $.ajax({
        type: "post",
        url: base_url + "Swheel_new_year/ajaxTakeOne",
        data: {
            user_id: customer_id
        },
        dataType: "json",
        beforeSend: function() {
            flag = false;
            $('.loading-page').removeClass('off')
            $('.loading-page').attr('style', '');
        },
        success: function(response) {
            console.log(response);
            if (response.status) {
                let data = response.data;
                key_spin = data.id;
                message_out = data.message
                $('.img-sanpham').attr('src',base_url+'assets/images/Swheel_new_year/'+data.id+'.png');
                $('.img-1 img').attr('src',base_url+'assets/images/Swheel_new_year/'+data.id+'.png');
                $('.clas-phanqua-1').html(data.name);
                // console.log(data.name)
                spinPlay();
            } else {
                toastr.error(response.message);
            }
        },
        complete: function() {
            setTimeout(() => { $('.loading-page').css('z-index', '-1') }, 500);
            !$('.loading-page').hasClass('off') && $('.loading-page').addClass('off');
        },
        error: function() {
            toastr.error('Lỗi hệ thống. Vui lòng thử lại sao nhé!');
        }
    });
}


// $("#_btnplay").on('click', function() {
//     if (!flag) {
//         toastr.warning('Đang tải dữ liệu. Đợi tí nhé!');
//         return;
//     }
//     ajaxGetKeyPin();
// });


$("#vong_trong").on('click', function() {
    if (!flag) {
        toastr.warning('Đang tải dữ liệu. Đợi tí nhé!');
        return;
    }
    // for (var i = 0; i < 551; i++) {
        ajaxGetKeyPin();
    // }
});


$('.quay_111').on('click', function(e) {
    $(".chua-quay").removeClass("hidden_class");
    $(".da-quay").addClass("hidden_class");
})

// $('.quay_222').on('click', function(e) {
//     $(".da-quay").removeClass("hidden_class");
//     $(".chua-quay").addClass("hidden_class");
// })



function spinPlay() {
    $("#DEN ,#TRANG").addClass("runing");

    var vong = getRandomInt(8, 12),
        goc = getRandomInt(10, (360 / 8) - 10),
        thoigian = 8,
        phanthuong = key_spin,
        deg = vong * 360 + (360 / 8) * (phanthuong) - goc; //360 - 

    var indicator = new TimelineMax();
    var spinWheel = new TimelineMax();
    spinWheel.to(wheel, 0, {
        rotation: -1,
        transformOrigin: "50% 50%"
    });
    indicator.to(active, .15, { rotation: -20, transformOrigin: "50% 36%", ease: Power1.easeOut })
        .to(active, .2, { rotation: 0, ease: Power4.easeOut })
        .add("end");

    //  Luckywheel animation
    spinWheel.to(wheel, thoigian, {
        rotation: deg,
        transformOrigin: "50% 50%",
        ease: Power4.easeOut,
        onUpdate: (
            function() {
                currentRotation = Math.round(this.target[0]._gsTransform.rotation); //_gsTransform: current position of the wheel
                tolerance = currentRotation - lastRotation;

                if (Math.round(currentRotation) % (360 / 8) <= tolerance) {
                    if (indicator.progress() > .2 || indicator.progress() === 0) {
                        indicator.play(0);
                    }
                }
                lastRotation = currentRotation;
            }
        ),
        onComplete: function() {
            console.log("quay xong");
            flag = true;
            showResut();
            $("#DEN ,#TRANG").removeClass("runing");


            $(".da-quay").removeClass("hidden_class");
            $(".chua-quay").addClass("hidden_class");
        }
    });
    spinWheel.add("end");
}


// $(document).ready(function() {
//     var dem = 0;
//     setInterval(function() {
//         if (dem < 50) {
//             flyy();
//             dem++;
//         }
//     }, 500);
// });

function showResut() {
    $('#modal_result .mess-rs').html("Bạn đã quay trúng : " +
        message_out);
    $('.phanquan').html(message_out);
    $('#modal_result').modal('show');
}


/////////////////////////////////// Hoa rơi //////////////////////////////////////////////////////////////////
var SNOW_Picture = base_url+'assets/images/Swheel_new_year/hoa.png'; //Bông hoa mai
var SNOW_no = 4; //Số lượng bông hoa mai rơi
var SNOW_browser_IE_NS = (document.body.clientHeight) ? 1 : 0;
var SNOW_browser_MOZ = (self.innerWidth) ? 1 : 0;
var SNOW_browser_IE7 = (document.documentElement.clientHeight) ? 1 : 0;
var SNOW_Time;
var SNOW_dx, SNOW_xp, SNOW_yp;
var SNOW_am, SNOW_stx, SNOW_sty;
var i, SNOW_Browser_Width, SNOW_Browser_Height;
if (SNOW_browser_IE_NS) {
    SNOW_Browser_Width = document.body.clientWidth;
    SNOW_Browser_Height = document.body.clientHeight;
} else {
    if (SNOW_browser_MOZ) {
        SNOW_Browser_Width = self.innerWidth - 20;
        SNOW_Browser_Height = self.innerHeight;
    } else {
        if (SNOW_browser_IE7) {
            SNOW_Browser_Width = document.documentElement.clientWidth;
            SNOW_Browser_Height = document.documentElement.clientHeight;
        }
    }
}
SNOW_dx = new Array();
SNOW_xp = new Array();
SNOW_yp = new Array();
SNOW_am = new Array();
SNOW_stx = new Array();
SNOW_sty = new Array();
for (i = 0; i < SNOW_no; ++i) {
    SNOW_dx[i] = 0;
    SNOW_xp[i] = Math.random() * (SNOW_Browser_Width - 50);
    SNOW_yp[i] = Math.random() * SNOW_Browser_Height;
    SNOW_am[i] = Math.random() * 20;
    SNOW_stx[i] = 0.02 + Math.random() / 10;
    SNOW_sty[i] = 0.7 + Math.random();
    if (i == 0) {
        document.write('<\div id="SNOW_flake' + i + '" style="position: fixed; z-index: ' + i + '; visibility: visible; top: 15px; left: 15px;"><img src="' + SNOW_Picture + '" border="0"></div>');
    } else {
        document.write('<\div id="SNOW_flake' + i + '" style="position: fixed; z-index: ' + i + '; visibility: visible; top: 15px; left: 15px;"><img src="' + SNOW_Picture + '" border="0"></div>');
    }
}

function SNOW_Weather() {
    for (i = 0; i < SNOW_no; ++i) {
        SNOW_yp[i] += SNOW_sty[i];
        if (SNOW_yp[i] > SNOW_Browser_Height - 50) {
            SNOW_xp[i] = Math.random() * (SNOW_Browser_Width - SNOW_am[i] - 30);
            SNOW_yp[i] = 0;
            SNOW_stx[i] = 0.02 + Math.random() / 10;
            SNOW_sty[i] = 0.7 + Math.random();
        }
        SNOW_dx[i] += SNOW_stx[i];
        document.getElementById("SNOW_flake" + i).style.top = SNOW_yp[i] + "px";
        document.getElementById("SNOW_flake" + i).style.left = SNOW_xp[i] + SNOW_am[i] * Math.sin(SNOW_dx[i]) + "px";
    }
    SNOW_Time = setTimeout("SNOW_Weather()", 20);
}
SNOW_Weather();



function Fly(a, b, c, d, e, f, g, h, i) {
    function q() { o < 0 ? n < 0 ? (k = 100, l = 150) : (k = 0, l = 50) : n < 0 ? (k = 300, l = 350) : (k = 200, l = 250) }

    function r(a) { j.style.backgroundPosition = "0px -" + a + "px" }
    if (void 0 === h || "" == h) var h = "image/flies.png";
    if (void 0 === d || 0 == d || void 0 === e || 0 == e)
        if ("number" == typeof window.innerWidth) var e = window.innerWidth,
            d = window.innerHeight;
        else if (document.documentElement && (document.documentElement.clientWidth || document.documentElement.clientHeight)) var e = document.documentElement.clientWidth,
        d = document.documentElement.clientHeight;
    else if (document.body && (document.body.clientWidth || document.body.clientHeight)) var e = document.body.clientWidth,
        d = document.body.clientHeight;
    var j = document.createElement("DIV"),
        k = 200,
        l = 250,
        m = !0;
    if (void 0 === f || 0 == f || void 0 === g || 0 == g) {
        var f = 0,
            g = 0;
        if (Math.random() < .5) {
            if (Math.random() < .5) var f = 5;
            else var f = e - 50;
            var g = Math.round(Math.random() * (d - 50))
        } else {
            if (Math.random() < .5) var g = 5;
            else var g = d - 50;
            var f = Math.round(Math.random() * (e - 50))
        }
    }
    if (void 0 === n || 0 == n) var n = 3;
    if (void 0 === o || 0 == o) var o = 3;
    this.movestep = 30, this.type = b, this.name = i, this.color = c, this.fid = a, this.move_strange = !1, Math.random() < .5 ? this.gender = "Ã„ÂÃ¡Â»Â±c" : this.gender = "CÄ‚Â¡i", j.title = this.name + "\nLoÃ¡ÂºÂ¡i: " + this.type + "\nMÄ‚ u sÃ¡ÂºÂ¯c: " + this.color + "\nGiÃ¡Â»â€ºi tÄ‚Â­nh: " + this.gender, j.id = a, j.style.width = "50px", j.style.height = "50px", j.style.backgroundImage = "url(" + h + ")", j.style.backgroundPosition = "0px -" + k + "px", j.style.position = "absolute", j.style.left = Math.round(f) + "px", j.style.top = Math.round(g) + "px", j.style.zIndex = 9999, j.style.cursor = "pointer", j.style.cursor = "url('/images/xit_muoi.png'), auto;";
    var p = this;
    j.addEventListener("click", function() { p.flying() }, !1), document.body.appendChild(j), this.setmove = function(a) {
        var b = this;
        b.move_strange || (g >= d - 50 || Math.random() < .005 ? (o = -o, q()) : (g <= 1 || Math.random() < .005) && (o = -o, q()), f >= e - 50 || Math.random() < .005 ? (n = -n, q()) : (f <= 1 || Math.random() < .005) && (n = -n, q())), f += n, g += o, j.style.left = Math.round(f) + "px", j.style.top = Math.round(g) + "px", Math.random() < .05 ? (clearInterval(a), a = setInterval(function() { b.p(a) }, this.movestep), m = !1, r(k)) : m ? (m = !1, r(k)) : (m = !0, r(l))
    }, this.p = function(a, b) {
        var c = this;
        Math.random() < .075 && (clearInterval(a), a = setInterval(function() { c.setmove(a) }, c.movestep))
    }, this.move = function() {
        var a = this,
            b = setInterval(function() { a.setmove(b) }, a.movestep)
    }, this.flying = function() {
        this.movestep = 0;
        var a = this;
        timeout = 2500 * Math.random() + 2500, setTimeout(function() { a.movestep = 30 }, timeout)
    }, this.moveout = function() {
        var a = this,
            b = 0,
            c = 0;
        if ("number" == typeof window.innerWidth) var b = window.innerWidth,
            c = window.innerHeight;
        else if (document.documentElement && (document.documentElement.clientWidth || document.documentElement.clientHeight)) var b = document.documentElement.clientWidth,
            c = document.documentElement.clientHeight;
        else if (document.body && (document.body.clientWidth || document.body.clientHeight)) var b = document.body.clientWidth,
            c = document.body.clientHeight;
        a.move_strange = !0;
        var d = setInterval(function() {
            (g >= c - 50 || f >= b - 50 || g <= 0 || f <= 0) && ($("#" + a.fid).hide(), a.move_strange = !1, clearInterval(d))
        }, 30)
    }, this.goback = function() {
        var a = this,
            b = 0,
            c = 0;
        if ("number" == typeof window.innerWidth) var b = window.innerWidth,
            c = window.innerHeight;
        else if (document.documentElement && (document.documentElement.clientWidth || document.documentElement.clientHeight)) var b = document.documentElement.clientWidth,
            c = document.documentElement.clientHeight;
        else if (document.body && (document.body.clientWidth || document.body.clientHeight)) var b = document.body.clientWidth,
            c = document.body.clientHeight;
        a.move_strange = !0;
        var d = setInterval(function() {
            (g >= c - 50 || f >= b - 50 || g <= 0 || f <= 0) && ($("#" + a.fid).show(), a.move_strange = !1, clearInterval(d))
        }, 30)
    }
}


function flyy() {
    var a = $("script[src*=flies-obj]"),
        b = a.attr("var_1"),
        c = a.attr("var_2");
    if ("true" == a.attr("var_3")) var e = 170,
        f = 1e3;
    else var e = 0,
        f = 0;
    if ("false" == b) return !1;
    switch (Math.floor(4 * Math.random()) + 1) {
        case 1:
            var h = new Fly("test", "NhÃ¡ÂºÂ·ng", "Ã„Âen", e, f, 0, 0, "https://1.bp.blogspot.com/-gw4ADu38VZI/VtDSJWxpBVI/AAAAAAAAClo/LfFRNfLD6YQ/s1600/flies.png", "Long ruÃ¡Â»â€œi");
            break;
        case 2:
            var h = new Fly("test", "NhÃ¡ÂºÂ·ng", "Xanh", e, f, 0, 0, "https://2.bp.blogspot.com/-RJWSmB7LWCs/VtDQbezMLkI/AAAAAAAAClc/4BMD7iBSQzw/s1600/style_1.png", "King ruÃ¡Â»â€œi");
            break;
        case 3:
            var h = new Fly("test", "NhÃ¡ÂºÂ·ng", "TuyÃ¡Â»â€¡t sÃ¡ÂºÂ¯c", e, f, 0, 0, "https://1.bp.blogspot.com/-O6lAftMxB50/VtDQbAdt1hI/AAAAAAAAClY/v-9OEzMS1VQ/s1600/style_2.png", "Tom ruÃ¡Â»â€œi");
            break;
        case 4:
            var h = new Fly("test", "NhÃ¡ÂºÂ·ng", "HÃ¡Â»â€œng", e, f, 0, 0, "https://1.bp.blogspot.com/-Q7Lzc5UOMJg/VtDQbJjA-KI/AAAAAAAAClU/11UJMD7hf4k/s1600/style_3.png", "Queen ruÃ¡Â»â€œi")
    }
    if (h.move(), "true" == c) {
        var i = new Fly("test", "NhÃ¡ÂºÂ·ng", "Xanh", e, f, 0, 0, "https://2.bp.blogspot.com/-RJWSmB7LWCs/VtDQbezMLkI/AAAAAAAAClc/4BMD7iBSQzw/s1600/style_1.png", "King ruÃ¡Â»â€œi");
        i.move(), i.flying()
    }
    $("#btnMove").click(function() { h.move(), i.move(), fly3.move() }), $("#btnFlying").click(function() { h.flying() }), $("#btnHide").click(function() { h.moveout() }), $("#btnShow").click(function() { h.goback() })
}