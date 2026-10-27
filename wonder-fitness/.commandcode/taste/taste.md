# Taste

## Integrations & Realism
- Wants real integrations wired up instead of mocked/simulated placeholders — actual SMTP OTP email sent to a real inbox, `tel:` links that open the phone dialer to the customer's real number, real Google Maps links — and asks for demo shortcuts (e.g. the "demo account / password 123456" quick-fill block) to be removed. Confidence: 0.6

## Security & Config
- Never hardcodes credentials: passwords, Gmail app passwords and other secrets must live in environment variables (`.env`, gitignored) and be referenced as `${VAR}` in compose/examples — no real credentials committed to tracked files. Confidence: 0.75

## UI & Design
- Wants restraint in UI: static metadata (location, hours, features, ratings) should be plain icon + text in a borderless layout — no pill shapes, shadows, hover effects or pointer cursor on read-only info — and button/link semantics reserved only for elements that actually do something. Avoids flashy, multi-colour, effect-heavy designs. Confidence: 0.7

## UX & Flows
- Prefers multi-step auth/OTP flows split into explicit, gated steps — e.g. the OTP must be verified successfully on its own screen before the new-password fields appear — rather than combining OTP entry and the final action in a single form. Confidence: 0.55
