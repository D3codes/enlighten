let datamap
let blessings = 0
let startState = 'n/a'
let totalPopulation = 323127513
let totalConverts = 0
let game_state = 'new'
let messageDisplayed
let messageSetTime
let message1
let message2
let last_state
let infoState
let religionName = ''
let canvasHeight = 100
let states = []
let convertedStates = []
let evangelism = {}
let resists = {}
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
    probOccur: 0,
    probSpread: 0
  }
]

let dampeners = {
  christianity: {
    followers: "Christians",
    wordOfMouth: 0,
    media: 0,
    deconversion: 0
  },
  judaism: {
    followers: "Jews",
    wordOfMouth: 0,
    media: 0,
    deconversion: 0
  },
  islam: {
    followers: "Muslims",
    wordOfMouth: 0,
    media: 0,
    deconversion: 0
  },
  scientology: {
    followers: "Scientologists",
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

function preload() {
  buttonClick = loadSound('assets/button.wav')
}

function setup() {
  buttonClick.setVolume(0.4)
  pixelDensity(1)
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
    methods[6].probOccur = evangelism['Congregation 1'].probOccur
    methods[6].probSpread = evangelism['Congregation 1'].probSpread
  })

  fetch('resistances.json').then((res) => {
    return res.json()
  }).then((data) => {
    resists = data
  })
}

function draw() {
  update()
  render()
}

function update() {
  if(states.length === 0) return

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
  if(converts > totalConverts) {
    blessings++
    if(random() > 0.98) blessings += floor(random(3))
    let percentConverted = map(totalConverts, 0, totalPopulation, 0, 1)
    for(religion in dampeners) {
      if(random() < percentConverted) {
        let dampenAmount = map(percentConverted, 0, 1, 0.0000001, 0.0001)
        if(random() < 0.5 && dampeners[religion].wordOfMouth < 0.8) {
          if(dampeners[religion].wordOfMouth === 0 && messageDisplayed === false) {
            messageDisplayed = true
            messageSetTime = millis()
            message1 = `${dampeners[religion].followers} are getting concerned`
            message2 = `leaders have called for a boycot of ${religionName}`
          }
          dampeners[religion].wordOfMouth += dampenAmount
        } else if(dampeners[religion].media < 0.8) {
          if(dampeners[religion].media === 0 && messageDisplayed === false) {
            messageDisplayed = true
            messageSetTime = millis()
            message1 = `${dampeners[religion].followers} are getting concerned`
            message2 = `leaders have created anti-${religionName} advertisements`
          }
          dampeners[religion].media += dampenAmount
        }
      }
    }
  }
  totalConverts = converts

  if(totalPopulation === totalConverts) game_state = 'win'
  if(totalConverts === 0 && game_state === 'play') game_state = 'lose'

  updateInfoBar()
  updatePopup()
}

function render() {
  let loc = {}
  let customLabels = {}
  for(let i = 0; i < states.length; i++) {
    let rg = map(sqrt(states[i].converted), 0, sqrt(states[i].population), 20, 255)
    loc[states[i].sid] = `rgb(${rg}, ${rg}, 0)`
  }
  datamap.updateChoropleth(loc)


  if(game_state === 'heathens' || game_state === 'religion' ||
    game_state === 'evangelism' || game_state === 'resistances' ||
    game_state === 'stateInfo' || game_state === 'new' ||
    game_state === 'win' || game_state === 'lose') {
      this.canvas.style('z-index', '20')
    } else {
      this.canvas.style('z-index', '5')
    }
  image(this.popup, window.innerWidth/2-this.popup.width/2, window.innerHeight/2-this.popup.height/2)
  image(this.infoBar, 0, window.innerHeight-canvasHeight)
}

