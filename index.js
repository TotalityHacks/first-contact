"use strict";
var LOGIN_URL = BASE_URL + 'login/';
var SIGNUP_URL = BASE_URL + 'registration/signup/';
var RESET_URL = BASE_URL + 'registration/reset/';
var RESEND_URL = BASE_URL + 'registration/resend_email/';
var APPLICATION_URL = BASE_URL + 'application/';
var SCHOOLS_URL = APPLICATION_URL + 'schools_list/';
var QUESTIONS_URL = '/questions.json';
var SUBMIT_URL = APPLICATION_URL + 'submit/';
var RESUME_URL = APPLICATION_URL + 'resumes/';
var SAVE_URL = APPLICATION_URL + 'save/';

var questions;
var status;
var resume_uploaded = false;

var SHORT_ANSWER_TYPE = 'text';
var NUMBER_TYPE = 'number';
var CHECK_TYPE = 'check';
var ESSAY_TYPE = 'essay';

var SLUG_GENDER = 'gender';
var SLUG_RACE_ETHNICITY = 'race_ethnicity';
var SLUG_STUDY_LEVEL = 'current_study_level';

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

function logout() {
    localStorage.removeItem('token');
    location.hash = '';
    $('input').show();
}

$('#logout').click(logout);
$('#login_form').submit(login);
$('#registration_form').submit(register);
$('#reset_form').submit(reset);
$('#resend_form').submit(resend);

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

