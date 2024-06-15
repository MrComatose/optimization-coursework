import { Guid } from "js-guid";
import React, { useCallback, useMemo, useState } from "react";
import { Button, Container, Header, Segment, Statistic } from "semantic-ui-react";
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
  const [tasks, setTasks] = useState([[]]);
  const [options, setOptions] = useState({
    populationSize: 10,
    evaluationCount: 300,
    mutationProbability: 1,
    mutationCount: 1,
  });
  const [greedyResults, setGreedyResults] = useState([]);
  const [geneticResults, setGeneticResults] = useState([]);

  const updateTasks = useCallback((task) => setTasks((old) => [...old, task]), []);

  const generateTasks = useCallback(
    async (count) => {
      setTasks([]);
      for (let i = 10; i < count + 10; i++) {
        const average = getRandomInt(200, 200 * i * 3);
        const params = {
          n: 10 * i,
          maxDiff: getRandomInt(0, average),
          averageValue: average,
          permutationCount: getRandomInt(0, 30 * i),
        };
        const weights = await api.generate(params);

        const task = {
          id: Guid.newGuid(),
          weights,
          ...params,
        };

        updateTasks(task);
      }
    },
    [updateTasks]
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
        <Header>Параметри генетичного алгоритму</Header>
        <GeneticParams options={options} setOptions={setOptions} />
      </Segment>

      <Segment>
        <Button onClick={() => generateTasks(1000)}>Згенерувати нові 1000 задач</Button>

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
