const API_URL_TOP250 = 'https://kinopoiskapiunofficial.tech/api/v2.2/films/top?type=TOP_250_BEST_FILMS&page=';
const API_URL_POPULAR = 'https://kinopoiskapiunofficial.tech/api/v2.2/films/top?type=TOP_100_POPULAR_FILMS&page=';
const API_URL_AWAIT = 'https://kinopoiskapiunofficial.tech/api/v2.2/films/top?type=TOP_AWAIT_FILMS&page=';
const API_URL_SEARCH = 'https://kinopoiskapiunofficial.tech/api/v2.1/films/search-by-keyword?keyword=';
const API_FILM_ID_DATA = 'https://kinopoiskapiunofficial.tech/api/v2.2/films/';
const API_KEY = '10b6a4ef-4099-43b2-a0c0-3b8e8c188ff1';

const moviesHolderEL = document.querySelector('.movies-holder');

const searchForm = document.querySelector('.search-form');
const inputEL = document.querySelector('.search-input');
const searchBtn = document.querySelector('.search-btn');

const prevPage = document.querySelector('.prev');
const nextPage = document.querySelector('.next');
const paginationEL = document.querySelector('.pagination');
const currentPageEl = document.querySelector('.current-page');
const totalPagesEl = document.querySelector('.total-pages');
const pagesDataEl = document.querySelector('.pages-data')

const pagiFormEL = document.querySelector('.pagination-form');
const pageSelectEl = document.querySelector('.page-select');
const pageSubmitBtn = document.querySelector('.page-submit-btn');

const btnGroupEl = document.querySelector('.buttons-group');
const btnTopEl = document.querySelector('.top');
const btnPopularEl = document.querySelector('.popular');
const btnAwaitEl = document.querySelector('.await');
const watchlistBtn = document.querySelector('.watchlist-btn');

const numbFormat = Intl.NumberFormat('ru-RU', {})

let myMovies = [];
let pageCounter = 1;
let currentURL = API_URL_TOP250;



if (localStorage.getItem('movies')) {

    myMovies = JSON.parse(localStorage.getItem('movies'));
}
getMovies(currentURL + pageCounter);
paginationCheck();
pageSelectEl.value = 1

searchForm.addEventListener('submit', search);

pagiFormEL.addEventListener('submit', getPageNumber);

paginationEL.addEventListener('click', pagination);

btnGroupEl.addEventListener('click', checkButtons);

moviesHolderEL.addEventListener('click', checkMovieID);

pageSelectEl.addEventListener('input', checkInput);



// ============================== ЗАПРОС API ===============================
// Получаем массив фильмов
async function getMovies(url) {
    const response = await fetch(url, {
        headers: {
            'Content-type': 'application/json',
            'X-API-KEY': API_KEY
        }
    });
    const responseData = await response.json();



    renderMovies(responseData);
    checkLastPage(responseData);
    checkAmountPages(responseData);
    checkSearch(responseData);

    checkCorrectBtnClass();

    // console.log(responseData);
};


// ============================== ВЫВОД НА СТРАНИЦУ ===============================
// Отображаем элементы на странице
function renderMovies(data) {


    data.films.forEach(movie => {
        const movieEL = `				
                        <div class="movie-card" data-filmId="${movie.filmId}">

                        <div class="will-watch">
                            <button class="watch-later-btn" type="button"></button>
                        </div>

                        <div class="movie-rate">
                            <div class="rate ${getClassByRate(movie.rating)}">${(parseFloat(movie.rating))}</div>
                        </div>

                        <div class="movie-img">
                            <img src=${movie.posterUrlPreview} alt="${movie.nameRu}">
                        </div>

                        <div class="year-country">
                            <span class="country">${movie.countries.map((country) => ` ${country.country}`)} </span>
                            <span class="year">${movie.year}</span>
                        </div>

                        <h4 class="movie-title">${movie.nameRu}</h4>

                        <div class="movie-info">

                            <div class="movie-genres">
                                <span class="genre">${movie.genres.map((genre) => ` ${genre.genre}`)}</span>
                            </div>

                        </div>

                    </div>
                    `
        moviesHolderEL.insertAdjacentHTML('beforeend', movieEL);
    });

    currentPageEl.innerText = pageCounter;


};

