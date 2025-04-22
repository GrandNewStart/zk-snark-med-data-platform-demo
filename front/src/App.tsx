import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import DataConsumerPanel from './data_consumer_panel';
import DataProviderPanel from './data_provider_panel';
import { Provider, useAppContext } from './context';
import DataResponsePanel from './data_response_panel';
import { DataRequest } from './types/data_request';


const Home: React.FC = () => {
  const navigate = useNavigate();
  const { dataRequests, addDataRequest } = useAppContext();
  useEffect(()=>{

  }, [])
  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h1>ZKP Data Exchange Platform</h1>
      <button
        onClick={() => navigate('/consumer')}
        style={{
          margin: '10px',
          padding: '10px 20px',
          borderRadius: '8px',
          fontSize: '16px',
          backgroundColor: '#1976d2',
          color: 'white',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        Data Consumer
      </button>
      <button
        onClick={() => navigate('/provider')}
        style={{
          margin: '10px',
          padding: '10px 20px',
          borderRadius: '8px',
          fontSize: '16px',
          backgroundColor: '#388e3c',
          color: 'white',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        Data Provider
      </button>
      
      <ul style={{ marginTop: '40px', listStyle: 'none', padding: 0 }}>
      <h2>Data Requests</h2>
        {dataRequests.map((item) => (
          <li key={item.id} style={{ margin: '10px 0', border: '1px solid #ccc', padding: '10px', borderRadius: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ textAlign: 'left' }}>
                <div><strong>ID:</strong> {item.id}</div>
                <div><strong>User ID:</strong> {item.user_id}</div>
                <div><strong>Data Type:</strong> {item.data_type}</div>
                <div><strong>Min:</strong> {item.min}</div>
                <div><strong>Max:</strong> {item.max}</div>
                <div><strong>Exp:</strong> {new Date(item.exp_date).toLocaleString()}</div>
              </div>
              <button
                onClick={() => navigate(`/data-response/${item.id}`)}
                style={{
                  marginLeft: '20px',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  fontSize: '14px',
                  backgroundColor: '#4caf50',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                Data Responses
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Provider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/consumer" element={<DataConsumerPanel />} />
        <Route path="/provider" element={<DataProviderPanel />} />
        <Route path="/data-response/:id" element={<DataResponsePanel />} />
      </Routes>
    </Provider>
  );
};

export default App;
