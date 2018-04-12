"use strict";
var BASE_URL = 'https://madras-test.herokuapp.com';
var LOGIN_URL = BASE_URL + '/login/';
var SIGNUP_URL = BASE_URL + '/registration/signup/';
var APPLICATION_URL = BASE_URL + '/application/';

var questions;

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
}

$(window).on('hashchange', figure_out_current_view);
figure_out_current_view();

function Question(name, type, required, label, max_length) {
    this.question_name = name;
    this.question_type = type;
    this.question_required = required;
    this.question_label = label;
    this.question_max_length = max_length;

    var wrapper = $("<div>");
    wrapper.addClass("wrapper app question_" + type);
    
    var label = $("<label>");
    label.addClass("question_label app");
    label.prop('for', name);
    label.text(this.question_label);
    wrapper.append(label);

    var input = $("<input>");
    if (type == 'string') {
        if (max_length <= 100) {
            input.prop('type', 'text');
            input.prop('maxlength', max_length || 524288);
            this.category = 'profile';
        } else {
            wrapper.addClass('essay');
            input = $('<textarea>');
            this.category = 'application';
        }
    }
    input.prop('placeholder', 'Your answer');
    input.prop('id', name);
    input.addClass('app');
    wrapper.append(input);

    this.container = wrapper;
}

function load_questions(cb) {
    var questions_json = {
        "github_username": {
            "type": "string",
            "required": false,
            "read_only": false,
            "label": "Github username",
            "max_length": 39
        },
        "what_matters": {
            "type": "string",
            "required": false,
            "read_only": false,
            "label": "What matters to you and why?",
            "max_length": 500
        }
    }

    questions = [];

    for (var key in questions_json) {
        var q = new Question(key, questions_json[key]['type'], questions_json[key]['required'], questions_json[key]['label'], questions_json[key]['max_length']);
        questions.push(q);
    }

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