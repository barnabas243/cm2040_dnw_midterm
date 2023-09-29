let editor;

ClassicEditor.create(document.querySelector('#editor'))
  .then((newEditor) => {
    editor = newEditor;
  })
  .catch((error) => {
    console.error(error);
  });

const publishModal = document.querySelector('#publishModal');
publishModal.addEventListener('show.bs.modal', function (e) {
  publishErr.textContent = '';
});

const submitForm = document.querySelector('#article-form');
const publishErr = document.querySelector('#publishErr');
const contentErrMsg = document.querySelector('#contentErrMsg');

submitForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const csrfToken = e.target.CSRFToken.value;
  const article_id = e.target.article_id.value;
  const title = e.target.article_title.value;
  const subtitle = e.target.article_subtitle.value;
  const content = editor.getData();
  if (!content) {
    contentErrMsg.textContent = 'Article content cannot be empty.';
  } else {
    const data = {
      article_id: article_id,
      title: title,
      subtitle: subtitle,
      content: content,
    };
    /** save data */
    if (e.submitter.id === 'draftBtn') {
      const saved = await saveData(data, csrfToken);
      if (saved) {
        window.location.reload();
      }
    }
    /** publish data */
    if (e.submitter.id === 'publishBtn') {
      const saved = await saveData(data, csrfToken);
      if (saved) {
        publishData(article_id, csrfToken);
      }
    }
  }
});

const saveData = async (data, csrfToken) => {
  return await fetch('/author/edit', {
    method: 'POST',
    headers: {
      'x-csrf-token': csrfToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
    .then((res) => {
      if (res.status === 200) {
        return true;
      } else {
        return false;
      }
    })
    .catch((error) => console.log(error));
};

const publishData = async (article_id, csrfToken) => {
  return await fetch('/author/publish', {
    method: 'POST',
    headers: {
      'x-csrf-token': csrfToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ article_id: article_id }),
  })
    .then((res) => {
      if (res.status === 200) {
        const port = window.location.port;
        window.location.replace(`https://localhost:${port}/author`);
      }
      return res.json();
    })
    .then((data) => {
      publishErr.textContent = data.message;
    })
    .catch((error) => console.log(error));
};
