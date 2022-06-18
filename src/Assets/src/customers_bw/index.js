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
        code_scan_init();
        $scope.findProduct();
    }

    function code_scan_init() {
        $scope.selectedDeviceId;
        $scope.codeReader = new ZXing.BrowserBarcodeReader()
        $scope.codeReader.getVideoInputDevices()
            .then((videoInputDevices) => {
                if (videoInputDevices.length == 0) {
                    console.log('No video input devices found!');
                    return false;
                }
                const sourceSelect = document.getElementById('sourceSelect')
                $scope.selectedDeviceId = videoInputDevices[0].deviceId
                if (videoInputDevices.length > 1) {
                    videoInputDevices.forEach((element) => {
                        const sourceOption = document.createElement('option')
                        sourceOption.text = element.label
                        sourceOption.value = element.deviceId
                        sourceSelect.appendChild(sourceOption)
                    })
                    sourceSelect.onchange = () => {
                        $scope.selectedDeviceId = sourceSelect.value;
                    }
                    const sourceSelectPanel = document.getElementById('sourceSelectPanel')
                    sourceSelectPanel.style.display = 'block'
                }
            })
            .catch((err) => {
                console.error(err)
            })
    }
    $scope.handle_start = () => {
        $scope.showVideo = true;
        $scope.codeReader.decodeOnceFromVideoDevice($scope.selectedDeviceId, 'video').then((result) => {
            $scope.codeReader.reset();
            delete $scope.showVideo;
            $scope.findProduct(result.text);
            $scope.$apply();
        }).catch((err) => {
            console.error(err)
            document.getElementById('result').textContent = err
        })
        console.log(`Started continous decode from camera with id ${$scope.selectedDeviceId}`)
    }
    $scope.handle_reset = () => {
        $scope.codeReader.reset();
        delete $scope.showVideo;
    }
    $scope.findProduct = (barcode = '') => {
        delete $scope.messages_api;
        $('#barcode_input').val(barcode).change();
        // $http.get(base_url + 'customers_beauty_world/ajax_get_product_detail/' + barcode).then(r => {
        $http.get(base_url + 'customers_beauty_world/ajax_get_product_detail/' + '0000003700003').then(r => {
            if (r && r.data.status_code == 200) {
                if (r.data.data.item) {
                    $scope.product = r.data.data.item;
                } else $scope.messages_api = 'Không tìm thấy sản phẩm';
            } else $scope.messages_api = 'Không tìm thấy sản phẩm';
        })
    }
});


var barcode = "";
var reading = false;

document.addEventListener("keydown", e => {
    var seft = $(e.target);
    if (e.key == 'Enter') {
        if (barcode.length > 5) {
            var flag_repace = true;

            if (seft.val() && flag_repace) {
                var str_ = (seft.val() + '').replace(barcode, '').trim();
                seft.val(str_).trigger('input');
            }
            angular.element(document.getElementById('main-controller')).scope().findProduct(barcode);
            barcode = "";
        }
    } else {
        if (e.key != 'Shift') {
            barcode += e.key;
        }
    }

    if (!reading) {
        reading = true;
        setTimeout(() => {
            barcode = "";
            reading = false;
        }, 200);
    }
}, true)