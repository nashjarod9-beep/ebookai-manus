const EventEmitter = require('events');
const progressEmitter = new EventEmitter();

// Cache pour stocker l'état actuel de la progression par livre
const progressCache = {};

const updateProgress = (bookId, step, message, extra = {}) => {
  const data = { 
    bookId,
    step, 
    message, 
    timestamp: Date.now(), 
    ...extra 
  };
  progressCache[bookId] = data;
  progressEmitter.emit(`progress:${bookId}`, data);
  console.log(`[Progress Update] Book ${bookId} -> Step: ${step}, Message: ${message}`);
};

const getProgressCache = (bookId) => {
  return progressCache[bookId] || { bookId, step: 'init', message: 'Initialisation...' };
};

module.exports = {
  updateProgress,
  getProgressCache,
  progressEmitter
};
