# Quote form delivery

The quote form posts JSON to
`https://shared-contact-forms.onrender.com/v1/contact/creepycrawly-andy`.
No Web3Forms account, public key or browser SMTP credentials are used.
The shared service validates submissions, checks origins, filters the honeypot,
limits request rates and sends email using its existing default SMTP account.

Production notifications go to the two addresses previously used by the form's
email-app fallback: `info@creepycrawly.com.au` and `creepysw@gmail.com`. Recipients
are server-controlled in `contact-form-service/src/sites.js`. Email is optional;
phone-only enquiries are accepted without a Reply-To email header.

Deploy the updated contact service first, then this site. Keep the
version on the contact page's `js/main.js` URL updated when changing submission
logic. Production domains and the Render preview are registered in the backend.
Additional hosting domains require an explicit origin entry there.

## Local test

From this folder:

```sh
npm run dev
```

From `../contact-form-service`, run `npm run dev:crm-local` with the existing
local test settings. Open `http://localhost:5175/contact.html`. The browser
automatically uses `http://localhost:10000` on localhost. The Node preview also
supports the [configured chat](chat.md); quote delivery needs no new website
environment variables. All local notifications are routed only to
`CONTACT_MAILBOX` (default `jobgen.webforms@gmail.com`).

The form preserves its submission ID and payload when retrying after an error,
keeps entered values until success and limits requests to 40 seconds. The
existing service deduplicates successful contact emails in memory for ten
minutes; this is not persistent email deduplication across server restarts.
SMTP acceptance does not prove inbox delivery.

## Verification

Using the sibling contact service's installed Playwright dependency:

```sh
npm run test:browser
```

This runs the actual form JavaScript against a temporary local copy of the
contact API, with a fake email sender. It verifies optional email, form
validation, JSON submission and duplicate prevention after a lost response.
No real emails are sent. Backend validation/routing tests run with `npm test`
in `../contact-form-service`.

The service also supports forwarding quotes to Andy's own CRM Web Leads inbox.
Enable `CREEPY_CRM_ENABLED`, `CREEPY_CRM_API_URL` and `CREEPY_CRM_API_KEY` in the
contact service, using Andy's workspace key. No website environment variables
are needed. See `../contact-form-service/docs/CREEPY_CRM.md` for setup and local
testing. Old email enquiries are not automatically imported.
