
const apiBase = "https://api.astroworldmc.com/api/v1";

const itemGrid = document.querySelector("#item-grid");
const resultsStatus = document.querySelector("#results-status");
const detailContent = document.querySelector("#detail-content");
const resultsHeading = document.querySelector("#results-heading");
const searchForm = document.querySelector("#form");
const searchInput = document.querySelector("#search-input");
const categoryButtons = document.querySelectorAll("[data-category]");

let currentCategory = "mobs";
let allEntries = [];

async function loadCategory(category) {
    allEntries = [];
    currentCategory = category;
    searchInput.value = "";

    categoryButtons.forEach(button => {
        button.setAttribute(
            "aria-pressed",
            button.dataset.category === category
        );
    });

    resultsHeading.textContent =
        category.charAt(0).toUpperCase() + category.slice(1);

    resultsStatus.textContent = `Loading ${category}...`;
    itemGrid.innerHTML = "";
    detailContent.innerHTML = "<p>Select an entry to view its details. </p>";

    try {
        const response = await fetch(`${apiBase}/${category}`);

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const result = await response.json();

        allEntries = result.data;

        displayEntries(allEntries);



    } catch (error) {
        resultsStatus.textContent = `Unable to load ${category}.`;
        console.error(error);
    }
}

function displayEntries(entries) {
    itemGrid.innerHTML = "";

    resultsStatus.textContent = 
        `Showing ${entries.length} ${currentCategory}`;
    
    entries.forEach(entry => {
        const listItem = document.createElement("li");
        const button = document.createElement("button");

     const name = document.createElement("span");
        name.textContent = entry.name;

        button.appendChild(name);

        button.addEventListener("click", () => {
            displayDetails(entry);
        });

        listItem.appendChild(button);
        itemGrid.appendChild(listItem);
    });
}

function searchEntries(searchTerm) {
    const filteredEntries = allEntries.filter(entry =>
        entry.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    displayEntries(filteredEntries);

    if (searchTerm === "") {
        resultsStatus.textContent = 
            `Showing all ${currentCategory}`;
    } else {
        resultsStatus.textContent = 
            `Found ${filteredEntries.length} matching ${currentCategory}`;
    }

}

function addDetail(label, value, type = "info") {
    if(value === null || value === undefined || value === "") {
        return;
    }

    const paragraph = document.createElement("p");

    let displayValue = value;

    if(Array.isArray(value)) {
        displayValue = value.join(", ");
    } else if (typeof value === "object") {
        displayValue = JSON.stringify(value);
    }

    const container = document.createElement("div");
    container.classList.add("detail-item", type);

    const heading = document.createElement("span");
    heading.classList.add("detail-label");
    heading.textContent = `${label}:`;

    const content = document.createElement("span");
    content.classList.add("detail-value");
    content.textContent = displayValue;

    container.appendChild(heading);
    container.appendChild(content);

    detailContent.appendChild(container);
}

function displayDetails(entry) {
    detailContent.innerHTML = "";

    const name = document.createElement("h3");
    name.textContent = entry.name;
    detailContent.appendChild(name);

    if(currentCategory === "mobs") {
        addDetail("Type", entry.type, "stat");

        if (entry.hp !== null && entry.hp !== undefined) {
            addDetail("Health", `${entry.hp} HP`, "stat");
        }

        addDetail("Behavior", entry.behavior, "stat");
        addDetail("Spawn biomes", entry.spawnBiomes);
        addDetail("Weaknesses", entry.weaknesses);
       
    }

    else if (currentCategory === "items") {
        addDetail("Category", entry.category, "stat");
        addDetail("Description", entry.description);
        addDetail("Stack size", entry.stackSize, "stat");
        addDetail("Durability", entry.durability, "stat");
        addDetail("Obtained by", entry.obtainedBy);
    }

    else if (currentCategory === "biomes") {
        addDetail("Dimension", entry.dimension, "stat");
        addDetail("Category", entry.category);
        addDetail("Temperature", entry.temperature, "stat");
        addDetail("Precipitation", entry.precipitation, "stat");
        addDetail("Terrain features", entry.terrainFeatures);
        addDetail("Unique blocks", entry.uniqueBlocks);
    }

    else if (currentCategory === "enchantments") {
        addDetail("Category", entry.category, "stat");
        addDetail("Description", entry.description);
        addDetail("Maximum level", entry.maxLevel, "stat");
        addDetail("Applicable items", entry.applicableItems);
        addDetail("Obtained from", entry.obtainedFrom);
    
    }
}

categoryButtons.forEach(button => {
    button.addEventListener("click", () => {
        loadCategory(button.dataset.category);
    });
});

searchForm.addEventListener("submit", event => {
    event.preventDefault();
    searchEntries(searchInput.value.trim());
});


loadCategory("mobs");
