const { Router } = require('express');
const authMiddleware = require('../middleware/midAuth');
const courseSchema = require('../models/schemas/schCourse');
const router = Router();

router.get('/', authMiddleware, (req, res) => {
  res.status(200);
  res.render('add', {
    title: 'Add course',
    isAdd: true,
  });
});

router.post('/', authMiddleware, async (req, res) => {
  const { title, price, image } = req.body;
  const course = new courseSchema({
    title,
    price,
    image,
    // userId: req.user._id,
    userId: req.user,
  });
  try {
    await course.save();
    res.redirect('/courses');
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
