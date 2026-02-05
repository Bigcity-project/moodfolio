using MediatR;
using Microsoft.AspNetCore.Mvc;
using Moodfolio.Application.DoNothingSimulation.Commands;
using Moodfolio.Contracts.V1.Requests;
using Moodfolio.Contracts.V1.Responses;

namespace Moodfolio.Api.Controllers;

[ApiController]
[Route("api/v1/simulation")]
public class SimulationController : ControllerBase
{
    private readonly IMediator _mediator;

    public SimulationController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("do_nothing")]
    [ProducesResponseType(typeof(DoNothingSimulationResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<DoNothingSimulationResponse>> RunDoNothingSimulation(
        [FromBody] DoNothingSimulationRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new RunDoNothingSimulationCommand(request), cancellationToken);
        return Ok(result);
    }
}
