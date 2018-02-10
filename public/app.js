function setup() {
  let canvasHeight = 0//50
  noCanvas()
  //createCanvas(window.innerWidth, canvasHeight)
  let container = createDiv('')
  container.id('container')
  container.style('width', `${window.innerWidth}`)
  container.style('height', `${window.innerHeight - canvasHeight}`)
  let datamap = new Datamap({element: document.getElementById('container'), done: function(map) {
    map.svg.selectAll('.datamaps-subunit').on('click', (geography) => {
      fetch(`country/${geography.id}/borders`).then((res) => {
        return res.json()
      }).then((data) => {
        console.log(data)
      })
    })
  }, fills: {
    defaultFill: '#333333'
  }, geographyConfig: {
    highlightFillColor: '#3333FF',
    highlightBorderColor: '#3333FF'
  }})


}

function draw() {
  background(0)
}
