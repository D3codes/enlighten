class State {

  constructor(sid, borders, population, name) {
    this.sid = sid
    this.name = name
    this.borders = borders
    this.population = population
    this.converted = 0
  }

  spread(state, methods, dampeners, resistances) {
    if(this.converted === this.population) return
    if(state.converted === 0) return

    let loopNum = 3
    let people = 0
    if(this.sid === state.sid) loopNum = methods.length
    else if(this.borders.indexOf(state.sid) > -1) loopNum = 5
    for(let i = 0; i < loopNum; i++) {
      let probSpread = methods[i].probSpread
      if(random() < methods[i].probOccur) {
        switch(i) {
          case 1:
          case 3:
          case 4:
            probSpread -= dampeners.christianity.media*resistances.christianity
            probSpread -= dampeners.judaism.media*resistances.judaism
            probSpread -= dampeners.islam.media*resistances.islam
            probSpread -= dampeners.scientology.media*resistances.scientology
            break
          case 0:
          case 2:
          case 5:
          probSpread -= dampeners.christianity.wordOfMouth*resistances.christianity
          probSpread -= dampeners.judaism.wordOfMouth*resistances.judaism
          probSpread -= dampeners.islam.wordOfMouth*resistances.islam
          probSpread -= dampeners.scientology.wordOfMouth*resistances.scientology
            break
        }

        let s = ceil(random(this.population * probSpread))
        if(s + this.converted > this.population) s = this.population - this.converted
        people += s
        //people += ceil(random(map(this.converted / probSpread, 0, this.population / probSpread, 1, this.population - this.converted)))
      }
    }
    this.converted += people

    let totalDeconversion = 1
    totalDeconversion += floor(dampeners.christianity.deconversion*resistances.christianity)
    totalDeconversion += floor(dampeners.judaism.deconversion*resistances.judaism)
    totalDeconversion += floor(dampeners.islam.deconversion*resistances.islam)
    totalDeconversion += floor(dampeners.scientology.deconversion*resistances.scientology)
    this.converted = ceil(this.converted/totalDeconversion)

    if(this.converted > this.population) this.converted = this.population
    if(this.coverted < this.population) this.converted = 0
  }
}
