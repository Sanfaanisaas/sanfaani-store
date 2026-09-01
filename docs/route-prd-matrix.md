# Route-to-PRD matrix

| Route/screen | Audience/domain | Data source | Auth/role | UI states | Ticket |
|---|---|---|---|---|---|
| /, /shop, /shop/[id] | Public catalogue | Typed products API | Public | Loading, empty, unavailable, retry | FE-01/15/16 |
| /guides, /guides/[slug] | Buyers / guides | Versioned repository content | Public | Not found, safe content | FE-15 |
| /login, /register | Customers/staff | Auth API + HTTP-only refresh cookie | Public entry | Restoring, validation, expired, unavailable | FE-02 |
| /account/* | Customer account | Typed orders/support APIs | Customer | Loading, empty, forbidden, unavailable | FE-01/02 |
| /checkout, /cart | Customer purchase | Cart/checkout/payment APIs | Customer/guest cart | Validation, conflict, retry | FE-01/02/17 |
| /repair/request, /repair/track/[id] | Customer repair | Repairs API | Customer | Validation, quote decision, forbidden | FE-01/02/17 |
| /support | Customer support | Support API | Customer | Loading, empty, validation, unavailable | FE-01/15 |
| /operations, /operations/admin | Operations staff | Dashboard queue API | Operations roles | Forbidden, loading, empty, retry | FE-02/08/17 |
| Mobile catalogue/search/PDP | Customer | Shared contracts + products API | Public | Loading, offline, empty, retry | FE-19 |
| Mobile cart/checkout | Customer | Shared checkout APIs | Customer | Validation, conflict, offline | FE-19 |
| Mobile orders/repairs/account | Customer | Owner-scoped APIs | Customer | Expired, unavailable, stale cache | FE-19 |
| Mobile push/deep links | Customer | Platform boundary; registration unavailable pending backend | Customer | Permission denied, unavailable | FE-19 |

The routes in the authorized customer-flow addendum are implemented only to the documented backend support; their unavailable states are explicit. Other excluded domains remain outside this program.

## Authorized customer-flow addendum (FE-07, FE-09–FE-13)

| Route | Data source / state | Ticket |
| --- | --- | --- |
| /repair/request, /repair/track/[id] | Repairs API; JSON creation, safe bearer/scoped tracking, exact owner quote decision, authorised evidence | FE-07 |
| /account/warranty, /account/returns | Owner claims/returns/orders APIs; missing warranty eligibility/detail marked unavailable | FE-09 |
| /support, /notifications | Owner support tickets; notification API unavailable | FE-10 |
| /guidance | Deterministic guidance API plus live public catalogue; limited saved-session resume | FE-11 |
| /procurement | Customer procurement API unavailable; never calls internal procurement | FE-12 |
| /services | Customer service/maintenance API unavailable | FE-13 |
