import { useState } from 'react';
import Swal from 'sweetalert2';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\+?[0-9\s-]{8,15}$/;

const WHATSAPP_NUMBER = '5491128933987';

const Contact = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!form.name || !form.email || !form.phone || !form.message) {
      return 'Por favor completá todos los campos.';
    }
    if (!emailRegex.test(form.email)) {
      return 'El email ingresado no es válido.';
    }
    if (!phoneRegex.test(form.phone)) {
      return 'El número de WhatsApp no es válido.';
    }
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const error = validateForm();
    if (error) {
      Swal.fire({
        icon: 'warning',
        title: 'Revisá el formulario',
        text: error,
        confirmButtonColor: '#7c3aed',
      });
      return;
    }

    const whatsappMessage = encodeURIComponent(
      `Hola, soy ${form.name}.
Email: ${form.email}
WhatsApp: ${form.phone}

Consulta:
${form.message}`,
    );

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`;

    Swal.fire({
      icon: 'success',
      title: 'Mensaje listo para enviar',
      text: 'Al hacer click se abrirá WhatsApp con tu consulta.',
      showCancelButton: true,
      confirmButtonText: 'Abrir WhatsApp',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#7c3aed',
    }).then((result) => {
      if (result.isConfirmed) {
        window.open(whatsappUrl, '_blank');
        setForm({ name: '', email: '', phone: '', message: '' });
      }
    });
  };

  return (
    <main className='pt-32 min-h-screen bg-[#f7f3fb]'>
      <section className='max-w-4xl mx-auto px-6'>
        <h1 className='text-4xl font-light text-purple-900 mb-6 text-center'>Contacto</h1>

        <p className='text-center text-gray-600 mb-12'>
          Podés escribirme para consultas, disponibilidad o para recibir orientación sobre qué
          acompañamiento es más adecuado para vos.
        </p>

        <form onSubmit={handleSubmit} className='bg-white shadow-md rounded-xl p-8 space-y-6'>
          <input
            type='text'
            name='name'
            placeholder='Nombre y apellido'
            value={form.name}
            onChange={handleChange}
            className='w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300'
          />

          <input
            type='email'
            name='email'
            placeholder='Email'
            value={form.email}
            onChange={handleChange}
            className='w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300'
          />

          <input
            type='text'
            name='phone'
            placeholder='WhatsApp (con código de país)'
            value={form.phone}
            onChange={handleChange}
            className='w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300'
          />

          <textarea
            name='message'
            rows='4'
            placeholder='Contame brevemente tu consulta'
            value={form.message}
            onChange={handleChange}
            className='w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300'
          />

          <button
            type='submit'
            className='w-full bg-purple-700 text-white py-4 rounded-full hover:bg-purple-800 transition'
          >
            Enviar consulta por WhatsApp
          </button>
        </form>
      </section>
    </main>
  );
};

export default Contact;
