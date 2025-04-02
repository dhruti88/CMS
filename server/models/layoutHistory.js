import mongoose from 'mongoose';
const { Schema } = mongoose;

// Create a new schema for layout history
const LayoutHistorySchema = new Schema({
  layoutId: { 
    type: String, 
    ref: 'Layout', 
    required: true 
  },
  userId: { 
    type: String, 
    ref: 'User', 
    required: true 
  },
  userName: {
    type: String,
    required: true
  },
  actionType: { 
    type: String, 
    required: true, 
    enum: ['created', 'updated', 'deleted', 'viewed'] 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  },
  previousVersion: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  changes: {
    type: Object,
    default: null
  },
  metadata: {
    title: { type: String },
    city: { type: String },
    state: { type: String },
    layoutType: { type: String },
    status: { type: String }
  }
}, { 
  timestamps: true 
});

const LayoutHistory = mongoose.model('LayoutHistory', LayoutHistorySchema);

export default LayoutHistory;