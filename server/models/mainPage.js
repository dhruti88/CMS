const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // User who created the page
    required: true
  },
  template: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SampleTemplate',  // Reference to the template
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  sectionDetails: [{
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',  // Reference to Section model
      required: true
    },
    assignedUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'  // Users who can edit this section
    }],
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed'],  // Section progress status
      default: 'Pending'
    },
    deadline: {
      type: Date  // Deadline for section completion
    }
  }],
  status: {
    type: String,
    enum: ['Draft', 'Published', 'Archived'], // Page status options
    default: 'Draft'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware to update 'updatedAt' before saving
pageSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Page', pageSchema);
