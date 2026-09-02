import { Suspense, lazy } from 'react';
import './App.css';
import { Route, Routes } from 'react-router-dom';
import Home from './Views/Home/Home';
import Detail from './Views/Detail/Detail';
import About from './Views/About/About';
import Contact from './Views/Contact/Contact';
import Agendar from './Views/Agendar/Agendar';
import Navbar from './Components/Navbar/Navbar';
import Services from './Views/Services/Services';
import Footer from './Components/Footer/Footer';
import Blog from './Views/Blog/Blog';
import BlogDetail from './Views/BlogDetail/BlogDetail';

// Rutas de administración y login: no las necesita el público general
// (solo la astróloga), así que se cargan en un chunk aparte y no pesan
// en la primera carga de las páginas públicas.
const Login = lazy(() => import('./Views/Login/Login'));
const AdminHome = lazy(() => import('./Views/AdminHome/AdminHome'));
const AdminServices = lazy(() => import('./Views/AdminServices/AdminServices'));
const AdminBlog = lazy(() => import('./Views/AdminBlog/AdminBlog'));

function App() {
  return (
    <div className='App'>
      <Navbar />
      <Suspense fallback={<div className='pt-32 min-h-screen bg-[#f7f3fb]' />}>
        <Routes>
          <Route path={'/'} element={<Home />} />
          <Route path={'/services'} element={<Services />} />
          <Route path={'/services/:id'} element={<Detail />} />
          <Route path={'/about'} element={<About />} />
          <Route path={'/contact'} element={<Contact />} />
          <Route path={'/agendar'} element={<Agendar />} />
          <Route path={'/login'} element={<Login />} />
          <Route path={'/admin'} element={<AdminHome />} />
          <Route path={'/admin/services'} element={<AdminServices />} />
          <Route path={'/blog'} element={<Blog />} />
          <Route path={'/blog/:slug'} element={<BlogDetail />} />
          <Route path={'/admin/blog'} element={<AdminBlog />} />
        </Routes>
      </Suspense>
      <Footer />
    </div>
  );
}

export default App;
