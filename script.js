// Model

const Fahrenheit = 'Fahrenheit'
const Celsius = 'Celsius'

const initScale = function getInitialScale () {
  const slide = document.querySelector('#switch > label > input')

  if (slide.checked) {
    return Fahrenheit
  } else {
    return Celsius
  }
}

const model = {
  currentTemp: null,
  tempMin: null,
  tempMax: null,
  sunrise: null,
  sunset: null,
  pressure: null,
  visibility: null,
  rainfall: null,
  scale: initScale()
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

const round2 = function roundTo2Decimals (num) {
  return Math.round(num * 100) / 100
}

const pressure = function displayPressure (pressure) {
  switch (model.scale) {
    case Fahrenheit:
      return `${round2(pressure * 0.0295301)}"`
    case Celsius:
      return `${round2(pressure * 0.75006)} mm`
    default:
      return '--'
  }
}

const visibility = function displayVisibility (meters) {
  switch (model.scale) {
    case Fahrenheit:
      return `${round2(meters * 0.000621371)} Miles`
    case Celsius:
      return `${round2(meters / 1000)} km`
    default:
      return '--'
  }
}

const rainfall = function displayRainfall (mm) {
  if (mm === null) {
    mm = 0
  }

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
  updateNode('currentTemp', formatTemp)
  updateNode('tempMax', high)
  updateNode('tempMin', low)
  updateNode('sunrise', time)
  updateNode('sunset', time)
  updateNode('pressure', pressure)
  updateNode('visibility', visibility)
  updateNode('rainfall', rainfall)
}

const switchScale = function updateSwitchState () {
  const slide = document.querySelector('#switch > label > input')
  const text = document.querySelector('#switch > p')

  switch (model.scale) {
    case Fahrenheit:
      model.scale = Celsius
      slide.checked = false
      text.innerText = Celsius
      break
    case Celsius:
      model.scale = Fahrenheit
      slide.checked = true
      text.innerText = Fahrenheit
      break
    default:
      model.scale = Fahrenheit
      slide.checked = true
      text.innerText = Fahrenheit
  }

  render()
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
    .then(json => updateModel(json))
}

const updateModel = function updateModelFromJson (json) {
  const newModel = { currentTemp: json.main.temp,
    tempMin: json.main.temp_min,
    tempMax: json.main.temp_max,
    sunrise: json.sys.sunrise,
    sunset: json.sys.sunset,
    pressure: json.main.pressure,
    visibility: json.visibility,
    rainfall: accessRainfall(json) }

  update(model, newModel)
  render()
}

const addSwitchListener = function addSwichScaleEventListener () {
  const slide = document.querySelector('#switch > label > input')

  slide.addEventListener('change', switchScale)
}

// Run
addSwitchListener()
getWeather()
