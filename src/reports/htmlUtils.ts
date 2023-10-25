function wrapInBasicHTMLDocument(bodyHTML: string): string {
  // TODO - allow customizing style, presumably
  // TODO - edit title of HTML page
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>My Website</title>

        <style>
          /* shamelessly stolen from https://github.com/mdn/learning-area/blob/main/html/tables/basic/minimal-table.css */
          /* also see https://developer.mozilla.org/en-US/docs/Learn/HTML/Tables/Basics */
          html {
            font-family: sans-serif;
          }

          table {
            border-collapse: collapse;
            border: 2px solid rgb(200,200,200);
            letter-spacing: 1px;
            /* font-size: 0.8rem; */
          }

          td, th {
            border: 1px solid rgb(190,190,190);
            padding: 10px 20px;
          }

        </style>
      </head>
      <body>
        <main>
          ${bodyHTML}
        </main>
      </body>
</html>
`;
}

function createTableHTML(
  rowHeadings: Array<string>,
  columnHeadings: Array<string>,
  dataByRow: Array<Array<string>>,
): string {
  // throughout this function, numRows and indexes into dataByRow don't count the heading row
  // row 0 (dataByRow[0]) is the first row with data, *not* the heading row
  // similarly, numCols and indexes into row arrays don't count the "heading" column
  // column 0 of row 1 (dataByRow[1][0]) is the first column of the second row with data, *not* the second row "heading"

  const numRows = rowHeadings.length;
  const numCols = columnHeadings.length;

  // sanity check - make sure we have data for every cell
  if (dataByRow.length !== numRows) {
    throw new Error(`Mismatch - data has ${dataByRow.length} rows, expected ${numRows} rows`);
  }

  for (const row of dataByRow) {
    if (row.length !== numCols) {
      throw new Error(`Mismatch - a row of data has ${row.length} columns, expected ${numCols} columns`);
    }
  }

  let tableHTML = "";
  tableHTML += "<table>";

  let headingRow = "";
  headingRow += "<tr>";
  headingRow += "<td></td>"; // upper-left corner
  for (const columnHeading of columnHeadings) {
    headingRow += `<th scope="col">${columnHeading}</th>`;
  }
  headingRow += "</tr>";
  tableHTML += headingRow;

  for (let row = 0; row < numRows; row++) {
    let rowHTML = "";
    rowHTML += "<tr>";

    rowHTML += `<th scope="row">${rowHeadings[row]}</th>`;

    for (let col = 0; col < numCols; col++) {
      rowHTML += "<td>";
      rowHTML += dataByRow[row][col];
      rowHTML += "</td>";
    }

    rowHTML += "</tr>";

    tableHTML += rowHTML;
  }

  tableHTML += "</table>";

  return tableHTML;
}

export function getHTMLReport(
  rowHeadings: Array<string>,
  columnHeadings: Array<string>,
  dataByRow: Array<Array<string>>,
): string {
  return wrapInBasicHTMLDocument(createTableHTML(rowHeadings, columnHeadings, dataByRow));
}
