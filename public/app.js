let datamap
let blessings = 0
let startState = 'n/a'
let totalPopulation = 323127513
let totalConverts = 0
let game_state = 'start'
let last_state
let canvasHeight = 100
let states = []
let convertedStates = []
let evangelism = {}
let methods = [
  {
    method: "Divine Revelation",
    probOccur: 0,
    probSpread: 0
  },
  {
    method: "Missionaries",
    probOccur: 0,
    probSpread: 0
  },
  {
    method: "Televangelism",
    probOccur: 0,
    probSpread: 0
  },
  {
    method: "Radio",
    probOccur: 0,
    probSpread: 0
  },
  {
    method: "Door to Door",
    probOccur: 0,
    probSpread: 0
  },
  {
    method: "Print",
    probOccur: 0,
    probSpread: 0
  },
  {
    method: "Congregation",
    probOccur: 0.21,
    probSpread: 0.15
  }
]

let dampeners = {
  christianity: {
    wordOfMouth: 0,
    media: 0,
    deconversion: 0
  },
  judaism: {
    wordOfMouth: 0,
    media: 0,
    deconversion: 0
  },
  islam: {
    wordOfMouth: 0,
    media: 0,
    deconversion: 0
  },
  scientology: {
    wordOfMouth: 0,
    media: 0,
    deconversion: 0
  }
}

let resistances = {
  christianity: 1,
  judaism: 1,
  islam: 1,
  scientology: 1
}

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
    for(let method in evangelism) {
      evangelism[method].state = 'unavailable'
    }
    evangelism['Congregation 1'].state = 'bought'
    setMethodStates(evangelism)
  })
}

function draw() {
  update()
  render()
}

