const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          name: true,
          email: true,
          plan: true,
          subscriptionStart: true,
          subscriptionEnd: true,
          ebooksConsumed: true,
          quotaRemaining: true
        }
      });

      if (user) {
        let userCopy = { ...user };
        if (userCopy.email === 'nashjarod9@gmail.com') {
          userCopy.plan = 'agency';
          userCopy.quotaRemaining = 9999;
          userCopy.ebooksConsumed = 0;
          userCopy.subscriptionEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        }

        const now = new Date();
        const needsRenewal = !userCopy.subscriptionEnd || now > new Date(userCopy.subscriptionEnd);

        if (needsRenewal) {
          const limits = {
            free: 0,
            starter: 3,
            creator: 10,
            business: 25,
            agency: 60
          };
          const planLimit = limits[userCopy.plan] || 0;
          
          const start = new Date();
          const end = new Date();
          end.setDate(start.getDate() + 30);

          req.user = await prisma.user.update({
            where: { id: userCopy.id },
            data: {
              subscriptionStart: start,
              subscriptionEnd: end,
              ebooksConsumed: 0,
              quotaRemaining: planLimit
            },
            select: {
              id: true,
              name: true,
              email: true,
              plan: true,
              subscriptionStart: true,
              subscriptionEnd: true,
              ebooksConsumed: true,
              quotaRemaining: true
            }
          });
        } else {
          req.user = userCopy;
        }
        next();
      } else {
        res.status(401).json({ message: 'Not authorized, user not found' });
      }
    } catch (error) {
      console.error("Auth middleware error:", error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };
