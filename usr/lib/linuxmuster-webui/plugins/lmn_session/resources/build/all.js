// Generated by CoffeeScript 2.3.1
(function() {
  angular.module('lmn.session', ['core', 'lm.common']);

}).call(this);

// Generated by CoffeeScript 2.3.1
(function() {
  angular.module('lmn.session').config(function($routeProvider) {
    return $routeProvider.when('/view/lmn/session', {
      controller: 'LMNSessionController',
      templateUrl: '/lmn_session:resources/partial/session.html'
    });
  });

  angular.module('lmn.session').controller('LMNSessionController', function($scope, $http, $location, $route, $uibModal, gettext, notify, messagebox, pageTitle, lmFileEditor, lmEncodingMap) {
    var typeIsArray;
    pageTitle.set(gettext('Session'));
    $scope.currentSession = {
      name: "",
      comment: ""
    };
    $scope.sorts = [
      {
        name: gettext('Login name'),
        fx: function(x) {
          return x.sAMAccountName;
        }
      },
      {
        name: gettext('Lastname'),
        fx: function(x) {
          return x.sn;
        }
      },
      {
        name: gettext('Firstname'),
        fx: function(x) {
          return x.givenName;
        }
      },
      {
        name: gettext('Email'),
        fx: function(x) {
          return x.mail;
        }
      }
    ];
    $scope.fields = {
      sAMAccountName: {
        visible: true,
        name: gettext('Userdata')
      },
      transfer: {
        visible: true,
        name: gettext('Transfer')
      },
      examModeSupervisor: {
        visible: true,
        name: gettext('Exam-Supervisor')
      },
      sophomorixRole: {
        visible: false,
        name: gettext('sophomorixRole')
      },
      exammode: {
        visible: true,
        icon: "fa fa-graduation-cap",
        title: gettext('Exam-Mode'),
        checkboxAll: false,
        examBox: true,
        checkboxStatus: false
      },
      wifiaccess: {
        visible: true,
        icon: "fa fa-wifi",
        title: gettext('Wifi-Access'),
        checkboxAll: true,
        checkboxStatus: false
      },
      internetaccess: {
        visible: true,
        icon: "fa fa-globe",
        title: gettext('Internet-Access'),
        checkboxAll: true,
        checkboxStatus: false
      },
      intranetaccess: {
        visible: false,
        icon: "fa fa-server",
        title: gettext('Intranet Access'),
        checkboxAll: true
      },
      webfilter: {
        visible: false,
        icon: "fa fa-filter",
        title: gettext('Webfilter'),
        checkboxAll: true,
        checkboxStatus: false
      },
      printing: {
        visible: true,
        icon: "fa fa-print",
        title: gettext('Printing'),
        checkboxAll: true,
        checkboxStatus: false
      }
    };
    $scope.checkboxModel = {
      value1: false,
      value2: true
    };
    $scope.visible = {
      participanttable: 'none',
      sessiontable: 'none',
      sessionname: 'none',
      mainpage: 'show'
    };
    $scope.info = {
      message: ''
    };
    $scope._ = {
      addParticipant: null,
      addClass: null
    };
    $scope.changeClass = function(item) {
      if (document.getElementById(item).className.match(/(?:^|\s)changed(?!\S)/)) {
        return document.getElementById(item).className = document.getElementById(item).className.replace(/(?:^|\s)changed(?!\S)/g, '');
      } else {
        return document.getElementById(item).className += " changed";
      }
    };
    $scope.resetClass = function() {
      var result;
      result = document.getElementsByClassName("changed");
      while (result.length) {
        result[0].className = result[0].className.replace(/(?:^|\s)changed(?!\S)/g, '');
      }
    };
    $scope.selectAll = function(item) {
      var managementgroup;
      managementgroup = 'group_' + item;
      if (item === 'exammode') {
        managementgroup = 'exammode_boolean';
      }
      //console.log item
      //console.log $scope.participants
      if ($scope.fields[item].checkboxStatus === true) {
        angular.forEach($scope.participants, function(participant, id) {
          if (participant[managementgroup] === true) {
            participant[managementgroup] = false;
            return $scope.changeClass(id + '.' + item);
          }
        });
      } else {
        angular.forEach($scope.participants, function(participant, id) {
          if (participant[managementgroup] === false) {
            participant[managementgroup] = true;
            return $scope.changeClass(id + '.' + item);
          }
        });
      }
    };
    $scope.killSession = function(username, session, comment) {
      if (session === '') {
        messagebox.show({
          title: gettext('No Session selected'),
          text: gettext('You have to select a session first.'),
          positive: 'OK'
        });
        return;
      }
      return messagebox.show({
        text: `Delete '${comment}'?`,
        positive: 'Delete',
        negative: 'Cancel'
      }).then(function() {
        return $http.post('/api/lmn/session/sessions', {
          action: 'kill-sessions',
          session: session
        }).then(function(resp) {
          //notify.success gettext('Session Deleted')
          $scope.visible.sessionname = 'none';
          $scope.visible.participanttable = 'none';
          $scope.visible.mainpage = 'show';
          $scope.info.message = '';
          $scope.getSessions($scope.identity.user);
          $scope.currentSession.name = '';
          return notify.success(gettext(resp.data));
        });
      });
    };
    $scope.newSession = function(username) {
      return messagebox.prompt(gettext('Session Name'), '---').then(function(msg) {
        if (!msg.value) {
          return;
        }
        return $http.post('/api/lmn/session/sessions', {
          action: 'new-session',
          username: username,
          comment: msg.value
        }).then(function(resp) {
          var sessions;
          $scope.new - (sessions = resp.data);
          $scope.getSessions($scope.identity.user);
          notify.success(gettext('Session Created'));
          // Reset alle messages and information to show session table
          $scope.info.message = '';
          $scope.currentSession.name = '';
          $scope.currentSession.comment = '';
          return $scope.visible.participanttable = 'none';
        });
      });
    };
    $scope.getSessions = function(username) {
      return $http.post('/api/lmn/session/sessions', {
        action: 'get-sessions',
        username: username
      }).then(function(resp) {
        if (resp.data[0]['SESSIONCOUNT'] === 0) {
          $scope.sessions = resp.data;
          $scope.info.message = gettext('There are no sessions yet. Create a session using the "Edit Sessions" button at the top!');
          return console.log('no sessions');
        } else {
          console.log('sessions found');
          $scope.visible.sessiontable = 'show';
          return $scope.sessions = resp.data;
        }
      });
    };
    $scope.renameSession = function(username, session, comment) {
      if (session === '') {
        messagebox.show({
          title: gettext('No Session selected'),
          text: gettext('You have to select a session first.'),
          positive: 'OK'
        });
        return;
      }
      return messagebox.prompt(gettext('Session Name'), comment).then(function(msg) {
        if (!msg.value) {
          return;
        }
        return $http.post('/api/lmn/session/sessions', {
          action: 'rename-session',
          session: session,
          comment: msg.value
        }).then(function(resp) {
          $scope.getSessions($scope.identity.user);
          return notify.success(gettext('Session Renamed'));
        });
      });
    };
    $scope.getParticipants = function(username, session) {
      $scope.visible.sessiontable = 'none';
      $scope.resetClass();
      // Reset select all checkboxes when loading participants
      angular.forEach($scope.fields, function(field) {
        return field.checkboxStatus = false;
      });
      return $http.post('/api/lmn/session/sessions', {
        action: 'get-participants',
        username: username,
        session: session
      }).then(function(resp) {
        $scope.visible.sessionname = 'show';
        $scope.visible.mainpage = 'none';
        $scope.participants = resp.data;
        // console.log($scope.participants)
        if ($scope.participants[0] != null) {
          $scope.visible.participanttable = 'none';
          return $scope.info.message = gettext('This session appears to be empty. Start adding users by using the top search bar!');
        } else {
          $scope.info.message = '';
          return $scope.visible.participanttable = 'show';
        }
      });
    };
    $scope.findUsers = function(q) {
      return $http.get(`/api/lmn/session/user-search?q=${q}`).then(function(resp) {
        $scope.users = resp.data;
        //console.log resp.data
        return resp.data;
      });
    };
    $scope.findSchoolClasses = function(q) {
      return $http.get(`/api/lmn/session/schoolClass-search?q=${q}`).then(function(resp) {
        $scope.class = resp.data;
        //console.log resp.data
        return resp.data;
      });
    };
    $scope.$watch('_.addParticipant', function() {
      // console.log $scope._.addParticipant
      if ($scope._.addParticipant) {
        if ($scope.participants[0] != null) {
          delete $scope.participants['0'];
        }
        $scope.info.message = '';
        $scope.visible.participanttable = 'show';
        //console.log $scope._.addParticipant
        if ($scope._.addParticipant.sophomorixRole === 'student') {
          // Add Managementgroups list if missing. This happens when all managementgroup attributes are false, causing the json tree to skip this key
          if ($scope._.addParticipant.MANAGEMENTGROUPS == null) {
            $scope._.addParticipant.MANAGEMENTGROUPS = [];
          }
          $scope.participants[$scope._.addParticipant.sAMAccountName] = angular.copy({
            "givenName": $scope._.addParticipant.givenName,
            "sn": $scope._.addParticipant.sn,
            "sophomorixExamMode": $scope._.addParticipant.sophomorixExamMode,
            "group_webfilter": $scope._.addParticipant.MANAGEMENTGROUPS.webfilter,
            "group_intranetaccess": $scope._.addParticipant.MANAGEMENTGROUPS.intranet,
            "group_printing": $scope._.addParticipant.MANAGEMENTGROUPS.printing,
            "sophomorixStatus": "U",
            "sophomorixRole": $scope._.addParticipant.sophomorixRole,
            "group_internetaccess": $scope._.addParticipant.MANAGEMENTGROUPS.internet,
            "sophomorixAdminClass": $scope._.addParticipant.sophomorixAdminClass,
            "user_existing": true,
            "group_wifiaccess": $scope._.addParticipant.MANAGEMENTGROUPS.wifi
          });
        }
        return $scope._.addParticipant = null;
      }
    });
    // TODO Figure out how to call the existing watch addParticipant function
    $scope.addParticipant = function(participant) {
      if (participant) {
        if ($scope.participants[0] != null) {
          delete $scope.participants['0'];
        }
        $scope.info.message = '';
        $scope.visible.participanttable = 'show';
        // console.log participant
        // Only add Students
        if (participant.sophomorixRole === 'student') {
          // Add Managementgroups list if missing. This happens when all managementgroup attributes are false, causing the json tree to skip this key
          if (participant.MANAGEMENTGROUPS == null) {
            participant.MANAGEMENTGROUPS = [];
          }
          // console.log ($scope.participants)
          $scope.participants[participant.sAMAccountName] = angular.copy({
            "givenName": participant.givenName,
            "sn": participant.sn,
            "sophomorixExamMode": participant.sophomorixExamMode,
            "group_webfilter": participant.MANAGEMENTGROUPS.webfilter,
            "group_intranetaccess": participant.MANAGEMENTGROUPS.intranet,
            "group_printing": participant.MANAGEMENTGROUPS.printing,
            "sophomorixStatus": "U",
            "sophomorixRole": participant.sophomorixRole,
            "group_internetaccess": participant.MANAGEMENTGROUPS.internet,
            "sophomorixAdminClass": participant.sophomorixAdminClass,
            "user_existing": true,
            "group_wifiaccess": participant.MANAGEMENTGROUPS.wifi
          });
        }
        return participant = null;
      }
    };
    $scope.$watch('_.addSchoolClass', function() {
      var member, members, ref, schoolClass;
      if ($scope._.addSchoolClass) {
        members = $scope._.addSchoolClass.members;
        ref = $scope._.addSchoolClass.members;
        for (schoolClass in ref) {
          member = ref[schoolClass];
          $scope.addParticipant(member);
        }
        return $scope._.addSchoolClass = null;
      }
    });
    $scope.removeParticipant = function(participant) {
      return delete $scope.participants[participant];
    };
    $scope.changeExamSupervisor = function(participant, supervisor) {
      return $http.post('/api/lmn/session/sessions', {
        action: 'change-exam-supervisor',
        supervisor: supervisor,
        participant: participant
      }).then(function(resp) {});
    };
    $scope.saveApply = function(username, participants, session) {
      return $http.post('/api/lmn/session/sessions', {
        action: 'save-session',
        username: username,
        participants: participants,
        session: session
      }).then(function(resp) {
        $scope.output = resp.data;
        $scope.getParticipants(username, session);
        return notify.success(gettext($scope.output));
      });
    };
    $scope.showInitialPassword = function(user) {
      return $http.post('/api/lm/users/password', {
        users: user,
        action: 'get'
      }).then(function(resp) {
        return messagebox.show({
          title: gettext('Initial password'),
          text: resp.data,
          positive: 'OK'
        });
      });
    };
    $scope.setInitialPassword = function(user) {
      return $http.post('/api/lm/users/password', {
        users: user,
        action: 'set-initial'
      }).then(function(resp) {
        return notify.success(gettext('Initial password set'));
      });
    };
    $scope.setRandomPassword = function(user) {
      return $http.post('/api/lm/users/password', {
        users: user,
        action: 'set-random'
      }).then(function(resp) {
        return notify.success(gettext('Random password set'));
      });
    };
    $scope.setCustomPassword = function(user) {
      return $uibModal.open({
        templateUrl: '/lm_users:resources/partial/customPassword.modal.html',
        controller: 'LMNUsersCustomPasswordController',
        size: 'mg',
        resolve: {
          users: function() {
            return user;
          }
        }
      });
    };
    $scope.userInfo = function(user) {
      return $uibModal.open({
        templateUrl: '/lm_users:resources/partial/userDetails.modal.html',
        controller: 'LMNUserDetailsController',
        size: 'lg',
        resolve: {
          id: function() {
            return user;
          },
          role: function() {
            return 'students';
          }
        }
      });
    };
    typeIsArray = Array.isArray || function(value) {
      return {}.toString.call(value) === '[object Array]';
    };
    $scope.shareTrans = function(command, senders, receivers) {
      var key, participantsArray, value;
      // if share with session we get the whole session as a json object.
      // The function on the other hand waits for an array so we extract
      // the username into an array
      if (!typeIsArray(receivers)) {
        participantsArray = [];
        for (key in receivers) {
          value = receivers[key];
          participantsArray.push(key);
        }
        receivers = participantsArray;
      }
      return messagebox.show({
        title: gettext('Share Data'),
        text: gettext(`Share EVERYTHING in transfer folder to user(s) '${receivers}'?`),
        positive: gettext('Proceed'),
        negative: gettext('Cancel')
      }).then(function() {
        return $http.post('/api/lmn/session/trans', {
          command: command,
          senders: senders,
          receivers: receivers
        }).then(function(resp) {
          return notify.success(gettext('success'));
        });
      });
    };
    $scope.collectTrans = function(command, senders, receivers) {
      var key, participantsArray, transTitle, value;
      if (!typeIsArray(senders)) {
        participantsArray = [];
        for (key in senders) {
          value = senders[key];
          participantsArray.push(key);
        }
        senders = participantsArray;
      }
      transTitle = 'transfer';
      if (command === 'copy') {
        messagebox.show({
          title: gettext('Copy Data'),
          text: gettext(`Copy EVERYTHING from transfer folder of these user(s) '${senders}'? All files are still available in users transfer directory!`),
          positive: gettext('Proceed'),
          negative: gettext('Cancel')
        }).then(function() {
          return $http.post('/api/lmn/session/trans', {
            command: command,
            senders: senders,
            receivers: receivers
          }).then(function(resp) {
            return notify.success(gettext('success'));
          });
        });
      }
      if (command === 'move') {
        return messagebox.show({
          title: gettext('Collect Data'),
          text: gettext(`Collevt EVERYTHING from transfer folder of these user(s) '${senders}'? No files will be available by the users!`),
          positive: gettext('Proceed'),
          negative: gettext('Cancel')
        }).then(function() {
          return $http.post('/api/lmn/session/trans', {
            command: command,
            senders: senders,
            receivers: receivers
          }).then(function(resp) {
            return notify.success(gettext('success'));
          });
        });
      }
    };
    $scope.notImplemented = function(user) {
      return messagebox.show({
        title: gettext('Not implemented'),
        positive: 'OK'
      });
    };
    return $scope.$watch('identity.user', function() {
      console.log($scope.identity.user);
      if ($scope.identity.user === void 0) {
        return;
      }
      if ($scope.identity.user === null) {
        return;
      }
      if ($scope.identity.user === 'root') {
        return;
      }
      $scope.getSessions($scope.identity.user);
    });
  });

}).call(this);

