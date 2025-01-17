// Generated by CoffeeScript 2.5.1
(function() {
  angular.module('lmn.settings', ['core', 'lmn.common']);

}).call(this);

// Generated by CoffeeScript 2.5.1
(function() {
  var indexOf = [].indexOf;

  angular.module('lmn.settings').config(function($routeProvider) {
    return $routeProvider.when('/view/lm/schoolsettings', {
      controller: 'LMSettingsController',
      templateUrl: '/lmn_settings:resources/partial/index.html'
    });
  });

  angular.module('lmn.settings').controller('LMSettingsController', function($scope, $location, $http, $uibModal, messagebox, gettext, notify, pageTitle, core, lmFileBackups, validation) {
    var i, j, len, len1, n, ref, ref1, tag;
    pageTitle.set(gettext('Settings'));
    $scope.trans = {
      remove: gettext('Remove')
    };
    $scope.tabs = ['general', 'listimport', 'quota', 'printing'];
    tag = $location.$$url.split("#")[1];
    if (tag && indexOf.call($scope.tabs, tag) >= 0) {
      $scope.activetab = $scope.tabs.indexOf(tag);
    } else {
      $scope.activetab = 0;
    }
    $scope.logLevels = [
      {
        name: gettext('Minimal'),
        value: 0
      },
      {
        name: gettext('Average'),
        value: 1
      },
      {
        name: gettext('Maximal'),
        value: 2
      }
    ];
    $scope.unit = 'MiB';
    $scope.encodings = ['auto', 'ASCII', 'ISO_8859-1', 'ISO_8859-15', 'WIN-1252', 'UTF8'];
    $scope.customDisplayOptions = [''];
    $scope.customDisplayOptions.push('proxyAddresses');
    ref = [1, 2, 3, 4, 5];
    for (i = 0, len = ref.length; i < len; i++) {
      n = ref[i];
      $scope.customDisplayOptions.push('sophomorixCustom' + n);
    }
    ref1 = [1, 2, 3, 4, 5];
    for (j = 0, len1 = ref1.length; j < len1; j++) {
      n = ref1[j];
      $scope.customDisplayOptions.push('sophomorixCustomMulti' + n);
    }
    $http.get('/api/lm/schoolsettings').then(function(resp) {
      var encoding, file, k, len2, ref2, school, userfile;
      school = 'default-school';
      encoding = {};
      ref2 = ['userfile.students.csv', 'userfile.extrastudents.csv', 'userfile.teachers.csv', 'userfile.extrastudents.csv'];
      //TODO: Remove comments
      //for file in ['userfile.students.csv', 'userfile.teachers.csv', 'userfile.extrastudents.csv', 'classfile.extraclasses.csv', ]
      for (k = 0, len2 = ref2.length; k < len2; k++) {
        file = ref2[k];
        userfile = file.substring(file.indexOf('.') + 1);
        if (resp.data[file]['ENCODING'] === 'auto') {
          console.log('is auto');
          $http.post('/api/lmn/schoolsettings/determine-encoding', {
            path: '/etc/linuxmuster/sophomorix/' + school + '/' + userfile,
            file: file
          }).then(function(response) {
            encoding[response['config']['data']['file']] = response.data;
            return console.log(encoding);
          });
        }
      }
      //console.log(encoding)
      $scope.encoding = encoding;
      return $scope.settings = resp.data;
    });
    $http.get('/api/lm/schoolsettings/latex-templates').then(function(resp) {
      $scope.templates_individual = resp.data[0];
      return $scope.templates_multiple = resp.data[1];
    });
    $http.get('/api/lm/subnets').then(function(resp) {
      return $scope.subnets = resp.data;
    });
    $scope.filterscriptNotEmpty = function() {
      var k, len2, ref2, results, role;
      ref2 = ['students', 'teachers', 'extrastudents'];
      // A filterscript option should not be empty but "---"
      results = [];
      for (k = 0, len2 = ref2.length; k < len2; k++) {
        role = ref2[k];
        if ($scope.settings['userfile.' + role + '.csv']['FILTERSCRIPT'] === "") {
          results.push($scope.settings['userfile.' + role + '.csv']['FILTERSCRIPT'] = "---");
        } else {
          results.push(void 0);
        }
      }
      return results;
    };
    $scope.load_custom_config = function() {
      return $http.get('/api/lm/read_custom_config').then(function(resp) {
        var k, l, len2, len3, ref2, ref3, results, template;
        $scope.custom = resp.data.custom;
        $scope.customMulti = resp.data.customMulti;
        $scope.customDisplay = resp.data.customDisplay;
        $scope.proxyAddresses = resp.data.proxyAddresses;
        $scope.templates = {
          'multiple': '',
          'individual': ''
        };
        $scope.passwordTemplates = resp.data.passwordTemplates;
        ref2 = $scope.templates_individual;
        for (k = 0, len2 = ref2.length; k < len2; k++) {
          template = ref2[k];
          if (template.path === $scope.passwordTemplates.individual) {
            $scope.templates.individual = template;
            break;
          }
        }
        ref3 = $scope.templates_multiple;
        results = [];
        for (l = 0, len3 = ref3.length; l < len3; l++) {
          template = ref3[l];
          if (template.path === $scope.passwordTemplates.multiple) {
            $scope.templates.multiple = template;
            break;
          } else {
            results.push(void 0);
          }
        }
        return results;
      });
    };
    // $http.get('/api/lm/schoolsettings/school-share').then (resp) ->
    //     $scope.schoolShareEnabled = resp.data

    // $scope.setSchoolShare = (enabled) ->
    //     $scope.schoolShareEnabled = enabled
    //     $http.post('/api/lm/schoolsettings/school-share', enabled)
    $scope.removeSubnet = function(subnet) {
      return messagebox.show({
        text: gettext('Are you sure you want to delete permanently this subnet ?'),
        positive: gettext('Delete'),
        negative: gettext('Cancel')
      }).then(function() {
        return $scope.subnets.remove(subnet);
      });
    };
    $scope.addSubnet = function() {
      return $scope.subnets.push({
        'routerIp': '',
        'network': '',
        'beginRange': '',
        'endRange': '',
        'setupFlag': ''
      });
    };
    $scope.save = function() {
      var validPrintserver;
      validPrintserver = validation.isValidDomain($scope.settings.school.PRINTSERVER);
      if (validPrintserver !== true) {
        notify.error(validPrintserver);
        return;
      }
      return $http.post('/api/lm/schoolsettings', $scope.settings).then(function() {
        return notify.success(gettext('Saved'));
      });
    };
    $scope.saveAndCheck = function() {
      var validPrintserver;
      validPrintserver = validation.isValidDomain($scope.settings.school.PRINTSERVER);
      if (validPrintserver !== true) {
        notify.error(validPrintserver);
        return;
      }
      return $http.post('/api/lm/schoolsettings', $scope.settings).then(function() {
        $uibModal.open({
          templateUrl: '/lmn_users:resources/partial/check.modal.html',
          controller: 'LMUsersCheckModalController',
          backdrop: 'static'
        });
        return notify.success(gettext('Saved'));
      });
    };
    $scope.saveApplyQuota = function() {
      $http.post('/api/lm/schoolsettings', $scope.settings).then(function() {
        return notify.success(gettext('Saved'));
      });
      return $uibModal.open({
        templateUrl: '/lmn_quotas:resources/partial/apply.modal.html',
        controller: 'LMQuotasApplyModalController',
        backdrop: 'static'
      });
    };
    $scope.saveApplySubnets = function() {
      return $http.post('/api/lm/subnets', $scope.subnets).then(function() {
        return notify.success(gettext('Saved'));
      });
    };
    $scope.backups = function() {
      var school;
      school = "default-school";
      return lmFileBackups.show('/etc/linuxmuster/sophomorix/' + school + '/school.conf');
    };
    return $scope.saveCustom = function() {
      var config;
      config = {
        'custom': $scope.custom,
        'customMulti': $scope.customMulti,
        'customDisplay': $scope.customDisplay,
        'proxyAddresses': $scope.proxyAddresses,
        'passwordTemplates': {
          'multiple': $scope.templates.multiple.path,
          'individual': $scope.templates.individual.path
        }
      };
      return $http.post('/api/lm/save_custom_config', {
        config: config
      }).then(function() {
        notify.success(gettext('Saved'));
        return messagebox.show({
          text: gettext("In order for changes to take effect, it's  necessary to restart the Webui. Restart now ?"),
          positive: gettext('Restart'),
          negative: gettext('Later')
        }).then(function() {
          return core.forceRestart();
        });
      });
    };
  });

}).call(this);

