// // layout.js
// import mongoose from 'mongoose';

// const { Schema } = mongoose;

// const SectionItem = new Schema({
//   id: { type: String, required: true },
//   type: { type: String, required: true },
//   x: { type: Number, required: true },
//   y: { type: Number, required: true },
//   width: { type: Number, required: true },
//   height: { type: Number, required: true },
//   rotation: { type: Number, default: 0 }, // Rotation angle for Konva
//   text: { type: String },
//   fontSize: { type: Number },
//   fontStyle: { type: String },
//   textDecoration: { type: String, default: '' },
//   fontFamily: { type: String },
//   align: { type: String },
//   padding: { type: Number },
//   backgroundFill: { type: String },
//   fill: { type: String }, // Fill color for shapes and text
//   stroke: { type: String }, // Stroke color
//   strokeWidth: { type: Number, default: 1 }, 
//   draggable: { type: Boolean, default: true }, 
//   opacity: { type: Number, default: 1 },
//   scaleX: { type: Number, default: 1 },
//   scaleY: { type: Number, default: 1 },
//   src: { type: String },
//   sizeInfo: {
//     cols: { type: Number },
//     rows: { type: Number },
//     label: { type: String },
//   },
//   gridX: { type: Number, required: true }, // Grid position X
//   gridY: { type: Number, required: true }, // Grid position Y
// }, { _id: false });

// // Konva.js Section Schema
// const SectionSchema = new Schema({
//   id: { type: String, required: true },
//   sectionType: { type: String, required: true },
//   gridX: { type: Number, required: true }, // Grid position X for section
//   gridY: { type: Number, required: true }, // Grid position Y for section
//   width: { type: Number, required: true },
//   height: { type: Number, required: true },
//   draggable: { type: Boolean, default: true },
//   sizeInfo: {
//     cols: { type: Number },
//     rows: { type: Number },
//     label: { type: String },
//   },
//   items: [SectionItem], // Each section contains multiple layout items
//   zIndex: { type: Number, default: 0 }, // Layer ordering for Konva
// }, { _id: false });

// // Konva.js Layout Schema
// const LayoutSchema = new Schema({
//   userId: { type: Schema.Types.ObjectId, ref: 'User' },
//   title: { type: String, required: true },
//   sections: [SectionSchema], // Each layout contains multiple sections
//   gridSettings: {
//     columns: { type: Number },
//     rows: { type: Number },
//     gutterWidth: { type: Number },
//   },
//   createdAt: { type: Date, default: Date.now },
//   updatedAt: { type: Date, default: Date.now },
// });

// const Layout = mongoose.model('Layout', LayoutSchema);
// export default Layout;

// layout.js
// layout.js
// layout.js

// // layout.js
// import mongoose from 'mongoose';

// const { Schema } = mongoose;

// const SectionItem = new Schema({
//   id: { type: String, required: true },
//   type: { type: String, required: true },
//   x: { type: Number, required: true },
//   y: { type: Number, required: true },
//   width: { type: Number, required: true },
//   height: { type: Number, required: true },
//   rotation: { type: Number, default: 0 }, // Rotation angle for Konva
//   text: { type: String },
//   fontSize: { type: Number },
//   fontStyle: { type: String },
//   textDecoration: { type: String, default: '' },
//   fontFamily: { type: String },
//   align: { type: String },
//   padding: { type: Number },
//   backgroundFill: { type: String },
//   fill: { type: String }, // Fill color for shapes and text
//   stroke: { type: String }, // Stroke color
//   strokeWidth: { type: Number, default: 1 }, 
//   draggable: { type: Boolean, default: true }, 
//   opacity: { type: Number, default: 1 },
//   scaleX: { type: Number, default: 1 },
//   scaleY: { type: Number, default: 1 },
//   src: { type: String },
//   sizeInfo: {
//     cols: { type: Number },
//     rows: { type: Number },
//     label: { type: String },
//   },
//   gridX: { type: Number, required: true }, // Grid position X
//   gridY: { type: Number, required: true }, // Grid position Y
// }, { _id: false });

// // Konva.js Section Schema
// const SectionSchema = new Schema({
//   id: { type: String, required: true },
//   sectionType: { type: String},
//   gridX: { type: Number, required: true }, // Grid position X for section
//   gridY: { type: Number, required: true }, // Grid position Y for section
//   width: { type: Number, required: true },
//   height: { type: Number, required: true },
//   draggable: { type: Boolean, default: true },
//   sizeInfo: {
//     cols: { type: Number },
//     rows: { type: Number },
//     label: { type: String },
//   },
//   items: [SectionItem], // Each section contains multiple layout items
//   zIndex: { type: Number, default: 0 }, // Layer ordering for Konva
// }, { _id: false });

// // Konva.js Layout Schema
// const LayoutSchema = new Schema({
//   userId: { type: Schema.Types.ObjectId, ref: 'User' },
//   title: { type: String, required: true },
//   sections: [SectionSchema], // Each layout contains multiple sections
//   gridSettings: {
//     columns: { type: Number },
//     rows: { type: Number },
//     gutterWidth: { type: Number },
//   },
//   createdAt: { type: Date, default: Date.now },
//   updatedAt: { type: Date, default: Date.now },
// });

// const Layout = mongoose.model('Layout', LayoutSchema);
// export default Layout;




//layout.js:

// layout.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

// Define SectionItem schema (for layout items inside a section)
const SectionItem = new Schema({
  id: { type: String, required: true },
  type: { type: String, required: true }, // e.g. "text", "image", "section" (if this item holds nested sections)
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
  // NEW: Nested sections field (an array of sections)
  nestedSections: {
    type: [new Schema({
      id: { type: String, required: true },
      sectionType: { type: String, required: true }, // e.g. "section"
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
     
      zIndex: { type: Number, default: 0 },
    }, { _id: false })],
    default: []
  },
}, { _id: false });

// Define SectionSchema – a section contains multiple items (and these items can include nested sections)
const SectionSchema = new Schema({
  id: { type: String, required: true },
  sectionType: { type: String }, // For example: "section"
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
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, required: true },
  sections: [SectionSchema], // Each layout contains multiple sections
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
