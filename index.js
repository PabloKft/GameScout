const arrayData = []; // Initialize an empty array
let selectedCardIDCompare = 0;

function fetchJSON() {
    // Fetch the JSON file
    fetch('./index.json')
        .then(response => response.json()) // Parse the JSON response
        .then(data => {
            // Push all data into arrayData
            arrayData.push(...data); // Use spread operator to push all items into arrayData

            // Log the array to the console
            console.log(arrayData); 

            // Example: Display the data on the webpage
            displayData(arrayData);
        })
        .catch(error => console.error('Error loading the JSON file:', error));
}

// Function to display the data on the webpage
function displayData(dataArray) {
    const container = document.getElementById('data-container');
    if (!container) {
        console.error('No container with id "data-container" found!');
        return;
    }

    // Clear any existing content in the container
    container.innerHTML = '';

    // Loop through the data and create a card for each item
    dataArray.forEach(item => {
        const cardDiv = document.createElement('div');
        cardDiv.classList.add('card');
        cardDiv.style.width = '18rem';
        cardDiv.style.padding = '10px';
        cardDiv.style.borderRadius = "10px";
        cardDiv.style.margin = "10px";

        cardDiv.onclick = () => {
            selectedCardIDGameSite = item.ID; // Store the selected card ID
            localStorage.setItem('selectedCardID', selectedCardIDGameSite); // Save to localStorage
            console.log(`Selected card ID: ${selectedCardIDGameSite}`);
            window.open('https://pablokft.github.io/GameScout/gamesite.html', '_blank'); // Open index.html
        };

        // Create an image element
        const img = document.createElement('img');
        img.classList.add('card-img-top');
        img.src = item.Image || 'default-image.jpg'; // Use image URL from JSON, or a default
        img.alt = item.Name;
        img.style.borderRadius = "10px";

        // Create the card body
        const cardBody = document.createElement('div');
        cardBody.classList.add('card-body');

        // Create the card title
        const cardTitle = document.createElement('h5');
        cardTitle.classList.add('card-title');
        cardTitle.textContent = item.Name;
        cardTitle.style.fontWeight = "bold";

        // Create the card text for description or genres
        const cardGenres = document.createElement('p');
        cardGenres.classList.add('card-text');
        cardGenres.textContent = `${item.Genres[0]} | ${item.Genres[1]}`;

        // Create a button or link (optional)
        const cardButton = document.createElement('a');
        cardButton.classList.add('btn');
        cardButton.style.backgroundColor = '#91ff88';
        cardButton.style.color = 'rgb(0,0,0)';
        cardButton.style.border = "1px solid #141414";
        cardButton.textContent = 'Compare this game';

        cardButton.onmouseover = () => {
            cardButton.style.border = "1px solid white";
        };
        cardButton.onmouseleave = () => {
            cardButton.style.border = "1px solid #141414";
        };
        cardButton.onmousedown = () => {
            cardButton.style.color = "#3e8e41";
            cardButton.style.shadow = "0 5px #666";
            cardButton.style.transform = "translateY(4px)";
        };
        cardButton.onmouseup = () => {
            cardButton.style.color = "black";
            cardButton.style.shadow = "0 5px #666";
            cardButton.style.transform = "translateY(-0px)";
        };

        cardButton.onclick = () => {
            selectedCardID = item.ID; // Assuming the JSON has an 'ID' field for each card
            console.log(`Selected card ID: ${selectedCardIDCompare}`);
        };

        // Append all elements together
        cardBody.appendChild(cardTitle);
        cardBody.appendChild(cardGenres);
        cardBody.appendChild(cardButton);
        cardDiv.appendChild(img);
        cardDiv.appendChild(cardBody);

        // Append the card to the container
        container.appendChild(cardDiv);
    });
}

function unShowCards() {
    let cardsPlace = document.getElementById("data-container");
    cardsPlace.style.display = 'none';
}

