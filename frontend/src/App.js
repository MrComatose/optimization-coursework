import './App.css';
import Generator from './components/generator';
import { Divider, Tab, TabPane } from 'semantic-ui-react';
import Greedy from './components/greedy';
import { useState } from 'react';
import Genetic from './components/genetic';

const SandBox = () => {

  const [weights, setWeights] = useState([]);
  return <>
    <br />
    <Generator onChange={setWeights} />
    <Divider horizontal />
    <Greedy weights={weights} />
    <Divider horizontal />
    <Genetic weights={weights} />
  </>
}

const panes = [
  { menuItem: 'Sandbox', render: () => <SandBox /> },
  { menuItem: 'Tab 2', render: () => <TabPane>Tab 2 Content</TabPane> },
  { menuItem: 'Tab 3', render: () => <TabPane>Tab 3 Content</TabPane> },
]

function App() {
  return (
    <div className="App">
      <Tab panes={panes} />
    </div>
  );
}

export default App;
