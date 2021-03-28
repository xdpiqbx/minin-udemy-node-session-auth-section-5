# Section 5: Практика: сессии и авторизация

## 62. Тестирование пользователей

---

## 61. Сообщения об ошибке

---

## 60. Добавление CSRF-защиты

---

## 59. Шифрование пароля

---

## 58. Логин пользователя

```js
// /routes/auth.js // переписал логику логина
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const candidate = await User.findOne({ email });
    if (!candidate) {
      res.redirect('/auth/login#login');
    } else {
      const areSame = password === candidate.password;
      if (!areSame) {
        res.redirect('/auth/login#login');
      } else {
        req.session.user = candidate;
        req.session.isAuthenticated = true;
        req.session.save(err => {
          if (err) {
            throw err;
          }
          res.redirect('/');
        });
      }
    }
  } catch (error) {
    console.log(error);
  }
});
```

---

## 57. Регистрация пользователя

```js
// /routes/auth.js
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
```

```js
// /models/schemas/schUser.js
const userSchema = new Schema({
  password: {
    // просто добавил это поле
    type: String,
    required: true,
  },
});
```

---

## 56. Исправление работы корзины

```js
// Создаю middleware
// /middleware/midUser.js
const User = require('../models/schemas/schUser');

module.exports = async function (req, res, next) {
  if (!req.session.user) {
    return next();
  }
  req.user = await User.findById(req.session.user._id);
  next();
};
```

```js
// Подключаю middleware в index.js
const userMiddleware = require('./middleware/midUser');
app.use(userMiddleware);
```

```js
router.post('/add', authMiddleware, async (req, res) => {
  const course = await Course.findById(req.body.id);
  // до использования middleware пользователь хранился в сессии, а в сессии просто лежат его данные а не объект Mongoose и метода .addToCart у него нету
  await req.user.addToCart(course);
  res.redirect('/cart');
});
```

---

## 55. Защита роутов

```js
// /middleware/midAuth.js
// Создаю middleware
module.exports = function (req, res, next) {
  if (!req.session.isAuthenticated) {
    return res.redirect('/auth/login');
  }
  next();
};
```

```js
// Подключаю middleware везде где надо защитить пути
const authMiddleware = require('../middleware/midAuth');

router.post('/add', authMiddleware, async (req, res) => { ...
router.delete('/remove/:id', authMiddleware, async (req, res) => { ...
router.get('/', authMiddleware, async (req, res) => { ...
```

---

## 54. Сессия в базе данных

[connect-mongodb-session](https://www.npmjs.com/package/connect-mongodb-session) -
This module exports a single function which takes an instance of connect (or
Express) and returns a MongoDBStore class that can be used to store sessions in
MongoDB.

```code
npm i connect-mongodb-session
```

```js
// index.js
const MongoDBStore = require('connect-mongodb-session')(session);

const MONGODB_URI = `mongodb+srv://user:pass@cluster.lag7a.mongodb.net/db`;

const store = new MongoDBStore({
  collection: 'sessions',
  uri: MONGODB_URI,
});

app.use(
  session({
    secret: 'secretString',
    resave: false,
    saveUninitialized: false,
    store, // добавляю место хранения сессии
  }),
);

try {
  await mongoose.connect(MONGODB_URI, { ....
```

```hbs
<!-- /view/courses.hbs тут скрываю кнопки от неавторизированых пользователей -->
{{#each courses}}
  {{#if @root.isAuth}}
    <a href="/courses/{{id}}/edit?allow=true">Edit</a>
    <form action="/cart/add" method="POST">
      <input type="hidden" name="id" value={{id}} />
      <button type="submit" class="btn btn-primary">Add to cart</button>
    </form>
  {{/if}}
{{/each}}
```

---

## 53. Сохранение сессии

В **`index.js`** убрать

```js
// app.use(async (req, res, next) => {
//   try {
//     const user = await User.findById('605c298993a6da28205e86cd');
//     req.user = user;
//     next();
//   } catch (e) {
//     console.log(e);
//   }
// });

// const candidate = await User.findOne();
// if (!candidate) {
//   const user = new User({
//     email: 'fish@mail.com',
//     name: 'John Fishman',
//     cart: { items: [] },
//   });
//   await user.save();
// }
```

```js
// /routes/auth.js (жду пользователя которого убрал выше)
const User = require('../models/schemas/schUser');

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
```

---

## 52. Добавление сессии

[express-session](https://www.npmjs.com/package/express-session) - Create a
session middleware

```code
npm i express-session
```

```js
// index.js
const session = require('express-session');
const varsMiddleware = require('./middleware/variables');

app.use(
  session({
    secret: 'secretString',
    resave: false,
    saveUninitialized: false,
  }),
);
app.use(varsMiddleware); // из /middleware/variables.js
```

```js
// routes/auth.js  ===---> Login POST and Logout GET
// ...
router.get('/logout', async (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth/login#login');
  });
});

router.post('/login', async (req, res) => {
  req.session.isAuthenticated = true;
  res.redirect('/');
});
router.post('/register', async (req, res) => {});
// ...
```

```js
// /middleware/variables.js
module.exports = function (req, res, next) {
  res.locals.isAuth = req.session.isAuthenticated;
  next();
};
```

```hbs
<!-- /views/partials/navbar.hbs -->
<!-- Сейчас для каждого ответа есть переменная isAuth тепероь можно скрыть пути -->
{{#if isAuth}}
  {{#if isAdd}}
    <li class="active"><a href="/add">Add course</a></li>
  {{else}}
    <li><a href="/add">Add course</a></li>
  {{/if}}

  {{#if isCart}}
    <li class="active"><a href="/cart">Cart</a></li>
  {{else}}
    <li><a href="/cart">Cart</a></li>
  {{/if}}

  {{#if isOrder}}
    <li class="active"><a href="/order">Order</a></li>
  {{else}}
    <li><a href="/order">Order</a></li>
  {{/if}}
  <li><a href="/auth/logout">Logout</a></li> <!-- добавил возможность логаута -->
{{else}}
  {{#if isLogin}}
    <li class="active"><a href="/login#login">Login</a></li>
  {{else}}
    <li><a href="/auth/login#login">Login</a></li>
  {{/if}}
{{/if}}
```

---

## 51. Страница логина

```hbs
<!-- /views/auth/login.hbs -->
<!-- https://materializecss.com/tabs.html -->
<div class="row">
  <div class="col s12">
    <ul class="tabs">
      <li class="tab col s6"><a class="active" href="#login">login</a></li>
      <li class="tab col s6"><a href="#register">register</a></li>
    </ul>
  </div>
  <div id="login" class="col s6 offset-s3">Test 1</div>
  <div id="register" class="col s6 offset-s3">Test 2</div>
</div>
```

```js
// /routes/auth.js ===---> GET
const { Router } = require('express');
const router = Router();

router.get('/login', async (req, res) => {
  res.render('auth/login.hbs', {
    title: 'Authorization',
    isLogin: true,
  });
});

module.exports = router;
```

```js
// /index.js
const authRoutes = require('./routes/auth');
//...
app.use('/auth', authRoutes);
//...
```

```hbs
<!-- /views/partials/navbar.hbs -->
  {{#if isLogin}}
    <li class="active"><a href="/login#login">Login</a></li>
  {{else}}
    <li><a href="/auth/login#login">Login</a></li>
  {{/if}}
```

```js
// public/app.js //инициализация табов
M.Tabs.init(document.querySelectorAll('.tabs'));
```
