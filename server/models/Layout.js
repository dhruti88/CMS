// layout.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

// Define SectionItem schema (for items inside a section)
const SectionItem = new Schema({
  id: { type: String, required: true },
  type: { type: String, required: true }, // e.g. "text", "image"
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  rotation: { type: Number, default: 0 },
  text: { type: String },
  fontSize: { type: Number },
  fontStyle: { type: String },
  textDecoration: { type: String, default: '' },
  fontFamily: { type: String },
  align: { type: String },
  padding: { type: Number },
  backgroundFill: { type: String },
  fill: { type: String },
  stroke: { type: String },
  strokeWidth: { type: Number, default: 1 },
  draggable: { type: Boolean, default: true },
  opacity: { type: Number, default: 1 },
  scaleX: { type: Number, default: 1 },
  scaleY: { type: Number, default: 1 },
  src: { type: String },
  sizeInfo: {
    cols: { type: Number },
    rows: { type: Number },
    label: { type: String },
  },
  gridX: { type: Number, required: true },
  gridY: { type: Number, required: true },
}, { _id: false });

// Define SectionSchema – a section contains multiple items
const SectionSchema = new Schema({
  id: { type: String, required: true },
  sectionType: { type: String, required: true }, // For example: "section"
  gridX: { type: Number, required: true },
  gridY: { type: Number, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  draggable: { type: Boolean, default: true },
  sizeInfo: {
    cols: { type: Number },
    rows: { type: Number },
    label: { type: String },
  },
  items: [SectionItem],
  zIndex: { type: Number, default: 0 },
}, { _id: false });

// Define the Layout schema
const LayoutSchema = new Schema({
//   userId: { type: Schema.Types.ObjectId, ref: 'User' },
  userId: { type: String, ref: 'User' , required: true },
  title: { type: String, required: true },
  city: { type: String, required: false, default: 'Pune' },    
  name: { type: String, required: false, default: 'Dainik Bhaskar' },
  state: { type: String, required: false, default: 'Maharastra' },
  date: { type: Date, required: false, default: Date.now },
  // day: { type: String, required: false, default: '' },
  day: { 
    type: String, 
    required: false, 
    default: () => {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return days[new Date().getDay()];
    } 
  },
  duedate: { type: Date, required: false, default: null },
  taskstatus: { type: String, required: false, default: 'pending' },
  layouttype: { type: String, required: false, default: 'default...' },

  sections: [SectionSchema],
  gridSettings: {
    columns: { type: Number },
    rows: { type: Number },
    gutterWidth: { type: Number },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Layout = mongoose.model('Layout', LayoutSchema);
export default Layout;
