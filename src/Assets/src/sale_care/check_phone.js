
app.controller('check_phone', function ($scope, $http, $sce, $compile) {
    $scope.init = () => {
        $('.opacity').css('opacity', '1');
        $scope.openPaste = true;
    }

    $scope.pasteExcel = (e) => {
        e.preventDefault();
        var cb;
        var clipText = '';
        if (window.clipboardData && window.clipboardData.getData) {
            cb = window.clipboardData;
            clipText = cb.getData('Text');
        } else if (e.clipboardData && e.clipboardData.getData) {
            cb = e.clipboardData;
            clipText = cb.getData('text/plain');
        } else {
            cb = e.originalEvent.clipboardData;
            clipText = cb.getData('text/plain');
        }
        var clipRows = clipText.split('\n');

        if (clipRows.length >= 1100) {
            toastr["error"]("Copy ít hơn 1100 dòng!");
            return false;
        }

        for (i = 0; i < clipRows.length; i++) {
            clipRows[i] = clipRows[i].split('\t');
        }

        var jsonObj = [];
        $scope.pasteObs = [];
        for (i = 0; i < clipRows.length; i++) {

            var temp = {};

            for (j = 0; j < clipRows[i].length; j++) {
                if (clipRows[i][j] != '\r') {
                    if (clipRows[i][j].length !== 0) {
                        clipRows[i][j] = clipRows[i][j].replace(/[\s]/g, '');
                        if (j == 0) {
                            temp.phone = clipRows[i][j];
                        }
                    }
                }
            }
            jsonObj.push(temp);
            $scope.pasteObs.push(temp);
        }
        $scope.checkNumber();



        // console.log(jsonObj);
    }

    $scope.checkUnSave = (is_cus = null) => {

        var phones = $scope.pasteObs.map(x => {
            return x.phone;
        })
        $('#home table').addClass('loading');
        $http.post(base_url + 'sale_care/ajax_check_phone/' + is_cus, JSON.stringify(phones)).then(r => {
            $('#home table').removeClass('loading');
            if (r && r.data.status == 1) {
                toastr["success"]("Thành công!");

                $scope.lost_phones = r.data.data;
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    $scope.triggerZero = () => {
        $scope.pasteObs.forEach((value, index) => {
            if (value.error != "" && value.error) {
                value.phone = "0" + value.phone;
            }
        });
        $scope.checkNumber();
    }

    $scope.remove = (i, e) => {
        $scope.pasteObs.splice(i, 1);
        $scope.checkNumber();
    }


    $scope.checkNumber = (phoneIsset = undefined) => {
        // console.log(1);
        $scope.openPaste = true;
        var temp = [];
        // if ($scope.pasteObs.length > 0)
        //     for (var i = $scope.pasteObs.length - 1; i >= 0; i--) {
        //         var dem = 0;
        //         $scope.pasteObs.forEach(value => {
        //             if ($scope.pasteObs[i].phone == value.phone) {
        //                 dem++;
        //                 if (dem > 1) {
        //                     $scope.pasteObs.splice(i, 1);
        //                 }
        //             }
        //         });
        //     }
        $scope.pasteObs.forEach((value, index) => {
            value.error = "";
            var check = false;

            if (!value.phone || value.phone.length == "") {
                value.error = "Số điện thoại không được để trống!";
                $scope.openPaste = false;
                $scope.pasteObs.splice(index, 1);
            }
            value.phone = value.phone.replace(/\s/g, '');
            var first_ = value.phone.substring(1, 0);

            if (value.phone && (value.phone.length != 10 || value.phone.indexOf('.') != -1 || value.phone.indexOf(',') != -1)) {
                value.error = "Số điện thoại không đúng định dạng!";
                $scope.openPaste = false;

            }
            if (first_ != 0) {
                value.error = "Số điện thoại bắt đầu bằng số 0!";
                $scope.openPaste = false;
            }

            if (isNaN(value.phone)) {
                value.error = "Số điện thoại chỉ bao gồm số!";
                $scope.openPaste = false;
            }

            if (phoneIsset) {
                phoneIsset.forEach(element => {
                    if (value.phone == element.phone) {
                        value.error = element.user + " đã nhập số này!";
                        $scope.openPaste = false;

                    }
                });
            }

        });

        return false;


    }


})