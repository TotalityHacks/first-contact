function Question(name, type, required, label, max_length, prefix, slug) {
    max_length = max_length || 100;
    this.question_name = name;
    this.question_type = type;
    this.question_required = required;
    this.question_label = label;
    this.question_max_length = max_length;
    this.question_prefix = prefix;
    this.question_slug = slug;

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
        input.append($('<option value="other">Other</option>'));
        this.category = 'profile';
        this.question_type = CHECK_TYPE;

    }
    else if (slug === SLUG_GENDER) {
        input = $('<select></select>');
        input.append($('<option disabled selected value=""> -- select an option -- </option>'));
        input.append($('<option value="male">Male</option>'));
        input.append($('<option value="female">Female</option>'));
        input.append($('<option value="other">Other</option>'));
        input.append($('<option value="no_answer">Prefer not to answer</option>'));
        this.category = 'profile';
        this.question_type = CHECK_TYPE;
    }
    else if (slug === SLUG_RACE_ETHNICITY) {
        input = $('<select></select>');
        input.append($('<option disabled selected value=""> -- select an option -- </option>'));
        input.append($('<option value="am_indian_or_ak_native">American Indian or Alaskan Native</option>'));
        input.append($('<option value="asian_or_pac_islander">Asian / Pacific Islander</option>'));
        input.append($('<option value="black_or_af_am">Black or African American</option>'));
        input.append($('<option value="hispanic">Hispanic</option>'));
        input.append($('<option value="white_caucasian">White / Caucasian</option>'));
        input.append($('<option value="multiple_or_other">Multiple ethnicity / Other</option>'));
        input.append($('<option value="no_answer">Prefer not to answer</option>'));
 
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

    if(SLUGS_MLH.indexOf(slug) >= 0) {
        this.category = 'mlh';
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

    if (slug === SLUG_SCHOOL) {
        $.get({
            url: SCHOOLS_URL,
            success: function (results) {
                new Awesomplete(input[0], {
                    list: results["schools"],
                    minChars: 1,
                    autoFirst: true,
                });
            }
        });

    }

    this.container = wrapper;
    this.input = input;

    if (answers) {
        if (answers[slug]) {
            input.val(prefix + answers[slug]);
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
    input.keydown(prevent_prefix_edit).on('cut', prevent_prefix_edit);
    input.on('paste', function(e) {
        var regex;
        var index;
        if (slug == "devpost") {
            regex = /(https?:\/\/)?(www\.)?devpost.com\/([^\/]*)\/?.*/
            index = 3;
        } else if (slug == "linkedin") {
            regex = /(https?:\/\/)?(www\.)?linkedin.com\/in\/([^\/]*)\/?.*/
            index = 3;
        } else if (slug == "personal_website") {
            regex = /(https?:\/\/)?(.*)/
            index = 2;
        } else if (slug == "github") {
            regex = /(https?:\/\/)?(www\.)?github.com\/([^\/]*)\/?.*/
            index = 3;
        } else {
            return;
        }
        var text = e.originalEvent.clipboardData.getData('text');
        if (!text) return;
        var matches = text.match(regex);
        if (!matches) return;
        var temp = matches[index];
        if (!temp) return;
        e.preventDefault();
        input.val(prefix + temp);
    });

    this.handler = handler;
}
