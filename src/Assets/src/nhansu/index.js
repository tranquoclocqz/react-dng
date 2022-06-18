app.controller('index', function ($scope, $http) {
    $scope.init = () => {

    }

    $scope.getBackWp = (user, idwp) => {
        var data = {
            user_id: user,
            wp_id: idwp
        }

        $http.post(base_url + '/nhansu/admin_users/ajax_get_back_wp', JSON.stringify(data)).then(r => {

            $('#getback').css('opacity', '0.5');

            if (r && r.data.status == 1) {

                $('#getback').css('opacity', '1');

                if (r.data.data.status == 0) {
                    toastr["error"](r.data.data.message);
                }
                else if (r.data.data.status == 1) {
                    toastr['success']('Đã coppy link');
                    copyPhoneToClipboard(r.data.data.claimLink);
                } else {
                    toastr["error"](r.data.data.Message);
                }
                $scope.buttonClicked = true;

            } else toastr["error"]("Đã có lỗi xẩy ra!");

        });
    }

    function copyPhoneToClipboard(str) {
        // Create new element
        var el = document.createElement('textarea');
        // Set value (string to be copied)
        el.value = str;
        // Set non-editable to avoid focus and move outside of view
        el.setAttribute('readonly', '');
        el.style = { position: 'absolute', left: '-9999px' };
        document.body.appendChild(el);
        // Select text inside element
        el.select();
        // Copy text to clipboard
        document.execCommand('copy');
        // Remove temporary element
        document.body.removeChild(el);
    }
});
