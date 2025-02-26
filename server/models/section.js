const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
  sectionId: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true
  },
  sectionType: {
    type: String,
    enum: ['news','advertisement'],
    default :'news'
  },
  posX: {
    type: Number,
    required: true
  },
  posY: {
    type: Number,
    required: true
  },
  sectionWidth: {
    type: Number,
    required: true
  },
  sectionHeight: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Section', sectionSchema);
