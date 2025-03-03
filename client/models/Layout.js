// layout.js
import mongoose from 'mongoose';

const { Schema } = mongoose;

const LayoutItemSchema = new Schema({
  id: { type: String, required: true },
  type: { type: String, required: true },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  text: { type: String },
  fontSize: { type: Number },
  fontStyle: { type: String },
  textDecoration: { type: String, default: '' },
  fontFamily: { type: String },
  align: { type: String },
  padding: { type: Number },
  backgroundFill: { type: String },
  fill: { type: String },      // New: store the item color
  stroke: { type: String },    // Optional: store stroke color if needed
  src: { type: String },
  sizeInfo: {
    cols: { type: Number },
    rows: { type: Number },
    label: { type: String },
  },
}, { _id: false });

const LayoutSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, required: true },
  items: [LayoutItemSchema],
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
