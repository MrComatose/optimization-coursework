using System.Collections;
using System.Text;

namespace Coursework.Core;

public record PopulationMember : IEnumerable<bool>
{
    public PopulationMember(BitArray value, int[] weights, int chunkSize)
    {
        var validBits = MakeBitsValid(weights, value, chunkSize);
        Bits = new ReadOnlyBitArray(validBits);
        Hash = CalculateHash(validBits);
        ChunkSize = chunkSize;
        _weights = weights;
        (Indexes, Sum) = GetSumAndIndexes();
    }

    public decimal Sum { get; }
    public IEnumerable<int> Indexes { get; }

    private readonly int[] _weights;

    private int ChunkSize { get; }

    private ReadOnlyBitArray Bits { get; }

    public string Hash { get; }


    public static PopulationMember Gen(int start, int[] weights, int chunkSize)
    {
        var size = weights.Length;
        var value = new BitArray(size, false);

        for (int index = start; index < size; index++)
        {
            value[index] = true;
            index += chunkSize - 1;
        }

        return new PopulationMember(value, weights, chunkSize);
    }

    public static PopulationMember RandomGen(int[] weights, int chunkSize)
    {
        var size = weights.Length;
        var value = new BitArray(size, false);
        var random = new Random();
        var lastTrueIndex = -chunkSize;

        var start = random.Next(0, chunkSize);
        for (int index = start; index < size; index++)
        {
            var probability = Math.Pow(0.30, (1 + index - (lastTrueIndex + chunkSize)));
            if (random.NextDouble() > probability)
            {
                value[index] = true;
                lastTrueIndex = index;
                index += chunkSize - 1;
            }
        }

        return new PopulationMember(value, weights, chunkSize);
    }

    private (IEnumerable<int>, decimal) GetSumAndIndexes()
    {
        decimal sum = 0;
        var indexes = new List<int>(_weights.Length / ChunkSize);

        for (int i = 0; i < _weights.Length; i++)
        {
            if (this[i])
            {
                sum += _weights[i];
                indexes.Add(i);
            }
        }

        return (indexes, sum);
    }

    private static (int, int)? GetFirstInvalidIndexes(BitArray bits, int chunkSize)
    {
        int lastTrueIndex = -chunkSize;

        for (int i = 0; i < bits.Length; i++)
        {
            if (bits[i])
            {
                if (i - lastTrueIndex < chunkSize)
                {
                    return (lastTrueIndex, i);
                }

                lastTrueIndex = i;
            }
        }

        return null;
    }

    private static BitArray MakeBitsValid(int[] weights, BitArray originalBits, int chunkSize)
    {
        var invalidIndexes = GetFirstInvalidIndexes(originalBits, chunkSize);

        if (invalidIndexes is null)
        {
            return originalBits;
        }

        var bits = new BitArray(originalBits);

        while (invalidIndexes is not null)
        {
            if (weights[invalidIndexes.Value.Item1] > weights[invalidIndexes.Value.Item2])
            {
                bits[invalidIndexes.Value.Item2] = false;
            }
            else
            {
                bits[invalidIndexes.Value.Item1] = false;
            }

            invalidIndexes = GetFirstInvalidIndexes(bits, chunkSize);
        }

        return bits;
    }

    public bool ShouldMutate(double probability = 0.05)
    {
        Random random = new Random();

        return random.NextDouble() > (1 - probability);
    }

    public PopulationMember Mutate(int mutationCount = 10)
    {
        Random random = new Random();
        var mutatedBits = Bits.CloneBits();

        for (int i = 0; i < mutationCount; i++)
        {
            var bitToInvert = random.Next(0, Bits.Count);
            mutatedBits[bitToInvert] = !mutatedBits[bitToInvert];
        }

        return new PopulationMember(mutatedBits, _weights, ChunkSize);
    }

    private static PopulationMember Crossover(int crossoverPoint, PopulationMember left, PopulationMember right)
    {
        BitArray childBits = new BitArray(left.Bits.Count);

        for (int i = 0; i < crossoverPoint; i++)
        {
            childBits[i] = left[i];
        }

        for (int i = crossoverPoint; i < right.Bits.Count; i++)
        {
            childBits[i] = right[i];
        }

        return new PopulationMember(childBits, left._weights, left.ChunkSize);
    }

    public (PopulationMember Child1, PopulationMember Child2) Crossover(PopulationMember other)
    {
        Random random = new Random();
        int crossoverPoint = random.Next(1, Bits.Count);

        return (Crossover(crossoverPoint, this, other), Crossover(crossoverPoint, other, this));
    }

    private static string CalculateHash(BitArray bits)
    {
        byte[] bytes = new byte[(bits.Length + 7) / 8];
        bits.CopyTo(bytes, 0);
        return Encoding.ASCII.GetString(bytes);
    }

    public IEnumerator<bool> GetEnumerator()
    {
        for (int i = 0; i < Bits.Count; i++)
        {
            yield return this[i];
        }
    }

    public bool this[int index] => Bits[index];

    IEnumerator IEnumerable.GetEnumerator()
    {
        return GetEnumerator();
    }

    public class PopulationHashComparer : IEqualityComparer<PopulationMember>
    {
        public bool Equals(PopulationMember x, PopulationMember y) => x.Hash == y.Hash;
        public int GetHashCode(PopulationMember obj) => obj.Hash.GetHashCode();
    }

    public class PopulationSumComparer : IComparer<PopulationMember>
    {
        public int Compare(PopulationMember x, PopulationMember y) => x.Sum.CompareTo(y.Sum);
    }
}