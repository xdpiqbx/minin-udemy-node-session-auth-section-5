const { Router } = require('express');
const authMiddleware = require('../middleware/midAuth');
const courseSchema = require('../models/schemas/schCourse');
const router = Router();

router.get('/', async (req, res) => {
  const courses = await courseSchema
    .find()
    .populate('userId', 'email name')
    .select('price title image');

  res.status(200);
  res.render('courses', {
    title: 'Courses',
    isCourses: true,
    courses,
  });
});

router.get('/:id/edit', authMiddleware, async (req, res) => {
  if (!req.query.allow) {
    return res.redirect('/');
  }
  const course = await courseSchema.findById(req.params.id);
  res.render('course-edit', {
    title: `Edit ${course.title}`,
    course,
  });
});

router.post('/edit', authMiddleware, async (req, res) => {
  // await Course.update(req.body);
  const { id } = req.body;
  delete req.body.id;
  await courseSchema.findByIdAndUpdate(id, req.body);
  res.redirect('/courses');
});

router.post('/remove', authMiddleware, async (req, res) => {
  try {
    await courseSchema.findByIdAndDelete(req.body.id);
    res.redirect('/courses');
  } catch (error) {
    console.log(error);
  }
});

router.get('/:id', async (req, res) => {
  const course = await courseSchema.findById(req.params.id);
  res.render('course', {
    layout: 'empty',
    title: `Course: ${course.title}`,
    course,
  });
});

module.exports = router;
