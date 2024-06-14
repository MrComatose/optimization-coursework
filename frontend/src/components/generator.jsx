import axios from "axios";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Container, Form, Grid, Header, Input, TextArea } from "semantic-ui-react";
import config from "../config";

const fetchData = async (values, signal) => {
  try {
    const response = await axios.get(`${config.serverUrl}/generate`, {
      params: values,
      signal,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
};

const Generator = ({ onChange }) => {
  const [values, setValues] = useState({
    n: 1000,
    maxDiff: 120,
    averageValue: 66,
    permutationCount: 1200,
  });
  const [result, setResult] = useState([]);
  const [textareaValue, setTextareaValue] = useState("");

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;
    const fetchDataAndUpdateResult = async () => {
      const resultData = await fetchData(values, signal);
      setResult(resultData);
      setTextareaValue(resultData.join(", "));
    };

    fetchDataAndUpdateResult();

    return () => {
      abortController.abort();
    };
  }, [values]);

  useEffect(() => {
    if (!textareaValue) {
      return;
    }

    const numbers = textareaValue.split(",").map((x) => +x);

    setResult(numbers);
  }, [textareaValue]);

  const invalid = useMemo(() => {
    return result.includes(NaN);
  }, [result]);

  useEffect(() => {
    if (invalid || !onChange) {
      return;
    }

    onChange(result);
  }, [result, invalid, onChange]);

  const handleInputChange = useCallback((e, { name, value }) => {
    setValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  }, []);

  const handleTextareaChange = useCallback((e) => {
    setTextareaValue(e.target.value);
  }, []);

  return (
    <Container>
      <Header>Генерація індивідуальних зачдач</Header>
      <Grid columns={1} stackable>
        <Grid.Row>
          <div>
            <Input label="n =" name="n" value={values.n} onChange={handleInputChange} style={{ margin: "10px" }} />
          </div>
          <div>
            <Input label="maxDiff =" name="maxDiff" value={values.maxDiff} onChange={handleInputChange} style={{ margin: "10px" }} />
          </div>
          <div>
            <Input
              label="averageValue ="
              name="averageValue"
              value={values.averageValue}
              onChange={handleInputChange}
              style={{ margin: "10px" }}
            />
          </div>
          <div>
            <Input
              label="permutationCount ="
              name="permutationCount"
              value={values.permutationCount}
              onChange={handleInputChange}
              style={{ margin: "10px" }}
            />
          </div>
        </Grid.Row>
      </Grid>

      <Form error={invalid}>
        <TextArea
          placeholder="Result"
          value={textareaValue}
          onChange={handleTextareaChange}
          style={{ minHeight: 300, marginTop: "20px", width: "100%", fontSize: "1.2em", borderColor: invalid ? "red" : null }}
        />
      </Form>
    </Container>
  );
};

export default Generator;
