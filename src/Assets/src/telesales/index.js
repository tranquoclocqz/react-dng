app.directive('ngFile', ['$parse', function($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {

            element.bind('change', function() {

                $parse(attrs.ngFile).assign(scope, element[0].files)

                scope.$apply();

            });
        }
    };
}]);
app.controller('index', function($scope, $http, $compile, $window, $timeout) {


    $scope.init = () => {
        $scope.excel = {};
        $scope.excel.nation = '1';
        $scope.excel_step = 0;
    }


    $scope.select2 = () => {
        setTimeout(() => {
            $('.select2').select2();
            $scope.$apply();
        }, 0);
    }


    $('#extract').on('click', function(e) {
        $('.content_extract').slideToggle();
        //$scope.exFresh();
        $scope.$apply();
    })
    $('#openExcel').on('click', function(e) {
        $('.content_excel').slideToggle();
        $scope.exFresh();
        $scope.$apply();
    })
    var fdExel = new FormData(),
        fdExel_temp = new FormData();

    function preventDefaults(e) {
        e.preventDefault()
        e.stopPropagation()
    }

    function uploadExel(file) {
        console.log(document.getElementById("file-exel").value);
        $('#demo .wrap-info').html('');
        $('.cf_import').addClass('hidden');
        let limit = 10,
            flag_show_btn = 0;
        // arrType = [
        //         '.php',
        //         '.js',
        //         '.png',
        //         '.jpg',
        //         '.svg'
        //     ],
        count_upload = 0,
            limit_size = 5342880, //5Mb
            block = '#modal_import .modal-body';
        $(".wrap-exel-upload .wrap-drop-img .note_title").text('Kiểm tra...');
        for (var x = 0; x < file.length; x++) {
            // if (arrType.includes(file[x].type)) {
            if (count_upload < limit) {
                if (file[x].size <= limit_size) {
                    fdExel.append("files[]", file[x]);
                    count_upload++;
                } else toastr.error('File: ' + file[x].name + ' vượt quá quá kích thước cho phép!');
            } else {
                toastr.error('Vượt quá số lượng cho phép!');
                $('.wrap-exel-upload .wrap-drop-img .upload-area .note_title').html('Kéo thả vào đây<br/>hoặc<br/>nhấn vào đây để chọn file');
                return;
                break;
            }
            // } else {
            //     toastr.error('File: ' + file[x].name + ' sai định dạng!');
            //     $('.wrap-exel-upload .wrap-drop-img .upload-area .note_title').html('Kéo thả vào đây<br/>hoặc<br/>nhấn vào đây để chọn file');
            // }
        }
        if (fdExel.get('files[]') == null) return;

        $scope.checkExcel();
    }
    $(function() {
        /*  begin upload modal Exel*/
        $(".wrap-exel-upload .wrap-drop-img").on("drop", function(e) {
            e.preventDefault();
            e.stopPropagation();
        });

        // Drag enter
        $('.wrap-exel-upload .wrap-drop-img').on('dragenter', function(e) { //ra khỏi vùng chọn
            preventDefaults(e)
            $(".wrap-exel-upload .wrap-drop-img .note_title").html("Kéo thả vào đây<br/>hoặc<br/>nhấn vào đây để chọn file");
        });

        // Drag over
        $('.wrap-exel-upload .wrap-drop-img,.wrap-exel-upload .wrap-drop-img .upload-area').on('dragover', function(e) { //vào vùng chọn
            preventDefaults(e)
            $(".wrap-exel-upload .wrap-drop-img .note_title").text("Thả vào đây...");
        });

        // Drop
        $('.wrap-exel-upload .wrap-drop-img .upload-area').on('drop', function(e) {
            preventDefaults(e)
            $scope.uploadfiles = e.originalEvent.dataTransfer.files;
            uploadExel(e.originalEvent.dataTransfer.files);
        });

        // file selected
        $("#file-exel").change(function() {
            // $scope.uploadfiles = document.getElementById('file-exel').files;
            uploadExel(document.getElementById('file-exel').files);
            // uploadExel();
        });
    });


    $scope.checkExcel = () => {
        console.log($("#file-exel").val());
        var fd = new FormData();
        angular.forEach($scope.uploadfiles, function(file) {
            fd.append('file', file);
        });
        console.log(fd);

        // var data = JSON.stringify($scope.excel);
        // fd.append('data', data);

        $http({
            method: 'post',
            url: 'telesales/uploadfile',
            data: fd,
            headers: {
                'Content-Type': undefined
            },
        }).then(r => {
            if (r.data.status == 1) {
                console.log(r);
            } else {
                toastr["error"]('Tệp không hợp lệ!.')
            }
        })
    }

    $scope.importExcel = (event) => {
        if (!$scope.excel.source_id) {
            toastr["error"]("Chọn nguồn!");
            return false;
        }
        $(event.target).css('pointer-events', 'none');

        var data = $scope.passDataExcel.map(v => Object.assign(v, {
            source_id: $scope.excel.source_id
        }))

        $http.post(base_url + 'sale_care/ajax_save_data_excel', JSON.stringify(data)).then(r => {
            if (r && r.data.status == 1) {
                toastr["success"]("Thành công!");
                $scope.getSourceExcel();
                $scope.exFresh();
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }





    $('#i_file').change(function(event) {
        var tmppath = URL.createObjectURL(event.target.files[0]);
        $("img").fadeIn("fast").attr('src', tmppath);


        $("#disp_tmp_path").html("Temporary Path(Copy it and try pasting it in browser address bar) --> <strong>[" + tmppath + "]</strong>");
    });






});