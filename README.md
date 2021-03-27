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

---

## 57. Регистрация пользователя

---

## 56. Исправление работы корзины

---

## 55. Защита роутов

---

## 54. Сессия в базе данных

---

## 53. Сохранение сессии

---

## 52. Добавление сессии

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
// /routes/auth.js
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
