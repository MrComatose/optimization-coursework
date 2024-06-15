using System.Collections.Concurrent;
using System.Diagnostics.CodeAnalysis;

namespace Coursework.Core;

public class GeneticWeightSelector : IMaxWeightSelector
{
    private readonly Options _options;

    public record Options(int PopulationSize, int EvaluationCount, double MutationProbability, int MutationCount);

    public GeneticWeightSelector(Options? options = null)
    {
        _options = options ?? new Options(10, 300, 1, 30);
    }

    public async Task<(IEnumerable<int> Indexes, decimal Sum)> SelectMax(IEnumerable<int> weights, int chunkGap = 3)
    {
        var weightsArray = weights.ToArray();

        var populations = Population.GetInitPopulation(_options.PopulationSize, weightsArray, chunkGap);

        for (int i = 0; i < _options.EvaluationCount; i++)
        {
            var selectedPopulations = populations
                .Select((x, index) => (Population: x, Index: index))
                .ToList();

            await Parallel.ForEachAsync(selectedPopulations, new ParallelOptions()
            {
                MaxDegreeOfParallelism = 6
            }, (el, token) =>
            {
                var currentPopulation = el.Population;

                for (int otherPopulationIndex = el.Index + 1;
                     otherPopulationIndex < selectedPopulations.Count;
                     otherPopulationIndex++)
                {
                    var otherPopulation = selectedPopulations[otherPopulationIndex].Population;
                    var (child1, child2) = otherPopulation.Crossover(currentPopulation);

                    populations.AddPopulation(child1);
                    populations.AddPopulation(child2);

                    if (child1.ShouldMutate(_options.MutationProbability))
                    {
                        populations.AddPopulation(child1.Mutate(_options.MutationCount));
                    }

                    if (child2.ShouldMutate(_options.MutationProbability))
                    {
                        populations.AddPopulation(child2.Mutate(_options.MutationCount));
                    }
                }

                return ValueTask.CompletedTask;
            });
        }

        var maxPopulation = populations.Best;

        if (maxPopulation is null)
        {
            return (Array.Empty<int>(), -1);
        }

        return (maxPopulation.Indexes, maxPopulation.Sum);
    }
}