import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const brandColorsPlugin = {
  rules: {
    "no-raw-colors": {
      meta: {
        type: "problem",
        docs: {
          description: "Enforce ArriveLink brand tokens and disallow raw Tailwind colors (gray, red, etc.) or arbitrary hex colors in classNames.",
        },
        messages: {
          rawColor: "Avoid hardcoded or non-brand color '{{color}}'. Use ArriveLink brand tokens (forest, pine, emerald, lime, mist, error, muted-bg, etc.) instead.",
        },
        schema: [],
      },
      create(context) {
        const rawColorPattern = /(?:^|\s)(?:(?:dark:|hover:|focus:|active:|group-hover:|disabled:)*)(?:bg|text|border|ring|stroke|fill|divide|outline|accent)-(?:gray|red|blue|purple|pink|indigo|violet|cyan|teal|orange)-\d+(?:\/\d+)?(?=\s|$)|(?:(?:dark:|hover:|focus:|active:|group-hover:|disabled:)*)(?:bg|text|border|ring|stroke|fill|divide|outline|accent)-\[#([0-9a-fA-F]{3,8})\]/g;

        function checkClassString(str, node) {
          if (typeof str !== "string") return;
          let match;
          while ((match = rawColorPattern.exec(str)) !== null) {
            context.report({
              node,
              messageId: "rawColor",
              data: { color: match[0].trim() },
            });
          }
        }

        return {
          JSXAttribute(node) {
            if (node.name.name === "className") {
              if (node.value && node.value.type === "Literal") {
                checkClassString(node.value.value, node.value);
              } else if (node.value && node.value.type === "JSXExpressionContainer") {
                const expr = node.value.expression;
                if (expr.type === "Literal") {
                  checkClassString(expr.value, expr);
                } else if (expr.type === "TemplateLiteral") {
                  expr.quasis.forEach((quasi) => {
                    checkClassString(quasi.value.raw, quasi);
                  });
                }
              }
            }
          },
        };
      },
    },
  },
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: {
      "brand-guard": brandColorsPlugin,
    },
    rules: {
      "brand-guard/no-raw-colors": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
