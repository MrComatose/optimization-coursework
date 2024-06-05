namespace Coursework.Core;

public class GreedyWeightsSelector : IMaxWeightSelector
{
    private readonly INeighborsValueProvider _neighborsValueProvider;

    public GreedyWeightsSelector(INeighborsValueProvider neighborsValueProvider)
    {
        _neighborsValueProvider = neighborsValueProvider;
    }

    public async Task<(IEnumerable<int> Indexes, decimal Sum)> SelectMax(
        IEnumerable<int> weights,
        int chunkGap = 3
    )
    {
        var weightArr = weights.ToArray();

        var resultIndexes = new List<int>();
        var sum = 0m;

        double? maxPartitionValue = null;
        int lastSelectedIndex = 0;
        int currentChunkPosition = 0;
        int? lastAddedIndex = null;

        for (int i = 0; i < weightArr.Length; i++)
        {
            currentChunkPosition++;

            var currentValue = _neighborsValueProvider.GetValue(weightArr, i, chunkGap,
                lastAddedIndex is null ? 0 : lastAddedIndex.Value + chunkGap - 1);

            if (maxPartitionValue is null || currentValue > maxPartitionValue)
            {
                maxPartitionValue = currentValue;
                lastSelectedIndex = i;
            }

            if (currentChunkPosition == chunkGap || i == weightArr.Length - 1)
            {
                resultIndexes.Add(lastSelectedIndex);
                sum += weightArr[lastSelectedIndex];
                maxPartitionValue = null;
                i = lastSelectedIndex + chunkGap - 1;
                lastAddedIndex = lastSelectedIndex;

                currentChunkPosition = 0;
            }
        }

        return (resultIndexes, sum);
    }
}