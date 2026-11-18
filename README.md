# FormLab — reusable form validation library

A small client-side validation library built with vanilla JavaScript. The same `js/validator.js` file powers two separate demos: a workshop booking form and a feedback form.

## Run it

1. Keep the folder structure as-is.
2. Open `index.html` in a browser, or use VS Code Live Server.
3. Choose either demo and try submitting the form empty.
4. Fix a field after leaving it to see the inline validation update.

No npm packages or build step are required. Google Fonts are optional; the layout has fallback fonts.

## Folder structure

```text
form-validation-library/
├── index.html
├── demo-booking.html
├── demo-feedback.html
├── style.css
├── README.md
└── js/
    └── validator.js
```

## API reference

### Create a validator

```js
const validator = new Validator(document.querySelector("#myForm"));
```

The form should use `novalidate` so browser popups do not replace the library's own accessible messages.

### Declare rules in HTML

Add `data-validate` to a field. Separate rules with `|`. A rule argument follows a colon.

```html
<input
  id="email"
  name="Email"
  data-label="Email"
  data-validate="required|email"
>
<small data-error-for="Email" hidden></small>
```

- `name` connects the field to its inline error placeholder.
- `id` is used by error-summary links.
- `data-label` is the readable name shown in the summary.
- `data-error-summary` marks the summary container.
- `data-form-success` marks an optional success message.

### Built-in rules

| Rule | Example | Behaviour |
|---|---|---|
| `required` | `required` | Value cannot be empty |
| `email` | `email` | Checks basic email format |
| `mobile` | `mobile` | Checks a 10-digit Indian mobile number starting 6–9 |
| `futureDate` | `futureDate` | Date must be after today's local date |
| `minLength` | `minLength:6` | Requires at least the given number of characters |
| `range` | `range:1,5` | Number must be within the inclusive minimum and maximum |
| `match` | `match:Password` | Value must match another field's `name` |

Most optional-field rules skip empty values. Add `required` when the field must be filled.

### Register a custom rule

Call `Validator.addRule(name, callback)` before creating the validator. The callback receives `(value, argument, form, field)` and must return `true` when valid or a helpful error string when invalid.

```js
Validator.addRule("noLinks", (value) =>
  !value || !/(https?:\/\/|www\.)/i.test(value) || "Please remove links."
);
```

Then use it in HTML:

```html
<textarea name="Comments" data-validate="required|minLength:15|noLinks"></textarea>
```

Custom rules are registered once per page and do not require edits to `validator.js`.

## How validation behaves

- **On submit:** every field with `data-validate` is checked. Invalid submissions are blocked.
- **On blur:** the field is marked as touched and checked.
- **On input/change:** a touched field is rechecked as the user corrects it. Untouched fields stay quiet.
- **Error summary:** all current errors appear at the top. Each link focuses and jumps to its field.
- **Groups:** `match:Password` reads the other field by its `name` and compares values. The confirmation field is rechecked when it is edited or blurred.

## Implementation notes

The library is an IIFE, so it exposes only `window.Validator` rather than adding helper variables to the global scope. Rules are stored in small objects, parsed from each input's `data-validate` attribute, and executed in order. A `Map` tracks the current errors and a `Set` tracks touched fields. The HTML pages own their field labels and layout; the validator owns the reusable validation behaviour.

The booking and feedback pages load the exact same JavaScript file. Their different rules are configured in markup, while their custom rules are registered in each page's small inline script.

## Test checklist

- Submit each form empty: summary should list all required problems and focus the first invalid field.
- Enter an invalid email and leave the field: an inline error should appear.
- Correct the email: the error should disappear without submitting.
- Booking: try an invalid mobile number, yesterday's date, 0 or 6 seats, and different passwords.
- Feedback: try a short comment and an age outside 13–100.
- Click an error-summary item: the matching field should receive focus.
- Open both pages at a narrow mobile width: fields should stack into one column.
- Confirm both pages load `js/validator.js`; no changes to that file are needed between demos.

## Limitations

This is a learning/demo client-side validator, not a security boundary. A real application must repeat all validation on the server. The email check is intentionally practical rather than a complete implementation of every valid email-address standard.
