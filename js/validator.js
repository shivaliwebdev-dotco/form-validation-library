/*
  Tiny reusable form validator
  - Rules are declared in data-validate attributes.
  - Custom rules can be registered with Validator.addRule().
  - Group rules receive the whole form and current field.
*/
(function (global) {
  "use strict";

  const builtInRules = {
    required(value) {
      return String(value ?? "").trim().length > 0 || "This field is required.";
    },
    email(value) {
      if (!value) return true;
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value) || "Enter a valid email address.";
    },
    mobile(value) {
      if (!value) return true;
      return /^[6-9]\d{9}$/.test(value) || "Enter a valid 10-digit Indian mobile number.";
    },
    futureDate(value) {
      if (!value) return true;
      // Compare date-only values with today's local date.
      const today = new Date();
      const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      return value > todayKey || "Choose a date in the future.";
    },
    minLength(value, length) {
      if (!value) return true;
      return value.length >= Number(length) || `Enter at least ${length} characters.`;
    },
    range(value, limits) {
      if (!value) return true;
      const [min, max] = String(limits).split(",").map(Number);
      const number = Number(value);
      return (Number.isFinite(number) && number >= min && number <= max) ||
        `Enter a number between ${min} and ${max}.`;
    },
    match(value, targetName, form, field) {
      if (!value) return true;
      const target = form.elements.namedItem(targetName);
      return Boolean(target && value === target.value) || "These fields do not match.";
    }
  };

  const customRules = {};

  function parseRules(field) {
    const raw = field.dataset.validate || "";
    return raw.split("|").map((part) => part.trim()).filter(Boolean).map((part) => {
      const separator = part.indexOf(":");
      return separator === -1
        ? { name: part, argument: undefined }
        : { name: part.slice(0, separator), argument: part.slice(separator + 1) };
    });
  }

  class FormValidator {
    constructor(form, options = {}) {
      if (!form) throw new Error("Validator needs a form element.");
      this.form = form;
      this.options = { summary: "[data-error-summary]", ...options };
      this.summary = form.querySelector(this.options.summary);
      this.touched = new Set();
      this.errors = new Map();
      this.fields = Array.from(form.querySelectorAll("[data-validate]"));
      this.bindEvents();
    }

    bindEvents() {
      this.fields.forEach((field) => {
        field.addEventListener("blur", () => {
          this.touched.add(field);
          this.validateField(field);
          this.renderSummary();
        });

        field.addEventListener("input", () => {
          if (this.touched.has(field)) {
            this.validateField(field);
            this.renderSummary();
          }
        });

        field.addEventListener("change", () => {
          if (this.touched.has(field)) {
            this.validateField(field);
            this.renderSummary();
          }
        });
      });

      this.form.addEventListener("submit", (event) => {
        const valid = this.validateAll();
        if (!valid) {
          event.preventDefault();
          const firstInvalid = this.fields.find((field) => this.errors.has(field));
          if (firstInvalid) firstInvalid.focus();
        } else {
          event.preventDefault();
          this.showSuccess();
        }
      });
    }

    validateField(field) {
      const messages = [];
      const rules = parseRules(field);

      for (const rule of rules) {
        const handler = customRules[rule.name] || builtInRules[rule.name];
        if (!handler) {
          console.warn(`Unknown validation rule: ${rule.name}`);
          continue;
        }
        const result = handler(field.value.trim ? field.value.trim() : field.value,
          rule.argument, this.form, field);
        if (result !== true) messages.push(typeof result === "string" ? result : "Invalid value.");
      }

      this.setFieldState(field, messages);
      if (messages.length) this.errors.set(field, messages);
      else this.errors.delete(field);
      return messages.length === 0;
    }

    validateAll() {
      this.fields.forEach((field) => {
        this.touched.add(field);
        this.validateField(field);
      });
      this.renderSummary();
      return this.errors.size === 0;
    }

    setFieldState(field, messages) {
      const errorElement = this.form.querySelector(`[data-error-for="${CSS.escape(field.name)}"]`);
      const invalid = messages.length > 0;
      field.setAttribute("aria-invalid", String(invalid));
      if (errorElement) {
        errorElement.textContent = messages.join(" ");
        errorElement.hidden = !invalid;
      }
    }

    renderSummary() {
      if (!this.summary) return;
      this.summary.replaceChildren();

      if (this.errors.size === 0) {
        this.summary.hidden = true;
        return;
      }

      this.summary.hidden = false;
      const heading = document.createElement("strong");
      heading.textContent = `A few things need your attention (${this.errors.size})`;
      const list = document.createElement("ul");

      this.errors.forEach((messages, field) => {
        const item = document.createElement("li");
        const link = document.createElement("a");
        link.href = `#${field.id}`;
        link.textContent = `${field.dataset.label || field.name}: ${messages[0]}`;
        link.addEventListener("click", () => field.focus());
        item.append(link);
        list.append(item);
      });

      this.summary.append(heading, list);
    }

    showSuccess() {
      const notice = this.form.querySelector("[data-form-success]");
      if (notice) {
        notice.hidden = false;
        notice.textContent = "Looks good! Your form passed validation.";
      }
      this.form.querySelectorAll("[data-error-summary]").forEach((node) => {
        node.hidden = true;
      });
    }

    static addRule(name, callback) {
      if (!name || typeof callback !== "function") {
        throw new TypeError("addRule(name, callback) expects a rule name and function.");
      }
      customRules[name] = callback;
    }
  }

  global.Validator = FormValidator;
})(window);