'use strict';

angular.module('lmn.settings').controller('LMglobalSettingsController', function ($scope, $http, $sce, notify, pageTitle, identity, messagebox, config, core, locale, gettext) {
   pageTitle.set(gettext('Global Settings'));

   config.load();
   $scope.config = config;

   $scope.newClientCertificate = {
      c: 'NA',
      st: 'NA',
      o: '',
      cn: ''
   };

   identity.promise.then(function () {
      // $scope.newClientCertificate.o = identity.machine.name;
      // passwd.list().then((data) => {
      //    $scope.availableUsers = data;
      //    $scope.$watch('newClientCertificate.user', () => $scope.newClientCertificate.cn = `${identity.user}@${identity.machine.hostname}`);
      //    $scope.newClientCertificate.user = 'root';
      // });
      $http.get('/api/core/languages').then(function (rq) {
         return $scope.languages = rq.data;
      });
   });

   $scope.$watch('config.data.language', function () {
      if (config.data) {
         locale.setLanguage(config.data.language);
      }
   });

   $scope.save = function () {
      return config.save().then(function (data) {
         return notify.success(gettext('Saved'));
      }).catch(function () {
         return notify.error(gettext('Could not save config'));
      });
   };

   $scope.createNewServerCertificate = function () {
      return messagebox.show({
         title: gettext('Self-signed certificate'),
         text: gettext('Generating a new certificate will void all existing client authentication certificates!'),
         positive: gettext('Generate'),
         negative: gettext('Cancel')
      }).then(function () {
         config.data.ssl.client_auth.force = false;
         notify.info(gettext('Generating certificate'), gettext('Please wait'));
         return $http.get('/api/settings/generate-server-certificate').success(function (data) {
            notify.success(gettext('Certificate successfully generated'));
            config.data.ssl.enable = true;
            config.data.ssl.certificate = data.path;
            config.data.ssl.client_auth.certificates = [];
            $scope.save();
         }).error(function (err) {
            return notify.error(gettext('Certificate generation failed'), err.message);
         });
      });
   };

   $scope.restart = function () {
      return core.restart();
   };
});


'use strict';

angular.module('lmn.settings').config(function ($routeProvider) {
           return $routeProvider.when('/view/lm/globalsettings', {
                      templateUrl: '/lmn_settings:resources/partial/globalSettings.html',
                      controller: 'LMglobalSettingsController'
           });
});


