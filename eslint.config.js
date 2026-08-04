import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

export default tseslint.config(
  // Arquivos ignorados
  {
    ignores: [
      'dist/',
      'node_modules/',
      'android/',
      'ios/',
      'supabase/',
      'scripts/',
      'venv/',
      '.venv/',
      'public/',
      '*.sql',
      '*.mjs',
      '*.d.ts',
      'graphify-out/',
      'jdk-17.0.10+7/',
    ],
  },

  // Base JS recomendada
  js.configs.recommended,

  // TypeScript recomendada (sem type-checked para velocidade)
  ...tseslint.configs.recommended,

  // Configurações específicas para TS/TSX
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      // React Hooks — regras de segurança
      // TODO: elevar rules-of-hooks para 'error' após corrigir hooks condicionais
      // (arquivos afetados: Onboarding.tsx, AiOpsPage.tsx, PurchaseFlow.tsx, etc.)
      'react-hooks/rules-of-hooks': 'warn',
      'react-hooks/exhaustive-deps': 'warn',

      // TypeScript — permissivo por agora (warn para não quebrar build)
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/ban-ts-comment': 'warn',

      // Blocos vazios e estilo — warn por agora
      'no-empty': 'warn',
      'no-case-declarations': 'warn',
      'prefer-const': 'warn',
      'no-useless-assignment': 'warn',
      'preserve-caught-error': 'off',

      // Segurança — manter como error
      'no-eval': 'error',
      'no-implied-eval': 'error',
    },
  },
);