function updateInfoBar() {
  this.infoBar.background(255, 255, 255)

  this.infoBar.textFont('IM Fell English SC')
  this.infoBar.textSize(30)

  if(millis() - messageSetTime > 10000) messageDisplayed = false

  if(messageDisplayed) {
    this.infoBar.fill(220, 20, 20)
    this.infoBar.textAlign(CENTER, CENTER)
    this.infoBar.text(message1, window.innerWidth/2, 30)
    this.infoBar.text(message2, window.innerWidth/2, 60)
  } else {
    this.infoBar.textAlign(LEFT, CENTER)
    this.infoBar.fill(0, 0, 0)
    this.infoBar.text(`People Enlightened: ${totalConverts.toLocaleString()}`, window.innerWidth/2 - 150, 30)
    this.infoBar.text(`Divine Blessings: ${blessings.toLocaleString()}`, window.innerWidth/2 - 150, 60)
  }


  this.infoBar.rectMode(RADIUS)
  this.infoBar.noStroke()
  this.infoBar.fill(200, 200, 0)
  this.infoBar.rect(window.innerWidth/5, 40, 100, 50)
  this.infoBar.fill(255, 50, 50)
  this.infoBar.rect(4*window.innerWidth/5, 40, 100, 50)
  this.infoBar.textAlign(CENTER, CENTER)
  this.infoBar.fill(0, 0, 0)
  if(mouseY < window.innerHeight && mouseY > window.innerHeight - 100) {
    if(mouseX < window.innerWidth/5 + 100 && mouseX > window.innerWidth/5 - 100) {
      this.infoBar.fill(255)
    }
  }
  this.infoBar.text('Enlighten', window.innerWidth/5, 40)

  this.infoBar.fill(0, 0, 0)
  if(mouseY < window.innerHeight && mouseY > window.innerHeight - 100) {
    if(mouseX < 4*window.innerWidth/5 + 100 && mouseX > 4*window.innerWidth/5 - 100) {
      this.infoBar.fill(255)
    }
  }
  this.infoBar.text('Heathens', 4*window.innerWidth/5, 40)
}

