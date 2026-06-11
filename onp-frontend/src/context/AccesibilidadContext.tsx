import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { AccesibilidadModo } from '../types';

interface AccesibilidadContextType {
  modo: AccesibilidadModo;
  setModo: (modo: AccesibilidadModo) => void;
}

const AccesibilidadContext = createContext<AccesibilidadContextType>({
  modo: 'estandar',
  setModo: () => {},
});

export const AccesibilidadProvider = ({ children }: { children: ReactNode }) => {
  const [modo, setModoState] = useState<AccesibilidadModo>(() => {
    return (localStorage.getItem('onp_accesibilidad') as AccesibilidadModo) || 'estandar';
  });

  const setModo = (nuevoModo: AccesibilidadModo) => {
    setModoState(nuevoModo);
    localStorage.setItem('onp_accesibilidad', nuevoModo);
  };

  useEffect(() => {
    const root = document.documentElement;
    root.removeAttribute('data-modo');
    root.setAttribute('data-modo', modo);
  }, [modo]);

  return (
    <AccesibilidadContext.Provider value={{ modo, setModo }}>
      {children}
    </AccesibilidadContext.Provider>
  );
};

export const useAccesibilidad = () => useContext(AccesibilidadContext);
