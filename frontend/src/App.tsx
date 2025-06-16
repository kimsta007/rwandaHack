import { useEffect, useCallback, useState } from 'react';
import axios from 'axios';
import { MainShell } from './components/MainShell';
import { useStore } from './store/useStore';
import { MantineProvider, Center, Loader } from '@mantine/core';
import "@mantine/core/styles.css";
import './App.css';

function App() {
  const { setData, setFeatureNames, setIsLoading, setSelectedFeature, isLoading } = useStore();
  const [ neighbours, setNeighbours ] = useState(15);
  const [ minDist, setMinDist ] = useState(0.1);
  const [ metric, setMetric ] = useState("Euclidean");

  const umap = useCallback(() => {
    setIsLoading(true);
    axios.post("http://localhost:8000/umap", {
      filename: "nc_aspire.xlsx",
      n_neighbors: neighbours,
      min_dist: minDist,
      metric: metric.toLowerCase()
    }).then(res => {
      setData(res.data.data);                   
      setFeatureNames(res.data.featureNames);   
      setSelectedFeature('');                   
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

  const handleGroupFeatureClick = async (groupFeature: string[]) => {
    console.log(groupFeature, neighbours, minDist, metric.toLowerCase())
    const res = await axios.post("http://localhost:8000/umap", {
      filename: "nc_aspire.xlsx",
      selectedFeatures: groupFeature,
      n_neighbors: neighbours,
      min_dist: minDist,
      metric: metric.toLowerCase()
    });

    setData(res.data.data);  
  };

  return (
    <MantineProvider theme={{}}>
      {isLoading ? (
        <Center style={{ height: '100%' }}>
          <Loader size="lg" />
        </Center>
      ) : (
        <MainShell onGroupFeatureClick={handleGroupFeatureClick} 
          neighbours={neighbours}
          minDist={minDist}
          metric={metric}
          setNeighbours={setNeighbours} 
          setMinDist={setMinDist}/>
      )}
    </MantineProvider>
  );
}

export default App;
