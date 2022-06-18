
// limit -1 filter hết dữ liệu
// close 1 có nút tắt 

//truyền url lấy toàn bộ data khoonh limit database trả về object
app.directive('manhSelect', function ($compile, $http) {
    return {
        restrict: 'E',
        scope: {
            selectedItem: '=preselectedItem',
            ngModel: '=',
            ngId: '=',
            placeholder: '@',
            fieldLabel: '@',
            show: '@',
            variable: '=',
            close: '@'
        },
        link: function (scope, element, attrs) {


            scope.$watch('variable', function (newValue, oldValue) {

                if (newValue == oldValue) {
                    return false
                }
                var check = false;


                scope.items.forEach(element => {
                    if (element.id == scope.variable) {
                        scope.ngModel = element;
                        check = true;
                    }
                });
                if (!check) {
                    scope.ngModel = undefined;
                }
            }, true);

            scope.selectVal = function (item) {
                scope.ngModel = item;
                scope.ngId = item.id;
                scope.key = undefined;
                scope.items = scope.first_data;
            };
            scope.load = true;
            scope.first_times = 1;




            scope.getData = function (key) {
                var data = {
                    // limit: attrs.limit ? attrs.limit : undefined,
                    // key: key,
                    // id: scope.variable
                }

                scope.load = true;
                $http.get(base_url + attrs.url + '?filter=' + JSON.stringify(data)).then(r => {

                    if (r && r.data.status == 1) {
                        scope.items = r.data.data;

                        if (scope.first_times == 1) {
                            scope.first_data = r.data.data;
                            scope.items.forEach(element => {
                                if (element.id == scope.variable && scope.variable) {
                                    scope.ngModel = element;
                                }
                            });
                        }
                        scope.first_times++;


                    } else toastr["error"]("Đã có lỗi xẩy ra!");
                    scope.load = false;
                });
            }
            scope.slidedown = (event) => {
                $(event.target).next('.wrap-directive').slideToggle(100);
                setTimeout(function () {
                    $(event.target).next('.wrap-directive').find('.input-direactive').focus();
                }, 10);
            }
            scope.click_out = (event) => {
                $(event.target).parent('.wrap-directive').slideUp(100);

            }
            scope.close_ = () => {
                scope.ngModel = undefined;
                scope.ngId = undefined;

            }







            var html = '';
            html += '<div class="form-directive" data-ng-init="getData()">';
            html += '<div class="result-directive" data-ng-click="slidedown($event)">{{ngModel.' + attrs.show + '||fieldLabel}}   <span ng-if="ngModel&&close==1" class="close-directive" data-ng-click="close_()"><img src="' + base_url + '/assets/images/close.png" width="16px" alt=""></span></div>';
            html += '  <div class="wrap-directive">';
            html += '    <input  type="text" class="form-control input-direactive" data-ng-model="key" ng-blur="click_out($event)" ng-change="searchKey(key)" data-ng-model-options="{debounce:50}" style="font-weight: 400" data-ng-attr-placeholder="{{placeholder}}">';
            html += '    <div>';
            html += '      <div >';
            html += '        <ul class="ul-directive" role="menu" >';
            html += '          <li data-ng-if="load==false" ng-class="{\'avctive-direct\':ngModel.id==item.id}" data-ng-repeat="item in items| custom:{key:key,limit:' + attrs.limit + '}"><a data-ng-href="" role="menuitem" tabindex="-1" data-ng-mousedown="selectVal(item)">{{item.name}} </a></li>';
            html += '          <li data-ng-if="load==true"><a data-ng-href="" class="text-center" role="menuitem" tabindex="-1" ><img src="' + base_url + '/assets/images/load-directive.svg"></a></li>';
            html += '        </ul>';
            html += '      </div>';
            html += '    </div>';
            html += '  </div>';
            html += '</div>';

            element.append($compile(html)(scope));



            scope.$watch('ngModel', function (newValue, oldValue) {
                if (newValue == oldValue) {
                    return false
                }
                if (scope.ngModel) {
                    scope.ngId = scope.ngModel.id;
                }
            }, true);
        }
    };
});
//truyền data có sẵn trả về object
app.directive('manhSelectOut', function ($compile, $http) {
    return {
        restrict: 'E',
        scope: {
            selectedItem: '=preselectedItem',
            ngModel: '=',
            ngId: '=',
            placeholder: '@',
            fieldLabel: '@',
            show: '@',
            variable: '=',
            close: '@',
            items: '='

        },
        link: function (scope, element, attrs) {

            scope.$watch('variable', function (newValue, oldValue) {

                if (newValue == oldValue) {
                    return false
                }

                scope.items.forEach(element => {
                    if (element.id == scope.variable) {
                        scope.ngModel = element;
                    }
                });
            }, true);

            scope.$watch('ngId', function (newValue, oldValue) {
                if (newValue == oldValue) {
                    return false
                }

                var check = false;
                scope.items.forEach(element => {
                    if (element.id == scope.ngId) {
                        scope.ngModel = element;
                        check = true;
                    }
                });
                if (!check) {
                    scope.ngModel = undefined;
                }

            }, true);

            scope.selectVal = function (item) {
                scope.ngModel = item;
                scope.ngId = item.id;
                scope.key = undefined;
            };
            scope.load = true;


            scope.getData = function (key) {
                var data = {
                    // limit: attrs.limit ? attrs.limit : undefined,
                    // key: key,
                    // id: scope.variable
                }


                // scope.load = true;
                // $http.get(base_url + attrs.url + '?filter=' + JSON.stringify(data)).then(r => {
                //     if (r && r.data.status == 1) {
                //         scope.items = r.data.data;

                //         if (scope.first_times == 1) {
                //             scope.first_data = r.data.data;
                //             scope.items.forEach(element => {
                //                 if (element.id == scope.variable && scope.variable) {
                //                     scope.ngModel = element;
                //                 }
                //             });
                //         }
                //         scope.first_times++;


                //     } else toastr["error"]("Đã có lỗi xẩy ra!");
                //     scope.load = false;
                // });
            }
            scope.slidedown = (event) => {
                $(event.target).next('.wrap-directive').slideToggle(100);
                setTimeout(function () {
                    $(event.target).next('.wrap-directive').find('.input-direactive').focus();
                }, 10);
            }
            scope.click_out = (event) => {
                $(event.target).parent('.wrap-directive').slideUp(100);

            }
            scope.close_ = () => {
                scope.ngModel = undefined;
                scope.ngId = undefined;

            }







            var html = '';
            html += '<div class="form-directive" data-ng-init="getData()">';
            html += '<div class="result-directive" data-ng-click="slidedown($event)">{{ngModel.' + attrs.show + '||fieldLabel}}   <span ng-if="ngModel&&close==1" class="close-directive" data-ng-click="close_()"><img src="' + base_url + '/assets/images/cl\ose.png" width="16px" alt=""></span></div>';
            html += '  <div class="wrap-directive">';
            html += '    <input  type="text" class="form-control input-direactive" data-ng-model="key" ng-blur="click_out($event)" ng-change="searchKey(key)" data-ng-model-options="{debounce:50}" style="font-weight: 400" data-ng-attr-placeholder="{{placeholder}}">';
            html += '    <div>';
            html += '      <div >';
            html += '        <ul class="ul-directive" role="menu" >';
            html += '          <li  ng-class="{\'avctive-direct\':ngModel.id==item.id}" data-ng-repeat="item in items| custom:{key:key,limit:' + attrs.limit + '}"><a data-ng-href="" role="menuitem" tabindex="-1" data-ng-mousedown="selectVal(item)">{{item.name}} </a></li>';
            html += '        </ul>';
            html += '      </div>';
            html += '    </div>';
            html += '  </div>';
            html += '</div>';

            element.append($compile(html)(scope));


            scope.$watch('ngModel', function (newValue, oldValue) {
                if (newValue == oldValue) {
                    return false
                }
                if (scope.ngModel) {
                    scope.ngId = scope.ngModel.id;
                } else {
                    scope.ngId = undefined;
                }
            }, true);
        }
    };
});


