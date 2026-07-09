const path = require("path");

// Extract relative date/filename from multer file path
// e.g., "C:\\project\\uploads\\20260708\\abc.jpg" -> "20260708/abc.jpg"
function getUploadRelativePath(filePath) {
  const parts = filePath.split(/[\\/]/);
  const last = parts[parts.length - 1];
  const secondLast = parts[parts.length - 2];
  return secondLast + "/" + last;
}

module.exports = { getUploadRelativePath };
