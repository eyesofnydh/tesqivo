# Tesqivo enquiry spreadsheet connection

Status: active as of 2026-11-25. The owner installed and deployed the Apps Script web app, configured Netlify's HTTP POST notification for `batch-enquiry` with the private `?key=` value, and retained the email notification. Keep the secret in Apps Script Script Properties and the Netlify notification URL; never commit it.

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

The sheet stores submission ID, India-time timestamp, name, email, optional phone, background, program, and timing. Repeat deliveries of the same submission ID are ignored under a script lock. Phone values remain text. Formula-like visitor input is escaped. Future submissions only; existing entries require a separate backfill.

Failed spreadsheet delivery does not remove the saved Netlify submission. Netlify remains the source of record; compare records and retry missing deliveries if Google is unavailable. Do not assume indefinite retries or guaranteed email delivery. Google Apps Script errors should be checked in Executions. A signed-in-only web app or a wrong secret will prevent the integration working.

References:
- https://docs.netlify.com/manage/forms/notifications/
- https://developers.google.com/apps-script/guides/web
- https://developers.google.com/apps-script/reference/lock/lock
