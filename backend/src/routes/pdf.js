const express = require("express");
const multer = require("multer");
const { PDFDocument } = require("pdf-lib");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }
});

// Merge PDFs
router.post("/merge", upload.array("files"), async (req, res) => {
  try {
    const mergedPdf = await PDFDocument.create();

    for (const file of req.files) {
      const pdf = await PDFDocument.load(file.buffer);
      const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());

      pages.forEach((page) => mergedPdf.addPage(page));
    }

    const pdfBytes = await mergedPdf.save();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="merged.pdf"'
    );

    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PDF Info
router.post("/info", upload.single("file"), async (req, res) => {
  try {
    const pdf = await PDFDocument.load(req.file.buffer);

    res.json({
      success: true,
      pages: pdf.getPageCount(),
      title: pdf.getTitle() || "",
      author: pdf.getAuthor() || "",
      subject: pdf.getSubject() || "",
      creator: pdf.getCreator() || ""
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Health Check
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "PDF API is working."
  });
});

module.exports = router;
