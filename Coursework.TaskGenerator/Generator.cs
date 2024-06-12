
namespace Coursework.TaskGenerator;

public static class Generator
{
    public static IEnumerable<int> GenerateWeights(int n, double maxDiff, double averageValue, int permutationCount)
    {
        Random rand = new Random();
        List<int> weights = new List<int>();

        for (int i = 0; i < n; i++)
        {
            var weight = rand.Next((int)(averageValue - maxDiff / 2), (int)(averageValue + maxDiff / 2));
            weights.Add(weight);
        }

        weights.Sort();

        // Perform random permutations
        for (int i = 0; i < permutationCount; i++)
        {
            int index1 = rand.Next(n);
            int index2 = rand.Next(n);

            (weights[index1], weights[index2]) = (weights[index2], weights[index1]);
        }

        return weights;
    }
}