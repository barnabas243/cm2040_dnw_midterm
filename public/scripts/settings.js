/** validation */

const msg = document.querySelector('#message');
const spinner = document.querySelector('#loadingSpinner');
const settingForm = document.querySelector('#settingForm');

settingForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const authorData = {
    author_name: e.target.author_name.value,
    blogTitle: e.target.blogTitle.value,
    blogSubtitle: e.target.blogSubtitle.value,
  };

  spinner.classList.remove('visually-hidden');
  msg.classList.add('visually-hidden');

  fetch('/author/settings', {
    method: 'POST',
    headers: {
      'x-csrf-token': e.target.CSRFToken.value,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(authorData),
  })
    .then((res) => {
      if (res.status === 200) {
        window.location.reload();
      }
      return res.json();
    })
    .then((data) => {
      spinner.classList.add('visually-hidden');
      msg.classList.remove('visually-hidden');
      if (data.message) {
        msg.textContent = data.message;
      }
    })
    .catch((error) => console.log(error));
});
