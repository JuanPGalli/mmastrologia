import { Resend } from "resend";

let client: Resend | null = null;

const getClient = () => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY no está configurada.");
  }
  if (!client) {
    client = new Resend(process.env.RESEND_API_KEY);
  }
  return client;
};

export type ContactMessage = {
  name: string;
  email: string;
  phone?: string;
  message: string;
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

export const sendContactEmail = async (data: ContactMessage) => {
  const to = process.env.CONTACT_EMAIL_TO;
  if (!to) {
    throw new Error("CONTACT_EMAIL_TO no está configurada.");
  }

  const from = process.env.RESEND_FROM_EMAIL || "MMAstrologia <onboarding@resend.dev>";

  const resend = getClient();

  await resend.emails.send({
    from,
    to,
    replyTo: data.email,
    subject: `Nueva consulta de ${data.name} — MMAstrologia`,
    html: `
      <div style="font-family: sans-serif; line-height: 1.6;">
        <h2>Nueva consulta desde la web</h2>
        <p><strong>Nombre:</strong> ${escapeHtml(data.name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
        ${data.phone ? `<p><strong>WhatsApp:</strong> ${escapeHtml(data.phone)}</p>` : ""}
        <p><strong>Mensaje:</strong></p>
        <p>${escapeHtml(data.message).replace(/\n/g, "<br />")}</p>
      </div>
    `,
  });
};

export const sendPasswordResetEmail = async (to: string, resetUrl: string) => {
  const from = process.env.RESEND_FROM_EMAIL || "MMAstrologia <onboarding@resend.dev>";
  const resend = getClient();

  await resend.emails.send({
    from,
    to,
    subject: "Recuperá tu contraseña — MMAstrologia",
    html: `
      <div style="font-family: sans-serif; line-height: 1.6;">
        <h2>Recuperar contraseña</h2>
        <p>Recibimos una solicitud para restablecer tu contraseña. Si fuiste vos, hacé click en el siguiente link (válido por 1 hora):</p>
        <p><a href="${resetUrl}">Restablecer mi contraseña</a></p>
        <p>Si no fuiste vos, podés ignorar este email.</p>
      </div>
    `,
  });
};