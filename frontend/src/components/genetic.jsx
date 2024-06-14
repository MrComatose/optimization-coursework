import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Input, Message, Container, Grid, Header, ItemImage } from 'semantic-ui-react';
import axios from 'axios';
import config from '../config'
import {
    PlaceholderParagraph,
    PlaceholderLine,
    PlaceholderHeader,
    Placeholder,
    Loader
} from 'semantic-ui-react'

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
        return {
            selectedIndexes: [],
            sum: 0
        };
    }
};

const Genetic = ({ weights }) => {
    const [result, setResult] = useState({
        selectedIndexes: [],
        sum: 0
    });
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
                <p>Selected Indexes: {busy ? "Loading..." : result.selectedIndexes.join(', ')}</p>
                <p>Sum: {busy ? "loading..." : result.sum}</p>
            </Message>
        </Container>
    );
};

export default Genetic;
