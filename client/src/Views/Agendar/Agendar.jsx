import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { InlineWidget } from 'react-calendly';
import Swal from 'sweetalert2';
import { createPaymentPreference, fetchPaymentByReference } from '../../api/payments';

const CALENDLY_URL = import.meta.env.VITE_CALENDLY_URL;
const CONSULTA_PRICE_ARS = '95.000';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Agendar = () => {
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status');
  const reference = searchParams.get('ref');

  const [payer, setPayer] = useState(null);
  const [loadingPayer, setLoadingPayer] = useState(Boolean(status === 'approved' && reference));

  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status !== 'approved' || !reference) return;

    fetchPaymentByReference(reference).then((data) => {
      setPayer(data);
      setLoadingPayer(false);
    });
  }, [status, reference]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handlePay = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email) {
      Swal.fire({
        icon: 'warning',
        title: 'Faltan datos',
        text: 'Completá tu nombre y email para continuar.',
        confirmButtonColor: '#7c3aed',
      });
      return;
    }

    if (!emailRegex.test(form.email)) {
      Swal.fire({
        icon: 'warning',
        title: 'Email inválido',
        text: 'Revisá el email ingresado.',
        confirmButtonColor: '#7c3aed',
      });
      return;
    }

    setSubmitting(true);

    try {
      const { initPoint } = await createPaymentPreference(form);
      window.location.href = initPoint;
    } catch (err) {
      setSubmitting(false);
      Swal.fire({
        icon: 'error',
        title: 'No se pudo iniciar el pago',
        text: err.message,
        confirmButtonColor: '#7c3aed',
      });
    }
  };

  // 1) Pago aprobado: mostramos Calendly ya prellenado con los datos del pago
  if (status === 'approved' && reference) {
    return (
      <main className='pt-28 min-h-screen bg-[#f7f3fb]'>
        <section className='max-w-5xl mx-auto px-6 pb-16'>
          <h1 className='text-4xl font-light text-purple-900 mb-4 text-center'>
            ¡Pago confirmado! Elegí tu horario
          </h1>
          <p className='text-center text-gray-600 mb-10 max-w-2xl mx-auto'>
            Gracias por tu pago. Ahora elegí el día y horario que mejor te quede — vas a recibir
            la confirmación por email al instante.
          </p>

          {loadingPayer ? (
            <p className='text-center text-gray-500'>Cargando...</p>
          ) : CALENDLY_URL ? (
            <div className='bg-white shadow-md rounded-xl overflow-hidden'>
              <InlineWidget
                url={CALENDLY_URL}
                prefill={{ name: payer?.name, email: payer?.email }}
                styles={{ height: '700px' }}
              />
            </div>
          ) : (
            <div className='bg-white shadow-md rounded-xl p-10 text-center'>
              <p className='text-gray-600'>
                Tu pago se registró correctamente. Te vamos a escribir por email para coordinar el
                horario — la agenda online todavía no está disponible.
              </p>
            </div>
          )}
        </section>
      </main>
    );
  }

  // 2) Pago rechazado o pendiente
  if (status === 'failure') {
    return (
      <main className='pt-28 min-h-screen bg-[#f7f3fb]'>
        <section className='max-w-2xl mx-auto px-6 pb-16 text-center'>
          <h1 className='text-3xl font-light text-purple-900 mb-4'>El pago no se pudo procesar</h1>
          <p className='text-gray-600 mb-8'>
            Puede haber sido rechazado por tu medio de pago. Podés intentar de nuevo.
          </p>
          <a
            href='/agendar'
            className='inline-block bg-purple-700 text-white px-8 py-3 rounded-full hover:bg-purple-800 transition'
          >
            Intentar de nuevo
          </a>
        </section>
      </main>
    );
  }

  if (status === 'pending') {
    return (
      <main className='pt-28 min-h-screen bg-[#f7f3fb]'>
        <section className='max-w-2xl mx-auto px-6 pb-16 text-center'>
          <h1 className='text-3xl font-light text-purple-900 mb-4'>Tu pago está pendiente</h1>
          <p className='text-gray-600'>
            Estamos esperando la confirmación de tu medio de pago (por ejemplo, pago en efectivo o
            transferencia). En cuanto se acredite, te escribimos por email para coordinar el
            horario.
          </p>
        </section>
      </main>
    );
  }

  // 3) Estado inicial: formulario de pago
  return (
    <main className='pt-28 min-h-screen bg-[#f7f3fb]'>
      <section className='max-w-2xl mx-auto px-6 pb-16'>
        <h1 className='text-4xl font-light text-purple-900 mb-4 text-center'>
          Reservá tu consulta
        </h1>
        <p className='text-center text-gray-600 mb-10'>
          Consulta astrológica — ${CONSULTA_PRICE_ARS} ARS. Una vez confirmado el pago, elegís el
          día y horario que mejor te quede.
        </p>

        <form onSubmit={handlePay} className='bg-white shadow-md rounded-xl p-8 space-y-6'>
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
            placeholder='WhatsApp (opcional)'
            value={form.phone}
            onChange={handleChange}
            className='w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300'
          />

          <button
            type='submit'
            disabled={submitting}
            className='w-full bg-purple-700 text-white py-4 rounded-full hover:bg-purple-800 transition disabled:opacity-60'
          >
            {submitting ? 'Redirigiendo a Mercado Pago...' : `Pagar consulta — $${CONSULTA_PRICE_ARS}`}
          </button>
        </form>
      </section>
    </main>
  );
};

export default Agendar;
