import emailjs from '@emailjs/browser'
export function sendReservationEmail(variables) {
  const s = import.meta.env.VITE_EMAILJS_SERVICE_ID
  const t = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
  const p = import.meta.env.VITE_EMAILJS_PUBLIC_KEY
  if (!s || !t || !p) return Promise.reject(new Error('Missing EmailJS envs'))
  return emailjs.send(s, t, variables, { publicKey: p })
}
