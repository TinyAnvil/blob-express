import '@babel/polyfill';

import express from 'express'
import cors from 'cors'
import { json } from 'body-parser'
import logger from 'morgan'
import _ from 'lodash'

import router from './router/router'

process.on('uncaughtException', (err) => console.error(err))

const app = express()
const port = process.env.PORT || 3000

app.use(logger('dev'))
app.use(cors())
app.use(json())

_.each(router, (route) => app.use(route.root, route.router))

app.use((req, res) => res.sendStatus(404))

app.use((err, req, res, next) => {
  console.error(err)

  res.status(_.get(err, 'response.status', 500))
  res.json(_.get(err, 'response.data', err))
})

app.listen(port, () => {
  console.log('Express server is listening on port', port)
})

export default app
