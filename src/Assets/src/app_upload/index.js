app.directive('ngFile', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {

            element.bind('change', function () {

                // $parse(attrs.ngFile).assign(scope, element[0].files)

                // scope.$apply();

            });
        }
    };
}]);
app.controller('index', function ($scope, $http, $compile, $window, $timeout) {
    var pi = $scope.pagingInfo = {
        itemsPerPage: 20,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };
    $scope.init = () => {
        $scope.filter = {};
        $scope.filter.type = 1;
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;
        $scope.changeItem = {};
        $scope.newUpload = {};
        $scope.uploadfiles = [];

        $scope.editStatus = 0;
        setTimeout(() => {
            $scope.dateInputInit();
        }, 50);

        $('.upload-result').css('height', window.innerHeight - 350 + 'px');
        $('.right-result').css('height', window.innerHeight - 249 - 41.6 + 'px');
    }
    $scope.readyUpdate = (item) => {
        $scope.editStatus = 1;
        $http.get(base_url + 'app_upload/get_file_list/' + item.id).then(r => {
            if (r && r.data.status == 1) {
                item.filelist_old = r.data.data;
            }
        });

        $scope.newUpload = item;
    }
    $scope.backToAdd = () => {
        $scope.editStatus = 0;
        $scope.newUpload = {};
        $scope.uploadfiles = [];
    }
    $scope.removeFileItemInOld = (index, item) => {
        $http.get(base_url + 'app_upload/delete_file_inlist/' + item.id).then(r => {
            if (r && r.data.status == 1) {
                $scope.get_upload_history();
                $scope.newUpload.filelist_old.splice(index, 1);
            }
        });
    }
    $scope.select2 = () => {
        setTimeout(() => {
            $('.select2').select2();
            $scope.$apply();
        }, 0);
    }
    $scope.getFileList = (item) => {
        $http.get(base_url + 'app_upload/get_file_list/' + item.id).then(r => {
            if (r && r.data.status == 1) {
                item.filelist = r.data.data;
            }
        });
    }
    $scope.get_upload_history = (type) => {
        if (type) {
            $scope.filter.type = type;
        }
        $http.get(base_url + 'app_upload/get_upload_history?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r && r.data.status == 1) {
                $scope.rows = r.data.data;
                $scope.pagingInfo.total = r.data.count;
                $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
            }
        });
    }
    $scope.dateInputInit = () => {
        $('.custom-daterange').daterangepicker({
            opens: 'left',
            alwaysShowCalendars: true,
            startDate: moment().subtract(7, 'days'),
            endDate: moment().subtract(0, 'day'),
            // maxDate: moment(),
            maxYear: parseInt(moment().format('YYYY'), 10),
            ranges: {
                'Hôm nay': [moment(), moment()],
                'Hôm qua': [moment().subtract(1, 'days'), moment().subtract(1,
                    'days')],
                '7 ngày trước': [moment().subtract(6, 'days'), moment()],
                '30 ngày trước': [moment().subtract(29, 'days'), moment()],
                'Tháng này': [moment().startOf('month'), moment().endOf('month')],
                'Tháng trước': [moment().subtract(1, 'month').startOf('month'),
                moment().subtract(1, 'month').endOf('month')
                ]
            },
            locale: {
                format: 'DD/MM/YYYY',
            }
        });
    }

    function preventDefaults(e) {
        e.preventDefault()
        e.stopPropagation()
    }
    $(function () {
        /*  begin upload modal Exel*/
        $(".wrap-exel-upload .wrap-drop-img").on("drop", function (e) {
            e.preventDefault();
            e.stopPropagation();
        });

        // Drag enter
        $('.wrap-exel-upload .wrap-drop-img').on('dragenter', function (e) { //ra khỏi vùng chọn
            preventDefaults(e)
            $(".wrap-exel-upload .wrap-drop-img .note_title").html('<i class="fa fa-upload" aria-hidden="true"></i> <br/>  Kéo thả vào đây<br/>hoặc<br/><div class="btn-btn-sm btn-file-select">Chọn file</div>');
        });

        // Drag over
        $('.wrap-exel-upload .wrap-drop-img,.wrap-exel-upload .wrap-drop-img .upload-area').on('dragover', function (e) { //vào vùng chọn
            preventDefaults(e)
            $(".wrap-exel-upload .wrap-drop-img .note_title").text("Thả vào đây...");
        });

        // Drop
        $('.wrap-exel-upload .wrap-drop-img .upload-area').on('drop', function (e) {
            preventDefaults(e)
            $scope.$apply(function () {
                var files_s = Array.from(e.originalEvent.dataTransfer.files);
                $scope.uploadfiles = [...($scope.uploadfiles), ...(files_s)];
            });
        });

        //change file

        $('#file-exel').on('change', function (e) {
            $scope.$apply(function () {
                var files_s = Array.from(document.getElementById('file-exel').files);
                $scope.uploadfiles = [...($scope.uploadfiles), ...(files_s)];
            });
        })
    });

    $scope.removeFileItem = (position) => {
        $scope.uploadfiles = Array.from($scope.uploadfiles);
        $scope.uploadfiles.splice(position, 1);
    }
    $scope.readychangeRq = (type, item) => {
        angular.forEach($scope.rows, function (element, index) {
            delete element.changeType;
            delete element.environment;
        })
        item.changeType = type;
    }
    $scope.confirmEnvironment = (item, type) => {
        item.environment = type;
        $scope.changeItem = item;
        $('#status-modal').modal('show');
    }

    $("#status-modal").on('hide.bs.modal', function () {
        $scope.$apply(function () {
            angular.forEach($scope.rows, function (element, index) {
                delete element.changeType;
                delete element.environment;
            })
        });
    });
    $scope.confirmRequest = () => {
        $http.post(base_url + 'app_upload/ajax_confirmRequest', JSON.stringify($scope.changeItem)).then(r => {
            if (r && r.data.status == 1) {
                toastr["success"]("Thành công!");
                $scope.get_upload_history();

                $('#status-modal').modal('hide');
            } else if (r && r.data.status == 0) {
                toastr["error"](r.data.message);
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }
    $scope.checkExcel = () => {
        var fd = new FormData();
        var filepaths = [];
        angular.forEach($scope.uploadfiles, function (file, index) {
            if (!file['filePath']) {
                toastr["error"]('Vui lòng nhập đủ filepath!.')
                return false;
            }
            let temp = {};
            temp.file_name = file['name'];
            temp.file_url = file['filePath'];
            filepaths.push((temp));
            fd.append('file' + index, file);
        });
        $scope.newUpload.data = filepaths;
        $http.post(base_url + 'app_upload/create_request', JSON.stringify($scope.newUpload)).then(r => {

            console.log(r.data);
            if (r && r.data.status == 1) {
                $http({
                    method: 'POST',
                    url: 'app_upload/uploadfile/' + r.data.id,
                    data: fd,
                    headers: {
                        'Content-Type': undefined
                    },
                }).then(r => {
                    if (r.data.status == 1) {
                        toastr["success"]('Upload thành công!.')
                        $scope.newUpload = {};
                        $scope.uploadfiles = [];
                        $scope.editStatus = 0;
                        $scope.get_upload_history();
                    } else {
                        toastr["error"]('Tệp không hợp lệ!.')
                    }
                })
            } else if (r && r.data.status == 0) {
                toastr["error"](r.data.message);
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });

    }

    $scope.go2Page = function (page) {
        if (page < 0) return;
        var pi = $scope.pagingInfo;
        pi.currentPage = page;
        pi.from = pi.offset = (pi.currentPage - 1) * pi.itemsPerPage;
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = ($scope.pagingInfo.currentPage - 1) * $scope.pagingInfo.itemsPerPage;
        $scope.get_upload_history();
        pi.to = pi.total < pi.itemsPerPage ? pi.total : pi.itemsPerPage
    }

    $scope.Previous = function (page) {
        if (page - 1 > 0) $scope.go2Page(page - 1);
        if (page - 1 == 0) $scope.go2Page(page);
    }

    $scope.getRange = function (paging) {
        var max = paging.currentPage + 3;
        var total = paging.totalPage + 1;
        if (max > total) max = total;
        var min = paging.currentPage - 2;
        if (min <= 0) min = 1;
        var tmp = [];
        return _.range(min, max);
    }
});