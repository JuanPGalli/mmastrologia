import { useState } from 'react';
import Swal from 'sweetalert2';
import { sendContactMessage } from '../../api/contact';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const WHATSAPP_NUMBER = '5491128933987';

const initialForm = { name: '', email: '', phone: '', message: '', website: '' };

const Contact = () => {
  const [form, setForm] = useState(initialForm);
  const [sending, setSending] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!form.name || !form.email || !form.message) {
      return 'Por favor completá nombre, email y tu consulta.';
    }
    if (!emailRegex.test(form.email)) {
      return 'El email ingresado no es válido.';
    }
    return null;
  };

  const handleSubmit = async (e) => {
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

    setSending(true);

    try {
      await sendContactMessage(form);
      setForm(initialForm);
      Swal.fire({
        icon: 'success',
        title: 'Mensaje enviado',
        text: 'Gracias por escribir. Te voy a responder a la brevedad.',
        confirmButtonColor: '#7c3aed',
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'No se pudo enviar',
        text: err.message,
        confirmButtonColor: '#7c3aed',
      });
    } finally {
      setSending(false);
    }
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
          {/* Honeypot anti-spam: invisible para personas, si un bot lo completa se descarta */}
          <input
            type='text'
            name='website'
            value={form.website}
            onChange={handleChange}
            tabIndex='-1'
            autoComplete='off'
            className='hidden'
            aria-hidden='true'
          />

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
            placeholder='WhatsApp (opcional, con código de país)'
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
            disabled={sending}
            className='w-full bg-purple-700 text-white py-4 rounded-full hover:bg-purple-800 transition disabled:opacity-60'
          >
            {sending ? 'Enviando...' : 'Enviar consulta'}
          </button>
        </form>

        <p className='text-center text-sm text-gray-500 mt-6'>
          ¿Preferís escribir directo?{' '}
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target='_blank'
            rel='noreferrer'
            className='text-purple-800 underline underline-offset-4 hover:text-purple-950'
          >
            Escribime por WhatsApp
          </a>
        </p>
      </section>
    </main>
  );
};

export default Contact;
