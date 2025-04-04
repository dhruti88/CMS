import express from "express";
import multer from "multer";
import fs from "fs-extra";
import { exec } from "child_process";
import PDFDocument from "pdfkit";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/convert-cmyk", upload.single("image"), async (req, res) => {
    if (!req.file) {
        return res.status(400).send("No file uploaded.");
    }

    const inputFilePath = req.file.path;
    const tempPdfPath = `uploads/temp_${Date.now()}.pdf`;
    const finalCmykPdfPath = `uploads/final_CMYK_${Date.now()}.pdf`;

    try {
        const doc = new PDFDocument({ size: [1000, 1000] });
        const writeStream = fs.createWriteStream(tempPdfPath);
        doc.pipe(writeStream);

        doc.image(inputFilePath, 100,100, { width: 800 },{ align: 'center',valign: 'center'});

        doc.end();
        
    } catch (error) {
        console.error("Error generating PDF:", error);
        res.status(500).send("Failed to generate PDF.");
    }
});

export default router;
