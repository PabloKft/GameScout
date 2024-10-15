let arrayData = [];
let selectedCardIDGameSite = localStorage.getItem('selectedCardIDGameSite') || null;

// Fetch JSON data and store it in arrayData
function fetchJSON() {
    return fetch('./index.json')
        .then(response => response.json())
        .then(data => {
            arrayData = data;
            console.log('Data fetched successfully:', arrayData);
            // Call displayData here if it's the page displaying the cards
            if (document.getElementById('data-container')) {
                displayData(arrayData);
            }
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
            selectedCardIDGameSite = item.ID;
            localStorage.setItem('selectedCardIDGameSite', selectedCardIDGameSite);
            console.log(`Selected card ID: ${selectedCardIDGameSite}`);
            window.open('index.html', '_blank');
        };

        const img = document.createElement('img');
        img.classList.add('card-img-top');
        img.src = item.Image || 'default-image.jpg';
        img.alt = item.Name;
        img.style.borderRadius = "10px";

        const cardBody = document.createElement('div');
        cardBody.classList.add('card-body');

        const cardTitle = document.createElement('h5');
        cardTitle.classList.add('card-title');
        cardTitle.textContent = item.Name;
        cardTitle.style.fontWeight = "bold";

        const cardGenres = document.createElement('p');
        cardGenres.classList.add('card-text');
        cardGenres.textContent = `${item.Genres[0]} | ${item.Genres[1]}`;

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

        cardButton.onclick = (e) => {
            e.stopPropagation();
            selectedCardIDGameSite = item.ID;
            localStorage.setItem('selectedCardIDGameSite', selectedCardIDGameSite);
            console.log(`Selected card ID: ${selectedCardIDGameSite}`);
            window.location.href = 'index.html';
        };

        cardBody.appendChild(cardTitle);
        cardBody.appendChild(cardGenres);
        cardBody.appendChild(cardButton);
        cardDiv.appendChild(img);
        cardDiv.appendChild(cardBody);

        container.appendChild(cardDiv);
    });
}

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

        console.log('Displayed data for:', selectedItem);
    } else {
        console.error('Item with selected ID not found.');
    }
}

// Set up window onload to ensure data is ready before showing info
window.onload = function() {
    fetchJSON().then(() => {
        if (document.getElementById("generalInfoListReleaseDate")) {
            showGeneralInfo();
        }
    });
};

// Function to handle displaying requested data like Prices, Genres, etc.
function showRequestedData(type) {
    const selectedCardIDGameSite = localStorage.getItem('selectedCardIDGameSite');
    const selectedItem = arrayData.find(item => item.ID == selectedCardIDGameSite);
    const place = document.getElementById("requestedInfoPlace");

    if (selectedItem && place) {
        if (type === "Prices" && Array.isArray(selectedItem.Price) && selectedItem.Price.length > 0) {
            let priceHTML = '<ul class="price-list">';
            selectedItem.Price.forEach(priceInfo => {
                priceHTML += `<li>${priceInfo.Platform}: ${priceInfo.Price} - <a href="${priceInfo.link}" target="_blank">Buy Now</a></li>`;
            });
            priceHTML += '</ul>';
            place.innerHTML = priceHTML;
        } else if (type === "Genres" && Array.isArray(selectedItem.Genres)) {
            let genreHTML = '<div>';
            selectedItem.Genres.forEach(genre => {
                genreHTML += `<span class="genreCard">${genre}</span> `;
            });
            genreHTML += `</div>`;
            place.innerHTML = genreHTML;
        } else if (type === "Description") {
            place.innerHTML = `<div class="Desc">${selectedItem.Description}</div>`;
        } else if (type === "Console" && Array.isArray(selectedItem.Console)) {
            let consoleHTML = '<div>';
            selectedItem.Console.forEach(console => {
                consoleHTML += `<span class="ConsoleCard">${console}</span> `;
            });
            consoleHTML += `</div>`;
            place.innerHTML = consoleHTML;
        } else {
            place.innerHTML = 'No data available for this section.';
        }
    }
}
