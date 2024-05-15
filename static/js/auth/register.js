import {
  emailValidator,
  passwordValidator,
} from "../../validators/validators.js";
import { register } from "../../services/auth.js";

var email, password, confirmPassword, error, lastName, firstName, safeWord;

function validateForm() {
  var valid = emailValidator(email.val());

  error.text("");

  if (valid !== "Valid") {
    error.text(valid);
    return false;
  }

  valid = passwordValidator(password.val());
  if (valid !== "Valid") {
    error.text(valid);
    return false;
  }

  if (password.val() !== confirmPassword.val()) {
    error.text("Passwords do not match!");
    return false;
  }

  return true;
}

function handleSubmit() {
  if (validateForm()) {
    register({
      lastName: lastName.val(),
      firstName: firstName.val(),
      email: email.val(),
      password: password.val(),
      safeWord: safeWord.val()
    })
      .done(function (data) {
        $.cookie("UserId", parseInt(data), { expires: 30, path: "/" });
        window.location.href =
          "http://127.0.0.1:5500/templates/auth/login.html";
      })
      .fail(function (jqXHR, textStatus, errorThrown) {
        console.log(errorThrown);
        error.text("There is already an account associated with this account!");
      });
  }
}


$(document).ready(function () {
  var userId = $.cookie("UserId");

  if (userId !== undefined)
    window.location.href =
      "http://127.0.0.1:5500/templates/auth/login.html";

  email = $("#email");
  password = $("#password");
  confirmPassword = $("#confirmPassword");
  lastName = $("#lastName");
  firstName = $("#firstName");
  safeWord = $("#safeWord");
  error = $("#error");
});

window.handleSubmit = handleSubmit;
