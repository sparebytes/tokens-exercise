"use strict";

module.exports = {
  root: true,
  env: {
    node: true,
    // browser: true,
    // es2020: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "./.eslintrc.base.js",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 13,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint"],
  rules: {
    "no-spaced-func": "off",
    "linebreak-style": ["warn", "unix"],
    "quotes": ["off", "double"],
    "semi": ["warn", "always"],
    "comma-dangle": "off",
    "no-trailing-spaces": "off",
    "prettier/prettier": "off",
    "eol-last": "off",
    "curly": "off",
    "indent": "off",
    "dot-notation": "off",
    "eqeqeq": ["warn", "always", { null: "ignore" }],
    "no-extra-boolean-cast": ["off"],
    "no-undef-init": ["off"],
    "no-undef": ["off"],
    "no-undefined": ["off"],
    "no-void": "off",
    "no-console": ["warn", { allow: ["warn", "error", "info"] }],
    "handle-callback-err": "off",
    "no-unused-vars": "off",
    "no-dupe-class-members": "off",
    "prefer-const": [
      "warn",
      {
        // destructuring: "any",
        // ignoreReadBeforeAssign: false,
      },
    ],
    "no-constant-condition": [
      "warn",
      {
        checkLoops: false,
      },
    ],
    "no-fallthrough": ["error"],
    "no-shadow": ["off"],
    "camelcase": "off",
    "@typescript-eslint/camelcase": ["off"],
    // "@typescript-eslint/no-shadow": ["warn"],
    "@typescript-eslint/no-inferrable-types": "off",
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/no-empty-interface": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/ban-ts-comment": [
      "warn",
      {
        "ts-expect-error": false,
        "ts-ignore": false,
        "ts-nocheck": true,
        "ts-check": false,
      },
    ],
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/no-unnecessary-type-constraint": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/ban-types": [
      "warn",
      {
        extendDefaults: false,
        types: {
          String: {
            message: "Use string instead",
            fixWith: "string",
          },
          Boolean: {
            message: "Use boolean instead",
            fixWith: "boolean",
          },
          Number: {
            message: "Use number instead",
            fixWith: "number",
          },
          Symbol: {
            message: "Use symbol instead",
            fixWith: "symbol",
          },

          Function: {
            message: [
              "The `Function` type accepts any function-like value.",
              "It provides no type safety when calling the function, which can be a common source of bugs.",
              "It also accepts things like class declarations, which will throw at runtime as they will not be called with `new`.",
              "If you are expecting the function to accept certain arguments, you should explicitly define the function shape.",
            ].join("\n"),
          },

          // object typing
          Object: {
            message: [
              'The `Object` type actually means "any non-nullish value", so it is marginally better than `unknown`.',
              '- If you want a type meaning "any object", you probably want `Record<string, unknown>` instead.',
              '- If you want a type meaning "any value", you probably want `unknown` instead.',
            ].join("\n"),
          },
          // "{}": {
          //   message: [
          //     '`{}` actually means "any non-nullish value".',
          //     '- If you want a type meaning "any object", you probably want `Record<string, unknown>` instead.',
          //     '- If you want a type meaning "any value", you probably want `unknown` instead.',
          //   ].join("\n"),
          // },
          // object: {
          //   message: [
          //     "The `object` type is currently hard to use ([see this issue](https://github.com/microsoft/TypeScript/issues/21732)).",
          //     "Consider using `Record<string, unknown>` instead, as it allows you to more easily inspect and use the keys.",
          //   ].join("\n"),
          // },
        },
      },
    ],
  },
};
