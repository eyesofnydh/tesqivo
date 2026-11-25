# Tesqivo enquiry spreadsheet connection

Status: the Netlify form, webhook, and email notification are active. Two later real submissions reached email but missed the sheet despite earlier successful webhook tests. Those two were recovered from the emails on 2026-11-25. The Gmail backup function below is prepared in this source file but must be installed in the live Apps Script project before it can run. Keep the secret in Apps Script Script Properties and the Netlify notification URL; never commit it.

Destination: the private Tesqivo Enquiries spreadsheet supplied by the user:
https://docs.google.com/spreadsheets/d/1FrxpAjxZAA4B8r1hhBVhGObfpcFOnTV9deDv5rKap4Y/edit

The following steps describe how to recreate or repair the connection:

1. Sign in as learnwithtesqivo@gmail.com, open that spreadsheet, and select Extensions > Apps Script.
2. Paste Code.gs into the script editor and save. Run setupSheet once and authorize access to the spreadsheet. This creates an Enquiries tab without deleting other tabs.
3. Deploy as a Web app, executing as the owner, with access for Anyone. Keep the spreadsheet itself Restricted. The receiver requires a separate secret and never returns stored rows.
4. In Apps Script Project Settings > Script Properties, copy WEBHOOK_SECRET. Keep it private. Append it to the deployed /exec URL as ?key= followed by the secret.
5. In Netlify > tesqivo > Forms > Form submission notifications, add an HTTP POST notification for batch-enquiry with that URL. Keep the existing email notification.
6. Submit one clearly labelled test enquiry, then verify the corresponding row and timestamp in Enquiries, and check the notification email.

Live verification on 2026-11-25: two labelled test enquiries submitted to the production site's Netlify form returned HTTP 200, appeared in `Enquiries` with India timestamps and all submitted fields, and generated notification emails to learnwithtesqivo@gmail.com. The second test used the visibly fake phone value `+91 00000 00000` and confirmed it remained text. An earlier test before the webhook key was added reached Netlify and email but did not reach the sheet; it is not present in the sheet.

For reliable recovery, replace the live Apps Script `Code.gs` with this file, save it, select `installEmailSync`, and run it once. Authorize Gmail and Sheets access when asked. It first recovers missing recent notification emails, then creates a five-minute trigger. The trigger compares email ID and the submitted values with nearby sheet rows so it does not duplicate a successful webhook row. Rows recovered from email use an `EMAIL-RECOVERY-` ID and the notification receipt time in India, which can be a few seconds after the original submission. Existing `doPost` deployment keeps working without a redeploy; redeploy if you later change the webhook code itself.

The Google Sheet is live. An exported `.xlsx` file is a snapshot and will not update itself; export it again when needed.

The sheet stores submission ID, India-time timestamp, name, email, optional phone, background, program, and timing. Repeat deliveries of the same submission ID are ignored under a script lock. Phone values remain text. Formula-like visitor input is escaped. Future submissions only; existing entries require a separate backfill.

Failed spreadsheet delivery does not remove the saved Netlify submission. Netlify remains the source of record; compare records and retry missing deliveries if Google is unavailable. Do not assume indefinite retries or guaranteed email delivery. Google Apps Script errors should be checked in Executions. A signed-in-only web app or a wrong secret will prevent the integration working.

References:
- https://docs.netlify.com/manage/forms/notifications/
- https://developers.google.com/apps-script/guides/web
- https://developers.google.com/apps-script/reference/lock/lock
