"use strict";
var LOGIN_URL = BASE_URL + 'login/';
var SIGNUP_URL = BASE_URL + 'registration/signup/';
var APPLICATION_URL = BASE_URL + 'application/';
var QUESTIONS_URL = APPLICATION_URL + 'questions/';
var SUBMIT_URL = APPLICATION_URL + 'submit/'

var questions;
var status;

var SHORT_ANSWER_TYPE = 'text';
var ESSAY_TYPE = 'essay';

$('#no_js').hide();

function login(e) {
    if (e) e.preventDefault();
    var form = $('#login_form');

    $('#login_email_error').text('');
    $('#login_password_error').text('');

    var username = form.children('input[name=email]').val();
    var password = form.children('input[name=password]').val();

    var error = false;
    if (username === '') {
        $('#login_email_error').text('You must enter your email address.');
        error = true;
    }
    if (username.indexOf('@') === -1) {
        $('#login_email_error').text('This is not a valid email address.');
        error = true;
    }
    if (password === '') {
        $('#login_password_error').text('You must enter your password.');
        error = true;
    }

    if (error) return;

    form.children('input').prop('disabled', true);
    var params = {
        username: username,
        password: password,
    };
    $.ajax({
        type: "POST",
        url: LOGIN_URL,
        dataType: 'json',
        data: JSON.stringify(params),
        contentType: 'application/json'
    })
        .done(function(data) {
            localStorage.setItem('token', data.token);
            window.location.hash = "#application";
            form.children('input').prop('disabled', false);
        }).fail(function(data) {
            var errors = data.responseJSON;
            $('#login_email_error').text(errors.username);
            $('#login_password_error').text(errors.password);
            $('#login_error').text(errors.non_field_errors);
            form.children('input').prop('disabled', false);
        });
}

function register(e) {
    if (e) e.preventDefault();
    var form = $('#registration_form');
    var username = form.children('input[name=email]').val();
    var password1 = form.children('input[name=password1]').val();
    var password2 = form.children('input[name=password2]').val();
    var conduct = form.find('input[name=conduct]')[0].checked;
    var data = form.find('input[name=data]')[0].checked;

    $('#register_email_error').text('');
    $('#register_password1_error').text('');
    $('#register_password2_error').text('');
    $('#register_conduct_error').text('');
    $('#register_data_error').text('');

    var error = false;
    if (!conduct) {
        $('#register_conduct_error').text('You must accept the MLH Code of Conduct.')
        error = true;
    }
    if (!data) {
        $('#register_data_error').text('You must agree to the MLH data sharing policy.')
        error = true;
    }
    if (username === '' || username.indexOf('@') == -1) {
        $('#register_email_error').text('You must enter a valid email address.')
        error = true;
    }
    if (password1 === '') {
        $('#register_password1_error').text('You must enter a password.')
        error = true;
    }
    if (password1 !== password2) {
        $('#register_password2_error').text('Your passwords must match.')
        error = true;
    }
    if (error) return;

    var params = {
        email: username,
        password: password1
    };
    form.children('input').prop('disabled', true);
    $.ajax({
        type:"POST",
        url: SIGNUP_URL,
        dataType: 'json',
        data: JSON.stringify(params),
        contentType: 'application/json'
    })
        .done(function(data) {
            $('#registration_form input').hide();
            $('#registration_form label').hide();
            $('#register_error').text(data.message).show();
            form.children('input').prop('disabled', false);
        }).fail(function(data) {
            var errors = data.responseJSON.errors;
            if (!errors) return;
            $('#register_email_error').text(errors.email);
            $('#register_password1_error').text(errors.password);
            $('#register_password2_error').text('');
            $('#register_error').text(errors.non_field_errors);
            form.children('input').prop('disabled', false);
        });

}

function logout() {
    localStorage.removeItem('token');
    location.hash = '';
    $('input').show();
}

$('#logout').click(logout);

$('#login_form').submit(login);
$('#registration_form').submit(register);

function login_form() {
    $('#application, #registration_form').hide();
    $('#login_registration, #login_form').show();
    $('#login_view').addClass('selected');
    $('#registration_view').removeClass('selected');
}

