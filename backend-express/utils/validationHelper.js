/**
 * Zero-Dependency Lightweight Validation Engine mimicking Joi/Zod specifications.
 * Ensures clean structural validation before processing hits core controllers.
 */

const validate = (data, schema) => {
  const errors = {};
  
  for (const field in schema) {
    const rules = schema[field];
    const value = data[field];

    // 1. Required check
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      continue;
    }

    if (value !== undefined && value !== null && value !== '') {
      // 2. Minimum length check
      if (rules.min && String(value).length < rules.min) {
        errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} must be at least ${rules.min} characters`;
      }
      
      // 3. Email pattern check
      if (rules.email && !/^\S+@\S+\.\S+$/.test(String(value))) {
        errors[field] = 'Please provide a valid email address';
      }

      // 4. Custom validation callback
      if (rules.custom) {
        const customErr = rules.custom(value);
        if (customErr) errors[field] = customErr;
      }
    }
  }

  if (Object.keys(errors).length > 0) {
    const err = new Error('Validation failed');
    err.details = errors;
    err.statusCode = 400;
    throw err;
  }
};

const schemas = {
  registerSchema: {
    name: { required: true, min: 2 },
    email: { required: true, email: true },
    password: { required: true, min: 8 },
    organization: { required: false }
  },
  loginSchema: {
    email: { required: true, email: true },
    password: { required: true }
  },
  forgotPasswordSchema: {
    email: { required: true, email: true }
  },
  resetPasswordSchema: {
    password: { required: true, min: 8 }
  },
  verifyEmailSchema: {
    email: { required: true, email: true },
    otp: { required: true, min: 6 }
  }
};

module.exports = {
  validate,
  schemas
};
