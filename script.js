const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");

const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");

let oldTab = userTab;
const API_KEY = "d201d31de429e3ae541ac87b5e523642";
oldTab.classList.add("current-tab");
getfromSessionStorage();

function switchTab(newTab) {
    if(newTab != oldTab) {
        oldTab.classList.remove("current-tab");
        oldTab = newTab;
        oldTab.classList.add("current-tab");

        if(!searchForm.classList.contains("active")) {
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
        }
        else {
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
        }
    }
}

userTab.addEventListener("click", () => {
    switchTab(userTab);
});

searchTab.addEventListener("click", () => {
    switchTab(searchTab);
});

function getfromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if(!localCoordinates) {
        grantAccessContainer.classList.add("active");
    }
    else {
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }

}

async function fetchUserWeatherInfo(coordinates) {
    const {lat, lon} = coordinates;
    grantAccessContainer.classList.remove("active");
    loadingScreen.classList.add("active");

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
          );
        const  data = await response.json();

        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }
    catch(err) {
        loadingScreen.classList.remove("active");
    }

}

let weatherData = null;

function renderWeatherInfo(weatherInfo) {
    console.log("renderWeatherInfo called with:", weatherInfo);

    weatherData = weatherInfo;

    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");

    console.log(weatherInfo);

    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `https://openweathermap.org/img/wn/${weatherInfo?.weather?.[0]?.icon}@2x.png`;
    temp.innerText = `${weatherInfo?.main?.temp} °C`;
    windspeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity}%`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;

    const sunriseElement = document.querySelector("[data-sunrise]");
    const sunsetElement = document.querySelector("[data-sunset]");
    const goldenHourElement = document.querySelector("[data-goldenHour]");

    if (sunriseElement && sunsetElement && goldenHourElement) {
        console.log("Sunrise, Sunset, Golden Hour elements found"); 

        const sunriseTime = new Date(weatherInfo.sys.sunrise * 1000);
        const sunsetTime = new Date(weatherInfo.sys.sunset * 1000);

        sunriseElement.innerText = `Sunrise: ${sunriseTime.toLocaleTimeString()}`;
        sunsetElement.innerText = `Sunset: ${sunsetTime.toLocaleTimeString()}`;

        const goldenHourStart = new Date(sunriseTime.getTime() + 60 * 60 * 1000);
        const goldenHourEnd = new Date(sunsetTime.getTime() - 60 * 60 * 1000);

        goldenHourElement.innerText = `Golden Hour:\n${goldenHourStart.toLocaleTimeString()} - ${goldenHourEnd.toLocaleTimeString()}`;
    } else {
        console.error("Sunrise, Sunset, and/or Golden Hour elements not found in the DOM");
    }

    const tempCelsius = weatherInfo?.main?.temp;
    updateTemperatureDisplays(tempCelsius);
}

function getLocation() {
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else {
        alert("Geolocation is not supported by your browser.");
    }
}

function showPosition(position) {

    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    }

    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);

}

const grantAccessButton = document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener("click", getLocation);

const searchInput = document.querySelector("[data-searchInput]");

searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let cityName = searchInput.value;

    if(cityName === "")
        return;
    else 
        fetchSearchWeatherInfo(cityName);
})

async function fetchSearchWeatherInfo(city) {
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
          );
        const data = await response.json();
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }
    catch(err) {
    }
}

const unitToggle = document.getElementById("unit-toggle");
const unitLabels = document.querySelectorAll(".unit-label");

let currentUnit = 'C';

if (sessionStorage.getItem("preferred-unit")) {
    currentUnit = sessionStorage.getItem("preferred-unit");
    if (currentUnit === 'F') {
        unitToggle.checked = true;
    }
}

function celsiusToFahrenheit(tempC) {
    return (tempC * 9/5) + 32;
}

function updateTemperatureDisplays(tempC) {
    const tempElement = document.querySelector("[data-temp]");
    if (currentUnit === 'F') {
        const tempF = celsiusToFahrenheit(tempC);
        tempElement.innerText = `${Math.round(tempF)}°F`;
    } else {
        tempElement.innerText = `${Math.round(tempC)}°C`;
    }
}

unitToggle.addEventListener("change", () => {
    currentUnit = unitToggle.checked ? 'F' : 'C';
    sessionStorage.setItem("preferred-unit", currentUnit);
    if (weatherData) {
        const tempCelsius = weatherData.main.temp;
        updateTemperatureDisplays(tempCelsius);
    }
});