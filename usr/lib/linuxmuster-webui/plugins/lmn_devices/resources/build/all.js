// Generated by CoffeeScript 2.3.1
(function() {
  angular.module('lm.devices', ['core', 'lm.common']);

}).call(this);

// Generated by CoffeeScript 2.3.1
(function() {
  angular.module('lm.devices').config(function($routeProvider) {
    return $routeProvider.when('/view/lm/devices', {
      controller: 'LMDevicesController',
      templateUrl: '/lm_devices:resources/partial/index.html'
    });
  });

  angular.module('lm.devices').controller('LMDevicesApplyModalController', function($scope, $http, $uibModalInstance, gettext, notify) {
    $scope.logVisible = false;
    $scope.isWorking = true;
    $scope.showLog = function() {
      return $scope.logVisible = true;
    };
    $http.get('/api/lm/devices/import').then(function(resp) {
      $scope.isWorking = false;
      return notify.success(gettext('Import complete'));
    }).catch(function(resp) {
      notify.error(gettext('Import failed'), resp.data.message);
      $scope.isWorking = false;
      return $scope.showLog();
    });
    return $scope.close = function() {
      return $uibModalInstance.close();
    };
  });

  angular.module('lm.devices').controller('LMDevicesController', function($scope, $http, $uibModal, $route, gettext, notify, pageTitle, lmFileEditor, lmFileBackups) {
    pageTitle.set(gettext('Devices'));
    $scope.sorts = [
      {
        name: gettext('Room'),
        fx: function(x) {
          return x.room;
        }
      },
      {
        name: gettext('Group'),
        fx: function(x) {
          return x.group;
        }
      },
      {
        name: gettext('Hostname'),
        fx: function(x) {
          return x.hostname;
        }
      },
      {
        name: gettext('MAC'),
        fx: function(x) {
          return x.mac;
        }
      },
      {
        name: gettext('IP'),
        fx: function(x) {
          return x.ip;
        }
      }
    ];
    $scope.sort = $scope.sorts[0];
    $scope.paging = {
      page: 1,
      pageSize: 100
    };
    $scope.stripComments = function(value) {
      return !value.room || value.room[0] !== '#';
    };
    $scope.add = function() {
      $scope.paging.page = Math.floor(($scope.devices.length - 1) / $scope.paging.pageSize) + 1;
      $scope.filter = '';
      return $scope.devices.push({
        _isNew: true,
        sophomorixRole: 'classroom-studentcomputer',
        pxeFlag: '1'
      });
    };
    $scope.fields = {
      room: {
        visible: true,
        name: gettext('Room')
      },
      hostname: {
        visible: true,
        name: gettext('Hostname')
      },
      group: {
        visible: true,
        name: gettext('Group')
      },
      mac: {
        visible: true,
        name: gettext('MAC')
      },
      ip: {
        visible: true,
        name: gettext('IP')
      },
      officeKey: {
        visible: false,
        name: gettext('Office Key')
      },
      windowsKey: {
        visible: false,
        name: gettext('Windows Key')
      },
      dhcpOptions: {
        visible: false,
        name: gettext('DHCP-Options')
      },
      sophomorixRole: {
        visible: true,
        name: gettext('Sophomorix-Role')
      },
      lmnReserved10: {
        visible: false,
        name: gettext('LMN-Reserved 10')
      },
      pxeFlag: {
        visible: true,
        name: gettext('PXE')
      },
      lmnReserved12: {
        visible: false,
        name: gettext('LMN-Reserved 12')
      },
      lmnReserved13: {
        visible: false,
        name: gettext('LMN-Reserved 13')
      },
      lmnReserved14: {
        visible: false,
        name: gettext('LMN-Reserved 14')
      },
      sophomorixComment: {
        visible: false,
        name: gettext('Sophomorix-Comment')
      }
    };
    $http.get('/api/lm/devices').then(function(resp) {
      return $scope.devices = resp.data;
    });
    $scope.remove = function(device) {
      return $scope.devices.remove(device);
    };
    $scope.save = function() {
      return $http.post('/api/lm/devices', $scope.devices).then(function() {
        return notify.success(gettext('Saved'));
      });
    };
    $scope.saveAndImport = function() {
      return $scope.save().then(function() {
        return $uibModal.open({
          templateUrl: '/lm_devices:resources/partial/apply.modal.html',
          controller: 'LMDevicesApplyModalController',
          backdrop: 'static'
        });
      });
    };
    $scope.editCSV = function() {
      return lmFileEditor.show('/etc/linuxmuster/sophomorix/default-school/devices.csv').then(function() {
        return $route.reload();
      });
    };
    return $scope.backups = function() {
      return lmFileBackups.show('/etc/linuxmuster/sophomorix/default-school/devices.csv');
    };
  });

}).call(this);

