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

        var population = Population.GetInitPopulation(_options.PopulationSize, weightsArray, chunkGap);

        for (int i = 0; i < _options.EvaluationCount; i++)
        {
            var selectedMembers = population
                .Select((x, index) => (Population: x, Index: index))
                .ToList();

            await Parallel.ForEachAsync(selectedMembers, new ParallelOptions()
            {
                MaxDegreeOfParallelism = 6
            }, (el, token) =>
            {
                var currentMember = el.Population;

                for (int otherMemberIndex = el.Index + 1;
                     otherMemberIndex < selectedMembers.Count;
                     otherMemberIndex++)
                {
                    var otherMember = selectedMembers[otherMemberIndex].Population;
                    var (child1, child2) = otherMember.Crossover(currentMember);

                    population.AddMember(child1);
                    population.AddMember(child2);

                    if (child1.ShouldMutate(_options.MutationProbability))
                    {
                        population.AddMember(child1.Mutate(_options.MutationCount));
                    }

                    if (child2.ShouldMutate(_options.MutationProbability))
                    {
                        population.AddMember(child2.Mutate(_options.MutationCount));
                    }
                }

                return ValueTask.CompletedTask;
            });
        }

        var maxPopulation = population.Best;

        if (maxPopulation is null)
        {
            return (Array.Empty<int>(), -1);
        }

        return (maxPopulation.Indexes, maxPopulation.Sum);
    }
}