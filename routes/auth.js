const { Router } = require('express');
const router = Router();

router.get('/login', async (req, res) => {
  res.render('auth/login.hbs', {
    title: 'Authorization',
    isLogin: true,
  });
});

module.exports = router;
