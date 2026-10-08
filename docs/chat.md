# Andy’s website chat

Andy’s site now uses the same chat interface and behaviour as `creepycrawly`,
with its own Sydney knowledge, phone number, service links and browser-storage
key. The launcher is labelled **Ask Andy**. Every HTML page loads the module
and its stylesheet directly; the old keyword chatbot and inline chat styles
have been replaced.

The assistant uses facts from Andy’s `about.html`, `contact.html` and
`services.html`. It directs quote requests to Andy’s existing contact form,
which uses `/v1/contact/creepycrawly-andy` in the shared contact service. Andy’s
existing email recipients and optional CRM forwarding continue. The chat does
not submit forms, send email or book appointments itself. Unconfirmed fixed
prices, same-day availability and blanket treatment guarantees were removed.

## Run locally

Use Node 22 or later. Stop the previous Python static server on port 5175, then:

```sh
npm run dev
```

Open `http://localhost:5175`. No dependency installation is needed for the app.
The Node server serves the website, its nested image assets and `/api/chat`.
Environment files, server source, documentation and Git files are not public.

Without AI settings, chat displays **Website guide** and uses curated replies
in the browser. For generated replies, set these in an ignored `.env.local`:

```dotenv
PORT=5175
HOST=127.0.0.1
CHAT_ENABLED=true
CHAT_ALLOWED_ORIGINS=http://localhost:5175,http://127.0.0.1:5175
OPENAI_API_KEY=<your project API key>
CHAT_MODEL=<a Responses API model available to your project>
```

Restart the server after changing environment variables. The widget displays
**AI assistant** when the backend is enabled. This label reports configuration;
a successful generated answer verifies provider access. The key stays on the
server. Requests use the [OpenAI Responses API](https://developers.openai.com/api/reference/typescript/resources/responses/methods/create)
with `store: false`, bounded history and output, and Andy-specific instructions.
`store: false` is not a promise of zero provider retention.

To test quote delivery, also run `npm run dev:crm-local` in
`../contact-form-service`. Its existing local profile directs all test emails
only to `jobgen.webforms@gmail.com`, including the SMTP envelope, with no live
CC or BCC. See [contact delivery](contact-delivery.md).

## Conversation behaviour

Recent messages and vetted links persist across pages and refreshes in the
same tab using `sessionStorage`, under `creepycrawly-andy:chat:v1`. Up to seven
completed turns are retained, bounded to 12,000 characters, plus a pending
question. **New chat** clears them. Open/closed state also follows navigation.
Blocked or malformed storage does not stop the chat from working on the page.

An interrupted request offers a manual retry after navigation; it is never
automatically repeated. Errors and retries preserve the user’s question without
duplicating it. Messages are rendered as text, and links are limited to local
HTML pages and service anchors. The widget supports keyboard controls, mobile
viewports and reduced motion. There is no microphone or attachment feature.

## Hosting

The Vercel configuration is still for static hosting. A static deployment uses
the website guide unless a same-origin `/api/chat` backend is provided.
For AI replies, run `npm start` on a Node host with `HOST=0.0.0.0`, the host’s
`PORT`, `NODE_ENV=production`, API credentials and exact `CHAT_ALLOWED_ORIGINS`.
Alternatively proxy `/api/chat` to that Node server. No deployment is performed
by the local setup.

The server retains the main site’s limits: two concurrent requests, 24 KB
bodies, a 25-second reply deadline, six requests per peer IP per minute, 120
per hour and 500 per day. Counters are per-process and reset on restart;
behind a proxy visitors share the peer-IP allowance. These limits are not
distributed quotas or a billing cap. Keep one instance or add a shared quota
store before scaling, and configure hosting/provider controls for production.

## Verification

`npm test` runs backend checks with fake provider responses. `npm run test:browser`
uses Playwright from `../contact-form-service/node_modules` and checks desktop
and mobile layouts, service links, tab history, reset, retry, interruption,
storage failures and the complete chat-to-quote-form flow with fake SMTP.
These automated tests make no paid model calls and send no real email.
