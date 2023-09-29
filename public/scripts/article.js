/** set 'like' icon according to localStorage value */
let article_id;

window.addEventListener('load', function () {
  article_id = window.location.href.split('/').at(-1);
  const liked = localStorage.getItem('article' + article_id);
  const article_likes = document.querySelector('#article-likes-heart');

  // user has already liked the article
  if (liked === '1') {
    article_likes.classList.remove('far');
    article_likes.classList.add('fas');
    article_likes.classList.add('text-danger');
  } else {
    article_likes.classList.remove('fas');
    article_likes.classList.remove('text-danger');
    article_likes.classList.add('far');
    localStorage.setItem('article' + article_id, 0);
  }
});

/** text editor to comment */
let editor;
DecoupledEditor.create(document.querySelector('#editor'), {
  toolbar: [
    'bold',
    'italic',
    'strikethrough',
    'underline',
    'bulletedList',
    'numberedList',
    'blockQuote',
    'link',
  ],
  placeholder: 'Share your thoughts...',
})
  .then((newEditor) => {
    const toolbarContainer = document.querySelector('#toolbar-container');

    toolbarContainer.appendChild(newEditor.ui.view.toolbar.element);
    editor = newEditor;
  })
  .catch((error) => {
    console.error(error);
  });

/** Comment form */
const commentCol = document.querySelector('#userComments');
const commentForm = document.querySelector('#commentForm');
const commentErr = document.querySelector('#commentErr');
const spinner = document.querySelector('#loadingSpinner');

commentForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const comment = editor.getData();
  if (!comment) {
    e.stopPropagation();
    commentErr.textContent = 'Comment cannot be empty';
  } else {
    spinner.classList.remove('visually-hidden');
    commentErr.classList.add('visually-hidden');

    /** submit comment */
    fetch('/article/comment', {
      method: 'POST',
      headers: {
        'x-csrf-token': e.target.CSRFToken.value,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        article_id: article_id,
        comment_content: comment,
        reply_to_id: 0,
      }),
    })
      .then((res) => {
        if(res.status === 201) {
          window.location.reload();
        }
        return res.json()
      })
      .then((comment) => {
        spinner.classList.add('visually-hidden');
        // error message is in an Array
        if (Array.isArray(comment)) {
          commentErr.classList.remove('visually-hidden');
          commentErr.textContent = comment[0].msg;
        }
      })
      .catch((error) => console.log(error));
  }
});


const article_likes = document.querySelector('#article-likes-heart');
let article_likes_number = document.querySelector('#article-likes-number');
article_likes.addEventListener('click', (e) => {
  e.target.classList.toggle('far');
  e.target.classList.toggle('fas');
  e.target.classList.toggle('text-danger');

  let val = 0;
  if (e.target.classList.contains('fas')) {
    //increment like
    val++;
    localStorage.setItem('article' + article_id, 1);
  } else {
    val--;

    localStorage.setItem('article' + article_id, 0);
  }
  fetch('/article/likes', {
    method: 'POST',
    headers: {
      'x-csrf-token': commentForm.CSRFToken.value,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      article_id: article_id,
      val: val,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      article_likes_number.textContent = data.article_likes;
    })
    .catch((error) => console.log(error));
});
