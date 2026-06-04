import js from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginPrettier from "eslint-plugin-prettier";

export default tseslint.config(
  // 기본 JavaScript 추천 설정
  js.configs.recommended,
  // TypeScript 추천 설정
  ...tseslint.configs.recommended,
  {
    plugins: {
      prettier: eslintPluginPrettier,
    },
    rules: {
      // Prettier 규칙 위반을 ESLint 에러로 표시
      "prettier/prettier": "error",
    },
  },
  // Prettier와 충돌하는 ESLint 규칙 비활성화 (항상 마지막에 위치해야 합니다)
  eslintConfigPrettier,
);
