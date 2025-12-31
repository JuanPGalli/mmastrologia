import './App.css';
import { Route, Routes } from 'react-router-dom';
import Home from './Views/Home/Home';
import Detail from './Views/Detail/Detail';
import Landing from './Views/Landing/Landing';
import About from './Views/About/About';
import Contact from './Views/Contact/Contact';
import Navbar from './Components/Navbar/Navbar';

function App() {
  return (
    <div className='App'>
      <Navbar />
      <Routes>
        <Route path={'/'} element={<Landing />} />
        <Route path={'/home'} element={<Home />} />
        <Route path={'/detail:id'} element={<Detail />} />
        <Route path={'/about'} element={<About />} />
        <Route path={'/contact'} element={<Contact />} />
      </Routes>
    </div>
  );
}

export default App;
