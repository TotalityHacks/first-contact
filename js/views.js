function logout() {
    localStorage.removeItem('token');
    location.hash = '';
    $('input').show();
}

function login_form() {
    $('#application, #registration_form').hide();
    $('#reset_form').hide();
    $('#resend_form').hide();
    $('#login_registration, #login_form').show();
    $('#login_view').addClass('selected');
    $('#registration_view').removeClass('selected');
}

function registration_form() {
    $('#application, #login_form').hide();
    $('#reset_form').hide();
    $('#resend_form').hide();
    $('#login_registration, #registration_form').show();
    $('#registration_view').addClass('selected');
    $('#login_view').removeClass('selected');
}

function reset_form() {
    $('#application, #login_form , #registration_form, #resend_form').hide();
    $('#login_view').addClass('selected');
    $('#registration_view').removeClass('selected');

    $('#reset_form').show();
}

function resend_form() {
    $('#application, #login_form , #registration_form, #reset_form').hide();
    $('#login_view').addClass('selected');
    $('#registration_view').removeClass('selected');

    $('#resend_form').show();
}

function load_application() {
    $('#login_registration').hide();
    $('#application').show();

    load_questions(profile_view, submit_view);
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
    else if (window.location.hash == "#reset") {
        reset_form();
    }
    else if (window.location.hash == "#resend") {
        resend_form();
    }
    else if (window.location.hash == "#application") {
        if (!localStorage.getItem('token')) {
            window.location.hash = '#login'
        }
        load_application();
    }
    else if (window.location.hash == "#login") {
        if (localStorage.getItem('token')) {
            window.location.hash = '#application';
            return;
        }
        login_form();
    }
    else {
        if (localStorage.getItem('token')) {
            window.location.hash = '#application';
            return;
        }
        registration_form();
    }
    $('#form_container').show();
}


function application_view(e) {
    if (e) e.preventDefault();
    $('#application_form').show();
    $('#personal_info').hide();
    $('#essays').show();
    $('#page_title').text('application');
    $('#next_page').hide();
    $('#previous_page').show();
    $('#edit_page').hide();
    $('#submit_button').show();
    $('.timeline_active').removeClass('timeline_active');
    $('#timeline_application').addClass('timeline_active');
    $('#submit_error').show();
    $('#submit_page').hide();
}

function profile_view(e) {
    if (e) e.preventDefault();
    $('#application_form').show();
    $('#personal_info').show();
    $('#essays').hide();
    $('#page_title').text('profile');
    $('#next_page').show();
    $('#previous_page').hide();
    $('#edit_page').hide();
    $('#submit_button').hide();
    $('.timeline_active').removeClass('timeline_active');
    $('#timeline_profile').addClass('timeline_active');
    $('#submit_error').hide();
    $('#submit_page').hide();
}

function submit_view(e) {
    if (e) e.preventDefault();
    $('#application_form').show();
    $('#personal_info').hide();
    $('#essays').hide();
    $('#page_title').text('Application Submitted');
    $('#next_page').hide();
    $('#previous_page').hide();
    $('#edit_page').show();
    $('#submit_button').hide();
    $('.timeline_active').removeClass('timeline_active');
    $('#timeline_submit').addClass('timeline_active');
    $('#submit_error').hide();
    $('#submit_page').show();
}

function submit_timeline_link(e) {
    if(answers.submitted) {
        submit_view();
    } else {
        application_view();
        $('html, body').animate({scrollTop: $(document).height()-$(window).height()});
    }
}
