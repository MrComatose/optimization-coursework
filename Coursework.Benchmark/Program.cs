using BenchmarkDotNet.Running;
using Coursework.Benchmark;

_ = BenchmarkRunner.Run<WeightSelectorBenchmark>();
Console.WriteLine("Finished");
Console.ReadLine();

