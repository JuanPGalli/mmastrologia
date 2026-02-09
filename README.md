# MM Astrología 🌙

Sitio web profesional de **María Marta Galli**, astróloga y terapeuta holística.
El proyecto está orientado a presentar servicios de acompañamiento espiritual, facilitar el contacto con consultantes y construir una presencia digital clara, cálida y confiable.

---

## 🧭 Objetivo del proyecto

Crear una web moderna, responsive y orientada a la conversión que permita:

- Presentar servicios holísticos de forma clara
- Generar confianza a través del contenido y el diseño
- Facilitar el contacto directo vía WhatsApp
- Escalar a futuro con backend, dashboard de administración y pagos

---

## 🛠 Tecnologías utilizadas

- **React** (Vite)
- **React Router DOM**
- **Tailwind CSS**
- **SweetAlert2**
- **React Icons**
- **Netlify** (deploy)

---

## 📁 Estructura del proyecto

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
Componentes reutilizables y globales:
- `Navbar`: navegación principal con menú responsive
- `Footer`: información de contacto y redes
- `CTASection`: llamados a la acción reutilizables

### 📄 Views
Vistas principales del sitio:
- **Home**: hero + resumen de servicios
- **Services**: listado completo de consultas
- **Detail**: detalle individual de cada servicio
- **About**: información profesional y personal
- **Contact**: formulario con validaciones y envío a WhatsApp

---

## 🧭 Rutas principales

| Ruta | Descripción |
|-----|------------|
| `/` | Página de inicio |
| `/services` | Listado de consultas |
| `/services/:id` | Detalle del servicio |
| `/about` | Sobre mí |
| `/contact` | Contacto |

> La ruta de login no está activa por el momento.

---

## ✨ Funcionalidades destacadas

- Hero con imagen de fondo y overlay
- Navbar responsive con menú hamburguesa
- Cards de servicios con imágenes
- Vista detalle optimizada para conversión
- CTA estratégicos según la etapa del usuario
- Formulario de contacto con:
  - Validación de email
  - Validación de WhatsApp
  - Envío directo a WhatsApp con mensaje prearmado
  - SweetAlert de éxito / error

---

## 🎨 Diseño y UX

- Estética holística y profesional
- Paleta basada en violetas suaves
- Tipografía clara y respirable
- Jerarquía visual orientada a lectura y conversión

---

## 🚧 Estado del proyecto

🟢 **En desarrollo activo**

### Implementado
- Frontend completo
- Navegación
- Contacto funcional
- Deploy en Netlify

### Pendiente / futuro
- **Blog de contenidos** sobre astrología, ciclos de vida y autoconocimiento.
- **Sistema de suscripción a newsletter** para recibir novedades.
- **Envío de artículos, actualizaciones y promociones de servicios**.
- Backend
- Dashboard de administración
- Persistencia en base de datos
- Sistema de pagos
- Autenticación

---

## ▶️ Instalación y uso

1. Clonar el repositorio
```bash
git clone https://github.com/JuanPGalli/mmastrologia.git
Instalar dependencias

npm install
Ejecutar en desarrollo

npm run dev

🚀 Próximos pasos
Implementar backend (Node / Express)

Guardar servicios en base de datos

Panel admin para gestión de consultas

Integración con pagos

SEO avanzado

👤 Autor
Desarrollado por Juan P. Galli
Proyecto real orientado a producción y escalabilidad.