function updatePopup() {
  this.popup.textAlign(LEFT)
  this.popup.textFont('IM Fell English SC')
  switch(game_state) {
    case 'religion':
      this.popup.background(50, 50, 200)
      this.popup.fill(0)
      this.popup.textSize(50)
      this.popup.stroke(255, 255, 0)
      this.popup.text(`${religionName}`, 50, 50)
      this.popup.noStroke()

      this.popup.textSize(30)
      this.popup.text(`Total U.S. Population: ${totalPopulation.toLocaleString()}`, 50, 100)
      this.popup.text(`People left to Enlighten: ${(totalPopulation-totalConverts).toLocaleString()}`, 50, 150)
      this.popup.text(`Start State: ${startState}`, 50, 200)

      this.popup.textAlign(CENTER, CENTER)
      this.popup.textSize(25)
      this.popup.text(`Use Divine Blessings to help spread Enlightenment`, 400, 350)
      this.popup.text(`Upgrade Evangelism to reach more people`, 400, 380)
      this.popup.text(`Upgrade Resistances to overpower the Heathens`, 400, 410)
      break;
    case 'evangelism':
      setMethodStates(evangelism)
      this.popup.background(220)
      for(let method in evangelism) {
        polygon(evangelism[method].x, evangelism[method].y, 40, 8, evangelism[method].state)

        let hoverOver = false
        let circle1 = {radius: 1, x: mouseX, y: mouseY}
        let circle2 = {radius: 36, x: evangelism[method].x+window.innerWidth/2-this.popup.width/2, y: evangelism[method].y+window.innerHeight/2-this.popup.height/2}

        let dx = circle1.x - circle2.x
        let dy = circle1.y - circle2.y
        let distance = sqrt(dx * dx + dy * dy)

        if(distance < circle1.radius + circle2.radius) {
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
      this.popup.background(20, 160, 50)
      this.popup.textSize(30)
      this.popup.text('Christianity', 40, 50)
      this.popup.text('Judaism', 275, 50)
      this.popup.text('Islam', 450, 50)
      this.popup.text('Scientology', 600, 50)
      for(let resist in resists) {
        polygon(resists[resist].x, resists[resist].y, 40, 8, resists[resist].state)
        let hoverOver = false

        let circle1 = {radius: 1, x: mouseX, y: mouseY}
        let circle2 = {radius: 36, x: resists[resist].x+window.innerWidth/2-this.popup.width/2, y: resists[resist].y+window.innerHeight/2-this.popup.height/2}

        let dx = circle1.x - circle2.x
        let dy = circle1.y - circle2.y
        let distance = sqrt(dx * dx + dy * dy)

        if(distance < circle1.radius + circle2.radius) hoverOver = true
          this.popup.noStroke()
          this.popup.fill(0)
          this.popup.textFont("Verdana")
          this.popup.textAlign(CENTER, CENTER)
          this.popup.textSize(20)
          if(!hoverOver || resists[resist].state === 'bought') {
            let type = resist.split(' ')[0]
            let level = resist.split(' ')[1]
            this.popup.text(level, resists[resist].x, resists[resist].y)
          } else {
            this.popup.text(resists[resist].cost, resists[resist].x, resists[resist].y)
          }
      }
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
      this.popup.text(`${dampeners.christianity.wordOfMouth.toFixed(7)}%`, 350, 150)
      this.popup.text(`${dampeners.judaism.wordOfMouth.toFixed(7)}%`, 350, 250)
      this.popup.text(`${dampeners.islam.wordOfMouth.toFixed(7)}%`, 350, 350)
      this.popup.text(`${dampeners.scientology.wordOfMouth.toFixed(7)}%`, 350, 450)

      this.popup.text('Media Control', 550, 100)
      this.popup.text(`${dampeners.christianity.media.toFixed(7)}%`, 600, 150)
      this.popup.text(`${dampeners.judaism.media.toFixed(7)}%`, 600, 250)
      this.popup.text(`${dampeners.islam.media.toFixed(7)}%`, 600, 350)
      this.popup.text(`${dampeners.scientology.media.toFixed(7)}%`, 600, 450)
      break

    case 'stateInfo':
      this.popup.background(220)
      this.popup.textAlign(CENTER, CENTER)
      this.popup.textFont('IM Fell English SC')
      this.popup.textSize(50)
      this.popup.noStroke()
      this.popup.fill(0)
      this.popup.text(`${infoState.name}`, 400, 50)
      this.popup.text(`Total Population: ${infoState.population.toLocaleString()}`, 400, 150)
      this.popup.text(`People Enlightened: ${infoState.converted.toLocaleString()}`, 400, 250)

      this.popup.fill(51)
      this.popup.rect(300, 400, 200, 50)
      if(mouseY > window.innerHeight/2+this.popup.height/2 - 100  && mouseY < window.innerHeight/2+this.popup.height/2-50 &&
        mouseX > window.innerWidth/2-100 && mouseX < window.innerWidth/2+100) {
          this.popup.fill(220, 220, 0)
      } else {
        this.popup.fill(255)
      }
      this.popup.text('Close', 400, 430)
      break

    case 'new':
      this.popup.background(220)
      this.popup.textAlign(CENTER, CENTER)
      this.popup.textFont('IM Fell English SC')
      this.popup.textSize(50)
      this.popup.stroke(255, 255, 0)
      this.popup.fill(0)
      this.popup.text('Enlighten', 400, 50)
      this.popup.noStroke()
      this.popup.textSize(30)
      this.popup.text('Name your new religion:', 400, 100)
      this.popup.textSize(50)
      this.popup.stroke(255, 255, 0)
      this.popup.text(`${religionName}`, 400, 150)

      this.popup.noStroke()
      this.popup.textSize(30)
      this.popup.text('Click continue or press the enter key', 400, 250)
      this.popup.text('to begin spreading Enlightenment', 400, 300)

      this.popup.fill(51)
      this.popup.rect(250, 400, 300, 50)
      if(mouseY > window.innerHeight/2+this.popup.height/2 - 100  && mouseY < window.innerHeight/2+this.popup.height/2-50 &&
        mouseX > window.innerWidth/2-150 && mouseX < window.innerWidth/2+150 && religionName.length > 0) {
          this.popup.fill(220, 220, 0)
        } else {
          this.popup.fill(255)
        }
      this.popup.text('Continue', 400, 430)

      this.popup.textSize(20)
      this.popup.fill(0)
      this.popup.text('Created by David Freeman and Caullen Sasnett', 400, 480)
      break

    case 'win':
      this.popup.background(200, 200, 50)
      this.popup.textAlign(CENTER, CENTER)
      this.popup.textFont('IM Fell English SC')
      this.popup.textSize(50)
      this.popup.noStroke()
      this.popup.fill(0)
      this.popup.text('YOU WIN!', 400, 50)

      this.popup.textSize(30)
      this.popup.text(`The entire country as reached enlightenment`, 400, 120)
      this.popup.text(`thanks to ${religionName}!`, 400, 150)

      this.popup.text('Click anywhere to play again', 400, 300)

      this.popup.textSize(20)
      this.popup.text('Created by David Freeman and Caullen Sasnett', 400, 480)
      break

    case 'lose':
      this.popup.background(50, 50, 80)
      this.popup.textAlign(CENTER, CENTER)
      this.popup.textFont('IM Fell English SC')
      this.popup.textSize(50)
      this.popup.noStroke()
      this.popup.fill(0)
      this.popup.text('YOU LOSE', 400, 50)

      this.popup.textSize(30)
      this.popup.text(`The Heathens expelled ${religionName}`, 400, 120)
      this.popup.text(`from the country`, 400, 150)

      this.popup.text('Click anywhere to play again', 400, 300)

      this.popup.textSize(20)
      this.popup.text('Created by David Freeman and Caullen Sasnett', 400, 480)
      break

    default:
      this.popup.background(255)
      return
  }

  if(game_state === 'heathens' || game_state === 'stateInfo' || game_state === 'new' || game_state === 'win' || game_state === 'lose') return

  this.popup.textFont('IM Fell English SC')
  this.popup.textSize(30)
  this.popup.noStroke()
  this.popup.fill(50, 50, 200)
  this.popup.rect(0, popup.height-50, popup.width/3, 50)
  this.popup.fill(220)
  this.popup.rect(popup.width/3, popup.height-50, popup.width/3, 50)
  this.popup.fill(20, 160, 50)
  this.popup.rect(2*popup.width/3, popup.height-50, popup.width/3, 50)
  this.popup.fill(0)
  this.popup.textAlign(CENTER, CENTER)

  this.popup.fill(0)
  if(mouseY < window.innerHeight/2+this.popup.height/2 && mouseY > window.innerHeight/2+this.popup.height/2-50) {
    if(mouseX < window.innerWidth/2+this.popup.width/2-2*this.popup.width/3 && mouseX > window.innerWidth/2-this.popup.width/2) {
      this.popup.fill(255)
    }
  }
  this.popup.text("Religion", this.popup.width/2 - this.popup.width/3, this.popup.height - 25)

  this.popup.fill(0)
  if(mouseY < window.innerHeight/2+this.popup.height/2 && mouseY > window.innerHeight/2+this.popup.height/2-50) {
    if(mouseX < window.innerWidth/2+this.popup.width/2-this.popup.width/3 && mouseX > window.innerWidth/2+this.popup.width/2 - 2*this.popup.width/3) {
      this.popup.fill(255)
    }
  }
  this.popup.text("Evangelism", this.popup.width/2, this.popup.height - 25)

  this.popup.fill(0)
  if(mouseY < window.innerHeight/2+this.popup.height/2 && mouseY > window.innerHeight/2+this.popup.height/2-50) {
    if(mouseX < window.innerWidth/2+this.popup.width/2 && mouseX > window.innerWidth/2+this.popup.width/2 - this.popup.width/3) {
      this.popup.fill(255)
    }
  }
  this.popup.text("Resistances", this.popup.width/2 + this.popup.width/3, this.popup.height - 25)
  this.popup.fill(0)
}

let maxNameLength = 30

function keyPressed() {
  if(game_state === 'new') {
    if(keyCode === 8) {
      religionName = religionName.slice(0, religionName.length-1)
    } else if(keyCode === 13 && religionName.length > 0) {
      messageDisplayed = true
      messageSetTime = millis()
      message1 = "Click where you want to"
      message2 = "start spreading Enlightenment"
      game_state = 'start'
    }
  }
}

function keyTyped() {
  if(game_state === 'new' && keyCode !== 13 && !(religionName.length >= maxNameLength)) {
    religionName += key
  }
}

function mouseClicked() {
  if(game_state === 'win' || game_state === 'lose') {
    location.reload()
    return
  }

  if(game_state === 'new') {
    if(mouseY > window.innerHeight/2+this.popup.height/2 - 100  && mouseY < window.innerHeight/2+this.popup.height/2-50 &&
      mouseX > window.innerWidth/2-150 && mouseX < window.innerWidth/2+150 && religionName.length > 0){
        buttonClick.play()
        messageDisplayed = true
        messageSetTime = millis()
        message1 = "Click where you want to"
        message2 = "start spreading Enlightenment"
        game_state = 'start'
        return
      }
    return
  }

  if(mouseY < window.innerHeight && mouseY > window.innerHeight - 100) {
    if(mouseX < 4*window.innerWidth/5 + 100 && mouseX > 4*window.innerWidth/5 - 100) {
      if(game_state === 'start' || game_state === 'play') last_state = game_state
      buttonClick.play()
      game_state = 'heathens'
      return
    }
    if(mouseX < window.innerWidth/5 + 100 && mouseX > window.innerWidth/5 - 100) {
      if(game_state === 'start' || game_state === 'play') last_state = game_state
      game_state = 'religion'
      buttonClick.play()
      return
    }
  }

  if(game_state === 'stateInfo') {
    if(mouseY > window.innerHeight/2+this.popup.height/2 - 100  && mouseY < window.innerHeight/2+this.popup.height/2-50 &&
      mouseX > window.innerWidth/2-100 && mouseX < window.innerWidth/2+100){
        buttonClick.play()
        game_state = last_state
        return
      }
  }

  if(game_state === 'religion' || game_state === 'evangelism' || game_state === 'resistances'  || game_state === 'heathens') {
    if(mouseY > window.innerHeight/2+this.popup.height/2 || mouseY < window.innerHeight/2-this.popup.height/2 ||
      mouseX < window.innerWidth/2-this.popup.width/2 || mouseX > window.innerWidth/2+this.popup.width/2){
        game_state = last_state
        return
      }
    if(game_state === 'heathens') return
    if(mouseY < window.innerHeight/2+this.popup.height/2 && mouseY > window.innerHeight/2+this.popup.height/2-50) {
      if(mouseX < window.innerWidth/2+this.popup.width/2 && mouseX > window.innerWidth/2+this.popup.width/2 - this.popup.width/3) {
        buttonClick.play()
        game_state = 'resistances'
      }
      else if(mouseX < window.innerWidth/2+this.popup.width/2 && mouseX > window.innerWidth/2+this.popup.width/2 - 2*this.popup.width/3) {
        buttonClick.play()
        game_state = 'evangelism'
      }
      else if(mouseX < window.innerWidth/2+this.popup.width/2 && mouseX > window.innerWidth/2-this.popup.width/2) {
        buttonClick.play()
        game_state = 'religion'
      }
    }
    if(game_state === 'evangelism') {
      for(method in evangelism) {
        let circle1 = {radius: 1, x: mouseX, y: mouseY}
        let circle2 = {radius: 36, x: evangelism[method].x+window.innerWidth/2-this.popup.width/2, y: evangelism[method].y+window.innerHeight/2-this.popup.height/2}

        let dx = circle1.x - circle2.x
        let dy = circle1.y - circle2.y
        let distance = sqrt(dx * dx + dy * dy)
        if(distance < circle1.radius + circle2.radius) {
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
              messageDisplayed = true
              messageSetTime = millis()
              message1 = evangelism[method].upgradeMessage.split('^')[0]
              message2 = evangelism[method].upgradeMessage.split('^')[1]
              methods[index].probOccur = evangelism[method].probOccur
              methods[index].probSpread = evangelism[method].probSpread
            }
          }
      }
    } else if(game_state === 'resistances') {
        for(resist in resists) {
          let circle1 = {radius: 1, x: mouseX, y: mouseY}
          let circle2 = {radius: 36, x: resists[resist].x+window.innerWidth/2-this.popup.width/2, y: resists[resist].y+window.innerHeight/2-this.popup.height/2}

          let dx = circle1.x - circle2.x
          let dy = circle1.y - circle2.y
          let distance = sqrt(dx * dx + dy * dy)
          if(distance < circle1.radius + circle2.radius) {
              if(resists[resist].state === 'available' && blessings >= resists[resist].cost) {
                resists[resist].state = 'bought'
                blessings -= resists[resist].cost
                resistances[resist.split(' ')[0].toLowerCase()] = resists[resist].resistance
                messageDisplayed = true
                messageSetTime = millis()
                message1 = resists[resist].upgradeMessage.split('^')[0]
                message2 = resists[resist].upgradeMessage.split('^')[1]
                if(parseInt(resist.split(' ')[1])+1 <= 4) {
                    resists[`${resist.split(' ')[0]} ${parseInt(resist.split(' ')[1])+1}`].state = 'available'
                }
              }
            }
          }
      }
    }
}

function mapClicked(geography) {
  if(game_state !== 'start' && game_state !== 'play') return
  for(let i = 0; i < states.length; i++) {
    if(states[i].sid === geography.id) {
      if(game_state === 'start'){
        startState = states[i].name
        states[i].converted = 1
        messageSetTime = millis()
        messageDisplayed = true
        message1 = "You begin your religion by having"
        message2 = "weekly sermons in your basement"
        game_state = 'play'
      } else {
        infoState = states[i]
        last_state = game_state
        game_state = 'stateInfo'
      }
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
