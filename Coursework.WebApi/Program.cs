using System.Text.Json.Serialization;
using Coursework.TaskGenerator;
using Coursework.WebApi;

var builder = WebApplication.CreateSlimBuilder(args);

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.TypeInfoResolverChain.Insert(0, AppJsonSerializerContext.Default);
});
builder.Services.AddCors();

var app = builder.Build();

var generateApi = app.MapGroup("/generate");

generateApi.MapGet("/", Generator.GenerateWeights);

app.UseGreedyEndpoints();
app.UseCors(x => x.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());

app.Run();


[JsonSerializable(typeof(IEnumerable<int>))]
[JsonSerializable(typeof(GreedyRequest))]
[JsonSerializable(typeof(GreedyWeightSelectorResult))]
internal partial class AppJsonSerializerContext : JsonSerializerContext
{
}