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

// TEXT → Beautiful PDF
router.post("/text-to-beautifulpdf", upload.none(), async (req, res) => {
  try {
    const { text, title = 'Document' } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: "No text provided" });

    // Clean ALL problematic characters
    const cleanText = text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/[^\x20-\x7E\n\t]/g, ' ')
      .replace(/  +/g, ' ')
      .trim();

    const cleanTitle = (title || 'Document')
      .replace(/[^\x20-\x7E]/g, '')
      .trim() || 'Document';

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const pageWidth = 595, pageHeight = 842, margin = 60;
    const contentWidth = pageWidth - margin * 2;
    const bodySize = 12;
    const lineHeight = bodySize * 1.8;

    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    let y = pageHeight - margin;

    // Header bar
    page.drawRectangle({ x: 0, y: pageHeight - 75, width: pageWidth, height: 75, color: rgb(0.04, 0.71, 0.83) });

    // Title
    const safeTitle = cleanTitle.substring(0, 60);
    page.drawText(safeTitle, { x: margin, y: pageHeight - 50, size: 20, font: boldFont, color: rgb(1, 1, 1) });

    // Accent line
    page.drawRectangle({ x: margin, y: pageHeight - 82, width: 60, height: 3, color: rgb(1, 1, 1) });

    y = pageHeight - 110;

    const addNewPage = () => {
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      page.drawRectangle({ x: 0, y: pageHeight - 32, width: pageWidth, height: 32, color: rgb(0.96, 0.96, 0.96) });
      page.drawText(safeTitle.substring(0, 50), { x: margin, y: pageHeight - 22, size: 9, font, color: rgb(0.5, 0.5, 0.5) });
      y = pageHeight - 55;
    };

    const paragraphs = cleanText.split('\n');

    for (const para of paragraphs) {
      const trimmedPara = para.trim();

      if (!trimmedPara) {
        y -= lineHeight * 0.6;
        if (y < margin + 50) addNewPage();
        continue;
      }

      const words = trimmedPara.split(' ').filter(w => w.length > 0);
      let currentLine = '';

      for (const word of words) {
        const safeWord = word.replace(/[^\x20-\x7E]/g, '');
        if (!safeWord) continue;

        const testLine = currentLine ? `${currentLine} ${safeWord}` : safeWord;

        let lineWidth = 0;
        try {
          lineWidth = font.widthOfTextAtSize(testLine, bodySize);
        } catch {
          currentLine = safeWord;
          continue;
        }

        if (lineWidth > contentWidth && currentLine) {
          if (y < margin + 50) addNewPage();
          try {
            page.drawText(currentLine, { x: margin, y, size: bodySize, font, color: rgb(0.12, 0.12, 0.12) });
          } catch (e) {}
          y -= lineHeight;
          currentLine = safeWord;
        } else {
          currentLine = testLine;
        }
      }

      if (currentLine.trim()) {
        if (y < margin + 50) addNewPage();
        try {
          page.drawText(currentLine, { x: margin, y, size: bodySize, font, color: rgb(0.12, 0.12, 0.12) });
        } catch (e) {}
        y -= lineHeight;
      }
    }

    // Footer
    const allPages = pdfDoc.getPages();
    allPages.forEach((p, idx) => {
      p.drawLine({ start: { x: margin, y: 40 }, end: { x: pageWidth - margin, y: 40 }, thickness: 0.5, color: rgb(0.75, 0.75, 0.75) });
      p.drawText(`Page ${idx + 1} of ${allPages.length}   |   ProjectX AI Studio`, { x: margin, y: 26, size: 8, font, color: rgb(0.55, 0.55, 0.55) });
    });

    const pdfBytes = await pdfDoc.save();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${cleanTitle}.pdf"`);
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

    const cleanText = text.replace(/[{}\\]/g, '');
    const cleanTitle = (title || 'Document').replace(/[{}\\]/g, '');

    const rtfContent = `{\\rtf1\\ansi\\deff0
{\\fonttbl{\\f0 Times New Roman;}{\\f1 Arial;}}
{\\colortbl ;\\red4\\green181\\blue211;}
\\f1\\fs28\\b\\cf1 ${cleanTitle}\\b0\\cf0\\fs24\\par
\\par
\\f0\\fs24 ${cleanText.replace(/\n/g, '\\par\n')}
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
