import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from '../api/axios';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const getCsrfToken = () => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; csrftoken=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    };

    const checkAuth = async () => {
        try {
            await axios.get('/api/machines/'); 
            const saved = localStorage.getItem('user_data');
            if (saved) {
                setUser(JSON.parse(saved));
            } else {
                // Если сессия жива, но данных в локалсторадже нет
                setUser({ isAuthenticated: true, username: 'Администратор', groups: ['Менеджер'] }); 
            }
        } catch (err) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (username, password) => {
        const csrfToken = getCsrfToken();
        try {
            const response = await axios.post('/api/login/', { username, password }, {
                headers: { 'X-CSRFToken': csrfToken }
            });

            if (response.data.status === "success") {
                // Создаем полный объект пользователя из того, что прислал бэкенд
                const userData = {
                    isAuthenticated: true,
                    username: response.data.username,
                    groups: response.data.groups || [], // Теперь здесь будет ['Менеджер']
                    is_superuser: response.data.is_superuser
                };

                setUser(userData);
                // Сохраняем в localStorage, чтобы данные не пропали при обновлении страницы
                localStorage.setItem('user_data', JSON.stringify(userData)); 
                return true;
            }
        } catch (err) {
            console.error("Login failed", err);
            return false;
        }
    };

    const logout = async () => {
            const csrfToken = getCsrfToken();
        try {
            await axios.post('/api-auth/logout/', {}, {
                headers: { 'X-CSRFToken': csrfToken }
            });
        } catch (err) {
            console.error("Ошибка при выходе на бэкенде", err);
        } finally {
            setUser(null); 
            localStorage.removeItem('username');
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

// ВОТ ЭТОЙ СТРОКИ У ТЕБЯ НЕ ХВАТАЛО:
export const useAuth = () => useContext(AuthContext);