// Filter and display data based on selected options
function filterAndDisplayData() {
    let dataToDisplay;

    if (selectedOptions.length === 0) {
        // If no genres are selected, display all data
        dataToDisplay = arrayData;
    } else {
        // Otherwise, filter the arrayData based on selectedOptions
        dataToDisplay = arrayData.filter(item => {
            return selectedOptions.some(option => item.Genres.includes(option));
        });
    }

    // Display the data (filtered or all)
    displayData(dataToDisplay);
}

// Filter checkboxes
const selectedOptions = [];

document.querySelectorAll('.filter-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', function () {
        if (this.checked) {
            // Add value to array if checked
            selectedOptions.push(this.value);
        } else {
            // Remove value from array if unchecked
            const index = selectedOptions.indexOf(this.value);
            if (index > -1) {
                selectedOptions.splice(index, 1);
            }
        }

        // Update the display based on selected options
        filterAndDisplayData();
        console.log(selectedOptions);
    });
});

// Fetch JSON data and display it initially
fetchJSON();

function showGeneralInfo() {
    const selectedCardIDGameSite = localStorage.getItem('selectedCardID'); // Get the selected card ID from localStorage
    arrayData.forEach(item => {
        console.log("Checking item:", item.ID);
        console.log("Checking item:", selectedCardIDGameSite); // Log each item in arrayData
        if (item.ID == selectedCardIDGameSite) {
            console.log("Match found for ID:", selectedCardIDGameSite); // Log when a match is found
            document.getElementById("generalInfoListReleaseDate").innerText = item["Release date"];
            document.getElementById("generalInfoListStoryTime").innerText = item.Story;
            document.getElementById("generalInfoListRatings").innerText = item.Rating;
            document.getElementById("gameName").innerText = item.Name;
        }
    });
}

window.onload = function() {
    showGeneralInfo(); // Call to show general info when the page loads
}

function showRequestedData(type) {
    console.log("Requested type:", type); // Log the requested type
    const selectedCardIDGameSite = localStorage.getItem('selectedCardID'); // Get the selected card ID from localStorage
    arrayData.forEach(item => {
        console.log("Checking item:", item.ID);
        console.log("Checking item:", selectedCardIDGameSite); // Log each item in arrayData
        if (item.ID == selectedCardIDGameSite) {
            console.log("Match found for ID:", selectedCardIDGameSite); // Log when a match is found
            let place = document.getElementById("requestedInfoPlace");
            if (type === "Prices" && Array.isArray(item.Price) && item.Price.length > 0) {
                let priceHTML = '<ul class="price-list">';
                item.Price.forEach(priceInfo => {
                    console.log('Price info:', priceInfo); // Log to see the structure of priceInfo
                    priceHTML += `<li>${priceInfo.Platform}: ${priceInfo.Price} - <a href="${priceInfo.link}" target="_blank">Buy Now</a></li>`;
                });
                priceHTML += '</ul>';
                place.innerHTML = priceHTML; // Set the innerHTML to the constructed string
            }
            else if (type === "Genres" && Array.isArray(item.Genres)) {
                let genreHTML = '<div>';
                item.Genres.forEach(Genre => {
                    console.log('Genre:', Genre);
                    genreHTML += `<span class="genreCard">${Genre}</span> `;
                });
                genreHTML += `</div>`;

                place.innerHTML = genreHTML; // Set the innerHTML to the constructed string
            }
            else if (type === "Description") {
                let descHTML = `<div class="Desc">${item.Description}</div>`;
                place.innerHTML = descHTML; // Set the innerHTML to the constructed string
            }
            else if (type === "Console") {
                let consoleHTML = '<div>';
                item.Console.forEach(Cons => {
                    console.log('Console:', Cons);
                    consoleHTML += `<span class="ConsoleCard">${Cons}</span> `;
                });
                consoleHTML += `</div>`;

                place.innerHTML = consoleHTML; // Set the innerHTML to the constructed string
            }
        }
    });
}
