using BenchmarkDotNet.Attributes;
using Coursework.Core;
using Coursework.TaskGenerator;

namespace Coursework.Benchmark;

[Config(typeof(AntiVirusFriendlyConfig))]
[MemoryDiagnoser]
[HtmlExporter]
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
    public async Task<decimal> Greedy() => (await _greedy.SelectMax(_data, chankGap)).Sum;

    [Benchmark]
    public async Task<decimal> Genetic() => (await _genetic.SelectMax(_data, chankGap)).Sum;


    private static int[] GetRandomArray()
    {
        return Generator.GenerateWeights(100, 100, 100, 100).ToArray();
    }
}