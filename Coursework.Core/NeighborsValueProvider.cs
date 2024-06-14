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
        var loseCount = 0;
        for (int i = 1; i < chunkGap; i++)
        {
            var rightIndex = index + i;
            var leftIndex = index - i;

            if (rightIndex < weights.Length)
            {
                loseNeighborsSum += weights[rightIndex];
                loseCount++;
            }

            if (leftIndex >= startIndex)
            {
                loseNeighborsSum += weights[leftIndex];
                loseCount++;
            }
        }

        var keepNeighborsSum = 0d;

        for (int i = index + chunkGap; i < weights.Length; i++)
        { 
            keepNeighborsSum += weights[i];
        }

        var divider = Math.Max((weights.Length - index -  chunkGap) % chunkGap, 1);
        value -= loseNeighborsSum;
        value += keepNeighborsSum ;

        return value;
    }
}