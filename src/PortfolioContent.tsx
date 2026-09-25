import { createContext, useContext } from 'react';
import { defaultContent } from './content';

export const PortfolioContent = createContext(defaultContent);
export const usePortfolioContent = () => useContext(PortfolioContent);
