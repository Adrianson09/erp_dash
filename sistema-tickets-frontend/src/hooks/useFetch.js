const useFetch = async (url) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Error al cargar datos');
      return await response.json();
    } catch (error) {
      console.error('Error en useFetch:', error);
      return [];
    }
  };
  
  export default useFetch;
  