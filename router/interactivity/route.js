const express = require('express');
const router = express.Router();

router.post('/interactivity', async (req, res) => {
  res.send('hello world');
});

module.exports = router;
