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
                createCarousel(arrayData, selectedCardIDGameSite); // Display all games in data-container
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
popularSign.innerHTML = '<i class="fa-solid fa-chart-line"></i>'; // Alternatíva


 


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
        window.open('./gamesite.html');
    };

    button.onclick = () => {
        selectedCardIDGameSite = item.ID;
        localStorage.setItem('selectedCardIDGameSite', selectedCardIDGameSite);
        console.log(`Selected card ID: ${selectedCardIDGameSite}`);
        window.open('./compare.html');
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
        console.error("No card ID found in localStorage.");
        return;
    }
    const selectedItem = arrayData.find(item => item.ID == selectedCardIDGameSite);

    if (selectedItem) {
        document.getElementById("generalInfoListReleaseDate").innerText = selectedItem["Release date"];
        document.getElementById("generalInfoListStoryTime").innerText = selectedItem.Story;
        document.getElementById("generalInfoListRatings").innerText = selectedItem.Rating;
        document.getElementById("gameName").innerText = selectedItem.Name;
        document.getElementById("gameNameText").innerText = selectedItem.Name;
    } else {
        console.error("Item with selected ID not found.");
    }
}

// Show specific requested info
function showRequestedData(infoType) {
    if (!selectedCardIDGameSite) {
        console.error("No card ID found in localStorage.");
        return;
    }

    const selectedItem = arrayData.find(item => item.ID == selectedCardIDGameSite);
    if (!selectedItem) {
        console.error("Item with selected ID not found.");
        return;
    }

    const infoPlace = document.getElementById("requestedInfoPlace");

    let content = "";

    switch (infoType) {
        case "Description":
            content = selectedItem.Description;
            break;
        case "Genres":
            content = selectedItem.Genres.join(", ");
            break;
        case "Price":
            content = `${selectedItem.Price[0].Platform} : ${selectedItem.Price[0].Price} > <a href="${selectedItem.Price[0].link}"  target="_blank">Buy now</a> <br>
            ${selectedItem.Price[1].Platform} : ${selectedItem.Price[1].Price} > <a href="${selectedItem.Price[1].link}"  target="_blank">Buy now</a> <br>
            ${selectedItem.Price[2].Platform} : ${selectedItem.Price[2].Price} > <a href="${selectedItem.Price[2].link}"  target="_blank">Buy now</a>`;
            break;
        case "Console":
            content = selectedItem.Console.join(", ");
            break;
        default:
            content = "Invalid selection.";
    }

    infoPlace.innerHTML = content;
}

// Initialize on page load
window.onload = function () {
    fetchJSON().then(() => {
        showGeneralInfo();
    });
};


// Function to handle genre filtering
function filterGamesByGenres() {
    const selectedGenres = [];
    // Get all checked checkboxes
    document.querySelectorAll('.filter-checkbox:checked').forEach(checkbox => {
        selectedGenres.push(checkbox.value);
    });

    // If no genres are selected, show all games
    if (selectedGenres.length === 0) {
        displayGames('data-container', arrayData);
        return;
    }

    // Filter games based on selected genres
    const filteredGames = arrayData.filter(game => {
        // Check if the game contains at least one of the selected genres
        return selectedGenres.some(genre => game.Genres.includes(genre));
    });

    // Display filtered games
    displayGames('data-container', filteredGames);
}

// Add event listeners to checkboxes
document.getElementById('dropdownMenu1').addEventListener('change', function (e) {
    if (e.target.classList.contains('filter-checkbox')) {
        filterGamesByGenres(); // Call the filter function when a checkbox is changed
    }
});

// Function to populate the dropdown with genres (this part is already in your code)
function populateDropdownWithGenres(dataArray, dropdownContainerId) {
    const dropdownContainer = document.getElementById(dropdownContainerId);
    if (!dropdownContainer) {
        console.error(`Dropdown container with ID "${dropdownContainerId}" not found!`);
        return;
    }

    // Extract unique genres
    const uniqueGenres = new Set();
    dataArray.forEach(item => {
        item.Genres.forEach(genre => uniqueGenres.add(genre.trim()));
    });

    // Clear existing dropdown content
    dropdownContainer.innerHTML = '';

    // Create list items dynamically
    uniqueGenres.forEach(genre => {
        const listItem = document.createElement('li');
        listItem.classList.add('dropdown-item');

        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.classList.add('filter-checkbox');
        checkbox.value = genre;

        label.appendChild(checkbox);
        label.append(` ${genre}`);

        listItem.appendChild(label);
        dropdownContainer.appendChild(listItem);
    });
}

// Call this function after fetching JSON data
fetchJSON().then(() => {
    populateDropdownWithGenres(arrayData, 'dropdownMenu1');
    // Display all games initially
    displayGames('data-container', arrayData);
});


// Get the range input and the span element where the value will be displayed
const rangeInput = document.getElementById('priceRange');
const curvalSpan = document.getElementById('curval');

// Function to update the current value
function updateCurrentValue() {
  const currentValue = rangeInput.value;
  curvalSpan.textContent = currentValue; // Update the text content of the curval span
}

// Add an event listener to the range input to update the value on change
rangeInput.addEventListener('input', updateCurrentValue());

// Initialize the span with the current value on page load
updateCurrentValue();