function Question(name, type, required, label, max_length, prefix, slug) {
    max_length = max_length || 100;
    this.question_name = name;
    this.question_type = type;
    this.question_required = required;
    this.question_label = label;
    this.question_max_length = max_length;
    this.question_prefix = prefix;

    var wrapper = $("<div>");
    wrapper.addClass("wrapper app question_" + type);
    
    
    if (type != CHECK_TYPE){
        var label_element = $("<label>");
        label_element.addClass("question_label app");
        label_element.prop('for', name);
        label_element.text(label);
        wrapper.append(label_element);
    }

    var charcount_element = $("<span>").addClass("charcount").text('').hide();
    wrapper.append(charcount_element);
    
    var input = $("<input>");
    if (slug === "college_grad_year") {
        input = $('<select></select>');
        input.append($('<option disabled selected value=""> -- select an option -- </option>'));
        input.append($('<option value="2019">2019</option>'));
        input.append($('<option value="2020">2020</option>'));
        input.append($('<option value="2021">2021</option>'));
        input.append($('<option value="2022">2022</option>'));
        this.category = 'profile';
        this.question_type = CHECK_TYPE;

    }
    else if (slug === SLUG_GENDER) {
        input = $('<select></select>');
        input.append($('<option disabled selected value=""> -- select an option -- </option>'));
        input.append($('<option value="male">Male</option>'));
        input.append($('<option value="female">Female</option>'));
        input.append($('<option value="no answer">Prefer not to answer</option>'));
        input.append($('<option value="other">Other</option>'));
        this.category = 'profile';
        this.question_type = CHECK_TYPE;
    }
    else if (slug === SLUG_RACE_ETHNICITY) {
        input = $('<select></select>');
        input.append($('<option disabled selected value=""> -- select an option -- </option>'));
        input.append($('<option value="American Indian or Alaskan Native">American Indian or Alaskan Native</option>'));
        input.append($('<option value="Asian / Pacific Islander">Asian / Pacific Islander</option>'));
        input.append($('<option value="Black or African American">Black or African American</option>'));
        input.append($('<option value="Hispanic">Hispanic</option>'));
        input.append($('<option value="White / Caucasian">White / Caucasian</option>'));
        input.append($('<option value="Multiple ethnicity / Other">Multiple ethnicity / Other</option>'));
        input.append($('<option value="no answer">Prefer not to answer</option>'));
 
        this.category = 'profile';
        this.question_type = CHECK_TYPE;
    }
    else if (slug === SLUG_STUDY_LEVEL) {
        input = $('<select></select>');
        input.append($('<option disabled selected value=""> -- select an option -- </option>'));
        input.append($('<option value="high_school">High School</option>'));
        input.append($('<option value="undergraduate">Undergraduate</option>'));
        input.append($('<option value="graduate">Graduate</option>'));
        input.append($('<option value="other">Other</option>'));

        this.category = 'profile';
        this.question_type = CHECK_TYPE;
    }
    else if (type == NUMBER_TYPE) {
        input.prop('type', 'number');
        input.prop('maxlength', max_length || 524288);
        this.category = 'profile';
    } else if (type == ESSAY_TYPE) {
        wrapper.addClass('essay');
        input = $('<textarea>');
        input.prop('maxlength', max_length || 524288);
        this.category = 'application';
    } 
    else if (type == CHECK_TYPE){
        wrapper.addClass('check')
        input = $('<input type="checkbox"></input>')
        input.addClass('check_label');
        this.category = 'application';
    }
    else {
        input.prop('type', 'text');
        input.prop('maxlength', max_length || 524288);
        this.category = 'profile';
    }

    input.prop('placeholder', 'Your answer');
    input.prop('id', name);
    if (type != CHECK_TYPE){
        input.addClass('app');
    }
    wrapper.append(input);
    
    if (type == CHECK_TYPE){
        var label_element = $("<label>");
        label_element.addClass("question_label check_label");
        label_element.text(label);
        wrapper.append(label_element);
    }

    if (slug === "school") {
        $.get({
            url: SCHOOLS_URL,
            success: function (results) {
                new Awesomplete(input[0], {
                    list: results["schools"],
                    minChars: 1,
                });
            }
        });

    }

    this.container = wrapper;
    this.input = input;

    if (answers) {
        if (answers[label]) {
            input.val(prefix + answers[label]);
        }
    }
    if (required && input.val() === '') {
        wrapper.addClass('required');
    }
    else if (required && type == CHECK_TYPE){
        wrapper.addClass('required');
    }

    function handler() {
        var element = input[0];
 
        if (type == SHORT_ANSWER_TYPE && prefix) {
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
        if (type == SHORT_ANSWER_TYPE && element.selectionStart < prefix.length) {
            element.selectionStart = prefix.length;
        }
        if (required && (input.val() == null || (input.val().length - prefix.length) <= 0)) {
            wrapper.addClass('required');
            input.addClass('required');
        } else {
            wrapper.removeClass('required');
            input.removeClass('required');
        }
        
        if (type == CHECK_TYPE){
            if ($('input.check_label').is(':checked')){
                wrapper.removeClass('required');
                input.removeClass('required');
            } else{  
                wrapper.addClass('required');
                input.addClass('required');
            }
        }
        if (max_length < 65535) {
            charcount_element.show().text((input.val().length - prefix.length) + '/' + max_length + ' characters');
        }
        if (input.val() != null && input.val().indexOf(prefix) != 0) {
            prefix = '';
            this.question_prefix = '';
        }

        check_errors();
    }

    function prevent_prefix_edit(e) {
        if (input[0].selectionStart < prefix.length) e.preventDefault();
        if (input[0].selectionStart === prefix.length && input[0].selectionEnd === prefix.length && e.which == 8) e.preventDefault();
    }

    input.keyup(handler).change(handler).click(handler);
    input.keyup(needs_save).change(needs_save);
    input.keydown(prevent_prefix_edit).on('cut copy paste', prevent_prefix_edit);

    this.handler = handler;
}

function check_errors() {
    if ($('input.required').length == 0) {
        $('#timeline_profile').removeClass('error');
        $('#profile_error').text('');
    } else {
        $('#timeline_profile').addClass('error');
    }

    if ($('textarea.required').length == 0) {
        $('#timeline_application').removeClass('error');
        $('#application_error').text('');
    } else {
        $('#timeline_application').addClass('error');
    }
    

    if ($('input.required').length == 0 && $('textarea.required').length == 0) {
        $('#submit_button').attr('disabled', false);
        $('#submit_error').html('');
    } else {
        $('#submit_button').attr('disabled', true);
        var str = 'The following questions are required but have no answer: <ul>';
        var wrappers = $('.wrapper.required');
        for (var i = 0; i < wrappers.length; i++) {
            if ($(wrappers[i]).hasClass('check')){
                str += '<li>' + 'Please select all required checkboxes' + '</li>';
            }
            else{
                str += '<li>' + $(wrappers[i]).find('label').html() + '</li>';
            }
        }
        str += '</ul>';
        $('#submit_error').html(str);
    }
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
            data.sort(function(a, b) {
                return a.id - b.id;
            });
            for (var i = 0; i < data.length; i++) {
                var q = new Question('question_' + data[i].id, data[i].type, data[i].required, data[i].text, data[i].max_length, data[i].prefix, data[i].slug);
                questions.push(q);
            }

            questions.push(new Question('github_username', SHORT_ANSWER_TYPE, false, 'GitHub Username', 39, 'https://github.com/', "github_username"));

            $('#personal_info').empty();
            $('#essays').empty();

            questions.map(function(q) {
                if (q.category == 'profile') {
                    $('#personal_info').append(q.container);
                } else if (q.category == 'application') {
                    $('#essays').append(q.container);
                }
                q.handler();
            });

            create_resume_button();

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

function create_resume_button() {
    var wrapper = $("<div>");
    wrapper.addClass("wrapper app question_file_button");
    
    var label_element = $("<label>");
    label_element.addClass("question_label app");
    label_element.prop('for', 'resume_button');
    label_element.text("Resume");
    wrapper.append(label_element);

    var charcount_element = $("<span>").addClass("charcount").text('').hide();
    wrapper.append(charcount_element);
    
    var input = $("<input>");
    input.prop('id', 'resume_button');
    input.addClass('app');
    input.val(resume_uploaded ? 'Reupload' : 'Upload');
    input.prop('type', 'button');
    wrapper.append(input);

    $('#personal_info').append(wrapper);

    $('#resume_button').click(function() {
        $('#file_input').click();
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
            $('#timeline_submit').addClass('error');
            answers = {};
        } else {
            status = data.status;
            resume_uploaded = (data.resumes && data.resumes.length > 0);
            if (status == 'Submitted') {
                $('#submit_button').val('Resubmit!');
            } else {
                $('#timeline_submit').addClass('error');
            }
            answers = data.questions;
        }
        answers["GitHub Username"] = data.github_username;
        cb();
    }).fail(function(data) {
        if (data.status == 403) {
            localStorage.removeItem('token');
            window.location.hash = '#login';
        } else if (data.status == 404) {
            status = 'Saved';
            $('#timeline_submit').addClass('error');
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
    $('#page_title').text('profile');
    $('#next_page').show();
    $('#previous_page').hide();
    $('#submit_button').hide();
    $('.timeline_active').removeClass('timeline_active');
    $('#timeline_profile').addClass('timeline_active');
    $('#submit_error').hide();
}

function application_view(e) {
    if (e) e.preventDefault();
    $('#application_form').show();
    $('#personal_info').hide();
    $('#essays').show();
    $('#page_title').text('application');
    $('#next_page').hide();
    $('#previous_page').show();
    $('#submit_button').show();
    $('.timeline_active').removeClass('timeline_active');
    $('#timeline_application').addClass('timeline_active');
    $('#submit_error').show();
}

function submit_button(e) {
    status = 'Submitted';
    if (e) e.preventDefault();
    $('#submit_button').val('Submitting...');
    save(function() {
        $('#timeline_submit').removeClass('error');
        $('#submit_button').val('Submitted!');
        setTimeout(function() {
            $('#submit_button').val('Resubmit!');
        }, 2000);
    }, true);
}

function submit_timeline_link(e) {
    application_view();
    $('html, body').animate({scrollTop: $(document).height()-$(window).height()});
}

$('#previous_page').click(profile_view);
$('#next_page').click(application_view);
$('#submit_button').click(submit_button);

$('#timeline_profile').click(profile_view);
$('#timeline_application').click(application_view);
$('#timeline_submit').click(submit_timeline_link);

function save(cb, should_submit) {
    var data = {};
    data['status'] = status;
    for (var i = 0; i < questions.length; i++) {
        var q = questions[i];
        if (q.question_type == SHORT_ANSWER_TYPE) {
            data[q.question_name] = q.input.val().slice(q.question_prefix.length);
        } else {
            data[q.question_name] = q.input.val();
        }
    }
    $.ajax({
        type:"POST",
        url: should_submit ? SUBMIT_URL : SAVE_URL,
        dataType: "json",
        beforeSend: function(xhr) {
            xhr.setRequestHeader("Authorization", "Token " + localStorage.getItem('token'));
        },
        data: data
    }).done(function(data) {
        if (typeof cb == 'function') cb();
    }).fail(function(data) {
        $('#last_saved').text('Could not save your work.');
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

$('#file_input').change(function(e) {
    var files = e.target.files;
    if (files.length == 0) return;
    var file = files[0];
    var formData = new FormData();
    formData.append("file", file);
    formData.append("filename", file.name);
    formData.append("type", file.type);
    $('#resume_button').val('Uploading...');
    $.ajax({
        type:"POST",
        url: RESUME_URL,
        data: formData,
        processData: false,
        contentType: false,
        beforeSend: function(xhr) {
            xhr.setRequestHeader("Authorization", "Token " + localStorage.getItem('token'));
        }
    })
        .done(function(data) {
            $('#resume_button').val('Uploaded');
            resume_uploaded = true;
            check_errors();
            setTimeout(function() {
                $('#resume_button').val('Reupload');
            }, 2000);
        }).fail(function(data) {
            $('#resume_button').val('Error Uploading');
        });
});
