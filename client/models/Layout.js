// layout.js
import mongoose from 'mongoose';

const { Schema } = mongoose;

const SectionItem = new Schema({
  id: { type: String, required: true },
  type: { type: String, required: true },
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

const SectionSchema = new Schema({
  id: { type: String, required: true },
  sectionType: { type: String, required: true },
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

const EmbeddedLayoutSchema = new Schema({
  layoutId: { type: String, required: true },
  title: { type: String, required: true },
  gridSettings: {
    columns: { type: Number },
    rows: { type: Number },
    gutterWidth: { type: Number },
  },
  sections: [SectionSchema],
}, { _id: false });

const LayoutSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, required: true },
  items: [SectionSchema],
  gridSettings: {
    columns: { type: Number },
    rows: { type: Number },
    gutterWidth: { type: Number },
  },
  previousLayouts: [EmbeddedLayoutSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Layout = mongoose.model('Layout', LayoutSchema);
export default Layout;
