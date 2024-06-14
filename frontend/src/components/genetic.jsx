import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Input, Message, Container, Grid, Header, Statistic } from 'semantic-ui-react';
import axios from 'axios';
import config from '../config'
import {
    PlaceholderParagraph,
    PlaceholderLine,
    PlaceholderHeader,
    Placeholder,
    Loader
} from 'semantic-ui-react'
import { ticksToMilliseconds } from '../helpers'

const PlaceholderLoading = () => (
    <Placeholder>
        <PlaceholderHeader image>
            <PlaceholderLine />
            <PlaceholderLine />
        </PlaceholderHeader>
        <PlaceholderParagraph>
            <PlaceholderLine />
            <PlaceholderLine />
            <PlaceholderLine />
            <PlaceholderLine />
        </PlaceholderParagraph>
    </Placeholder>
)

const emptyResult = {
    selectedIndexes: [],
    sum: 0,
    elapsedTicks: 0,
    elapsedMilliseconds: 0
};
const fetchData = async (values, options, signal) => {
    try {
        const response = await axios.post(`${config.serverUrl}/genetic`, {
            weights: values,
            chunkGap: 3,
            ...options
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



const Genetic = ({ weights }) => {
    const [result, setResult] = useState(emptyResult);
    const [options, setOptions] = useState({
        populationSize: 10,
        evaluationCount: 3,
        mutationProbability: 1
    });
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        const abortController = new AbortController();
        const signal = abortController.signal;
        const fetchDataAndUpdateResult = async () => {
            setBusy(true)
            setResult(emptyResult);
            const resultData = await fetchData(weights, options, signal);
            setResult(resultData);
            setBusy(false)
        };

        fetchDataAndUpdateResult();

        return () => {
            abortController.abort();
        }
    }, [weights, options]);


    const handleOptionsInputChange = useCallback((e, { name, value }) => {
        setOptions(prevValues => ({
            ...prevValues,
            [name]: value
        }));
    }, []);

    return (
        <Container>
            <Header>
                Genetic
            </Header>

            <Grid columns={1} stackable>
                <Grid.Row>
                    <div>
                        <Input
                            label="populationSize ="
                            name="populationSize"
                            value={options.populationSize}
                            onChange={handleOptionsInputChange}
                            style={{ margin: '10px' }}
                        /></div>
                    <div>
                        <Input
                            label="evaluationCount ="
                            name="evaluationCount"
                            value={options.evaluationCount}
                            onChange={handleOptionsInputChange}
                            style={{ margin: '10px' }}
                        /></div>
                    <div>
                        <Input
                            label="mutationProbability ="
                            name="mutationProbability"
                            value={options.mutationProbability}
                            onChange={handleOptionsInputChange}
                            style={{ margin: '10px' }}
                        /></div>
                </Grid.Row>
            </Grid>
            <Message positive>
                <Message.Header>{busy && "Loading "}Result</Message.Header>
                <p>Selected Indexes: {result.selectedIndexes.join(', ')}</p>
                <Statistic label='Milliseconds' value={result.elapsedMilliseconds} />
                <Statistic label='Sum' value={result.sum} />
            </Message>
        </Container>
    );
};

export default Genetic;
