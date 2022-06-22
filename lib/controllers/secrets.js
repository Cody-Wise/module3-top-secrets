const { Router } = require('express');
const authenticate = require('../middleware/authenticate');
const Secret = require('../models/Secret');

module.exports = Router()
  .post('/', authenticate, async (req, res, next) => {
    try {
      const data = await Secret.insert(req.body);
      res.json(data);
    } catch (e) {
      next(e);
    }
  })
  .get('/', authenticate, async (req, res, next) => {
    try {
      const data = await Secret.getAll();
      res.json(data);
    } catch (e) {
      next(e);
    }
  });
