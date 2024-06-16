import { Guid } from "js-guid";
import React, { useCallback, useMemo, useState } from "react";
import { Button, Container, Header, Segment, Statistic, Input, Dimmer, Loader } from "semantic-ui-react";
import api from "../api";
import { GeneticParams } from "./genetic";
import { SimpleDuoLineChart, SimpleLineChart } from "./linechart";
import { useDebouncedEffect } from "./use-debounced-effect";

function getRandomInt(min, max) {
  min = Math.ceil(min); // Round up to the nearest whole number
  max = Math.floor(max); // Round down to the nearest whole number
  return Math.floor(Math.random() * (max - min + 1)) + min; // The maximum is inclusive and the minimum is inclusive
}

export const Comparison = () => {
  const [taskCount, setTaskCount] = useState(100);
  const [taskStep, setTaskStep] = useState(10);
  const [tasks, setTasks] = useState([]);
  const [options, setOptions] = useState({
    populationSize: 10,
    evaluationCount: 300,
    mutationProbability: 1,
    mutationCount: 1,
  });
  const [greedyResults, setGreedyResults] = useState([]);
  const [geneticResults, setGeneticResults] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);

  const generateTasks = useCallback(async (count, step) => {
    setTasks([]);
    setTasksLoading(true);
    const newTasks = [];
    for (let i = 1; i < count + 1; i++) {
      const average = getRandomInt(200, 200 * i * 3);
      const params = {
        n: step * i,
        maxDiff: getRandomInt(0, average) / 2,
        averageValue: average,
        permutationCount: getRandomInt(0, 2* i * step),
      };
      const weights = await api.generate(params);

      const task = {
        id: Guid.newGuid(),
        weights,
        ...params,
      };

      newTasks.push(task);
    }
    setTasks(newTasks);
    setTasksLoading(false);
  }, []);

  useDebouncedEffect(
    () => {
      const abortController = new AbortController();
      const signal = abortController.signal;

      (async () => {
        for (const task of tasks) {
          if (signal.aborted) {
            return;
          }
          const result = await api.greedy(task.weights, signal);

          setGreedyResults((old) => [...old, { ...result, ...task }]);
        }
      })();

      return () => {
        abortController.abort();
      };
    },
    () => {
      setGreedyResults([]);
      // setLoading
    },
    [tasks],
    1000
  );

  useDebouncedEffect(
    () => {
      const abortController = new AbortController();
      const signal = abortController.signal;

      (async () => {
        for (const task of tasks) {
          if (signal.aborted) {
            return;
          }
          const result = await api.genetic(task.weights, options, signal);

          setGeneticResults((old) => [...old, { ...result, ...task }]);
        }
      })();

      return () => {
        abortController.abort();
      };
    },
    () => {
      setGeneticResults([]);
      // setLoading
    },
    [tasks, options],
    1000
  );

  const resultComparison = useMemo(() => {
    let greedySumWinCount = 0;
    let greedyTimeWinCount = 0;
    let sameResultCount = 0;

    const geneticMap = geneticResults.reduce((acc, result) => {
      acc[result.id] = result;
      return acc;
    }, {});

    greedyResults.forEach((greedyResult) => {
      const geneticResult = geneticMap[greedyResult.id];
      if (geneticResult) {
        if (greedyResult.sum > geneticResult.sum) {
          greedySumWinCount++;
        }
        if (greedyResult.sum === geneticResult.sum) {
          sameResultCount++;
        }
        if (greedyResult.elapsedTicks < geneticResult.elapsedTicks) {
          greedyTimeWinCount++;
        }
      }
    });

    return { greedySumWinCount, greedyTimeWinCount, sameResultCount };
  }, [greedyResults, geneticResults]);

  return (
    <Container>
      <Segment>
        <Header>Генерація задач</Header>
        <div>
          <Input
            label="Кількість задач ="
            name="taskCount"
            value={taskCount}
            onChange={(e, { name, value }) => setTaskCount(+value)}
            style={{ marginBottom: "10px" }}
          />
        </div>
        <div>
          <Input
            label="Крок розмірності задачі ="
            name="taskStep"
            value={taskStep}
            onChange={(e, { name, value }) => setTaskStep(+value)}
            style={{ marginBottom: "10px" }}
          />
        </div>
        <Button onClick={() => generateTasks(taskCount, taskStep)}>Згенерувати задачі</Button>
      </Segment>
      <Segment>
        <Header>Параметри генетичного алгоритму</Header>
        <GeneticParams options={options} setOptions={setOptions} />
      </Segment>
      <Segment>
        {tasksLoading && (
          <Dimmer active inverted>
            <Loader inverted>Loading</Loader>
          </Dimmer>
        )}
        <Header>Порівняння результатів алгоритмів</Header>
        <SimpleDuoLineChart
          greedyData={greedyResults}
          geneticData={geneticResults}
          x={{ key: "n", label: "Розмірність задачі" }}
          y={{ key: "sum", label: "Результат роботи" }}
        />
        <Statistic
          label="Генетичний алгоритм точніший разів"
          value={geneticResults.length - resultComparison.greedySumWinCount - resultComparison.sameResultCount}
        />
        <Statistic label="Жадібний алгоритм алгоритм точніший разів" value={resultComparison.greedySumWinCount} />
        <Statistic label="Однаковий результат" value={resultComparison.sameResultCount} />
        <Statistic label="Генетичний алгорітм швидший разів" value={geneticResults.length - resultComparison.greedyTimeWinCount} />
        <Statistic label="жадібний алгорітм швидший разів" value={resultComparison.greedyTimeWinCount} />
      </Segment>
      <Segment>
        {tasksLoading && (
          <Dimmer active inverted>
            <Loader inverted>Loading</Loader>
          </Dimmer>
        )}
        <Header>Час жадібного алгоритму</Header>
        <SimpleLineChart
          points={greedyResults}
          x={{ key: "n", label: "Розмірність задачі" }}
          y={{ key: "elapsedTicks", label: "Час в тіках процесора" }}
        />
        <Header>Час Генетичного алгоритму</Header>
        <SimpleLineChart
          points={geneticResults}
          x={{ key: "n", label: "Розмірність задачі" }}
          y={{ key: "elapsedTicks", label: "Час в тіках процесора" }}
        />
      </Segment>
    </Container>
  );
};
