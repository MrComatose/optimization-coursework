import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Input, Message, Container, Grid, Header, Statistic } from 'semantic-ui-react';
import axios from 'axios';
import config from '../config'
import { ticksToMilliseconds } from '../helpers'

const emptyResult = {
    selectedIndexes: [],
    sum: 0,
    elapsedTicks: 0,
    elapsedMilliseconds: 0
};
const fetchData = async (values, signal) => {
    try {
        const response = await axios.post(`${config.serverUrl}/greedy`, {
            weights: values,
            chunkGap: 3
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
            signal
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching data:', error);
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
        }
    }, [weights]);

    return (
        <Container>
            <Header>
                Greedy
            </Header>
            <Message positive>
                <Message.Header>Result</Message.Header>
                <p>Selected Indexes: {result.selectedIndexes.join(', ')}</p>


                <Statistic label='Milliseconds' value={result.elapsedMilliseconds} />
                <Statistic label='Sum' value={result.sum} />
            </Message>
        </Container>
    );
};

export default Greedy;
