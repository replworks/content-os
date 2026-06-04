import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    rules: {
      // any 타입을 써도 에러를 내지 않도록 설정합니다.
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  eslintConfigPrettier
);
