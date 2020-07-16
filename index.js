const express = require('express')
const bodyParser = require('body-parser')

const app = express()

app.set('views', './server/views')
app.use(express.static('./server/public'))
app.use(bodyParser.urlencoded({ extended: true }))

let count
let solution
let working

const sudoku = [
  [0, 0, 0, 0, 5, 0, 7, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 1],
  [0, 0, 0, 0, 9, 3, 0, 8, 0],
  [0, 0, 0, 0, 0, 0, 2, 0, 4],
  [6, 0, 8, 0, 0, 5, 3, 0, 0],
  [0, 0, 9, 0, 6, 0, 5, 0, 0],
  [9, 0, 0, 7, 2, 4, 0, 0, 0],
  [0, 0, 6, 0, 0, 0, 0, 0, 3],
  [0, 1, 0, 6, 0, 0, 0, 7, 0]
]

const processFormData = b => {
  const a = [[], [], [], [], [], [], [], [], []]
  for (const cell in b) a[cell.split('-')[0]][cell.split('-')[1]] = parseInt(b[cell]) || [1, 2, 3, 4, 5, 6, 7, 8, 9]
  return a
}

const square = a => [
  [a[0][0], a[0][1], a[0][2], a[1][0], a[1][1], a[1][2], a[2][0], a[2][1], a[2][2]],
  [a[0][3], a[0][4], a[0][5], a[1][3], a[1][4], a[1][5], a[2][3], a[2][4], a[2][5]],
  [a[0][6], a[0][7], a[0][8], a[1][6], a[1][7], a[1][8], a[2][6], a[2][7], a[2][8]],
  [a[3][0], a[3][1], a[3][2], a[4][0], a[4][1], a[4][2], a[5][0], a[5][1], a[5][2]],
  [a[3][3], a[3][4], a[3][5], a[4][3], a[4][4], a[4][5], a[5][3], a[5][4], a[5][5]],
  [a[3][6], a[3][7], a[3][8], a[4][6], a[4][7], a[4][8], a[5][6], a[5][7], a[5][8]],
  [a[6][0], a[6][1], a[6][2], a[7][0], a[7][1], a[7][2], a[8][0], a[8][1], a[8][2]],
  [a[6][3], a[6][4], a[6][5], a[7][3], a[7][4], a[7][5], a[8][3], a[8][4], a[8][5]],
  [a[6][6], a[6][7], a[6][8], a[7][6], a[7][7], a[7][8], a[8][6], a[8][7], a[8][8]]
]

// const square = a => {
//   const b = [[], [], [], [], [], [], [], [], []]

//   for (let i = 0; i < 9; i++) {
//     for (let j = 0; j < 3; i++) {

//     }
//   }
// }

const unsquare = a => square(a)

const removePencilMarks = (a, count, pass) => {
  console.log(`${count}: ${pass} pencil`)

  const before = JSON.stringify(a)

  for (let r = 0; r < 9; r++) {
    let working = true

    while (working) {
      working = false

      const before = JSON.stringify(a[r])

      for (let c = 0; c < 9; c++) {
        if (Array.isArray(a[r][c])) {
          a[r][c] = a[r][c].filter(e => !a[r].filter(n => Number.isInteger(n)).includes(e))
          if (a[r][c].length === 1) a[r][c] = a[r][c][0]
        }
      }

      const after = JSON.stringify(a[r])

      if (before !== after) working = true
    }
  }

  const after = JSON.stringify(a)

  if (before !== after) working = true

  return a
}

const singles = (a, count, pass) => {
  console.log(`${count}: ${pass} singles`)

  const before = JSON.stringify(a)

  for (let r = 0; r < 9; r++) {
    // [...Array(10).keys]
    for (let n = 1; n < 10; n++) {
      if (!a[r].includes(n)) {
        if (a[r].filter(e => Array.isArray(e) && e.includes(n)).length === 1) {
          a[r][a[r].findIndex(e => Array.isArray(e) && e.includes(n))] = n
        }
      }
    }
  }

  const after = JSON.stringify(a)

  if (before !== after) working = true

  return a
}

const transpose = a => a[0].map((_, i) => a.map(e => e[i]))

app.get('/', (_, res) => { res.render('index.ejs', { sudoku: sudoku }) })

app.post('/', (req, res) => {
  solution = processFormData(req.body)

  count = 0
  working = true

  while (working) {
    count++
    working = false

    solution = square(solution)

    solution = removePencilMarks(solution, count, 'square')
    solution = singles(solution, count, 'square')

    solution = unsquare(solution)

    solution = removePencilMarks(solution, count, 'horizontal')
    solution = singles(solution, count, 'horizontal')

    solution = transpose(solution)

    solution = removePencilMarks(solution, count, 'vertical')
    solution = singles(solution, count, 'vertical')

    solution = transpose(solution)
  }

  res.redirect('/solution')
})

app.get('/solution', (_, res) => { res.render('solution.ejs', { sudoku: sudoku, solution: solution }) })

app.listen(4000)

// [1][4] = 2
// [2][2] = 7
// [1][2] = 6
