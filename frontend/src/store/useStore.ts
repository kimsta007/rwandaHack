import { create } from 'zustand';

interface RowData {
  familyCode: string;
  surveyNumber: string;
  surveyDate: string;
  features: Record<string, number>;
  embedding: [number, number];
  latitude: number,
  longitude: number,
  race: string;
  houseHold: string;
  housing: string;
  lgbtq: string;
  automobile: string;
  education: string;
  income: string;
  ece: string;
  employment: string;
  assistance: string;
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
  selectedDataset: string;
  brushBox: [number, number, number, number] | null;   
  selectedGroup: string | null;

  setSelectedGroup: (group: string | null) => void;
  setData: (data: RowData[]) => void;
  setFeatureNames: (names: string[]) => void;
  setSelectedIndices: (s: number[]) => void;
  setSelectedKeys: (k: FamilyKey[]) => void;
  setSelectedIndicator: (i: number) => void;
  setSelectedFeature: (f: string) => void;
  setSelectedDataset: (d: string) => void;
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
  selectedGroup: null,
  selectedDataset: 'North Carolina',

  colorMap: {
    1: '#b07aa1',
    2: '#edc948',
    3: '#59a14f',
  },

  legendItems: [
    { label: 'Not recorded', color: '#bab0ac', value: 0 },
    { label: 'Good', color: '#59a14f', value: 3 },
    { label: 'Needs Improvement', color: '#edc948', value: 2 },
    { label: 'Bad', color: '#b07aa1', value: 1 },
  ],

  setData: (data) => set({ data }),
  setFeatureNames: (names) => set({ featureNames: names }),
  setSelectedIndices: (s) => set({ selectedIndices: s }),
  setSelectedKeys: (k) => set({ selectedKeys: k }),
  setSelectedIndicator: (i) => set({ selectedIndicator: i }),
  setSelectedFeature: (f) => set({ selectedFeature: f }),
  setSelectedDataset: (d) => set({ selectedDataset: d }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setBrushBox: (b) => set({ brushBox: b }),  
  setSelectedGroup: (group) => set({ selectedGroup: group }),
}));
