using BenchmarkDotNet.Attributes;
using Coursework.Core;

namespace Coursework.Benchmark;

[Config(typeof(AntiVirusFriendlyConfig))]
[MemoryDiagnoser]
public class WeightSelectorBenchmark
{
    private readonly GreedyWeightsSelector _greedy = new(new NeighborsValueProvider());
    private readonly GeneticWeightSelector _genetic = new();
    private int[] _data;
    private int chankGap = 3;

    [GlobalSetup]
    public void Setup()
    {
        _data = GetRandomArray();
    }

    [Benchmark]
    public Task<(IEnumerable<int> Indexes, decimal Sum)> Greedy() => _greedy.SelectMax(_data, chankGap);

    [Benchmark]
    public Task<(IEnumerable<int> Indexes, decimal Sum)> Genetic() => _genetic.SelectMax(_data, chankGap);


    private static int[] GetRandomArray()
    {
        var random = new Random();
        var length = 1000;

        return Enumerable.Range(0, length).Select((_) => random.Next(0, 1000000)).ToArray();
    }
}