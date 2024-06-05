using System.Collections;

namespace Coursework.Core;

public class ReadOnlyBitArray : IReadOnlyList<bool>
{
    private readonly BitArray _bitArray;

    public ReadOnlyBitArray(BitArray bitArray)
    {
        _bitArray = bitArray ?? throw new ArgumentNullException(nameof(bitArray));
    }

    public bool this[int index] => _bitArray[index];

    public int Count => _bitArray.Length;

    public IEnumerator<bool> GetEnumerator()
    {
        for (int i = 0; i < _bitArray.Length; i++)
        {
            yield return _bitArray[i];
        }
    }

    IEnumerator IEnumerable.GetEnumerator()
    {
        return GetEnumerator();
    }

    public BitArray CloneBits() => new BitArray(_bitArray);
}