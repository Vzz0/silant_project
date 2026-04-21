import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';


const goToDirectory = (type, info) => {
    if (info?.id) {
        navigate(`/directory/${type}/${info.id}`, { state: { info } });
    }
};


const DetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [machine, setMachine] = useState(null);
    const [detailTab, setDetailTab] = useState('info'); // info, to, reclamations
    
    const goToDirectory = (type, info) => {
        if (info?.id) navigate(`/directory/${type}/${info.id}`, { state: { info } });
    };

    useEffect(() => {
        axios.get(`/api/machines/${id}/`)
            .then(res => setMachine(res.data))
            .catch(err => console.error(err));
    }, [id]);

    if (!machine) return <div className="container">Загрузка данных по машине...</div>;

    return (
        <div className="main-card detail-view">
            <div className="detail-header">
                <button onClick={() => navigate(-1)} className="btn-primary">← Вернуться к списку</button>
                <h2>Машина №{machine.machine_sn}</h2>
            </div>

            <div className="tabs-container">
                <button className={`tab-button ${detailTab === 'info' ? 'active' : ''}`} onClick={() => setDetailTab('info')}>Характеристики</button>
                <button className={`tab-button ${detailTab === 'to' ? 'active' : ''}`} onClick={() => setDetailTab('to')}>История ТО</button>
                <button className={`tab-button ${detailTab === 'reclamations' ? 'active' : ''}`} onClick={() => setDetailTab('reclamations')}>Рекламации</button>
            </div>

            <div className="detail-content">
                {detailTab === 'info' && (
                    <div className="info-block">
                        <h3>Технические характеристики Вашей техники</h3>
                        <table className="vertical-table">
                            <tbody>
                                <tr>
                                    <td><strong>Модель техники:</strong></td>
                                    <td>
                                        {machine.tech_model}
                                        <p className="sub-desc">{machine.tech_model_info?.description}</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td><strong>Модель двигателя:</strong></td>
                                    <td>
                                        {machine.engine_model}
                                        <p className="sub-desc">{machine.engine_model_info?.description}</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td><strong>Зав. № двигателя:</strong></td>
                                    <td>
                                        {machine.engine_sn}
                                        <p className="sub-desc">{machine.engine_sn_info?.description}</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td><strong>Модель трансмиссии:</strong></td>
                                    <td>
                                        {machine.trans_model}
                                        <p className="sub-desc">{machine.trans_model_info?.description}</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td><strong>Зав. № трансмиссии:</strong></td>
                                    <td>
                                        {machine.trans_sn}
                                        <p className="sub-desc">{machine.trans_sn_info?.description}</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td><strong>Модель ведущего моста:</strong></td>
                                    <td>
                                        {machine.drive_axle_model}
                                        <p className="sub-desc">{machine.drive_axle_model_info?.description}</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td><strong>Зав. № ведущего моста:</strong></td>
                                    <td>
                                        {machine.drive_axle_sn}
                                        <p className="sub-desc">{machine.drive_axle_sn_info?.description}</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td><strong>Модель управляемого моста:</strong></td>
                                    <td>
                                        {machine.steer_axle_model}
                                        <p className="sub-desc">{machine.steer_axle_model_info?.description}</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td><strong>Зав. № управляемого моста:</strong></td>
                                    <td>
                                        {machine.steer_axle_sn}
                                        <p className="sub-desc">{machine.steer_axle_sn_info?.description}</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td><strong>Договор поставки №, дата:</strong></td>
                                    <td>
                                        {machine.delivery_contract}
                                        <p className="sub-desc">{machine.delivery_contract_info?.description}</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td><strong>Дата отгрузки с завода:</strong></td>
                                    <td>
                                        {machine.shipment_date}
                                        <p className="sub-desc">{machine.shipment_date_info?.description}</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td><strong>Грузополучатель (конечный потребитель):</strong></td>
                                    <td>
                                        {machine.consignee}
                                        <p className="sub-desc">{machine.consignee_info?.description}</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td><strong>Адрес поставки (эксплуатации):</strong></td>
                                    <td>
                                        {machine.delivery_address}
                                        <p className="sub-desc">{machine.delivery_address_info?.description}</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td><strong>Комплектация (доп. опции):</strong></td>
                                    <td>
                                        {machine.equipment}
                                        <p className="sub-desc">{machine.equipment_info?.description}</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td><strong>Клиент:</strong></td>
                                    <td>
                                        {machine.client}
                                        <p className="sub-desc">{machine.client_info?.description}</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td><strong>Сервисная компания:</strong></td>
                                    <td>
                                        {machine.service_company}
                                        <p className="sub-desc">{machine.service_company_info?.description}</p>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}

                {detailTab === 'to' && (
                    <div className="info-block">
                        <h3>Информация о проведенных ТО</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Машина</th>
                                    <th>Вид ТО</th>
                                    <th>Дата</th>
                                    <th>Наработка</th>
                                    <th>№ заказ-наряда</th>
                                    <th>Дата заказ-наряда</th>
                                    <th>Организация</th>
                                    <th>Сервисная компания</th>
                                </tr>
                            </thead>
                            <tbody>
                                {machine.maintenance_history?.map(to => (
                                    <tr key={to.id}>
                                        <td>{to.machine}</td>
                                        <td className="link-cell" onClick={() => goToDirectory('maint_type', to.maint_type_info)}>{to.maint_type}</td>
                                        <td>{to.maint_date}</td>
                                        <td>{to.operating_hours}</td>
                                        <td>{to.order_number}</td>
                                        <td>{to.order_date}</td>
                                        <td className="link-cell" onClick={() => goToDirectory('service', to.maint_org_info)}>{to.maint_org}</td>
                                        <td className="link-cell" onClick={() => goToDirectory('service', to.service_company_info)}>{to.service_company}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {detailTab === 'reclamations' && (
                    <div className="info-block">
                        <h3>Информация о рекламациях</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Дата отказа</th>
                                    <th>Наработка, м/час</th>
                                    <th>Узел отказа</th>
                                    <th>Описание отказа</th>
                                    <th>Способ восстановления</th>
                                    <th>Запчасти</th>
                                    <th>Сервисная компания</th>
                                    <th>Дата восстановления</th>
                                    <th>Время простоя техники</th>
                                </tr>
                            </thead>
                            <tbody>
                                {machine.reclamation_history?.map(rec => (
                                    <tr key={rec.id}>
                                        <td>{rec.failure_date}</td>
                                        <td>{rec.operating_hours}</td>
                                        <td className="link-cell" onClick={() => goToDirectory('failure_node', rec.failure_node_info)}>{rec.failure_node}</td>
                                        <td>{rec.failure_description}</td>
                                        <td className="link-cell" onClick={() => goToDirectory('recovery', rec.recovery_method_info)}>{rec.recovery_method}</td>
                                        <td>{rec.spare_parts}</td>
                                        <td className="link-cell" onClick={() => goToDirectory('service', rec.service_company_info)}>{rec.service_company}</td>
                                        <td>{rec.recovery_date}</td>
                                        <td>{rec.downtime}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DetailsPage;