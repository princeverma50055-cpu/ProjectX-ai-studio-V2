const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");
const mammoth = require("mammoth");
const pdfParse = require("pdf-parse");

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
      x: 50, y: 790, size: 12, font,
      color: rgb(0, 0, 0), maxWidth: 500
    });
    const pdfBytes = await pdfDoc.save();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="converted.pdf"');
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DOCX → TXT
router.post("/docx-to-text", upload.single("file"), async (req, res) => {
  try {
    const result = await mammoth.extractRawText({ buffer: req.file.buffer });
    res.json({ success: true, text: result.value });
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
    res.setHeader("Content-Disposition", `attachment; filename="converted.${format}"`);
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
      if (file.mimetype.includes("png")) image = await pdfDoc.embedPng(file.buffer);
      else image = await pdfDoc.embedJpg(file.buffer);
      const page = pdfDoc.addPage([image.width, image.height]);
      page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
    }
    const pdfBytes = await pdfDoc.save();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="images.pdf"');
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PDF → TXT
router.post("/pdf-to-text", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });
    const pdfData = await pdfParse(req.file.buffer);
    res.json({ success: true, text: pdfData.text, filename: req.file.originalname, pages: pdfData.numpages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// TEXT → Beautiful PDF (text paste karke)
router.post("/text-to-beautifulpdf", upload.none(), async (req, res) => {
  try {
    const { text, title = 'Document' } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: "No text provided" });

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const pageWidth = 595, pageHeight = 842, margin = 60;
    const contentWidth = pageWidth - margin * 2;
    const bodySize = 12;
    const lineHeight = bodySize * 1.6;

    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    let y = pageHeight - margin;

    // Header bar
    page.drawRectangle({ x: 0, y: pageHeight - 75, width: pageWidth, height: 75, color: rgb(0.04, 0.71, 0.83) });

    // Title
    const safeTitle = title.substring(0, 50);
    page.drawText(safeTitle, { x: margin, y: pageHeight - 48, size: 18, font: boldFont, color: rgb(1, 1, 1) });

    // Subtitle line
    page.drawRectangle({ x: margin, y: pageHeight - 85, width: 50, height: 3, color: rgb(0.04, 0.71, 0.83) });

    y = pageHeight - 105;

    const addNewPage = () => {
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      page.drawRectangle({ x: 0, y: pageHeight - 30, width: pageWidth, height: 30, color: rgb(0.95, 0.95, 0.95) });
      page.drawText(safeTitle, { x: margin, y: pageHeight - 20, size: 9, font, color: rgb(0.6, 0.6, 0.6) });
      y = pageHeight - 50;
    };

    const paragraphs = text.split('\n');

    for (const para of paragraphs) {
      if (para.trim() === '') {
        y -= lineHeight * 0.5;
        if (y < margin + 40) addNewPage();
        continue;
      }

      const words = para.split(' ');
      let currentLine = '';

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const textWidth = font.widthOfTextAtSize(testLine, bodySize);

        if (textWidth > contentWidth && currentLine) {
          if (y < margin + 40) addNewPage();
          page.drawText(currentLine, { x: margin, y, size: bodySize, font, color: rgb(0.1, 0.1, 0.1) });
          y -= lineHeight;
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }

      if (currentLine) {
        if (y < margin + 40) addNewPage();
        page.drawText(currentLine, { x: margin, y, size: bodySize, font, color: rgb(0.1, 0.1, 0.1) });
        y -= lineHeight;
      }
    }

    // Footer on all pages
    const pages = pdfDoc.getPages();
    pages.forEach((p, idx) => {
      p.drawLine({ start: { x: margin, y: 38 }, end: { x: pageWidth - margin, y: 38 }, thickness: 0.5, color: rgb(0.8, 0.8, 0.8) });
      p.drawText(`Page ${idx + 1} of ${pages.length}  |  ProjectX AI Studio`, { x: margin, y: 24, size: 8, font, color: rgb(0.6, 0.6, 0.6) });
    });

    const pdfBytes = await pdfDoc.save();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="document.pdf"');
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// TEXT → DOC
router.post("/text-to-docx", upload.none(), async (req, res) => {
  try {
    const { text, title = 'Document' } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: "No text provided" });

    const rtfContent = `{\\rtf1\\ansi\\deff0
{\\fonttbl{\\f0 Times New Roman;}{\\f1 Arial;}}
{\\colortbl ;\\red4\\green181\\blue211;}
\\f1\\fs28\\b\\cf1 ${title}\\b0\\cf0\\fs24\\par
\\par
\\f0\\fs24 ${text.replace(/\n/g, '\\par\n').replace(/[{}\\]/g, '')}
}`;

    const buffer = Buffer.from(rtfContent, 'utf8');
    res.setHeader("Content-Type", "application/msword");
    res.setHeader("Content-Disposition", 'attachment; filename="document.doc"');
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