function registration_form() {
    $('#application, #login_form').hide();
    $('#login_registration, #registration_form').show();
    $('#registration_view').addClass('selected');
    $('#login_view').removeClass('selected');
}

function load_application() {
    $('#login_registration').hide();
    $('#application').show();

    load_questions(profile_view);
}

function figure_out_current_view() {
    $(':input:not([type=button]):not([type=submit])').val('');
    $('.form_error').text('');
    if (window.location.hash == "#register") {
        if (localStorage.getItem('token')) {
            window.location.hash = '#application';
            return;
        }
        registration_form();
    }
    else if (window.location.hash == "#forgot") {
        alert("Password recovery has not been implemented.");
    }
    else if (window.location.hash == "#application") {
        if (!localStorage.getItem('token')) {
            window.location.hash = '#login'
        }
        load_application();
    }
    else {
        if (localStorage.getItem('token')) {
            window.location.hash = '#application';
            return;
        }
        login_form();
    }
    $('#form_container').show();
}

var answers;

function Question(name, type, required, label, max_length, prefix) {
    max_length = max_length || 100;
    this.question_name = name;
    this.question_type = type;
    this.question_required = required;
    this.question_label = label;
    this.question_max_length = max_length;
    this.question_prefix = prefix;

    var wrapper = $("<div>");
    wrapper.addClass("wrapper app question_" + type);
    
    var label_element = $("<label>");
    label_element.addClass("question_label app");
    label_element.prop('for', name);
    label_element.text(label);
    wrapper.append(label_element);

    var charcount_element = $("<span>").addClass("charcount").text('').hide();
    wrapper.append(charcount_element);
    
    var input = $("<input>");
    if (type == SHORT_ANSWER_TYPE) {
            input.prop('type', 'text');
            input.prop('maxlength', max_length || 524288);
            this.category = 'profile';
    } else if (type == ESSAY_TYPE) {
        wrapper.addClass('essay');
        input = $('<textarea>');
        this.category = 'application';
    }
    input.prop('placeholder', 'Your answer');
    input.prop('id', name);
    input.addClass('app');
    wrapper.append(input);

    this.container = wrapper;
    this.input = input;

    if (answers) {
        for (var i = 0; i < answers.length; i++) {
            if (answers[i][0] == label) {
                input.val(prefix + answers[i][1]);
            }
        }
    }
    if (required && input.val() === '') wrapper.addClass('required');

    function handler() {
        var element = input[0];
        if (prefix) {
            if (!input.val().indexOf(prefix) == 0 && input.val().indexOf(prefix.slice(0, prefix.length-1)) == 0) {
                var start = element.selectionStart;
                input.val(prefix + input.val().slice(prefix.length - 1));
                element.selectionStart = start + 1;
                element.selectionEnd = start + 1;
            }
        }
        if (prefix && input.val() === '') {
            input.val(prefix);
        }
        if (element.selectionStart < prefix.length) {
            element.selectionStart = prefix.length;
        }
        if (required && (input.val().length - prefix.length) <= 0) {
            wrapper.addClass('required');
        } else {
            wrapper.removeClass('required');
        }
        if (max_length < 65535) {
            charcount_element.show().text((input.val().length - prefix.length) + '/' + max_length + ' characters');
        }
        if (input.val().indexOf(prefix) != 0) {
            console.error('The prefix was somehow deleted... will try to fix on next reload.');
            prefix = '';
            this.question_prefix = '';
        }
    }

    function prevent_prefix_edit(e) {
        if (input[0].selectionStart < prefix.length) e.preventDefault();
        if (input[0].selectionStart === prefix.length && input[0].selectionEnd === prefix.length && e.which == 8) e.preventDefault();
    }

    input.keyup(handler).change(handler).click(handler);
    input.keyup(needs_save).change(needs_save);
    input.keydown(prevent_prefix_edit).on('cut copy paste', prevent_prefix_edit);
    handler();
}

