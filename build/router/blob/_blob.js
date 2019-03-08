import express from 'express'

import get from './get'

const router = express.Router()

router.get('/blob.png', get)
router.get('/blob.svg', get)

export default {
  root: '/',
  router
}
