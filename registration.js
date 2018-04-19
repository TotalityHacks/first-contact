"use strict";
var BASE_URL = 'https://madras-test.herokuapp.com/';
var LOGIN_URL = BASE_URL + 'login/';
var SIGNUP_URL = BASE_URL + 'registration/signup/';
var APPLICATION_URL = BASE_URL + 'application/';
var QUESTIONS_URL = APPLICATION_URL + 'questions/';
var SUBMIT_URL = APPLICATION_URL + 'submit/'

var questions;

var SHORT_ANSWER_TYPE = 'text';
var ESSAY_TYPE = 'essay';

function login(e) {
    if (e) e.preventDefault();
    var form = $('#login_form');
    form.children('input').prop('disabled', true);
    var params = {
        username: form.children('input[name=email]').val(),
        password: form.children('input[name=password]').val(),
    };
    $.ajax({
        type:"POST",
        url: LOGIN_URL,
        dataType: 'json',
        data: JSON.stringify(params),
        contentType: 'application/json'
    })
        .done(function(data) {
            localStorage.setItem('token', data.token);
            window.location.hash = "#apply";
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
    if (password1 != password2) {
        $('#register_password2_email').text('Your passwords must match.')
        return;
    }
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
    if (window.location.hash == "") {
        window.location.hash = "#login";
    } else if (window.location.hash == "#login") {
        if (localStorage.getItem('token')) {
            window.location.hash = '#apply';
            return;
        }
        login_form();
    } else if (window.location.hash == "#register") {
        if (localStorage.getItem('token')) {
            window.location.hash = '#apply';
            return;
        }
        registration_form();
    } else if (window.location.hash == "#forgot") {
        alert("Password recovery has not been implemented.");
    } else if (window.location.hash == "#apply") {
        if (!localStorage.getItem('token')) {
            window.location.hash = '#login'
        }
        load_application();
    }
    $('#form_container').show();
}

var answers;

function Question(name, type, required, label, max_length) {
    max_length = max_length || 100;
    this.question_name = name;
    this.question_type = type;
    this.question_required = required;
    this.question_label = label;
    this.question_max_length = max_length;

    var wrapper = $("<div>");
    wrapper.addClass("wrapper app question_" + type);
    
    var label_element = $("<label>");
    label_element.addClass("question_label app");
    label_element.prop('for', name);
    label_element.text(label);
    wrapper.append(label_element);

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
                input.val(answers[i][1]);
            }
        }
    }

    function handler() {
        needs_save();
        label_element.addClass('unsaved');
    }

    input.keyup(handler).change(handler);
}

function load_questions(cb) {
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
                var q = new Question('question_' + data[i].id, data[i].type, true, data[i].text);
                questions.push(q);
            }

            questions.push(new Question('github_username', SHORT_ANSWER_TYPE, true, 'GitHub Username', 39));

            $('#personal_info').empty();
            $('#essays').empty();

            questions.map(function(q) {
                if (q.category == 'profile') {
                    $('#personal_info').append(q.container);
                } else if (q.category == 'application') {
                    $('#essays').append(q.container);
                }
            });
        
            cb();

        }).fail(function(data) {
            $('#personal_info').empty();
            $('#essays').empty();
            $('#personal_info').text(data.responseText);
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
            answers = [];
        } else {
            answers = data.questions;
        }
        answers.push(["GitHub Username", data.github_username]);
        cb();
    }).fail(function(data) {
        $('#personal_info').empty();
        $('#essays').empty();
        $('#personal_info').text(data.responseText);
    });
}

function profile_view(e) {
    if (e) e.preventDefault();
    $('#personal_info').show();
    $('#essays').hide();
    $('#page_title').text('profile');
    $('#next_page').show();
    $('#previous_page').hide();
}

function apply_view(e) {
    if (e) e.preventDefault();
    $('#personal_info').hide();
    $('#essays').show();
    $('#page_title').text('apply');
    $('#next_page').hide();
    $('#previous_page').show();
}

$('#next_page').click(apply_view);
$('#previous_page').click(profile_view);

function save(cb) {
    var data = {};
    for (var i = 0; i < questions.length; i++) {
        var q = questions[i];
        data[q.question_name] = q.input.val();
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
    needs_save_time = false;
    $('.unsaved').removeClass('unsaved');
}

function needs_save() {
    needs_save_time = Date.now();
    $('#last_saved').text('Unsaved.')
}

function save_count_update() {
    if (needs_save_time && (Date.now() - needs_save_time > 1000)) {
        save(save_finished);
        return;
    }
    if (!last_save || needs_save_time) return;
    var seconds = Math.round((Date.now() - last_save)/1000);
    seconds = seconds || 1;
    if (seconds < 60) {
        $('#last_saved').text('Last saved ' + seconds + ' second' + (seconds == 1 ? '' : 's') + ' ago.')
    } else {
        var minutes = Math.round(seconds/60);
        $('#last_saved').text('Last saved ' + minutes + ' minute' + (minutes == 1 ? '' : 's') + ' ago.')
    }
}

setInterval(save_count_update, 250);

$(window).on('hashchange', figure_out_current_view);
figure_out_current_view();