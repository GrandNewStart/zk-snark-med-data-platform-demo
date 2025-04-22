import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Proof } from './types/proof'
import { DataRequest } from './types/data_request';

const DataResponsePanel: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [ dataRequest, setDataRequest ] = useState<DataRequest>()
  const [ proofs, setProofs ] = useState<Proof[]>([])
  const [verified, setVerified] = useState<Record<string, boolean | null>>({});

  const verifyProof = async (proofId: string)=>{
    try {
      const response = await fetch(`http://localhost:3001/verify/${proofId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await response.json();
      setVerified(prev => ({ ...prev, [proofId]: true }));
      alert(result.message || 'Verification complete.');  
    } catch (err) {
      setVerified(prev => ({ ...prev, [proofId]: false }));
      alert('Verification failed.');
      console.error(err);
    }
  }

  const downloadProof = async (proof: Proof) => {
    const blob = new Blob([JSON.stringify(proof, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `proof_${proof.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  useEffect(() => {
    const fetchDataRequest = async () => {
      try {
        const response = await fetch(`http://localhost:3001/data-request/${id}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await response.json();
        setDataRequest({
          id: data['id'],
          user_id: data['user_id'],
          data_type: data['data_type'],
          min: data['min'],
          max: data['max'],
          leq: data['leq'],
          geq: data['boolean'],
          exp_date: data['exp_date']
        })
      } catch (err) {
        console.error('Failed to fetch proofs:', err);
      }
    }
    const fetchProofs = async () => {
      try {
        const response = await fetch(`http://localhost:3001/data-response/${id}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await response.json();
        setProofs(data.proofs);
      } catch (err) {
        console.error('Failed to fetch proofs:', err);
      }
    };
    fetchDataRequest();
    fetchProofs();
  }, [id]);

  return (
    <div style={{ padding: '20px' }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: '20px' }}>
        &larr; Back
      </button>

      {dataRequest && (
        <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }}>
          <h3>Data Request Info</h3>
          <div><strong>ID:</strong> {dataRequest.id}</div>
          <div><strong>User ID:</strong> {dataRequest.user_id}</div>
          <div><strong>Min:</strong> {dataRequest.min}</div>
          <div><strong>Max:</strong> {dataRequest.max}</div>
          <div><strong>Exp:</strong> {new Date(dataRequest.exp_date).toLocaleString()}</div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>Proof List</h3>
      </div>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {proofs.map(proof => (
          <li key={proof.id} style={{ border: '1px solid #ddd', marginBottom: '10px', padding: '10px', borderRadius: '4px' }}>
            <div><strong>ID:</strong> {proof.id}</div>
            <div><strong>User ID:</strong> {proof.user_id}</div>
            <div><strong>Timestamp:</strong> {new Date(proof.created_at).toLocaleString()}</div>
            <div style={{ float: 'right', fontSize: '24px' }}>
              {verified[proof.id] === true && '✅'}
              {verified[proof.id] === false && '❌'}
            </div>
            <div style={{ marginTop: '10px' }}>
              <button
                onClick={() => { verifyProof(proof.id); }}
                style={{ marginRight: '10px' }}>
                Verify
              </button>
              <button
                onClick={()=>{ downloadProof(proof) }}>
                Download
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DataResponsePanel;