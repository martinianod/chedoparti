import { useState } from 'react';
import { sendReservationEmail } from '../services/email';
import { useAppNotifications } from '../hooks/useAppNotifications';

export default function Settings() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const notifications = useAppNotifications();
  const testEmail = async () => {
    setLoading(true);
    try {
      await sendReservationEmail({ to_email: email || 'demo@example.com', message: 'Test email' });
      notifications.showNotification('Email enviado exitosamente', 'success');
    } catch (e) {
      notifications.showNotification('No se pudo enviar. Revisa EmailJS.', 'error');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="pl-64 p-6">
      <div className="mx-auto max-w-xl card">
        <h1 className="mb-4 text-xl font-semibold">Configuración</h1>
        <label className="label">Email para pruebas</label>
        <input
          className="input mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
        />
        <button className="btn btn-primary" onClick={testEmail} disabled={loading}>
          {loading ? 'Enviando...' : 'Test EmailJS'}
        </button>
      </div>
    </div>
  );
}
