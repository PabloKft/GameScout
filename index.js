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
    saleSign.innerHTML = '<i class="fa-solid fa-tag fa-flip-vertical"></i>';

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
            content = `<div class="description">${selectedItem.Description}</div>`;
            break;
        case "Genres":
            content = `<div class="genres">` + 
                      selectedItem.Genres.map(genre => `<span class="genre-item">${genre}</span>`).join("") +
                      `</div>`;
            break;
        case "Price":
            content = `
                <div class="prices">
                    ${selectedItem.Price.map(price => `
                        <div class="price-item">
                            <span class="platform">${price.Platform}:</span>
                            <span class="price">${price.Price}</span>
                            <a href="${price.link}" target="_blank" class="buy-link">Buy now</a>
                        </div>
                    `).join("")}
                </div>`;
            break;
        case "Console":
            content = `<div class="consoles">` + 
                      selectedItem.Console.map(console => `<span class="console-item">${console}</span>`).join("") +
                      `</div>`;
            break;
        default:
            content = `<div class="error">Invalid selection.</div>`;
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

function populateDropdownWithConsoles(dataArray, dropdownContainerId) {
    const dropdownContainer = document.getElementById(dropdownContainerId);
    if (!dropdownContainer) {
        console.error(`Dropdown container with ID "${dropdownContainerId}" not found!`);
        return;
    }

    // Extract unique genres
    const uniqueConsoles = new Set();
    dataArray.forEach(item => {
        item.Console.forEach(genre => uniqueConsoles.add(genre.trim()));
    });

    // Clear existing dropdown content
    dropdownContainer.innerHTML = '';

    // Create list items dynamically
    uniqueConsoles.forEach(genre => {
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
    populateDropdownWithConsoles(arrayData, 'dropdownMenu4');
    // Display all games initially
    displayGames('data-container', arrayData);
});

function showValue() {
    const rangeInput = document.getElementById('priceRange');
    const curvalSpan = document.getElementById('curvalStory');
    const curval = rangeInput.value;
    curvalSpan.textContent = curval;

    // Filter games where Story time is less than curval
    const filteredGames = arrayData.filter(game => game.Story < curval);

    // Display or process the filtered games as needed

    displayGames('data-container', filteredGames); // Return the filtered array if needed
}

function showDate() {
    const rangeInput = document.getElementById('dateRange');
    const curvalSpan = document.getElementById('curvalDate');
    const curval = rangeInput.value; // Assuming the range input is a year (e.g., "2018")
    curvalSpan.textContent = curval;

    // Filter games where "Release date" is earlier than the selected year
    const filteredGames = arrayData.filter(game => {
        const releaseDate = new Date(game["Release date"]); // Parse the release date
        const rangeDate = new Date(curval, 0, 1); // Create a date object for January 1st of the selected year
        return releaseDate < rangeDate; // Check if the release date is earlier
    });

    displayGames('data-container', filteredGames); // Return the filtered array if needed

}


// Get the range input and the span element where the value will be displayed

// Global filters object to track filter states
let filters = {
    genres: [],
    consoles: [],
    storyLength: null,
    releaseDate: null,
};

// Unified filter function
// Unified filter function
// Modify the unified filter function to include the price filter
function applyFilters() {
    let filteredGames = [...arrayData]; // Start with all games

    // Apply genre filter if any genres are selected
    if (filters.genres.length > 0) {
        filteredGames = filteredGames.filter(game =>
            filters.genres.some(genre => game.Genres.includes(genre))
        );
    }

    // Apply console filter if any consoles are selected
    if (filters.consoles.length > 0) {
        filteredGames = filteredGames.filter(game =>
            filters.consoles.some(console => game.Console.includes(console))
        );
    }

    // Apply story length filter if a value is set
    if (filters.storyLength !== null) {
        filteredGames = filteredGames.filter(game => parseInt(game.Story) <= filters.storyLength);
    }

    // Apply release date filter if a value is set
    if (filters.releaseDate !== null) {
        const rangeDate = new Date(filters.releaseDate, 0, 1); // Create date object for the selected year
        filteredGames = filteredGames.filter(game => new Date(game["Release date"]) < rangeDate);
    }

    // Apply price filter if a value is set
    if (filters.price !== null) {
        filteredGames = filteredGames.filter(game =>
            game.Price.some(priceEntry => parseFloat(priceEntry.Price.replace('$', '')) <= filters.price)
        );
    }

    // Display the filtered games
    displayGames('data-container', filteredGames);
}


// Event listener for genre checkboxes
document.getElementById('dropdownMenu1').addEventListener('change', function (e) {
    if (e.target.classList.contains('filter-checkbox')) {
        // Update selected genres
        filters.genres = Array.from(document.querySelectorAll('.filter-checkbox:checked'))
            .map(checkbox => checkbox.value);
        applyFilters();
    }
});

document.getElementById('dropdownMenu4').addEventListener('change', function (e) {
    if (e.target.classList.contains('filter-checkbox')) {
        // Update selected genres
        filters.consoles = Array.from(document.querySelectorAll('.filter-checkbox:checked'))
            .map(checkbox => checkbox.value);
        applyFilters();
    }
});

// Event listener for story length range input
document.getElementById('priceRange').addEventListener('change', function () {
    const curvalSpan = document.getElementById('curvalStory');
    filters.storyLength = parseInt(this.value, 10);
    curvalSpan.textContent = this.value; // Update UI display
    applyFilters();
});

// Event listener for release date range input
document.getElementById('dateRange').addEventListener('change', function () {
    const curvalSpan = document.getElementById('curvalDate');
    filters.releaseDate = this.value; // Set selected year
    curvalSpan.textContent = this.value; // Update UI display
    applyFilters();
});

// Event listener for price range input
document.getElementById('priceRange').addEventListener('change', function () {
    const selectedPrice = parseFloat(this.value); // Get the selected price from the slider
    const curvalSpan = document.getElementById('curvalDate');
    curvalSpan.textContent = `$${selectedPrice}`; // Update UI to show selected price

    // Update the global filters
    filters.price = selectedPrice;

    // Apply filters
    applyFilters();
});

// Example: Setting the title dynamically
window.addEventListener("DOMContentLoaded", function () {
    // Determine the context of the page
    const pageType = document.body.dataset.page; // Use a data attribute in the <body> for page context

    switch (pageType) {
        case "game-details":
            const gameName = document.getElementById("gameName").textContent || "Game Details";
            document.title = `Details about ${gameName}`;
            break;

        case "home":
            document.title = "GameScout - Home";
            break;

        case "gamesite":
            document.title = "GameScout - Compare Games";
            break;

        default:
            document.title = "GameScout";
    }
});


document.addEventListener("DOMContentLoaded", function () {
    const currentPage = document.body.getAttribute("data-page");

    if (currentPage === "compare") {
        document.title = "Compare Games - GameScout";
    }
});