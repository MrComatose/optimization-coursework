import { useState } from "react";
import { Divider, Tab, Header } from "semantic-ui-react";
import "./App.css";
import Generator from "./components/generator";
import { Genetic, GeneticParamsAnalyzer } from "./components/genetic";
import Greedy from "./components/greedy";
import { ReactComponent as Logo } from "./logo.svg";
import { Comparison } from "./components/comparison";

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

const ComparisonPage = () => {
  return (
    <>
      <br />
      <Comparison />
    </>
  );
};

const panes = [
  { menuItem: "Пісочниця", render: () => <SandBox /> },
  { menuItem: "Аналіз параметрів генетичного алгоритму", render: () => <GeneticParamsDashboard /> },
  { menuItem: "Порівняння жадібного і генетичного алгоритму", render: () => <ComparisonPage /> },
];

function App() {
  return (
    <div className="App inverted">
      <h2 className="ui header">
        <Logo width="50" height="50" />
        <div className="content">Курсова робота Паровенко Олександр</div>
      </h2>
      <Tab panes={panes} />
    </div>
  );
}

export default App;
