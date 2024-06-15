using System.Text.Json.Serialization;
using Coursework.TaskGenerator;
using Coursework.WebApi;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateSlimBuilder(args);

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.TypeInfoResolverChain.Insert(0, AppJsonSerializerContext.Default);
});
builder.Services.AddCors();

var app = builder.Build();


app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(builder.Environment.ContentRootPath, "static")),
});

var generateApi = app.MapGroup("/api/generate");

generateApi.MapGet("/", Generator.GenerateWeights);

app.UseGreedyEndpoints().UseGeneticEndpoints();
app.UseMiddleware<SpaMiddleware>("./static/index.html");
app.UseCors(x => x.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());


app.Run();


[JsonSerializable(typeof(IEnumerable<int>))]
[JsonSerializable(typeof(GreedyRequest))]
[JsonSerializable(typeof(GreedyWeightSelectorResult))]
[JsonSerializable(typeof(GeneticRequest))]
[JsonSerializable(typeof(GeneticWeightSelectorResult))]
internal partial class AppJsonSerializerContext : JsonSerializerContext
{
}