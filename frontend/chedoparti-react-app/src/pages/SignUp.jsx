import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
// 🎭 MODO DEMO: Usando authApi mock en lugar del real
import { authApi } from '../services/api';

// Logo se carga desde public directory directamente

export default function SignUp() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    mode: 'onTouched',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Watch password for confirmation validation
  const password = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    try {
      const signUpData = {
        username: data.email, // Using email as username
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        roles: ['ROLE_MEMBER', 'ROLE_USER'], // Agregar rol por defecto
        phone: data.phone || '',
      };

      await authApi.register(signUpData);
      setSuccess(true);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login', {
          replace: true,
          state: { message: t('signup.success_redirect') },
        });
      }, 2000);
    } catch (err) {
      console.error('SignUp error:', err);
      let message = err?.response?.data?.message || err?.message || t('signup.error_generic');

      // Handle specific 403 error for role configuration
      if (err?.response?.status === 403) {
        message =
          'El sistema de registro está temporalmente en configuración. Por favor, contacta al administrador.';
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy via-blue-200 to-gold dark:from-gray-900 dark:via-navy dark:to-gold transition-colors duration-500">
        <div className="w-full max-w-md p-8 rounded-2xl shadow-2xl bg-white/90 dark:bg-gray-900/90 flex flex-col items-center">
          <div className="w-20 h-20 mb-4 rounded-full shadow-lg border-4 border-green-500 bg-white flex items-center justify-center">
            <svg
              className="w-10 h-10 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          </div>
          <h1 className="mb-4 text-3xl font-extrabold text-navy dark:text-gold text-center">
            {t('signup.success_title')}
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-300">
            {t('signup.success_message')}
          </p>
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
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
            {t('signup.redirecting')}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy via-blue-200 to-gold dark:from-gray-900 dark:via-navy dark:to-gold transition-colors duration-500 py-4">
      <div className="w-full max-w-3xl px-6 py-5 rounded-2xl shadow-2xl bg-white/90 dark:bg-gray-900/90 flex flex-col items-center relative mx-4">
        <img
          src="/escudo-01.png"
          alt="Logo"
          className="w-16 h-16 mb-2 rounded-full shadow-lg border-4 border-gold bg-white object-contain"
        />
        <h1 className="mb-1 text-2xl font-extrabold text-navy dark:text-gold tracking-tight text-center drop-shadow">
          {t('signup.title')}
        </h1>
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-300 text-center">
          {t('signup.subtitle')}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="w-full">
          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/30 p-2.5 text-sm text-red-600 mb-3 text-center animate-pulse">
              {error}
            </div>
          )}

          {/* Two-column grid for name fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 mb-2">
            {/* First Name */}
            <div>
              <label className="block text-sm text-navy dark:text-gold font-semibold mb-1">
                {t('signup.first_name')}
              </label>
              <input
                className={`w-full px-3 py-2 rounded-lg border-2 focus:border-gold focus:ring-2 focus:ring-gold bg-white dark:bg-gray-800 dark:text-gold transition-all ${
                  errors.firstName ? 'border-red-500 ring-red-400' : 'border-navy/20'
                }`}
                {...register('firstName', {
                  required: t('signup.first_name_required'),
                  minLength: {
                    value: 2,
                    message: t('signup.first_name_min'),
                  },
                })}
                type="text"
                autoComplete="given-name"
              />
              {errors.firstName && (
                <span className="text-xs text-red-600 mt-0.5 ml-1 block animate-pulse">
                  {errors.firstName.message}
                </span>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm text-navy dark:text-gold font-semibold mb-1">
                {t('signup.last_name')}
              </label>
              <input
                className={`w-full px-3 py-2 rounded-lg border-2 focus:border-gold focus:ring-2 focus:ring-gold bg-white dark:bg-gray-800 dark:text-gold transition-all ${
                  errors.lastName ? 'border-red-500 ring-red-400' : 'border-navy/20'
                }`}
                {...register('lastName', {
                  required: t('signup.last_name_required'),
                  minLength: {
                    value: 2,
                    message: t('signup.last_name_min'),
                  },
                })}
                type="text"
                autoComplete="family-name"
              />
              {errors.lastName && (
                <span className="text-xs text-red-600 mt-0.5 ml-1 block animate-pulse">
                  {errors.lastName.message}
                </span>
              )}
            </div>
          </div>

          {/* Email - Full width */}
          <div className="mb-2">
            <label className="block text-sm text-navy dark:text-gold font-semibold mb-1">
              {t('app.email')}
            </label>
            <input
              className={`w-full px-3 py-2 rounded-lg border-2 focus:border-gold focus:ring-2 focus:ring-gold bg-white dark:bg-gray-800 dark:text-gold transition-all ${
                errors.email ? 'border-red-500 ring-red-400' : 'border-navy/20'
              }`}
              {...register('email', {
                required: t('signup.email_required'),
                pattern: {
                  value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
                  message: t('signup.email_invalid'),
                },
              })}
              type="email"
              autoComplete="email"
            />
            {errors.email && (
              <span className="text-xs text-red-600 mt-0.5 ml-1 block animate-pulse">
                {errors.email.message}
              </span>
            )}
          </div>

          {/* Two-column grid for password fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 mb-3">
            {/* Password */}
            <div>
              <label className="block text-sm text-navy dark:text-gold font-semibold mb-1">
                {t('app.password')}
              </label>
              <div className="relative">
                <input
                  className={`w-full pr-10 px-3 py-2 rounded-lg border-2 focus:border-gold focus:ring-2 focus:ring-gold bg-white dark:bg-gray-800 dark:text-gold transition-all ${
                    errors.password ? 'border-red-500 ring-red-400' : 'border-navy/20'
                  }`}
                  {...register('password', {
                    required: t('signup.password_required'),
                    minLength: {
                      value: 6,
                      message: t('signup.password_min'),
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message: t('signup.password_pattern'),
                    },
                  })}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white p-1"
                  aria-label={showPassword ? t('signup.hide_password') : t('signup.show_password')}
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
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
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
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
                <span className="text-xs text-red-600 mt-0.5 ml-1 block animate-pulse">
                  {errors.password.message}
                </span>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm text-navy dark:text-gold font-semibold mb-1">
                {t('signup.confirm_password')}
              </label>
              <div className="relative">
                <input
                  className={`w-full pr-10 px-3 py-2 rounded-lg border-2 focus:border-gold focus:ring-2 focus:ring-gold bg-white dark:bg-gray-800 dark:text-gold transition-all ${
                    errors.confirmPassword ? 'border-red-500 ring-red-400' : 'border-navy/20'
                  }`}
                  {...register('confirmPassword', {
                    required: t('signup.confirm_password_required'),
                    validate: (value) => value === password || t('signup.passwords_dont_match'),
                  })}
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white p-1"
                  aria-label={
                    showConfirmPassword ? t('signup.hide_password') : t('signup.show_password')
                  }
                >
                  {showConfirmPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
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
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
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
              {errors.confirmPassword && (
                <span className="text-xs text-red-600 mt-0.5 ml-1 block animate-pulse">
                  {errors.confirmPassword.message}
                </span>
              )}
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-start gap-2 mb-3">
            <input
              type="checkbox"
              className="form-checkbox accent-gold mt-0.5 flex-shrink-0"
              {...register('acceptTerms', {
                required: t('signup.terms_required'),
              })}
            />
            <label className="text-xs text-navy dark:text-gold leading-snug">
              {t('signup.accept_terms_1')}{' '}
              <a href="#" className="text-gold hover:underline font-semibold">
                {t('signup.terms_link')}
              </a>{' '}
              {t('signup.accept_terms_2')}{' '}
              <a href="#" className="text-gold hover:underline font-semibold">
                {t('signup.privacy_link')}
              </a>
            </label>
          </div>
          {errors.acceptTerms && (
            <span className="text-xs text-red-600 mb-2 ml-1 block animate-pulse">
              {errors.acceptTerms.message}
            </span>
          )}

          {/* Submit Button */}
          <button
            className="btn btn-primary w-full py-2.5 rounded-lg text-base font-bold tracking-wide shadow-md flex items-center justify-center hover:scale-[1.02] hover:shadow-xl transition-all duration-200"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2 w-full text-center">
                <svg
                  className="animate-spin h-4 w-4 text-gold"
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
                {t('signup.creating_account')}...
              </span>
            ) : (
              <span className="w-full text-center">{t('signup.create_account')}</span>
            )}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {t('signup.already_have_account')}{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-gold hover:underline font-semibold focus:outline-none"
            >
              {t('signup.sign_in_link')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
