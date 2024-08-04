module.exports = {
  extends: ["eslint:recommended", "plugin:import/recommended", "prettier"],
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  rules: {
    // Turns on errors for missing imports which is great
    "import/no-unresolved": "error",
  },
};
