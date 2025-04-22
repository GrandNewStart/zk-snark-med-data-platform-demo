import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from './context';
import { dataTypes } from './types/data_types';

const DataConsumerPanel: React.FC = () => {
  const navigate = useNavigate();
  const { addDataRequest } = useAppContext();
  const [min, setMin] = useState<number | ''>('');
  const [max, setMax] = useState<number | ''>('');
  const [dataType, setDataType] = useState('blood_pressure');
  const [userId, setUserId] = useState('');

  const requestData = async () => {
    if (min === '' || max === '') {
        alert('enter both values')
        return
    }
    if (min >= max) {
        alert('max must be greater than min')
        return
    }
    try {
      const response = await fetch(
        'http://localhost:3001/data-request', 
        { 
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                user_id: userId,
                data_type: dataType,
                min: min, 
                max: max,
                leq: true,
                geq: true
            })
        }
      )
      const data = await response.json()
      if (response.status !== 201) {
        alert(data['message'])
        return
      }
      const { data_request_id, exp_date } = data
      const newItem = await fetch(`http://localhost:3001/data-request/${data_request_id}`).then(res => res.json());
      addDataRequest(newItem);
      alert(`data request created\nid: ${data_request_id}\nexp_date: ${exp_date}`)
      setMin('')
      setMax('')
      return
    } catch (err) {
      console.error(err)
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <div style={{ position: 'absolute', top: '20px', left: '20px' }}>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '6px 12px',
            borderRadius: '4px',
            fontSize: '14px',
            backgroundColor: '#ccc',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          ← Back
        </button>
      </div>
      <h2>Data Consumer</h2>
      <div style={{ 
        marginTop: '20px',
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        gap: '30px' 
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '200px' }}>
          <label style={{ marginBottom: '4px' }}>user_id:</label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            style={{ width: '100%', padding: '4px 8px' }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '200px' }}>
          <label style={{ marginBottom: '4px' }}>data type:</label>
          <select
            value={dataType}
            onChange={(e) => setDataType(e.target.value)}
            style={{ width: '100%', padding: '4px 8px' }}
          >
            {dataTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '200px' }}>
          <label style={{ marginBottom: '4px' }}>min:</label>
          <input
            type="number"
            value={min}
            onChange={(e) => setMin(Number(e.target.value))}
            style={{ width: '100%', padding: '4px 8px' }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '200px' }}>
          <label style={{ marginBottom: '4px' }}>max:</label>
          <input
            type="number"
            value={max}
            onChange={(e) => setMax(Number(e.target.value))}
            style={{ width: '100%', padding: '4px 8px' }}
          />
        </div>
      </div>
      <button
        onClick={requestData}
        style={{
          marginTop: '20px',
          padding: '8px 16px',
          borderRadius: '6px',
          fontSize: '14px',
          backgroundColor: '#1976d2',
          color: 'white',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        Request
      </button>
    </div>
  );
};

export default DataConsumerPanel;
