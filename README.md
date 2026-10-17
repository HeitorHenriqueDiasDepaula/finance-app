# Finance App

Aplicação de gestão financeira pessoal (React + TypeScript + Vite), integrada a um backend REST de transações.

## Como rodar

```bash
npm install
npm run start:all   # sobe o backend de exemplo (porta 3000) e o frontend (porta 5173) juntos
```

Abra http://localhost:5173. O frontend chama o backend em `/api` e o Vite repassa para
`http://localhost:3000` (mock-server), então não há CORS nem porta extra para configurar.

Também dá para rodar separado: `npm run mock-server` e, em outro terminal, `npm run dev`.

### Funcionalidades

- **Início:** totais de entradas, saídas e saldo, gráfico de entradas x saídas e saídas por categoria.
- **Transações:** cadastro, edição, exclusão, filtros por categoria/data e paginação.
- **Fechamento mensal:** escolha o mês e compare entradas, saídas e saldo com o mês anterior (variação em R$ e %),
  com gráficos e a lista de transações do mês.

### GitHub Codespaces

Abra o repositório no GitHub → **Code** → **Codespaces** → **Create codespace on main**.
O `.devcontainer` instala as dependências sozinho; depois rode `npm run start:all` e abra a porta **5173**
na aba **Portas**.

### Backend real

Para usar outro backend, crie um `.env` (veja `.env.example`) com `VITE_API_BASE_URL=https://api.exemplo.com`,
ou defina `API_PROXY_TARGET` para mudar o destino do proxy de desenvolvimento.

### API esperada pelo frontend

| Método | Rota | Descrição |
| ------ | ---- | --------- |
| GET | `/transactions?page=1&limit=50` | Lista paginada: `{ data: Transaction[], meta: { page, limit, totalItems, totalPages } }` |
| POST | `/transactions` | Cria uma transação (retorna `201` com o objeto criado) |
| PUT | `/transactions/:id` | Atualiza uma transação |
| DELETE | `/transactions/:id` | Remove uma transação (retorna `204`) |

Se o backend estiver fora do ar, o app usa o `localStorage` como cache/fallback e exibe o erro na tela.

---

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
