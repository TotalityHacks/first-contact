var url = "https://whispering-cove-48870.herokuapp.com/registration/application/";
var login_url = "https://whispering-cove-48870.herokuapp.com/login/";

$('#login_form').submit(function(evt) {
    evt.preventDefault();
    $.post(login_url, {
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
    $.get(url).done(function(data) {
        show_questions(data);
    }).fail(function(err) {
        // localStorage.removeItem("token");
        // location.reload();
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
        element.attr('id', field.ordering);
        element.data("field", field);
        element.css('display', 'block');
        form.append(label);
        form.append(element);
    });
    var submit = $("<input type='submit'>");
    form.submit(function(evt) {
        evt.preventDefault();
        var answers = {};
        form.children().map(function() {
            if (this.tagName == 'LABEL' || (this.tagName == 'INPUT' && this.type == 'submit')) {
                return;
            }
            answers[$(this).data("field")["prompt"]] = $(this).val();
        });
        $.post(url, {
            "questions": answers,
            "complete": false
        })
        console.log(answers);
    });
    form.append(submit);
}

if (localStorage.getItem("token")) {
    $('#login_form').hide();
    show_form();
}
