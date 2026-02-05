namespace Moodfolio.Application.DoNothingSimulation.Services;

public interface IVerdictGenerator
{
    string Generate(decimal actualReturnPct, decimal doNothingReturnPct, decimal performanceDrag);
}

public class VerdictGenerator : IVerdictGenerator
{
    public string Generate(decimal actualReturnPct, decimal doNothingReturnPct, decimal performanceDrag)
    {
        var dragAbs = Math.Abs(performanceDrag);

        return performanceDrag switch
        {
            < -20 => $"Your active trading cost you {dragAbs:F1}% in returns. Consider a passive approach.",
            < -5 => $"Your trading decisions underperformed by {dragAbs:F1}%. There's room for improvement.",
            < 5 => "Your performance is roughly in line with a passive strategy. Keep it simple!",
            < 20 => $"Your trading added {performanceDrag:F1}% value. Nice work!",
            _ => $"Exceptional trading! You outperformed by {performanceDrag:F1}%. You might be onto something."
        };
    }
}
