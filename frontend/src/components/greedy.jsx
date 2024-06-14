import axios from "axios";
import React, { useEffect, useState } from "react";
import { Container, Header, Message, Statistic } from "semantic-ui-react";
import config from "../config";

const emptyResult = {
  selectedIndexes: [],
  sum: 0,
  elapsedTicks: 0,
  elapsedMilliseconds: 0,
};
const fetchData = async (values, signal) => {
  try {
    const response = await axios.post(
      `${config.serverUrl}/greedy`,
      {
        weights: values,
        chunkGap: 3,
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

const Greedy = ({ weights }) => {
  const [result, setResult] = useState(emptyResult);

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;
    const fetchDataAndUpdateResult = async () => {
      setResult(emptyResult);
      const resultData = await fetchData(weights, signal);
      setResult(resultData);
    };

    fetchDataAndUpdateResult();

    return () => {
      abortController.abort();
    };
  }, [weights]);

  return (
    <Container>
      <Header>Жадібний алгоритм</Header>
      <Message positive>
        <Message.Header>Результат</Message.Header>
        <p>Обрані індекси: {result.selectedIndexes.join(", ")}</p>
        <Statistic label="Час в мілісекундах" value={result.elapsedMilliseconds} />
        <Statistic label="Значення цільової функції" value={result.sum} />
      </Message>
    </Container>
  );
};

export default Greedy;
