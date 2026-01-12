import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import useAuth from '../hooks/useAuth.js';

// Logo se carga desde public directory directamente

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
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
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (location.state?.message) {
      setSuccess(location.state.message);
      // Clear the navigation state to prevent showing the message again
      window.history.replaceState({}, document.title);
      // Clear the success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
    }
  }, [location.state]);

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    try {
      await login(data.email, data.password);
      navigate('/', { replace: true });
    } catch (err) {
      const message = err?.response?.data?.message || err?.message;
      setError(message || t('app.login') + ' error');
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
          {t('app.login')}
        </h1>
        <p className="mb-6 text-base text-gray-500 dark:text-gray-300 text-center">
          {t('login.welcome')}
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
            autoComplete="username"
          />
          {errors.email && (
            <span className="text-xs text-red-600 mb-1 ml-1 animate-pulse">
              {errors.email.message}
            </span>
          )}

          <label className="label text-navy dark:text-gold font-semibold">
            {t('app.password')}
          </label>
          <div className="relative">
            <input
              className={`input mb-2 pr-12 px-4 py-3 rounded-lg border-2 focus:border-gold focus:ring-2 focus:ring-gold bg-white dark:bg-gray-800 dark:text-gold transition-all ${errors.password ? 'border-red-500 ring-red-400' : 'border-navy/20'}`}
              {...register('password', {
                required: t('login.password_required'),
                minLength: {
                  value: 4,
                  message: t('login.password_min'),
                },
              })}
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
            />

            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white p-1"
              aria-label={showPassword ? t('login.hide_password') : t('login.show_password')}
            >
              {showPassword ? (
                // Eye off icon
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9.27-3.11-11-7 1.086-2.254 2.846-4.14 4.97-5.287M6.6 6.6L17.4 17.4"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 3l18 18"
                  />
                </svg>
              ) : (
                // Eye icon
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          </div>
          {errors.password && (
            <span className="text-xs text-red-600 mb-1 ml-1 animate-pulse">
              {errors.password.message}
            </span>
          )}

          <div className="flex items-center justify-between mb-2">
            <label className="flex items-center gap-2 text-sm text-navy dark:text-gold">
              <input
                type="checkbox"
                className="form-checkbox accent-gold"
                {...register('rememberMe')}
              />
              {t('login.remember_me')}
            </label>
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="text-sm text-gold hover:underline font-semibold focus:outline-none"
            >
              {t('login.forgot_password')}
            </button>
          </div>

          <button
            className="btn btn-primary w-full py-3 rounded-lg text-lg font-bold tracking-wide shadow-md flex items-center justify-center hover:scale-[1.03] hover:shadow-xl transition-all duration-200"
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
                {t('login.sign_in')}...
              </span>
            ) : (
              <span className="w-full text-center">{t('login.sign_in')}</span>
            )}
          </button>
        </form>

        {/* Sign Up Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('login.dont_have_account')}{' '}
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="text-gold hover:underline font-semibold focus:outline-none"
            >
              {t('login.create_account_link')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
