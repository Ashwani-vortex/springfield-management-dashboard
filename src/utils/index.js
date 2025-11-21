/**
 * A utility function to convert an array of objects to a CSV string and trigger a download.
 * @param {Array<Object>} data The array of data to convert.
 * @param {Array<string>} keys The object keys to include in the CSV, in order.
 * @param {string} filename The desired name for the downloaded file.
 */
export const downloadCSV = (data, keys, filename) => {
  if (!data || data.length === 0) {
    console.error("No data available to download.");
    return;
  }

  // Use the keys as headers
  const headers = keys;
  const csvRows = [headers.join(",")];

  // Convert each object to a CSV row
  for (const row of data) {
    const values = keys.map((key) => {
      const escaped = ("" + row[key]).replace(/"/g, '""'); // Escape double quotes
      return `"${escaped}"`;
    });
    csvRows.push(values.join(","));
  }

  const csvString = csvRows.join("\n");
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });

  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
