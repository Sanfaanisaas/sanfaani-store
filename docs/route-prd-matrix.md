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

Excluded FE-03–FE-07 and FE-09–FE-14 product domains are not implemented.