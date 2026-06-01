import { BrowserRouter, Routes, Route } from 'react-router';
import { Home } from './pages/Home';
import { Contact } from './pages/Contact';
import { Work } from './pages/Work';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/work" element={<Work />} />
      </Routes>
    </BrowserRouter>
  );
}
