let datamap
let spreadSpeed = 15
let blessings = 0
let totalPopulation = 323145790
let totalConverts = 0
let game_state = 'start'
let states = []
let methods = [
  {
    method: "Divine Revelation",
    probOccur: 0,
    probSpread: 1
  },
  {
    method: "Word of Mouth",
    probOccur: 0,
    probSpread: 0.01
  },
  {
    method: "Radio",
    probOccur: 0.1,
    probSpread: 0.01
  },
  {
    method: "Televangelism",
    probOccur: 0,
    probSpread: 0.01
  },
  {
    method: "Print",
    probOccur: 0.1,
    probSpread: 0.01
  },
  {
    method: "Congregation",
    probOccur: 0,
    probSpread: 0.01
  },
  {
    method: "Door-to-Door",
    probOccur: 0.2,
    probSpread: 0.005
  }
]

function setup() {
  let canvasHeight = 100
  let container = createDiv('')
  container.id('container')
  container.style('width', `${window.innerWidth}`)
  container.style('height', `${window.innerHeight - canvasHeight}`)
  datamap = new Datamap({
    element: document.getElementById('container'),
    scope: 'usa',
    done: function(map) {map.svg.selectAll('.datamaps-subunit').on('click', mapClicked)},
    fills: {
      defaultFill: 'rgb(20, 20, 0)'
    },
    geographyConfig: {
      highlightFillColor: 'rgb(20, 20, 0)'
    }
  })

  createCanvas(window.innerWidth, canvasHeight)

  fetch('states.json').then((res) => {
    return res.json()
  }).then((data) => {
    for(let state in data) {
      states.push(new State(state, data[state].borders, parseInt(data[state].population), data[state].name))
    }
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
}

function render() {
  let loc = {}
  let customLabels = {}
  for(let i = 0; i < states.length; i++) {
    let rg = map(states[i].converted, 0, states[i].population, 20, 255)
    loc[states[i].sid] = `rgb(${rg}, ${rg}, 0)`
  }
  datamap.updateChoropleth(loc)

  background(255)
  fill(0)
  textAlign(CENTER, CENTER)
  text(`Total Enlightened: ${totalConverts}`, 500, 30)
  text(`Blessings: ${blessings}`, 500, 50)
}

function mapClicked(geography) {
  if(game_state !== 'start') return
  for(let i = 0; i < states.length; i++) {
    if(states[i].sid === geography.id) {
      states[i].converted = 1
      game_state = 'play'
    }
  }
}
