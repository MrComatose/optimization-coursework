import React, { useEffect, useState } from "react";
import { Container, Header, Message, Statistic } from "semantic-ui-react";

import api from "../api";

const Greedy = ({ weights }) => {
  const [result, setResult] = useState(api.emptyResult);

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;
    const fetchDataAndUpdateResult = async () => {
      setResult(api.emptyResult);
      const resultData = await api.greedy(weights, signal);
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
        <p style={{ maxHeight: 300, overflow: "auto" }}>Обрані індекси: {result.selectedIndexes.join(", ")}</p>
        <Statistic label="Час в мілісекундах" value={result.elapsedMilliseconds} />
        <Statistic label="Значення цільової функції" value={result.sum} />
      </Message>
    </Container>
  );
};

export default Greedy;
