angular.module('lmn.linbo_sync').controller 'SyncIndexController', ($scope, $http, $interval, $timeout, notify, pageTitle, messagebox, gettext) ->
    pageTitle.set(gettext('Linbo synchronization'))

    $http.get("/api/lm/linbo/SyncList").then (resp) ->
        $scope.groups = resp.data
        $scope.linbo_command = {}
        for group of $scope.groups
            $scope.linbo_command[group] = {'cmd':[], 'show':false, 'host': [], 'target':'clients' }

    $scope.isUp = (group, host) ->
        index = $scope.groups[group].hosts.indexOf(host)

        $http.get("/api/lm/linbo/isOnline/#{host.host}").then (resp) ->
            $scope.groups[group].hosts[index].up = resp.data
            if ( resp.data == "Off" )
                $scope.groups[group].hosts[index].upClass = "btn-danger"
            else
                $scope.groups[group].hosts[index].upClass = "btn-success"

    $scope.checkOnline = (group) ->
        for host in $scope.groups[group].hosts
            $scope.isUp(group, host)

    $scope.clientIsInCmd = (group, ip) ->
        return $scope.linbo_command[group]['host'].indexOf(ip) > -1 or $scope.linbo_command[group]['target'] == 'group'

    $scope.update_host = (group, ip) ->
        if group == ip
            $scope.linbo_command[group]['host'] = []
            if $scope.linbo_command[group]['target'] == 'clients'
                for host in $scope.groups[group].hosts
                    $scope.linbo_command[group]['host'].push(host.ip)
                $scope.linbo_command[group]['target'] = 'group'
            else
                $scope.linbo_command[group]['target'] = 'clients'
        else
            $scope.linbo_command[group]['target'] = 'clients'
            position = $scope.linbo_command[group]['host'].indexOf(ip)
            if position < 0
                $scope.linbo_command[group]['host'].push(ip)
            else
                $scope.linbo_command[group]['host'].splice(position, 1)
        $scope.refresh_cmd(group)
            
    $scope.handle_sync = (group, os, value) ->
        # Possible values : new, sync or 0
        if value == 'new'
            os.run_format = !os.run_format
        else
            os.run_format = 0
        if os.run_sync == value
            os.run_sync = 0
        else
            os.run_sync = value
        $scope.refresh_cmd(group)

    $scope.handle_format = (group, os, value) ->
        # Possible values : 1 or 0
        if os.run_format == value
            os.run_format = 0
        else
            os.run_format = value
        $scope.refresh_cmd(group)

    $scope.handle_start = (group, os, value) ->
        # Possible values : start or 0
        if os.run_start == value
            os.run_start = 0
        else
            os.run_start = value
        # Only one start possible
        for osloop in $scope.groups[group]['os']
            if osloop.baseimage != os.baseimage
                osloop.run_start = 0
        $scope.refresh_cmd(group)

    $scope.handle_power = (group, value) ->
        # Possible values : halt, reboot or 0
        if $scope.groups[group]['power']['halt'] == value
            $scope.groups[group]['power']['halt'] = 0
        else
            $scope.groups[group]['power']['halt'] = value
        $scope.refresh_cmd(group)

    $scope.handle_bypass = (group) ->
        # Possible values : 0 or 1
        # Bypass start.conf
        $scope.groups[group]['auto']['bypass'] = 1 - $scope.groups[group]['auto']['bypass']
        $scope.refresh_cmd(group)

    $scope.handle_disable_gui = (group) ->
        # Possible values : 0 or 1
        $scope.groups[group]['auto']['disable_gui'] = 1 - $scope.groups[group]['auto']['disable_gui']
        $scope.refresh_cmd(group)

    $scope.refresh_cmd = (group) ->
        cmd = ' -c '
        format = []
        sync = []
        start = []
        for os in $scope.groups[group]['os']
            # First format
            if os.run_format
                format.push('format:'+os.partition)

            # Then sync or new ( not both )
            if os.run_sync
                sync.push('sync:' + os.partition)

            # A little start, but only one
            if os.run_start
                start.push('start:'+os.partition)

        cmd += format.join()
        if sync.length > 0
            cmd += if cmd.length > 4 then ','+sync.join() else sync.join()
        if start.length > 0
            cmd += if cmd.length > 4 then ','+start.join() else start.join()

        # Power is the key, but without start ...
        if $scope.groups[group]['power']['halt']
            cmd += if cmd.length > 4 then ','+$scope.groups[group]['power']['halt'] else $scope.groups[group]['power']['halt']

        timeout = ''
        if $scope.groups[group]['power']['timeout'] > 0
            timeout = ' -w ' + $scope.groups[group]['power']['timeout']

        autostart = ''
        if $scope.groups[group]['auto']['disable_gui'] > 0
            autostart += ' -d '
        if $scope.groups[group]['auto']['bypass'] > 0 and timeout
            autostart += ' -n '

        if cmd.length > 4 and $scope.linbo_command[group]['host'].length > 0
            if $scope.linbo_command[group]['target'] == 'group' or $scope.linbo_command[group]['host'].length == $scope.groups[group].hosts.length
                $scope.linbo_command[group]['target'] = 'group'
                $scope.linbo_command[group]['cmd'] = ['/usr/sbin/linbo-remote -g ' + group + timeout + autostart + cmd]
            else
                $scope.linbo_command[group]['cmd'] = []
                for ip in $scope.linbo_command[group]['host']
                    $scope.linbo_command[group]['cmd'].push('/usr/sbin/linbo-remote -i ' + ip + timeout + autostart + cmd)

            $scope.linbo_command[group]['show'] = true
        else
            $scope.linbo_command[group]['cmd'] = ''
            $scope.linbo_command[group]['show'] = false

    $scope.run = (group) ->
        for cmd in $scope.linbo_command[group]['cmd']
            $http.post("/api/lm/linbo/run", {cmd: cmd, action:'run-linbo'}).then (resp) ->
                if resp.data
                    notify.error(resp.data)
                else
                    notify.success(gettext('Command successfully sent : ') + cmd)
