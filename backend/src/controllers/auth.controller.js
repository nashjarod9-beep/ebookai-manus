const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Veuillez remplir tous les champs' });
    }

    const userExists = await prisma.user.findUnique({ where: { email } });

    if (userExists) {
      return res.status(400).json({ message: 'Cet utilisateur existe déjà' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
    });

    if (user) {
      res.status(201).json({
        id: user.id,
        name: user.name,
        email: user.email,
        plan: user.email === 'nashjarod9@gmail.com' ? 'agency' : user.plan,
        token: generateToken(user.id),
      });
    } else {
      res.status(400).json({ message: 'Données utilisateur invalides' });
    }
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        plan: user.email === 'nashjarod9@gmail.com' ? 'agency' : user.plan,
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: 'Email ou mot de passe invalide' });
    }
  } catch (error) {
    next(error);
  }
};

const googleAuth = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Token Google manquant' });
    }

    // Verify token with Google's API natively using fetch
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);

    if (!response.ok) {
      return res.status(400).json({ message: 'Token Google invalide' });
    }

    const payload = await response.json();

    // Verify token is issued by Google
    const validIssuers = ['accounts.google.com', 'https://accounts.google.com'];
    if (!validIssuers.includes(payload.iss)) {
      return res.status(400).json({ message: 'Émetteur du token Google invalide' });
    }

    // Verify client ID if VITE_GOOGLE_CLIENT_ID or GOOGLE_CLIENT_ID is set
    const googleClientId = process.env.VITE_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
    if (googleClientId && payload.aud !== googleClientId && payload.azp !== googleClientId) {
      console.warn(`Google login client ID warning. Expected ${googleClientId}, got aud: ${payload.aud}, azp: ${payload.azp}`);
    }

    const { email, name } = payload;

    // Check if user already exists
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Create user if they don't exist
      const salt = await bcrypt.genSalt(10);
      const dummyPassword = Math.random().toString(36).substring(2);
      const passwordHash = await bcrypt.hash(dummyPassword, salt);

      user = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
        }
      });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      plan: user.email === 'nashjarod9@gmail.com' ? 'agency' : user.plan,
      token: generateToken(user.id)
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    res.json(req.user);
  } catch (error) {
    next(error);
  }
};

const updateUserPlan = async (req, res, next) => {
  try {
    const { plan } = req.body;
    const validPlans = ['free', 'starter', 'creator', 'business', 'agency'];
    if (!validPlans.includes(plan)) {
      return res.status(400).json({ message: 'Plan invalide' });
    }

    const limits = {
      free: 0,
      starter: 3,
      creator: 10,
      business: 25,
      agency: 60
    };
    const planLimit = limits[plan] || 0;

    const start = new Date();
    const end = new Date();
    end.setDate(start.getDate() + 30);

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        plan,
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

    res.json({ user: updatedUser });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  googleAuth,
  getMe,
  updateUserPlan
};
