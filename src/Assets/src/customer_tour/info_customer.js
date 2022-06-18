app.controller('iControler', function ($scope, $http, $compile, $sce) {
    $scope.init = () => {
        $scope.load = true;
        $scope.exit_tech = exit_tech;
        $scope.html_history_customer = '';
        $scope.complain = {}
        $scope.submitFiller();
    }

    $scope.submitFiller = () => {
        $scope.load = true;
        $scope.complain = {
            list: {},
            load: false
        }

        $http.get(base_url + `customer_tour/get_info_customer?invoice_id=${invoice_id}`).then(r => {
            if (r.data && r.data.status == 1) {
                let data = r.data.data;
                $scope.html_history_customer = data.html_history_customer;
                $scope.complain = data.complain;
            } else {
                toastr.error(r.data.message, 'Lỗi!');
            }
            $scope.load = false;
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

    $scope.chooseTour = () => {
        Swal.fire({
            title: 'Đồng ý nhận khách?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            cancelButtonText: 'Hủy',
            confirmButtonText: 'Đồng ý',
            allowOutsideClick: false,
        }).then((result) => {
            if (result.value) {
                Swal.fire({
                    html: '<h5>Đang in bill...</h5>',
                    showConfirmButton: false,
                    allowOutsideClick: false,
                    onRender: function () {
                        $('.swal2-content').prepend(img_printing);
                    }
                });
                $http.post(url_api + 'ajax_choose_tour_and_call_print_bill', {
                    'invoice_id': invoice_id,
                }).then(r => {
                    if (r.data) {
                        if (r.data.status == 1) {
                            Swal.fire(
                                'Thành công!',
                                'Đã tích tour và in bill',
                                'success'
                            )
                            $('.wrap-content>.box-body').html(`<div style="height: 60vh; display: flex; justify-content: center; align-items: center;flex-flow: column;"><h3>Hoàn tất bước nhận khách</h3><p class="text-center">Chúng tôi đang cảm thấy vinh dự khi có một đội ngũ nhân viên cống hiến như bạn. Bạn đã làm việc rất tốt. Cảm ơn bạn.❤️</p></div>`)
                        } else if (r.data.status == -2) {
                            Swal.fire(
                                'Lỗi!',
                                r.data.message,
                                'error'
                            )
                        } else if (r.data.status == -1) {
                            Swal.fire(
                                'Lỗi!',
                                'Sai tổng tiền hoặc hóa đơn trống!',
                                'error'
                            )
                        } else {
                            Swal.fire(
                                'Lỗi kết nối',
                                'Vui lòng liên hệ Lễ Tân để inbill này',
                                'error'
                            )
                        }
                    } else toastr.error('Vui lòng thử lại!', 'Lỗi!');
                }, function (data, status, headers, config) {
                    toastr.error('Vui lòng thử lại!', 'Lỗi hệ thống! ');
                });
            }
        })
    }

    $scope.converHtml = (htmlbd) => {
        return $sce.trustAsHtml(htmlbd);
    }
});