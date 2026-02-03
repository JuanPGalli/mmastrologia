import React from 'react';

const Contact = () => {
  return (
    <main className='pt-32 bg-[#f7f3fb] min-h-screen'>
      {/* Intro */}
      <section className='max-w-3xl mx-auto px-6 text-center mb-12'>
        <h1 className='text-4xl text-purple-900 mb-6'>Contacto</h1>

        <p className='text-lg text-purple-700'>
          Si querés reservar una consulta o tenés dudas sobre qué acompañamiento es el más adecuado
          para vos, completá el formulario y me pondré en contacto.
        </p>
      </section>

      {/* Formulario */}
      <section className='max-w-3xl mx-auto px-6'>
        <form className='bg-white p-8 shadow-md space-y-6'>
          <div>
            <label className='block text-sm text-purple-800 mb-2'>Nombre</label>
            <input
              type='text'
              className='w-full border border-purple-200 px-4 py-3 focus:outline-none focus:border-purple-500'
              placeholder='Tu nombre'
            />
          </div>

          <div>
            <label className='block text-sm text-purple-800 mb-2'>Email</label>
            <input
              type='email'
              className='w-full border border-purple-200 px-4 py-3 focus:outline-none focus:border-purple-500'
              placeholder='tu@email.com'
            />
          </div>

          <div>
            <label className='block text-sm text-purple-800 mb-2'>WhatsApp</label>
            <input
              type='text'
              className='w-full border border-purple-200 px-4 py-3 focus:outline-none focus:border-purple-500'
              placeholder='+54 9 ...'
            />
          </div>

          <div>
            <label className='block text-sm text-purple-800 mb-2'>Consulta de interés</label>
            <select className='w-full border border-purple-200 px-4 py-3 focus:outline-none focus:border-purple-500'>
              <option>Astrología</option>
              <option>Constelaciones Familiares</option>
              <option>Registros Akáshicos</option>
              <option>Reiki</option>
              <option>Lectura de Runas</option>
              <option>Lectura de Tarot</option>
            </select>
          </div>

          <div>
            <label className='block text-sm text-purple-800 mb-2'>Mensaje</label>
            <textarea
              rows='4'
              className='w-full border border-purple-200 px-4 py-3 focus:outline-none focus:border-purple-500'
              placeholder='Contame brevemente en qué puedo ayudarte...'
            />
          </div>

          <button
            type='submit'
            className='w-full bg-purple-700 text-white py-4 hover:bg-purple-800 transition'
          >
            Enviar consulta
          </button>
        </form>
      </section>
    </main>
  );
};

export default Contact;
