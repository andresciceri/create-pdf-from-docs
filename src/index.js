require("isomorphic-fetch");
const qrcode = require("yaqrcode");
const createReport = require("docx-templates").default;
const fs = require("fs");
const path = require("path");
const fsp = require("fs").promises;

const libre = require("libreoffice-convert");
libre.convertAsync = require("util").promisify(libre.convert);

const template = fs.readFileSync(process.argv[2]);

async function convertPDF(buffer, outputPath = "") {
  const ext = ".pdf";
  // Read file
  //   const docxBuf = await fsp.readFile(inputPath);
  // Convert it to pdf format with undefined filter (see Libreoffice docs about filter)
  let pdfBuf = await libre.convertAsync(buffer, ext, undefined);
  // Here in done you have pdf file which you can save or transfer in another stream
  await fsp.writeFile(outputPath, pdfBuf);
}

fs.readFile("data/budget-order-data.json", "utf8", (err, jsonData) => {
  if (err) {
    console.log("File read failed:", err);
    return;
  }
  createReport({
    template,
    data: {
      created: "01-07-2022",
      revision: {
        external_id: "WK-007",
      },
      customer: {
        name: "Agropecuaria Aliar SA",
        identification: "890207037",
        properties: {
          contact: "Harry Diaz",
          email: "harry.diaz@aliar.com.co",
          city: "Floridablanca",
        },
      },
      parts: [
        {
          sku: {
            display_name: "Boquilla 3 in para filtro",
            external_id: "610603",
            properties: { price: 22000 },
          },
          amount: 2,
        },
        {
          sku: {
            display_name: "FILTRO-GM",
            external_id: "610602",
            properties: { price: 200000 },
          },
          amount: 1,
        },
      ],
    },
  })
    .then((rendered) => {
      //   fs.writeFileSync(
      //     process.argv.length > 3 ? process.argv[3] : null,
      //     rendered
      //   );
      const ext = ".pdf";
      const inputPath = process.argv[3];
      const outputPath = `outputs/pdfs/${
        process.argv[3].split("/")[2].split(".")[0]
      }${ext}`;

      convertPDF(rendered, outputPath).catch((err) => {
        console.log(`Error converting file: ${err}`);
      });
    })
    .catch(console.log);
});
