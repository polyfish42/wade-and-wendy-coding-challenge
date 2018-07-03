const Fahrenheit = 'fahrenheit'
const Celsius = 'celsius'

let model = {
  currentTemp: null,
  scale: Celsius
}

const update = function updateModel (model, newModel) {
  model = Object.assign(model, newModel)
}

const temperature = function convertKelvinToTempurature (model, kelvins) {
  if (model.currentTemp === null) {
    return '--'
  }

  switch (model.scale) {
    case Fahrenheit:
      return Math.round(kelvins * (9 / 5) - 459.67)
    case Celsius:
      return Math.round(kelvins - 273.15)
    default:
      return '--'
  }
}

const render = function renderView (model) {
  const currentTemp = document.getElementById('currentTemp')

  currentTemp.innerHTML = `${temperature(model, model.currentTemp)}&#176;`
}

const getWeather = function fetchCurrentWeather (location = 'New York') {
  const apiKey = 'a97c5e64fc8af7d636f382583d6e14bd'

  window.fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}`)
    .then(res => res.json())
    .then(data => {
      const currentTemp = data.main.temp
      const newModel = { currentTemp }

      update(model, newModel)
      render(model)
    })
}

render(model)
getWeather()
