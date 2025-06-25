import { useEffect, useCallback, useState } from 'react';
import axios from 'axios';
import { MainShell } from './components/MainShell';
import { useStore } from './store/useStore';
import { MantineProvider, Loader } from '@mantine/core';
import "@mantine/core/styles.css";
import './App.css';

function App() {
  const { setData, setFeatureNames, setIsLoading, setSelectedFeature, isLoading,
    setSelectedIndices, setSelectedKeys, setBrushBox, setSelectedGroup, setSelectedIndicator } = useStore();
  // const [ neighbours, setNeighbours ] = useState(15);
  // const [ minDist, setMinDist ] = useState(0.1);
  // const [ metric, setMetric ] = useState("Euclidean");
  const [ selectedSurvey, setSelectedSurvey ] = useState("All");
  const [ neighbours ] = useState(15);
  const [ minDist ] = useState(0.1);
  const [ metric ] = useState("Euclidean");

  const umap = useCallback(() => {
    setIsLoading(true);
    axios.post("http://34.201.136.23/umap", {
      filename: "nc_aspire.xlsx",
      n_neighbors: neighbours,
      min_dist: minDist,
      metric: metric.toLowerCase(),
      survey: selectedSurvey
    }).then(res => {
      console.log("Umap response:", res.data);
      setData(res.data.data);               
      setFeatureNames(res.data.featureNames);   

      setSelectedIndices([]);                    
      setSelectedKeys([]);
      setBrushBox(null);
      setSelectedGroup(null);
      setSelectedIndicator(-1);
      setSelectedFeature('income');                   
    }).finally(() => {
      setIsLoading(false);
    });
  }, [setData, setFeatureNames, setSelectedFeature, selectedSurvey]);

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
    const res = await axios.post("http://34.201.136.23/umap", {
      filename: "nc_aspire.xlsx",
      selectedFeatures: groupFeature,
      n_neighbors: neighbours,
      min_dist: minDist,
      metric: metric.toLowerCase(),
      survey: selectedSurvey
    });

    setData(res.data.data);  
    setIsLoading(false);
  };

  return (
    <MantineProvider theme={{}}>
      {isLoading ? (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Loader size="lg" />
        </div>
      ) : (
        // <MainShell onGroupFeatureClick={handleGroupFeatureClick} 
        //   neighbours={neighbours}
        //   minDist={minDist}
        //   metric={metric}
        //   setNeighbours={setNeighbours} 
        //   setMinDist={setMinDist}/>
         <MainShell onGroupFeatureClick={handleGroupFeatureClick} 
          neighbours={neighbours}
          minDist={minDist}
          metric={metric}
          selectedSurvey={selectedSurvey} 
          setSelectedSurvey={setSelectedSurvey} />
        )}
    </MantineProvider>
  );
}

export default App;
