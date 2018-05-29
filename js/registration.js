
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
            $('#registration_form .checkbox').hide();
            $('#registration_form input').hide();
            $('#registration_form label').hide();
            $('#registration_resend').show();
            $('#register_msg').text(data.message).show();
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

function reset(e){
    if (e) e.preventDefault();
    
    var form = $('#reset_form');
    var email = form.children('input[name=email]').val();
    
    var error = false;
    if (email === ''){
        error = true;
    }
    if (error) return;
    
    var params = {
        email: email
    };
    form.children('input').prop('disabled' , true);
    $.ajax({
        type:"POST",
        url: RESET_URL,
        dataType: 'json',
        data: JSON.stringify(params),
        contentType: 'application/json'
    })
        .done(function(data) {
                $('#email_query').text(data.message);
                form.children('input').prop('disabled', false);
            }).fail(function(data) {
                form.children('input').prop('disabled', false);
                var text = "An error occurred sending the password reset email.";
                if (data && data.responseJSON && !data.responseJSON.success && data.responseJSON.message) {
                    text = data.responseJSON.message;
                }
                $('#email_query').text(text);
            });
}

function resend(e){
    if (e) e.preventDefault();
    
    var form = $('#resend_form');
    var email = form.children('input[name=email]').val();
    
    var error = false;
    if (email === ''){
        error = true;
    }
    if (error) return;
    
    var params = {
        email: email
    };
    form.children('input').prop('disabled' , true);
    $.ajax({
        type:"POST",
        url: RESEND_URL,
        dataType: 'json',
        data: JSON.stringify(params),
        contentType: 'application/json'
    })
        .done(function(data) {
                $('#resend_email_query').text(data.message);
                form.children('input').prop('disabled', false);
            }).fail(function(data) {
                form.children('input').prop('disabled', false);
                var text = "An error occurred resending the confirmation email.";
                if (data && data.responseJSON && !data.responseJSON.success && data.responseJSON.message) {
                    text = data.responseJSON.message;
                }
                $('#resend_email_query').text(text);
            });
}