function load_questions(cb) {
    $('#application_form').hide();
    $('#page_title').text('');
    load_answers(function() {
        $.ajax({
            type:"GET",
            url: QUESTIONS_URL,
            dataType: "json",
            beforeSend: function(xhr) {
                xhr.setRequestHeader("Authorization", "Token " + localStorage.getItem('token'));
            }
        }).done(function(data) {
            questions = [];
            for (var i = 0; i < data.length; i++) {
                var q = new Question('question_' + data[i].id, data[i].type, true, data[i].text, data[i].max_length, data[i].prefix);
                questions.push(q);
            }

            questions.push(new Question('github_username', SHORT_ANSWER_TYPE, false, 'GitHub Username', 39, 'https://github.com/'));

            $('#personal_info').empty();
            $('#essays').empty();

            questions.map(function(q) {
                if (q.category == 'profile') {
                    $('#personal_info').append(q.container);
                } else if (q.category == 'application') {
                    $('#essays').append(q.container);
                }
            });
            $('#last_saved').text('Saved.');
            cb();

        }).fail(function(data) {
            $('#application_form').show();
            $('input').hide();
            $('#personal_info').empty();
            $('#essays').empty();
            $('#personal_info').html(data.responseText);
        });
    });
}

function load_answers(cb) {
    $.ajax({
        type:"GET",
        url: SUBMIT_URL,
        dataType: "json",
        beforeSend: function(xhr) {
            xhr.setRequestHeader("Authorization", "Token " + localStorage.getItem('token'));
        }
    }).done(function(data) {
        if (data.error) {
            status = 'Saved';
            answers = [];
        } else {
            status = data.status;
            if (status == 'Submitted')
                $('#submit_button').val('Resubmit');
            answers = data.questions;
        }
        answers.push(["GitHub Username", data.github_username]);
        cb();
    }).fail(function(data) {
        if (data.status == 403) {
            localStorage.removeItem('token');
            window.location.hash = '#login';
        } else if (data.status == 404) {
            status = 'Saved';
            cb();
        } else {
            $('#application_form').show();
            $('input').hide();
            $('#personal_info').empty();
            $('#essays').empty();
            $('#personal_info').html(data.responseText);
        }
    });
}

function profile_view(e) {
    if (e) e.preventDefault();
    $('#application_form').show();
    $('#personal_info').show();
    $('#essays').hide();
    $('#page_title').text('profile (page 1 of 2)');
    $('#next_page').show();
    $('#previous_page').hide();
    $('#submit_button').hide();
}

function application_view(e) {
    if (e) e.preventDefault();
    $('#application_form').show();
    $('#personal_info').hide();
    $('#essays').show();
    $('#page_title').text('application (page 2 of 2)');
    $('#next_page').hide();
    $('#previous_page').show();
    $('#submit_button').show();
}

function submit_button(e) {
    status = 'Submitted';
    if (e) e.preventDefault();
    save(function() {
        $('#submit_button').val('Submitted!');
        setTimeout(function() {
            $('#submit_button').val('Resubmit');
        }, 2000);
    })
}

$('#next_page').click(application_view);
$('#previous_page').click(profile_view);
$('#submit_button').click(submit_button);

function save(cb) {
    var data = {};
    data['status'] = status;
    for (var i = 0; i < questions.length; i++) {
        var q = questions[i];
        data[q.question_name] = q.input.val().slice(q.question_prefix.length);
    }
    $.ajax({
        type:"POST",
        url: SUBMIT_URL,
        dataType: "json",
        beforeSend: function(xhr) {
            xhr.setRequestHeader("Authorization", "Token " + localStorage.getItem('token'));
        },
        data: data
    }).done(function(data) {
        if (typeof cb == 'function') cb();
    }).fail(function(data) {
        $('#last_saved').text('Could not save your work.');
        console.error(data);
    });
}

var last_save;
var needs_save_time;

function save_finished() {
    last_save = Date.now();
    needs_save_time = null;
    $('#last_saved').text('Saved.');
}

function needs_save() {
    $('#last_saved').text('Saving...');
    needs_save_time = Date.now();
}

function save_count_update() {
    if (needs_save_time && (Date.now() - needs_save_time > 1000)) {
        save(save_finished);
        return;
    }
}

setInterval(save_count_update, 250);

$(window).on('hashchange', figure_out_current_view);
figure_out_current_view();

$(window).on('beforeunload', function(e) {
    if (needs_save_time) return 'Are you sure you want to quit?';
});