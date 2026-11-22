# ShopLedger

## Stack
- Node.js with CommonJS modules, Express, and `body-parser`.
- Browser UI files are served from `public/`; application data is stored in `data/db.json` through `lib/store.js`.

## Module map
- `routes/customers.js` — customer listing and Khata settlement endpoints.
- `routes/orders.js` — order listing, creation, and cancellation endpoints.
- `routes/products.js` — product listing and active coupon endpoints.
- `routes/reports.js` — dashboard, GST reconciliation, pricing preview, and admin export endpoints.
- `lib/coupons.js` — coupon code normalization, validation, discount calculation, and listing.
- `lib/dates.js` — current date, date normalization, and fiscal year helpers.
- `lib/inventory.js` — product lookup, sellable stock, stock checks, reserve/release, and summary.
- `lib/invoice.js` — invoice figure calculation and printable HTML rendering.
- `lib/ledger.js` — customer balances, Khata charges, reversals, and settlements.
- `lib/orders.js` — order creation, lookup, cancellation, and filtered listing.
- `lib/pricing.js` — subtotal, discount delegation, and checkout totals calculation.
- `lib/reports.js` — dashboard summary and GST reconciliation calculations.
- `lib/store.js` — read/write JSON data and append audit entries.
- `lib/tax.js` — item GST rate resolution, slab percentage, and CGST/SGST split.

## Commands
- Start the app: `npm start`.
- Run tests: `node --test`.

## Rules
1. Write characterization tests before changing behaviour.
2. Change only the module(s) the ticket is about.
3. Tests never read or write `data/db.json`; use in-memory data.
4. Add no dependencies.
5. Make the smallest fix that works.

## Current ticket
- Invoice total and GST breakdown do not match what the customer was billed.
- Allowed files: `lib/invoice.js`; `lib/tax.js` only if truly needed.
