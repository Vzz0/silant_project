import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';

const MaintenanceForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        machine: '',
        maint_type: '',
        maint_date: '',
        operating_hours: '',
        order_number: '',
        order_date: '',
        maint_org: '',       // Кто проводил (текст или ID организации)
        service_company: ''  // Сервисная компания (обязательное поле из БД)
    });

    const [directories, setDirectories] = useState({
        maintTypes: [],
        serviceCompanies: [],
        machines: []
    });

    useEffect(() => {
        const fetchDirs = async () => {
            try {
                const [types, services, machines] = await Promise.all([
                    axios.get('/api/maint_type/'), 
                    axios.get('/api/service_company/'),
                    axios.get('/api/machines/')
                ]);
                setDirectories({
                    maintTypes: types.data.results || types.data,
                    serviceCompanies: services.data.results || services.data,
                    machines: machines.data.results || machines.data
                });
            } catch (err) {
                console.error("Ошибка загрузки справочников", err);
            }
        };
        fetchDirs();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/maintenance/', formData);
            alert("Запись о ТО успешно добавлена!");
            navigate(-1);
        } catch (err) {
            alert("Ошибка при сохранении: " + JSON.stringify(err.response?.data));
        }
    };

    return (
        <div className="main-card container form-page">
            <h2 style={{ color: 'var(--primary-blue)', marginBottom: '20px' }}>Внесение данных о ТО</h2>
            
            <form onSubmit={handleSubmit} className="vertical-form">
                
                <div className="form-group">
                    <label>Машина (Зав. №):</label>
                    <select required value={formData.machine} onChange={e => setFormData({...formData, machine: e.target.value})}>
                        <option value="">Выберите машину</option>
                        {directories.machines.map(m => (
                            <option key={m.id} value={m.id}>{m.machine_sn}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Вид ТО:</label>
                    <select required value={formData.maint_type} onChange={e => setFormData({...formData, maint_type: e.target.value})}>
                        <option value="">Выберите вид</option>
                        {directories.maintTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                </div>

                <div className="form-group">
                    <label>Дата проведения ТО:</label>
                    <input type="date" required value={formData.maint_date} onChange={e => setFormData({...formData, maint_date: e.target.value})} />
                </div>

                <div className="form-group">
                    <label>Наработка, м/час:</label>
                    <input type="number" required value={formData.operating_hours} onChange={e => setFormData({...formData, operating_hours: e.target.value})} />
                </div>

                <div className="form-group">
                    <label>№ заказ-наряда:</label>
                    <input type="text" required value={formData.order_number} onChange={e => setFormData({...formData, order_number: e.target.value})} />
                </div>

                <div className="form-group">
                    <label>Дата заказ-наряда:</label>
                    <input type="date" required value={formData.order_date} onChange={e => setFormData({...formData, order_date: e.target.value})} />
                </div>

                {/* Поле 1: Кто фактически делал ТО */}
                <div className="form-group">
                    <label>Организация, проводившая ТО:</label>
                    <select required value={formData.maint_org} onChange={e => setFormData({...formData, maint_org: e.target.value})}>
                        <option value="">Выберите организацию</option>
                        {directories.serviceCompanies.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>

                {/* Поле 2: Официальная Сервисная компания (то, что требовал бэкенд) */}
                <div className="form-group">
                    <label>Сервисная компания (из договора):</label>
                    <select required value={formData.service_company} onChange={e => setFormData({...formData, service_company: e.target.value})}>
                        <option value="">Выберите сервисную компанию</option>
                        {directories.serviceCompanies.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn-primary" style={{ backgroundColor: 'var(--accent-red)' }}>
                        Сохранить запись
                    </button>
                    <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>
                        Отмена
                    </button>
                </div>
            </form>
        </div>
    );
};

export default MaintenanceForm;