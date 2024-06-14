import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
import { Container, Grid, Header, Input, Message, Statistic, Label } from "semantic-ui-react";
import config from "../config";
import { Slider, RangeSlider } from "rsuite";

const emptyResult = {
  selectedIndexes: [],
  sum: 0,
  elapsedTicks: 0,
  elapsedMilliseconds: 0,
};
const fetchData = async (values, options, signal) => {
  try {
    const response = await axios.post(
      `${config.serverUrl}/genetic`,
      {
        weights: values,
        chunkGap: 3,
        ...options,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        signal,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return emptyResult;
  }
};

export const Genetic = ({ weights }) => {
  const [result, setResult] = useState(emptyResult);
  const [options, setOptions] = useState({
    populationSize: 10,
    evaluationCount: 3,
    mutationProbability: 1,
  });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;
    const fetchDataAndUpdateResult = async () => {
      setBusy(true);
      setResult(emptyResult);
      const resultData = await fetchData(weights, options, signal);
      setResult(resultData);
      setBusy(false);
    };

    fetchDataAndUpdateResult();

    return () => {
      abortController.abort();
    };
  }, [weights, options]);

  const handleOptionsInputChange = useCallback((e, { name, value }) => {
    setOptions((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  }, []);

  return (
    <Container>
      <Header>Генетичний алгоритм</Header>

      <Grid columns={1} stackable>
        <Grid.Row>
          <div>
            <Input
              label="populationSize ="
              name="populationSize"
              value={options.populationSize}
              onChange={handleOptionsInputChange}
              style={{ margin: "10px" }}
            />
          </div>
          <div>
            <Input
              label="evaluationCount ="
              name="evaluationCount"
              value={options.evaluationCount}
              onChange={handleOptionsInputChange}
              style={{ margin: "10px" }}
            />
          </div>
          <div>
            <Input
              label="mutationProbability ="
              name="mutationProbability"
              value={options.mutationProbability}
              onChange={handleOptionsInputChange}
              style={{ margin: "10px" }}
            />
          </div>
        </Grid.Row>
      </Grid>
      <Message positive>
        <Message.Header>{(busy && "Завантаження") || "Результат"}</Message.Header>
        <p>Обрані індекси: {result.selectedIndexes.join(", ")}</p>
        <Statistic label="Час в мілісекундах" value={result.elapsedMilliseconds} />
        <Statistic label="Значення цільової функції" value={result.sum} />
      </Message>
    </Container>
  );
};

export const GeneticParamsAnalyzer = ({ weights }) => {
  const [iterations, setIterations] = useState(100);
  const [populationSizeRange, setPopulationSizeRange] = useState([10, 50]);
  const [steps, setSteps] = useState({
    populationStep: 3,
  });

  const handleIterationsChange = useCallback((e, { value }) => {
    setIterations(value);
  }, []);
  const handleStepChange = useCallback((e, { name, value }) => {
    setSteps((steps) => ({ ...steps, [name]: value > 0 ? value : 1 }));
  }, []);

  return (
    <Container>
      <Header>Аналіз параметрів генетичного алгоритму</Header>
      <Grid columns={1} stackable>
        <Grid.Column>
          <div style={{ margin: "10px" }}>
            <Input label="Кількість ітерацій =" type="number" name="iterations" value={iterations} onChange={handleIterationsChange} />
          </div>
          <div style={{ margin: "10px" }}>
            <Label size="large">
              Розмір популяції від {populationSizeRange[0]} до {populationSizeRange[1]} з кроком {steps.populationStep}
            </Label>
            <RangeSlider
              value={populationSizeRange}
              onChange={setPopulationSizeRange}
              step={steps.populationStep}
              progress
              min={1}
              max={100}
              style={{ margin: "20px" }}
            />
            <Input label="Крок =" type="number" name="populationStep" value={steps.populationStep} onChange={handleStepChange} />
          </div>
        </Grid.Column>
      </Grid>
    </Container>
  );
};
