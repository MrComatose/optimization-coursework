using System.Collections;
using System.Collections.Concurrent;
using System.Collections.Specialized;

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
        public GreedyTests(): base(new GreedyWeightsSelector(new NeighborsValueProvider()))
        {
            
        }
    }
    public class GeneticTests : MaxWeightSelectorTests
    {
        public GeneticTests(): base(new GeneticWeightSelector())
        {
            
        }
    }

    [Fact]
    public  async Task Test1()
    {
        // Arrange
        var numbers = new[] { 1, 2, 3, 0, 33, 43, 2, 23, 2 };
        
        // Act
        var result = await _selector.SelectMax(numbers);
        
        // Assert
        Assert.Equal(58, result.Sum);
        
    }
    
    
    [Fact]
    public  async Task SuccessRateCheck()
    {
        // Arrange
        var numbers = new[] { 1, 2, 3, 0, 33, 43, 2, 23, 2 };
        var count = 1000;
        var results = new ConcurrentBag<decimal>();
        // Act
        await Parallel.ForEachAsync(Enumerable.Range(0, count), async (_, _) =>
        {
            var result = await _selector.SelectMax(numbers);

            results.Add(result.Sum);
        });
        
        // Assert
        var successRate = results.Count(x => x == 58);
        Assert.Equal(1, successRate / (double)count);
        
    }
    
    
    [Fact]
    public  async Task ShouldSelectSingleValuableItem()
    {
        // Arrange
        var numbers = new[] { 0,0,0,0,0,0,0,0,0,0,0,00,0,0,0,0,0, 1 ,0,0,0,0,0,0,0,0,0,0,0,00,0,0,0,0,0 };
        
        // Act
        var result = await _selector.SelectMax(numbers);
        
        // Assert
        Assert.Equal(1, result.Sum);
        
    }
    
    [Fact]
    public  async Task ShouldSelectElementsBasedOnNextChunk()
    {
        // Arrange
        var numbers = new[] { 1, 91, 92, 93, 4 };
        
        // Act
        var result = await _selector.SelectMax(numbers);
        
        // Assert
        Assert.Equal(95, result.Sum);
        
    }
    
    
    [Fact]
    public  async Task Test2()
    {
        // Arrange
        var numbers = new[] { 1, 8, 9, 16, 25, 2, 32, 1 };
        
        // Act
        var result = await _selector.SelectMax(numbers);
        
        // Assert
        Assert.Equal(49, result.Sum);
        
    }
    
    
    [Fact]
    public  async Task Test4()
    {
        // Arrange
        var numbers = new[] { 1, 10, 100, 1000, 10000, 100000, 1000000, 10000000 };
        
        // Act
        var result = await _selector.SelectMax(numbers);
        
        // Assert
        Assert.Equal(10000000 + 10000 + 10, result.Sum);
        
    }
    
    
    [Fact]
    public  async Task Test3()
    {
        // Arrange
        var numbers = new[] { 0, 0, 92, 93, 94 };
        
        // Act
        var result = await _selector.SelectMax(numbers);
        
        // Assert
        Assert.Equal(94, result.Sum);
        
    }
    
    [Fact]
    public  async Task StressTest1()
    {
        // Arrange
        var numbers = Enumerable.Range(0, 1000000);
        
        // Act
        var node = await _selector.SelectMax(numbers);
        
        // Assert
        Assert.Equal(166666833333, node.Sum);
        
    }
    
    [Fact]
    public async Task StressTest2()
    {
        // Arrange
        var numbers = Enumerable.Range(0, 10000);
        
        // Act
        var node = await _selector.SelectMax(numbers);
        
        // Assert
        Assert.Equal(16668333, node.Sum);
        
    }
    
}