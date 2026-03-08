# Email Validator Web

A Next.js app that validates email addresses from pasted text or uploaded CSV files.

## Features
- Email syntax validation
- MX DNS lookup
- Disposable domain detection
- Optional SMTP mailbox probing for username-level verification
- Batch validation API with CSV export

## Validation statuses
- `VALID`: passed enabled checks
- `INVALID`: failed syntax or SMTP mailbox probe rejected recipient
- `DISPOSABLE`: domain appears in disposable list
- `INVALID_DOMAIN`: no MX records found for domain
- `UNVERIFIED`: SMTP mailbox probe could not confirm validity (timeouts/blocked/greylisted)

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.