// Отрисовуем рамку в зависимости от рейтинга 
function getClassByRate(rate) {


    if (rate === null || rate === undefined || rate === "null") {
        return 'hide';
    };


    if (rate >= 8 || parseInt(rate) >= 80) {
        return 'green';
    } else if (rate >= 6 || parseInt(rate) >= 60) {
        return 'orange';
    } else if (rate <= 4 || parseInt(rate) <= 40) {
        return 'red';
    };


};

function clearPage() {
    moviesHolderEL.innerHTML = '';

};

// ============================== ДОБАВЛЯЕМ_УДАЛЯЕМ ФИЛЬМЫ В СПИСОК ПРОСМОТРЕННО ===============================
async function getMoviesById(url) {
    const responseID = await fetch(url, {
        headers: {
            'Content-type': 'application/json',
            'X-API-KEY': API_KEY
        }
    });
    const responseDataID = await responseID.json();

    // console.log(responseDataID);
    myMovies.unshift(responseDataID);
};

async function checkMovieID(e) {

    const movieCard = e.target.closest('.movie-card');
    const WatchListBtn = e.target.classList.contains('watch-later-btn');
    const removeFromWatchListBtn = e.target.classList.contains('remove-from-watchlist');

    if (WatchListBtn && removeFromWatchListBtn === false) {
        const movieID = +movieCard.getAttribute('data-filmid');

        movieCard.querySelector('.watch-later-btn').classList.add('remove-from-watchlist');

        let checkArray = myMovies.find(i => i.kinopoiskId === movieID);
        if (!checkArray) {
            showNotifyGREEN();
            await getMoviesById(API_FILM_ID_DATA + movieID)
            saveToLocalStorage();
        } else {
            showNotifyORANGE();
        }


    } else if (removeFromWatchListBtn) {
        const movieID = +movieCard.getAttribute('data-filmid');

        movieCard.querySelector('.watch-later-btn').classList.remove('remove-from-watchlist');
        myMovies = myMovies.filter(i => i.kinopoiskId !== movieID);
        showNotifyRED();
        saveToLocalStorage();
    };
}

// Если нажата кнопка "буду смотреть"=======================================
// Добавить фильм в коллекцию
// Обойти массив "myMovies[]" > проверить есть ли там объект со значением свойств === movieID
// есть - выйти из функции

// Если нажата кнопка "не буду смотреть"=======================================
// Получить муви id той карточки по которой был клик
// Обойти массив "myMovies[]" > проверить есть ли там объект со значением свойств === movieID
// Если true - удалить из коллекции 

// kinopoiskId


// ============================== СОХРАНЯЕМ В Local storage ===============================
function saveToLocalStorage() {
    localStorage.setItem('movies', JSON.stringify(myMovies));
}


// ============================== (TOP POPULAR AWAIT) РАЗДЕЛЫ ===============================
// Получаем ссылку на коллекцию фильмов по разделам


async function getURLBySection(URL, e) {
    e.target.setAttribute('value', URL);
    currentURL = e.target.value;

    clearPage();
    getMovies(currentURL);
};

const headerEl = document.querySelector('header');
// Связываем кнопки и разделы 
async function checkButtons(e) {
    pageCounter = 1;
    pageSelectEl.value = 1;
    paginationCheck();
    checkInput();
    pagiFormEL.classList.remove('hide')
    watchlistBtn.classList.remove('btn-active');

    pagesDataEl.classList.remove('hide');
    paginationEL.classList.remove('hide');
    pagiFormEL.classList.remove('hide')

    const btnTop = e.target.classList.contains('top');
    const btnPopular = e.target.classList.contains('popular');
    const btnAwait = e.target.classList.contains('await');
    const btnActive = e.target.classList.contains('btn-active');

    if (btnTop && btnActive == false) {
        await getURLBySection(API_URL_TOP250, e);
        btnTopEl.classList.add('btn-active');
        btnPopularEl.classList.remove('btn-active');
        btnAwaitEl.classList.remove('btn-active');
    }
    else if (btnPopular && btnActive == false) {
        await getURLBySection(API_URL_POPULAR, e);
        btnTopEl.classList.remove('btn-active');
        btnPopularEl.classList.add('btn-active');
        btnAwaitEl.classList.remove('btn-active');
    }
    else if (btnAwait && btnActive == false) {
        await getURLBySection(API_URL_AWAIT, e);
        btnTopEl.classList.remove('btn-active');
        btnPopularEl.classList.remove('btn-active');
        btnAwaitEl.classList.add('btn-active');
    };

};

