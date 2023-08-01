const apiKey = "38f3f0ee4349c5c1310ae1c4dbf3b56d"

const apiUnsplash = "https://source.unsplash.com/1600x900/?"

const cityInput = document.querySelector("#city-input")
const searchBtn = document.querySelector("#search")

const cityElement = document.querySelector("#city")
const tempElement = document.querySelector("#temperature span")
const tempmaxElement = document.querySelector("#temp_max span")
const tempminElement = document.querySelector("#temp_min span")
const descElement = document.querySelector("#description")
const weatherIconElement = document.querySelector("#weather-icon")
const countryElement = document.querySelector("#country")
const umidityElement = document.querySelector("#umidity span")
const windElement = document.querySelector("#wind span")
const timezoneElement = document.querySelector("#timezone")

const weatherContainer = document.querySelector("#weather-data")

const errorMessageContainer = document.querySelector("#error-message")
const loader = document.querySelector("#loader")

const suggestionContainer = document.querySelector("#suggestions")
const suggestionButtons = document.querySelectorAll("#suggestions button")


function clearForecast() {
  const forecastDiv = document.getElementById("forecast");
  forecastDiv.innerHTML = "";
}

function display5DayForecast(forecastList) {
  const forecastDiv = document.getElementById("forecast");

  forecastList.forEach((item) => {
    // Formatação da data em português com abreviação do dia da semana
    const date = new Date(item.dt * 1000);
    const weekday = date.toLocaleDateString("pt-BR", { weekday: "short" });
    const dayAndMonth = date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

    const temp = Math.floor(item.main.temp);
    const description = translateWeatherDescription(item.weather[0].description);
    const icon = item.weather[0].icon;

    const forecastItem = document.createElement("p");
    forecastItem.innerHTML = `${weekday}<br><br>${dayAndMonth}<br><br>${temp}°C<br><br>${description}<br><img src="http://openweathermap.org/img/wn/${icon}.png" alt="${description}">`;
    forecastDiv.appendChild(forecastItem);
  });

  // Após a exibição da previsão de 5 dias, ocultar o elemento de carregamento
  toggleLoader();
}

// Função para traduzir as descrições do clima para o português
function translateWeatherDescription(description) {
  const translations = {
    "clear sky": "Céu Limpo",
    "few clouds": "Poucas Nuv",
    "scattered clouds": "Nuv Disp",
    "broken clouds": "Nuv Queb",
    "shower rain": "Chuva de Verão",
    rain: "Chuva",
    thunderstorm: "Trovoadas",
    snow: "Neve",
    mist: "Nevoeiro",
    "overcast clouds": "Nublado",
    "light rain": "Chuva Leve",
    "moderate rain": "Chuva Mod"
    // E assim por diante...
  }

  // Se a descrição estiver no objeto de traduções, retorna a tradução, caso contrário, retorna a própria descrição
  return translations[description.toLowerCase()] || description
}

function get5DayForecast(city) {
  // Limpa os dados anteriores antes de exibir a previsão de 5 dias
  clearForecast();

  // Verifique se o campo de entrada tem um valor válido
  if (!city) {
    console.error("Digite o nome de uma cidade válida.")
    return;
  }

  const apiKey = "38f3f0ee4349c5c1310ae1c4dbf3b56d"
  const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`

  // Verifica se o elemento com o ID "forecast" existe antes de prosseguir
  const forecastDiv = document.getElementById("forecast")
  if (!forecastDiv) {
    console.error("Elemento com o ID 'forecast' não encontrado.")
    return
  }

  // Limpa os dados anteriores antes de exibir a previsão de 5 dias
  forecastDiv.innerHTML = ""

  toggleLoader()

  fetch(apiUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erro na requisição da API.")
      }
      return response.json()
    })
    .then((data) => {
      // Verifica se a resposta contém a propriedade 'list'
      if (!data.list || data.list.length === 0) {
        throw new Error("Previsão de 5 dias não encontrada.")
      }

      // Filtra os dados para pegar a previsão dos próximos 5 dias (intervalo de 24 horas)
      const forecastList = data.list.filter((item, index) => index % 8 === 0)
      display5DayForecast(forecastList)
    })
    .catch((error) => {
      console.error("Erro ao obter a previsão de 5 dias:", error)
    })
    .finally(() => {
      toggleLoader()
    })
}
// Restante do código...

// Adicione o evento de clique para o botão "Previsão para 5 dias"
document.getElementById("get-5-day-forecast").addEventListener("click", () => {
  const city = cityElement.dataset.city; // Pegue o nome da cidade do atributo data-city
  if (city) {
    get5DayForecast(city); // Use a função get5DayForecast em vez de get5DayForecastForCity
    toggleLoader();
  }
});

// Function to format time with the new timezone
const formatTimeWithTimeZone = (timezone) => {
  const timezoneOffsetInSeconds = timezone + 3 * 3600
  const targetDate = new Date(Date.now() + timezoneOffsetInSeconds * 1000)

  const hora = targetDate.getHours().toString().padStart(2, "0")
  const minuto = targetDate.getMinutes().toString().padStart(2, "0")

  return `${hora}:${minuto}`
}

// Loader
const toggleLoader = () => {
  loader.classList.toggle("hide")
}

const getWeatherData = async (city) => {
  toggleLoader()

  const apiWeatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}&lang=pt_br`

  const res = await fetch(apiWeatherURL)
  const data = await res.json()

  toggleLoader()

  return data
}

// Tratamento de erro
const showErrorMessage = () => {
  errorMessageContainer.classList.remove("hide")
}

const hideInformation = () => {
  errorMessageContainer.classList.add("hide")
  weatherContainer.classList.add("hide")

  suggestionContainer.classList.add("hide")
}

const showWeatherData = async (city) => {
  hideInformation()

  const data = await getWeatherData(city)

  if (data.cod === "404") {
    showErrorMessage()
    return
  }

  cityElement.dataset.city = city

  cityElement.innerText = data.name
  tempElement.innerText = parseInt(data.main.temp)
  tempmaxElement.innerText = "Max " + parseInt(data.main.temp_max) + "°C"
  tempminElement.innerText = "Min " + parseInt(data.main.temp_min) + "°C"
  descElement.innerText = data.weather[0].description
  weatherIconElement.setAttribute(
    "src",
    `http://openweathermap.org/img/wn/${data.weather[0].icon}.png`
  )
  countryElement.setAttribute(
    "src",
    `https://flagsapi.com/${data.sys.country}/shiny/64.png`
  )
  umidityElement.innerText = `${data.main.humidity}%`
  windElement.innerText = `${data.wind.speed}km/h`

  // Change bg image
  document.body.style.backgroundImage = `url("${apiUnsplash + city}")`

  // Get and format time with the new timezone
  const horaFormatada = formatTimeWithTimeZone(data.timezone)
  timezoneElement.innerText = `${horaFormatada}`

  weatherContainer.classList.remove("hide")
}

searchBtn.addEventListener("click", async (e) => {
  e.preventDefault()

  const city = cityInput.value

  showWeatherData(city)
})

cityInput.addEventListener("keyup", (e) => {
  if (e.code === "Enter") {
    const city = e.target.value

    showWeatherData(city)
  }
})

// Evento de clique no botão de pesquisa
searchBtn.addEventListener("click", async (e) => {
  e.preventDefault();

  const city = cityInput.value;

  // Limpar a previsão de 5 dias antes de mostrar os dados do tempo atual para a cidade pesquisada
  clearForecast();

  showWeatherData(city);
});

// Sugestões
suggestionButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const city = btn.getAttribute("id")

    showWeatherData(city)
  })
})

