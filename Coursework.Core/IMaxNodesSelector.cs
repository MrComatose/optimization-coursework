namespace Coursework.Core;

public interface IMaxWeightSelector
{
    public Task<(IEnumerable<int> Indexes, decimal Sum)> SelectMax(IEnumerable<int> weights, int chunkGap = 3);
}