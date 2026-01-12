import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import authApi from '../api/authApi';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: 'onTouched',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await authApi.forgotPassword(data.email);
      setSuccess(t('forgot_password.success'));
    } catch (err) {
      const message = err?.response?.data?.message || err?.message;
      setError(message || t('forgot_password.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy via-blue-200 to-gold dark:from-gray-900 dark:via-navy dark:to-gold transition-colors duration-500">
      <div className="w-full max-w-md p-8 rounded-2xl shadow-2xl bg-white/90 dark:bg-gray-900/90 flex flex-col items-center relative">
        <img
          src="/escudo-01.png"
          alt="Logo"
          className="w-20 h-20 mb-4 rounded-full shadow-lg border-4 border-gold bg-white object-contain"
        />
        <h1 className="mb-2 text-3xl font-extrabold text-navy dark:text-gold tracking-tight text-center drop-shadow">
          {t('forgot_password.title')}
        </h1>
        <p className="mb-6 text-base text-gray-500 dark:text-gray-300 text-center">
          {t('forgot_password.instructions')}
        </p>
        
        <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-3">
          {success && (
            <div className="rounded-lg bg-green-50 dark:bg-green-900/30 p-3 text-sm text-green-600 mb-2 text-center animate-pulse">
              {success}
            </div>
          )}
          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/30 p-3 text-sm text-red-600 mb-2 text-center animate-pulse">
              {error}
            </div>
          )}

          <label className="label text-navy dark:text-gold font-semibold">{t('app.email')}</label>
          <input
            className={`input mb-1 px-4 py-3 rounded-lg border-2 focus:border-gold focus:ring-2 focus:ring-gold bg-white dark:bg-gray-800 dark:text-gold transition-all ${errors.email ? 'border-red-500 ring-red-400' : 'border-navy/20'}`}
            {...register('email', {
              required: t('login.email_required'),
              pattern: {
                value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
                message: t('login.email_invalid'),
              },
            })}
            type="email"
            autoComplete="email"
          />
          {errors.email && (
            <span className="text-xs text-red-600 mb-1 ml-1 animate-pulse">
              {errors.email.message}
            </span>
          )}

          <button
            className="btn btn-primary w-full py-3 rounded-lg text-lg font-bold tracking-wide shadow-md flex items-center justify-center hover:scale-[1.03] hover:shadow-xl transition-all duration-200 mt-2"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2 w-full text-center">
                <svg
                  className="animate-spin h-5 w-5 text-gold"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
                {t('forgot_password.submit')}...
              </span>
            ) : (
              <span className="w-full text-center">{t('forgot_password.submit')}</span>
            )}
          </button>
        </form>

        {/* Back to Login Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('forgot_password.remember_password')}{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-gold hover:underline font-semibold focus:outline-none"
            >
              {t('forgot_password.back_to_login')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
