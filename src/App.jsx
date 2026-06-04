import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import educationImg from './assets/education.png';
import studySvg from './assets/study.svg';
import Dashboard from './components/Dashboard';
import TeacherDashboard from './components/TeacherDashboard';
import { authService } from './services/auth.service';
import { Toaster } from 'react-hot-toast';
import {
  Box, TextField, Button, Typography, InputAdornment, IconButton,
  Alert, Paper, CircularProgress, ThemeProvider, createTheme, CssBaseline
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';

const theme = createTheme({
  palette: {
    primary: { main: '#1e2a4a' },
    secondary: { main: '#7c4dff' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 700,
          fontSize: '1rem',
          padding: '12px 24px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#f8f9fc',
            borderRadius: 12,
          },
        },
      },
    },
  },
});

function Login({
  onLogin,
  onRegister,
  isRegisterMode,
  setIsRegisterMode,
  error,
  setError,
  loading,
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  phone,
  setPhone,
  address,
  setAddress,
}) {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      <Box sx={{
        display: { xs: 'none', lg: 'flex' },
        width: '50%',
        bgcolor: '#1e2a4a',
        alignItems: 'center',
        justifyContent: 'center',
        p: 6,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', zIndex: 0 }}>
          {/* Modern abstract glowing orbs */}
          <Box sx={{ position: 'absolute', top: '-10%', left: '-10%', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,77,255,0.35) 0%, rgba(124,77,255,0) 70%)', filter: 'blur(40px)', animation: 'blob 12s infinite alternate ease-in-out', '@keyframes blob': { '0%': { transform: 'translate(0, 0) scale(1)' }, '100%': { transform: 'translate(50px, 100px) scale(1.3)' } } }} />
          <Box sx={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '450px', height: '450px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(100,181,246,0.3) 0%, rgba(100,181,246,0) 70%)', filter: 'blur(50px)', animation: 'blob-reverse 10s infinite alternate ease-in-out', '@keyframes blob-reverse': { '0%': { transform: 'translate(0, 0) scale(1.2)' }, '100%': { transform: 'translate(-80px, -60px) scale(1)' } } }} />
          
          {/* subtle tech dot grid */}
          <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: 'radial-gradient(rgba(255,255,255,0.1) 1.5px, transparent 1.5px)', backgroundSize: '35px 35px', opacity: 0.8 }} />
        </Box>

        <Box sx={{ width: '100%', maxWidth: 500, zIndex: 10, textAlign: 'center' }}>
          <Box
            component="img"
            src={studySvg}
            alt="Education"
            sx={{
              width: '100%',
              height: 'auto',
              maxHeight: 420,
              objectFit: 'contain',
              filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.3))',
              animation: 'float 6s ease-in-out infinite',
              '@keyframes float': {
                '0%': { transform: 'translateY(0px)' },
                '50%': { transform: 'translateY(-20px)' },
                '100%': { transform: 'translateY(0px)' },
              }
            }}
          />
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 800, mt: 4, letterSpacing: -0.5 }}>
            NAJOT<span style={{ color: '#7c4dff' }}>COIN</span>
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mt: 1 }}>
            O'quv markazi boshqaruv tizimi
          </Typography>
        </Box>
      </Box>

      <Box sx={{
        width: { xs: '100%', lg: '50%' },
        bgcolor: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 3, md: 8 },
        position: 'relative',
      }}>
        <Box sx={{ width: '100%', maxWidth: 420 }}>
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Box sx={{
              width: 72, height: 72, mx: 'auto', mb: 3,
              borderRadius: 3, overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(30,42,74,0.12)',
              border: '2px solid #f0f0f5',
            }}>
              <Box component="img" src={educationImg} alt="Logo" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e2a4a', letterSpacing: -0.5, fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
              LEARNING MANAGEMENT SYSTEM
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
              {isRegisterMode
                ? "Oddiy ro'yxatdan o'tish formasini to'ldiring"
                : "Tizimga kirish uchun ma'lumotlaringizni kiriting"}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <form onSubmit={isRegisterMode ? onRegister : onLogin}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {isRegisterMode && (
                <>
                  <TextField
                    fullWidth
                    label="Ism"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                  <TextField
                    fullWidth
                    label="Familiya"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                  <TextField
                    fullWidth
                    label="Telefon"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+998901234567"
                    required
                  />
                  <TextField
                    fullWidth
                    label="Manzil"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </>
              )}

              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: '#7c4dff', mr: 0.5 }} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Parol"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Parolni kiriting"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: '#7c4dff' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  mt: 1,
                  py: 1.5,
                  borderRadius: 3,
                  bgcolor: '#1e2a4a',
                  fontSize: '1rem',
                  boxShadow: '0 4px 14px rgba(30,42,74,0.3)',
                  '&:hover': { bgcolor: '#2c3e6d', boxShadow: '0 6px 20px rgba(30,42,74,0.4)' },
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : isRegisterMode ? "Ro'yxatdan o'tish" : 'Kirish'}
              </Button>

              <Button
                type="button"
                fullWidth
                variant="text"
                onClick={() => {
                  setError('');
                  setIsRegisterMode(!isRegisterMode);
                }}
              >
                {isRegisterMode ? 'Loginga qaytish' : "Ro'yxatdan o'tish"}
              </Button>
            </Box>
          </form>
        </Box>

        <Typography variant="caption" sx={{ position: 'absolute', bottom: 24, color: 'text.disabled' }}>
          Copyright © {new Date().getFullYear()} CRM System. Barcha huquqlar himoyalangan.
        </Typography>
      </Box>
    </Box>
  );
}

