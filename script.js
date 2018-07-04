// Model

const Fahrenheit = 'Fahrenheit'
const Celsius = 'Celsius'
const Hourly = 'Hourly'
const Daily = 'Daily'

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
  currentTempIcon: null,
  time: new Date(),
  tempMin: null,
  tempMax: null,
  sunrise: null,
  sunset: null,
  pressure: null,
  visibility: null,
  rainfall: null,
  scale: initScale(),
  location: 'New York',
  searchInput: '',
  forecastList: {prev: [], curr: [], next: []},
  dailyList: {prev: [], curr: [], next: []},
  mode: Hourly
}

const update = function updateModel (model, newModel) {
  model = Object.assign(model, newModel)
}

// Update View
const updateTimeNode = function updateLatestTimeNode () {
  const node = document.querySelector('.current-weather__info')
  node.innerHTML = `${model.location} as of ${model.time.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}`
}

const updateTempIcon = function updateMainTempIcon () {
  const icon = document.querySelector('.current-weather__icon')
  icon.src = `http://openweathermap.org/img/w/${model.currentTempIcon}.png`
}

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
  if (time === null) {
    return '--'
  }

  const date = new Date(time * 1000)
  return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
}

const shortTime = function convertSecondsToHour (time) {
  if (time === null) {
    return '--'
  }

  const date = new Date(time * 1000)
  return date.toLocaleTimeString([], {hour: '2-digit'})
}

const round2 = function roundTo2Decimals (num) {
  return Math.round(num * 100) / 100
}

const pressure = function displayPressure (pressure) {
  if (pressure === null) {
    return '--'
  }

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
  if (meters === null) {
    return '--'
  }

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

const updateForecastMode = function updateForecastModeToggle () {
  const hourly = document.querySelector('.forecast__hourly')
  const daily = document.querySelector('.forecast__daily')

  switch (model.mode) {
    case Hourly:
      hourly.classList.add('current-mode')
      daily.classList.remove('current-mode')
      break
    case Daily:
      hourly.classList.remove('current-mode')
      daily.classList.add('current-mode')
      break
    default:
      return undefined
  }
}

const displayForecast = function displayForecastDivs (forecast, outerDiv, text) {
  const div = document.createElement('div')
  const img = document.createElement('img')
  const p = document.createElement('p')

  img.src = `http://openweathermap.org/img/w/${forecast.icon}.png`
  div.appendChild(img)
  p.innerText = text
  p.style.textAlign = 'center'
  div.appendChild(p)
  outerDiv.appendChild(div)
}

const updateForecast = function updateForecastNode () {
  const outerDiv = document.getElementById('carousel')
  while (outerDiv.firstChild) {
    outerDiv.removeChild(outerDiv.firstChild)
  }

  switch (model.mode) {
    case Hourly:
      model.forecastList.curr.forEach(forecast => {
        displayForecast(forecast, outerDiv, shortTime(forecast.dateTime))
      })
      break
    case Daily:
      model.dailyList.curr.forEach(forecast => {
        displayForecast(forecast, outerDiv, forecast.weather)
      })
      break
    default:
      return undefined
  }
}

const render = function renderView () {
  updateTimeNode()
  updateTempIcon()
  updateNode('currentTemp', formatTemp)
  updateNode('tempMax', high)
  updateNode('tempMin', low)
  updateNode('sunrise', time)
  updateNode('sunset', time)
  updateNode('pressure', pressure)
  updateNode('visibility', visibility)
  updateNode('rainfall', rainfall)
  updateForecastMode()
  updateForecast()
}

// Async
const accessRainfall = function getRainfallFromData (data) {
  if (data.rain === undefined) {
    return null
  }

  return data.rain['3h']
}

const getWeather = function fetchCurrentWeather (location = 'New York') {
  update(model, {time: new Date()})

  const apiKey = 'a97c5e64fc8af7d636f382583d6e14bd'

  const weatherPromise = window.fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}`)
    .then(res => res.json())
    .then(json => updateModelWeather(json))
    .catch(error => console.log(error))

  const forecastPromise = window.fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${apiKey}`)
    .then(res => res.json())
    .then(json => updateModelForecast(json))
    .catch(error => console.log(error))

  Promise.all([weatherPromise, forecastPromise]).then(() => render())
}

