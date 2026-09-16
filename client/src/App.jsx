import { Suspense, lazy } from 'react';
import './App.css';
import { Route, Routes } from 'react-router-dom';
import Home from './Views/Home/Home';
import Detail from './Views/Detail/Detail';
import About from './Views/About/About';
import Contact from './Views/Contact/Contact';
import Agendar from './Views/Agendar/Agendar';
import Navbar from './Components/Navbar/Navbar';
import ScrollToTop from './Components/ScrollToTop/ScrollToTop';
import Services from './Views/Services/Services';
import Footer from './Components/Footer/Footer';
import Blog from './Views/Blog/Blog';
import BlogDetail from './Views/BlogDetail/BlogDetail';

// Rutas de administración y login: no las necesita el público general
// (solo la astróloga), así que se cargan en un chunk aparte y no pesan
// en la primera carga de las páginas públicas.
const Login = lazy(() => import('./Views/Login/Login'));
const Register = lazy(() => import('./Views/Register/Register'));
const ForgotPassword = lazy(() => import('./Views/ForgotPassword/ForgotPassword'));
const ResetPassword = lazy(() => import('./Views/ResetPassword/ResetPassword'));
const MiCuenta = lazy(() => import('./Views/MiCuenta/MiCuenta'));
const AdminHome = lazy(() => import('./Views/AdminHome/AdminHome'));
const AdminServices = lazy(() => import('./Views/AdminServices/AdminServices'));
const AdminBlog = lazy(() => import('./Views/AdminBlog/AdminBlog'));
const AdminNovedades = lazy(() => import('./Views/AdminNovedades/AdminNovedades'));
const AdminPayments = lazy(() => import('./Views/AdminPayments/AdminPayments'));
const AdminReviews = lazy(() => import('./Views/AdminReviews/AdminReviews'));

function App() {
  return (
    <div className='App'>
      <ScrollToTop />
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
          <Route path={'/register'} element={<Register />} />
          <Route path={'/forgot-password'} element={<ForgotPassword />} />
          <Route path={'/reset-password'} element={<ResetPassword />} />
          <Route path={'/cuenta'} element={<MiCuenta />} />
          <Route path={'/admin'} element={<AdminHome />} />
          <Route path={'/admin/services'} element={<AdminServices />} />
          <Route path={'/blog'} element={<Blog />} />
          <Route path={'/blog/:slug'} element={<BlogDetail />} />
          <Route path={'/admin/blog'} element={<AdminBlog />} />
          <Route path={'/admin/novedades'} element={<AdminNovedades />} />
          <Route path={'/admin/payments'} element={<AdminPayments />} />
          <Route path={'/admin/reviews'} element={<AdminReviews />} />
        </Routes>
      </Suspense>
      <Footer />
    </div>
  );
}

export default App;
