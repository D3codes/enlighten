let datamap
let spreadSpeed = 15
let blessings = 0
let startState
let totalPopulation = 323145790
let totalConverts = 0
let game_state = 'start'
let canvasHeight = 100
let states = []
let evangelism = {}
let methods = [
  {
    method: "Divine Revelation",
    probOccur: 0,
    probSpread: 1
  },
  {
    method: "Word of Mouth",
    probOccur: 0,
    probSpread: 0.0001
  },
  {
    method: "Televangelism",
    probOccur: 0,
    probSpread: 0.01
  },
  {
    method: "Radio",
    probOccur: 0,
    probSpread: 0.01
  },
  {
    method: "Door-to-Door",
    probOccur: 0,
    probSpread: 0.005
  },
  {
    method: "Print",
    probOccur: 0,
    probSpread: 0.01
  },
  {
    method: "Congregation",
    probOccur: 0.1,
    probSpread: 0.01
  }
]

function setup() {
  let container = createDiv('')
  container.id('map')
  container.style('width', `${window.innerWidth}`)
  container.style('height', `${window.innerHeight - canvasHeight}`)
  datamap = new Datamap({
    element: document.getElementById('map'),
    scope: 'usa',
    done: function(map) {map.svg.selectAll('.datamaps-subunit').on('click', mapClicked)},
    fills: {
      defaultFill: 'rgb(20, 20, 0)'
    },
    geographyConfig: {
      highlightFillColor: 'rgb(20, 20, 0)'
    }
  })

  this.canvas = createCanvas(window.innerWidth, window.innerHeight)
  this.canvas.id('canvas')
  this.popup = createGraphics(800, 500)
  this.infoBar = createGraphics(window.innerWidth, canvasHeight)

  fetch('states.json').then((res) => {
    return res.json()
  }).then((data) => {
    for(let state in data) {
      states.push(new State(state, data[state].borders, parseInt(data[state].population), data[state].name))
    }
  })

  fetch('evangelism.json').then((res) => {
    return res.json()
  }).then((data) => {
    evangelism = data
  })
}

function draw() {
  update()
  render()
}

function update() {
  if(states.length === 0) return
  for(let i = 0; i < spreadSpeed; i++) {
    random(states).spread(random(states), methods)
  }

  let converts = 0
  for(let i = 0; i < states.length; i++) {
    converts += states[i].converted
  }
  blessings += ceil(map(converts, 0, totalPopulation, converts, 1)*map(converts-totalConverts, 0, totalPopulation-totalConverts, 0, 1))
  totalConverts = converts

  updateInfoBar()
  updatePopup()
}

function render() {
  let loc = {}
  let customLabels = {}
  for(let i = 0; i < states.length; i++) {
    let rg = map(states[i].converted, 0, states[i].population, 20, 255)
    loc[states[i].sid] = `rgb(${rg}, ${rg}, 0)`
  }
  datamap.updateChoropleth(loc)


  if(game_state === 'heathens' || game_state === 'religion' || game_state === 'evangelism' || game_state === 'resistances') {
    this.canvas.style('z-index', '20')
    image(this.popup, window.innerWidth/2-this.popup.width/2, 200)
  } else {
    this.canvas.style('z-index', '5')
  }
  image(this.infoBar, 0, window.innerHeight-canvasHeight)
}

function updateInfoBar() {
  this.infoBar.background(255, 255, 255)

  this.infoBar.rectMode(RADIUS)
  this.infoBar.noStroke()
  this.infoBar.fill(200, 200, 0)
  this.infoBar.rect(window.innerWidth/5, 40, 200, 50)
  this.infoBar.fill(255, 50, 50)
  this.infoBar.rect(4*window.innerWidth/5, 40, 200, 50)

  this.infoBar.fill(0, 0, 0)
  this.infoBar.textFont('IM Fell English SC')
  this.infoBar.textSize(30)
  this.infoBar.textAlign(CENTER, CENTER)
  this.infoBar.text('Religion', window.innerWidth/5, 40)
  this.infoBar.text(`Total Enlightened: ${totalConverts}`, window.innerWidth/2, 30)
  this.infoBar.text(`Blessings: ${blessings}`, window.innerWidth/2, 60)
  this.infoBar.text('Heathens', 4*window.innerWidth/5, 40)
}

function updatePopup() {
  this.popup.textAlign(LEFT)
  this.popup.textFont('IM Fell English SC')
  switch(game_state) {
    case 'religion':
      this.popup.background(20, 160, 50)
      this.popup.fill(0)
      this.popup.textSize(50)
      this.popup.text('Religion', 50, 50)

      this.popup.textSize(30)
      this.popup.text(`Total Population: ${totalPopulation}`, 50, 100)
      this.popup.text(`Start State: ${startState}`, 50, 150)
      break;
    case 'evangelism':
      this.popup.background(220)

      break;
    case 'resistances':
      this.popup.background(50, 50, 200)

      break;
  }

  this.popup.noStroke()
  this.popup.fill(20, 160, 50)
  this.popup.rect(0, popup.height-50, popup.width/3, 50)
  this.popup.fill(220)
  this.popup.rect(popup.width/3, popup.height-50, popup.width/3, 50)
  this.popup.fill(50, 50, 200)
  this.popup.rect(2*popup.width/3, popup.height-50, popup.width/3, 50)
  this.popup.fill(0)
  this.popup.textAlign(CENTER, CENTER)
  this.popup.text("Religion", this.popup.width/2 - this.popup.width/3, this.popup.height - 25)
  this.popup.text("Evangelism", this.popup.width/2, this.popup.height - 25)
  this.popup.text("Resistances", this.popup.width/2 + this.popup.width/3, this.popup.height - 25)
}

function mouseClicked() {
  if(mouseY < window.innerHeight && mouseY > window.innerHeight - 100) {
    if(mouseX < 4*window.innerWidth/5 + 200 && mouseX > 4*window.innerWidth/5 - 200) {
      game_state = 'heathens'
    }
    if(mouseX < window.innerWidth/5 + 200 && mouseX > window.innerWidth/5 - 200) {
      game_state = 'religion'
    }
  }

  if(game_state === 'religion' || game_state === 'evangelism' || game_state === 'resistances') {
    if(mouseY < window.innerHeight/2+this.popup.height/2-50 && mouseY > window.innerHeight/2+this.popup.height/2-100) {
      if(mouseX < window.innerWidth/2+this.popup.width/2 && mouseX > window.innerWidth/2+this.popup.width/2 - this.popup.width/3) {
        game_state = 'resistances'
      }
      else if(mouseX < window.innerWidth/2+this.popup.width/2 && mouseX > window.innerWidth/2+this.popup.width/2 - 2*this.popup.width/3) {
        game_state = 'evangelism'
      }
      else if(mouseX < window.innerWidth/2+this.popup.width/2 && mouseX > window.innerWidth/2-this.popup.width/2) {
        game_state = 'religion'
      }
    }
  }
}

function mapClicked(geography) {
  if(game_state !== 'start') return
  for(let i = 0; i < states.length; i++) {
    if(states[i].sid === geography.id) {
      startState = states[i].name
      states[i].converted = 1
      game_state = 'play'
    }
  }
}
