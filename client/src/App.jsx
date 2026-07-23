import './App.css';
import { Route, Routes } from 'react-router-dom';
import Home from './Views/Home/Home';
import Detail from './Views/Detail/Detail';
import About from './Views/About/About';
import Contact from './Views/Contact/Contact';
import Navbar from './Components/Navbar/Navbar';
import Services from './Views/Services/Services';
import Login from './Views/Login/Login';
import Footer from './Components/Footer/Footer';
import AdminServices from './Views/AdminServices/AdminServices';
import Blog from './Views/Blog/Blog';
import BlogDetail from './Views/BlogDetail/BlogDetail';
import AdminBlog from './Views/AdminBlog/AdminBlog';

function App() {
  return (
    <div className='App'>
      <Navbar />
      <Routes>
        <Route path={'/'} element={<Home />} />
        <Route path={'/services'} element={<Services />} />
        <Route path={'/services/:id'} element={<Detail />} />
        <Route path={'/about'} element={<About />} />
        <Route path={'/contact'} element={<Contact />} />
        <Route path={'/login'} element={<Login />} />
        <Route path={'/admin/services'} element={<AdminServices />} />
        <Route path={'/blog'} element={<Blog />} />
        <Route path={'/blog/:slug'} element={<BlogDetail />} />
        <Route path={'/admin/blog'} element={<AdminBlog />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
