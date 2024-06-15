import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Progress, RangeSlider } from "rsuite";
import { Container, Grid, Header, Input, Label, Message, Segment, Statistic } from "semantic-ui-react";
import api from "../api";
import { LineChart } from "./linechart";
import { useDebouncedEffect } from "./use-debounced-effect";

export const GeneticParams = ({ options, setOptions }) => {
  const handleOptionsInputChange = useCallback(
    (_, { name, value }) => {
      setOptions((prevValues) => ({
        ...prevValues,
        [name]: value,
      }));
    },
    [setOptions]
  );

  return (
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
      <div>
        <Input
          label="mutationCount ="
          name="mutationCount"
          value={options.mutationCount}
          onChange={handleOptionsInputChange}
          style={{ margin: "10px" }}
        />
      </div>
      <br />
    </Grid.Row>
  );
};
export const Genetic = ({ weights }) => {
  const [result, setResult] = useState(api.emptyResult);
  const [options, setOptions] = useState({
    populationSize: 10,
    evaluationCount: 300,
    mutationProbability: 1,
    mutationCount: 1,
  });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;
    const fetchDataAndUpdateResult = async () => {
      setBusy(true);
      setResult(api.emptyResult);
      const resultData = await api.genetic(weights, options, signal);
      setResult(resultData);
      setBusy(false);
    };

    fetchDataAndUpdateResult();

    return () => {
      abortController.abort();
    };
  }, [weights, options]);

  return (
    <Container>
      <Header>Генетичний алгоритм</Header>
      <GeneticParams options={options} setOptions={setOptions} />
      <Grid columns={1} stackable></Grid>
      <Message positive>
        <Message.Header>{(busy && "Завантаження") || "Результат"}</Message.Header>
        <p style={{ maxHeight: 300, overflow: "auto" }}>Обрані індекси: {result.selectedIndexes.join(", ")}</p>
        <Statistic label="Час в мілісекундах" value={result.elapsedMilliseconds} />
        <Statistic label="Значення цільової функції" value={result.sum} />
      </Message>
    </Container>
  );
};

const ParamStepper = ({ name, range, setRange, steps, stepName, setStep, min, max }) => (
  <div style={{ margin: "10px" }}>
    <Label size="large">
      {name} від {range[0]} до {range[1]} з кроком {steps[stepName]}
    </Label>
    <RangeSlider value={range} onChange={setRange} step={steps[stepName]} progress min={min} max={max} style={{ margin: "20px" }} />
    <Input label="Крок =" type="number" name={stepName} value={steps[stepName]} onChange={setStep} />
  </div>
);

