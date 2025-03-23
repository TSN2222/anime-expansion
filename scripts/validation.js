const form = document.getElementById("auth-info");
const email_input = document.getElementById("email_input");
const password_input = document.getElementById("password-input");
const username_input = document.getElementById("username-input");
const confirm_password_input = document.getElementById("confirm-password");
const error_message = document.getElementById("error-message");

form.addEventListener("submit", (e) => {
  let errors = [];

  if (username_input) {
    errors = getSignUpFormErrors(
      username_input.value,
      email_input.value,
      password_input.value,
      confirm_password_input.value
    );
  } else {
    errors = getLoginFormErrors(email_input.value, password_input.value);
  }

  if (errors.length > 0) {
    e.preventDefault();
    error_message.innerText = errors.join(". ");
  }
});

function getSignUpFormErrors(username, email, password, repeatPassword) {
  let errors = [];

  if (username === "" || username === null) {
    errors.push("username is required.");
    username_input.parentElement.classList.add("incorrect");
  }
  if (email === "" || email === null) {
    errors.push("email is required.");
    email_input.parentElement.classList.add("incorrect");
  }
  if (password === "" || password === null) {
    errors.push("username is required.");
    password_input.parentElement.classList.add("incorrect");
  }
  if (password.length < 8) {
    errors.push("Password must have at least 8 characters");
    password_input.parentElement.classList.add("incorrect");
  }
  if (repeatPassword !== password) {
    errors.push("Password does not match repeated password");
    password_input.parentElement.classList.add("incorrect");
    confirm_password_input.parentElement.classList.add("incorrect");
  }

  return errors;
}

function getLoginFormErrors(email, password) {
  let errors = [];

  if (email === "" || email == null) {
    errors.push("Email is required");
    email_input.parentElement.classList.add("incorrect");
  }
  if (password === "" || password == null) {
    errors.push("Password is required");
    password_input.parentElement.classList.add("incorrect");
  }

  return errors;
}
