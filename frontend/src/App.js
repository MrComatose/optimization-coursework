import { useState } from "react";
import { Divider, Tab } from "semantic-ui-react";
import "./App.css";
import Generator from "./components/generator";
import { Genetic, GeneticParamsAnalyzer } from "./components/genetic";
import Greedy from "./components/greedy";

const SandBox = () => {
  const [weights, setWeights] = useState([]);
  return (
    <>
      <br />
      <Generator onChange={setWeights} />
      <Divider horizontal />
      <Greedy weights={weights} />
      <Divider horizontal />
      <Genetic weights={weights} />
    </>
  );
};

const GeneticParamsDashboard = () => {
  const [weights, setWeights] = useState([]);
  return (
    <>
      <br />
      <Generator onChange={setWeights} />
      <Divider horizontal />
      <GeneticParamsAnalyzer weights={weights} />
    </>
  );
};

const panes = [
  { menuItem: "Пісочниця", render: () => <SandBox /> },
  { menuItem: "Аналіз параметрів генетичного алгоритму", render: () => <GeneticParamsDashboard /> },
];

function App() {
  return (
    <div className="App inverted">
      <Tab panes={panes} />
    </div>
  );
}

export default App;