{/* <manh-select-out-trigger data-items="course_option" data-show="name" data-close="false" data-limit="20" data-field-label="Chọn khóa" data-ng-model="course.course_option" data-ng-id="course.course_id" data-placeholder="Nhập tên khóa" data-functions="triggerFunction"></manh-select-out-trigger> */ }

app.directive('manhSelectOutTrigger', function ($compile, $http) {
    return {
        restrict: 'E',
        scope: {
            selectedItem: '=preselectedItem',
            ngModel: '=',
            ngId: '=',
            placeholder: '@',
            fieldLabel: '@',
            show: '@',
            variable: '=',
            close: '@',
            items: '=',
            functions: '='
        },
        link: function (scope, element, attrs) {

            // scope.$watch('ngId', function (newValue, oldValue) {
            //     if (newValue == oldValue) {
            //         return false
            //     }
            //     if (!scope.ngId) {
            //         scope.ngModel = undefined;
            //     }

            // }, true);

            angular.extend(scope.functions, {
                trigger: function (id) {

                    var check = false;
                    scope.items.forEach(element => {
                        if (element.id == id) {
                            scope.ngModel = element;
                            scope.ngId = id;
                            check = true;
                        }
                    });
                    if (!check) {
                        scope.ngModel = undefined;
                        scope.ngId = undefined;
                    }
                    console.log(scope.ngId);


                }
            });


            scope.selectVal = function (item) {
                scope.ngModel = item;
                scope.ngId = item.id;
                scope.key = undefined;
            };
            scope.load = true;


            scope.getData = function (key) {
                var data = {
                    // limit: attrs.limit ? attrs.limit : undefined,
                    // key: key,
                    // id: scope.variable
                }


                // scope.load = true;
                // $http.get(base_url + attrs.url + '?filter=' + JSON.stringify(data)).then(r => {
                //     if (r && r.data.status == 1) {
                //         scope.items = r.data.data;

                //         if (scope.first_times == 1) {
                //             scope.first_data = r.data.data;
                //             scope.items.forEach(element => {
                //                 if (element.id == scope.variable && scope.variable) {
                //                     scope.ngModel = element;
                //                 }
                //             });
                //         }
                //         scope.first_times++;


                //     } else toastr["error"]("Đã có lỗi xẩy ra!");
                //     scope.load = false;
                // });
            }
            scope.slidedown = (event) => {
                $(event.target).next('.wrap-directive').slideToggle(100);
                setTimeout(function () {
                    $(event.target).next('.wrap-directive').find('.input-direactive').focus();
                }, 10);
            }
            scope.click_out = (event) => {
                $(event.target).parent('.wrap-directive').slideUp(100);

            }
            scope.close_ = () => {
                scope.ngModel = undefined;
                scope.ngId = undefined;

            }







            var html = '';
            html += '<div class="form-directive" data-ng-init="getData()">';
            html += '<div class="result-directive" data-ng-click="slidedown($event)">{{ngModel.' + attrs.show + '||fieldLabel}}   <span ng-if="ngModel&&close==1" class="close-directive" data-ng-click="close_()"><img src="' + base_url + '/assets/images/cl\ose.png" width="16px" alt=""></span></div>';
            html += '  <div class="wrap-directive">';
            html += '    <input  type="text" class="form-control input-direactive" data-ng-model="key" ng-blur="click_out($event)" ng-change="searchKey(key)" data-ng-model-options="{debounce:50}" style="font-weight: 400" data-ng-attr-placeholder="{{placeholder}}">';
            html += '    <div>';
            html += '      <div >';
            html += '        <ul class="ul-directive" role="menu" >';
            html += '          <li  ng-class="{\'avctive-direct\':ngModel.id==item.id}" data-ng-repeat="item in items| custom:{key:key,limit:' + attrs.limit + '}"><a data-ng-href="" role="menuitem" tabindex="-1" data-ng-mousedown="selectVal(item)">{{item.name}} </a></li>';
            html += '        </ul>';
            html += '      </div>';
            html += '    </div>';
            html += '  </div>';
            html += '</div>';

            element.append($compile(html)(scope));


            scope.$watch('ngModel', function (newValue, oldValue) {
                if (newValue == oldValue) {
                    return false
                }
                if (scope.ngModel) {
                    scope.ngId = scope.ngModel.id;
                } else {
                    scope.ngId = undefined;
                }
            }, true);
        }
    };
});
app.filter('custom', function () {
    return function (input, search, scope) {

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
            slug = slug.replace(/\`|\~|\!|\@|\#|\||\$|\%|\^|\&|\*||∣|\+|\=|\,|\.|\/|\?|\>|\<|\'|\"|\:|\;|_/gi, '');
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

        if (!input) return input;
        if (!search) return input;
        //var expected = ('' + search).toLowerCase();
        var expected = ToSlug(search.key);
        var result = {};
        var dem = 0;
        angular.forEach(input, function (value, key) {
            //	var actual = ('' + value.user_name).toLowerCase();
            var actual = ToSlug(value.name);
            if (search.limit != -1) {
                if (dem <= search.limit)
                    if (actual.indexOf(expected) !== -1) {
                        dem++;
                        result[key] = value;
                    }
            } else {

                if (actual.indexOf(expected) !== -1) {
                    result[key] = value;
                }
            }

        });
        return result;
    }
});


{/* <manh-select-query data-url="hocvien/ajax/ajax_get_member" style="width: calc(100% - 90px)" data-show="name" ng-id="member_id" data-limit="20" data-field-label="Chọn học viên" data-ng-model="member" data-placeholder="Nhập tên học viên" data-functions="triggerFunction"></manh-select-query> */ }
// truyền url query và trả về object selected, có thể trigger function select, có limit database

app.directive('manhSelectQuery', function ($compile, $http) {
    return {
        restrict: 'E',
        scope: {
            selectedItem: '=preselectedItem',
            ngModel: '=',
            ngId: '=',
            placeholder: '@',
            fieldLabel: '@',
            show: '@',
            close: '@',
            functions: '='

        },
        link: function (scope, element, attrs) {





            scope.selectVal = function (item) {
                scope.ngModel = item;
                scope.ngId = item.id;
                scope.key = undefined;
                scope.items = scope.first_data;
            };
            scope.load = true;
            scope.first_times = 1;
            scope.check = false;


            angular.extend(scope.functions, {
                trigger: function (id = null) {
                    if (id) {
                        scope.ngId = id;
                    }
                    scope.check = true;
                    scope.getData(scope.key)
                }
            });

            scope.getData = function (key) {
                if (!scope.check) {
                    return false;
                }
                var data = {
                    limit: attrs.limit ? attrs.limit : undefined,
                    key: key,
                    id: scope.ngId ? scope.ngId : 0
                }
                console.log(data);

                console.log(attrs.attribute);


                if (attrs.attribute) {
                    data.more_at = attrs.attribute;
                }

                scope.load = true;
                $http.get(base_url + attrs.url + '?filter=' + JSON.stringify(data)).then(r => {

                    if (r && r.data.status == 1) {
                        scope.items = r.data.data;
                        if (scope.first_times == 1) {
                            scope.first_data = r.data.data;
                        }
                        scope.first_times++;
                        if (scope.ngId) {
                            scope.ngModel = r.data.selected;
                        }
                    } else toastr["error"]("Đã có lỗi xẩy ra!");
                    scope.load = false;
                });
            }
            scope.slidedown = (event) => {
                scope.key = undefined;
                scope.check = true;
                scope.getData(scope.key);
                $(event.target).next('.wrap-directive').slideToggle(100);
                setTimeout(function () {
                    $(event.target).next('.wrap-directive').find('.input-direactive').focus();
                }, 10);

            }
            scope.click_out = (event) => {
                $(event.target).parent('.wrap-directive').slideUp(100);

            }
            scope.close_ = () => {
                scope.ngModel = undefined;
                scope.ngId = undefined;

            }







            var html = '';
            html += '<div class="form-directive" data-ng-init="getData()">';
            html += '<div class="result-directive" data-ng-click="slidedown($event)">{{ngModel.' + attrs.show + '||fieldLabel}}   <span ng-if="ngModel&&close==1" class="close-directive" data-ng-click="close_()"><img src="' + base_url + '/assets/images/cl\ose.png" width="16px" alt=""></span></div>';
            html += '  <div class="wrap-directive">';
            html += '    <input  type="text" class="form-control input-direactive" data-ng-model="key" ng-blur="click_out($event)" ng-change="getData(key)" data-ng-model-options="{debounce:350}" style="font-weight: 400" data-ng-attr-placeholder="{{placeholder}}">';
            html += '    <div>';
            html += '      <div >';
            html += '        <ul class="ul-directive" role="menu" >';
            html += '          <li data-ng-if="load==false" ng-class="{\'avctive-direct\':ngModel.id==item.id}" data-ng-repeat="item in items"><a data-ng-href="" role="menuitem" tabindex="-1" data-ng-mousedown="selectVal(item)">{{item.name}} </a></li>';
            html += '          <li data-ng-if="load==true"><a data-ng-href="" class="text-center" role="menuitem" tabindex="-1" ><img src="' + base_url + '/assets/images/load-directive.svg"></a></li>';
            html += '        </ul>';
            html += '      </div>';
            html += '    </div>';
            html += '  </div>';
            html += '</div>';

            element.append($compile(html)(scope));



            scope.$watch('ngModel', function (newValue, oldValue) {
                if (newValue == oldValue) {
                    return false
                }
                if (scope.ngModel) {
                    scope.ngId = scope.ngModel.id;
                } else {
                    scope.ngId = undefined;
                }
            }, true);
        }


    };
});

// truyền object có sẵn và trả về id 
{/* <manh-select-out-id data-items="f1.subjects" data-show="name" data-close="1" data-limit="-1" data-field-label="Chọn" data-ng-id="id_test" data-placeholder="Nhập"></manh-select-out-id> */ }
app.directive('manhSelectOutId', function ($compile, $http) {
    return {
        restrict: 'E',
        scope: {
            selectedItem: '=preselectedItem',
            ngId: '=',
            placeholder: '@',
            fieldLabel: '@',
            show: '@',
            close: '@',
            items: '='
        },
        link: function (scope, element, attrs) {
            scope.ngModel = undefined;
            scope.$watch('ngId', function (newValue, oldValue) {
                if (newValue == oldValue) {
                    return false
                }
                var check = false;
                if (scope.items) {
                    scope.items.forEach(element => {
                        if (element.id == scope.ngId) {
                            scope.ngModel = element;
                            check = true;
                        }
                    });
                    if (!check) {
                        scope.ngModel = undefined;
                    }
                }
            }, true);

            scope.$watch('items', function (newValue, oldValue) {
                if (newValue == oldValue) {
                    return false
                }
                var check = false;
                if (scope.items) {
                    scope.items.forEach(element => {
                        if (element.id == scope.ngId) {
                            scope.ngModel = element;
                            check = true;
                        }
                    });
                    if (!check) {
                        scope.ngModel = undefined;
                    }
                }
            }, true);

            scope.selectVal = function (item) {
                scope.ngModel = item;
                scope.ngId = item.id;
                scope.key = undefined;
            };
            scope.load = true;


            scope.getData = function (key) {
            }
            scope.slidedown = (event) => {
                $(event.target).next('.wrap-directive').slideToggle(100);
                setTimeout(function () {
                    $(event.target).next('.wrap-directive').find('.input-direactive').focus();
                }, 10);
            }
            scope.click_out = (event) => {
                $(event.target).parent('.wrap-directive').slideUp(100);

            }
            scope.close_ = () => {
                scope.ngModel = undefined;
                scope.ngId = undefined;

            }








            var html = '';
            html += '<div class="form-directive" data-ng-init="getData()">';
            html += '<div class="result-directive" data-ng-click="slidedown($event)">{{ngModel.' + attrs.show + '||fieldLabel}}    <span ng-if="ngModel&&close==1" class="close-directive" data-ng-click="close_()"><img src="' + base_url + '/assets/images/cl\ose.png" width="16px" alt=""></span></div>';
            html += '  <div class="wrap-directive">';
            html += '    <input  type="text" class="form-control input-direactive" data-ng-model="key" ng-blur="click_out($event)" ng-change="searchKey(key)" data-ng-model-options="{debounce:50}" style="font-weight: 400" data-ng-attr-placeholder="{{placeholder}}">';
            html += '    <div>';
            html += '      <div >';
            html += '        <ul class="ul-directive" role="menu" >';
            html += '          <li  ng-class="{\'avctive-direct\':ngModel.id==item.id}" data-ng-repeat="item in items| custom:{key:key,limit:' + attrs.limit + '}"><a data-ng-href="" role="menuitem" tabindex="-1" data-ng-mousedown="selectVal(item)">{{item.name}} </a></li>';
            html += '        </ul>';
            html += '      </div>';
            html += '    </div>';
            html += '  </div>';
            html += '</div>';

            element.append($compile(html)(scope));

            scope.$watch('ngModel', function (newValue, oldValue) {
                if (newValue == oldValue) {
                    return false
                }
                if (scope.ngModel) {
                    scope.ngId = scope.ngModel.id;
                } else {
                    scope.ngId = undefined;
                }
            }, true);
        }
    };
});

// truyền đường dẫn  và trả về id 
{/* <manh-select-id data-url="hocvien/ajax/ajax_get_teachers" data-show="name" data-close="1" data-limit="-1" data-field-label="Chọn giảng viên" data-ng-id="id_test" data-placeholder="Nhập tên giảng viên"></manh-select-id> */ }
app.directive('manhSelectId', function ($compile, $http) {
    return {
        restrict: 'E',
        scope: {
            selectedItem: '=preselectedItem',
            ngId: '=',
            placeholder: '@',
            fieldLabel: '@',
            show: '@',
            close: '@'
        },
        link: function (scope, element, attrs) {



            scope.selectVal = function (item) {
                scope.ngModel = item;
                scope.ngId = item.id;
                scope.key = undefined;
                scope.items = scope.first_data;
            };
            scope.load = true;
            scope.first_times = 1;




            scope.getData = function (key) {
                var data = {
                    // limit: attrs.limit ? attrs.limit : undefined,
                    // key: key,
                    // id: scope.variable
                }

                scope.load = true;
                $http.get(base_url + attrs.url + '?filter=' + JSON.stringify(data)).then(r => {

                    if (r && r.data.status == 1) {
                        scope.items = r.data.data;

                        scope.items.forEach(element => {
                            if (element.id == scope.ngId && scope.ngId) {
                                scope.ngModel = element;
                            }
                        });


                    } else toastr["error"]("Đã có lỗi xẩy ra!");
                    scope.load = false;
                });
            }
            scope.slidedown = (event) => {
                $(event.target).next('.wrap-directive').slideToggle(100);
                setTimeout(function () {
                    $(event.target).next('.wrap-directive').find('.input-direactive').focus();
                }, 10);
            }
            scope.click_out = (event) => {
                $(event.target).parent('.wrap-directive').slideUp(100);

            }
            scope.close_ = () => {
                scope.ngModel = undefined;
                scope.ngId = undefined;

            }







            var html = '';
            html += '<div class="form-directive" data-ng-init="getData()">';
            html += '<div class="result-directive" data-ng-click="slidedown($event)">{{ngModel.' + attrs.show + '||fieldLabel}}   <span ng-if="ngModel&&close==1" class="close-directive" data-ng-click="close_()"><img src="' + base_url + '/assets/images/cl\ose.png" width="16px" alt=""></span></div>';
            html += '  <div class="wrap-directive">';
            html += '    <input  type="text" class="form-control input-direactive" data-ng-model="key" ng-blur="click_out($event)" ng-change="searchKey(key)" data-ng-model-options="{debounce:50}" style="font-weight: 400" data-ng-attr-placeholder="{{placeholder}}">';
            html += '    <div>';
            html += '      <div >';
            html += '        <ul class="ul-directive" role="menu" >';
            html += '          <li data-ng-if="load==false" ng-class="{\'avctive-direct\':ngModel.id==item.id}" data-ng-repeat="item in items| custom:{key:key,limit:' + attrs.limit + '}"><a data-ng-href="" role="menuitem" tabindex="-1" data-ng-mousedown="selectVal(item)">{{item.name}} </a></li>';
            html += '          <li data-ng-if="load==true"><a data-ng-href="" class="text-center" role="menuitem" tabindex="-1" ><img src="' + base_url + '/assets/images/load-directive.svg"></a></li>';
            html += '        </ul>';
            html += '      </div>';
            html += '    </div>';
            html += '  </div>';
            html += '</div>';

            element.append($compile(html)(scope));

            scope.$watch('ngModel', function (newValue, oldValue) {
                if (newValue == oldValue) {
                    return false
                }
                if (scope.ngModel) {
                    scope.ngId = scope.ngModel.id;
                } else {
                    scope.ngId = undefined;
                }
            }, true);
        }
    };
});

app.directive('numberInput', function ($filter) {
    return {
        require: 'ngModel',
        link: function (scope, elem, attrs, ngModelCtrl) {

            ngModelCtrl.$formatters.push(function (modelValue) {
                return setDisplayNumber(modelValue, true);
            });

            // it's best to change the displayed text using elem.val() rather than
            // ngModelCtrl.$setViewValue because the latter will re-trigger the parser
            // and not necessarily in the correct order with the changed value last.
            // see http://radify.io/blog/understanding-ngmodelcontroller-by-example-part-1/
            // for an explanation of how ngModelCtrl works.
            ngModelCtrl.$parsers.push(function (viewValue) {
                setDisplayNumber(viewValue);
                return setModelNumber(viewValue);
            });

            // occasionally the parser chain doesn't run (when the user repeatedly 
            // types the same non-numeric character)
            // for these cases, clean up again half a second later using "keyup"
            // (the parser runs much sooner than keyup, so it's better UX to also do it within parser
            // to give the feeling that the comma is added as they type)
            elem.bind('keyup focus blur', function () {
                setDisplayNumber(elem.val());
            })

            function setDisplayNumber(val, formatter) {
                var valStr, displayValue;

                if (typeof val === 'undefined') {
                    return 0;
                }

                valStr = val.toString();
                displayValue = valStr.replace(/,/g, '').replace(/[A-Za-z-]/g, '');
                displayValue = parseFloat(displayValue);
                displayValue = (!isNaN(displayValue)) ? displayValue.toString() : '';

                // handle leading character -/0
                if (valStr.length === 1 && valStr[0] === '-') {
                    displayValue = valStr[0];
                } else if (valStr.length === 1 && valStr[0] === '0') {
                    displayValue = '0';
                } else {
                    displayValue = $filter('number')(displayValue);
                }
                // handle decimal
                if (!attrs.integer) {
                    if (displayValue.indexOf('.') === -1) {
                        if (valStr.slice(-1) === '.') {
                            displayValue += '.';
                        } else if (valStr.slice(-2) === '.0') {
                            displayValue += '.0';
                        } else if (valStr.slice(-3) === '.00') {
                            displayValue += '.00';
                        }
                    } // handle last character 0 after decimal and another number
                    else {
                        if (valStr.slice(-1) === '0') {
                            displayValue += '0';
                        }
                    }
                }

                if (attrs.positive && displayValue[0] === '-') {
                    displayValue = displayValue.substring(1);
                }


                if (typeof formatter !== 'undefined') {
                    return (displayValue == '') ? 0 : displayValue;
                } else {
                    elem.val((displayValue == '0') ? '' : displayValue);
                }

            }

            function setModelNumber(val) {
                var modelNum = val.toString().replace(/,/g, '').replace(/[A-Za-z]/g, '');
                modelNum = parseFloat(modelNum);
                modelNum = (!isNaN(modelNum)) ? modelNum : 0;
                if (modelNum.toString().indexOf('.') !== -1) {
                    modelNum = Math.round((modelNum + 0.00001) * 100) / 100;
                }
                if (attrs.positive) {
                    modelNum = Math.abs(modelNum);
                }
                return modelNum;
            }
        }
    };

});


app.directive('manhSelectQueryMuti', function ($compile, $http) {
    return {
        restrict: 'E',
        scope: {
            selectedItem: '=preselectedItem',
            ngModel: '=',
            ngId: '=',
            placeholder: '@',
            fieldLabel: '@',
            show: '@',
            close: '@',
            functions: '=',
            blankAfterSelect: '='
        },
        link: function (scope, element, attrs) {





            scope.selectVal = function (item) {

                if (scope.ngModel.length == 0) {
                    scope.ngModel.push(item);
                } else {
                    var index = -1;
                    scope.ngModel.forEach((element, i) => {
                        if (element.id == item.id) {
                            index = i;
                        }
                    });
                    if (index > -1) {
                        scope.ngModel.splice(index, 1);
                    } else {
                        scope.ngModel.push(item);
                    }
                }
            };
            scope.load = true;
            scope.first_times = 1;
            scope.check = false;


            angular.extend(scope.functions, {
                trigger: function (id) {
                    if (id) {
                        scope.ngId = id;
                    }
                    scope.check = true;
                    scope.getData(scope.key)
                }
            });

            scope.getData = function (key) {
                if (!scope.check) {
                    return false;
                }
                var data = {
                    limit: attrs.limit ? attrs.limit : undefined,
                    key: key,
                    id: scope.ngId ? scope.ngId : 0
                }

                scope.load = true;
                $http.get(base_url + attrs.url + '?filter=' + JSON.stringify(data)).then(r => {
                    if (r && r.data.status == 1) {
                        scope.items = r.data.data;
                        scope.items.map(element => {
                            if (scope.ngModel)
                                scope.ngModel.forEach(e => {
                                    if (element.id == e.id) {
                                        element.check = 1;
                                    }
                                });
                        })
                    } else toastr["error"]("Đã có lỗi xẩy ra!");
                    scope.load = false;
                });
            }
            scope.slidedown = (event) => {
                scope.key = undefined;
                scope.check = true;
                scope.getData(scope.key);
                $(event.target).next('.wrap-directive').slideToggle(100);
                setTimeout(function () {
                    $(event.target).next('.wrap-directive').find('.input-direactive').focus();
                }, 10);

            }
            scope.click_out = (event) => {
                $(event.target).parent('.wrap-directive').slideUp(100);

            }
            scope.close_ = () => {
                scope.ngModel = undefined;
            }







            var html = '';
            html += '<div class="form-directive" data-ng-init="getData()">';
            html += '<div class="result-directive" data-ng-click="slidedown($event)">{{ngModel.' + attrs.show + '||fieldLabel}}   <span ng-if="ngModel&&close==1" class="close-directive" data-ng-click="close_()"><img src="' + base_url + '/assets/images/cl\ose.png" width="16px" alt=""></span></div>';
            html += '  <div class="wrap-directive">';
            html += '    <input  type="text" class="form-control input-direactive" data-ng-model="key" ng-blur="click_out($event)" ng-change="getData(key)" data-ng-model-options="{debounce:350}" style="font-weight: 400" data-ng-attr-placeholder="{{placeholder}}">';
            html += '    <div>';
            html += '      <div >';
            html += '        <ul class="ul-directive" role="menu" >';
            html += '          <li data-ng-if="load==false" ng-class="{\'avctive-direct\':item.check==1}" data-ng-repeat="item in items"><a data-ng-href="" role="menuitem" tabindex="-1" data-ng-mousedown="selectVal(item)">{{item.name}} </a></li>';
            html += '          <li data-ng-if="load==true"><a data-ng-href="" class="text-center" role="menuitem" tabindex="-1" ><img src="' + base_url + '/assets/images/load-directive.svg"></a></li>';
            html += '        </ul>';
            html += '      </div>';
            html += '    </div>';
            html += '  </div>';
            html += '</div>';

            element.append($compile(html)(scope));



            scope.$watch('ngModel', function (newValue, oldValue) {
                if (newValue == oldValue) {
                    return false
                }
                if (scope.ngModel) {
                    scope.ngId = [];
                    scope.ngModel.forEach(element => {
                        scope.ngId.push(element.id);
                    });


                } else {
                    scope.ngId = undefined;
                }
            }, true);
        }


    };
});


app.directive('cusInput', function ($filter) {
    return {
        require: 'ngModel',
        link: function (scope, elem, attrs, ngModelCtrl) {

            ngModelCtrl.$formatters.push(function (modelValue) {
                return setDisplayNumber(modelValue, true);
            });

            // it's best to change the displayed text using elem.val() rather than
            // ngModelCtrl.$setViewValue because the latter will re-trigger the parser
            // and not necessarily in the correct order with the changed value last.
            // see http://radify.io/blog/understanding-ngmodelcontroller-by-example-part-1/
            // for an explanation of how ngModelCtrl works.
            ngModelCtrl.$parsers.push(function (viewValue) {
                setDisplayNumber(viewValue);
                return setModelNumber(viewValue);
            });

            // occasionally the parser chain doesn't run (when the user repeatedly 
            // types the same non-numeric character)
            // for these cases, clean up again half a second later using "keyup"
            // (the parser runs much sooner than keyup, so it's better UX to also do it within parser
            // to give the feeling that the comma is added as they type)
            elem.bind('keyup focus blur', function () {
                setDisplayNumber(elem.val());
            })

            function setDisplayNumber(val, formatter) {
                var valStr, displayValue;

                if (typeof val === 'undefined') {
                    return 0;
                }

                valStr = val.toString();
                displayValue = valStr.replace(/,/g, '').replace(/[A-Za-z-]/g, '');
                displayValue = parseFloat(displayValue);
                displayValue = (!isNaN(displayValue)) ? displayValue.toString() : '';

                // handle leading character -/0
                if (valStr.length === 1 && valStr[0] === '-') {
                    displayValue = valStr[0];
                } else if (valStr.length === 1 && valStr[0] === '0') {
                    displayValue = '0';
                } else {
                    displayValue = $filter('number')(displayValue);
                }
                // handle decimal
                if (!attrs.integer) {
                    if (displayValue.indexOf('.') === -1) {
                        // if (valStr.slice(-1) === '.') {
                        //     displayValue += '.';
                        // } else if (valStr.slice(-2) === '.0') {
                        //     displayValue += '.0';
                        // } else if (valStr.slice(-3) === '.00') {
                        //     displayValue += '.00';
                        // }
                    } // handle last character 0 after decimal and another number
                    else {
                        if (valStr.slice(-1) === '0') {
                            displayValue += '0';
                        }
                    }
                }

                if (attrs.positive && displayValue[0] === '-') {
                    displayValue = displayValue.substring(1);
                }


                if (typeof formatter !== 'undefined') {
                    return (displayValue == '') ? 0 : displayValue;
                } else {
                    elem.val((displayValue == '0') ? '' : displayValue);
                }

            }

            function setModelNumber(val) {
                var modelNum = val.toString().replace(/,/g, '').replace(/[A-Za-z]/g, '');
                modelNum = parseFloat(modelNum);
                modelNum = (!isNaN(modelNum)) ? modelNum : 0;
                if (modelNum.toString().indexOf('.') !== -1) {
                    modelNum = Math.round((modelNum + 0.00001) * 100) / 100;
                }
                if (attrs.positive) {
                    modelNum = Math.abs(modelNum);
                }
                return modelNum;
            }
        }
    };

});