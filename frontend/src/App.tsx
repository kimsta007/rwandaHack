import { useEffect, useCallback } from 'react';
import axios from 'axios';
import { AppShell } from './components/AppShell';
import { useStore } from './store/useStore';
import { MantineProvider } from '@mantine/core';
import './App.css'

function App() {
const { setEmbedding, setFeatureMatrix, setFeatureNames, setKeys, setSelectedFeature } = useStore();

const umap = useCallback(() => {
    axios.post("http://localhost:8000/umap", {
      filename: "nc_aspire.xlsx",
      n_neighbors: 15,
      min_dist: 0.1,
      metric: "euclidean"
    }).then(res => {
      setEmbedding(res.data.embedding);
      setFeatureMatrix(res.data.featureMatrix);
      setFeatureNames(res.data.featureNames);
      setKeys(res.data.familyCode);
      setSelectedFeature('');
    });
  }, [setEmbedding, setFeatureMatrix, setFeatureNames, setKeys]);

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
    const res = await axios.post("http://localhost:8000/recalculate-umap", {
      filename: "nc_aspire.xlsx",
      selectedFeature: feature,
      n_neighbors: 15,
      min_dist: 0.1,
      metric: "euclidean"
    });

    setEmbedding(res.data.embedding);
  };

return (
  <MantineProvider theme={{}}>
    <AppShell onFeatureClick={handleFeatureClick}/>
  </MantineProvider>
  );
}

export default App;