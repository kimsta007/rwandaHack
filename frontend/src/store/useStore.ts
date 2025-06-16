import { create } from 'zustand';

interface RowData {
  familyCode: string;
  surveyNumber: string;
  features: Record<string, number>;
  embedding: [number, number];
  tooltip: string;
}

interface FamilyKey {
  familyCode: string;
  surveyNumber: string;
}

interface State {
  data: RowData[];            
  featureNames: string[];     
  selectedIndices: number[];  
  selectedIndicator: number;
  selectedFeature: string;
  selectedKeys: FamilyKey[];    
  colorMap: Record<number, string>;
  legendItems: { label: string; color: string; value: number }[];
  isLoading: boolean;
  brushBox: [number, number, number, number] | null;   

  setData: (data: RowData[]) => void;
  setFeatureNames: (names: string[]) => void;
  setSelectedIndices: (s: number[]) => void;
  setSelectedKeys: (k: FamilyKey[]) => void;
  setSelectedIndicator: (i: number) => void;
  setSelectedFeature: (f: string) => void;
  setIsLoading: (loading: boolean) => void;
  setBrushBox: (b: [number, number, number, number] | null) => void; 
}

export const useStore = create<State>((set) => ({
  isLoading: true,
  data: [],
  featureNames: [],
  selectedIndices: [],
  selectedKeys: [],
  selectedFeature: 'income',
  selectedIndicator: -1,
  brushBox: null, 

  colorMap: {
    1: '#984ea3',
    2: '#dbdb1d',
    3: '#4daf4a',
  },

  legendItems: [
    { label: 'Not recorded', color: '#bdbdbd', value: 0 },
    { label: 'Good', color: '#4daf4a', value: 3 },
    { label: 'Needs Improvement', color: '#dbdb1d', value: 2 },
    { label: 'Bad', color: '#984ea3', value: 1 },
  ],

  setData: (data) => set({ data }),
  setFeatureNames: (names) => set({ featureNames: names }),
  setSelectedIndices: (s) => set({ selectedIndices: s }),
  setSelectedKeys: (k) => set({ selectedKeys: k }),
  setSelectedIndicator: (i) => set({ selectedIndicator: i }),
  setSelectedFeature: (f) => set({ selectedFeature: f }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setBrushBox: (b) => set({ brushBox: b }),  
}));
