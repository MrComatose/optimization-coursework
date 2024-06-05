namespace Coursework.Core;

public interface INeighborsValueProvider
{
    double GetValue(int[] weights, int index, int chunkGap, int startIndex = 0);
}

public class NeighborsValueProvider : INeighborsValueProvider
{
    public double GetValue(int[] weights, int index, int chunkGap, int startIndex = 0)
    {
        double value = weights[index];

        var loseNeighborsSum = 0;
        var loseNeighborsCount = 0;
        for (int i = 1; i < chunkGap; i++)
        {
            var rightIndex = index + i;
            var leftIndex = index - i;

            if (rightIndex < weights.Length)
            {
                loseNeighborsSum += weights[rightIndex];
                loseNeighborsCount++;
            }

            if (leftIndex >= startIndex)
            {
                loseNeighborsSum += weights[leftIndex];
                loseNeighborsCount++;
            }
        }


        var divider = loseNeighborsCount > 0 ? loseNeighborsCount : 1;
        var keepNeighborsSum = 0d;
        var rightOutOfChunkIndex = index + chunkGap + 0;
        var leftOutOfChunkIndex = index - chunkGap - 0;

        if (rightOutOfChunkIndex < weights.Length)
        {
            keepNeighborsSum += weights[rightOutOfChunkIndex] / divider;
        }

        if (leftOutOfChunkIndex >= startIndex)
        {
            keepNeighborsSum += weights[leftOutOfChunkIndex] / divider;
        }


        value -= loseNeighborsSum;
        value += keepNeighborsSum;

        return value;
    }
}