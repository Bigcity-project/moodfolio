using MediatR;
using Microsoft.AspNetCore.Mvc;
using Moodfolio.Application.MarketWeather.Queries;
using Moodfolio.Contracts.V1.Responses;

namespace Moodfolio.Api.Controllers;

[ApiController]
[Route("api/v1/market")]
public class MarketWeatherController : ControllerBase
{
    private readonly IMediator _mediator;

    public MarketWeatherController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("weather")]
    [ProducesResponseType(typeof(MarketWeatherResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<MarketWeatherResponse>> GetMarketWeather(CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetMarketWeatherQuery(), cancellationToken);
        return Ok(result);
    }
}
