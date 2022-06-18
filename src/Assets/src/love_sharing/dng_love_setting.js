app.controller('dng_love_setting', function ($scope, $http, $compile) {
    var pi = $scope.pagingInfo = {
        itemsPerPage: 30,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };

    $scope.init = () => {
        $scope.base_url = base_url;
        $scope.objectGeneration();
        setTimeout(() => {
            $scope.dateInputInit();
            $scope.getAll();
        }, 10);
        $scope.getHeartRank();
    }

    $scope.objectGeneration = () => {
        $scope.filter = {};
        $scope.filter.category_id = '0';
        $scope.filter.active = '-1';
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;



        LoadData();
    }


    $scope.select2 = () => {
        setTimeout(() => {
            $('.select2').select2({
                minimumResultsForSearch: -1,
                selectionTitleAttribute: false,
                placeholder: function () {
                    $(this).data('placeholder');
                }
            });
        }, 10);
    }

    function LoadData() {
        $scope.load_policy();
    }
    $scope.load_policy = () => {
        $http.get(base_url + 'love_sharing/ajax_get_policy_txt').then(r => {
            if (r && r.data.status == 1) {
                $scope.policies = r.data.data;
                setTimeout(() => {
                    for (let index = 0; index < $scope.policies.length; index++) {
                        ckEditorReset('policyTxt' + index);
                    }
                }, 0);
            } else toastr["error"](r.data.messages);
        })
    }
    $scope.addPolicy = () => {
        var temp = {
            title: 'Chỉ mục mới',
            content: ''
        }
        $scope.policies.push(temp);
        for (let index = 0; index < $scope.policies.length; index++) {
            ckEditorReset('policyTxt' + index);
        }
    }
    $scope.updatePolicy = () => {
        for (let index = 0; index < $scope.policies.length; index++) {
            var id = 'policyTxt' + index;
            $scope.policies[index].content = CKEDITOR.instances[id].getData();
        }
        $http.post(base_url + 'love_sharing/ajax_update_policy_txt', $scope.policies).then(r => {
            if (r && r.data.status == 1) {
                toastr.success(r.data.messages);
            } else toastr["error"](r.data.messages);
        })
    }

    $scope.openModal = (type, item = {}) => {
        $scope.modalType = type;
        $scope.modalType.category_id = 0;
        switch (type) {
            case 'create':
                resetTheGift();
                break;
            case 'detail':
                $scope.the_gift = item;
                $scope.select2();
                break;
            default:
                break;
        }
        $('#codeModal').modal('show');
    }


    function ckEditorReset(id) {
        setTimeout(() => {
            $scope.ckeditor = CKEDITOR.replace(id, {
                uiColor: '#f2f3f5',
                // removePlugins: 'toolbar',
                height: '100',
                title: false,
                height: '400px',
                toolbarGroups: [
                    { name: 'basicstyles', groups: ['basicstyles', 'cleanup'] },
                    { name: 'paragraph', groups: ['list', 'indent', 'blocks', 'align', 'bidi'] },
                    { name: 'links', groups: ['links'] },
                    { name: 'colors', groups: ['TextColor', 'BGColor'] },
                    { name: 'insert', groups: ['Iframe', 'Youtube'] },
                    { name: 'colors' },
                    { name: 'styles' },
                ]
            });
            setTimeout(() => {
                $('iframe').removeAttr("title");
            }, 50);
        }, 50);
    }

    $scope.select2 = () => {
        setTimeout(() => {
            $('.select2').select2();
        }, 50);
    }
    $scope.getAll = () => {
        console.log($scope.filter);
        $http.get(base_url + 'love_sharing/get_all_love_gift?filter=' + JSON.stringify($scope.filter)).then(r => {
            $scope.rows = r.data.data;
            $scope.pagingInfo.total = r.data.count;
            $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
        })
    }
    // paging
    $scope.go2Page = function (page) {
        if (page < 0) return;
        var pi = $scope.pagingInfo;
        pi.currentPage = page;
        pi.from = pi.offset = (pi.currentPage - 1) * pi.itemsPerPage;
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = ($scope.pagingInfo.currentPage - 1) * $scope.pagingInfo.itemsPerPage;
        $scope.getAll();
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
    // end paging


    $scope.imageUpload = function (element, type) {
        var files = event.target.files; //FileList object
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var reader = new FileReader();
            reader.onload = $scope.imageIsLoaded;
            reader.readAsDataURL(file);
        }
        $scope.saveImage(files, type)
    }
    $scope.saveImage = (files, type) => {
        var formData = new FormData();
        formData.append('file', files[0]);
        $http({
            url: base_url + '/uploads/ajax_upload_to_filehost?func=dng_love_setting',
            method: "POST",
            data: formData,
            headers: { 'Content-Type': undefined }
        }).then(r => {
            if (r.data.status == 1) {
                $scope.the_gift.img_url = r.data.data[0];
            } else {
                toastr["error"]('Tệp không hợp lệ!.')
            }
        })
    }

    $scope.dateInputInit = () => {
        $('.custom-daterange').daterangepicker({
            opens: 'right',
            alwaysShowCalendars: true,
            startDate: moment().subtract(6, 'days'),
            endDate: moment(),
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

});