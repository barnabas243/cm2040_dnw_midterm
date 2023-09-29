/** Modal for deleting and publishing */
const deleteModal = document.querySelector('#deleteModal');
const publishModal = document.querySelector('#publishModal');

deleteModal.addEventListener('show.bs.modal', function (e) {
  // link that triggered the modal
  const link = e.relatedTarget;
  const id = link.getAttribute('data-bs-id');
  const title = link.getAttribute('data-bs-article-title');

  const hiddenInput = deleteModal.querySelector('#delete-modal-article-id');
  const modalArticleTitle = deleteModal.querySelector('#delete-modal-title');

  hiddenInput.value = id;
  modalArticleTitle.textContent = title;
});

publishModal.addEventListener('show.bs.modal', function (e) {
  const btn = e.relatedTarget;

  const id = btn.getAttribute('data-bs-id');
  console.log(id);
  const title = btn.getAttribute('data-bs-article-title');
  console.log('title: ', title);

  const hiddenInput = publishModal.querySelector('#publish-modal-article-id');
  const modalArticleTitle = publishModal.querySelector('#publish-modal-title');
  publishErr.textContent = '';
  hiddenInput.value = id;
  modalArticleTitle.textContent = title;
});

/** form listeners */
const createDraftForm = document.querySelector('#createDraftForm');
const deleteForm = document.querySelector('#deleteForm');
const deleteErr = document.querySelector('#deleteErr');
const publishForm = document.querySelector('#publishForm');
const publishErr = document.querySelector('#publishErr');

createDraftForm.addEventListener('submit', (e) => {
  e.preventDefault();
  fetch('/author/createDraft', {
    method: 'POST',
    headers: {
      'x-csrf-token': e.target.CSRFToken.value,
      'Content-Type': 'application/json',
    },
  })
    .then((res) => res.json())
    .then((data) => {
      const port = window.location.port;
      window.location.replace(
        `https://localhost:${port}/author/edit?article_id=${data.article_id}`,
      );
    })
    .catch((error) => console.log(error));
});

deleteForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const article_id = e.target.article_id.value;
  console.log('article_id: ', article_id);
  fetch('/author/delete', {
    method: 'POST',
    headers: {
      'x-csrf-token': e.target.CSRFToken.value,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ article_id: article_id }),
  })
    .then((res) => {
      if (res.status === 200) {
        window.location.reload();
      }
      res.json();
    })
    .then((data) => {
      console.log(data);
      //deleteErr.textContent = data.err;
    })
    .catch((error) => console.log(error));
});

publishForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const article_id = e.target.article_id.value;
  fetch('/author/publish', {
    method: 'POST',
    headers: {
      'x-csrf-token': e.target.CSRFToken.value,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ article_id: article_id }),
  })
    .then((res) => {
      if (res.status === 200) {
        window.location.reload();
      }
      return res.json();
    })
    .then((data) => {
      if (data.message) {
        publishErr.textContent = data.message;
      }
    })
    .catch((error) => console.log(error));
});

/** logout */
const logoutForm = document.querySelector('#logoutForm');

logoutForm.addEventListener('submit', (e) => {
  e.preventDefault();

  fetch('../auth/logout', {
    headers: {
      'x-csrf-token': e.target.CSRFToken.value,
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })
    .then((res) => {
      window.location.reload();
    })
    .catch((err) => {
      console.log(err);
    });
});
