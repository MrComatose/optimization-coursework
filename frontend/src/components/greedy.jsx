import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Input, Message, Container, Grid, Header } from 'semantic-ui-react';
import axios from 'axios';
import config from '../config'

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
        return {
            selectedIndexes: [],
            sum: 0
        };
    }
};

const Greedy = ({weights}) => {
    const [result, setResult] = useState({
        selectedIndexes: [],
        sum: 0
    });

    useEffect(() => {
        const abortController = new AbortController();
        const signal = abortController.signal;
        const fetchDataAndUpdateResult = async () => {

            const resultData = await fetchData(weights, signal);
            setResult(resultData);
        };

        fetchDataAndUpdateResult();

        return () => {
            abortController.abort();
        }
    }, [weights]);

    return (
        <Container text>
            <Header>
                Greedy
            </Header>
            <Message positive>
                <Message.Header>Result</Message.Header>
                <p>Selected Indexes: {result.selectedIndexes.join(', ')}</p>
                <p>Sum: {result.sum}</p>
            </Message>
        </Container>
    );
};

export default Greedy;
