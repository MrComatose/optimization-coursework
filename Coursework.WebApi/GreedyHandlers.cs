using System.Collections;
using System.Diagnostics;
using Coursework.Core;

namespace Coursework.WebApi;

public class GreedyRequest
{
    public List<int> Weights { get; set; } = new List<int>();
    public int ChunkGap { get; set; } = 3;
}

public record GreedyWeightSelectorResult(
    IEnumerable<int> SelectedIndexes,
    decimal Sum,
    long ElapsedTicks,
    long ElapsedMilliseconds);

public static class GreedyHandlers
{
    public static WebApplication UseGreedyEndpoints(this WebApplication app)
    {
        app.MapGroup("api/greedy")
            .MapPost("/", Calculate);

        return app;
    }

    private static IMaxWeightSelector s_selector = new GreedyWeightsSelector(new NeighborsValueProvider());

    private static async Task<GreedyWeightSelectorResult> Calculate(GreedyRequest request)
    {
        var stopwatch = new Stopwatch();
        stopwatch.Start();

        var res = await s_selector.SelectMax(request.Weights, request.ChunkGap);

        stopwatch.Stop();

        return new GreedyWeightSelectorResult(res.Indexes, res.Sum, stopwatch.ElapsedTicks,
            stopwatch.ElapsedMilliseconds);
    }
}