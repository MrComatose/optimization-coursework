using System.Diagnostics;
using Coursework.Core;

namespace Coursework.WebApi;

public class GeneticRequest
{
    public List<int> Weights { get; set; } = new List<int>();
    public int ChunkGap { get; set; } = 3;
    public int? PopulationSize { get; set; }
    public int? EvaluationCount { get; set; }
    public double? MutationProbability { get; set; }
}

public record GeneticWeightSelectorResult(IEnumerable<int> SelectedIndexes, decimal Sum, long ElapsedTicks, long ElapsedMilliseconds);


public static class GeneticHandlers
{
    public static WebApplication UseGeneticEndpoints(this WebApplication app)
    {
        app.MapGroup("genetic")
            .MapPost("/", Calculate);

        return app;
    }

    private static async Task<GeneticWeightSelectorResult> Calculate(GeneticRequest request)
    {
        var selector = new GeneticWeightSelector(new GeneticWeightSelector.Options(request.PopulationSize,
            request.EvaluationCount, request.MutationProbability));
        
        var stopwatch = new Stopwatch();
        stopwatch.Start();

        var res = await selector.SelectMax(request.Weights, request.ChunkGap);

        stopwatch.Stop();

        return new GeneticWeightSelectorResult(res.Indexes, res.Sum, 
            stopwatch.ElapsedTicks, stopwatch.ElapsedMilliseconds);
    }

}