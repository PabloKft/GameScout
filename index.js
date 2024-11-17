let arrayData = [];
let selectedCardIDGameSite = localStorage.getItem('selectedCardIDGameSite') || null;

// Fetch JSON data and store it in arrayData
function fetchJSON() {
    return fetch('./index.json')
        .then(response => response.json())
        .then(data => {
            arrayData = data; // Populate arrayData with the fetched data
            console.log('Data fetched successfully:', arrayData);

            // Populate the data-container with all games
            if (document.getElementById('data-container')) {
                displayGames('data-container', arrayData); // Display all games in data-container
            }

            if (document.getElementById('carouselPlace')) {
               createCarousel(arrayData,selectedCardIDGameSite) ; // Display all games in data-container
            }

            // Populate sale and popular games containers if they exist
            if (document.getElementById('sale-games-container')) {
                displayGames('sale-games-container', filterSaleGames(arrayData));
            }
            if (document.getElementById('popular-games-container')) {
                displayGames('popular-games-container', filterPopularGames(arrayData, 4));
            }
        })
        .catch(error => console.error('Error loading the JSON file:', error));
}

function createCarousel(data, selected) {
    const carPlace = document.getElementById("carouselPlace");
    const thumbnailContainer = document.querySelector(".thumbnail-container");

    const selectedGame = data.find(game => game.ID == selected);
    if (!selectedGame) {
        console.error("Selected game not found.");
        return;
    }

    const images = selectedGame.Image; 
    if (!images || images.length === 0) {
        console.error("No images found for the selected game.");
        return;
    }

    carPlace.innerHTML = "";
    thumbnailContainer.innerHTML = "";

    images.forEach((imageSrc, index) => {
        const carouselItem = document.createElement("div");
        carouselItem.classList.add("carousel-item");

        if (index === 0) {
            carouselItem.classList.add("active");
        }

        
        const img = document.createElement("img");
        img.classList.add("d-block", "w-100");
        img.src = imageSrc; 
        img.alt = selectedGame.Name; 

        carouselItem.appendChild(img);

        carPlace.appendChild(carouselItem);

        const thumbnail = document.createElement("img");
        thumbnail.classList.add("thumbnail");
        thumbnail.src = imageSrc; 
        thumbnail.alt = `${selectedGame.Name} thumbnail ${index + 1}`; 
        thumbnail.setAttribute("data-bs-target", "#carouselExampleAutoplaying");
        thumbnail.setAttribute("data-bs-slide-to", index);

        thumbnailContainer.appendChild(thumbnail);
    });
}




// Function to filter popular games
function filterPopularGames(dataArray, max) {
    return dataArray.sort((a, b) => b.ClickCount - a.ClickCount).slice(0, max);
}

// Function to filter games on sale
function filterSaleGames(dataArray) {
    return dataArray
        .filter(item => item.Sale[0].IsOnSale === true)
        .sort((a, b) => b.Sale[0].Amount - a.Sale[0].Amount || b.ClickCount - a.ClickCount)
        .slice(0, 4);
}

// Reusable function to create cards
function createCard(item, topEightPopularGames) {
    const cardDiv = document.createElement('div');
    cardDiv.classList.add('card');

    const img = document.createElement('img');
    img.classList.add('card-img');
    img.src = item.Image[0] || 'default-image.jpg';
    img.alt = item.Name;

    const saleSign = document.createElement('div');
    saleSign.classList.add('card-saleSign');
    saleSign.textContent = "%";

    const popularSign = document.createElement('div');
    popularSign.classList.add('card-popularSign');
    popularSign.textContent = '!';

    const gameName = document.createElement('h5');
    gameName.classList.add('card-gameName');
    if (item.Name.length > 18) {
        gameName.textContent = item.Name.slice(0, 15) + "...";
    } else {
        gameName.textContent = item.Name;
    }

    const genres = document.createElement('p');
    genres.classList.add('card-genres');
    genres.textContent = `${item.Genres[0]} | ${item.Genres[1]}`;

    const button = document.createElement('a');
    button.classList.add('card-button');
    button.textContent = 'Compare this game';

    // Add signs conditionally
    if (item.Sale[0].IsOnSale) {
        cardDiv.appendChild(saleSign);
    }

    if (topEightPopularGames.some(game => game.ID === item.ID)) {
        cardDiv.appendChild(popularSign);
    }

    cardDiv.appendChild(img);
    cardDiv.appendChild(gameName);
    cardDiv.appendChild(genres);
    cardDiv.appendChild(button);

    // Add event listener for card click
    cardDiv.onclick = () => {
        selectedCardIDGameSite = item.ID;
        localStorage.setItem('selectedCardIDGameSite', selectedCardIDGameSite);
        console.log(`Selected card ID: ${selectedCardIDGameSite}`);
        window.open('./gamesite.html', '_blank');
    };

    button.onclick = () => {
        selectedCardIDGameSite = item.ID;
        localStorage.setItem('selectedCardIDGameSite', selectedCardIDGameSite);
        console.log(`Selected card ID: ${selectedCardIDGameSite}`);
        window.open('./compare.html', '_blank');
    };

    return cardDiv;
}

// Function to display games in a container
function displayGames(containerId, gamesArray) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`No container with id "${containerId}" found!`);
        return;
    }

    // Clear any existing content in the container
    container.innerHTML = '';

    // Compute top 8 popular games (if necessary for highlighting)
    const topEightPopularGames = filterPopularGames(arrayData, 8);

    // Create and append cards for each game
    gamesArray.forEach(item => {
        const card = createCard(item, topEightPopularGames);
        container.appendChild(card);
    });
}

// Display general info on a dedicated page
function showGeneralInfo() {
    if (!selectedCardIDGameSite) {
        console.error('No card ID found in localStorage.');
        return;
    }
    const selectedItem = arrayData.find(item => item.ID == selectedCardIDGameSite);

    if (selectedItem) {
        document.getElementById("generalInfoListReleaseDate").innerText = selectedItem["Release date"];
        document.getElementById("generalInfoListStoryTime").innerText = selectedItem.Story;
        document.getElementById("generalInfoListRatings").innerText = selectedItem.Rating;
        document.getElementById("gameName").innerText = selectedItem.Name;
        document.getElementById("gameNameText").innerText = selectedItem.Name;

        console.log('Displayed data for:', selectedItem);
    } else {
        console.error('Item with selected ID not found.');
    }
}

// Set up window onload to ensure data is ready before showing info
window.onload = function () {
    fetchJSON().then(() => {
        if (document.getElementById("generalInfoListReleaseDate")) {
            showGeneralInfo();
        }
    });
};
