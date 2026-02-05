using MediatR;
using Microsoft.AspNetCore.Mvc;
using Moodfolio.Application.PortfolioPersona.Commands;
using Moodfolio.Contracts.V1.Requests;
using Moodfolio.Contracts.V1.Responses;

namespace Moodfolio.Api.Controllers;

[ApiController]
[Route("api/v1/analysis")]
public class AnalysisController : ControllerBase
{
    private readonly IMediator _mediator;

    public AnalysisController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("persona")]
    [ProducesResponseType(typeof(PersonaAnalysisResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<PersonaAnalysisResponse>> AnalyzePersona(
        [FromBody] PersonaAnalysisRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new AnalyzePersonaCommand(request), cancellationToken);
        return Ok(result);
    }
}
