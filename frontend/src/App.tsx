import { useEffect, useCallback } from 'react';
import axios from 'axios';
import { MainShell } from './components/MainShell';
import { useStore } from './store/useStore';
import { MantineProvider, Center, Loader } from '@mantine/core';
import "@mantine/core/styles.css";
import './App.css'

const PREFIX = import.meta.env.PROD
  ? 'https://dev.codementum.org/rwanda'
  : '/';


function App() {
const { setEmbedding, setFeatureMatrix, setFeatureNames, setKeys, setSelectedFeature, 
                                      setTooltipData, setIsLoading, isLoading } = useStore();

const umap = useCallback(() => {
    setIsLoading(true);
    axios.post(`${PREFIX}umap/`, {
      filename: "nc_aspire.xlsx",
      n_neighbors: 15,
      min_dist: 0.1,
      metric: "euclidean"
    }).then(res => {
      setEmbedding(res.data.embedding);
      setFeatureMatrix(res.data.featureMatrix);
      setFeatureNames(res.data.featureNames);
      setKeys(res.data.familyCode);
      setTooltipData(res.data.tooltipData);
      setSelectedFeature('');
    }).finally(() => {
      setIsLoading(false);
    });
  }, [setEmbedding, setFeatureMatrix, setSelectedFeature, setFeatureNames, setKeys]);

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
    const res = await axios.post(`${PREFIX}/recalculate-umap`, {
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
    {isLoading ? (
      <Center style={{ height: '100%' }}>
        <Loader size="lg" />
      </Center>
    ) : (
    <MainShell onFeatureClick={handleFeatureClick}/>)
    }
  </MantineProvider>
  );
}

export default App;