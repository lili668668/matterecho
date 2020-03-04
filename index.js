require('dotenv').config()
const express = require('express')
const axios = require('axios')
const parse = require('csv-parse/lib/sync')
const _ = require('lodash')

const app = express()

app.use(express.json())

app.get('/', function (req, res) {
  res.status(200).send()
})

app.post('/', function (req, res) {
  axios.get(process.env.GOOGLE_SPREADSHEET_CSV_URL)
    .then((csv) => {
      const rows = parse(csv.data, { columns: true })
      const targets = rows.filter((item) => req.body.text.includes(item.keywords))
      if (targets.length === 0) return res.status(200).send()
      const index = _.random(targets.length - 1)
      axios({
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        url: process.env.MATTERMOST_INCOME_HOOK,
        data: {
          text: targets[index].reply
        }
      })
      res.status(200).send()
    })
})

app.get('/ping', (_, res) => {
  res.send('pong')
})

app.listen(7302, () => console.log('server on 7302'))

