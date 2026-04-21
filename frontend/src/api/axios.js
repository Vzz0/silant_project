import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://localhost:8000',
    withCredentials: true,
});

instance.interceptors.request.use(config => {
    const token = document.cookie.split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1];
    if (token) {
        config.headers['X-CSRFToken'] = token;
    }
    return config;
});

export default instance;