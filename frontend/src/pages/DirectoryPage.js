import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

const DirectoryPage = () => {
    const { type, id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const info = location.state?.info;
    console.log("ПОЛУЧЕННЫЙ ОБЪЕКТ:", info);

    const typeNames = {
        tech: 'Модель техники',
        engine: 'Модель двигателя',
        trans: 'Модель трансмиссии',
        drive_axle: 'Модель ведущего моста',
        steer_axle: 'Модель управляемого моста',
        service: 'Сервисная компания',
        maint_type: 'Вид ТО',
        failure_node: 'Узел отказа',
        recovery: 'Способ восстановления'
    };

    return (
        <div className="main-card container detail-page">
            <button onClick={() => navigate(-1)} className="btn-primary">
                ← Назад
            </button>
            
            <div className="info-block">
                <h2 style={{color: 'var(--primary-blue)'}}>{typeNames[type]}</h2>
                <hr />
                
                <div style={{marginTop: '20px'}}>
                    {/* Если данные передались, выводим имя и описание */}
                    <h3>{info?.name || "Запись №" + id}</h3>
                    <div className="sub-desc" style={{
                        marginTop: '20px', 
                        padding: '20px', 
                        background: '#f4f4f4', 
                        borderLeft: '5px solid var(--primary-red)',
                        whiteSpace: 'pre-wrap'
                    }}>
                        {info?.description || "Описание для данной записи не заполнено или не было передано."}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DirectoryPage;