import {API_EXERCISES_POINT, api} from './api.js';
import { notify } from './notifier.js';

const refs = {
  modalCard: document.querySelector('.modal'),
  closeBtn: document.querySelector('.close-modal-btn'),
  favBtn: document.querySelector('.add-favorite-btn'),
  ratingBtn: document.querySelector('.give-rating-btn'),
  modal: document.querySelector('.backdrop'),
  loader: document.querySelector('.loader')
};
let exerciseObject = {isFavorite: false};

// (open modal, get exer)
export function openModalHandler(e) {
  // testing
  let id = '64f389465ae26083f39b1ab2';
  // const id = e.target.dataset.id
  if (!id) {
    return;
  }
  refs.modal.classList.remove('visually-hidden');
  openModal(id);
}

// (hide only modal, backdrop is open)
export function hideModalHandler() {

}
// (show only modal, get exer from server)
export function showModalHandler() {

}

// (closes the modal)
function closeModalHandler() {
  refs.modal.classList.add('visually-hidden');
}

function addRemoveFavoriteHandler(e) {
  if (Object.hasOwn(exerciseObject, 'isFavorite') && exerciseObject.isFavorite) {
    removeFromFavoriteStorage(e);
    exerciseObject.isFavorite = false;
    notify('success', 'The exercise has been removed from favorites list');
  } else {
    addToFavoriteStorage(e);
    exerciseObject.isFavorite = true;
    notify('success', 'The exercise has been added to favorites list');
  }
  markupAndReload(exerciseObject);
}
// (adds to favorites)
function addToFavoriteStorage(e) {
    console.log(e);
    let curFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
    curFavorites.push(exerciseObject);
    localStorage.setItem('favorites', JSON.stringify(curFavorites));
}

// (remove from favorites)
function removeFromFavoriteStorage(e) {
    const exerciseId = e.target.dataset.id
    let curFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
    let updFavorites = curFavorites.filter(
      exercise => exercise._id !== exerciseId
    );
    localStorage.setItem('favorites', JSON.stringify(updFavorites));
}

function getExerciseFromStorage(id) {
  if (id) {
    let itemObj;
    let exerciseId = id;
    let curFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
    itemObj = curFavorites.filter(
      exercise => exercise._id === exerciseId
    );
    exerciseObject.isFavorite = !!itemObj.length;
    return itemObj;
  }
}

function openModal(id) {
  getExerciseFromStorage(id);
  getExerciseApi(id);
}

function markupAndReload(item) {
  refs.modalCard.innerHTML = createMarkupExercisesCard(item);

  // refresh all elements after recreate them, and add listeners
  refs.closeBtn = document.querySelector('.close-modal-btn');
  refs.closeBtn.addEventListener('click', closeModalHandler);

  refs.favBtn = document.querySelector('.add-favorite-btn');
  refs.favBtn.addEventListener('click', addRemoveFavoriteHandler);

  refs.ratingBtn = document.querySelector('.give-rating-btn');
  // refs.ratingBtn.addEventListener('click', rating exported func);
}


function getExerciseApi(id) {
  if (!id) {
    return;
  }
  refs.loader.style.display = 'block';
  api.get(API_EXERCISES_POINT + `/${id}`, {})
  .then(data => {
    if (exerciseObject.isFavorite) {
      exerciseObject = data;
      exerciseObject.isFavorite = true;
    } else {
      exerciseObject = data;
      exerciseObject.isFavorite = false;
    }
    markupAndReload(data);
  })
    .catch(error => notify("error", `API error: ${error}`));
}

// this will call from exercises_items part
openModalHandler();


function spanToCapitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function createMarkupExercisesCard({
  _id,
  bodyPart,
  equipment,
  gifUrl,
  name,
  target,
  description,
  rating,
  burnedCalories,
  time,
  popularity,
  isFavorite
}) {
  let starsGray = 5;
  let starsOrange = Number(rating.toFixed());
  starsGray -= starsOrange;
  let stars = '<r class="star-1"/>'.repeat(starsOrange)
    .concat('<r class="star-0"/>'.repeat(starsGray))
  return `<div class="modal-description-container">
      <button class="close-modal-btn" title="Close window">
        <svg class="close-modal-icon" width="24" height="24">
          <use href="./img/icons.svg#icon-cross"></use>
        </svg>
      </button>
      <div class="modal-gif-container">
        <picture>
          <source
            media="(max-width:767.98px)"
            type="image/gif"
            width="295"
            height="258"
          />
          <source
            media="(min-width:768px)"
            type="image/gif"
            width="270"
            height="259"
          />
          <img
            class="modal-gif"
            src="${gifUrl}"
            alt="${name}"
            width="295"
            height="258"
          />
        </picture>
      </div>
      <div class="text-container">
        <h4 class="modal-title">${name}</h4>
        <div class="rating-container">
          <div class="star-block">
          <p class="modal-exercises-rating">${rating.toFixed(1)}</p>
          ${stars}
        </div>
        <ul class="description-list">
          <li class="description-item">
            <p>Target</p>
            <span>${spanToCapitalize(target)}</span>
          </li>
          <li class="description-item">
            <p>Body Part</p>
            <span>${spanToCapitalize(bodyPart)}</span>
          </li>
          <li class="description-item">
            <p>Equipment</p>
            <span>${spanToCapitalize(equipment)}</span>
          </li>
          <li class="description-item">
            <p>Popular</p>
            <span>${popularity}</span>
          </li>
          <li class="description-item">
            <p>Burned Calories</p>
            <span>${burnedCalories}/${time} min</span>
          </li>
        </ul>
        <p class="modal-description-text">${description}</p>
        <div class="modal-buttons-container">
          <button data-id="${_id}" class="add-favorite-btn">
            ${isFavorite ? 'Remove from' : 'Add to favorites'}
            <svg class="icon-heart" width="18" height="18">
              <use href="./img/icons.svg#icon-heart"></use>
            </svg>
          </button>
          <button data-id="${_id}" class="give-rating-btn">
            Give a rating
          </button>
        </div>
      </div>
    </div>`;
}
