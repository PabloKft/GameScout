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



// Function to populate the dropdown with genres (this part is already in your code)

/*
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
    uniqueConsoles.forEach(console => {
        const listItem = document.createElement('li');
        listItem.classList.add('dropdown-item');

        // Create the label element
        const label = document.createElement('label');
        label.classList.add('checkbox-label');  // Add the correct class for styling

        // Create the checkbox input element
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.classList.add('checkbox-input', 'filter-checkbox');  // Add the correct classes
        checkbox.value = console;

        // Create the custom checkbox container
        const customCheckbox = document.createElement('span');
        customCheckbox.classList.add('custom-checkbox');

        // Attach the checkbox input and the custom checkbox to the label
        label.appendChild(checkbox);
        label.appendChild(customCheckbox);
        label.append(` ${console}`);

        // Append the label to the list item
        listItem.appendChild(label);

        // Finally, append the list item to the dropdown container
        dropdownContainer.appendChild(listItem);

    });
}
*/

// Call this function after populating the dropdown with genres
fetchJSON().then(() => {
    populateDropdownWithGenres(arrayData, 'dropdownMenu1');
    populateDropdownWithConsoles(arrayData, 'dropdownMenu4');
    displayGames('data-container', arrayData);
    setupGenreCheckboxListeners(); // Setup event listeners for genre checkboxes
    setupConsoleCheckboxListeners();
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


//Szűrők funkcionalitása


let selectedGenres = new Set();
let selectedConsoles = new Set();
let selectedRating = 5; // Default to "Mostly Positive"

let selectedPrice = 70;  // Default price
let selectedReleaseDate = 2024;  // Default release year
let selectedStoryTime = 100; // Default value for story time range (can be changed)

// Update the price display dynamically when the slider is adjusted
document.getElementById('priceRange').addEventListener('input', function () {
    selectedPrice = this.value;
    document.getElementById('curvalPrice').textContent = `$${selectedPrice}`;
    filterGames();  // Apply the filter after the slider update
});

// Update the release year filter dynamically when the range input is adjusted
// Update the release year filter dynamically when the range input is adjusted
document.getElementById('dateRange').addEventListener('input', function () {
    selectedReleaseDate = this.value;
    document.getElementById('curvalDate').textContent = `${selectedReleaseDate}`;
    filterGames();  // Apply the filter after the slider update
});


const ratings = [
    "Overwhelmingly Negative",
    "Very Negative",
    "Negative",
    "Mostly Negative",
    "Mixed",
    "Mostly Positive",
    "Positive",
    "Very Positive",
    "Overwhelmingly Positive"
];

// Update rating display when the slider changes
document.getElementById('ratingRange').addEventListener('input', function () {
    selectedRating = this.value;
    const ratingDisplay = document.getElementById('curvalRating');
    ratingDisplay.textContent = ratings[selectedRating - 1];
    filterGames();  // Apply filter when rating is changed
});

document.getElementById('storyRange').addEventListener('input', function () {
    selectedStoryTime = this.value;
    const storyDisplay = document.getElementById('curvalStory');
    storyDisplay.textContent = `${selectedStoryTime} hours`;
    filterGames();  // Apply filter when story time is changed
});
  
// Filter games based on selected genres, consoles, price, release date, and story time
function filterGames() {
    let filteredGames = arrayData;

    // Filter by genres if any are selected
    if (selectedGenres.size > 0) {
        filteredGames = filteredGames.filter(game =>
            Array.from(selectedGenres).every(selectedGenre =>
                game.Genres.includes(selectedGenre.trim())
            )
        );
    }

    // Filter by consoles if any are selected
    if (selectedConsoles.size > 0) {
        filteredGames = filteredGames.filter(game =>
            Array.from(selectedConsoles).every(selectedConsole =>
                game.Console.includes(selectedConsole.trim())
            )
        );
    }

    // Filter by price range
    const freeGames = filteredGames.filter(game =>
        game.Price.some(priceObj => priceObj.Price === "Free to Play")
    );
    const paidGames = filteredGames.filter(game =>
        game.Price.some(priceObj => {
            const price = parseFloat(priceObj.Price.replace('$', '').replace(',', ''));
            return !isNaN(price) && price <= selectedPrice;
        })
    );

    // Combine free games with the filtered paid games
    filteredGames = [...freeGames, ...paidGames];

    // Filter by release date and compare the release year with selectedReleaseDate
    filteredGames = filteredGames.filter(game => {
        // Parse the release date into a Date object (e.g., dd.mm.yyyy format)
        const releaseDateParts = game['Release date'].split('.'); // Split by dot to get [dd, mm, yyyy]
        const releaseYear = parseInt(releaseDateParts[2], 10); // Get the year part

        return releaseYear >= selectedReleaseDate;  // Compare the release year with selectedReleaseDate
    });

    filteredGames = filteredGames.filter(game => {
        // Parse the release date into a Date object (e.g., dd.mm.yyyy format)
        const releaseDateParts = game['Release date'].split('.'); // Split by dot to get [dd, mm, yyyy]
        const releaseYear = parseInt(releaseDateParts[2], 10); // Get the year part

        // Only show games released after the selected year
        return releaseYear >= selectedReleaseDate;  // Compare with the selected year
    });

    // Filter by rating: Use the selectedRating value to filter the games
    filteredGames = filteredGames.filter(game => {
        const ratingText = game.Rating.split('(')[0].trim();  // Extract "Mostly Positive" from "Mostly Positive (650,000+)"
        const gameRatingIndex = ratings.indexOf(ratingText);
        return gameRatingIndex >= (selectedRating - 1);
    });

    filteredGames = filteredGames.filter(game => {
        const story = game.Story;

        console.log(`Checking story for game "${game.Name}": ${story}`);

        // If the story is "No story", include it
        if (story === "No story") {
            console.log(`Game "${game.Name}" has no story. Included.`);
            return true;  // Always include games with "No story"
        }

        // If the story is a range (e.g., "50-70 hours")
        if (story.includes('-')) {
            const [minHours, maxHours] = story.split('-').map(s => {
                return parseInt(s.replace(' hours', '').trim());  // Remove "hours" and convert to integer
            });

            console.log(`Story range for "${game.Name}": ${minHours}-${maxHours}`);

            // Include the game if the maximum story hours are less than or equal to the selected value
            return maxHours <= selectedStoryTime;
        }

        // If the story is a single number (e.g., "50 hours"), we strip "hours" and compare
        const hours = parseInt(story.replace(' hours', '').trim());

        console.log(`Story time for "${game.Name}": ${hours}`);

        return hours <= selectedStoryTime;  // Include if the story hours are less than or equal to the selected value
    });

    // Log after filtering by story time
    console.log("After story time filter:", filteredGames);

    // Display filtered games
    displayGames('data-container', filteredGames);
}





// Attach event listeners to genre checkboxes
function setupGenreCheckboxListeners() {
    const checkboxesGenres = document.querySelectorAll('.filter-checkbox-genres');
    checkboxesGenres.forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            if (this.checked) {
                selectedGenres.add(this.value); // Add selected genre to the set
            } else {
                selectedGenres.delete(this.value); // Remove unselected genre
            }
            filterGames(); // Apply combined filters
        });
    });
}

