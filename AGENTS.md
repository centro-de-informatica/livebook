# Diretrizes do Projeto

## Stack Obrigatoria

- Use Astro 5.16+
- Use React 19.2+
- Use PNPM como gerenciador de pacotes
- Execute o projeto 100% no lado do cliente (client-side only)
- Nao utilize SSR

## Regras Gerais de Conduta

- Seja objetivo
- Faca tao somente o que foi pedido
- Baseie-se tao somente na versao mais recente da documentacao oficial
- Nao use emojis em nenhuma circunstancia
  - Nao use emojis nas respostas
  - Nao use emojis nos arquivos
- Adicione dependencias atraves da CLI
- Use preferencialmente PNPM com a tag @latest
- Garanta uso profissional de React
  - Nao deixe vazamento de memoria
  - Mantenha referencias aos devidos elementos/componentes necessarios

## Estrutura de Pastas e Arquivos

### Paginas

- Coloque todas as paginas em `src/pages/`
- Use o padrao de nomeacao de pastas com kebab-case (letras minusculas e hifens)
- Estruture cada pagina como: `src/pages/nome-da-pagina/index.astro`

### Componentes Especificos de Pagina

- Coloque componentes especificos de uma pagina em: `src/pages/nome-da-pagina/_components/`
- Nomeie os arquivos como: `nome-do-componente.{astro,ts,tsx}`

### Componentes Reutilizaveis

- Coloque componentes reutilizaveis em: `src/components/**/*.{astro,ts,tsx}`

### Lib Wrappers

Wrappers JAMAIS devem conter logica de negocio especifica do projeto.
Padrao obrigatorio para wrappers de bibliotecas externas:

```
src/components/<nome-ou-ref-a-lib>-wrapper/
  <nome-ou-ref-a-lib>.tsx    # Core thin wrapper
  use<nome-ou-ref-a-lib>.ts  # Hook customizado (obrigatorio para wrappers)
  index.ts                   # Exports
```

## Lib Wrappers - Implementacoes

### v86 - Emulador

#### Regras do v86

- NUNCA modifique `src/types/v86.d.ts`
  - Este arquivo deve permanecer como copia exata de: https://raw.githubusercontent.com/copy/v86/refs/heads/master/v86.d.ts
- Use a versao do v86: `"v86": "^0.5.301"`
- Prefira o uso do pacote (p)npm v86 ao inves de baixar arquivos manualmente

#### Estrutura

```
src/components/v86-wrapper/
  V86Emulator.tsx     # Core thin wrapper
  useV86.ts           # Hook customizado (obrigatorio)
  V86Controller.ts    # Controller para gerenciar comunicacao
  index.ts            # Exports
```

#### src/components/v86-wrapper/V86Emulator.tsx

- Este componente encapsula o emulador v86
- Funciona como uma leve camada (thin wrapper) de abstracao
- Facilita o uso do v86 no projeto Astro
- Adequa o v86 ao lifecycle do React

#### src/components/v86-wrapper/useV86.ts

- Hook customizado obrigatorio para o wrapper v86
- Responsabilidades:
  - Abstrair a criacao e destruicao da instancia v86
  - Gerenciar o estado do emulador
  - Fornecer funcoes utilitarias para controle do emulador
- Mantenha o hook simples e composavel

#### src/components/v86-wrapper/V86Controller.ts

- Este controller gerencia a comunicacao entre o componente V86Emulator e o restante do sistema
- Responsabilidades:
  - Iniciar o emulador
  - Pausar o emulador
  - Resetar o emulador
  - Enviar comandos para o emulador v86
- Funciona como camada de utilidade que facilita o controle do emulador dentro do contexto do React

---

### CodeMirror - Editor de Codigo

#### Estrutura

```
src/components/codemirror-wrapper/
  CodeEditor.tsx      # Core thin wrapper
  useCodeEditor.ts    # Hook customizado (obrigatorio)
  index.ts            # Exports
```

#### src/components/codemirror-wrapper/CodeEditor.tsx

