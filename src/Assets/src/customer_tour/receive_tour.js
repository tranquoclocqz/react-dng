var cr_invoice_id = 0,
    local_store_id = localStorage.getItem('tour_store_id'),
    local_password = localStorage.getItem('tour_password');

var $owl = $("#owl-image").owlCarousel({
    navigation: false, // Show next and prev buttons
    autoplay: false,
    items: 1,
    itemsDesktop: false,
    itemsDesktopSmall: false,
    itemsTablet: true,
    itemsMobile: false,
    dots: false,
});
var app = angular.module('app', []);
app.controller('timeCtrl', function ($scope, $http, $compile, $window) {
    $scope.init = () => {
        $scope.invoices = {};
        $scope.invoices_toured = {};
        $scope.invoices_await = {};
        $scope.load = true;
        $scope.load_list_tech = true;
        $scope.list_technician = {};
        $scope.list_technician_temp = {};
        $scope.key_search_invoice = '';
        $scope.key_search_tech = '';

        $scope.updatePass = {
            pass: '',
            cf_pass: '',
            err: false,
            load: false
        }
        $scope.complain = {
            list: {},
            load: false
        }
        $scope.list_image = {
            list: {},
            load: false
        }
        $scope.history = {
            list: {},
            load: false
        }
        $scope.getAllowPrintBill();

        // $scope.submitFiller();
        // $scope.getListTechnical();

        $scope.autoLogin();
        $('.box-m').css('opacity', '1');
    }

    $scope.getAllowPrintBill = () => {
        var allowPrint = localStorage.getItem('allowPrint');

        if (allowPrint === null) {
            allowPrint = '0';
            localStorage.setItem('allowPrint', allowPrint);
        }
        $('#check_print').prop('checked', parseInt(allowPrint));
    }

    $scope.checkPassupdate = () => {
        if ($scope.updatePass.pass !== $scope.updatePass.cf_pass) {
            $scope.updatePass.err = true;
        } else {
            $scope.updatePass.err = false;
        }
    }

    $scope.changePass = () => {
        if ($scope.updatePass.pass == '') {
            Swal.fire({
                icon: 'error',
                title: 'Lỗi...',
                text: 'Mật khẩu mới không được để trống!'
            });
            return;
        }

        if ($scope.updatePass.cf_pass == '') {
            Swal.fire({
                icon: 'error',
                title: 'Lỗi...',
                text: 'Xác nhận mật khẩu không được để trống!'
            });
            return;
        }

        if ($scope.updatePass.pass !== $scope.updatePass.cf_pass) {
            $scope.updatePass.err = true;
            Swal.fire({
                icon: 'error',
                title: 'Lỗi...',
                text: 'Xác nhận mật khẩu không khớp!'
            });
        } else {
            $scope.updatePass.load = true;
            $scope.updatePass.err = false;

            $http.post(url_api + 'ajax_change_pass', {
                password: $scope.updatePass.pass
            }).then(r => {
                if (r.data.status == 1) {
                    localStorage.setItem('tour_password', $scope.updatePass.pass);
                    $('#modal_change_pass').modal('hide');
                    Swal.fire({
                        icon: 'success',
                        title: 'Thành công',
                        text: 'Đổi mật khẩu thành công!'
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Lỗi...',
                        text: r.data.message
                    });
                }
                $scope.updatePass.load = false;
            }, function error(response) {
                $scope.updatePass.load = false;
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi...',
                    text: 'Lỗi hệ thống!'
                });
            });

        }
    }
    $scope.logout = () => {
        localStorage.setItem('tour_store_id', '');
        localStorage.setItem('tour_password', '');
        window.location = base_url + 'tour/logout';
    }

    $scope.autoLogin = () => {
        if (store_id < 1) {
            if (!local_store_id) { // chưa có session và chưa lưu local data
                window.location = base_url + 'tour/login';
            } else { //có lưu data
                $.ajax({
                    type: "post",
                    url: url_api + "ajax_login",
                    data: {
                        store_id: local_store_id,
                        password: local_password
                    },
                    dataType: "json",
                    success: function (response) {
                        if (response.status) {
                            $scope.submitFiller();
                        } else {
                            window.location = base_url + 'tour/login';
                        }
                    },
                    complete: function () {},
                    error: function () {}
                });
            }
        } else {
            $scope.submitFiller();
        }
    }

    $scope.submitFiller = () => {
        $('.search-invoice').val('').trigger('input');
        $scope.loadReceiveTour();
        $scope.getListTechnical();
    }

    $scope.searchTech = () => {
        console.log($scope.key_search_tech);
        if ($scope.key_search_tech !== '' && $scope.key_search_tech !== null) {
            // var term = $scope.key_search_tech; // search term (regex pattern)
            // var search = new RegExp(ToSlug(term), 'i'); // prepare a regex object
            // let b = $scope.list_technician.filter(item =>
            //     (search.test(item.id)) || (search.test(ToSlug(item.full_name)))
            // );
            var term = $scope.key_search_tech; // search term (regex pattern)
            var search = new RegExp(term, 'i'); // prepare a regex object
            let b = $scope.list_technician.filter(item =>
                search.test(item.id)
            );
            $scope.list_technician_temp = b;
        } else {
            $scope.list_technician_temp = $scope.list_technician;
        }
    }

    $scope.searchInvoice = () => {
        console.log($scope.key_search_invoice);
        if ($scope.key_search_invoice !== '' && $scope.key_search_invoice !== null) {
            var term = $scope.key_search_invoice; // search term (regex pattern)
            var search = new RegExp(term, 'i'); // prepare a regex object
            let b_toured = $scope.invoices.filter(item =>
                    search.test(item.phone) && item.technician_id != 0
                ),
                b_await = $scope.invoices.filter(item =>
                    search.test(item.phone) && item.technician_id == 0 && item.is_finish == 0
                );
            $scope.invoices_toured = b_toured;
            $scope.invoices_await = b_await;
        } else {
            $scope.invoices_toured = $scope.invoices.filter(item => item.technician_id != 0);
            $scope.invoices_await = $scope.invoices.filter(item => item.technician_id == 0 && item.is_finish == 0);
        }
    }

    $scope.removeSearch = () => {
        $('.search_tech').val('').trigger('input');
        $scope.list_technician_temp = $scope.list_technician;
    }

    $scope.removeSearchInvocie = () => {
        $('.search-invoice').val('').trigger('input');
        $scope.invoices_toured = $scope.invoices.filter(item => item.technician_id != 0);
        $scope.invoices_await = $scope.invoices.filter(item => item.technician_id == 0 && item.is_finish == 0);
    }

    $scope.loadReceiveTour = () => {
        $scope.load = true;

        $http.get(url_api + 'ajax_get_list_invoice_receive_tour').then(r => {
            if (r.data.status == 1) {
                // let html = '';

                $scope.invoices = r.data.data;
                $scope.invoices_toured = $scope.invoices.filter(item => item.technician_id != 0);
                $scope.invoices_await = $scope.invoices.filter(item => item.technician_id == 0 && item.is_finish == 0);

                // $.each($scope.invoices, function (index, value) {
                //     html += `<tr data-customer_id="${value.customer_id}">
                //                 <td class="show-history">${index+1}</td>
                //                 <td class="wrap-cus">
                //                     <div class="wrap-info">
                //                         <div class="item-avt show-img">
                //                             <img src="${value.avt}" onerror="this.src='${base_url}assets/images/acount-df.png'" alt="avatar">
                //                         </div>
                //                         <div class="item-info">
                //                             <p class="item-children" title="Họ tên">
                //                                 <i class="fa fa-${value.gender == '1' ? 'female': (value.gender == '2' ? 'male' : 'user-secret')} icon-children" aria-hidden="true" ></i>
                //                                 <span>${value.name}</span>  
                //                             </p>
                //                             <p class="item-children" title="Hạng">
                //                                 <img src="${value.metal_url}" class="icon-children">
                //                                 <span>${value.cg_name}</span>    
                //                             </p>
                //                             <p class="item-children" title="Số điện thoại">
                //                                 <i class="fa fa-phone icon-children" aria-hidden="true"></i>
                //                                 <span>****${(value.phone+'').substr(4)} </span>  
                //                             </p>
                //                             <p class="item-children" title="Ngày sinh">
                //                                 <i class="fa fa-birthday-cake icon-children" aria-hidden="true"></i>
                //                                 <span>${value.birthday}</span>  
                //                             </p>
                //                         </div>
                //                     </div>
                //                 </td>
                //                 <td>
                //                     <div class="wrap-plus-info show-complain">
                //                         <p class="item-children" title="Tải app">
                //                             <i class="fa fa-mobile icon-children" aria-hidden="true"></i>
                //                             <span class="${value.dowload_app == 1 ? '' : 'text-line-th'}">${value.dowload_app == 1 ? 'Đã cài đặt' : 'Chưa cài đặt'}</span>
                //                         </p>
                //                         <p class="item-children" title="Khiếu nại">
                //                             ${
                //                                 value.is_complain == 1 ?
                //                                 (
                //                                     '<i class="fa fa-frown-o icon-children" aria-hidden="true"></i>'+
                //                                     '<span>Từng khiếu nại</span>'
                //                                 )
                //                                 :
                //                                 (
                //                                     '<i class="fa fa-smile-o icon-children" aria-hidden="true"></i>'+
                //                                     '<span>Chưa khiếu nại</span>'
                //                                 )
                //                             }
                //                         </p>
                //                         <div class="item-children hobby ${value.hobby_note ? '' : 'hide'}" title="Sở thích">
                //                             <i class="fa fa-sticky-note-o icon-children" aria-hidden="true"></i>
                //                             <div class="hobby-note">${value.hobby_note}</div>
                //                         </div>
                //                     </div>
                //                 </td>
                //                 <td>
                //                     <button onclick="showListTechnician(${value.invoice_id})" class="btn btn-xs btn-primary">Chọn</button>
                //                 </td>
                //             </tr>`;

                // });

                // if ($.fn.DataTable.isDataTable('#tb_data')) {
                //     $('#tb_data').DataTable().clear().destroy();
                // }
                // $('#tb_data tbody').html(html);
                // $('#tb_data').dataTable({
                //     "language": {
                //         "processing": '<i class="fa fa-spinner fa-spin fa-3x fa-fw"></i><span class="sr-only">Đang tải...</span> ',
                //         "sLengthMenu": "Xem _MENU_ mục",
                //         "sZeroRecords": "Không tìm thấy dòng nào phù hợp",
                //         "sInfo": "Đang xem _START_ đến _END_ trong tổng số _TOTAL_ mục",
                //         "sInfoEmpty": "Đang xem 0 đến 0 trong tổng số 0 mục",
                //         "sInfoFiltered": "(được lọc từ _MAX_ mục)",
                //         "sInfoPostFix": "",
                //         "sSearch": "Tìm:",
                //         "sUrl": "",
                //         "oPaginate": {
                //             "sFirst": "Đầu",
                //             "sPrevious": "Trước",
                //             "sNext": "Tiếp",
                //             "sLast": "Cuối"
                //         }
                //     },
                //     "paging": false,
                //     // "pageLength": 50,
                //     'columns': [{
                //             width: "1%",
                //             searchable: false,
                //             className: "text-center",
                //         },
                //         {
                //             width: "50%",
                //             className: "text-left",
                //         },
                //         {
                //             width: "40%",
                //             className: "text-left",
                //         },
                //         {
                //             width: "9%",
                //             searchable: false,
                //             className: "ver-md"
                //         }
                //     ],
                //     "columnDefs": [{
                //         "orderable": false,
                //         "targets": [0, 1, 2, 3]
                //     }],
                //     "order": [],
                //     // "columnDefs": [{
                //     //     "searchable": false,
                //     //     // "orderable": false,
                //     //     "targets": 0
                //     // }], // start to sort data in second column 
                //     "initComplete": function (settings, json) {
                //         $('#tb_data').wrap('<div class="table-responsive"></div>');
                //     }
                // });
            } else {
                toastr["error"](r.data.message);
            }
            $scope.load = false;
        }, function error(response) {
            toastr["error"]('Lỗi hệ thống. Vui lòng thử lại sau!');
        });
    }
    // $(document).on('click', '.show-complain', function (e) {
    //     let customer_id = $(this).closest('tr').attr('data-customer_id');
    //     $('#modal_complain').modal('show');
    //     $scope.showComplain(customer_id);
    // })

    $scope.showComplain = (customer_id, is_show = 1) => {
        if (is_show != 1) {
            return;
        }
        $('#modal_complain').modal('show');
        $scope.complain.load = true;
        $http.get(url_api + 'ajax_get_list_compalin?customer_id=' + customer_id).then(r => {
            if (r.data.status == 1) {
                $scope.complain.list = r.data.data;
            } else {
                toastr["error"]('Không thể danh sách khiếu nại. Vui lòng thử lại sau!');
            }
            $scope.complain.load = false;
        }, function error(response) {
            toastr["error"]('Lỗi hệ thống. Vui lòng thử lại sau!');
        });
    }

    $scope.confirmSetTourTechnician = (item) => {
        if (!cr_invoice_id) {
            toastr["error"]('Không xác định phiếu thu. Vui lòng thử lại sau!');
            return;
        }
        if (!item.id) {
            toastr["error"]('Không xác KTV. Vui lòng thử lại sau!');
            return;
        }
        Swal.fire({
            title: 'Bạn có chắc chắn?',
            html: "Chọn <b>" + item.full_name + "</b> cho tour này?",
            imageUrl: item.avt,
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            cancelButtonText: 'Hủy',
            confirmButtonText: 'Đồng ý',
            allowOutsideClick: false,
        }).then((result) => {
            if (result.value) {
                $scope.load_list_tech = true;
                $http.post(url_api + 'ajax_set_tour_technician', {
                    invoice_id: cr_invoice_id,
                    user_id: item.id
                }).then(r => {
                    if (r.data.status == 1) {
                        toastr['success']('Tích tour Thành công!');
                        $('.popup-technician').hide();
                        if ($('#check_print').prop('checked')) {
                            $scope.printBill(cr_invoice_id);
                        } else {
                            $scope.submitFiller();
                        }
                    } else {
                        toastr["error"](r.data.message);
                    }
                }, function error(response) {
                    toastr["error"]('Lỗi hệ thống. Vui lòng thử lại sau !');
                });
            }
        })
    }
    $scope.printBill = (invoice_id) => {
        swal.fire({
            html: '<h5>Đang in bill...</h5>',
            showConfirmButton: false,
            // allowOutsideClick: false,
            onRender: function () {
                $('.swal2-content').prepend(img_printing);
            }
        });

        $http.post(url_api + 'ajax_call_print_bill', {
            'invoice_id': invoice_id,
            'store_name': store_name,
        }).then(r => {
            if (r.data.status == 1) {
                toastr['success']('Đã in bill', 'Thông báo');
            } else if (r.data.status == -1) {
                toastr["error"]('Sai tổng tiền hoặc hóa đơn trống!', 'Lỗi');
            } else {
                toastr["error"]('Vui lòng liên hệ Lễ Tân để inbill này', 'Lỗi kết nối');
            }

            swal.close();
            $scope.submitFiller();
            $scope.load_list_tech = false;
        }, function error(response) {
            toastr["error"]('Vui lòng liên hệ Lễ Tân để inbill này', 'Lỗi hệ thống');
        });
    }

    $scope.getListTechnical = () => {
        $scope.load_list_tech = true;

        $http.get(url_api + 'ajax_get_list_technical').then(r => {
            if (r.data.status == 1) {
                $scope.list_technician = r.data.data;
                $scope.list_technician_temp = r.data.data;

            } else {
                toastr["error"](r.data.message);
            }
            $scope.load_list_tech = false;

        }, function error(response) {
            toastr["error"]('Lỗi hệ thống. Vui lòng thử lại sau !');
        });
    }

    // $(document).on('click', '.show-img', function (e) {
    //     let customer_id = $(this).closest('tr').attr('data-customer_id');
    //     $('#modal_image').modal('show');
    //     $scope.getImage(customer_id);
    // })
    $scope.getImage = (customer_id) => {
        $('#modal_image').modal('show');
        $scope.list_image.load = true;
        $http.get(url_api + 'ajax_get_img_customer?customer_id=' + customer_id).then(r => {
            if (r.data.status == 1) {
                $("#owl-image").attr('class', 'owl-carousel owl-theme')
                $owl.trigger('destroy.owl.carousel');
                $scope.list_image.list = r.data.data;

                setTimeout(() => {
                    $owl = $("#owl-image").owlCarousel({
                        // navigation: false, // Show next and prev buttons
                        // nav: true,
                        // navText: ["<i class='fa fa-long-arrow-left'></i>","<i class='fa fa-long-arrow-right'></i>"],
                        autoplay: false,
                        items: 1,
                        itemsDesktop: false,
                        itemsDesktopSmall: false,
                        itemsTablet: true,
                        itemsMobile: false,
                        dots: false,
                    });
                }, 150);
            } else {
                toastr["error"]('Không thể danh sách hình ảnh khách hàng. Vui lòng thử lại sau!');
            }
            $scope.list_image.load = false;
        }, function error(response) {
            toastr["error"]('Lỗi hệ thống. Vui lòng thử lại sau!');
        });
    }

    // $(document).on('click', '.show-history', function (e) {
    //     let customer_id = $(this).closest('tr').attr('data-customer_id');
    //     $('#modal_history').modal('show');
    //     $scope.getHistoryCustomer(customer_id);
    // })
    $scope.getHistoryCustomer = (customer_id) => {
        $('#modal_history').modal('show');
        $scope.history.load = true;
        $http.get(url_api + 'ajax_get_history_customer?customer_id=' + customer_id).then(r => {
            if (r.data.status == 1) {
                console.log(r.data.data);
                let data = r.data.data;
                $.each(data.invoices, function (i, value) {
                    value.list_pk = [];
                    value.list_ser = [];
                    value.list_pro = [];
                    $.each(value.detail, function (k, detail) {
                        if (detail.type == 'package') {
                            value.list_pk.push(detail);
                        } else if (detail.type == 'service') {
                            value.list_ser.push(detail);
                        } else if (detail.type == 'product') {
                            value.list_pro.push(detail);
                        }
                    });
                });
                $scope.history.list = data;
            } else {
                toastr["error"]('Không thể lịch sử khách hàng. Vui lòng thử lại sau!');
            }
            $scope.history.load = false;
        }, function error(response) {
            toastr["error"]('Lỗi hệ thống. Vui lòng thử lại sau!');
        });
    }

    $scope.showQrcode = (value) => {
        createQrcode(value.invoice_id, value.name);
    }

    $scope.showListTechnician = (value) => {
        showListTechnician(value.invoice_id);
    }

})

