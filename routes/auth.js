const { Router } = require('express');
const router = Router();
const User = require('../models/schemas/schUser');

router.get('/login', async (req, res) => {
  res.render('auth/login.hbs', {
    title: 'Authorization',
    isLogin: true,
  });
});

router.get('/logout', async (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth/login#login');
  });
});

router.post('/login', async (req, res) => {
  const user = await User.findById('605c298993a6da28205e86cd');
  req.session.user = user;
  req.session.isAuthenticated = true;
  // req.session может не успеть отрабоать по этому save
  req.session.save(err => {
    if (err) {
      throw err;
    }
    res.redirect('/');
  });
});

router.post('/register', async (req, res) => {
  try {
    const { email, password, repeat, name } = req.body;
    const candidate = await User.findOne({ email });
    if (candidate) {
      res.redirect('/auth/login#register');
    } else {
      const user = new User({ email, name, password, cart: { items: [] } });
      const newUser = await user.save();
      res.redirect('/auth/login#login');
    }
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