function update() {
  if(states.length === 0) return

  let percentConverted = map(totalConverts, 0, totalPopulation, 0, 1)
  for(religion in dampeners) {
    if(random() < percentConverted) {
      if(random() < 0.5 && dampeners[religion].wordOfMouth < 0.8) dampeners[religion].wordOfMouth += 0.001
      else if(dampeners[religion].media < 0.8) dampeners[religion].media += 0.001
    }
    if(percentConverted > 0.4) {
      dampeners[religion].deconversion += floor(random(1, 3))
    } else if(percentConverted < 0.1 && dampeners[religion].deconversion > 0) {
      dampeners[religion].deconverstion -= floor(random(1, 3))
    }
  }

  for(let i = 0; i < convertedStates.length; i++) {
    random(states).spread(convertedStates[i], methods, dampeners, resistances)
  }

  let converts = 0
  for(let i = 0; i < states.length; i++) {
    converts += states[i].converted
    if(states[i].converted > 0 && !convertedStates.includes(states[i])) {
      convertedStates.push(states[i])
    }
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


  if(game_state === 'heathens' || game_state === 'religion' || game_state === 'evangelism' || game_state === 'resistances') this.canvas.style('z-index', '20')
  else this.canvas.style('z-index', '5')
  image(this.popup, window.innerWidth/2-this.popup.width/2, 200)
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
  this.infoBar.text(`Total Enlightened: ${totalConverts.toLocaleString()}`, window.innerWidth/2, 30)
  this.infoBar.text(`Blessings: ${blessings.toLocaleString()}`, window.innerWidth/2, 60)
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
      this.popup.text(`Total Population: ${totalPopulation.toLocaleString()}`, 50, 100)
      this.popup.text(`Start State: ${startState}`, 50, 150)
      break;
    case 'evangelism':
      setMethodStates(evangelism)
      this.popup.background(220)
      for(let method in evangelism) {
        polygon(evangelism[method].x, evangelism[method].y, 40, 8, evangelism[method].state)
      }

      for(method in evangelism) {
        let hoverOver = false
        if(mouseX < evangelism[method].x+40+window.innerWidth/2-400 && mouseX > evangelism[method].x-40+window.innerWidth/2-400 &&
          mouseY < evangelism[method].y+window.innerHeight/2-250 && mouseY > evangelism[method].y-80+window.innerHeight/2-250) {
            for(prereq of evangelism[method].prereqs) {
              hoverOver = true
              this.popup.stroke(255, 0, 0)
              this.popup.line(evangelism[method].x, evangelism[method].y, evangelism[prereq].x, evangelism[prereq].y)

            }
          }
          this.popup.noStroke()
          this.popup.fill(0)
          this.popup.textFont("Verdana")
          this.popup.textAlign(CENTER, CENTER)
          if(!hoverOver || evangelism[method].state === 'bought') {
            let type = method.split(' ')[0]
            let level = method.split(' ')[1]
            if(type === 'Door') {
              type = 'Door to Door'
              level = method.split(' ')[3]
            }
            this.popup.textSize(10)
            this.popup.text(type, evangelism[method].x, evangelism[method].y)
            if(level !== 'Revelation') this.popup.textSize(15)
            this.popup.text(level, evangelism[method].x, evangelism[method].y+15)
          } else {
            this.popup.textSize(20)
            this.popup.text(evangelism[method].cost, evangelism[method].x, evangelism[method].y)
          }
      }
      break;
    case 'resistances':
      this.popup.background(50, 50, 200)

      break;

    case 'heathens':
      this.popup.background(220, 20, 20)
      this.popup.textAlign(LEFT)
      this.popup.textFont('IM Fell English SC')
      this.popup.textSize(50)
      this.popup.noStroke()
      this.popup.fill(0)
      this.popup.text('Heathens', 30, 50)

      this.popup.textSize(30)
      this.popup.text('Christians', 30, 150)
      this.popup.text('Jews', 30, 250)
      this.popup.text('Muslims', 30, 350)
      this.popup.text('Scientologists', 30, 450)

      this.popup.text('Gossip Control', 300, 100)
      this.popup.text(`${dampeners.christianity.wordOfMouth.toFixed(4)}%`, 350, 150)
      this.popup.text(`${dampeners.judaism.wordOfMouth.toFixed(4)}%`, 350, 250)
      this.popup.text(`${dampeners.islam.wordOfMouth.toFixed(4)}%`, 350, 350)
      this.popup.text(`${dampeners.scientology.wordOfMouth.toFixed(4)}%`, 350, 450)

      this.popup.text('Media Control', 550, 100)
      this.popup.text(`${dampeners.christianity.media.toFixed(4)}%`, 600, 150)
      this.popup.text(`${dampeners.judaism.media.toFixed(4)}%`, 600, 250)
      this.popup.text(`${dampeners.islam.media.toFixed(4)}%`, 600, 350)
      this.popup.text(`${dampeners.scientology.media.toFixed(4)}%`, 600, 450)
      break

    default:
      this.popup.background(255)
      return
  }

  if(game_state === 'heathens') return
  this.popup.textFont('IM Fell English SC')
  this.popup.textSize(30)
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
      if(game_state === 'start' || game_state === 'play') last_state = game_state
      game_state = 'heathens'
      return
    }
    if(mouseX < window.innerWidth/5 + 200 && mouseX > window.innerWidth/5 - 200) {
      if(game_state === 'start' || game_state === 'play') last_state = game_state
      game_state = 'religion'
      return
    }
  }

  if(game_state === 'religion' || game_state === 'evangelism' || game_state === 'resistances'  || game_state === 'heathens') {
    if(mouseY > window.innerHeight/2+this.popup.height/2 || mouseY < window.innerHeight/2-this.popup.height/2 ||
      mouseX < window.innerWidth/2-this.popup.width/2 || mouseX > window.innerWidth/2+this.popup.width/2){
        game_state = last_state
        return
      }
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
    if(game_state === 'evangelism') {
      for(method in evangelism) {
        if(mouseX < evangelism[method].x+40+window.innerWidth/2-400 && mouseX > evangelism[method].x-40+window.innerWidth/2-400 &&
          mouseY < evangelism[method].y+window.innerHeight/2-250 && mouseY > evangelism[method].y-80+window.innerHeight/2-250) {
            if(evangelism[method].state === 'available' && blessings >= evangelism[method].cost) {
              evangelism[method].state = 'bought'
              blessings -= evangelism[method].cost
              let index = -1
              switch(method.split(' ')[0]) {
                case 'Congregation':
                  index = 6
                  break;
                case 'Door':
                  index = 4
                  break;
                case 'Missionaries':
                  index = 1
                  break;
                case 'Print':
                  index = 5
                  break
                case 'Radio':
                  index = 3
                  break
                case 'Televangelism':
                  index = 2
                  break;
                case 'Divine':
                  index = 0
                  break
              }
              methods[index].probOccur = evangelism[method].probOccur
              methods[index].probSpread = evangelism[method].probSpread
            }
          }
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

function polygon(x, y, radius, npoints, state) {
  var angle = TWO_PI / npoints;
  switch(state) {
    case 'unavailable':
      this.popup.fill(100)
      break
    case 'bought':
      this.popup.fill(220, 220, 0)
      break
    case 'available':
      this.popup.fill(255)
      break
  }
  this.popup.beginShape();
  this.popup.stroke(0)
  for (var a = 0; a < TWO_PI; a += angle) {
    var sx = x + cos(a) * radius;
    var sy = y + sin(a) * radius;
    this.popup.vertex(sx, sy);
  }
  this.popup.endShape(CLOSE);
}

function setMethodStates(evangelism) {
  for(method in evangelism) {
    if(evangelism[method].state === 'bought') continue
    let available = 'available'
    for(prereq of evangelism[method].prereqs) {
      if(evangelism[prereq].state !== 'bought') available = 'unavailable'
    }
    evangelism[method].state = available
  }
}
