using MediatR;
using Moodfolio.Contracts.V1.Requests;
using Moodfolio.Contracts.V1.Responses;

namespace Moodfolio.Application.DoNothingSimulation.Commands;

public sealed record RunDoNothingSimulationCommand(DoNothingSimulationRequest Request) : IRequest<DoNothingSimulationResponse>;
