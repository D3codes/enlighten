class State {

  constructor(sid, borders, population, name) {
    this.sid = sid
    this.name = name
    this.borders = borders
    this.population = population
    this.converted = 0
  }

  spread(state, methods) {
    if(this.converted === this.population) return
    if(state.converted === 0) return

    let loopNum = 3
    let people = 0
    if(this.sid === state.sid) loopNum = methods.length
    else if(this.borders.indexOf(state.sid) > -1) loopNum = 5
    for(let i = 0; i < loopNum; i++) {
      if(random() < methods[i].probOccur) {
        people += ceil(random(map(this.converted / methods[i].probSpread, 0, this.population / methods[i].probSpread, 1, this.population - this.converted)))
        //people += ceil(random(map(this.population-this.converted, 0, this.population, this.population-this.converted, 1)) * methods[i].probSpread)
      }
    }
    this.converted += people
  }
}
