import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        const success = await login(username, password);
        if (success) {
            navigate('/'); // Перенаправляем на главную после входа
        } else {
            setError('Неверное имя пользователя или пароль');
        }
    };

    return (
        <div className="login-container main-card">
            <h2 className="result-header">Авторизация</h2>
            <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group">
                    <label>Логин:</label>
                    <input 
                        type="text" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        required 
                    />
                </div>
                <div className="form-group">
                    <label>Пароль:</label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                    />
                </div>
                
                {error && <p className="login-error">{error}</p>}
                
                <button type="submit" className="btn-primary">
                    Войти
                </button>
            </form>
        </div>
    );
};

export default LoginPage;