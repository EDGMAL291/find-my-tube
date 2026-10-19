# Guided walkthrough

Quick guide on the home page starts an eleven-step walkthrough of the actual home, tube lookup, stock ordering and tracking pages. It highlights the relevant control and supports Next, Back, Skip, Escape and replay. First-time home visitors see it automatically; existing completion preferences remain respected. A `guide` query parameter carries the step between pages and is removed when the guide finishes or is dismissed.

The FBC example changes only the visible search query and restores it when the step ends. Opening Tube Plan during the guide does not add or remove tests. The guide never enters requester details, changes stock quantities or submits an order. Native modal focus keeps the user in the guide until they finish or skip. Positioning responds to viewport and explanation-size changes.

Find My Test is temporarily absent from the home carousel, action tiles, main menus, mobile navigation and test-search handoffs pending clinical review. Its implementation and direct route remain available for review; this is a navigation change, not an access-control boundary.

Verification: `tests/home-intro-browser.cjs` covers real targets, cross-page navigation, portrait/landscape placement, keyboard focus, dismissal, replay and the absence of order submissions or test selection. `tests/stock-quantity-browser.cjs` covers visible ordering units, cart summaries and outgoing request totals. Backend unit tests confirm pack-to-inventory conversion and legacy needle compatibility.
