//  Setup variables
var wheel = $("#vong_quay"),
    active = $("#mui_ten"),
    currentRotation,
    lastRotation = 0,
    key_spin = 0,
    tolerance,
    deg,
    flag = true,
    arrNameAward = {
        1:'HÚT CHÌ THẢI ĐỘC TỐ',
        2:'Ủ TRẮNG HUYẾT YẾN',
        3:'TRỊ MỤN CĂNG BÓN, DA TƠ TẰM',
        4:'PHỤC HỒI DA',
        5:'PHỤC HỒI DA HUYẾT, THANH TẢO BIỂN',
        6:'CHĂM SÓC DA LUXURY',
        7:'HÚT CHÌ LUXURY',
        8:'CHĂM SÓC DA CAO CẤP',
    },
    message_out='';

//  Random degree

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; 
}

// var kk = (360 - 360 / data.length * (qua - 1));

//   Buttons

function ajaxGetKeyPin() {
    $.ajax({
        type: "post",
        url: base_url+"vongquay_luxury/ajaxTakeOne",
        data: {
            user_id : customer_id
        },
        dataType: "json",
        beforeSend: function(){
            flag = false;
            $('.loading-page').removeClass('off')
            $('.loading-page').attr('style','');
        },
        success: function (response) {
            console.log(response);
            if(response.status){
                let data = response.data;
                key_spin = data.key_spin;
                message_out = data.message
                spinPlay();
            }else{
                toastr.error('Lỗi hệ thống. Vui lòng thử lại sao nhé!');
            }
        },
        complete: function() {
            setTimeout(() => {$('.loading-page').css('z-index','-1')},500)
            !$('.loading-page').hasClass('off') && $('.loading-page').addClass('off');
        },
        error: function(){
            toastr.error('Lỗi hệ thống. Vui lòng thử lại sao nhé!');
        }
    });
}
$("#_btnplay").on('click',function(){
    if(!flag){
        toastr.warning('Đang tải dữ liệu. Đợi tí nhé!');
        return;
    }
    ajaxGetKeyPin();
});
function spinPlay(){
    $("#LIGHT_CHAN ,#LIGHT_LE").addClass("runing");

    var vong = getRandomInt(4,8),
        goc = (360 / 8),
        lech = 5,
        thoigian = 6,
        phanthuong = key_spin,
        deg = vong * 360 + (360 / 8) * (phanthuong) - goc - lech; //360 - 

    console.log("số vòng: " + vong);
    console.log("Phần thưởng : " + phanthuong);
    console.log("goc : " + goc);
    console.log("thoi gian : " + thoigian);

    //  Creating the Timeline
    var indicator = new TimelineMax();
    var spinWheel = new TimelineMax();
    spinWheel.to(wheel, 0, {
        rotation: -1,
        transformOrigin: "50% 50%"
    });
    indicator.to(active, .15, { rotation: 20, transformOrigin: "50% 36%", ease: Power1.easeOut })
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
            $("#LIGHT_CHAN ,#LIGHT_LE").removeClass("runing");
        }
    });
    spinWheel.add("end");
}

function showResut() {
    $('#modal_result .mess-rs').html(message_out);
    $('#modal_result').modal('show');
}