const emptyParamsDatagram = {
  sum: 0,
  elapsedTicks: 0,
  elapsedMilliseconds: 0,
  mutationCount: 0,
  mutationProbability: 0,
  evaluationCount: 0,
  populationSize: 0,
};
export const GeneticParamsAnalyzer = ({ weights }) => {
  const [iterations, setIterations] = useState(10);
  const [populationSizeRange, setPopulationSizeRange] = useState([5, 10]);
  const [evaluationCountRange, setEvaluationCountRange] = useState([50, 600]);
  const [mutationProbabilityRange, setMutationProbabilityRange] = useState([0.8, 1]);
  const [mutationCountRange, setmutationCountRange] = useState([1, 10]);
  const [data, setData] = useState([emptyParamsDatagram]);
  const indexedData = useMemo(() => groupData(data), [data]);
  const [steps, setSteps] = useState({
    populationStep: 1,
    evaluationCountStep: 100,
    mutationProbabilityStep: 0.2,
    mutationCountStep: 3,
  });
  const [busy, setBusy] = useState(false);
  const handleIterationsChange = useCallback((e, { value }) => {
    setIterations(value);
  }, []);
  const handleStepChange = useCallback((e, { name, value }) => {
    setSteps((steps) => ({ ...steps, [name]: +value > 0 ? +value : 1 }));
  }, []);

  const updateData = useCallback((datagram) => {
    setData((prev) => [...prev, datagram]);
  }, []);

  useEffect(() => {
    console.log(steps.mutationCountStep);
  }, [steps.mutationCountStep]);

  const combinations = useMemo(() => {
    const result = [];

    for (let populationSize = populationSizeRange[0]; populationSize <= populationSizeRange[1]; populationSize += steps.populationStep) {
      for (
        let evaluationCount = evaluationCountRange[0];
        evaluationCount <= evaluationCountRange[1];
        evaluationCount += steps.evaluationCountStep
      ) {
        for (
          let mutationProbability = mutationProbabilityRange[0];
          mutationProbability <= mutationProbabilityRange[1];
          mutationProbability += steps.mutationProbabilityStep
        ) {
          for (
            let mutationCount = mutationCountRange[0];
            mutationCount <= mutationCountRange[1];
            mutationCount += steps.mutationCountStep
          ) {
            const params = {
              populationSize,
              evaluationCount,
              mutationProbability,
              mutationCount,
            };

            result.push(params);
          }
        }
      }
    }

    return result;
  }, [
    evaluationCountRange,
    mutationCountRange,
    mutationProbabilityRange,
    populationSizeRange,
    steps.evaluationCountStep,
    steps.mutationCountStep,
    steps.mutationProbabilityStep,
    steps.populationStep,
  ]);

  const expectedCount = combinations.length * iterations;

  useDebouncedEffect(
    () => {
      const abortController = new AbortController();
      const signal = abortController.signal;

      const fetchAll = async () => {
        for (const params of combinations) {
          if (signal.aborted) {
            return;
          }
          let tasks = [];
          for (let i = 0; i < iterations; i++) {
            const job = async () => {
              const data = await api.genetic(weights, params, signal);

              if (data.selectedIndexes.length) {
                updateData({
                  ...params,
                  ...data,
                });
              }
            };

            tasks.push(job());
          }
          await Promise.all(tasks);
        }

        setBusy(false);
      };

      fetchAll();

      return () => {
        setBusy(false);
        abortController.abort();
      };
    },
    () => {
      setData([]);
      setBusy(true);
    },
    [combinations, weights, iterations],
    2000
  );

  return (
    <Container>
      <Header>Аналіз параметрів генетичного алгоритму</Header>
      <Segment>
        <Grid columns={1} stackable>
          <Grid.Column>
            <div style={{ margin: "10px" }}>
              <Input label="Кількість ітерацій =" type="number" name="iterations" value={iterations} onChange={handleIterationsChange} />
            </div>

            <ParamStepper
              name="Розмір популяції"
              range={populationSizeRange}
              setRange={setPopulationSizeRange}
              steps={steps}
              stepName="populationStep"
              setStep={handleStepChange}
              min={1}
              max={100}
            />
            <ParamStepper
              name="Кількість еволюцій"
              range={evaluationCountRange}
              setRange={setEvaluationCountRange}
              steps={steps}
              stepName="evaluationCountStep"
              setStep={handleStepChange}
              min={1}
              max={1000}
            />
            <br />
            <ParamStepper
              name="Ймовірність мутації"
              range={mutationProbabilityRange}
              setRange={setMutationProbabilityRange}
              steps={steps}
              stepName="mutationProbabilityStep"
              setStep={handleStepChange}
              min={0}
              max={1}
            />
            <br />
            <ParamStepper
              name="Кількість мутацій"
              range={mutationCountRange}
              setRange={setmutationCountRange}
              steps={steps}
              stepName="mutationCountStep"
              setStep={handleStepChange}
              min={1}
              max={100}
            />
          </Grid.Column>
        </Grid>
      </Segment>
      <Segment>
        <Statistic label="Кількість викликів" value={data.length} />
        <Statistic label="Кількість згрупованих даних за параметрами" value={indexedData.length} />
      </Segment>

      <Segment>
        <Progress.Line
          percent={Math.round((data.length / expectedCount) * 100)}
          status={busy ? "active" : expectedCount === data.length ? "success" : "fail"}
        />
        <LineChart dataPoints={indexedData} />
      </Segment>
    </Container>
  );
};

function groupData(data) {
  const grouped = {};

  data.forEach((item) => {
    const index = {
      mutationCount: item.mutationCount,
      mutationProbability: item.mutationProbability,
      evaluationCount: item.evaluationCount,
      populationSize: item.populationSize,
    };
    const key = Object.values(index)
      .map((x) => `${x}`)
      .join("-");

    if (!grouped[key]) {
      grouped[key] = {
        items: [],
        totalSum: 0,
        totalElapsedMilliseconds: 0,
        minSum: item.sum,
        maxSum: item.sum,
        minElapsedMilliseconds: item.elapsedMilliseconds,
        maxElapsedMilliseconds: item.elapsedMilliseconds,
        ...index,
      };
    }

    grouped[key].items.push(item);
    grouped[key].totalSum += item.sum;
    grouped[key].totalElapsedMilliseconds += item.elapsedMilliseconds;
    grouped[key].minSum = Math.min(grouped[key].minSum, item.sum);
    grouped[key].maxSum = Math.max(grouped[key].maxSum, item.sum);
    grouped[key].minElapsedMilliseconds = Math.min(grouped[key].minElapsedMilliseconds, item.elapsedMilliseconds);
    grouped[key].maxElapsedMilliseconds = Math.max(grouped[key].maxElapsedMilliseconds, item.elapsedMilliseconds);
  });

  const groups = Object.keys(grouped).map((key) => {
    const group = grouped[key];
    const itemCount = group.items.length;

    return {
      groupKey: key,
      ...group,
      averageSum: Math.round(group.totalSum / itemCount),
      averageElapsedMilliseconds: Math.round(group.totalElapsedMilliseconds / itemCount),
    };
  });

  groups.sort((a, b) => a.averageElapsedMilliseconds - b.averageElapsedMilliseconds);

  return groups;
}
