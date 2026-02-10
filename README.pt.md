# MM Astrologia 🌙

Site profissional de **María Marta Galli**, astróloga e terapeuta holística.
O projeto é voltado para apresentar serviços de acompanhamento espiritual, facilitar o contato com clientes e construir uma presença digital clara, acolhedora e confiável.

---

## 🧭 Objetivo do Projeto

Criar um site moderno, responsivo e orientado à conversão que permita:

- Apresentar serviços holísticos de forma clara
- Gerar confiança através do conteúdo e do design
- Facilitar o contato direto via WhatsApp
- Escalar no futuro com backend, painel administrativo e pagamentos

---

## 🛠 Tecnologias Utilizadas

- **React** (Vite)
- **React Router DOM**
- **Tailwind CSS**
- **SweetAlert2**
- **React Icons**
- **Netlify** (deploy)

---

## 📁 Estrutura do Projeto

```
src/
├── Components/
│ ├── Navbar/
│ ├── Footer/
│ ├── CTASection/
│
├── Views/
│ ├── Home/
│ ├── Services/
│ ├── Detail/
│ ├── About/
│ ├── Contact/
│
├── App.jsx
├── main.jsx
```


### 🧩 Components
Componentes reutilizáveis e globais:
- `Navbar`: navegação principal com menu responsivo
- `Footer`: informações de contato e redes sociais
- `CTASection`: chamadas para ação reutilizáveis

### 📄 Views
Principais páginas do site:
- **Home**: hero + resumo dos serviços
- **Services**: lista completa de consultas
- **Detail**: detalhe individual de cada serviço
- **About**: informações profissionais e pessoais
- **Contact**: formulário com validações e envio via WhatsApp

---

## 🧭 Rotas Principais

| Rota | Descrição |
|-----|------------|
| `/` | Página inicial |
| `/services` | Lista de consultas |
| `/services/:id` | Detalhe do serviço |
| `/about` | Sobre mim |
| `/contact` | Contato |

> A rota de login não está ativa no momento.

---

## ✨ Funcionalidades em Destaque

- Hero com imagem de fundo e overlay
- Navbar responsiva com menu de barras
- Cards de serviços com imagens
- Página de detalhe otimizada para conversão
- CTAs estratégicos conforme a jornada do usuário
- Formulário de contato com:
  - Validação de e-mail
  - Validação de WhatsApp
  - Envio direto para WhatsApp com mensagem pré-preenchida
  - SweetAlert de sucesso / erro

---

## 🎨 Design & UX

- Estética holística e profissional
- Paleta baseada em tons suaves de violeta
- Tipografia clara e arejada
- Hierarquia visual focada em leitura e conversão

---

## 🚧 Status do Projeto

🟢 **Em desenvolvimento ativo**

### Implementado
- Frontend completo
- Navegação
- Contato funcional
- Deploy no Netlify

### Pendente / Futuro
- **Blog de conteúdo** sobre astrologia, ciclos de vida e autoconhecimento
- **Sistema de inscrição em newsletter**
- **Envio de artigos, atualizações e promoções de serviços**
- Backend
- Painel administrativo
- Persistência em banco de dados
- Sistema de pagamentos
- Autenticação

---

## ▶️ Instalação e Uso

1. Clonar o repositorio
```bash
git clone https://github.com/JuanPGalli/mmastrologia.git
```

2. Instalar as dependências
```bash
npm install
```

3. Executar em desenvolvimento
```bash
npm run dev
```

---

## 🚀 Próximos Passos

- Implementar backend (Node / Express)
- Salvar serviços em banco de dados
- Painel admin para gestão de consultas
- Integração com pagamentos
- SEO avançado

---
## 👤 Autor
Desenvolvido por **Juan P. Galli** <br>
Projeto real orientado à produção e escalabilidade.
