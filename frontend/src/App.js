import './App.css';
import Generator from './components/generator';
import { Divider } from 'semantic-ui-react';
import Greedy from './components/greedy';
import { useState } from 'react';

function App() {
  const [weights, setWeights] = useState([]);
  return (
    <div className="App">
      <br/>
      <Generator onChange={setWeights}/>

      <Divider horizontal />
      <Greedy weights={weights}/>

      {/* <Greedy /> */}
    </div>
  );
}

export default App;
