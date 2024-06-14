namespace Coursework.Core;

public interface INeighborsValueProvider
{
    double GetValue(int[] weights, int index, int chunkGap, int startIndex = 0);
}

public class NeighborsValueProvider : INeighborsValueProvider
{
    private double GetNeighborsWeight(int[] weights, int index, int chunkGap, int startIndex = 0)
    {
        var loseNeighborsSum = 0;
        for (int i = 1; i < chunkGap; i++)
        {
            var rightIndex = index + i;
            var leftIndex = index - i;

            if (rightIndex < weights.Length)
            {
                loseNeighborsSum += weights[rightIndex];
            }

            if (leftIndex >= startIndex)
            {
                loseNeighborsSum += weights[leftIndex];
            }
        }

        return loseNeighborsSum;
    }

    public double GetValue(int[] weights, int index, int chunkGap, int startIndex = 0)
    {
        var loseNeighborsSum = GetNeighborsWeight(weights, index, chunkGap, startIndex);
        
        return weights[index] - loseNeighborsSum ;
    }
}