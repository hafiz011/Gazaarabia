// No-op PostCSS config. This app uses Polaris CSS (imported as ?url), not
// Tailwind. Declaring an empty config here stops PostCSS from walking up and
// inheriting the parent Gazaarabia (Next.js) Tailwind/PostCSS pipeline.
module.exports = { plugins: {} };
