var url = "https://whispering-cove-48870.herokuapp.com/registration/application/";
var login_url = "https://whispering-cove-48870.herokuapp.com/login/";
var base_url = "https://whispering-cove-48870.herokuapp.com/";

var user_data;

$('#login_form').submit(function(evt) {
    evt.preventDefault();
    $.post(base_url + "login", {
        "username": $('#login_form input[name=username]').val(),
        "password": $('#login_form input[name=password]').val()
    }).done(function(data) {
        localStorage.setItem("token", data.token);
        location.reload();
    }).fail(function(err) {
        document.write("Incorrect username and/or password.");
    });
});

function show_form() {
    $('#registration_form').show();
    $.ajaxSetup({
        headers: {
            'Authorization': 'Token ' + localStorage.getItem("token")
        }
    });
    $.get(base_url + "registration/application").done(function(data) {
        show_questions(data);
    }).fail(function(err) {
        alert("An error occurred. Please try again later.");
        localStorage.removeItem("token");
        location.reload();
    });
}

function show_questions(data) {
    var form = $('#registration_form');
    data.fields.map(function(field) {
        var label = $("<label>");
        label.attr('for', field.ordering);
        label.html(field.prompt);
        var element;
        if (field.type == "short_answer") {
            element = $("<input>");
        } else if (field.type == "long_answer") {
            element = $("<textarea>");
        }
        element.attr('id', field.ordering)
            .data('field', field)
            .attr('prompt', field.prompt)
            .css('display', 'block')
            .prop('disabled', true)
            .val('Loading...')
            .addClass('question');
        form.append(label).append(element);
    });
    var submit = $("<input type='submit'>");
    form.submit(submit_form).append(submit);

    get_user_data();
}

function get_user_data() {
    $.get(base_url + "registration/applicant").done(function(data) {
        
        console.log(data);
        user_data = data;

        $('.question').prop('disabled', false).val('');

        var questions = JSON.parse(user_data.data);

        for (var key in questions) {
            console.log(key);
            $('[prompt="' + key + '"]')
                .prop('disabled', false)
                .val(questions[key]);
        };

    }).fail(function(err) {
        alert("An error occurred. Please try again later.");
        localStorage.removeItem("token");
        location.reload();
    });
}

function submit_form(evt) {
    evt.preventDefault();
    var answers = {};
    $('#registration_form').children().map(function() {
        if (this.tagName == 'LABEL' || (this.tagName == 'INPUT' && this.type == 'submit')) {
            return;
        }
        if ($(this).val()) answers[$(this).attr('prompt')] = $(this).val();
    });
    user_data.data = JSON.stringify(answers);
    console.log(user_data);
    // $.post(base_url + "registration/applicant/", user_data);
}

if (localStorage.getItem("token")) {
    $('#login_form').hide();
    show_form();
}
