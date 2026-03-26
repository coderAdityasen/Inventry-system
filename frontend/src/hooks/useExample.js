import { useState, useEffect } from 'react';

/**
 * Placeholder custom hook
 * Use this as a template for creating new hooks
 * 
 * @param {string} initialState - Initial state value
 */
export function useExample(initialState = '') {
  const [state, setState] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Add side effects here
  }, []);

  const updateState = (newValue) => {
    setState(newValue);
  };

  const resetState = () => {
    setState(initialState);
  };

  return {
    state,
    isLoading,
    updateState,
    resetState
  };
}

export default useExample;
