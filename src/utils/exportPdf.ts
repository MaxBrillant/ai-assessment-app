export async function exportPdf(html: string, fileName: string) {
  const pdfMake = require("pdfmake");
  const pdfFonts = require("pdfmake/build/vfs_fonts");

  var htmlToPdfmake = require("html-to-pdfmake");
  const converter = htmlToPdfmake(html);

  var docDefinition = {
    content: converter,
    styles: {
      defaultStyle: {
        fontSize: 9,
      },
    },
  };

  pdfMake.vfs = pdfFonts;
  pdfMake.createPdf(docDefinition).download(fileName + ".pdf");
}
