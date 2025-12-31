Projeto Astro 5.16+
React 19.2+
PNPM
O projeto deve funcionar 100% no lado do cliente (client-side only). Nada de SSR.

---
Seja objetivo
Faça tão somente o que pedi
Se baseie tão somente na versão mais recente da documentação oficial
Sobre emojis: não use emojis. Nem use na resposta e nem dos arquivos.
Prefira sempre adicionar dependências através da cli e preferencialmente com pnpm para o pacote com a tag @latest.
Garanta que esteja fazendo um uso profissional de React sem deixar vazamento de memória e sempre mantendo referências aos devidos elementos/componentes necessários
---
NEVER MODIFY src/types/v86.d.ts. It must not be modified. It must be a copy of https://raw.githubusercontent.com/copy/v86/refs/heads/master/v86.d.ts

usamos a versão do v86 -> "v86": "^0.5.301"
prefira o uso do pacote (p)npm v86 ao invés de baixar arquivos manualmente.

src/components/v86/v86Emulator.tsx é o componente que encapsula o emulador v86. Uma leve camada (thin wrapper) de abstração para facilitar o uso do v86 no projeto Astro e adequá-lo ao lifecycle do React.

src/components/v86/v86Controller.ts é o controller que gerencia a comunicação entre o componente v86Emulator e o restante do sistema. Ele é responsável por iniciar, pausar, resetar e enviar comandos para o emulador v86. É uma camada de utilidade que facilita o controle do emulador dentro do contexto do React.

src/components/terminal/Terminal.tsx é o componente que representa o terminal interativo onde o usuário pode digitar comandos e ver a saída do sistema emulado. Ele é construído sobre ambos v86Emulator e v86Controller para fornecer uma interface de terminal funcional. Não é objetivo de Terminal.tsx ter UI bonita, mas sim conectar os componentes e favorecer uma interface intuitiva para customizações e interações com instâncias do v86.

---

src/components/code-editor/CodeEditor.tsx é o componente encapsula o codemirror (https://codemirror.net/) para fornecer uma interface de editor de código dentro do projeto Astro. Ele deve ser configurado para suportar múltiplas linguagens de programação, realce de sintaxe, auto-completar e outras funcionalidades típicas de um editor de código moderno. Este arquivo deve funcionar apenas como um thin wrapper para o codemirror, facilitando sua integração com o React e o Astro. O componente deve ser facilmente configurável. As features do editor deve ser ativadas ou desativadas via props de modo opt-in.