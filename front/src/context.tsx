import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DataRequest } from './types/data_request';
import { Proof } from './types/proof';

type ContextType = {
  dataRequests: DataRequest[];
  proofs: Proof[];
  addDataRequest: (item: DataRequest) => void;
  addProof: (item: Proof) => void;
};

const Context = createContext<ContextType | undefined>(undefined);

export const Provider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [dataRequests, setDataRequests] = useState<DataRequest[]>([]);
  const [proofs, setProofs] = useState<Proof[]>([]);

  const addDataRequest = (item: DataRequest) => {
    setDataRequests((prev) => [...prev, item]);
  };

  const addProof = (item: Proof) => {
    setProofs((prev) => [...prev, item]);
  };

  return (
    <Context.Provider value={{ dataRequests, addDataRequest, proofs, addProof }}>
      {children}
    </Context.Provider>
  );
};

export const useAppContext = (): ContextType => {
  const context = useContext(Context);
  if (!context) {
    throw new Error('useDataRequestContext must be used within a DataRequestProvider');
  }
  return context;
};