function setupConsoleCheckboxListeners() {
    const checkboxesConsoles = document.querySelectorAll('.filter-checkbox-consoles');

    checkboxesConsoles.forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            console.log(`Checkbox changed: ${this.value}, Checked: ${this.checked}`);
            if (this.checked) {
                selectedConsoles.add(this.value); // Add selected console to the set
            } else {
                selectedConsoles.delete(this.value); // Remove unselected console
            }
            filterGames(); // Apply combined filters
        });
    });
}



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

        // Create the label element
        const label = document.createElement('label');
        label.classList.add('checkbox-label');  // Add the correct class for styling

        // Create the checkbox input element
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.classList.add('checkbox-input', 'filter-checkbox-genres');  // Add the correct classes
        checkbox.value = genre;

        // Create the custom checkbox container
        const customCheckbox = document.createElement('span');
        customCheckbox.classList.add('custom-checkbox');

        // Attach the checkbox input and the custom checkbox to the label
        label.appendChild(checkbox);
        label.appendChild(customCheckbox);
        label.append(` ${genre}`);

        // Append the label to the list item
        listItem.appendChild(label);

        // Finally, append the list item to the dropdown container
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
        item.Console.forEach(console => uniqueConsoles.add(console.trim()));
    });

    // Clear existing dropdown content
    dropdownContainer.innerHTML = '';

    // Create list items dynamically
    uniqueConsoles.forEach(console => {
        const listItem = document.createElement('li');
        listItem.classList.add('dropdown-item');

        // Create the label element
        const label = document.createElement('label');
        label.classList.add('checkbox-label');  // Add the correct class for styling

        // Create the checkbox input element
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.classList.add('checkbox-input', 'filter-checkbox-consoles');  // Add the correct classes
        checkbox.value = console;

        // Create the custom checkbox container
        const customCheckbox = document.createElement('span');
        customCheckbox.classList.add('custom-checkbox');

        // Attach the checkbox input and the custom checkbox to the label
        label.appendChild(checkbox);
        label.appendChild(customCheckbox);
        label.append(` ${console}`);

        // Append the label to the list item
        listItem.appendChild(label);

        // Finally, append the list item to the dropdown container
        dropdownContainer.appendChild(listItem);

    });
}