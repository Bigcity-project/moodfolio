using MediatR;
using Moodfolio.Contracts.V1.Responses;

namespace Moodfolio.Application.Stock.Queries;

public sealed record GetStockAnalysisQuery(string Symbol) : IRequest<StockAnalysisResponse>;