function showListTechnician(invoice_id) {
    cr_invoice_id = invoice_id;
    $('.search_tech').val('').trigger('input');
    $('.popup-technician').show();

}

function changeAllowPrint() {
    localStorage.setItem('allowPrint', $('#check_print').prop('checked') ? '1' : '0');
}

function ToSlug(title) {
    if (title == '' || !title) return '';
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
    slug = slug.replace(/\`|\~|\!|\@|\#|\||\$|\%|\^|\&|\*|\(|\)|\+|\=|\,|\.|\/|\?|\>|\<|\'|\"|\:|\;|_/gi, '');
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

function createQrcode(invoice_id, customer) {
    $("#modal_qrcode").modal('show');
    cr_invoice_id = invoice_id;
    $("#modal_qrcode .modal-body").html(`
            <div class="wrap-qrcode loading">
                <img src="https://chart.googleapis.com/chart?cht=qr&amp;chl=type=technical_tour%26invoice_id=${invoice_id}&amp;chs=120x120&amp;chld=L|0" onload="$(this).parent().removeClass('loading')" onerror="reloadQrcodeWhenErr()">
            </div>
            <p class="text-center"><b>${customer}<b></p>
            <button type="button" class="btn btn-secondary w-100" data-dismiss="modal">Đóng</button>
        `);
}

function reloadQrcodeWhenErr() {
    setTimeout(() => {
        $('#modal_qrcode').hasClass('show') && $("#modal_qrcode .modal-body .wrap-qrcode").html($("#modal_qrcode .modal-body .wrap-qrcode").html());
    }, 250);
}