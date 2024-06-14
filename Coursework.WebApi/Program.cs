using System.Text.Json.Serialization;
using Coursework.Core;
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

var generateApi = app.MapGroup("/generate");

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(builder.Environment.ContentRootPath, "static")),
});

generateApi.MapGet("/", Generator.GenerateWeights);

app.UseGreedyEndpoints().UseGeneticEndpoints();
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