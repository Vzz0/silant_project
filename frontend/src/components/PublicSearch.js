import React, { useState } from 'react';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext'; // Импортируем контекст
import MachineList from './MachineList';


const PublicSearch = () => {
    const { user } = useAuth(); // Достаем текущего пользователя
    const [sn, setSn] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const handleSearch = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await axios.get(`/api/machines/?machine_sn=${sn}`);
            const data = response.data.results ? response.data.results : response.data;

            if (data && data.length > 0) {
                setResult(data[0]);
            } else {
                setResult(null);
                setError(`Данных о машине с заводским номером "${sn}" нет в системе.`);
            }
        } catch (err) {
            setResult(null);
            setError("Ошибка при поиске. Проверьте соединение с сервером.");
        }
    };

    // ЕСЛИ ПОЛЬЗОВАТЕЛЬ АВТОРИЗОВАН
    if (user) {
        return <MachineList />;
    }

    // ЕСЛИ ПОЛЬЗОВАТЕЛЬ — ГОСТЬ
    return (
        <div className="main-card">
            <p className="search-title">
                Проверьте комплектацию и технические характеристики техники Силант
            </p>

            <form onSubmit={handleSearch} className="search-form">
                <label style={{ fontWeight: 'bold' }}>Заводской номер:</label>
                <input 
                    type="text" 
                    className="search-input"
                    value={sn} 
                    onChange={(e) => setSn(e.target.value)}
                    placeholder="0008"
                    required 
                />
                <button type="submit" className="btn-primary">Поиск</button>
            </form>

            {error && <p className="error-message">{error}</p>}

            {result && (
                <div className="result-container">
                    <h3 className="result-header">Результат поиска:</h3>
                    
                    <p className="result-subtitle">
                        Информация о комплектации и технических характеристиках Вашей техники
                    </p>

                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Зав. № машины</th>
                                    <th>Модель техники</th>
                                    <th>Модель двигателя</th>
                                    <th>Зав. № двигателя</th>
                                    <th>Модель трансмиссии</th>
                                    <th>Зав. № трансмиссии</th>
                                    <th>Модель вед. моста</th>
                                    <th>Зав. № вед. моста</th>
                                    <th>Модель упр. моста</th>
                                    <th>Зав. № упр. моста</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>{result.machine_sn}</td>
                                    <td>{result.tech_model_details?.name || result.tech_model}</td>
                                    <td>{result.engine_model_details?.name || result.engine_model}</td>
                                    <td>{result.engine_sn}</td>
                                    <td>{result.trans_model_details?.name || result.trans_model}</td>
                                    <td>{result.trans_sn}</td>
                                    <td>{result.drive_axle_model_details?.name || result.drive_axle_model}</td>
                                    <td>{result.drive_axle_sn}</td>
                                    <td>{result.steer_axle_model_details?.name || result.steer_axle_model}</td>
                                    <td>{result.steer_axle_sn}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PublicSearch;