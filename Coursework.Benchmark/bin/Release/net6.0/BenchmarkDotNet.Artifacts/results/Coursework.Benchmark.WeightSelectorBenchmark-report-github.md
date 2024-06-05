```

BenchmarkDotNet v0.13.12, Windows 10 (10.0.19045.4412/22H2/2022Update)
Intel Core i9-9900K CPU 3.60GHz (Coffee Lake), 1 CPU, 16 logical and 8 physical cores
.NET SDK 6.0.300
  [Host] : .NET 6.0.5 (6.0.522.21309), X86 RyuJIT AVX2

Job=MediumRun  Toolchain=InProcessNoEmitToolchain  IterationCount=15  
LaunchCount=2  WarmupCount=10  

```
| Method  | Mean        | Error     | StdDev     | Gen0     | Gen1     | Gen2     | Allocated  |
|-------- |------------:|----------:|-----------:|---------:|---------:|---------:|-----------:|
| Greedy  |    18.30 μs |  0.110 μs |   0.161 μs |   1.5564 |   0.0305 |        - |    8.07 KB |
| Genetic | 5,278.13 μs | 74.378 μs | 106.671 μs | 695.3125 | 687.5000 | 273.4375 | 3611.94 KB |
