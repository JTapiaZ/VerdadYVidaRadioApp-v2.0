import React, { createContext, useState, useContext } from "react";

// Definir el tipo de los valores del contexto
interface BibleContextType {
  book: string;
  chapter: number;
  version: string;
  setBook: (book: string) => void;
  setChapter: (chapter: number) => void;
  setVersion: (version: string) => void;
}

// Crear el contexto
const BibleContext = createContext<BibleContextType | undefined>(undefined);

// Proveedor del contexto
export const BibleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [book, setBook] = useState("Genesis");
  const [chapter, setChapter] = useState(1);
  const [version, setVersion] = useState("rv1960");

  return (
    <BibleContext.Provider value={{ book, chapter, version, setBook, setChapter, setVersion }}>
      {children}
    </BibleContext.Provider>
  );
};

// Hook para acceder al contexto
export const useBible = () => {
  const context = useContext(BibleContext);
  if (!context) {
    throw new Error("useBible debe usarse dentro de un BibleProvider");
  }
  return context;
};
