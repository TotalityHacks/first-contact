var BASE_URL = 'https://madras-test.herokuapp.com';
var LOGIN_URL = BASE_URL + '/login/';
var SIGNUP_URL = BASE_URL + '/registration/signup/';
var APPLICATION_URL = BASE_URL + '/application/';


function login(e) {
    if (e) e.preventDefault();
    form = $('#login_form');
    params = {
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
            console.log(data);
            localStorage.setItem('token', data.token);
            window.location.hash = "#apply";
        }).fail(function(data) {
            errors = data.responseJSON;
            $('#login_email_error').text(errors.username);
            $('#login_password_error').text(errors.password);
            $('#login_error').text(errors.non_field_errors);
        });
}

function register(e) {
    if (e) e.preventDefault();
    form = $('#registration_form');
    var username = form.children('input[name=email]').val();
    var password1 = form.children('input[name=password1]').val();
    var password2 = form.children('input[name=password2]').val();
    if (password1 != password2) {
        $('#register_password2_email').text('Your passwords must match.')
        return;
    }
    params = {
        email: username,
        password: password1
    };
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
            console.log(data);
            // window.location.hash = "#apply";
        }).fail(function(data) {
            errors = data.responseJSON.errors;
            if (!errors) return;
            $('#register_email_error').text(errors.email);
            $('#register_password1_error').text(errors.password);
            $('#register_password2_error').text('');
            $('#register_error').text(errors.non_field_errors);
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
    $('#application_form').show();

    $.ajax({
        method: "GET",
        url: APPLICATION_URL,
        headers: {
            'Authorization': 'Token ' + localStorage.getItem('token')
        }
    }).done(function(data) {
        console.log(data);
    }).fail(function(data) {
        console.log(data);
    })
}

function figure_out_current_view() {
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