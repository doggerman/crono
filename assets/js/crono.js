/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var crono = {
    check_session: function(redirect_from_home) {
        token = $.cookie('token');
        uuid = $.cookie('client_secret_uuid');
        if(token && uuid) {
            $.ajax({
                type: "POST",
                url: '/crono/api/index.php/account/check',
                dataType: "json" ,
                data: {
                    token: $.sha1(token+uuid),
                }
                }).done(function( json_response ) {
                    //console.log(JSON.stringify(json_response));
                    if(json_response.status) {
                        $('#pleaseWaitDialog').modal('hide');
                        if(redirect_from_home) window.location.replace("timer.html"); 
                        $('#navbar_user_firstname').text(json_response.firstname + ' ' + json_response.lastname);
                        if(!json_response.is_admin) {
                           $('.admin-only').addClass('disabled').click(function(event) {
                              event.preventDefault(); 
                           });
                        }
                        crono.loadSettings(false);
                    } else {
                        crono.redirectToLogin();
                    }
             }).fail(function(jqXHR, textStatus) {
                    console.log( "Request failed: " + textStatus + " " + jqXHR.status );
                    crono.redirectToLogin();
            }); 
        } 
        else {
            crono.redirectToLogin();
        }
    },
    
    settings: {},
    
    loadSettings: function(from_setting_page) {
        token = $.cookie('token');
        uuid = $.cookie('client_secret_uuid');
        if(token && uuid) {
            $.ajax({
                type: "GET",
                url: '/crono/api/index.php/settings/all/'+$.sha1(token+uuid),
                dataType: "json" 
                }).done(function( json_response ) {
                    if(json_response.status) {
                        crono.settings = json_response.settings;
                        if(crono.settings.hasOwnProperty('frontend_navbar_theme')) {
                            $('nav').removeClass('navbar-default');
                            $('nav').addClass('navbar-'+crono.settings.frontend_navbar_theme);
                        }
                        if(from_setting_page) {
                            if(crono.settings.hasOwnProperty('frontend_navbar_theme')) $('#frontend_navbar_theme').val(crono.settings.frontend_navbar_theme).trigger("chosen:updated");
                            if(crono.settings.hasOwnProperty('frontend_language')) $('#frontend_language').val(crono.settings.frontend_language).trigger("chosen:updated");
                            if(crono.settings.hasOwnProperty('system_currency')) $('#system_currency').val(crono.settings.system_currency);
                            if(crono.settings.hasOwnProperty('system_cost_per_hour')) $('#system_cost_per_hour').val(crono.settings.system_cost_per_hour);
                        }
                    }
                 }).fail(function(jqXHR, textStatus) {
                    console.log( "Request failed: " + textStatus + " " + jqXHR.status );
            }); 
        } 
        else {
            crono.redirectToLogin(); 
        }    
    },
    
    redirectToLogin: function() {
        if(window.location.pathname.substring(window.location.pathname.lastIndexOf("/") + 1)!='login.html') {
            window.location.replace("login.html");
        }
    },
    
    populateUsersTable: function() {
        token = $.cookie('token');
        uuid = $.cookie('client_secret_uuid');
        if(token && uuid) {
            $.ajax({
                type: "GET",
                url: '/crono/api/index.php/account/all/'+$.sha1(token+uuid),
                dataType: "json" 
                }).done(function( json_response ) {
                    if(!json_response.error) {
                        $('#user-list-table tbody').html('');
                        for(var i=0; i<json_response.length; i++)
                        {
                            var row = $('<tr><td>'+json_response[i].username+'</td><td>'+json_response[i].firstname+'</td><td>'+json_response[i].lastname+'</td></tr>');
                            var manage_col = $('<td></td>');
                            manage_col.append('<a href="#" class="btn btn-sm btn-warning btn-edit-user" data-id="'+json_response[i].id+'" title="Edit"> <span class="glyphicon glyphicon-edit"></span> </a> ');
                            manage_col.append('<a href="#" class="btn btn-sm btn-danger btn-delete-user" data-id="'+json_response[i].id+'" title="Delete"> <span class="glyphicon glyphicon-trash"></span> </a> ');
                            row.append(manage_col);
                            $('#user-list-table tbody').append(row);
                        }
                        $('.btn-delete-user').click(function(event) {
                            event.preventDefault();
                            if(confirm('Are you sure to delete this user?')) {
                               var id = $(this).attr('data-id');
                               crono.deleteUser(id);
                            }
                        });
                        
                        $('.btn-edit-user').click(function(event) {
                           event.preventDefault();
                           var id = $(this).attr('data-id');
                           $('#modal_container').load('modal/edit_user.html', function() {
                               $('#btn_save_edit_user').attr('data-id', id);
                               crono.readUser(id);
                               $('#btn_save_edit_user').click(function(event){
                                   event.preventDefault();
                                   crono.updateUser($(this).attr('data-id'));
                               });
                               $('#modal_edit_user').modal('show');
                           });
                        });
                    }
             }).fail(function(jqXHR, textStatus) {
                    console.log( "Request failed: " + textStatus + " " + jqXHR.status );
            }); 
        } 
        else {
            crono.redirectToLogin(); 
        }    
    },
    
    populateCustomersTable: function() {
        token = $.cookie('token');
        uuid = $.cookie('client_secret_uuid');
        if(token && uuid) {
            $.ajax({
                type: "GET",
                url: '/crono/api/index.php/customers/all/'+$.sha1(token+uuid),
                dataType: "json" 
                }).done(function( json_response ) {
                    if(!json_response.error) {
                        $('#customer-list-table tbody').html('');
                        for(var i=0; i<json_response.length; i++)
                        {
                            var row = $('<tr><td>'+json_response[i].customer_name+'</td></tr>');
                            var manage_col = $('<td></td>');
                            manage_col.append('<a href="#" class="btn btn-sm btn-warning btn-edit-customer" data-id="'+json_response[i].id+'" title="Edit"> <span class="glyphicon glyphicon-edit"></span> </a> ');
                            manage_col.append('<a href="#" class="btn btn-sm btn-danger btn-delete-customer" data-id="'+json_response[i].id+'" title="Delete"> <span class="glyphicon glyphicon-trash"></span> </a> ');
                            row.append(manage_col);
                            $('#customer-list-table tbody').append(row);
                        }
                        $('.btn-delete-customer').click(function(event) {
                            event.preventDefault();
                            if(confirm('Are you sure to delete this customer?')) {
                               var id = $(this).attr('data-id');
                               crono.deleteCustomer(id);
                            }
                        });
                        
                        $('.btn-edit-customer').click(function(event) {
                           event.preventDefault();
                           var id = $(this).attr('data-id');
                           $('#modal_container').load('modal/edit_customer.html', function() {
                               $('#btn_save_edit_customer').attr('data-id', id);
                               crono.readCustomer(id);
                               $('#btn_save_edit_customer').click(function(event){
                                   event.preventDefault();
                                   crono.updateCustomer($(this).attr('data-id'));
                               });
                               $('#modal_edit_customer').modal('show');
                           });
                        });
                    }
             }).fail(function(jqXHR, textStatus) {
                    console.log( "Request failed: " + textStatus + " " + jqXHR.status );
            }); 
        } 
        else {
            crono.redirectToLogin(); 
        }    
    },
    
    populateProjectsTable: function() {
        token = $.cookie('token');
        uuid = $.cookie('client_secret_uuid');
        if(token && uuid) {
            $.ajax({
                type: "GET",
                url: '/crono/api/index.php/projects/all/'+$.sha1(token+uuid),
                dataType: "json" 
                }).done(function( json_response ) {
                    if(!json_response.error) {
                        $('#project-list-table tbody').html('');
                        for(var i=0; i<json_response.length; i++)
                        {
                            var status = (json_response[i].closed) ? 'Closed' : 'Open';
                            var row = $('<tr><td>'+json_response[i].name+'</td><td>'+json_response[i].customer_name+'</td><td>'+status+'</td></tr>');
                            var manage_col = $('<td></td>');
                            manage_col.append('<a href="#" class="btn btn-sm btn-warning btn-edit-project" data-id="'+json_response[i].id+'" title="Edit"> <span class="glyphicon glyphicon-edit"></span> </a> ');
                            manage_col.append('<a href="#" class="btn btn-sm btn-danger btn-delete-project" data-id="'+json_response[i].id+'" title="Delete"> <span class="glyphicon glyphicon-trash"></span> </a> ');
                            row.append(manage_col);
                            $('#project-list-table tbody').append(row);
                        }
                        $('.btn-delete-project').click(function(event) {
                           event.preventDefault();
                           if(confirm('Are you sure to delete this project?')) {
                               var id = $(this).attr('data-id');
                               crono.deleteProject(id);
                           }
                        });
                        
                        $('.btn-edit-project').click(function(event) {
                           event.preventDefault();
                           var id = $(this).attr('data-id');
                           $('#modal_container').load('modal/edit_project.html', function() {
                               //$('#edit_project_customer_list').chosen({allow_single_deselect:true});
                               $('#edit_project_status').chosen({disable_search_threshold: 3});
                               
                               $('#btn_save_edit_project').attr('data-id', id);
                               crono.readProject(id);
                               $('#btn_save_edit_project').click(function(event){
                                   event.preventDefault();
                                   crono.updateProject($(this).attr('data-id'));
                               });
                               $('#modal_edit_project').modal('show');
                           });
                        });
                    }
             }).fail(function(jqXHR, textStatus) {
                    console.log( "Request failed: " + textStatus + " " + jqXHR.status );
            }); 
        } 
        else {
            crono.redirectToLogin(); 
        }    
    },
    
    populateUsers: function(chosen_element, choice) {
        token = $.cookie('token');
        uuid = $.cookie('client_secret_uuid');
        if(token && uuid) {
            $.ajax({
                type: "GET",
                url: '/crono/api/index.php/account/all/'+$.sha1(token+uuid),
                dataType: "json" 
                }).done(function( json_response ) {
                    if(!json_response.error) {
                        $(chosen_element).find('option').remove();
                        $(chosen_element).append('<option></option>');
                        for(var i=0; i<json_response.length; i++)
                        {
                            $(chosen_element).append($('<option>', {
                                value: json_response[i].id,
                                text: json_response[i].username
                            }));
                        }
                        $(chosen_element).chosen({allow_single_deselect: true});
                        if(choice!=null) $(chosen_element).val(choice).trigger("chosen:updated");
                        else $(chosen_element).val('').trigger("chosen:updated"); 
                    }
             }).fail(function(jqXHR, textStatus) {
                    console.log( "Request failed: " + textStatus + " " + jqXHR.status );
            }); 
        } 
        else {
            crono.redirectToLogin();
        }
    },
    
    populateCustomers: function(chosen_element, choice) {
        token = $.cookie('token');
        uuid = $.cookie('client_secret_uuid');
        if(token && uuid) {
            $.ajax({
                type: "GET",
                url: '/crono/api/index.php/customers/all/'+$.sha1(token+uuid),
                dataType: "json" 
                }).done(function( json_response ) {
                    if(!json_response.error) {
                        $(chosen_element).find('option').remove();
                        $(chosen_element).append('<option></option>');
                        for(var i=0; i<json_response.length; i++)
                        {
                            $(chosen_element).append($('<option>', {
                                value: json_response[i].id,
                                text: json_response[i].customer_name
                            }));
                        }
                        $(chosen_element).chosen({allow_single_deselect: true});
                        if(choice!=null) $(chosen_element).val(choice).trigger("chosen:updated");
                        else $(chosen_element).val('').trigger("chosen:updated"); 
                    }
             }).fail(function(jqXHR, textStatus) {
                    console.log( "Request failed: " + textStatus + " " + jqXHR.status );
            }); 
        } 
        else {
            crono.redirectToLogin();
        }
    },
    
    searchTimeEntries: function() {
        token = $.cookie('token');
        start_time = ($('#from_date').val()) ? Math.floor(crono.fromStringToDateTime($('#from_date').val()+" 00:00:00").getTime()/1000) : 0;
        stop_time = ($('#to_date').val()) ? Math.floor(crono.fromStringToDateTime($('#to_date').val()+" 23:59:59").getTime()/1000) : 1e10;
        project_id = ($('#search_project_list').val()) ? $('#search_project_list').val() : 0;
        user_id = ($('#search_user_list').val()) ? $('#search_user_list').val() : 0;
        customer_id = ($('#search_customer_list').val()) ? $('#search_customer_list').val() : '';
        uuid = $.cookie('client_secret_uuid');
        duration_in_seconds=0;
        if(token && uuid) {
            $.ajax({
                type: "GET",
                url: '/crono/api/index.php/timer/search/'+$.sha1(token+uuid)+'/'+start_time+'/'+stop_time+'/'+user_id+'/'+project_id+'/'+customer_id,
                dataType: "json" 
                }).done(function( json_response ) {
                    if(!json_response.error) {
                        
                        $('#timer-list-table tbody').html('');
                        for(var i=0; i<json_response.length; i++)
                        {
                            json_response[i].task = (json_response[i].task) ? json_response[i].task : 'No task';
                            json_response[i].project_name = (json_response[i].project_name) ? json_response[i].project_name : 'No project';
                            var date = new Date(json_response[i].stop_time*1000);
                            var row = $('<tr><td>'+date.toLocaleDateString()+'</td><td>'+json_response[i].task+'</td><td>'+json_response[i].project_name+'</td><td>'+json_response[i].duration+'</td></tr>');
                            var manage_col = $('<td></td>');
                            manage_col.append('<a href="#" class="btn btn-sm btn-warning btn-edit-time-entry" data-id="'+json_response[i].id+'" title="Edit"> <span class="glyphicon glyphicon-edit"></span> </a> ');
                            manage_col.append('<a href="#" class="btn btn-sm btn-danger btn-delete-time-entry" data-id="'+json_response[i].id+'" title="Delete"> <span class="glyphicon glyphicon-trash"></span> </a> ');
                            row.append(manage_col);
                            $('#timer-list-table tbody').append(row);
                            duration_in_seconds+=json_response[i].duration_in_seconds;
                        }
                        $('.btn-delete-time-entry').click(function(event) {
                           event.preventDefault();
                           if(confirm('Are you sure to delete this time entry?')) {
                               var id = $(this).attr('data-id');
                               crono.deleteTimeEntry(id);
                           }
                        });
                        $('#total_duration').text(crono.getDurationStringFromSeconds(duration_in_seconds));
                        if(crono.settings.hasOwnProperty('system_cost_per_hour') && crono.settings.hasOwnProperty('system_currency')){
                            $('#total_duration').append(' - Cost: ' + Math.round(crono.settings.system_cost_per_hour * duration_in_seconds / 36)/100 + ' ' + crono.settings.system_currency);
                        }
                        $('.btn-edit-time-entry').click(function(event) {
                           event.preventDefault();
                           var id = $(this).attr('data-id');
                           $('#modal_container').load('modal/edit_manual_entry.html', function() {

                               $('#btn_save_edit_manual_entry').attr('data-id', id);
                               
                               $('#edit_manual_entry_start_time_div').datetimepicker({pickSeconds: true});
                               $('#edit_manual_entry_stop_time_div').datetimepicker({pickSeconds: true});
                            
                               
                               
                               crono.readTimeEntry(id);
                               $('#btn_save_edit_manual_entry').click(function(event){
                                   event.preventDefault();
                                   crono.updateTimeEntry($(this).attr('data-id'));
                               });
                               $('#modal_edit_manual_entry').modal('show');
                           });
                        });
                    }
             }).fail(function(jqXHR, textStatus) {
                    console.log( "Request failed: " + textStatus + " " + jqXHR.status );
            }); 
        } 
        else {
            crono.redirectToLogin();  
        }
    },
    
    populateLastTimerEntries: function(only_current_user) {
        token = $.cookie('token');
        uuid = $.cookie('client_secret_uuid');
        if(token && uuid) {
            $.ajax({
                type: "GET",
                url: '/crono/api/index.php/timer/last/'+$.sha1(token+uuid),
                dataType: "json" 
                }).done(function( json_response ) {
                    if(!json_response.error) {
                        $('#last_timer_entries').html($(''));
                        for(var i=0; i<json_response.length; i++)
                        {
                            json_response[i].task = (json_response[i].task) ? json_response[i].task : 'No task';
                            json_response[i].project_name = (json_response[i].project_name) ? json_response[i].project_name : 'No project';
                            var date = new Date(json_response[i].stop_time*1000);
                            $('#last_timer_entries').append('<li class="list-group-item"><a href="#" class="pull-right" style="padding-left:5px;font-size:14px;" data-toggle="tooltip-entry" title="Project: '+json_response[i].project_name+'"><span class="fa fa-info-circle"></span></a> '+date.toLocaleDateString()+' - '+json_response[i].task+'<b><span class="pull-right">'+json_response[i].duration+'</span></b></li>');
                        }
                        $("[data-toggle=tooltip-entry]").tooltip({placement: 'auto'});
                    }
             }).fail(function(jqXHR, textStatus) {
                    console.log( "Request failed: " + textStatus + " " + jqXHR.status );
            }); 
        } 
        else {
            crono.redirectToLogin();  
        }
    },
    
    populateProjects: function(chosen_element, choice) {
        token = $.cookie('token');
        uuid = $.cookie('client_secret_uuid');
        if(token && uuid) {
            $.ajax({
                type: "GET",
                url: '/crono/api/index.php/projects/all/'+$.sha1(token+uuid),
                dataType: "json" 
                }).done(function( json_response ) {
                    if(!json_response.error) {
                        $(chosen_element).find('option').remove();
                        $(chosen_element).append($('<option></option>'));
                        for(var i=0; i<json_response.length; i++)
                        {
                            $(chosen_element).append($('<option>', {
                                value: json_response[i].id,
                                text: json_response[i].name
                            }));
                        }
                        if(choice!=null) $(chosen_element).val(choice).trigger("chosen:updated");
                        else $(chosen_element).val('').trigger("chosen:updated");
                        crono.loadActiveTimer();
                    }
             }).fail(function(jqXHR, textStatus) {
                    console.log( "Request failed: " + textStatus + " " + jqXHR.status );
            }); 
        } 
        else {
            crono.redirectToLogin();  
        }
    },
    
    loadThisWeekTotal: function() {
        token = $.cookie('token');
        uuid = $.cookie('client_secret_uuid');
        if(token && uuid) {
            $.ajax({
                type: "GET",
                url: '/crono/api/index.php/timer/weekTotal/'+$.sha1(token+uuid),
                dataType: "json"
                }).done(function( json_response ) {
                    if(json_response.status) {
                       $('#thisWeekTotal').text(json_response.totalThisWeek);
                       // $('#myThisWeekTotal').text(json_response.myTotalThisWeek);
                    } else {
                        //Error handler
                    }
             }).fail(function(jqXHR, textStatus) {
                    console.log( "Request failed: " + textStatus + " " + jqXHR.status );
            }); 
        } 
        else {
            crono.redirectToLogin(); 
        }
    },
    
    loadActiveTimer: function() {
        token = $.cookie('token');
        uuid = $.cookie('client_secret_uuid');
        $(".chosen-select").chosen({allow_single_deselect: true});
        if(token && uuid) {
            $.ajax({
                type: "GET",
                url: '/crono/api/index.php/timer/active/'+$.sha1(token+uuid),
                dataType: "json"
                }).done(function( json_response ) {
                    if(json_response.status && json_response.active_timer) {
                       crono.timer.activeId = json_response.active_timer.id;
                       crono.timer.start = new Date(json_response.active_timer.start_time*1000);
                       crono.timer.timerID = setInterval(crono.timer.tick, 10);
                       crono.timer.run = true;
                       crono.timer.activeProjectId = json_response.active_timer.project_id;
                       crono.timer.activeTask = json_response.active_timer.task;
                       $('#btn-start-stop').html('<span class="fa fa-stop"></span> Stop');
                       $('#btn-start-stop').removeClass('btn-success');
                       $('#btn-start-stop').addClass('btn-danger');
                       $('#navbar_timer').removeClass('hide');
                       $('#task').val(json_response.active_timer.task);
                       $('#project_list').val(json_response.active_timer.project_id).trigger("chosen:updated");
                       crono.timer.activeProjectName = (json_response.active_timer.project_name!=null) ? json_response.active_timer.project_name : 'No project';
                    } else {
                        //Error handler
                    }
             }).fail(function(jqXHR, textStatus) {
                    console.log( "Request failed: " + textStatus + " " + jqXHR.status );
            }); 
        } 
        else {
            crono.redirectToLogin(); 
        }
    },
    
    addManualEntry: function() {
        token = $.cookie('token');
        uuid = $.cookie('client_secret_uuid');
        if(token && uuid) {
            if($('#manual_entry_start_time').val() && $('#manual_entry_stop_time').val()) {
                $.ajax({
                    type: "POST",
                    url: '/crono/api/index.php/timer/manual',
                    dataType: "json",
                    data: {
                        token: $.sha1(token+uuid),
                        task: $('#manual_entry_task').val(),
                        project_id: $('#manual_entry_project_list').val(),
                        start_time: Math.floor(crono.fromStringToDateTime($('#manual_entry_start_time').val()).getTime()/1000),
                        stop_time: Math.floor(crono.fromStringToDateTime($('#manual_entry_stop_time').val()).getTime()/1000)
                    }
                    }).done(function( json_response ) {
                        if(json_response.status) {
                           crono.populateLastTimerEntries(1);
                           $('#modal_manual_entry').modal('hide');
                        } else {
                            //Error handler
                        }
                 }).fail(function(jqXHR, textStatus) {
                        console.log( "Request failed: " + textStatus + " " + jqXHR.status );
                });
            }
            else {
                toastr.error('Start time and/or stop time not specified');
                console.log('Start time and/or stop time not specified');
            }
        } 
        else {
            crono.redirectToLogin();
        }
    },
    
    startTimer: function() {
        token = $.cookie('token');
        uuid = $.cookie('client_secret_uuid');
        if(token && uuid) {
            $.ajax({
                type: "POST",
                url: '/crono/api/index.php/timer/',
                dataType: "json",
                data: {
                    token: $.sha1(token+uuid),
                    task: $('#task').val(),
                    project_id: $('#project_list').val()
                }
                }).done(function( json_response ) {
                    if(json_response.status) {
                       crono.timer.start = new Date();
                       crono.timer.timerID = setInterval(crono.timer.tick, 10);
                       crono.timer.run = true;
                       crono.timer.activeId = json_response.last_inserted_id;
                       $('#btn-start-stop').html('<span class="fa fa-stop"></span> Stop');
                       $('#btn-start-stop').removeClass('btn-success');
                       $('#btn-start-stop').addClass('btn-danger');
                       $('#navbar_timer').removeClass('hide');
                    } else {
                        //Error handler
                    }
             }).fail(function(jqXHR, textStatus) {
                    console.log( "Request failed: " + textStatus + " " + jqXHR.status );
            }); 
        } 
        else {
            crono.redirectToLogin();
        }
    },
    
    updateTimeEntry: function(id) {
        token = $.cookie('token');
        uuid = $.cookie('client_secret_uuid');
        if(token && uuid) {
            $.ajax({
                type: "PUT",
                url: '/crono/api/index.php/timer/edit',
                dataType: "json",
                data: {
                    token: $.sha1(token+uuid),
                    task: $('#edit_manual_entry_task').val(),
                    project_id: $('#edit_manual_entry_project_list').val(),
                    start_time: Math.floor(crono.fromStringToDateTime($('#edit_manual_entry_start_time').val()).getTime()/1000),
                    stop_time: Math.floor(crono.fromStringToDateTime($('#edit_manual_entry_stop_time').val()).getTime()/1000),
                    id: id
                }
                }).done(function( json_response ) {
                    if(json_response.status) {
                       //Error handler
                       $('#modal_edit_manual_entry').modal('hide');
                       crono.searchTimeEntries();
                    }
             }).fail(function(jqXHR, textStatus) {
                    console.log( "Request failed: " + textStatus + " " + jqXHR.status );
            }); 
        } 
        else {
            crono.redirectToLogin();  
        }
    },
    
    updateActiveTimer: function() {
        if(crono.timer.activeId!=null) {
            token = $.cookie('token');
            uuid = $.cookie('client_secret_uuid');
            if(token && uuid) {
                $.ajax({
                    type: "PUT",
                    url: '/crono/api/index.php/timer/',
                    dataType: "json",
                    data: {
                        token: $.sha1(token+uuid),
                        task: crono.timer.activeTask,
                        active: 1,
                        project_id: $('#project_list').val(),
                        id: crono.timer.activeId
                    }
                    }).done(function( json_response ) {
                        if(!json_response.status) {
                           //Error handler
                        }
                 }).fail(function(jqXHR, textStatus) {
                        console.log( "Request failed: " + textStatus + " " + jqXHR.status );
                }); 
            } 
            else {
                crono.redirectToLogin();  
            }
        }
    },
    
    stopTimer: function() {
        token = $.cookie('token');
        uuid = $.cookie('client_secret_uuid');
        if(token && uuid) {
            $.ajax({
                type: "PUT",
                url: '/crono/api/index.php/timer/',
                dataType: "json",
                data: {
                    token: $.sha1(token+uuid),
                    task: crono.timer.activeTask,
                    active: 0,
                    project_id: crono.timer.activeProjectId,
                    id: crono.timer.activeId
                }
                }).done(function( json_response ) {
                    if(json_response.status) {
                       clearTimeout(crono.timer.timerID);
                       crono.timer.run = false;
                       $('#btn-start-stop').html('<span class="fa fa-play"></span> Start');
                       $('#btn-start-stop').removeClass('btn-danger');
                       $('#btn-start-stop').addClass('btn-success');
                       $('#navbar_timer').addClass('hide');
                       $(".chosen-select").val('').trigger('chosen:updated');
                       crono.timer.activeId = null;
                       $("#home_timer").text("00:00:00");
                       $('#task').val('');
                       crono.populateLastTimerEntries(1);
                    } else {
                        //Error handler
                    }
             }).fail(function(jqXHR, textStatus) {
                    console.log( "Request failed: " + textStatus + " " + jqXHR.status );
            }); 
        } 
        else {
            crono.redirectToLogin();  
        }
    },
    
    addCustomer: function(from_project) {
        token = $.cookie('token');
        uuid = $.cookie('client_secret_uuid');
        if(token && uuid) {
            $.ajax({
                type: "POST",
                url: '/crono/api/index.php/customers/',
                dataType: "json",
                data: {
                    token: $.sha1(token+uuid),
                    customer_name: $('#new_customer_name').val()
                }
                }).done(function( json_response ) {
                    if(json_response.status) {
                        if(from_project) {
                            crono.populateCustomers('#new_project_customer_list', json_response.last_inserted_id);
                        }
                        else crono.populateCustomersTable();
                        
                        $('#new_customer_name').val('');
                        $('#modal_new_customer').modal('hide');
                    } else {
                        //Error handler
                    }
             }).fail(function(jqXHR, textStatus) {
                    console.log( "Request failed: " + textStatus + " " + jqXHR.status );
            }); 
        } 
        else {
            crono.redirectToLogin(); 
        }
    },
    
    readTimeEntry: function(id) {
        token = $.cookie('token');
        uuid = $.cookie('client_secret_uuid');
        
        if(token && uuid) {
            $.ajax({
                type: "GET",
                url: '/crono/api/index.php/time_entries/'+id+'/'+$.sha1(token+uuid),
                dataType: "json",
                }).done(function( json_response ) {
                    if(json_response.status) {
                        crono.populateProjects('#edit_manual_entry_project_list',json_response.entry.project_id);
                        $('#edit_manual_entry_task').val(json_response.entry.task);
                        
                        
                        $('#edit_manual_entry_start_time').val(json_response.entry.start_time_formatted);
                        $('#edit_manual_entry_stop_time').val(json_response.entry.stop_time_formatted);
                        
                        $('#edit_manual_entry_start_time_div').datetimepicker('update');
                        $('#edit_manual_entry_stop_time_div').datetimepicker('update');
                        
                        $('#edit_manual_entry_calculate_btn').click(function(event){
                                event.preventDefault();
                                var start_date = crono.fromStringToDateTime($('#edit_manual_entry_start_time').val());
                                var stop_date = crono.fromStringToDateTime($('#edit_manual_entry_stop_time').val());
                                $('#edit_manual_entry_duration').val(crono.getDurationString(start_date, stop_date));
                        });
                        $('#edit_manual_entry_calculate_btn').trigger('click');
                        
                    } else {
                        //TODO Error handler
                        console.log('Error during reading time entry');
                    }
             }).fail(function(jqXHR, textStatus) {
                    console.log( "Request failed: " + textStatus + " " + jqXHR.status );
            }); 
        } 
        else {
            crono.redirectToLogin();
        }
    },
    
    readCustomer: function(id) {
        token = $.cookie('token');
        uuid = $.cookie('client_secret_uuid');
        
        if(token && uuid) {
            $.ajax({
                type: "GET",
                url: '/crono/api/index.php/customer/'+id+'/'+$.sha1(token+uuid),
                dataType: "json",
                }).done(function( json_response ) {
                    if(json_response.status) {
                        $('#edit_customer_name').val(json_response.customer.customer_name);
                    } else {
                        //TODO Error handler
                        console.log('Error during reading customer');
                    }
             }).fail(function(jqXHR, textStatus) {
                    console.log( "Request failed: " + textStatus + " " + jqXHR.status );
            }); 
        } 
        else {
            crono.redirectToLogin();
        }
    },
    
     updateCustomer: function(id) {
        token = $.cookie('token');
        uuid = $.cookie('client_secret_uuid');
        if(token && uuid) {
            $.ajax({
                type: "PUT",
                url: '/crono/api/index.php/customers/',
                dataType: "json",
                data: {
                    token: $.sha1(token+uuid),
                    id: id,
                    customer_name: $('#edit_customer_name').val(),
                }
                }).done(function( json_response ) {
                    if(json_response.status) {
                        crono.populateCustomersTable();
                        $('#modal_edit_customer').modal('hide');
                    } else {
                        //Error handler
                    }
             }).fail(function(jqXHR, textStatus) {
                    console.log( "Request failed: " + textStatus + " " + jqXHR.status );
            }); 
        } 
        else {
            crono.redirectToLogin(); 
        }
    },
    
    deleteCustomer: function(id) {
        token = $.cookie('token');
        uuid = $.cookie('client_secret_uuid');
        if(token && uuid) {
            $.ajax({
                type: "DELETE",
                url: '/crono/api/index.php/customer/'+id+'/'+$.sha1(token+uuid),
                dataType: "json",
                }).done(function( json_response ) {
                    if(json_response.status) {
                        crono.populateCustomersTable();
                    } else {
                        //TODO Error handler
                        console.log('Error during deleting customer');
                    }
             }).fail(function(jqXHR, textStatus) {
                    console.log( "Request failed: " + textStatus + " " + jqXHR.status );
            }); 
        } 
        else {
            crono.redirectToLogin(); 
        }
    },
    
    deleteTimeEntry: function(id) {
        token = $.cookie('token');
        uuid = $.cookie('client_secret_uuid');
        if(token && uuid) {
            $.ajax({
                type: "DELETE",
                url: '/crono/api/index.php/timer/delete/'+id+'/'+$.sha1(token+uuid),
                dataType: "json",
                }).done(function( json_response ) {
                    if(json_response.status) {
                        crono.searchTimeEntries();
                    } else {
                        //TODO Error handler
                        console.log('Error during deleting time entry');
                    }
             }).fail(function(jqXHR, textStatus) {
                    console.log( "Request failed: " + textStatus + " " + jqXHR.status );
            }); 
        } 
        else {
            crono.redirectToLogin(); 
        }
    },
    
    addProject: function(from_dashboard) {
        token = $.cookie('token');
        uuid = $.cookie('client_secret_uuid');
        if(token && uuid) {
            $.ajax({
                type: "POST",
                url: '/crono/api/index.php/projects/',
                dataType: "json",
                data: {
                    token: $.sha1(token+uuid),
                    name: $('#new_project_name').val(),
                    customer_id: $('#new_project_customer_list').val()
                }
                }).done(function( json_response ) {
                    if(json_response.status) {
                        if(from_dashboard) crono.populateProjects();
                        else crono.populateProjectsTable();
                        $('#new_project_name').val('');
                        $('#modal_new_project').modal('hide');
                    } else {
                        //Error handler
                    }
             }).fail(function(jqXHR, textStatus) {
                    console.log( "Request failed: " + textStatus + " " + jqXHR.status );
            }); 
        } 
        else {
            crono.redirectToLogin(); 
        }
    },
    
    updateProject: function(id) {
        token = $.cookie('token');
        uuid = $.cookie('client_secret_uuid');
        if(token && uuid) {
            $.ajax({
                type: "PUT",
                url: '/crono/api/index.php/projects/',
                dataType: "json",
                data: {
                    token: $.sha1(token+uuid),
                    id: id,
                    name: $('#edit_project_name').val(),
                    customer_id: $('#edit_project_customer_list').val(),
                    closed: $('#edit_project_status').val()
                }
                }).done(function( json_response ) {
                    if(json_response.status) {
                        crono.populateProjectsTable();
                        $('#modal_edit_project').modal('hide');
                    } else {
                        //Error handler
                    }
             }).fail(function(jqXHR, textStatus) {
                    console.log( "Request failed: " + textStatus + " " + jqXHR.status );
            }); 
        } 
        else {
            crono.redirectToLogin(); 
        }
    },
    
     readProject: function(id) {
        token = $.cookie('token');
        uuid = $.cookie('client_secret_uuid');
        
        if(token && uuid) {
            $.ajax({
                type: "GET",
                url: '/crono/api/index.php/project/'+id+'/'+$.sha1(token+uuid),
                dataType: "json",
                }).done(function( json_response ) {
                    if(json_response.status) {
                        $('#edit_project_name').val(json_response.project.name);
                        //console.log(json_response.project.status);
                        $('#edit_project_status').val(json_response.project.status).trigger('chosen:updated');
                        crono.populateCustomers('#edit_project_customer_list', json_response.project.customer_id);
                        //$('#edit_project_customer_list').val(json_response.project.customer_id).trigger('chosen:updated');
                    } else {
                        //TODO Error handler
                        console.log('Error during deleting project');
                    }
             }).fail(function(jqXHR, textStatus) {
                    console.log( "Request failed: " + textStatus + " " + jqXHR.status );
            }); 
        } 
        else {
            crono.redirectToLogin(); 
        }
    },
    
    addUser: function(id) {
        token = $.cookie('token');
        uuid = $.cookie('client_secret_uuid');
        if(token && uuid) {
            $.ajax({
                type: "POST",
                url: '/crono/api/index.php/user/',
                dataType: "json",
                data: {
                    token: $.sha1(token+uuid),
                    id: id,
                    username: $('#new-user-username').val(),
                    firstname: $('#new-user-firstname').val(),
                    lastname: $('#new-user-lastname').val(),
                    password: $('#new-user-password').val()
                }
                }).done(function( json_response ) {
                    if(json_response.status) {
                        crono.populateUsersTable();
                        $('#modal_new_user').modal('hide');
                    } else {
                        //Error handler
                        console.log(json_response.error);
                    }
             }).fail(function(jqXHR, textStatus) {
                    console.log( "Request failed: " + textStatus + " " + jqXHR.status );
            }); 
        } 
        else {
            crono.redirectToLogin(); 
        }
    },
    
    updateUser: function(id) {
        token = $.cookie('token');
        uuid = $.cookie('client_secret_uuid');
        if(token && uuid) {
            $.ajax({
                type: "PUT",
                url: '/crono/api/index.php/user/',
                dataType: "json",
                data: {
                    token: $.sha1(token+uuid),
                    id: id,
                    username: $('#edit-user-username').val(),
                    firstname: $('#edit-user-firstname').val(),
                    lastname: $('#edit-user-lastname').val(),
                    new_password: $('#edit-user-new-password').val()
                }
                }).done(function( json_response ) {
                    if(json_response.status) {
                        crono.populateUsersTable();
                        $('#modal_edit_user').modal('hide');
                    } else {
                        //Error handler
                        console.log(json_response.error);
                    }
             }).fail(function(jqXHR, textStatus) {
                    console.log( "Request failed: " + textStatus + " " + jqXHR.status );
            }); 
        } 
        else {
            crono.redirectToLogin(); 
        }
    },
    
    readUser: function(id) {
        token = $.cookie('token');
        uuid = $.cookie('client_secret_uuid');
        if(token && uuid) {
            $.ajax({
                type: "GET",
                url: '/crono/api/index.php/user/'+id+'/'+$.sha1(token+uuid),
                dataType: "json"
                }).done(function( json_response ) {
                    if(json_response.status) {
                        $('#edit-user-firstname').val(json_response.user.firstname);
                        $('#edit-user-lastname').val(json_response.user.lastname);
                        $('#edit-user-username').val(json_response.user.username);
                    }
                });
         }
    },
    
    deleteUser: function(id) {
        token = $.cookie('token');
        uuid = $.cookie('client_secret_uuid');
        if(token && uuid) {
            $.ajax({
                type: "DELETE",
                url: '/crono/api/index.php/user/'+id+'/'+$.sha1(token+uuid),
                dataType: "json",
                }).done(function( json_response ) {
                    if(json_response.status) {
                        crono.populateUsersTable();
                    } else {
                        //TODO Error handler
                        console.log('Error during deleting user: '+json_response.error);
                    }
             }).fail(function(jqXHR, textStatus) {
                    console.log( "Request failed: " + textStatus + " " + jqXHR.status );
            }); 
        } 
        else {
            crono.redirectToLogin();
        }
    },
    
    deleteProject: function(id) {
        token = $.cookie('token');
        uuid = $.cookie('client_secret_uuid');
        if(token && uuid) {
            $.ajax({
                type: "DELETE",
                url: '/crono/api/index.php/project/'+id+'/'+$.sha1(token+uuid),
                dataType: "json",
                }).done(function( json_response ) {
                    if(json_response.status) {
                        crono.populateProjectsTable();
                    } else {
                        //TODO Error handler
                        console.log('Error during deleting project');
                    }
             }).fail(function(jqXHR, textStatus) {
                    console.log( "Request failed: " + textStatus + " " + jqXHR.status );
            }); 
        } 
        else {
            crono.redirectToLogin();
        }
    },
    
    logout: function() {
        token = $.cookie('token');
        uuid = $.cookie('client_secret_uuid');
        if(token && uuid) {
            $.ajax({
                type: "POST",
                url: '/crono/api/index.php/account/logout',
                dataType: "json" ,
                data: {
                    token: $.sha1(token+uuid),
                }
                }).done(function( json_response ) {
                    if(json_response.status) {
                        $.removeCookie('token'); 
                        $.removeCookie('client_secret_uuid');
                        crono.redirectToLogin();
                    } else {
                        crono.redirectToLogin();
                    }
             }).fail(function(jqXHR, textStatus) {
                    console.log( "Request failed: " + textStatus + " " + jqXHR.status );
                    crono.redirectToLogin();
            }); 
        } 
        else {
            crono.redirectToLogin(); 
        } 
    },
    
    login: function(username, password) {
        var client_secret_uuid = crono.createUUID();
        $.ajax({
                type: "POST",
                url: '/crono/api/index.php/account/login',
                dataType: "json" ,
                data: {
                    username: username,
                    password: password,
                    client_secret_uuid: client_secret_uuid,
                }
                }).done(function( json_response ) {
                    if(json_response.status) {
                        $.cookie('client_secret_uuid', client_secret_uuid);
                        $.cookie('token', json_response.token);
                        window.location.replace("timer.html"); 
                    } else {
                        toastr.error(json_response.error);
                        $('#login_error').html(json_response.error);
                    }
             }).fail(function(jqXHR, textStatus) {
                    console.log( "Request failed: " + textStatus + " " + jqXHR.status );
            }); 
    },
    
    createUUID: function() {
        // http://www.ietf.org/rfc/rfc4122.txt
        var s = [];
        var hexDigits = "0123456789abcdef";
        for (var i = 0; i < 36; i++) {
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
        }
        s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
        s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
        s[8] = s[13] = s[18] = s[23] = "-";

        var uuid = s.join("");
        return uuid;
    },
    
    timer : {
        startTime : 0,
        start : 0,
        end : 0,
        diff : 0,
        timerID : 0,
        run: false,
        activeId: null,
        activeProjectName : 'No project',
        activeProjectId : 0,
        activeTask : '',
        tick: function() {
            crono.timer.end = new Date();
            crono.timer.diff = crono.timer.end - crono.timer.start;
            crono.timer.diff = new Date(crono.timer.diff);
            var sec = crono.timer.diff.getSeconds();
            var min = crono.timer.diff.getMinutes();
            var hr = crono.timer.diff.getHours()-1;
            sec = (sec < 10) ? "0" + sec : sec;
            min = (min < 10) ? "0" + min : min;
            hr = (hr < 10) ? "0" + hr : hr;
            $("#home_timer").text(hr+":"+min+":"+sec);
            $("#project-timer").text(hr+":"+min+":"+sec);
            var project_name = $("#project_list option:selected").text();
            project_name = !project_name ? crono.timer.activeProjectName : project_name;
            $('#project-timer-name').text(project_name);
            
        }
    },
    
    updateAccountInfo: function() {
        token = $.cookie('token');
        uuid = $.cookie('client_secret_uuid');
        if(token && uuid) {
            $.ajax({
                type: "PUT",
                url: '/crono/api/index.php/account',
                dataType: "json",
                data: {
                    token: $.sha1(token+uuid),
                    firstname: $('#edit-account-firstname').val(),
                    lastname: $('#edit-account-lastname').val(),
                    gitlab_private_key: $('#edit-account-gitlab_private_key').val(),
                    new_password: $('#edit-account-new-password').val(),
                    new_password_confirm: $('#edit-account-new-password-confirm').val(),
                }
                }).done(function( json_response ) {
                    if(json_response.status) {
                       //ok
                       crono.check_session(false);
                       $('#modal_edit_account').modal('hide');
                    }
                });
         }    
    },
    
    loadAccountInfo: function() {
        token = $.cookie('token');
        uuid = $.cookie('client_secret_uuid');
        if(token && uuid) {
            $.ajax({
                type: "GET",
                url: '/crono/api/index.php/account/info/'+$.sha1(token+uuid),
                dataType: "json"
                }).done(function( json_response ) {
                    if(json_response.status) {
                        $('#edit-account-firstname').val(json_response.user.firstname);
                        $('#edit-account-lastname').val(json_response.user.lastname);
                        $('#edit-account-gitlab_private_key').val(json_response.user.gitlab_private_key);
                    }
                });
         }
    },
    
    fromStringToDateTime: function(dateTimeStr) {
        result = new Date();
        dateTimeArray = dateTimeStr.split(' ');
        if(dateTimeArray.length != 2) return null;
        dateArray=dateTimeArray[0].split('-');
        timeArray=dateTimeArray[1].split(':');
        if(dateArray.length != 3 || timeArray.length < 1 || timeArray.length > 3) {
            return null;
        }
        result.setFullYear(dateArray[0],dateArray[1]-1,dateArray[2]);
        if (timeArray[0].length > 2) {
          result.setHours(timeArray[0].substring(0,2));
          result.setMinutes(timeArray[0].substring(2,4));
        }
        else
          result.setHours(timeArray[0]);
        if(timeArray.length>1)
            result.setMinutes(timeArray[1]);
        else
            result.setMinutes(0);
        if(timeArray.length>2)
            result.setSeconds(timeArray[2]);
        else
            result.setSeconds(0);
        return result;
    },
    
    getDurationStringFromSeconds: function(durationSecs) {
        if(durationSecs==null) {
            return "00:00:00";
        } else {
            if(durationSecs<0) {
                return "00:00:00";
            } else {
                secs = durationSecs%60;
                if(secs<10)
                    secs="0"+secs;
                durationSecs = Math.floor(durationSecs/60);
                mins = durationSecs%60;
                if(mins<10)
                    mins="0"+mins;
                hours = Math.floor(durationSecs / 60);
                if(hours<10)
                    hours="0"+hours;
                return hours+":"+mins+":"+secs;
            }
        }
    },
    
    getDurationString: function(start_datetime, stop_datetime) {
        if(start_datetime==null || stop_datetime==null) {
            return "00:00:00";
        } else {
            beginSecs = Math.floor(start_datetime.getTime() / 1000);
            endSecs = Math.floor(stop_datetime.getTime() / 1000);
            durationSecs = endSecs - beginSecs;
            if(durationSecs<0) {
                return "00:00:00";
            } else {
                secs = durationSecs%60;
                if(secs<10)
                    secs="0"+secs;
                durationSecs = Math.floor(durationSecs/60);
                mins = durationSecs%60;
                if(mins<10)
                    mins="0"+mins;
                hours = Math.floor(durationSecs / 60);
                if(hours<10)
                    hours="0"+hours;
                return hours+":"+mins+":"+secs;
            }
        }
    }
};

//Operations for every pages must be placed here 
$( document ).ready(function() {
    $('body').append($('<div id="modal_container"></div>'));

    $('#btn_edit_settings').click(function(event) {
       event.preventDefault();
       $('#modal_container').load('modal/account.html', function() {
           $('#modal_edit_account').modal('show');
           crono.loadAccountInfo();
           $('#btn_update_account_info').click(function(event) {
              event.preventDefault();
              crono.updateAccountInfo();
           });
       }); 
       
    });
    $("[data-toggle=tooltip]").tooltip({placement: 'auto'});
    
    
    $('#navbar_stop_timer').click(function(event) {
       event.preventDefault();
       crono.stopTimer();
    });
});