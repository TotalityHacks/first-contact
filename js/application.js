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

function load_questions(cb_profile, cb_submit) {
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

            $('#personal_info_questions').empty();
            $('#mlh_questions').empty();
            $('#essays').empty();

            questions.map(function(q) {
                if (q.category == 'profile') {
                    $('#personal_info_questions').append(q.container);
                } else if (q.category == 'application') {
                    $('#essays').append(q.container);
                } else if (q.category == 'mlh') {
                    $('#mlh_questions').append(q.container);
                }
                q.handler();
            });

            create_resume_button();

            $('#last_saved').text('Saved.');
            if(answers.submitted) {
                cb_submit();
            }
            else {
                cb_profile();
            }

        }).fail(function(data) {
            $('#application_form').show();
            $('input').hide();
            $('#personal_info_questions').empty();
            $('#essays').empty();
            $('#mlh_questions').empty();
            $('#personal_info_questions').html(data.responseText);
        });
    });
}

function create_resume_button() {
    var resume_uploaded = answers.resumes.length > 0;

    var wrapper = $("<div>");
    wrapper.addClass("wrapper app question_file_button");
    
    var label_element = $("<label>");
    label_element.addClass("question_label app");
    label_element.prop('for', 'resume_button');
    label_element.text("Resume (.PDF only please)");
    wrapper.append(label_element);

    var charcount_element = $("<span>").addClass("charcount");
    if(resume_uploaded) {
        charcount_element.html(answers.resumes[0].filename).prop('id', 'resume_filename');
    }
    wrapper.append(charcount_element);
    
    var input = $("<input>");
    input.prop('id', 'resume_button');
    input.addClass('app');
    input.val(resume_uploaded ? 'Reupload' : 'Upload');
    input.prop('type', 'button');
    wrapper.append(input);

    $('#personal_info_questions').append(wrapper);

    $('#resume_button').click(function() {
        $('#file_input').click();
    });
}

function load_answers(cb) {
    $.ajax({
        type:"GET",
        url: NEW_URL_APPLICATION,
        dataType: "json",
        beforeSend: function(xhr) {
            xhr.setRequestHeader("Authorization", "Token " + localStorage.getItem('token'));
        }
    }).done(function(data) {
        if (data.error) {
            $('#timeline_submit').addClass('error');
            answers = {};
        } else {
            if (data.submitted) {
                $('#submit_button').val('Resubmit!');
            } else {
                $('#timeline_submit').addClass('error');
            }
            answers = data;
        }
        cb();
    }).fail(function(data) {
        if (data.status == 403) {
            localStorage.removeItem('token');
            window.location.hash = '#login';
        } else if (data.status == 404) {
            $('#timeline_submit').addClass('error');
            cb();
        } else {
            $('#application_form').show();
            $('input').hide();
            $('#personal_info_questions').empty();
            $('#essays').empty();
            $('#mlh_questions').empty();
            $('#personal_info_questions').html(data.responseText);
        }
    });
}

function submit_button(e) {
    if (e) e.preventDefault();
    $('#submit_button').val('Submitting...');
    save(function() {
        $('#timeline_submit').removeClass('error');
        $('#submit_button').val('Submitted!');
        answers.submitted = true;
        submit_view();
        setTimeout(function() {
            $('#submit_button').val('Resubmit!');
        }, 2000);
    }, true);
}

function save(cb, should_submit) {
    var data = {};
    for (var i = 0; i < questions.length; i++) {
        var q = questions[i];
        if (q.question_type == SHORT_ANSWER_TYPE) {
            data[q.question_slug] = q.input.val().slice(q.question_prefix.length);
        } else {
            data[q.question_slug] = q.input.val();
        }
    }
    $.ajax({
        type: should_submit ? "POST" : "PUT",
        url: should_submit ? NEW_URL_SUBMISSION : (NEW_URL_APPLICATION + answers.id + '/'), 
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

function save_finished() {
    last_save = Date.now();
    $('#last_saved').text('Saved.');
}

function needs_save() {
    $('#last_saved').text('Saving...');
    needs_save_time = Date.now();
}

function save_count_update() {
    if (needs_save_time && (Date.now() - needs_save_time > 1000)) {
        needs_save_time = null;
        save(save_finished, false);
        return;
    }
}
