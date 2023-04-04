const express = require('express');
const router = express.Router();

router.post('/events', async (req, res) => {
  res.send('hello world');
});

module.exports = router;
