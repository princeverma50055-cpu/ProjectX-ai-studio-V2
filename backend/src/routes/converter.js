const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");
const mammoth = require("mammoth");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }
});

// TXT → PDF
router.post("/text-to-pdf", upload.single("file"), async (req, res) => {
  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]);

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const text = req.file.buffer.toString("utf8");

    page.drawText(text, {
      x: 50,
      y: 790,
      size: 12,
      font,
      color: rgb(0, 0, 0),
      maxWidth: 500
    });

    const pdfBytes = await pdfDoc.save();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="converted.pdf"'
    );

    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DOCX → TXT
router.post("/docx-to-text", upload.single("file"), async (req, res) => {
  try {
    const result = await mammoth.extractRawText({
      buffer: req.file.buffer
    });

    res.json({
      success: true,
      text: result.value
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Image Convert
router.post("/image-convert", upload.single("file"), async (req, res) => {
  try {
    const format = req.body.targetFormat || "png";

    let img = sharp(req.file.buffer);

    if (format === "png") img = img.png();
    else if (format === "jpg") img = img.jpeg();

    const buffer = await img.toBuffer();

    res.setHeader("Content-Type", `image/${format}`);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="converted.${format}"`
    );

    res.send(buffer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Image → PDF
router.post("/image-to-pdf", upload.array("files"), async (req, res) => {
  try {
    const pdfDoc = await PDFDocument.create();

    for (const file of req.files) {
      let image;

      if (file.mimetype.includes("png"))
        image = await pdfDoc.embedPng(file.buffer);
      else image = await pdfDoc.embedJpg(file.buffer);

      const page = pdfDoc.addPage([image.width, image.height]);

      page.drawImage(image, {
        x: 0,
        y: 0,
        width: image.width,
        height: image.height
      });
    }

    const pdfBytes = await pdfDoc.save();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="images.pdf"'
    );

    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PDF → TXT (Placeholder)
router.post("/pdf-to-text", upload.single("file"), async (req, res) => {
  res.status(501).json({
    success: false,
    message: "PDF to Text converter will be added in next update."
  });
});

module.exports = router;
