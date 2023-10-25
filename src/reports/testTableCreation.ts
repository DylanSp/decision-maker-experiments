// quick test to see if getHTMLReport() in htmlUtils.ts works

import { getHTMLReport } from "./htmlUtils";

const colHeadings = ["3 voters", "4 voters", "5 voters"];
const rowHeadings = ["3 candidates", "4 candidates"];
const dataByRow = [
  ["3c/3v", "3c/4v", "3c/5v"], // first row - "3 candidates"
  ["4c/3v", "4c/4v", "4c/5v"], // second row - "4 candidates"
];

const tableHTML = getHTMLReport(rowHeadings, colHeadings, dataByRow);
console.log(tableHTML);