function checkCorrectBtnClass() {
    if (currentURL == API_URL_TOP250) {
        btnTopEl.classList.add('btn-active');
    } else if (currentURL == API_URL_AWAIT) {
        btnAwaitEl.classList.add('btn-active');
    } else if (currentURL == API_URL_POPULAR) {
        btnPopularEl.classList.add('btn-active');
    };
}


// ============================== ПАГИНАЦИЯ ===============================
function pagination(event) {

    if (event.target.classList == 'next') {
        pageCounter++;
        clearPage();
        getMovies(currentURL + pageCounter);
    } else if (event.target.classList == 'prev') {
        pageCounter--;
        clearPage();
        getMovies(currentURL + pageCounter)
    }
    paginationCheck();
    showPageNumber();
    checkInput();
};

// Получаем номер страницы из инпута и переходим на нее
function getPageNumber(e) {
    e.preventDefault();

    const chosenPage = parseInt(pageSelectEl.value);
    pageCounter = chosenPage;

    pageSubmitBtn.classList.add('btn-disable')
    pageSubmitBtn.innerText = ""

    clearPage();
    paginationCheck();
    showPageNumber();
    getMovies(currentURL + chosenPage);


    // console.log('getPageNumber START');
    // console.log('Select value :', pageSelectEl.value);
    // console.log('Current page :', pageCounter);
};

// Отобразить номер страницы в инпуте 
function showPageNumber() {
    let selectPage = parseInt(pageSelectEl.value);

    selectPage = pageCounter;
    pageSelectEl.value = selectPage;
};

// Отключаем возможность листать назад на 1 странице
function paginationCheck() {

    if (pageCounter <= 1) {
        prevPage.classList.add('disable');
    } else {
        prevPage.classList.remove('disable');

    };

};

// Отключаем возможность листать вперед на последней странице
function checkAmountPages(i) {
    if (pageCounter === i.pagesCount) {
        nextPage.classList.add('disable');
    } else {
        nextPage.classList.remove('disable');
    };

};

// Убираем возможность установить отрицательное количество страниц
function checkInput() {

    if (pageSelectEl.value < 1) {
        pageSelectEl.value = 1
    };

    if (+pageSelectEl.value === pageCounter) {
        pageSubmitBtn.classList.add('btn-disable')
        pageSubmitBtn.innerText = ""
    }
    else if (+pageSelectEl.value !== pageCounter) {
        pageSubmitBtn.classList.remove('btn-disable')
        pageSubmitBtn.innerText = "Go"
    }

};

// 
function checkLastPage(data) {

    if (pageSelectEl.value > data.pagesCount) {
        pageSelectEl.value = data.pagesCount;
        pageCounter = data.pagesCount;


        // console.log(currentURL);
        // console.log('select value', pageSelectEl.value);
        // console.log('page counter', pageCounter);
    };
    totalPagesEl.innerText = data.pagesCount;
}


// ============================== ПОИСК ===============================


function search(e) {
    e.preventDefault();

    if (inputEL.value) {
        clearPage();
        getMovies(API_URL_SEARCH + inputEL.value);
        watchlistBtn.classList.remove('btn-active');

    };
    inputEL.value = '';
    pageSelectEl.value = '';

    pagesDataEl.classList.add('hide');
    paginationEL.classList.add('hide');


    pagiFormEL.classList.add('hide')
    nextPage.classList.add('disable');
    btnTopEl.classList.remove('btn-active');
    btnPopularEl.classList.remove('btn-active');
    btnAwaitEl.classList.remove('btn-active');


};

// $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
function checkSearch(data) {
    if (data.films < 1) {
        // watchlistBtn.classList.add('btn-active');

        paginationEL.classList.remove('hide');
        pagiFormEL.classList.remove('hide')
        pagesDataEl.classList.remove('hide');
        btnTopEl.classList.remove('btn-active');
        btnPopularEl.classList.remove('btn-active');
        btnAwaitEl.classList.remove('btn-active');
        alert('Такого фильма нет 😒')

        pageSelectEl.value = pageCounter;
        getMovies(currentURL + pageCounter);
        // renderWatchList();
        // currentPageEl.innerText = pageCounter;

    }
};
// $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$



