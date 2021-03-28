const { Router } = require('express');
const Order = require('../models/schemas/schOrder');
const authMiddleware = require('../middleware/midAuth');
const router = Router();

//  get запрос это просто клик по ссылке из navbar.hbs
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userOrders = await Order.find({
      'user.userId': req.user._id,
    }).populate('user.userId');

    const orders = userOrders.map(order => {
      return {
        ...order._doc,
        price: order.courses.reduce((total, { count, course }) => {
          return (total += count * course.price);
        }, 0),
      };
    });

    await res.status(200);
    res.render('order.hbs', {
      title: 'Orders',
      isOrder: true,
      orders,
    });
  } catch (e) {
    console.log(e);
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const user = await req.user.populate('cart.items.courseId').execPopulate();

    const courses = user.cart.items.map(item => ({
      count: item.count,
      course: { ...item.courseId._doc },
    }));

    const order = new Order({
      courses,
      user: {
        name: req.user.name,
        userId: req.user,
      },
    });

    await order.save();
    await req.user.clearCart();

    res.redirect('/order'); // этот редирект это get запрос
  } catch (e) {
    console.log(e);
  }
});

module.exports = router;
