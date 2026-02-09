# MM Astrology 🌙

Professional website of **María Marta Galli**, astrologer and holistic therapist.
The project is aimed at presenting spiritual guidance services, facilitating contact with clients, and building a clear, warm, and trustworthy digital presence.

---

## 🧭 Project Objective

To create a modern, responsive, and conversion-oriented website that allows to:

- Present holistic services clearly
- Build trust through content and design
- Facilitate direct contact via WhatsApp
- Scale in the future with backend, admin dashboard, and payments

---

## 🛠 Technologies Used

- **React** (Vite)
- **React Router DOM**
- **Tailwind CSS**
- **SweetAlert2**
- **React Icons**
- **Netlify** (deploy)

---

## 📁 Project Structure

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
Reusable and global components:
- `Navbar`: main navigation with responsive menu
- `Footer`: contact information and social links
- `CTASection`: reusable call-to-action blocks

### 📄 Views
Main site views:
- **Home**: hero section + services overview
- **Services**: full list of consultations
- **Detail**: individual service detail
- **About**: professional and personal information
- **Contact**: form with validations and WhatsApp submission

---

## 🧭 Main Routes

| Route | Description |
|-----|------------|
| `/` | Home page |
| `/services` | Services list |
| `/services/:id` | Service detail |
| `/about` | About |
| `/contact` | Contact |

> Login route is not active at the moment.

---

## ✨ Key Features

- Hero section with background image and overlay
- Responsive navbar with bars menu
- Service cards with images
- Detail view optimized for conversion
- Strategic CTAs based on user journey stage
- Contact form with:
  - Email validation
  - WhatsApp validation
  - Direct WhatsApp submission with pre-filled message
  - Success / error SweetAlert notifications

---

## 🎨 Design & UX

- Holistic and professional aesthetic
- Soft violet-based color palette
- Clear and breathable typography
- Visual hierarchy focused on readability and conversion

---

## 🚧 Project Status

🟢 **Project Status**

### Implemented
- Complete frontend
- Navigation
- Complete frontend
- Netlify deployment

### Pending / Future
- **Pending / Future** about astrology, life cycles, and self-knowledge.
- **Newsletter subscription system** to receive news.
- **Sending articles, updates, and service promotions**.
- Backend
- Admin dashboard
- Database persistence
- Payment system
- Authentication

---

## ▶️ Installation & Usage

1. Clone the repository
```bash
git clone https://github.com/JuanPGalli/mmastrologia.git
```

2. Install dependencies
```bash
npm install
```

3. Run in development
```bash
npm run dev
```

---

## 🚀 Next Steps

- Implement backend (Node / Express)
- Store services in database
- Admin panel for consultation management
- Payment integration
- Advanced SEO

---
## 👤 Autor
Developed by **Juan P. Galli** <br>
Real-world project oriented to production and scalability.
