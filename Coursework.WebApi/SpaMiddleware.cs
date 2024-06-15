namespace Coursework.WebApi;

public class SpaMiddleware
{
    private readonly RequestDelegate _next;
    private readonly string _indexFilePath;

    public SpaMiddleware(RequestDelegate next, string indexFilePath)
    {
        _next = next;
        _indexFilePath = indexFilePath;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        if (context.Request.Path.StartsWithSegments("/api"))
        {
            await _next(context);
            return;
        }

        await _next(context);

        if (File.Exists(_indexFilePath) && context.Response.StatusCode == 404)
        {
            context.Response.ContentType = "text/html";
            await context.Response.SendFileAsync(_indexFilePath);
        }
    }
}