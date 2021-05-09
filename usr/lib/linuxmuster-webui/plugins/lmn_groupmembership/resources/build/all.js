// Generated by CoffeeScript 2.5.1
(function() {
  angular.module('lmn.groupmembership', ['core', 'lmn.common']);

}).call(this);

// Generated by CoffeeScript 2.5.1
(function() {
  angular.module('lmn.groupmembership').config(function($routeProvider) {
    return $routeProvider.when('/view/lmn/groupmembership', {
      controller: 'LMNGroupMembershipController',
      templateUrl: '/lmn_groupmembership:resources/partial/index.html'
    });
  });

  angular.module('lmn.groupmembership').controller('LMNGroupMembershipController', function($rootScope, $scope, $http, identity, $uibModal, gettext, notify, pageTitle, messagebox, validation) {
    pageTitle.set(gettext('Enrolle'));
    $scope.types = {
      schoolclass: {
        typename: gettext('Schoolclass'),
        name: gettext('Groupname'),
        checkbox: true,
        type: 'schoolclass'
      },
      printergroup: {
        typename: gettext('Printer'),
        checkbox: true,
        type: 'printergroup'
      },
      project: {
        typename: gettext('Projects'),
        checkbox: true,
        type: 'project'
      }
    };
    $scope.sorts = [
      {
        name: gettext('Groupname'),
        fx: function(x) {
          return x.groupname;
        }
      },
      {
        name: gettext('Membership'),
        fx: function(x) {
          return x.membership;
        }
      }
    ];
    $scope.sort = $scope.sorts[0];
    $scope.sortReverse = false;
    $scope.paging = {
      page: 1,
      pageSize: 20
    };
    $scope.isActive = function(group) {
      if (group.type === 'printergroup') {
        if ($scope.types.printergroup.checkbox === true) {
          return true;
        }
      }
      if (group.type === 'schoolclass') {
        if ($scope.types.schoolclass.checkbox === true) {
          return true;
        }
      }
      if (group.type === 'project') {
        if ($scope.types.schoolclass.checkbox === true) {
          return true;
        }
      }
      return false;
    };
    $scope.checkInverse = function(sort, currentSort) {
      if (sort === currentSort) {
        return $scope.sortReverse = !$scope.sortReverse;
      } else {
        return $scope.sortReverse = false;
      }
    };
    $scope.changeState = false;
    $scope.setMembership = function(group) {
      var action, type;
      $scope.changeState = true;
      action = group.membership ? 'removeadmins' : 'addadmins';
      if (group.typename === 'Class') {
        type = 'class';
      } else if (group.typename === 'Printer') {
        type = 'group';
        action = group.membership ? 'removemembers' : 'addmembers';
      } else {
        type = 'project';
      }
      return $http.post('/api/lmn/groupmembership/membership', {
        action: action,
        entity: $scope.identity.user,
        groupname: group.groupname,
        type: type
      }).then(function(resp) {
        if (resp['data'][0] === 'ERROR') {
          notify.error(resp['data'][1]);
        }
        if (resp['data'][0] === 'LOG') {
          notify.success(gettext(resp['data'][1]));
          group.membership = !group.membership;
          $scope.changeState = false;
          $rootScope.identity = identity;
          return identity.init().then(function() {
            return console.log("Identity renewed !");
          });
        }
      });
    };
    $scope.filterGroupType = function(val) {
      return function(dict) {
        return dict['type'] === val;
      };
    };
    $scope.getGroups = function(username) {
      return $http.post('/api/lmn/groupmembership', {
        action: 'list-groups',
        username: username,
        profil: $scope.identity.profile
      }).then(function(resp) {
        $scope.groups = resp.data[0];
        $scope.identity.isAdmin = resp.data[1];
        $scope.classes = $scope.groups.filter($scope.filterGroupType('schoolclass'));
        $scope.projects = $scope.groups.filter($scope.filterGroupType('project'));
        return $scope.printers = $scope.groups.filter($scope.filterGroupType('printergroup'));
      });
    };
    $scope.createProject = function() {
      return messagebox.prompt(gettext('Project Name'), '').then(function(msg) {
        var test;
        if (!msg.value) {
          return;
        }
        test = validation.isValidProjectName(msg.value);
        if (test !== true) {
          notify.error(gettext(test));
          return;
        }
        return $http.post('/api/lmn/groupmembership', {
          action: 'create-project',
          username: $scope.identity.user,
          project: msg.value,
          profil: $scope.identity.profile
        }).then(function(resp) {
          if (resp.data[0] === 'ERROR') {
            return notify.error(gettext(resp.data[1]));
          } else {
            if (resp.data[0] === 'LOG') {
              notify.success(gettext('Project Created'));
              return identity.init().then(function() {
                console.log("Identity renewed !");
                return $scope.getGroups($scope.identity.user);
              });
            } else {
              return notify.info(gettext('Something unusual happened'));
            }
          }
        });
      });
    };
    $scope.showGroupDetails = function(index, groupType, groupName) {
      return $uibModal.open({
        templateUrl: '/lmn_groupmembership:resources/partial/groupDetails.modal.html',
        controller: 'LMNGroupDetailsController',
        size: 'lg',
        resolve: {
          groupType: function() {
            return groupType;
          },
          groupName: function() {
            return groupName;
          }
        }
      }).result.then(function(result) {
        if (result.response === 'refresh') {
          return $scope.getGroups($scope.identity.user);
        }
      });
    };
    $scope.projectIsJoinable = function(project) {
      return project['joinable'] === 'TRUE' || project.admin || $scope.identity.isAdmin || $scope.identity.profile.memberOf.indexOf(project['DN']) > -1;
    };
    $scope.resetAll = function(type) {
      var warning;
      warning = gettext('Are you sure to reset all admin memberships for this? This is actually only necessary to start a new empty school year. This cannot be undone!');
      return messagebox.show({
        text: warning,
        positive: 'Delete',
        negative: 'Cancel'
      }).then(function() {
        var _class, all_groups, i, j, len, len1, msg, project, ref, ref1;
        msg = messagebox.show({
          progress: true
        });
        all_groups = '';
        if (type === 'class') {
          ref = $scope.classes;
          for (i = 0, len = ref.length; i < len; i++) {
            _class = ref[i];
            all_groups += _class.groupname + ',';
          }
        }
        if (type === 'project') {
          ref1 = $scope.projects;
          for (j = 0, len1 = ref1.length; j < len1; j++) {
            project = ref1[j];
            all_groups += project.groupname + ',';
          }
        }
        return $http.post('/api/lmn/groupmembership/reset', {
          type: type,
          all_groups: all_groups
        }).then(function(resp) {
          return notify.success(gettext('Admin membership reset'));
        }).finally(function() {
          return msg.close();
        });
      });
    };
    return $scope.$watch('identity.user', function() {
      if ($scope.identity.user === void 0) {
        return;
      }
      if ($scope.identity.user === null) {
        return;
      }
      if ($scope.identity.user === 'root') {
        return;
      }
      $scope.getGroups($scope.identity.user);
    });
  });

  angular.module('lmn.groupmembership').controller('LMNGroupDetailsController', function($scope, $route, $uibModal, $uibModalInstance, $http, gettext, notify, messagebox, pageTitle, groupType, groupName) {
    $scope.showAdminDetails = true;
    $scope.showMemberDetails = true;
    $scope.changeState = false;
    $scope.editGroup = false;
    $scope.hidetext = gettext("Hide");
    $scope.showtext = gettext("Show");
    $scope.changeJoin = function() {
      var option;
      $scope.changeState = true;
      option = $scope.joinable ? '--join' : '--nojoin';
      return $http.post('/api/lmn/changeGroup', {
        option: option,
        group: $scope.groupName,
        type: $scope.type
      }).then(function(resp) {
        if (resp['data'][0] === 'ERROR') {
          notify.error(resp['data'][1]);
        }
        if (resp['data'][0] === 'LOG') {
          notify.success(gettext(resp['data'][1]));
        }
        return $scope.changeState = false;
      });
    };
    $scope.changeHide = function() {
      var option;
      $scope.changeState = true;
      option = $scope.hidden ? '--hide' : '--nohide';
      return $http.post('/api/lmn/changeGroup', {
        option: option,
        group: $scope.groupName,
        type: $scope.type
      }).then(function(resp) {
        if (resp['data'][0] === 'ERROR') {
          notify.error(resp['data'][1]);
        }
        if (resp['data'][0] === 'LOG') {
          notify.success(gettext(resp['data'][1]));
        }
        return $scope.changeState = false;
      });
    };
    $scope.killProject = function(project) {
      return messagebox.show({
        text: `Do you really want to delete '${project}'? This can't be undone!`,
        positive: 'Delete',
        negative: 'Cancel'
      }).then(function() {
        var msg;
        msg = messagebox.show({
          progress: true
        });
        return $http.post('/api/lmn/groupmembership', {
          action: 'kill-project',
          username: $scope.identity.user,
          project: project,
          profil: $scope.identity.profile
        }).then(function(resp) {
          if (resp['data'][0] === 'ERROR') {
            notify.error(resp['data'][1]);
          }
          if (resp['data'][0] === 'LOG') {
            notify.success(gettext(resp['data'][1]));
            return $uibModalInstance.close({
              response: 'refresh'
            });
          }
        }).finally(function() {
          return msg.close();
        });
      });
    };
    $scope.text = {
      'addAsAdmin': gettext('Move to admin group'),
      'removeFromAdmin': gettext('Remove from admin group'),
      'remove': gettext('Remove')
    };
    $scope.formatDate = function(date) {
      var day, hour, min, month, sec, year;
      if (date === "19700101000000.0Z") {
        return $scope.nevertext;
      } else if (date === void 0) {
        return "undefined";
      } else {
        // Sophomorix date format is yyyyMMddhhmmss.0Z
        year = date.slice(0, 4);
        month = +date.slice(4, 6) - 1; // Month start at 0
        day = date.slice(6, 8);
        hour = date.slice(8, 10);
        min = date.slice(10, 12);
        sec = date.slice(12, 14);
        return new Date(year, month, day, hour, min, sec);
      }
    };
    $scope.getGroupDetails = function(group) {
      groupType = group[0];
      groupName = group[1];
      return $http.post('/api/lmn/groupmembership/details', {
        action: 'get-specified',
        groupType: groupType,
        groupName: groupName
      }).then(function(resp) {
        var admin, i, len, member, name, ref, ref1;
        $scope.groupName = groupName;
        $scope.groupDetails = resp.data['GROUP'][groupName];
        $scope.adminList = resp.data['GROUP'][groupName]['sophomorixAdmins'];
        $scope.groupmemberlist = resp.data['GROUP'][groupName]['sophomorixMemberGroups'];
        $scope.groupadminlist = resp.data['GROUP'][groupName]['sophomorixAdminGroups'];
        $scope.typeMap = {
          'adminclass': 'class',
          'project': 'project',
          'printer': 'group'
        };
        $scope.type = $scope.typeMap[$scope.groupDetails['sophomorixType']];
        $scope.members = [];
        ref = resp.data['MEMBERS'][groupName];
        for (name in ref) {
          member = ref[name];
          if (member.sn !== "null") { // group member 
            $scope.members.push({
              'sn': member.sn,
              'givenName': member.givenName,
              'login': member.sAMAccountName,
              'sophomorixAdminClass': member.sophomorixAdminClass
            });
          }
        }
        $scope.admins = [];
        ref1 = $scope.adminList;
        for (i = 0, len = ref1.length; i < len; i++) {
          admin = ref1[i];
          member = resp.data['MEMBERS'][groupName][admin];
          $scope.admins.push({
            'sn': member.sn,
            'givenName': member.givenName,
            'sophomorixAdminClass': member.sophomorixAdminClass,
            'login': member.sAMAccountName
          });
        }
        $scope.joinable = resp.data['GROUP'][groupName]['sophomorixJoinable'] === 'TRUE';
        $scope.hidden = resp.data['GROUP'][groupName]['sophomorixHidden'] === 'TRUE';
        // Admin or admin of the project can edit members of a project
        // Only admins can change hide and join option for a class
        if ($scope.identity.isAdmin) {
          $scope.editGroup = true;
        } else if ((groupType === 'project') && ($scope.adminList.indexOf($scope.identity.user) >= 0)) {
          $scope.editGroup = true;
        } else if ((groupType === 'project') && ($scope.groupadminlist.indexOf($scope.identity.profile.sophomorixAdminClass) >= 0)) {
          $scope.editGroup = true;
        }
        // List will not be updated later, avoir using it
        return $scope.adminList = [];
      });
    };
    $scope.filterLogin = function(membersArray, login) {
      return membersArray.filter(function(u) {
        return u.login === login;
      }).length === 0;
    };
    $scope.addMember = function(user) {
      var entity, i, len, u;
      entity = '';
      if (Array.isArray(user)) {
        for (i = 0, len = user.length; i < len; i++) {
          u = user[i];
          if ($scope.filterLogin($scope.members, user.login)) {
            entity += u.login + ",";
          }
        }
      } else {
        if ($scope.filterLogin($scope.members, user.login)) {
          entity = user.login;
        }
      }
      if (!entity) {
        return;
      }
      $scope.changeState = true;
      return $http.post('/api/lmn/groupmembership/membership', {
        action: 'addmembers',
        entity: entity,
        groupname: groupName,
        type: $scope.type
      }).then(function(resp) {
        if (resp['data'][0] === 'ERROR') {
          notify.error(resp['data'][1]);
        }
        if (resp['data'][0] === 'LOG') {
          notify.success(gettext(resp['data'][1]));
          if (Array.isArray(user)) {
            $scope.members = $scope.members.concat(user.filter(function(u) {
              return $scope.members.indexOf(u) < 0;
            }));
          } else {
            $scope.members.push(user);
          }
        }
        return $scope.changeState = false;
      });
    };
    $scope.removeMember = function(user) {
      $scope.changeState = true;
      return $http.post('/api/lmn/groupmembership/membership', {
        action: 'removemembers',
        entity: user.login,
        groupname: groupName,
        type: $scope.type
      }).then(function(resp) {
        var position;
        if (resp['data'][0] === 'ERROR') {
          notify.error(resp['data'][1]);
        }
        if (resp['data'][0] === 'LOG') {
          notify.success(gettext(resp['data'][1]));
          position = $scope.members.indexOf(user);
          $scope.members.splice(position, 1);
        }
        return $scope.changeState = false;
      });
    };
    $scope.addAdmin = function(user) {
      var entity, i, len, u;
      entity = '';
      if (Array.isArray(user)) {
        for (i = 0, len = user.length; i < len; i++) {
          u = user[i];
          if ($scope.filterLogin($scope.admins, user.login)) {
            entity += u.login + ",";
          }
        }
      } else {
        if ($scope.filterLogin($scope.admins, user.login)) {
          entity = user.login;
        }
      }
      if (!entity) {
        return;
      }
      $scope.changeState = true;
      return $http.post('/api/lmn/groupmembership/membership', {
        action: 'addadmins',
        entity: entity,
        groupname: groupName,
        type: $scope.type
      }).then(function(resp) {
        if (resp['data'][0] === 'ERROR') {
          notify.error(resp['data'][1]);
        }
        if (resp['data'][0] === 'LOG') {
          notify.success(gettext(resp['data'][1]));
          if (Array.isArray(user)) {
            $scope.admins = $scope.admins.concat(user.filter(function(u) {
              return $scope.admins.indexOf(u) < 0;
            }));
          } else {
            $scope.admins.push(user);
          }
        }
        return $scope.changeState = false;
      });
    };
    $scope.removeAdmin = function(user) {
      $scope.changeState = true;
      return $http.post('/api/lmn/groupmembership/membership', {
        action: 'removeadmins',
        entity: user.login,
        groupname: groupName,
        type: $scope.type
      }).then(function(resp) {
        var position;
        if (resp['data'][0] === 'ERROR') {
          notify.error(resp['data'][1]);
        }
        if (resp['data'][0] === 'LOG') {
          notify.success(gettext(resp['data'][1]));
          position = $scope.admins.indexOf(user);
          $scope.admins.splice(position, 1);
        }
        return $scope.changeState = false;
      });
    };
    $scope.addMemberGroup = function(group) {
      var entity, g, i, len;
      entity = '';
      if (Array.isArray(group)) {
        for (i = 0, len = group.length; i < len; i++) {
          g = group[i];
          if ($scope.groupmemberlist.indexOf(g) < 0) {
            entity += g + ",";
          }
        }
      } else {
        if ($scope.groupmemberlist.indexOf(group) < 0) {
          entity = group;
        }
      }
      if (!entity) {
        return;
      }
      $scope.changeState = true;
      return $http.post('/api/lmn/groupmembership/membership', {
        action: 'addmembergroups',
        entity: entity,
        groupname: groupName,
        type: $scope.type
      }).then(function(resp) {
        if (resp['data'][0] === 'ERROR') {
          notify.error(resp['data'][1]);
        }
        if (resp['data'][0] === 'LOG') {
          notify.success(gettext(resp['data'][1]));
          if (Array.isArray(group)) {
            $scope.groupmemberlist = $scope.groupmemberlist.concat(group.filter(function(g) {
              return $scope.groupmemberlist.indexOf(g) < 0;
            }));
          } else {
            $scope.groupmemberlist.push(group);
          }
        }
        return $scope.changeState = false;
      });
    };
    $scope.removeMemberGroup = function(group) {
      $scope.changeState = true;
      return $http.post('/api/lmn/groupmembership/membership', {
        action: 'removemembergroups',
        entity: group,
        groupname: groupName,
        type: $scope.type
      }).then(function(resp) {
        var position;
        if (resp['data'][0] === 'ERROR') {
          notify.error(resp['data'][1]);
        }
        if (resp['data'][0] === 'LOG') {
          notify.success(gettext(resp['data'][1]));
          position = $scope.groupmemberlist.indexOf(group);
          $scope.groupmemberlist.splice(position, 1);
        }
        return $scope.changeState = false;
      });
    };
    $scope.addAdminGroup = function(group) {
      var entity, g, i, len;
      entity = '';
      if (Array.isArray(group)) {
        for (i = 0, len = group.length; i < len; i++) {
          g = group[i];
          if ($scope.groupadminlist.indexOf(g) < 0) {
            entity += g + ",";
          }
        }
      } else {
        if ($scope.groupadminlist.indexOf(group) < 0) {
          entity = group;
        }
      }
      if (!entity) {
        return;
      }
      $scope.changeState = true;
      return $http.post('/api/lmn/groupmembership/membership', {
        action: 'addadmingroups',
        entity: entity,
        groupname: groupName,
        type: $scope.type
      }).then(function(resp) {
        if (resp['data'][0] === 'ERROR') {
          notify.error(resp['data'][1]);
        }
        if (resp['data'][0] === 'LOG') {
          notify.success(gettext(resp['data'][1]));
          if (Array.isArray(group)) {
            $scope.groupadminlist = $scope.groupadminlist.concat(group.filter(function(g) {
              return $scope.groupadminlist.indexOf(g) < 0;
            }));
          } else {
            $scope.groupadminlist.push(group);
          }
        }
        return $scope.changeState = false;
      });
    };
    $scope.removeAdminGroup = function(group) {
      $scope.changeState = true;
      return $http.post('/api/lmn/groupmembership/membership', {
        action: 'removeadmingroups',
        entity: group,
        groupname: groupName,
        type: $scope.type
      }).then(function(resp) {
        var position;
        if (resp['data'][0] === 'ERROR') {
          notify.error(resp['data'][1]);
        }
        if (resp['data'][0] === 'LOG') {
          notify.success(gettext(resp['data'][1]));
          position = $scope.groupadminlist.indexOf(group);
          $scope.groupadminlist.splice(position, 1);
        }
        return $scope.changeState = false;
      });
    };
    $scope.demoteGroup = function(group) {
      $scope.removeAdminGroup(group);
      $scope.addMemberGroup(group);
      if ((group === $scope.identity.profile.sophomorixAdminClass) && ($scope.filterLogin($scope.admins, $scope.identity.user))) {
        return $scope.editGroup = false;
      }
    };
    $scope.demoteMember = function(user) {
      $scope.removeAdmin(user);
      $scope.addMember(user);
      if ((user.login === $scope.identity.user) && ($scope.groupadminlist.indexOf($scope.identity.profile.sophomorixAdminClass) < 0)) {
        return $scope.editGroup = false;
      }
    };
    $scope.elevateGroup = function(group) {
      $scope.removeMemberGroup(group);
      return $scope.addAdminGroup(group);
    };
    $scope.elevateMember = function(user) {
      $scope.removeMember(user);
      return $scope.addAdmin(user);
    };
    $scope._ = {
      addMember: null,
      addGroup: null,
      addasadmin: false,
      newGroup: [],
      newUser: [],
      noResults: false
    };
    $scope.$watch('_.addMember', function() {
      if ($scope._.addMember) {
        $scope._.newUser.push($scope._.addMember);
        return $scope._.addMember = null;
      }
    });
    $scope.$watch('_.addGroup', function() {
      if ($scope._.addGroup) {
        $scope._.newGroup.push($scope._.addGroup);
        return $scope._.addGroup = null;
      }
    });
    $scope.addEntities = function() {
      $scope.UserSearchVisible = false;
      if ($scope._.addasadmin) {
        $scope.addAdmin($scope._.newUser);
        $scope.addAdminGroup($scope._.newGroup);
      } else {
        $scope.addMember($scope._.newUser);
        $scope.addMemberGroup($scope._.newGroup);
      }
      $scope._.newUser = [];
      $scope._.newGroup = [];
      return $scope._.addasadmin = false;
    };
    $scope.placeholder_translate = {
      "login": gettext("Type a name or login"),
      "class": gettext("Type the class, e.g. 10a"),
      "group": gettext("Type the group name, e.g. p_wifi")
    };
    $scope.findUsers = function(q) {
      return $http.post("/api/lm/find-users", {
        login: q,
        type: 'user'
      }).then(function(resp) {
        return resp.data;
      });
    };
    $scope.findTeachers = function(q) {
      return $http.post("/api/lm/find-users", {
        login: q,
        type: 'teacher'
      }).then(function(resp) {
        return resp.data;
      });
    };
    $scope.findGroups = function(q) {
      return $http.post("/api/lm/find-users", {
        login: q,
        type: 'group'
      }).then(function(resp) {
        return resp.data;
      });
    };
    $scope.findUsersGroup = function(q) {
      return $http.post("/api/lm/find-users", {
        login: q,
        type: 'usergroup'
      }).then(function(resp) {
        return resp.data;
      });
    };
    $scope.groupType = groupType;
    $scope.getGroupDetails([groupType, groupName]);
    return $scope.close = function() {
      return $uibModalInstance.dismiss();
    };
  });

}).call(this);

