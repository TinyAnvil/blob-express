import express from 'express'

import get from './get'

const router = express.Router()

router.get('/get', get)

export default {
  root: '/blob',
  router
}
