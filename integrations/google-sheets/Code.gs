// Install in Extensions > Apps Script for the private Tesqivo Enquiries sheet.
// Set Script Properties: SPREADSHEET_ID and WEBHOOK_SECRET (32+ random characters).
// Netlify's HTTP POST notification URL must include ?key=<WEBHOOK_SECRET>.
const ENQUIRY_HEADERS = ['Submission ID', 'Submitted at (India)', 'Name', 'Email',
  'Mobile Number', 'Background', 'Program', 'Preferred Timing'];

function setupSheet() {
  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty('SPREADSHEET_ID')) {
    props.setProperty('SPREADSHEET_ID', SpreadsheetApp.getActiveSpreadsheet().getId());
  }
  if (!props.getProperty('WEBHOOK_SECRET')) {
    props.setProperty('WEBHOOK_SECRET', Utilities.getUuid() + Utilities.getUuid());
  }
  const book = SpreadsheetApp.openById(props.getProperty('SPREADSHEET_ID'));
  let sheet = book.getSheetByName('Enquiries');
  if (!sheet) sheet = book.insertSheet('Enquiries');
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, ENQUIRY_HEADERS.length).setValues([ENQUIRY_HEADERS]);
    sheet.getRange(1, 1, 1, ENQUIRY_HEADERS.length)
      .setBackground('#2563eb').setFontColor('#ffffff').setFontWeight('bold');
    sheet.setFrozenRows(1);
    sheet.setColumnWidths(1, ENQUIRY_HEADERS.length, 180);
    sheet.setColumnWidth(4, 260);
    sheet.setColumnWidth(7, 300);
  }
}

function doPost(event) {
  const props = PropertiesService.getScriptProperties();
  const secret = props.getProperty('WEBHOOK_SECRET');
  if (!secret || secret.length < 32 || !event || !event.parameter || event.parameter.key !== secret) {
    throw new Error('Unauthorized request');
  }
  const body = JSON.parse(event.postData.contents);
  const submission = body.payload || body;
  const data = submission.data || {};
  if ((submission.form_name || data['form-name']) !== 'batch-enquiry') {
    return reply_({ ok: true, ignored: true });
  }
  const id = String(submission.id || '');
  const submitted = new Date(submission.created_at);
  if (!id || id.length > 200 || isNaN(submitted.getTime())) {
    throw new Error('Missing valid submission ID or timestamp');
  }
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sheet = SpreadsheetApp.openById(props.getProperty('SPREADSHEET_ID')).getSheetByName('Enquiries');
    if (!sheet) throw new Error('Run setupSheet first');
    const actualHeaders = sheet.getRange(1, 1, 1, ENQUIRY_HEADERS.length).getValues()[0];
    if (actualHeaders.join('|') !== ENQUIRY_HEADERS.join('|')) throw new Error('Unexpected column layout');
    const lastRow = sheet.getLastRow();
    if (lastRow > 1 && sheet.getRange(2, 1, lastRow - 1, 1)
      .createTextFinder(id).matchEntireCell(true).useRegularExpression(false).findNext()) {
      return reply_({ ok: true, duplicate: true });
    }
    const row = [id, Utilities.formatDate(submitted, 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ss'),
      data.name, data.email, data.phone, data.background, data.program, data.timing].map(safeText_);
    const target = sheet.getRange(lastRow + 1, 1, 1, row.length);
    // Keep phone numbers and IDs as text, and prevent spreadsheet formula injection.
    target.setNumberFormat('@');
    target.setValues([row]);
    SpreadsheetApp.flush();
    return reply_({ ok: true });
  } finally {
    lock.releaseLock();
  }
}

function safeText_(value) {
  const text = value == null ? '' : String(value).slice(0, 2000);
  return /^[\s]*[=+@-]/.test(text) ? "'" + text : text;
}

function reply_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
