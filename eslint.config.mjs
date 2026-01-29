import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";
import reactHooks from "eslint-plugin-react-hooks";
import { defineConfig } from "eslint/config";

const eslintConfig = defineConfig([...nextVitals, ...nextTs, prettier, reactHooks.configs.flat.recommended]);

export default eslintConfig;
