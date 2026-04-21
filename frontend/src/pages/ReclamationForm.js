import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';

const ReclamationForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        machine: '',
        failure_date: '',
        operating_hours: '',
        failure_node: '',
        failure_description: '',
        recovery_method: '',
        spare_parts: '',
        recovery_date: '',
        service_company: ''
    });

    const [options, setOptions] = useState({
        machines: [],
        nodes: [],
        methods: [],
        services: []
    });

    // Загрузка справочников напрямую из API
    useEffect(() => {
        const fetchOptions = async () => {
            console.log("Запрос данных со справочников...");
            try {
                const [mRes, nRes, rRes, sRes] = await Promise.all([
                    axios.get('/api/machines/'),
                    axios.get('/api/failure_node/'),
                    axios.get('/api/recovery_method/'),
                    axios.get('/api/service_company/')
                ]);

                // Проверяем, что пришло в консоли (для отладки)
                console.log("Узлы:", nRes.data);

                setOptions({
                    // Обработка пагинации (если есть results) или обычного массива
                    machines: mRes.data.results || mRes.data,
                    nodes: nRes.data.results || nRes.data,
                    methods: rRes.data.results || rRes.data,
                    services: sRes.data.results || sRes.data
                });
            } catch (err) {
                console.error("Ошибка при загрузке справочников:", err);
            }
        };
        fetchOptions();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/reclamations/', formData);
            alert("Рекламация успешно создана!");
            navigate(-1);
        } catch (err) {
            console.error("Ошибка при сохранении:", err.response?.data);
            alert("Ошибка при сохранении. Проверьте консоль для деталей.");
        }
    };

    return (
        <div className="main-card container form-page">
            <h2 style={{ color: '#163E6C', marginBottom: '20px' }}>Новая рекламация</h2>
            
            <form onSubmit={handleSubmit} className="vertical-form">
                
                <div className="form-group">
                    <label>Машина (Зав. №):</label>
                    <select required value={formData.machine} onChange={e => setFormData({...formData, machine: e.target.value})}>
                        <option value="">Выберите машину</option>
                        {options.machines.map(m => (
                            <option key={m.id} value={m.id}>{m.machine_sn}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Дата отказа:</label>
                    <input type="date" required value={formData.failure_date} onChange={e => setFormData({...formData, failure_date: e.target.value})} />
                </div>

                <div className="form-group">
                    <label>Наработка, м/час:</label>
                    <input type="number" required value={formData.operating_hours} onChange={e => setFormData({...formData, operating_hours: e.target.value})} />
                </div>

                <div className="form-group">
                    <label>Узел отказа:</label>
                    <select required value={formData.failure_node} onChange={e => setFormData({...formData, failure_node: e.target.value})}>
                        <option value="">Выберите узел</option>
                        {options.nodes.map(n => (
                            <option key={n.id} value={n.id}>{n.name}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Описание отказа:</label>
                    <textarea 
                        required 
                        rows="3" 
                        value={formData.failure_description} 
                        onChange={e => setFormData({...formData, failure_description: e.target.value})} 
                        placeholder="Опишите проблему..."
                    />
                </div>

                <div className="form-group">
                    <label>Способ восстановления:</label>
                    <select required value={formData.recovery_method} onChange={e => setFormData({...formData, recovery_method: e.target.value})}>
                        <option value="">Выберите способ</option>
                        {options.methods.map(m => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Используемые запасные части:</label>
                    <textarea value={formData.spare_parts} onChange={e => setFormData({...formData, spare_parts: e.target.value})} />
                </div>

                <div className="form-group">
                    <label>Дата восстановления:</label>
                    <input type="date" required value={formData.recovery_date} onChange={e => setFormData({...formData, recovery_date: e.target.value})} />
                </div>

                <div className="form-group">
                    <label>Сервисная компания:</label>
                    <select required value={formData.service_company} onChange={e => setFormData({...formData, service_company: e.target.value})}>
                        <option value="">Выберите компанию</option>
                        {options.services.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                </div>

                <div className="form-actions" style={{ marginTop: '20px' }}>
                    <button type="submit" className="btn-primary" style={{ backgroundColor: '#D20A11' }}>Сохранить</button>
                    <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>Отмена</button>
                </div>

            </form>
        </div>
    );
};

export default ReclamationForm;