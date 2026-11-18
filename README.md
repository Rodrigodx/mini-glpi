# 🛠️ Mini-GLPI — Sistema de Gestão de Chamados e Ativos de TI

[![CI - Mini-GLPI (Backend & Frontend)](https://github.com/Rodrigodx/mini-glpi/actions/workflows/ci.yml/badge.svg)](https://github.com/Rodrigodx/mini-glpi/actions)

Sistema web full-stack para abertura pública de chamados técnicos, controle patrimonial de equipamentos e gerenciamento operacional de atendimentos em fluxo **Kanban**, projetado com foco em simplicidade, segurança, acessibilidade (WCAG 2.1) e responsividade.

---

## 📋 Visão Geral e Funcionalidades

- **Portal Público de Abertura de Chamados:** Registro ágil de ocorrências vinculadas à tag patrimonial do equipamento, com validação reativa de campos obrigatórios e geração imediata de protocolo.
- **Autenticação e Controle de Acesso (JWT):** Área técnica protegida com **Spring Security** e tokens **JWT**, separando o acesso público de abertura do painel operacional da equipe técnica.
- **Painel Kanban Operacional:** Organização visual do ciclo de vida dos atendimentos em três estados (`ABERTO`, `EM_ANDAMENTO` e `CONCLUIDO`), com transição controlada de status.
- **Encerramento Técnico Auditável:** Modal dedicado para conclusão de chamados exigindo o preenchimento obrigatório do laudo técnico da solução aplicada.
- **Acessibilidade e Inclusão Digital (ODS 9 e ODS 10):** Conformidade com diretrizes **WCAG 2.1 / 2.5.5** (`skip-link` para salto de navegação, anéis de foco de alta visibilidade `:focus-visible`, marcos semânticos HTML5/ARIA, alto contraste e alvos de toque mínimos de `44px`).
- **Design Responsivo:** Grade adaptativa em CSS Grid que reorganiza o quadro Kanban conforme a resolução (3 colunas no desktop, 2 colunas em tablets e 1 coluna empilhada em smartphones) e modal com rolagem dinâmica (`90dvh`).

---

## 🏗️ Arquitetura e Tecnologias

O projeto está estruturado em monorepo dividido entre backend RESTful e frontend SPA:

### Backend (`/backend/mini-glpi`)
- **Linguagem & Runtime:** Java 17
- **Framework:** Spring Boot (Spring Web, Spring Data JPA, Spring Security)
- **Persistência:** PostgreSQL / Supabase (com controle de acesso e políticas RLS) e H2 para ambiente isolado de testes
- **Segurança:** Autenticação stateless via JSON Web Token (JWT) e tratamento global de exceções (`GlobalExceptionHandler`)
- **Testes & Cobertura:** JUnit 5, Mockito e JaCoCo

### Frontend (`/frontend`)
- **Framework:** Angular (Standalone Components) + TypeScript
- **Estilização:** CSS3 puro com variáveis customizadas, metodologia *mobile-first* e WCAG 2.1
- **Testes & Cobertura:** Vitest + `@vitest/coverage-v8`

### DevOps & Qualidade
- **CI/CD:** GitHub Actions (`CI - Mini-GLPI (Backend & Frontend)`) executando automaticamente build, testes unitários do backend e testes + build de produção do frontend a cada push ou Pull Request na branch `main`.

---

## 📁 Estrutura do Repositório

```text
mini-glpi/
├── .github/
│   └── workflows/          # Pipeline de Integração Contínua (GitHub Actions)
├── backend/
│   └── mini-glpi/          # API REST Spring Boot (Java 17 + Maven Wrapper)
│       └── src/
│           ├── main/java/com/rodrigo/miniglpi/
│           │   ├── config/         # Inicialização de dados e configurações
│           │   ├── controller/     # Endpoints REST (Auth e Chamados)
│           │   ├── dto/            # Objetos de transferência e validação
│           │   ├── exception/      # Tratamento padronizado de erros HTTP
│           │   ├── model/          # Entidades JPA (Chamado, Equipamento, Usuario)
│           │   ├── repository/     # Interfaces Spring Data JPA
│           │   ├── security/       # Filtro JWT e configuração Spring Security
│           │   └── service/        # Regras de negócio isoladas
│           └── test/               # Testes unitários (JUnit 5 + Mockito)
└── frontend/               # Aplicação SPA Angular
    └── src/
        ├── app/
        │   ├── pages/              # Componentes (Abertura, Login, Kanban)
        │   └── services/           # Integração HTTP e interceptors JWT
        └── styles.css              # Design system responsivo e acessível
```
---
## 🚀 Como Executar Localmente
**Pré-requisitos**

- **Java JDK 17+**

- **Node.js 20+ e npm**

- **Instância PostgreSQL (ou configuração de variáveis de ambiente do banco no application.properties)**

**1. Executando o Backend**
```
cd backend/mini-glpi
./mvnw spring-boot:run
```
**2. Executando o Frontend**
```
cd frontend
npm install
npx ng serve
```

**🧪 Testes Automatizados e Cobertura**
 
```
cd backend/mini-glpi
./mvnw test
```
- Valida os fluxos críticos de regra de negócio em ChamadoService (abertura de chamado, bloqueio de equipamento inativo/inexistente, transição de status e obrigatoriedade de laudo técnico no encerramento).

```
cd frontend
npx ng test --watch=false --coverage
```
- Valida o comportamento dos componentes principais (AberturaChamadoComponent e KanbanComponent) e gera o relatório de cobertura de código.
