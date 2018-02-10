function setup() {
  noCanvas()
  let container = createDiv('')
  container.id('container')
  container.style('width', `${window.innerWidth}`)
  container.style('height', `${window.innerHeight}`)
  var datamap = new Datamap({element: document.getElementById('container')});
}

function draw() {
}
