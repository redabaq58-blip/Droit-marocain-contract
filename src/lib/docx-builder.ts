import {
  Document,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  HeadingLevel,
  AlignmentType,
  WidthType,
  BorderStyle,
  PageOrientation,
  Header,
  Footer,
  PageNumber,
  NumberFormat,
  convertInchesToTwip,
  ShadingType,
} from "docx";

interface BilingualDocInput {
  titleFr: string;
  titleAr: string;
  frText: string;
  arText: string;
  documentType: string;
  sessionId: string;
  generatedAt: string;
}

/**
 * Builds a bilingual Word document with:
 * - French (left column) | Arabic (right column) side-by-side table
 * - Watermark: "PROJET - NON SIGNÉ / مسودة - غير موقعة"
 * - Header: Document title (FR + AR)
 * - Footer: Disclaimer (FR + AR) + Page numbers
 * - Moroccan green/gold color scheme
 */
export function buildBilingualDocx(input: BilingualDocInput): Document {
  const {
    titleFr,
    titleAr,
    frText,
    arText,
    documentType,
    sessionId,
    generatedAt,
  } = input;

  const MOROCCAN_GREEN = "1B4332";
  const MOROCCAN_GOLD = "B8860B";
  const LIGHT_GREEN_BG = "F0F7F3";

  // Split text into paragraphs
  const frParagraphs = frText.split("\n").filter((p) => p.trim());
  const arParagraphs = arText.split("\n").filter((p) => p.trim());
  const maxRows = Math.max(frParagraphs.length, arParagraphs.length);

  // Build table rows
  const tableRows: TableRow[] = [
    // Header row
    new TableRow({
      children: [
        new TableCell({
          width: { size: 50, type: WidthType.PERCENTAGE },
          shading: { fill: MOROCCAN_GREEN, type: ShadingType.SOLID },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: "🇲🇦 Français",
                  bold: true,
                  color: "FFFFFF",
                  size: 24,
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          width: { size: 50, type: WidthType.PERCENTAGE },
          shading: { fill: MOROCCAN_GREEN, type: ShadingType.SOLID },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: "🇲🇦 العربية",
                  bold: true,
                  color: "FFFFFF",
                  size: 24,
                }),
              ],
            }),
          ],
        }),
      ],
    }),
    // Content rows
    ...Array.from({ length: maxRows }, (_, i) =>
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [
                  new TextRun({
                    text: frParagraphs[i] ?? "",
                    size: 20,
                    font: "Times New Roman",
                  }),
                ],
                spacing: { after: 120, before: 60 },
              }),
            ],
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: arParagraphs[i] ?? "",
                    size: 20,
                    font: "Arial",
                    rightToLeft: true,
                  }),
                ],
                spacing: { after: 120, before: 60 },
                bidirectional: true,
              }),
            ],
          }),
        ],
      })
    ),
  ];

  const doc = new Document({
    title: `${titleFr} — ${titleAr}`,
    description: `Document généré par Qanoun Express — Session: ${sessionId}`,
    styles: {
      default: {
        document: {
          run: {
            size: 20,
            font: "Times New Roman",
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                border: {
                  bottom: {
                    color: MOROCCAN_GREEN,
                    style: BorderStyle.SINGLE,
                    size: 12,
                    space: 6,
                  },
                },
                children: [
                  new TextRun({
                    text: `${titleFr}  |  ${titleAr}`,
                    bold: true,
                    color: MOROCCAN_GREEN,
                    size: 22,
                    font: "Arial",
                  }),
                ],
                spacing: { after: 200 },
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: "⚠️ PROJET - NON SIGNÉ  /  مسودة - غير موقعة",
                    color: "CC0000",
                    bold: true,
                    size: 18,
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                border: {
                  top: {
                    color: MOROCCAN_GREEN,
                    style: BorderStyle.SINGLE,
                    size: 6,
                    space: 6,
                  },
                },
                children: [
                  new TextRun({
                    text: "Généré par Qanoun Express  |  قانون إكسبريس  —  ",
                    size: 16,
                    color: "666666",
                  }),
                  new TextRun({
                    children: ["Page ", PageNumber.CURRENT, " / ", PageNumber.TOTAL_PAGES],
                    size: 16,
                    color: "666666",
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: `Généré le ${new Date(generatedAt).toLocaleDateString("fr-MA")} | Session: ${sessionId.substring(0, 8)}`,
                    size: 14,
                    color: "999999",
                    italics: true,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: "⚠️ Document à titre informatif uniquement. Non substitut à un conseil juridique professionnel.",
                    size: 14,
                    color: "CC0000",
                    bold: true,
                  }),
                ],
              }),
            ],
          }),
        },
        children: [
          // Title block
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 200 },
            shading: { fill: LIGHT_GREEN_BG, type: ShadingType.SOLID },
            children: [
              new TextRun({
                text: titleFr,
                bold: true,
                color: MOROCCAN_GREEN,
                size: 32,
                font: "Arial",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 400 },
            children: [
              new TextRun({
                text: titleAr,
                bold: true,
                color: MOROCCAN_GOLD,
                size: 28,
                font: "Arial",
                rightToLeft: true,
              }),
            ],
          }),
          // Bilingual table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: tableRows,
            borders: {
              top: { style: BorderStyle.SINGLE, size: 4, color: MOROCCAN_GREEN },
              bottom: { style: BorderStyle.SINGLE, size: 4, color: MOROCCAN_GREEN },
              left: { style: BorderStyle.SINGLE, size: 4, color: MOROCCAN_GREEN },
              right: { style: BorderStyle.SINGLE, size: 4, color: MOROCCAN_GREEN },
              insideH: { style: BorderStyle.SINGLE, size: 2, color: "CCCCCC" },
              insideV: { style: BorderStyle.SINGLE, size: 4, color: MOROCCAN_GREEN },
            },
          }),
        ],
      },
    ],
  });

  return doc;
}
