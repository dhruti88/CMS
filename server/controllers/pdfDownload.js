import express from "express";
import multer from "multer";
import fs from "fs-extra";
import PDFDocument from "pdfkit";
import path from "path";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/convert-cmyk", upload.single("image"), async (req, res) => {
    if (!req.file) {
        return res.status(400).send("No file uploaded.");
    }

    
    const inputFilePath = req.file.path;

    try {
        // Set headers for download
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "attachment; filename=converted_CMYK.pdf");

        const doc = new PDFDocument({ size: [1000, 1000] });
        doc.pipe(res); // Pipe directly to response

        doc.image(inputFilePath, 100, 100, { width: 800 });

        doc.end();

        // Optional: cleanup uploaded image after use
        doc.on("finish", () => {
            fs.unlink(inputFilePath); // delete uploaded file
        });
    } catch (error) {
        console.error("Error generating PDF:", error);
        res.status(500).send("Failed to generate PDF.");
    }
});

export default router;