import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';

const MachineList = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('general');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const [options, setOptions] = useState({
        techModels: [], engineModels: [], transModels: [],
        driveAxles: [], steerAxles: [], maintTypes: [],
        serviceCompanies: [], failureNodes: [], recoveryMethods: []
    });

    const [filters, setFilters] = useState({});

    useEffect(() => {
        if (!user) return;
        const fetchAllOptions = async () => {
            try {
                const [mRes, tRes, rRes] = await Promise.all([
                    axios.get('/api/machines/'),
                    axios.get('/api/maintenance/'),
                    axios.get('/api/reclamations/')
                ]);
                const getUniq = (arr, key) => [...new Set(arr.map(item => item[key]).filter(Boolean))];
                const mData = mRes.data.results || mRes.data;
                const tData = tRes.data.results || tRes.data;
                const rData = rRes.data.results || rRes.data;

                setOptions({
                    techModels: getUniq(mData, 'tech_model'),
                    engineModels: getUniq(mData, 'engine_model'),
                    transModels: getUniq(mData, 'trans_model'),
                    driveAxles: getUniq(mData, 'drive_axle_model'),
                    steerAxles: getUniq(mData, 'steer_axle_model'),
                    serviceCompanies: getUniq(mData, 'service_company'),
                    maintTypes: getUniq(tData, 'maint_type'),
                    failureNodes: getUniq(rData, 'failure_node'),
                    recoveryMethods: getUniq(rData, 'recovery_method')
                });
            } catch (err) { console.error("Ошибка справочников", err); }
        };
        fetchAllOptions();
    }, [user]);

    useEffect(() => {
        const fetchFilteredData = async () => {
            if (!user && !filters.machine_sn) {
                setData([]);
                setLoading(false);
                return;
            }
            setLoading(true);
            const cleanFilters = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v));
            const params = new URLSearchParams(cleanFilters).toString();
            const endpoint = !user ? `/api/machines/?${params}` : 
                             activeTab === 'general' ? `/api/machines/?${params}` : 
                             activeTab === 'maintenance' ? `/api/maintenance/?${params}` : 
                             `/api/reclamations/?${params}`;
            try {
                const res = await axios.get(endpoint);
                const result = res.data.results || res.data;
                setData(Array.isArray(result) ? result : [result]);
            } catch (err) { console.error(err); setData([]); }
            setLoading(false);
        };
        fetchFilteredData();
    }, [activeTab, filters, user]);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const goToDirectory = (type, info) => {
        if (info?.id) navigate(`/directory/${type}/${info.id}`, { state: { info } });
    };

    return (
        <div className="main-card">
            {user && (
                <div className="tabs-container">
                    <button className={`tab-button ${activeTab === 'general' ? 'active' : ''}`} onClick={() => {setActiveTab('general'); setFilters({});}}>Технические данные</button>
                    <button className={`tab-button ${activeTab === 'maintenance' ? 'active' : ''}`} onClick={() => {setActiveTab('maintenance'); setFilters({});}}>ТО</button>
                    <button className={`tab-button ${activeTab === 'reclamation' ? 'active' : ''}`} onClick={() => {setActiveTab('reclamation'); setFilters({});}}>Рекламации</button>
                </div>
            )}

            <div className="filters-section">
                <input 
                    name={activeTab === 'general' ? "machine_sn" : "machine__machine_sn"} 
                    placeholder="Зав. номер машины" 
                    onChange={handleFilterChange} 
                    className="search-input" 
                    value={filters.machine_sn || filters.machine__machine_sn || ''}
                />
                
                {user && activeTab === 'general' && (
                    <>
                        <select name="tech_model__name" onChange={handleFilterChange} className="search-input" value={filters.tech_model__name || ''}>
                            <option value="">Модель техники</option>
                            {options.techModels.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                        <select name="engine_model__name" onChange={handleFilterChange} className="search-input" value={filters.engine_model__name || ''}>
                            <option value="">Модель двигателя</option>
                            {options.engineModels.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                        <select name="trans_model__name" onChange={handleFilterChange} className="search-input" value={filters.trans_model__name || ''}>
                            <option value="">Модель трансмиссии</option>
                            {options.transModels.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                        <select name="steer_axle_model__name" onChange={handleFilterChange} className="search-input" value={filters.steer_axle_model__name || ''}>
                            <option value="">Модель упр. моста</option>
                            {options.steerAxles.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                        <select name="drive_axle_model__name" onChange={handleFilterChange} className="search-input" value={filters.drive_axle_model__name || ''}>
                            <option value="">Модель вед. моста</option>
                            {options.driveAxles.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </>
                )}

                {user && activeTab === 'maintenance' && (
                    <>
                        <select name="maint_type__name" onChange={handleFilterChange} className="search-input" value={filters.maint_type__name || ''}>
                            <option value="">Вид ТО</option>
                            {options.maintTypes.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                        <select name="service_company__name" onChange={handleFilterChange} className="search-input" value={filters.service_company__name || ''}>
                            <option value="">Сервисная компания</option>
                            {options.serviceCompanies.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </>
                )}

                {user && activeTab === 'reclamation' && (
                    <>
                        <select name="failure_node__name" onChange={handleFilterChange} className="search-input" value={filters.failure_node__name || ''}>
                            <option value="">Узел отказа</option>
                            {options.failureNodes.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                        <select name="recovery_method__name" onChange={handleFilterChange} className="search-input" value={filters.recovery_method__name || ''}>
                            <option value="">Способ восстановления</option>
                            {options.recoveryMethods.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                        <select name="service_company__name" onChange={handleFilterChange} className="search-input" value={filters.service_company__name || ''}>
                            <option value="">Сервисная компания</option>
                            {options.serviceCompanies.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </>
                )}
                <button className="btn-primary" style={{backgroundColor: '#163E6C'}} onClick={() => setFilters({})}>Сбросить</button>
            </div>

            {/* --- ВОТ ЭТОТ БЛОК Я ДОБАВИЛ --- */}
            <div className="actions-section" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                {user && activeTab === 'maintenance' && (
                    <button 
                        className="btn-primary" 
                        onClick={() => navigate('/maintenance/add')} 
                        style={{ backgroundColor: '#D20A11' }}
                    >
                        + Записать ТО
                    </button>
                )}
                {user && activeTab === 'reclamation' && (user.groups?.includes('Сервисная организация') || user.username === 'admin' || user.groups?.includes('Менеджер')) && (
                    <button 
                        className="btn-primary" 
                        onClick={() => navigate('/reclamation/add')} 
                        style={{ backgroundColor: '#D20A11' }}
                    >
                        + Новая рекламация
                    </button>
                )}
            </div>
            {/* ------------------------------- */}

            <div className="table-container">
                {loading ? <p style={{textAlign: 'center', padding: '20px'}}>Загрузка...</p> : (
                    <table>
                        {/* Код таблицы остается без изменений */}
                        <thead>
                            {activeTab === 'general' ? (
                                <tr>
                                    <th>Зав. № машины</th><th>Модель техники</th><th>Модель двигателя</th><th>Зав. № двигателя</th>
                                    <th>Модель трансмиссии</th><th>Зав. № трансмиссии</th><th>Модель вед. моста</th>
                                    <th>Зав. № вед. моста</th><th>Модель упр. моста</th><th>Зав. № упр. моста</th>
                                    {user && (
                                        <><th>Договор</th><th>Дата отгрузки</th><th>Грузополучатель</th><th>Адрес</th><th>Комплектация</th><th>Клиент</th><th>Сервисная компания</th></>
                                    )}
                                </tr>
                            ) : activeTab === 'maintenance' ? (
                                <tr>
                                    <th>Машина</th><th>Вид ТО</th><th>Дата ТО</th><th>Наработка</th><th>№ заказ-наряда</th><th>Дата заказ-наряда</th><th>Организация</th><th>Сервисная компания</th>
                                </tr>
                            ) : (
                                <tr>
                                    <th>Машина</th><th>Дата отказа</th><th>Наработка</th><th>Узел отказа</th><th>Описание отказа</th><th>Способ восстановления</th><th>Запчасти</th><th>Сервисная компания</th><th>Дата восстановления</th><th>Простой</th>
                                </tr>
                            )}
                        </thead>
                        <tbody>
                            {data.length > 0 ? data.map((item) => (
                                <tr key={item.id}>
                                    {activeTab === 'general' ? (
                                        <>
                                            <td className="link-cell" onClick={() => user && navigate(`/machine/${item.id}`)}>{item.machine_sn}</td>
                                            <td className="link-cell" onClick={() => user && goToDirectory('tech', item.tech_model_info)}>
                                                {item.tech_model_info?.name || item.tech_model}
                                            </td>
                                            <td className="link-cell" onClick={() => user && goToDirectory('engine', item.engine_model_info)}>
                                                {item.engine_model_info?.name || item.engine_model}
                                            </td>
                                            <td>{item.engine_sn}</td>
                                            <td className="link-cell" onClick={() => user && goToDirectory('trans', item.trans_model_info)}>
                                                {item.trans_model_info?.name || item.trans_model}
                                            </td>
                                            <td>{item.trans_sn}</td>
                                            <td className="link-cell" onClick={() => user && goToDirectory('drive_axle', item.drive_axle_model_info)}>
                                                {item.drive_axle_model_info?.name || item.drive_axle_model}
                                            </td>
                                            <td>{item.drive_axle_sn}</td>
                                            <td className="link-cell" onClick={() => user && goToDirectory('steer_axle', item.steer_axle_model_info)}>
                                                {item.steer_axle_model_info?.name || item.steer_axle_model}
                                            </td>
                                            <td>{item.steer_axle_sn}</td>
                                            {user && (
                                                <>
                                                    <td>{item.delivery_contract}</td>
                                                    <td>{item.shipment_date}</td>
                                                    <td>{item.consignee}</td>
                                                    <td>{item.delivery_address}</td>
                                                    <td>{item.equipment}</td>
                                                    <td>{item.client_info?.username || item.client}</td>
                                                    <td className="link-cell" onClick={() => goToDirectory('service', item.service_company_info)}>
                                                        {item.service_company_info?.name || item.service_company}
                                                    </td>
                                                </>
                                            )}
                                        </>
                                    ) : activeTab === 'maintenance' ? (
                                        <>
                                            <td className="link-cell" onClick={() => navigate(`/machine/${item.machine}`)}>{item.machine_sn}</td>
                                            <td className="link-cell" onClick={() => goToDirectory('maint_type', item.maint_type_info)}>
                                                {item.maint_type_info?.name || item.maint_type}
                                            </td>
                                            <td>{item.maint_date}</td>
                                            <td>{item.operating_hours}</td>
                                            <td>{item.order_number}</td>
                                            <td>{item.order_date}</td>
                                            <td className="link-cell" onClick={() => goToDirectory('service', item.maint_org_info)}>
                                                {item.maint_org_info?.name || item.maint_org}
                                            </td>
                                            <td className="link-cell" onClick={() => goToDirectory('service', item.service_company_info)}>
                                                {item.service_company_info?.name || item.service_company}
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="link-cell" onClick={() => navigate(`/machine/${item.machine}`)}>{item.machine_sn}</td>
                                            <td>{item.failure_date}</td>
                                            <td>{item.operating_hours}</td>
                                            <td className="link-cell" onClick={() => goToDirectory('failure_node', item.failure_node_info)}>
                                                {item.failure_node_info?.name || item.failure_node}
                                            </td>
                                            <td>{item.failure_description}</td>
                                            <td className="link-cell" onClick={() => goToDirectory('recovery', item.recovery_method_info)}>
                                                {item.recovery_method_info?.name || item.recovery_method}
                                            </td>
                                            <td>{item.spare_parts}</td>
                                            <td className="link-cell" onClick={() => goToDirectory('service', item.service_company_info)}>
                                                {item.service_company_info?.name || item.service_company}
                                            </td>
                                            <td>{item.recovery_date}</td>
                                            <td>{item.downtime} дн.</td>
                                        </>
                                    )}
                                </tr>
                            )) : (
                                <tr><td colSpan="20" style={{textAlign: 'center', padding: '20px'}}>
                                    {!user && !filters.machine_sn ? "Введите заводской номер для поиска" : "Данных о машине с таким заводским номером нет в системе"}
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default MachineList;