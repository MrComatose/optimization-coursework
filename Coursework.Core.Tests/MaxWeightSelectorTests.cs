using System.Collections.Concurrent;

namespace Coursework.Core.Tests;

public abstract class MaxWeightSelectorTests
{
    private readonly IMaxWeightSelector _selector;

    public MaxWeightSelectorTests(IMaxWeightSelector weightSelector)
    {
        _selector = weightSelector;
    }

    public class GreedyTests : MaxWeightSelectorTests
    {
        public GreedyTests() : base(new GreedyWeightsSelector(new NeighborsValueProvider()))
        {
        }
    }

    public class GeneticTests : MaxWeightSelectorTests
    {
        public GeneticTests() : base(new GeneticWeightSelector(new GeneticWeightSelector.Options(1,1,1, 1)))
        {
        }
    }
    

    public static IEnumerable<object[]> GeneratedTestData()
    {
        yield return new object[] { TaskGenerator.Generator.GenerateWeights(100, 0.1d, 88d, 100) };
        yield return new object[] { TaskGenerator.Generator.GenerateWeights(10, 2d, 88d, 100) };
        yield return new object[] { TaskGenerator.Generator.GenerateWeights(3, 100, 1000, 0) };
        yield return new object[] { TaskGenerator.Generator.GenerateWeights(100, 100, 900, 100) };
        yield return new object[] { TaskGenerator.Generator.GenerateWeights(100, 100, 900, 100) };
        yield return new object[] { TaskGenerator.Generator.GenerateWeights(100, 100, 900, 100) };
        yield return new object[] { TaskGenerator.Generator.GenerateWeights(100, 100, 900, 100) };
        yield return new object[] { TaskGenerator.Generator.GenerateWeights(100, 100, 900, 100) };
        yield return new object[] { TaskGenerator.Generator.GenerateWeights(100, 100, 900, 100) };
        yield return new object[] { TaskGenerator.Generator.GenerateWeights(100, 100, 900, 100) };
    }

    [Theory]
    [MemberData(nameof(GeneratedTestData))]
    public async Task ShouldAlwaysReturnValidIndexes(IEnumerable<int> weights)
    {
        // Arrange
        var chunkGap = 3;

        // Act
        var result = await _selector.SelectMax(weights, chunkGap);

        // Assert
        var indexes = result.Indexes.ToArray();
        for (int i = 0; i < indexes.Length; i++)
        {
            for (int j = i + 1; j < indexes.Length; j++)
            {
                var diff = Math.Abs(indexes[i] - indexes[j]);

                Assert.True(diff >= chunkGap, "");
            }
        }
    }

    public static IEnumerable<object[]> StaticTestData()
    {
        yield return new object[] { new int[] { 1, 2, 3, 0, 33, 43, 2, 23, 2 }, 58d };
        yield return new object[] { new int[] { 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0 }, 1d };
        yield return new object[] { new int[] { 1, 91, 92, 93, 4 }, 95d };
        yield return new object[] { new int[] { 1, 8, 9, 16, 25, 2, 32, 1 }, 49d };
        yield return new object[] { new int[] { 13525, 14672, 10602, 16219, 18154 }, 32826d };
        yield return new object[]
        {
            new int[] { 1, 10, 100, 1000, 10000, 100000, 1000000, 10000000 },
            10000000d + 10000d + 10d
        };
        yield return new object[] { new int[] { 0, 0, 92, 93, 94 }, 94d };
    }

    [Theory]
    [MemberData(nameof(StaticTestData))]
    public async Task SuccessRateCheck(int[] weights, decimal expectedSum)
    {
        // Arrange
        var count = 1;
        var results = new ConcurrentBag<(IEnumerable<int> Indexes, decimal Sum)>();

        // Act
        await Parallel.ForEachAsync(Enumerable.Range(0, count), async (_, _) =>
        {
            var result = await _selector.SelectMax(weights);

            results.Add(result);
        });

        // Assert
        var successRate = results.Count(x =>
            x.Sum == expectedSum
        );
        Assert.Equal(1, successRate / (double)count);
    }
}