const updateModelWeather = function updateModelWeatherFromJson (json) {
  const newModel = { currentTemp: json.main.temp,
    currentTempIcon: json.weather[0].icon,
    tempMin: json.main.temp_min,
    tempMax: json.main.temp_max,
    sunrise: json.sys.sunrise,
    sunset: json.sys.sunset,
    pressure: json.main.pressure,
    visibility: json.visibility,
    rainfall: accessRainfall(json),
    location: json.name }

  update(model, newModel)
}

const updateForecastList = function updateModelForecastList (list) {
  const forecastList = {prev: [], curr: [], next: []}

  for (let i = 0; i < list.length; i++) {
    if (i < 3) {
      forecastList.curr.push(list[i])
    } else {
      forecastList.next.push(list[i])
    }
  }

  update(model, {forecastList})
}

const updateDailyList = function updateModelDailyList (list) {
  const newList = list.filter(el => {
    return shortTime(el.dateTime) === `11 AM`
  })

  const dailyList = {prev: [], curr: [], next: []}

  for (let i = 0; i < newList.length; i++) {
    if (i < 3) {
      dailyList.curr.push(newList[i])
    } else {
      dailyList.next.push(newList[i])
    }
  }

  update(model, {dailyList})
}

const updateModelForecast = function updateModelForecastFromJson (json) {
  const newList = json.list.map(item => {
    return {
      dateTime: item.dt,
      weather: item.weather[0].main,
      icon: item.weather[0].icon}
  })

  updateForecastList(newList)
  updateDailyList(newList)
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

const addSwitchListener = function addSwichScaleEventListener () {
  const slide = document.querySelector('#switch > label > input')

  slide.addEventListener('change', switchScale)
}

const addSearchListeners = function addSearchInputEventListener () {
  const input = document.querySelector('.search-bar__input')

  input.placeholder = model.location

  input.onchange = (e) => {
    model.searchInput = input.value
  }

  input.onfocus = (e) => {
    e.target.placeholder = ''
  }

  input.onblur = (e) => {
    e.target.placeholder = model.location
  }
}

const searchInput = function getAndClearSearchInput () {
  const input = model.searchInput
  model.location = input
  model.searchInput = ''

  const inputNode = document.querySelector('.search-bar__input')
  inputNode.value = ''
  inputNode.blur()

  return input
}

const addSubmitListener = function addSearchSubmitEventListener () {
  const form = document.querySelector('form.search-bar__search')

  form.onsubmit = (e) => {
    e.preventDefault()

    getWeather(searchInput())
  }
}

const addModeListeners = function addForecastModeEventListeners () {
  const hourly = document.querySelector('.forecast__hourly')
  const daily = document.querySelector('.forecast__daily')

  hourly.onclick = () => {
    model.mode = Hourly
    render()
  }

  daily.onclick = () => {
    model.mode = Daily
    render()
  }
}

const prevForecasts = function showPrevForecasts () {
  let list
  switch (model.mode) {
    case Hourly:
      list = 'forecastList'
      break
    case Daily:
      list = 'dailyList'
      break
  }

  const prev = model[list].prev
  const curr = model[list].curr
  const next = model[list].next

  if (prev.length === 0) {
    return
  }

  model[list].next = [...curr, ...next]
  model[list].curr = [...prev.slice(prev.length - 3)]
  model[list].prev = [...prev.slice(0, prev.length - 3)]

  render()
}

const nextForecasts = function showNextForecasts () {
  let list
  switch (model.mode) {
    case Hourly:
      list = 'forecastList'
      break
    case Daily:
      list = 'dailyList'
      break
  }

  const prev = model[list].prev
  const curr = model[list].curr
  const next = model[list].next

  if (next.length === 0) {
    return
  }

  model[list].prev = [...prev, ...curr]
  model[list].curr = [...next.slice(0, 3)]
  model[list].next = [...next.slice(3)]

  render()
}

const addForecastListeners = function addPrevAndNextForecastListeners () {
  const prev = document.querySelector('.forecast__prev')
  const next = document.querySelector('.forecast__next')

  prev.onclick = () => {
    prevForecasts()
  }

  next.onclick = () => {
    nextForecasts()
  }
}

// Run
getWeather('New York')
addSearchListeners()
addSubmitListener()
addSwitchListener()
addModeListeners()
addForecastListeners()
