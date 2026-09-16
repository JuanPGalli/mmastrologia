import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { InlineWidget, useCalendlyEventListener } from 'react-calendly';
import Swal from 'sweetalert2';
import { FaCircleCheck } from 'react-icons/fa6';
import {
  createPaymentPreference,
  fetchPaymentByReference,
  saveScheduledDate,
} from '../../api/payments';
import { fetchServiceBySlug, fetchServices } from '../../api/services';
import { formatARS } from '../../utils/currency';
import { getStoredSession } from '../../api/auth';
import Seo from '../../Components/Seo/Seo';

const CALENDLY_URL = import.meta.env.VITE_CALENDLY_URL;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Agendar = () => {
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status');
  const reference = searchParams.get('ref');
  const serviceSlug = searchParams.get('service');

  const [payer, setPayer] = useState(null);
  const [loadingPayer, setLoadingPayer] = useState(Boolean(status === 'approved' && reference));

  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [loadingServices, setLoadingServices] = useState(true);

  const [form, setForm] = useState(() => {
    const session = getStoredSession();
    return {
      name: session?.user?.name || '',
      email: session?.user?.email || '',
      phone: '',
    };
  });
  const [submitting, setSubmitting] = useState(false);
  const [scheduled, setScheduled] = useState(false);

  useCalendlyEventListener({
    onEventScheduled: (event) => {
      const eventUri = event.data.payload.event.uri;
      if (reference) saveScheduledDate(reference, eventUri);
      setScheduled(true);
    },
  });

  // Estado inicial: traer los servicios con precio para elegir (o preseleccionar
  // el que vino por query param desde /services o el detalle de un servicio).
  useEffect(() => {
    if (status) return; // en los estados de resultado no hace falta

    if (serviceSlug) {
      fetchServiceBySlug(serviceSlug).then((service) => {
        setSelectedService(service);
        setLoadingServices(false);
      });
    } else {
      fetchServices().then((data) => {
        const withPrice = (data || []).filter((service) => service.price > 0);
        setServices(withPrice);
        setLoadingServices(false);
      });
    }
  }, [status, serviceSlug]);

  useEffect(() => {
    if (status !== 'approved' || !reference) return;

    fetchPaymentByReference(reference).then((data) => {
      setPayer(data);
      setLoadingPayer(false);

      if (data) {
        Swal.fire({
          icon: 'success',
          title: '¡Pago confirmado!',
          text: `Tu consulta de ${data.serviceTitle} quedó reservada.`,
          confirmButtonColor: '#7c3aed',
          timer: 3500,
          timerProgressBar: true,
        });
      }
    });
  }, [status, reference]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handlePay = async (e) => {
    e.preventDefault();

    if (!selectedService) {
      Swal.fire({
        icon: 'warning',
        title: 'Elegí una consulta',
        text: 'Seleccioná qué consulta querés reservar para continuar.',
        confirmButtonColor: '#7c3aed',
      });
      return;
    }

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
      const { initPoint } = await createPaymentPreference({
        ...form,
        serviceId: selectedService._id,
      });
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
      <main className='pt-36 min-h-screen bg-[#f7f3fb]'>
        <Seo title='Pago confirmado' noIndex />
        <section className='max-w-5xl mx-auto px-6 pb-16'>
          {!loadingPayer && payer && (
            <div className='max-w-2xl mx-auto bg-white border border-green-200 rounded-xl shadow-sm p-6 mb-8 flex items-start gap-4'>
              <FaCircleCheck className='text-green-500 text-2xl mt-1 shrink-0' aria-hidden='true' />
              <div>
                <h1 className='text-xl text-purple-950 font-medium mb-1'>¡Pago confirmado!</h1>
                <p className='text-gray-600 text-sm'>
                  Reservaste <strong>{payer.serviceTitle}</strong>. Ahora elegí el día y horario
                  que mejor te quede — vas a recibir la confirmación por email al instante.
                </p>
              </div>
            </div>
          )}

          {loadingPayer ? (
            <p className='text-center text-gray-500'>Cargando...</p>
          ) : (payer?.calendlyUrl || CALENDLY_URL) ? (
            <>
              <div className='max-w-2xl mx-auto bg-white shadow-md rounded-xl overflow-hidden'>
                <InlineWidget
                  url={payer?.calendlyUrl || CALENDLY_URL}
                  prefill={{ name: payer?.name, email: payer?.email }}
                  styles={{ height: '700px' }}
                />
              </div>

              {scheduled && (
                <div className='max-w-2xl mx-auto mt-6 text-center'>
                  <p className='text-green-700 mb-4'>
                    ¡Turno confirmado! Te llegó la invitación por email.
                  </p>
                  <div className='flex items-center justify-center gap-4'>
                    <Link
                      to='/services'
                      className='text-sm text-purple-800 underline underline-offset-4 hover:text-purple-950'
                    >
                      Ver otras consultas
                    </Link>
                    <Link
                      to='/'
                      className='text-sm text-purple-800 underline underline-offset-4 hover:text-purple-950'
                    >
                      Volver al inicio
                    </Link>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className='max-w-2xl mx-auto bg-white shadow-md rounded-xl p-10 text-center'>
              <p className='text-gray-600 mb-6'>
                Tu pago se registró correctamente. Te vamos a escribir por email para coordinar el
                horario — la agenda online todavía no está disponible.
              </p>
              <Link
                to='/'
                className='text-sm text-purple-800 underline underline-offset-4 hover:text-purple-950'
              >
                Volver al inicio
              </Link>
            </div>
          )}
        </section>
      </main>
    );
  }

  // 2) Pago rechazado o pendiente
  if (status === 'failure') {
    return (
      <main className='pt-36 min-h-screen bg-[#f7f3fb]'>
        <Seo title='Pago no procesado' noIndex />
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
      <main className='pt-36 min-h-screen bg-[#f7f3fb]'>
        <Seo title='Pago pendiente' noIndex />
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

  // 3) Estado inicial: elegir consulta (si no vino ya elegida) + formulario de pago
  return (
    <main className='pt-36 min-h-screen bg-[#f7f3fb]'>
      <section className='max-w-2xl mx-auto px-6 pb-16'>
        <h1 className='text-4xl font-light text-purple-900 mb-4 text-center'>
          Reservá tu consulta
        </h1>

        {!selectedService && (
          <>
            <p className='text-center text-gray-600 mb-8'>Elegí qué consulta querés reservar.</p>

            {loadingServices ? (
              <p className='text-center text-gray-500'>Cargando consultas...</p>
            ) : (
              <div className='grid gap-3 mb-10'>
                {services.map((service) => (
                  <button
                    key={service.slug}
                    type='button'
                    onClick={() => setSelectedService(service)}
                    className='flex items-center justify-between bg-white border border-gray-200 hover:border-purple-400 rounded-lg px-5 py-4 text-left transition'
                  >
                    <span className='text-purple-900 font-medium'>{service.title}</span>
                    <span className='text-purple-700'>{formatARS(service.price)}</span>
                  </button>
                ))}

                {services.length === 0 && (
                  <p className='text-center text-sm text-gray-500'>
                    Todavía no hay consultas con precio cargado.
                  </p>
                )}
              </div>
            )}
          </>
        )}

        {selectedService && (
          <>
            <div className='bg-white border border-purple-100 rounded-lg px-5 py-4 mb-6 flex items-center justify-between'>
              <div>
                <p className='text-xs uppercase tracking-widest text-purple-600 mb-1'>
                  Vas a reservar
                </p>
                <p className='text-purple-950 font-medium'>{selectedService.title}</p>
              </div>
              <div className='text-right'>
                <p className='text-purple-900 font-semibold'>
                  {formatARS(selectedService.price)}
                </p>
                {!serviceSlug && (
                  <button
                    type='button'
                    onClick={() => setSelectedService(null)}
                    className='text-xs text-purple-700 underline underline-offset-4 hover:text-purple-950'
                  >
                    Cambiar
                  </button>
                )}
              </div>
            </div>

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
                {submitting
                  ? 'Redirigiendo a Mercado Pago...'
                  : `Pagar — ${formatARS(selectedService.price)}`}
              </button>
            </form>
          </>
        )}
      </section>
    </main>
  );
};

export default Agendar;
