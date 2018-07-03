// Model

const Fahrenheit = 'fahrenheit'
const Celsius = 'celsius'

const model = {
  currentTemp: null,
  tempMin: null,
  tempMax: null,
  sunrise: null,
  sunset: null,
  pressure: null,
  visibility: null,
  rainfall: null,
  scale: Fahrenheit
}

const update = function updateModel (model, newModel) {
  model = Object.assign(model, newModel)
}

// Update View
const temperature = function convertKelvinToTempurature (kelvins) {
  if (kelvins === null) {
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

const formatTemp = function displayTemp (temp) {
  return `${temperature(temp)}&#176;`
}

const low = function displayLowTemp (temp) {
  return `Low ${formatTemp(temp)}`
}

const high = function displayHighTemp (temp) {
  return `High ${formatTemp(temp)}`
}

const time = function convertSecondsToTimeAndDisplay (time) {
  const date = new Date(time * 1000)
  return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
}

const pressure = function displayPressure (pressure) {
  return `${Math.round(pressure * 0.0295301 * 100) / 100}"`
}

const visibility = function displayVisibility (meters) {
  switch (model.scale) {
    case Fahrenheit:
      return `${Math.round(meters * 0.000621371 * 100) / 100} Miles`
    case Celsius:
      return `${meters} Meters`
    default:
      return '--'
  }
}

const rainfall = function displayRainfall (mm) {
  switch (model.scale) {
    case Fahrenheit:
      return `${Math.round(mm * 0.0393701 * 100) / 100}"`
    case Celsius:
      return `${mm} mm`
    default:
      return '--'
  }
}

const updateNode = function updateNodeData (selector, cb) {
  const node = document.getElementById(selector)
  node.innerHTML = cb(model[selector])
}

const render = function renderView () {
  const currentTemp = document.getElementById('currentTemp')

  currentTemp.innerHTML = `${temperature(model.currentTemp)}&#176;`

  updateNode('tempMax', high)
  updateNode('tempMin', low)
  updateNode('sunrise', time)
  updateNode('sunset', time)
  updateNode('pressure', pressure)
  updateNode('visibility', visibility)
  updateNode('rainfall', rainfall)
}

// Async
const accessRainfall = function getRainfallFromData (data) {
  if (data.rain === undefined) {
    return null
  }

  return data.rain['3h']
}

const getWeather = function fetchCurrentWeather (location = 'New York') {
  const apiKey = 'a97c5e64fc8af7d636f382583d6e14bd'

  window.fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}`)
    .then(res => res.json())
    .then(data => {
      const newModel = { currentTemp: data.main.temp,
        tempMin: data.main.temp_min,
        tempMax: data.main.temp_max,
        sunrise: data.sys.sunrise,
        sunset: data.sys.sunset,
        pressure: data.main.pressure,
        visibility: data.visibility,
        rainfall: accessRainfall(data) }

      console.log(data)
      update(model, newModel)
      render()
    })
}

// Run
getWeather()
