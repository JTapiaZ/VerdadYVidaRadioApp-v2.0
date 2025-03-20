import React, { createContext, useState, useContext, Dispatch, SetStateAction } from "react";

// Definir el tipo de los valores del contexto
interface BibleContextType {
  book: string;
  chapter: number;
  verse: number;
  version: string;
  selectedVerses: number[]; // Cambiar a array
  setBook: (book: string) => void;
  setChapter: (chapter: number) => void;
  setVerse: (chapter: number) => void;
  setVersion: (version: string) => void;
  setSelectedVerses: Dispatch<SetStateAction<number[]>>;
}

// Crear el contexto
const BibleContext = createContext<BibleContextType | undefined>(undefined);

// Proveedor del contexto
export const BibleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [book, setBook] = useState("Genesis");
  const [chapter, setChapter] = useState(1);
  const [verse, setVerse] = useState(1);
  const [version, setVersion] = useState("rv1960");
  const [selectedVerses, setSelectedVerses] = useState<number[]>([]); // Tipo explícito

  return (
    <BibleContext.Provider value={{ book, chapter, verse, version, selectedVerses, setBook, setChapter, setVerse, setVersion, setSelectedVerses }}>
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