function Restricted({ onLogout, user }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', bgcolor: '#f8f9fc', p: 4 }}>
      <Paper elevation={0} sx={{ p: 6, borderRadius: 4, textAlign: 'center', maxWidth: 400, border: '1px solid #e5e7eb' }}>
        <Box sx={{ width: 80, height: 80, bgcolor: '#fef3c7', color: '#f59e0b', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
        </Box>
        <Typography variant="h5" fontWeight={700} color="primary" gutterBottom>Kirish cheklangan</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Sizning rolingiz (<strong>{user?.role}</strong>) uchun panel hali tayyor emas.
        </Typography>
        <Button fullWidth variant="contained" onClick={onLogout} sx={{ borderRadius: 3 }}>Chiqish</Button>
      </Paper>
    </Box>
  );
}

function App() {
  const [isAuth, setIsAuth] = useState(() => localStorage.getItem('isAuth') === 'true');
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await authService.login(email, password);
      
      // Token va user ma'lumotlarini saqlash
      localStorage.setItem('isAuth', 'true');
      
      // Backend user ma'lumotlarini set qilish
      const userData = response.user || { email: email, role: response.role };
      setUser(userData);
      setIsAuth(true);
      
    } catch (err) {
      const errorMessage = err?.message || err?.error || 'Email yoki parol noto\'g\'ri';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    localStorage.removeItem('isAuth');
    setUser(null);
    setIsAuth(false);
  };

  const handleRegister = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authService.register({
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        address,
        password,
      });
      setIsRegisterMode(false);
      setError("Ro'yxatdan o'tdingiz. Endi login qiling.");
      setPassword('');
    } catch (err) {
      const errorMessage = err?.message || err?.error || "Ro'yxatdan o'tishda xatolik";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Toaster position="top-center" reverseOrder={false} />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={
            isAuth ? <Navigate to="/dashboard" replace /> : 
            <Login 
              onLogin={handleLogin} 
              onRegister={handleRegister}
              isRegisterMode={isRegisterMode}
              setIsRegisterMode={setIsRegisterMode}
              error={error} setError={setError}
              loading={loading}
              email={email} setEmail={setEmail}
              password={password} setPassword={setPassword}
              showPassword={showPassword} setShowPassword={setShowPassword}
              firstName={firstName} setFirstName={setFirstName}
              lastName={lastName} setLastName={setLastName}
              phone={phone} setPhone={setPhone}
              address={address} setAddress={setAddress}
            />
          } />
          
          <Route path="/dashboard/*" element={
            !isAuth ? <Navigate to="/login" replace /> :
            (user?.role === 'SUPERADMIN' || user?.role === 'ADMIN') ? 
            <Dashboard onLogout={handleLogout} userEmail={user?.email} /> :
            (user?.role === 'TEACHER') ?
            <TeacherDashboard onLogout={handleLogout} userEmail={user?.email} user={user} /> :
            <Restricted onLogout={handleLogout} user={user} />
          } />

          <Route path="/" element={<Navigate to={isAuth ? "/dashboard" : "/login"} replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
