using Moodfolio.Domain.Enums;

namespace Moodfolio.Application.PortfolioPersona.Services;

public interface IPersonaClassifier
{
    PersonaId Classify(decimal avgHoldingDays, decimal turnoverRate, decimal panicSellRatio, decimal winRate);
    PersonaInfo GetPersonaInfo(PersonaId personaId);
}

public sealed record PersonaInfo(
    string DisplayName,
    IReadOnlyList<string> Traits,
    string Description,
    string Advice);

public class PersonaClassifier : IPersonaClassifier
{
    public PersonaId Classify(decimal avgHoldingDays, decimal turnoverRate, decimal panicSellRatio, decimal winRate)
    {
        // HODLer: holding > 365 days AND turnover < 20%
        if (avgHoldingDays > 365 && turnoverRate < 20)
        {
            return PersonaId.Hodler;
        }

        // DayTrader: holding < 3 days AND turnover > 500%
        if (avgHoldingDays < 3 && turnoverRate > 500)
        {
            return PersonaId.DayTrader;
        }

        // PanicSeller: panic sell ratio > 60%
        if (panicSellRatio > 60)
        {
            return PersonaId.PanicSeller;
        }

        // Sniper: low frequency BUT win rate > 70%
        if (turnoverRate < 100 && winRate > 70)
        {
            return PersonaId.Sniper;
        }

        // Default to DayTrader for high activity, Hodler otherwise
        return turnoverRate > 200 ? PersonaId.DayTrader : PersonaId.Hodler;
    }

    public PersonaInfo GetPersonaInfo(PersonaId personaId)
    {
        return personaId switch
        {
            PersonaId.Hodler => new PersonaInfo(
                DisplayName: "The HODLer",
                Traits: ["Patient investor", "Long-term focus", "Low trading activity"],
                Description: "You're a patient investor who believes in the power of time in the market. You rarely trade and prefer to let your investments grow over years.",
                Advice: "Your patient approach often beats active trading. Continue to focus on quality investments and resist the urge to check prices daily."
            ),

            PersonaId.DayTrader => new PersonaInfo(
                DisplayName: "The Day Trader",
                Traits: ["High frequency trading", "Short holding periods", "Active market participant"],
                Description: "You trade frequently with short holding periods. You're always looking for the next opportunity and aren't afraid to act quickly.",
                Advice: "Consider the impact of transaction costs on your returns. Even small fees add up with high-frequency trading. Try extending some holding periods."
            ),

            PersonaId.PanicSeller => new PersonaInfo(
                DisplayName: "The Panic Seller",
                Traits: ["Emotional trading", "Sells during volatility", "Fear-driven decisions"],
                Description: "You tend to sell when markets get scary. High VIX days trigger your sell button, often at the worst possible times.",
                Advice: "Market volatility is normal. Consider setting rules for yourself: don't trade on high-VIX days, or use limit orders instead of market orders during volatility."
            ),

            PersonaId.Sniper => new PersonaInfo(
                DisplayName: "The Sniper",
                Traits: ["Selective trader", "High win rate", "Quality over quantity"],
                Description: "You don't trade often, but when you do, you usually win. You're patient and wait for the right opportunities.",
                Advice: "Your selective approach is working well. Keep trusting your analysis and don't feel pressured to trade more frequently."
            ),

            _ => throw new ArgumentOutOfRangeException(nameof(personaId))
        };
    }
}
