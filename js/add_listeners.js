$('#logout').click(logout);
$('#login_form').submit(login);
$('#registration_form').submit(register);
$('#reset_form').submit(reset);
$('#resend_form').submit(resend);

$('#previous_page').click(profile_view);
$('#next_page').click(application_view);
$('#edit_page').click(profile_view);
$('#submit_button').click(submit_button);

$('#timeline_profile').click(profile_view);
$('#timeline_application').click(application_view);
$('#timeline_submit').click(submit_timeline_link);

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
