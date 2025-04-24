const { PDFDocument } = require('pdf-lib');
const axios = require('axios');

async function processRequest(req) {
  if (!req.body) {
    throw new Error("Request must be JSON. Set Content-Type to application/json");
  }
  
  const requestData = req.body;
  console.log('Request data:', JSON.stringify(requestData, null, 2));
  
  // Process input data
  let fileUrl, filename, formData;
  
  // Handle array format [{ fileUrl }, { filename, record }]
  if (Array.isArray(requestData)) {
    console.log('Processing array format input');
    
    if (requestData.length < 2) {
      throw new Error("Array must contain at least 2 items");
    }
    
    fileUrl = requestData[0].fileUrl;
    filename = requestData[1].filename;
    formData = requestData[1].record;
  } 
  // Handle object format { fileUrl, filename, record }
  else if (requestData.fileUrl !== undefined || requestData.record !== undefined) {
    console.log('Processing object format with fileUrl and record');
    
    fileUrl = requestData.fileUrl;
    filename = requestData.filename || 'filled_form.pdf';
    formData = requestData.record || {};
  }
  // Invalid format
  else {
    throw new Error("Invalid request format");
  }
  
  console.log(`Using fileUrl: ${fileUrl}`);
  console.log(`Using filename: ${filename}`);
  console.log(`Form data has ${Object.keys(formData).length} fields`);

  if (!fileUrl) {
    throw new Error("A fileUrl must be provided - Vercel doesn't support local file storage");
  }
  
  // Download template
  let pdfBytes;
  try {
    console.log(`Downloading template from URL: ${fileUrl}`);
    const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
    pdfBytes = response.data;
  } catch (error) {
    console.error(`Error downloading template: ${error.message}`);
    throw new Error(`Failed to download PDF template: ${error.message}`);
  }
  
  // Load PDF document
  const pdfDoc = await PDFDocument.load(pdfBytes);
  
  // Get form field names
  const form = pdfDoc.getForm();
  const fields = form.getFields();
  const fieldNames = fields.map(field => field.getName());
  
  console.log(`PDF contains ${fieldNames.length} form fields`);
  
  // Count filled and unfilled fields
  let fieldCount = 0;
  let unfilledCount = 0;
  
  // Fill form fields
  for (const fieldName of fieldNames) {
    if (formData.hasOwnProperty(fieldName)) {
      const value = formData[fieldName];
      const field = form.getField(fieldName);
      
      try {
        // Handle different field types
        if (field.constructor.name === 'PDFCheckBox') {
          // Handle checkbox (Boolean values)
          if (value === true || value === 1 || value === '1' || value === 'Yes' || value === 'X' || value === 'On') {
            field.check();
          } else {
            field.uncheck();
          }
        } else if (field.constructor.name === 'PDFTextField') {
          // Handle text fields
          field.setText(String(value));
        } else if (field.constructor.name === 'PDFDropdown') {
          // Handle dropdown fields
          if (field.getOptions().includes(String(value))) {
            field.select(String(value));
          }
        } else if (field.constructor.name === 'PDFRadioGroup') {
          // Handle radio groups
          field.select(String(value));
        }
        
        fieldCount++;
      } catch (error) {
        console.error(`Error filling field ${fieldName}: ${error.message}`);
        unfilledCount++;
      }
    } else {
      unfilledCount++;
    }
  }
  
  // Make form fields read-only by flattening
  form.flatten();
  
  console.log(`Filled ${fieldCount} fields in the PDF`);
  console.log(`Made all form fields read-only (including ${unfilledCount} unfilled fields)`);
  
  // Generate output filename
  const outputFilename = `filled_${filename}`;
  
  // Save the filled PDF
  const filledPdfBytes = await pdfDoc.save();
  
  return {
    fieldCount,
    unfilledCount,
    filledPdfBytes,
    outputFilename,
    totalFields: fieldCount + unfilledCount,
    email_id: formData.email_id || ''
  };
}

module.exports = {
  processRequest
}; 