"use strict";

$('#no_js').hide();


/* Constants */
var BASE_URL = 'https://api.totalityhacks.com/';
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

var NEW_URL_APPLICATION = APPLICATION_URL + 'application/';
var NEW_URL_SUBMISSION = APPLICATION_URL + 'submissions/';

var questions;
var resume_uploaded = false;

var SHORT_ANSWER_TYPE = 'text';
var NUMBER_TYPE = 'number';
var CHECK_TYPE = 'check';
var ESSAY_TYPE = 'essay';

var SLUG_AGE = 'age';
var SLUG_GENDER = 'gender';
var SLUG_MAJOR = 'major';
var SLUG_RACE_ETHNICITY = 'race_ethnicity';
var SLUG_SCHOOL = 'school';
var SLUG_STUDY_LEVEL = 'current_study_level';
var SLUGS_MLH = [SLUG_AGE, SLUG_MAJOR, SLUG_GENDER, SLUG_RACE_ETHNICITY];

/* Variables */
var answers;

var last_save;
var needs_save_time;
