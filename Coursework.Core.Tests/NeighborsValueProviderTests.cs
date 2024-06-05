namespace Coursework.Core.Tests;

public class NeighborsValueProviderTests
{
    private readonly NeighborsValueProvider _provider;

    public NeighborsValueProviderTests()
    {
        _provider = new NeighborsValueProvider();
    }

    [Fact]
    public void ShouldCalculateValueBasedOnNeighbors()
    {
        // Arrange
        var numbers = new[] { 1, 10, 100, 1000, 10000, 100000, 1000000, 10000000 };
        
        // Act
        var calculatedValues = numbers.Select((x, i) => _provider.GetValue(numbers, i, 3));
        // Assert
        
        Assert.Equal(new [] {1d,2,3,4,5} , calculatedValues);
    }
}