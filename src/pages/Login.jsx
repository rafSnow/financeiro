import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Input from '../components/Input';
import { getAuthErrorMessage, login, resetPassword } from '../services/auth.service';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Limpar erro do campo ao digitar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (error) {
      setErrors({
        general: getAuthErrorMessage(error.code),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async e => {
    e.preventDefault();
    if (!resetEmail) {
      setErrors({ reset: 'Digite seu email' });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(resetEmail)) {
      setErrors({ reset: 'Email inválido' });
      return;
    }

    setResetLoading(true);
    setErrors({});
    try {
      await resetPassword(resetEmail);
      setSuccessMessage('Email de recuperação enviado! Verifique sua caixa de entrada.');
      setShowResetPassword(false);
      setResetEmail('');
    } catch (error) {
      setErrors({
        reset: getAuthErrorMessage(error.code),
      });
    } finally {
      setResetLoading(false);
    }
  };

  // Ícones SVG
  const EmailIcon = () => (
    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
      />
    </svg>
  );

  const LockIcon = () => (
    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    </svg>
  );

  if (showResetPassword) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Recuperar Senha</h2>
            <p className="mt-2 text-sm text-gray-600">
              Digite seu email para receber o link de recuperação
            </p>
          </div>

          <form onSubmit={handleResetPassword} className="mt-8 space-y-6">
            <div className="bg-white shadow-md rounded-lg p-6 flex flex-col space-y-5">
              <Input
                label="Email"
                type="email"
                name="resetEmail"
                placeholder="seu@email.com"
                value={resetEmail}
                onChange={e => setResetEmail(e.target.value)}
                error={errors.reset}
                icon={<EmailIcon />}
                required
                autoFocus
              />

              <Button type="submit" variant="primary" loading={resetLoading}>
                Enviar Link de Recuperação
              </Button>

              <button
                type="button"
                onClick={() => {
                  setShowResetPassword(false);
                  setErrors({});
                  setResetEmail('');
                }}
                className="w-full text-center text-sm text-gray-600 hover:text-gray-900"
              >
                Voltar ao login
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-blue-600">💰 FinanceiroApp</h1>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Bem-vindo de volta!</h2>
          <p className="mt-2 text-sm text-gray-600">Entre com sua conta para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8">
          <div className="bg-white shadow-md rounded-lg p-6 flex flex-col space-y-5">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {errors.general}
              </div>
            )}

            {successMessage && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                {successMessage}
              </div>
            )}

            <Input
              label="Email"
              type="email"
              name="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              icon={<EmailIcon />}
              required
              autoFocus
            />

            <Input
              label="Senha"
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              icon={<LockIcon />}
              required
            />

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowResetPassword(true)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Esqueci minha senha
              </button>
            </div>

            <Button type="submit" variant="primary" loading={loading}>
              Entrar
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Não tem uma conta?{' '}
              <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
                Cadastre-se
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
