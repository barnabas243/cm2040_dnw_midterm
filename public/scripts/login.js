/** toggle password visibility */
const password = document.querySelector('#current-password');
const togglePassword = document.querySelector('#togglePassword');

togglePassword.addEventListener('click', function () {
  // toggle the type attribute
  const type =
    password.getAttribute('type') === 'password' ? 'text' : 'password';
  password.setAttribute('type', type);
  // toggle the eye icon
  this.classList.toggle('fa-eye');
  this.classList.toggle('fa-eye-slash');
});

const loginForm = document.querySelector('#loginForm');

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = {
    email: e.target.email.value,
    password: e.target.password.value,
  };
  fetch('/auth/login', {
    method: 'POST',
    headers: {
      'x-csrf-token': e.target.CSRFToken.value,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
    .then((res) => {
      if (res.status === 200) {
        const port = window.location.port;
        window.location.replace(`https://localhost:${port}/author`);
      } else {
        // reload page to show req.flash error
        window.location.reload();
      }
    })
    .catch((err) => console.log(err));
});