- Este componente encapsula o CodeMirror (https://codemirror.net/)
- Fornece uma interface de editor de codigo dentro do projeto Astro
- Configure para suportar:
  - Multiplas linguagens de programacao
  - Realce de sintaxe
  - Auto-completar
  - Outras funcionalidades tipicas de um editor de codigo moderno
- Funcione apenas como um thin wrapper para o CodeMirror
- Facilite a integracao com o React e o Astro
- Torne o componente facilmente configuravel
- Ative ou desative as features do editor via props de modo opt-in

#### src/components/codemirror-wrapper/useCodeEditor.ts

- Hook customizado obrigatorio para o wrapper CodeMirror
- Responsabilidades:
  - Abstrair a criacao e destruicao da instancia EditorView
  - Gerenciar o estado do editor
  - Fornecer funcoes utilitarias (getValue, setValue, focus, etc.)
- Mantenha o hook simples e composavel

---

### RoughJS - Handmade/Sketch

#### Regras do RoughJS

- Use a biblioteca RoughJS (https://roughjs.com/)
- Use para desenhos com estilo hand-drawn/sketch

#### Estrutura

```
src/components/rough-wrapper/
  RoughCanvas.tsx     # Core thin wrapper
  RoughSvg.tsx        # Core thin wrapper SVG
  useRough.ts         # Hook customizado (obrigatorio)
  index.ts            # Exports
```

#### src/components/rough-wrapper/RoughCanvas.tsx

- Este componente encapsula o RoughJS
- Funciona como uma leve camada (thin wrapper) de abstracao
- Facilita o uso do RoughJS no projeto Astro
- Adequa o RoughJS ao lifecycle do React
- Responsabilidades:
  - Criar e gerenciar a instancia do rough canvas
  - Bindear o canvas ao ref do React
  - Limpar recursos no unmount do componente
  - Expor a instancia rough para uso externo via ref ou callback
- Mantenha o componente stateless quando possivel
- Delegue a logica de desenho para o componente pai ou para hooks customizados
- Nao implemente logica de desenho especifica dentro do wrapper
- Permita que o consumidor acesse a instancia `RoughCanvas` diretamente
- Gerencie corretamente o resize do canvas
- Use `useRef` para manter referencia ao elemento canvas
- Use `useEffect` para inicializar o rough canvas apos o mount
- Limpe a instancia rough no cleanup do useEffect

#### src/components/rough-wrapper/useRough.ts

- Hook customizado obrigatorio para o wrapper RoughJS
- Responsabilidades:
  - Abstrair a criacao da instancia rough
  - Fornecer funcoes utilitarias para desenho
  - Gerenciar o estado do canvas se necessario
- Mantenha o hook simples e composavel

## Terminal

### src/components/terminal/Terminal.tsx

- Este componente representa o terminal interativo
- Permite ao usuario digitar comandos e ver a saida do sistema emulado
- Construido sobre ambos V86Emulator e V86Controller
- Fornece uma interface de terminal funcional
- Nao e objetivo deste componente ter UI bonita
- O objetivo e conectar os componentes e favorecer uma interface intuitiva para:
  - Customizacoes
  - Interacoes com instancias do v86

## React 19.2

### 1. Component Activity & State Preservation

**Regra:** Não use renderização condicional (`{show && <Component />}`) para UIs que possuem estado interno (inputs, scroll, vídeo). Use o componente `<Activity />`.

* **Para que:** Manter o estado e o DOM vivos enquanto o componente está oculto.
* **Comportamento:** `mode="hidden"` unmonta os efeitos (`useEffect`), pausa timers e desprioriza renderização, mas mantém o estado.

```javascript
// snippet-generic-activity.tsx
import { Activity } from 'react';

function TabSystem({ activeTab }) {
  return (
    <>
      <Activity mode={activeTab === 'search' ? 'visible' : 'hidden'}>
        <SearchPanel /> {/* Mantém o texto digitado ao trocar de aba */}
      </Activity>
      <Activity mode={activeTab === 'settings' ? 'visible' : 'hidden'}>
        <SettingsPanel />
      </Activity>
    </>
  );
}

```

### 2. Declarative Resource Handling with `use`

**Regra:** Utilize o hook `use(promise)` para ler dados assíncronos diretamente no corpo da renderização.

* **Para que:** Eliminar `useEffect` para data fetching e `isLoading` manuais.
* **Restrição:** No client-side, a Promise deve ser estável (ex: vinda de um cache ou memoizada) para evitar loops.

```javascript
// snippet-generic-use.tsx
import { use } from 'react';

function UserProfile({ userPromise }) {
  // O componente "suspende" automaticamente aqui
  const user = use(userPromise); 
  return <div>Hello, {user.name}</div>;
}

```

### 3. Logic Decoupling with `useEffectEvent`

**Regra:** Funções que acessam props/state mas não devem disparar o efeito devem ser envolvidas em `useEffectEvent`.

* **Para que:** Manter arrays de dependência limpos e evitar execuções desnecessárias.

```javascript
// snippet-generic-effect-event.tsx
import { useEffect, useEffectEvent } from 'react';

function Chat({ roomId, theme }) {
  const onConnected = useEffectEvent(() => {
    logAnalytics("Connected", theme); // Usa 'theme' sem ser dependência
  });

  useEffect(() => {
    const conn = connect(roomId);
    conn.on('open', onConnected);
    return () => conn.disconnect();
  }, [roomId]); // Não dispara se o tema mudar
}

```

### 4. UI Transitions with `ViewTransition`

**Regra:** Envolva mudanças de estado que alteram a UI drasticamente em `<ViewTransition />`.

* **Para que:** Ativar a API de View Transitions nativa do browser para animações fluidas (cross-fade automático).
* **Requisito:** A mudança de estado deve ocorrer dentro de um `startTransition`.

```javascript
// snippet-generic-viewtransition.tsx
import { ViewTransition, useTransition } from 'react';

function Gallery({ images }) {
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useState(0);

  const next = () => startTransition(() => setSelected(s => s + 1));

  return (
    <ViewTransition>
      <img key={images[selected].id} src={images[selected].url} />
    </ViewTransition>
  );
}

```

### 5. Robust Error Handling with `ErrorBoundaries`

**Regra:** Todo componente que utiliza `use(promise)` DEVE estar envolto em um `ErrorBoundary`.

* **Para que:** Capturar rejeições de Promises de forma declarativa, separando o "caminho feliz" da lógica de erro.

```javascript
// snippet-generic-error-boundary.tsx
import { ErrorBoundary } from 'react-error-boundary';

function App() {
  return (
    <ErrorBoundary fallback={<ErrorMessage />}>
      <Suspense fallback={<Skeleton />}>
        <UserProfile userPromise={api.fetchUser()} />
      </Suspense>
    </ErrorBoundary>
  );
}

```

---

## Technical References

* [React 19.2 Activity Documentation](https://react.dev/reference/react/Activity)
* [The `use` Hook Guide](https://www.google.com/search?q=%5Bhttps://react.dev/reference/react/use%5D(https://react.dev/reference/react/use))
* [Decoupling Effects with useEffectEvent](https://react.dev/reference/react/useEffectEvent)
* [View Transitions API in React](https://www.google.com/search?q=https://react.dev/reference/react-dom/components/ViewTransition)

