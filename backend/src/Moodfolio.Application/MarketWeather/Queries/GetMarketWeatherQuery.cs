using MediatR;
using Moodfolio.Contracts.V1.Responses;

namespace Moodfolio.Application.MarketWeather.Queries;

public sealed record GetMarketWeatherQuery : IRequest<MarketWeatherResponse>;
