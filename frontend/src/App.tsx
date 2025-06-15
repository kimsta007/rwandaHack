import { useEffect, useCallback } from 'react';
import axios from 'axios';
import { MainShell } from './components/MainShell';
import { useStore } from './store/useStore';
import { MantineProvider, Center, Loader } from '@mantine/core';
import "@mantine/core/styles.css";
import './App.css';

function App() {
  const { setData, setFeatureNames, setIsLoading, setSelectedFeature, isLoading } = useStore();

  const umap = useCallback(() => {
    setIsLoading(true);
    axios.post("http://localhost:8000/umap", {
      filename: "nc_aspire.xlsx",
      n_neighbors: 15,
      min_dist: 0.1,
      metric: "euclidean"
    }).then(res => {
      setData(res.data.data);                  // unified data array
      setFeatureNames(res.data.featureNames);  // feature names
      setSelectedFeature('');                  // reset feature selection
    }).finally(() => {
      setIsLoading(false);
    });
  }, [setData, setFeatureNames, setSelectedFeature]);

  useEffect(() => {
    umap();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'R' && e.shiftKey) {
        umap();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [umap]);

  const handleFeatureClick = async (feature: string) => {
    const res = await axios.post("$http://localhost:8000/umap", {
      filename: "nc_aspire.xlsx",
      selectedFeature: feature,
      n_neighbors: 15,
      min_dist: 0.1,
      metric: "euclidean"
    });

    // Only embedding changes on recalculation
    useStore.setState((state) => ({
      data: state.data.map((item, index) => ({
        ...item,
        embedding: res.data.embedding[index]
      }))
    }));
  };

  return (
    <MantineProvider theme={{}}>
      {isLoading ? (
        <Center style={{ height: '100%' }}>
          <Loader size="lg" />
        </Center>
      ) : (
        <MainShell onFeatureClick={handleFeatureClick} />
      )}
    </MantineProvider>
  );
}

export default App;
