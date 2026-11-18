# Implementation note

## What I built
I built a reusable client-side form validation library and demonstrated it with two forms: a workshop booking form and a feedback form. Both pages use the same `js/validator.js` file.

## How it works
The HTML fields declare their rules using `data-validate`. The library reads those rules and runs the matching validation functions. Errors are displayed below their fields and collected into an error summary at the top. Each summary link focuses the field that needs attention.

Validation runs on submit and on blur. After a field has been touched, it is checked again while the user edits it. This keeps untouched fields free from premature error messages. The `match` rule compares two related fields, such as password and confirm password.

## Decisions taken
- Used plain JavaScript so the library has no dependencies.
- Kept rules in HTML data attributes so the same library can work with different forms.
- Used a `Map` for current errors and a `Set` for touched fields.
- Added `Validator.addRule()` so each page can register custom rules without editing the library.
- Used labels, `aria-invalid`, an announced error summary and focusable summary links for accessibility.
- Used a responsive dark glass-style interface with a single-column layout on smaller screens.

## What I learned
I learned how to design a reusable JavaScript API, separate validation logic from page design, work with data attributes, register custom callbacks, validate related fields, and provide accessible feedback without showing errors too early.

## How to test
Open `index.html` in a browser. Try each form with empty and incorrect values, then correct the values. Test the booking date, Indian mobile number, seat range and password match. Test the feedback email, rating, comment length and optional age. Resize the browser to check the mobile layout.
