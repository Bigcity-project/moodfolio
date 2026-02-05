using MediatR;
using Moodfolio.Contracts.V1.Requests;
using Moodfolio.Contracts.V1.Responses;

namespace Moodfolio.Application.PortfolioPersona.Commands;

public sealed record AnalyzePersonaCommand(PersonaAnalysisRequest Request) : IRequest<PersonaAnalysisResponse>;
