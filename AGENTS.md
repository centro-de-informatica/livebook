Projeto Astro 5.16+
React 19.2+
PNPM

---
Seja objetivo
Faça tão somente o que pedi
Se baseie tão somente na versão mais recente da documentação oficial
Sobre emojis: não use emojis. Nem use na resposta e nem dos arquivos.
Prefira sempre adicionar dependências através da cli e preferencialmente com pnpm para o pacote com a tag @latest.
---
NEVER MODIFY src/types/v86.d.ts. It must not be modified. It must be a copy of https://raw.githubusercontent.com/copy/v86/refs/heads/master/v86.d.ts

usamos a versão do v86 -> "v86": "^0.5.301"
prefira o uso do pacote (p)npm v86 ao invés de baixar arquivos manualmente.

src/components/v86/v86Emulator.tsx é o componente que encapsula o emulador v86. Uma leve camada (thin wrapper) de abstração para facilitar o uso do v86 no projeto Astro e adequá-lo ao lifecycle do React.