
app.controller('projectdtCtrl', function ($scope, $http) {
    $scope.init = () => {
        $scope.project = {};
        $scope.date = '';
        $scope.date2;
        $scope.inputTime();
    }
    $scope.inputTime = () => {

    }
    $scope.getDate = (event) => {
        //   $scope.date2=$scope.date2
        console.log($('input[name="startgroupdate"]').val());
        //console.log($scope.date2);
    }
    $('#admin_group_select').on('change', function (e) {
        var x = $('#admin_group_select').val();
        console.log(x);
    })
});
