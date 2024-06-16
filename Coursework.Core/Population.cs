using System.Collections;

namespace Coursework.Core;

public class Population : IEnumerable<PopulationMember>
{
    private readonly HashSet<PopulationMember> _distinctPopulations =
        new(new PopulationMember.PopulationHashComparer());

    private readonly SortedSet<PopulationMember> _sortedSet = new(new PopulationMember.PopulationSumComparer());

    private readonly int _populationSize = 0;

    public Population(int populationSize)
    {
        _populationSize = populationSize;
    }

    public Population(int populationSize, IEnumerable<PopulationMember> data)
    {
        _populationSize = populationSize;
        AddMembers(data);
    }


    public static Population GetInitPopulation(int populationSize, int[] weightsArray, int chunkGap)
    {
        var populations = Enumerable.Range(0, populationSize)
            .Select(_ => PopulationMember.RandomGen(weightsArray, chunkGap))
            .ToList();


        var nonRandomPopulations = Enumerable.Range(0, chunkGap)
            .Select(i => PopulationMember.Gen(i, weightsArray, chunkGap))
            .ToList();

        populations.AddRange(nonRandomPopulations);

        return new Population(populationSize, populations);
    }

    private static readonly object Locker = new
    {
    };

    public void AddMember(PopulationMember population)
    {
        lock (Locker)
        {
            if (_distinctPopulations.Contains(population))
            {
                return;
            }

            if (_sortedSet.Count < _populationSize)
            {
                _sortedSet.Add(population);
                _distinctPopulations.Add(population);
            }
            else if (population.Sum > _sortedSet.Min.Sum)
            {
                _sortedSet.Remove(_sortedSet.Min);
                _distinctPopulations.Remove(_sortedSet.Min);
                _sortedSet.Add(population);
                _distinctPopulations.Add(population);
            }
        }
    }

    public PopulationMember? Best => _sortedSet.Max;

    public void AddMembers(IEnumerable<PopulationMember> populations)
    {
        foreach (var population in populations)
        {
            AddMember(population);
        }
    }

    public IEnumerator<PopulationMember> GetEnumerator()
    {
        return _sortedSet.GetEnumerator();
    }

    IEnumerator IEnumerable.GetEnumerator()
    {
        return GetEnumerator();
    }
}