// ============================== ПОКАЗАТЬ УВЕДОМЛЕНИЕ ==================
function showNotifyRED() {
    new Notify({
        status: 'error',
        title: '',
        text: 'Movie removed',
        effect: 'slide',
        speed: 200,
        customClass: '',
        customIcon: '',
        showIcon: false,
        showCloseButton: true,
        autoclose: true,
        autotimeout: 2000,
        gap: 20,
        distance: 1,
        type: 3,
        position: 'right bottom'
    })
}
function showNotifyORANGE() {
    new Notify({
        status: 'warning',
        title: '',
        text: 'Movie already added',
        effect: 'slide',
        speed: 200,
        customClass: '',
        customIcon: '',
        showIcon: false,
        showCloseButton: true,
        autoclose: true,
        autotimeout: 2000,
        gap: 20,
        distance: 1,
        type: 3,
        position: 'right bottom'
    })
}
function showNotifyGREEN() {
    new Notify({
        status: 'success',
        title: '',
        text: 'Movie added',
        effect: 'slide',
        speed: 200,
        customClass: '',
        customIcon: '',
        showIcon: false,
        showCloseButton: true,
        autoclose: true,
        autotimeout: 2000,
        gap: 20,
        distance: 1,
        type: 3,
        position: 'right bottom'
    })
}

// ============================== СПИСОК ПРОСМОТРЕННЫХ ФИЛЬМОВ ==================

watchlistBtn.addEventListener('click', function () {
    renderWatchList();

    pagesDataEl.classList.add('hide');
    paginationEL.classList.add('hide');
    pagiFormEL.classList.add('hide')

    btnAwaitEl.classList.remove('btn-active');
    btnPopularEl.classList.remove('btn-active');
    btnTopEl.classList.remove('btn-active');

    watchlistBtn.classList.add('btn-active');


});

moviesHolderEL.addEventListener('click', function (e) {

    const removeBtn = e.target.hasAttribute('data-watchlist')

    if (removeBtn) {
        renderWatchList();
    }
})

function renderWatchList() {
    clearPage();

    myMovies.forEach(movie => {
        const movieEL = `				
                        <div class="movie-card" watch-list data-filmId="${movie.kinopoiskId}">

                        <div class="will-watch">
                            <button class="watch-later-btn remove-from-watchlist" data-watchlist type="button"></button>
                        </div>

                        <div class="movie-rate">
                            <div class="rate ${getClassByRate(movie.ratingKinopoisk)}">${movie.ratingKinopoisk}</div>
                        </div>

                        <div class="movie-img">
                            <img src=${movie.posterUrlPreview} alt="${movie.nameRu}">
                        </div>

                        <div class="movie-info">

                        <div class="year-country">
                            <span class="country">${movie.countries.map((country) => ` ${country.country}`)} </span>
                            <span class="year">${movie.year}</span>
                        </div>

                        <h4 class="movie-title">${movie.nameRu}</h4>


                        <div class="movie-genres">
                                <span class="genre">${movie.genres.map((genre) => ` ${genre.genre}`)}</span>
                        </div>

                        <div class="show-info">
                        <img src="./img/information-circle.svg" alt="Show info">
                        </div>
                        


                        <div class="movie-desc">
                            
                            <h4 class="original-title">${movie.nameOriginal}</h4>
                            
						    <p class="movie-desc-text">${movie.shortDescription}</p>
                            
                            <div class="rates">
                            
                                <div class="imdb-rate">
                                    <div class="rate-nubers">
                                        <img src="./img/imdb.svg" alt="IMDb rate">
                                        <span>${movie.ratingImdb}/10</span>
                                    </div>

                                    <div class="people-count">
                                        <span>${numbFormat.format(movie.ratingImdbVoteCount)}</span>
                                        <img src="./img/user-group.svg" alt="">
                                    </div>
						        </div>

                                <div class="tomato-rate">

                                    <div class="rate-nubers">
                                        <img src="./img/rotten-tomato.svg" alt="Rottem tomato rate">
                                        <span class="rate-count">${movie.ratingGoodReview}%</span>
                                    </div>
    
                                    <div class="people-count">
                                        <span>${numbFormat.format(movie.ratingGoodReviewVoteCount) * 10}</span>
                                        <img src="./img/user-group.svg" alt="">
                                    </div>
                                </div>

					        </div>

                            

					    </div>

                        </div>

                    </div>




                    
                    `
        moviesHolderEL.insertAdjacentHTML('beforeend', movieEL);
    });

}



