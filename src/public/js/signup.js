document.addEventListener("DOMContentLoaded", function () {
  let redirect = true;
  let signform = document.querySelector(".signup-form");
  signform.addEventListener("submit", function (event) {
    redirect = true;
    firstName = document.getElementById("InputFirstName");
    firstName.value.length > 2
      ? is_valid(firstName, true)
      : is_valid(firstName, false);
    lastName = document.getElementById("InputLastName");
    lastName.value.length > 2
      ? is_valid(lastName, true)
      : is_valid(lastName, false);
    age = document.getElementById("InputAge");
    age.value.length > 1 && !isNaN(age.value)
      ? is_valid(age, true)
      : is_valid(age, false);
    email = document.getElementById("InputEmail1");
    email.value.length > 6 ? is_valid(email, true) : is_valid(email, false);
    pass1 = document.getElementById("InputPassword1");
    pass1.value.length > 3 ? is_valid(pass1, true) : is_valid(pass1, false);
    pass2 = document.getElementById("InputPassword2");
    pass2.value !== "" && pass1.value === pass2.value
      ? is_valid(pass2, true)
      : is_valid(pass2, false);
    req.logger.debug(`datos validos ${redirect}`);
    if (!redirect) {
      event.preventDefault();
      return;
    }
  });

  function is_valid(widget, valid) {
    if (valid) {
      widget.classList.remove("is-invalid");
      widget.classList.add("is-valid");
    } else {
      widget.classList.remove("is-valid");
      widget.classList.add("is-invalid");
      redirect = false;
    }
  }
});
