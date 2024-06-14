using System.Collections.Concurrent;
using System.Diagnostics.CodeAnalysis;

namespace Coursework.Core;

public class GeneticWeightSelector : IMaxWeightSelector
{
    private readonly Options? _options;

    public record Options(int? PopulationSize, int? EvaluationCount, double? MutationProbability);

    public GeneticWeightSelector(Options? options = null)
    {
        _options = options;
    }

    [SuppressMessage("ReSharper.DPA", "DPA0001: Memory allocation issues")]
    public async Task<(IEnumerable<int> Indexes, decimal Sum)> SelectMax(IEnumerable<int> weights, int chunkGap = 3)
    {
        var weightsArray = weights.ToArray();
        var populationSize = _options?.PopulationSize ?? chunkGap * 5;
        var evaluationCount = _options?.EvaluationCount ?? 4;
        var mutationProbability = _options?.MutationProbability ?? 1;

        var populations = Population.GetInitPopulation(populationSize, weightsArray, chunkGap);

        // complexity evaluationCount * populationSize * populationSize
        for (int i = 0; i < evaluationCount; i++)
        {
            var selectedPopulations = populations
                .DistinctBy(x => x.Hash)
                .OrderByDescending(x => x.Sum)
                .Take(populationSize)
                .Select((x, index) => (Population: x, Index: index))
                .ToList();

            var newPopulations = new ConcurrentBag<Population>();

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

                    newPopulations.Add(child1);
                    newPopulations.Add(child2);
                    
                    if (child1.ShouldMutate(mutationProbability))
                    {
                        newPopulations.Add(child1.Mutate());
                    }
                    
                    if (child2.ShouldMutate(mutationProbability))
                    {
                        newPopulations.Add(child2.Mutate());
                    }
                }

                newPopulations.Add(currentPopulation);
                    
                return ValueTask.CompletedTask;
            });

            populations = newPopulations.ToList();
        }

        var maxPopulation = populations.MaxBy(x => x.Sum);

        if (maxPopulation is null)
        {
            return (Array.Empty<int>(), -1);
        }

        return (maxPopulation.Indexes, maxPopulation.Sum);
    }
}