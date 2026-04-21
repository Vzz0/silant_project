import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoImg from '../logo/Logotype.png'; 

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <header className="main-header">
            <div className="header-top">
                <div className="logo-placeholder">
                    <img 
                        src={logoImg} 
                        alt="Силант Логотип" 
                        style={{ width: '100%', height: 'auto', display: 'block' }} 
                    />
                </div>
                
                <div className="header-contacts">
                    +7-8352-20-12-09, telegram
                </div>
                
                {user ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <span style={{ color: 'white', fontWeight: 'bold' }}>{user.username}</span>
                        <button className="btn-primary" onClick={logout}>Выход</button>
                    </div>
                ) : (
                    <button className="btn-primary" onClick={() => navigate('/login')}>
                        Авторизация
                    </button>
                )}
            </div>

            <div className="header-bottom">
                <h2>Электронная сервисная книжка «Мой Силант»</h2>
            </div>
        </header>
    );
};

export default Header;