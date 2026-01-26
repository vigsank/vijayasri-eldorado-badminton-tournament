const xlsx = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, 'assets', 'Vijayasri Eldorado Badminton Group and Schedule - 2025-26.xlsx');
const workbook = xlsx.readFile(filePath);

console.log("Sheet Names:", workbook.SheetNames);

workbook.SheetNames.forEach(sheetName => {
    console.log(`\n--- Sheet: ${sheetName} ---`);
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 }); // Array of arrays
    console.log(data.slice(0, 5)); // Print first 5 rows
});
