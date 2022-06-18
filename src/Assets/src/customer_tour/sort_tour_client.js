var app = angular.module('app', []);
app.controller('timeCtrl', function ($scope, $http, $compile, $sce) {
    $scope.init = () => {
        $scope.load = true;
        $scope.history = {
            load: false,
            html_history_customer: '',
            complain: {},
            open: false,
        }
        $scope.invoice_id = 0;
        $scope.tech_note = '';
        $scope.load_submit = false;
        $scope.allow_finish = false;

        $scope.list_technician = {};
        $scope.list_technician_touring = {};
        $scope.getListTechnical();
        $('.box-m').css('opacity', '1');
    }
    $scope.getListTechnical = () => {
        $scope.load = true;

        $http.get(url_api_list).then(r => {
            if (r.data.status == 1) {
                let data = r.data.data,
                    list_await = data.list_await,
                    invoices = data.invoice;
                // $scope.list_technician = data.filter(item => item.position > 0);
                // $scope.list_technician_touring = list_await.filter(item => item.position != 0);
                $scope.list_technician_touring = list_await;
                $scope.invoices = invoices;
                // setTimeout(() => {
                //     var arrName = ['Lịch tour', 'Tour hôm nay'];
                //     var swiper = new Swiper('.swiper-container', {
                //         effect: 'flip',
                //         grabCursor: true,
                //         pagination: {
                //             el: '.swiper-pagination',
                //             clickable: true,
                //             renderBullet: function (index, className) {
                //                 return '<span class="' + className + '">' + arrName[index] + '</span>';
                //             },
                //         },
                //     });
                // }, 0);
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi',
                    text: r.data.message,
                    allowOutsideClick: false,
                });
                // toastr["error"](r.data.message);
            }
            $scope.load = false;

        }, function error(response) {
            toastr["error"]('Lỗi hệ thống. Vui lòng thử lại sau !');
        });
    }
    $scope.openUpload = (item) => {
        $scope.allow_finish = item.allow_finish;
        $scope.tech_note = '';
        $scope.invoice_id = item.invoice_id;
        $scope.customer_id = item.customer_id;
        $scope.customer_name = item.name;
        $scope.getCustomerImgs();
        $('#modal_upload').modal('show');
        // window.open(base_url + 'invoices/detail/' + item.invoice_id, "blank");
    }
    var fd = new FormData();

    function preventDefaults(e) {
        e.preventDefault()
        e.stopPropagation()
    }

    // preventing page from redirecting
    // $(function () {
    //     /*  begin upload*/
    //     $("#modal_upload .wrap-drop-img").on("drop", function (e) {
    //         preventDefaults(e);
    //     });

    //     // Drag enter
    //     $('#modal_upload .wrap-img-normal, #modal_upload .wrap-img-contract').on('dragenter', function (e) { //ra khỏi vùng chọn
    //         preventDefaults(e)
    //     });

    //     // Drag over
    //     $('#modal_upload .wrap-img-normal .upload-area, #modal_upload .wrap-img-contract .upload-area').on('dragover', function (e) { //vào vùng chọn
    //         preventDefaults(e)
    //         $(this).find('h3').text("Thả vào đây...");
    //     });

    //     // Drop
    //     $('#modal_upload .wrap-img-normal .upload-area').on('drop', function (e) {
    //         preventDefaults(e)
    //         $scope.uploadCustomerImg(e.originalEvent.dataTransfer.files, 'normal');
    //     });

    //     // Drop
    //     $('#modal_upload .wrap-img-contract .upload-area').on('drop', function (e) {
    //         preventDefaults(e)
    //         $scope.uploadCustomerImg(e.originalEvent.dataTransfer.files, 'contract');
    //     });

    // });

    document.getElementById('file-img-normal').addEventListener("change", function () {
        $scope.uploadCustomerImg(document.getElementById('file-img-normal').files, 'normal');
    });

    document.getElementById('file-img-contract').addEventListener("change", function () {
        $scope.uploadCustomerImg(document.getElementById('file-img-contract').files, 'contract');
    });

    $scope.getCustomerImgs = () => {
        $scope.load_submit = true;

        $http.get(url_api + 'ajax_get_image_customer_invoice' + string_plus + '&id=' + $scope.invoice_id).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.image_customers = r.data.data;
            } else {
                toastr.error(r.data.message, 'Lỗi!');
            }
            $scope.load_submit = false;
        }, function (data, status, headers, config) {
            toastr["error"]('Vui lòng thử lại!', 'Lỗi!');
        });
    }

    $scope.removeImg = (value) => {
        Swal.fire({
            title: 'Bạn có chắc chắn?',
            html: "Bạn không thể hoàn nguyên điều này!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            cancelButtonText: 'Hủy',
            confirmButtonText: 'Đồng ý',
            allowOutsideClick: false,
        }).then((result) => {
            if (result.value) {
                $scope.load_submit = true;
                $http.post(url_api + 'ajax_remove_image_customer' + string_plus, {
                    'id': value.id,
                }).then(r => {
                    if (r.data && r.data.status) {
                        toastr.success('Xóa ảnh thành công', 'Thông báo');
                        $scope.getCustomerImgs();
                    } else toastr.error(r.data.message, 'Lỗi!');
                }, function (data, status, headers, config) {
                    toastr.error('Vui lòng thử lại!', 'Lỗi hệ thống! ');
                });
            }
        })
    }

    $scope.uploadCustomerImg = (file, type_upload) => {
        // let limit = 10,
        //     arrType = ['image/jpg', 'image/png', 'image/jpeg'],
        //     count_upload = 0,
        //     limit_size = 5342880; //5Mb
        for (var x = 0; x < file.length; x++) {
            fd.append("files[]", file[x]);
            // console.log(file[x].type);

            // if (arrType.includes(file[x].type)) {
            //     if (count_upload < limit) {
            //         if (file[x].size <= limit_size || 1) {
            //             fd.append("files[]", file[x]);
            //             count_upload += 1;
            //         } else toastr.error('File: ' + file[x].name + ' vượt quá quá kích thước cho phép!', 'Lỗi');
            //     } else {
            //         toastr.error('Vượt quá số lượng cho phép!', 'Thông báo');
            //         $scope.resetInputFile();
            //         return true;
            //     }
            // } else {
            //     toastr.error('File: ' + file[x].name + ' sai định dạng!', 'Lỗi');
            //     $scope.resetInputFile();
            //     return true;
            // }
        }

        // if (fd.get('files[]') == null) return true;

        $scope.$apply(function () {
            $scope.load_submit = true;
        })
        fd.append('type', type_upload);
        fd.append('id', $scope.invoice_id);

        $.ajax({
            url: url_api + 'ajax_upload_image_customer' + string_plus,
            method: 'post',
            dataType: 'text',
            processData: false,
            crossOrigin: false,
            contentType: false,
            data: fd,
            success(response) {
                response = JSON.parse(response);
                if (response.status) {
                    toastr.success('Tải ảnh thành công', 'Thông báo');
                    $scope.getCustomerImgs();
                } else {
                    toastr.error(response.message, 'Lỗi');
                    $scope.$apply(function () {
                        $scope.load_submit = false;
                    })
                }
            },
            complete() {
                $scope.resetInputFile();
            },
            error() {
                toastr.error('Lỗi hệ thống!', 'Lỗi')
            }
        })
    }

    $scope.resetInputFile = () => {
        fd = new FormData();
        $('#file-img-normal, #file-img-contract').val('');
    }

    $scope.getHistory = (item) => {
        $scope.history = {
            load: true,
            complain: {},
            open: true,
        }
        let invoice_id = item.invoice_id;

        $http.get(base_url + `customer_tour/get_info_customer?invoice_id=${invoice_id}`).then(r => {
            if (r.data && r.data.status == 1) {
                let data = r.data.data;
                $scope.history.html_history_customer = data.html_history_customer;
                $scope.history.complain = data.complain;
            } else {
                toastr.error(r.data.message, 'Lỗi!');
            }
            $scope.history.load = false;
            setTimeout(() => {
                $(document).find(".owl-carousel").owlCarousel({
                    navigation: false, // Show next and prev buttons
                    nav: true,
                    navText: ["<i class='fa fa-chevron-left'></i>", "<i class='fa fa-chevron-right'></i>"],
                    autoplay: false,
                    items: 1,
                    itemsDesktop: false,
                    itemsDesktopSmall: false,
                    itemsTablet: true,
                    itemsMobile: false,
                    dots: false,
                });
            }, 50);
        }, function (data, status, headers, config) {
            toastr["error"]('Vui lòng thử lại!', 'Lỗi!');
        });
    }

    $scope.converHtml = (htmlbd) => {
        return $sce.trustAsHtml(htmlbd);
    }

    // $scope.showNote = (value) => {
    //     $('#modal_note').modal('show');
    //     $scope.tech_note = '';
    //     $scope.invoice_id = value.invoice_id;
    // }

    $scope.finishBed = () => {
        $scope.load_submit = true;
        $http.post(url_api + 'ajax_finish_bed' + string_plus, {
            'invoice_id': $scope.invoice_id,
            'note': $scope.tech_note,
        }).then(r => {
            if (r.data && r.data.status) {
                Swal.fire(
                    'Thành công!',
                    'Đã hoàn tất giường',
                    'success'
                )
                $scope.getListTechnical();
                $('#modal_upload').modal('hide');
            } else toastr.error(r.data.message, 'Lỗi!');
            $scope.load_submit = false;
        }, function (data, status, headers, config) {
            toastr.error('Vui lòng thử lại!', 'Lỗi hệ thống! ');
        });
    }
})
//img customer

$(document).on('shown.bs.modal', '.modal-image', function () {
    $('.modal-backdrop').remove();
});

$(document).on('shown.bs.modal', '#modal_note', function () {
    $('#message-note').focus().trigger('input');
});

function showPopupImg(src) {
    $('.popup-img').addClass('active').find('img').attr('src', src);
}

function disabledTime(e) {
    var self = $(e);
    setTimeout(() => {
        self.attr('disabled', 'disabled');
    }, 0)
    setTimeout(() => {
        self.removeAttr('disabled');
    }, 300)
}