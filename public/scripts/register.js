const emailInput = document.querySelector('#email');
const passwordInput = document.querySelector('#password');
const passwordConfirmInput = document.querySelector('#password_confirm');

const togglePassword = document.querySelector('#togglePassword');
const toggleConfirmPassword = document.querySelector('#toggleConfirmPassword');

const registerForm = document.querySelector('#registerForm');
const errMsg = document.querySelector('#errMsg');

/** send Post data via fetch with error handling */
registerForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (
    !e.target.email.classList.contains('is-invalid') &&
    !e.target.password.classList.contains('is-invalid') &&
    !e.target.password_confirm.classList.contains('is-invalid')
  ) {
    const registerUser = {
      author_name: e.target.author_name.value,
      email: e.target.email.value,
      password: e.target.password.value,
      password_confirm: e.target.password_confirm.value,
    };

    fetch('/auth/register', {
      method: 'POST',
      headers: {
        'x-csrf-token': e.target.CSRFToken.value,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registerUser),
    })
      .then((res) => {
        if (res.status === 201) {
          const port = window.location.port;
          window.location.replace(`https://localhost:${port}/author`);
        }
        return res.json();
      })
      .then((data) => {
        console.log(data);
        if (data instanceof Array) {
          console.log(errMsg.classList);
          errMsg.classList = 'alert alert-danger d-flex align-items-center p-0';
          errMsg.innerHTML = insertErrMsg(data[0].msg);
        } else if (data.message) {
          errMsg.classList = 'alert alert-danger d-flex align-items-center p-0';
          errMsg.innerHTML = insertErrMsg(data.message);
        }
      })
      .catch((error) => console.trace('err: ', error));
  }
});

/** error span */
function insertErrMsg(message) {
  return `<svg class="mx-2" width="20" height="20" role="img" aria-label="Danger:">
                <use xlink:href="#exclamation-triangle-fill" />
            </svg>
            <span>${message}</span>
            `;
}
/** regex for validation (tested to be safe from ReDos) */
const email_regex =
  /^[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

const pass_regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[\w\d\W]{8,}$/;

/** email validation against regex*/
emailInput.addEventListener('input', (e) => {
  const email = e.target.value.toLowerCase();

  if (email_regex.test(email)) {
    e.target.classList.remove('is-invalid');
    e.target.classList.add('is-valid');
  } else {
    e.target.classList.add('is-invalid');
    e.target.classList.remove('is-valid');
  }
});

/** password validation against regex*/
passwordInput.addEventListener('input', (e) => {
  const password = e.target.value;

  if (pass_regex.test(password)) {
    e.target.classList.remove('is-invalid');
    e.target.classList.add('is-valid');
  } else {
    e.target.classList.add('is-invalid');
    e.target.classList.remove('is-valid');
  }
});

/** compare passwords */
passwordConfirmInput.addEventListener('input', (e) => {
  const passwordConfirm = e.target.value;

  if (passwordConfirm === password.value) {
    e.target.classList.remove('is-invalid');
    e.target.classList.add('is-valid');
  } else {
    e.target.classList.add('is-invalid');
    e.target.classList.remove('is-valid');
  }
});

/** toggle password visibility */
togglePassword.addEventListener('click', function () {
  // toggle the type attribute
  const type =
    password.getAttribute('type') === 'password' ? 'text' : 'password';
  password.setAttribute('type', type);

  // toggle the eye icon
  this.classList.toggle('fa-eye');
  this.classList.toggle('fa-eye-slash');
});
toggleConfirmPassword.addEventListener('click', function () {
  // toggle the type attribute
  const type =
    password_confirm.getAttribute('type') === 'password' ? 'text' : 'password';
  password_confirm.setAttribute('type', type);

  // toggle the eye icon
  this.classList.toggle('fa-eye');
  this.classList.toggle('fa-eye-slash');
});
