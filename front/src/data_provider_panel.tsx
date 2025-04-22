import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataRequest } from './types/data_request';

const DataProviderPanel: React.FC = () => {
  const [dataRequestId, setDataRequestId] = useState<string>('');
  const [dataRequest, setDataRequest] = useState<DataRequest | null>(null);
  const [value, setValue] = useState<number | ''>('');
  const [userId, setUserId] = useState('');
  const navigate = useNavigate();

  const searchDataRequest = async () => {
    if (!dataRequestId) return;
    try {
      const response = await fetch(
        `http://localhost:3001/data-request/${dataRequestId}`,
        {
          method: 'GET',
          headers: { 'Content-Type':'application/json'}
        }
      );
      if (response.status === 200) {
        setDataRequest(await response.json());
      } else {
        alert('Data Request not found')
      }
    } catch (error) {
      console.error('Failed to fetch proofs:', error);
    }
  };

  const createProof = async () => {
    if (value === '') {
      alert('Please enter a value.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/data-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data_request_id: dataRequestId,
          user_id: userId,
          data_type: dataRequest!.data_type,
          value
        })
      });
      const data = await response.json()
      if (response.status === 200) {
        setValue('');
        alert('Proof uploaded')
      } else {
        alert(data['error'])
      }
    } catch (error) {
      console.error(error);
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
      <h2>Data Provider</h2>

      <div style={{ margin: '20px' }}>
        <label>data_request_id: </label>
        <input
          type="text"
          style={{padding: '8px 16px'}}
          value={dataRequestId}
          onChange={(e) => setDataRequestId(e.target.value)}
        />
        <button
          onClick={searchDataRequest}
          style={{
            marginLeft: '10px',
            padding: '8px 16px',
            borderRadius: '6px',
            fontSize: '14px',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Search
        </button>
      </div>

      { dataRequest !== null && (
        <>
          <div style={{ textAlign: 'left', margin: '20px auto', width: '60%', border: '1px solid #ddd', padding: '10px', borderRadius: '6px' }}>
            <p><strong>ID:</strong> {dataRequest.id}</p>
            <p><strong>Min:</strong> {dataRequest.min}</p>
            <p><strong>Max:</strong> {dataRequest.max}</p>
            <p><strong>Exp Date:</strong> {new Date(dataRequest.exp_date).toLocaleString()}</p>
          </div>
          
          <div style={{
            marginTop: '20px',
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            gap: '30px' }}>

            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'flex-start', 
              width: '200px', 
              marginBottom: '10px' }}>

              <label style={{ marginBottom: '4px' }}>user_id:</label>

              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                style={{ width: '100%', padding: '4px 8px' }}/>

              <div style={{ 
                marginTop: '10px',
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'flex-start', 
                width: '200px', 
                marginBottom: '10px' }}>

                <label>value: </label>

                <input
                  type="number"
                  value={value}
                  style={{ width: '100%', padding: '4px 8px' }}
                  onChange={(e) => setValue(Number(e.target.value))}/>

              </div>

              <button
                onClick={createProof}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: '#388e3c',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer'}}>
                Submit
                </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DataProviderPanel;