BIZMANAGER STARTER
Manage. Track. Grow.

WHAT THIS IS
This is an early offline-first web app prototype. It includes product registration, purchase entry, sales entry, stock updates, expense entry, summary reports, and JSON backup/restore.

IMPORTANT LIMITATIONS
- This is a starter prototype, not yet a finished or audited accounting product.
- Records are stored in this browser on this device. They do not synchronise between devices.
- Clearing browser data may remove records. Export backups regularly.
- No login/PIN protection is included yet.
- No customer/supplier master registers, printable receipts, PDF/Excel reports, or transaction editing/deletion yet.
- The app must first be opened from a secure web address (HTTPS) or a local development server so the service worker can cache it. After that, the app shell can open offline.
- iPhone installation: open the hosted app in Safari, tap Share, then Add to Home Screen.
- Android installation: open the hosted app in Chrome and choose Install app / Add to Home screen.
- A web/PWA app cannot be installed directly from these source files by tapping index.html.

HOW TO TEST ON A COMPUTER
Run a local web server from this folder, for example:
  python -m http.server 8000
Then open:
  http://localhost:8000
Service workers work on localhost for development. For real phone installation, deploy to an HTTPS address first.

NEXT DEVELOPMENT MILESTONES
1. Add PIN/password access and business profile setup.
2. Add customer and supplier registers, payment allocation, and debt tracking.
3. Add printable/shareable receipts and PDF/CSV reports.
4. Add stock adjustments, returns, and transaction corrections with audit history.
5. Improve database reliability and backup encryption.
6. Test on Android and iPhone before treating it as production-ready.

FINANCIAL NOTE
Purchases increase stock and are not treated as operating expenses. Gross profit is calculated from recorded sales less cost of goods sold. The net operating result shown is gross profit less recorded operating expenses. Supplier balances are calculated from purchase totals less amounts paid.
