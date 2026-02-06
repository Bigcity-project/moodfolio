using MediatR;
using Microsoft.AspNetCore.Mvc;
using Moodfolio.Application.Stock.Queries;
using Moodfolio.Contracts.V1.Responses;

namespace Moodfolio.Api.Controllers;

[ApiController]
[Route("api/v1/stock")]
public class StockController : ControllerBase
{
    private readonly IMediator _mediator;

    public StockController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("{symbol}")]
    [ProducesResponseType(typeof(StockAnalysisResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<StockAnalysisResponse>> GetStockAnalysis(
        string symbol,
        CancellationToken cancellationToken)
    {
        try
        {
            var result = await _mediator.Send(new GetStockAnalysisQuery(symbol), cancellationToken);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception)
        {
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }
}
