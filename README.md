# Como rodar o projeto

## Linux

1. Baixe o node e o npm

```
sudo apt update
```

```
sudo apt install nodejs npm
```

2. (Opcional) Baixe o NVM

```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
```

3. Rode o comando

```
nvm use
```

para utilizar a versão do node do projeto e, consequentemente, do npm, localizada no arquivo `.nvmrc`

## Windows

1. Baixe o node v22 pelo site e instale

```
https://nodejs.org/en/download
```

## Passos seguintes (para ambos Linux e Windows)

1. Rode o comando

```
npm install
```

2. (Opcional) Lint / Formatter

   2.1. Se estiver usando VsCode, instale o plugin do `Prettier` e `Eslint`

   2.2. Use o atalho `Ctrl + Shift + P`, digite `settings` e procure o do vscode (Workspace Settings)

   2.2.1. Adicione no arquivo:

   ```
      {
         "editor.codeActionsOnSave": {
            "source.fixAll.eslint": "explicit"
         },
         "editor.formatOnSave": true,
         "eslint.validate": ["javascript", "vue"],
         "prettier.requireConfig": true
      }
   ```

3. Após instalada as dependências, crie um arquivo `.env` na pasta raiz e copie o `.env.example` para o dentro do arquivo recém criado

4. Para executar o frontend

   4.1. (Com backend) Rode o comando

   ```
   npm run dev
   ```

   para subir o projeto localmente na porta `5173`, com a porta `8080` falando com backend

   4.2. (Sem backend) Rode o comando

   ```
   npm run mock
   ```

   para subir o projeto localmente na porta `5173` com dados fictícios

# Como buildar o projeto para produção

Compila e minifica o projeto para produção:

```
npm run build
```

# Estrutura do projeto

O projeto segue uma estrutura de pastas **modular**, onde os arquivos são organizados com base em sua função ou recurso no sistema. Essa abordagem facilita a manutenção e a localização de arquivos relacionados a uma mesma camada ou funcionalidade.

```
src/
├── assets/ # Arquivos estáticos (imagens, fonts, etc.)
├── components/ # Componentes reutilizáveis em mais de um módulo
├── modules/ # Módulos separados por responsabilidades
├── router/ # Configuração das rotas
├── stores/ # Gerenciamento de estado
├── styles/ # Estilos globais
├── utils/ # Utilitários reutilizáveis em mais de um módulo (funções helper, constants, etc.)
└── main.js # Ponto de entrada da aplicação
```

Aqui está uma visão geral dentro da estrutura de cada módulo:
- `views`: Telas ou páginas principais do módulo.
- `components`: Componentes reutilizáveis do módulo.
- `router`: Definições de rotas do módulo.
- `services`: Serviços para requisições HTTP ou lógica de negócio.
- `mock`: Dados simulados para desenvolvimento sem backend.
- `store`: Gerenciamento de estado, se necessário.
- `utils`: Funções utilitárias específicas do módulo.

## Benefícios da estruturação

- **Reutilização de código**: Componentes e utilitários podem ser facilmente reaproveitados em diferentes partes do sistema, reduzindo duplicidade.
- **Trabalho em equipe**: Times podem trabalhar em módulos diferentes de forma independente, minimizando conflitos.
- **Isolamento de responsabilidades**: Cada módulo cuida de uma parte específica do sistema, tornando o código mais limpo e fácil de entender

## Acordos do projeto

- Código em inglês
- Todos endpoints precisam ter um mock correspondente

# Padrão de commits/branch

Seguiremos o Conventional Commits, com algumas alterações. Para facilitar o dia-a-dia do desenvolvimento, o VsCode possui uma extensão chamada `Conventional Commits`, que auxilia este processo.

## Commits

`<tipo> (<ID da tarefa no Jira>): <breve descrição em inglês>`

Exemplo: docs: updates the readme with commits pattern

## Branch

`SCRUM-<ID da tarefa no Jira>/<breve descrição em inglês>`

Exemplo: RAD-47/update-readme
