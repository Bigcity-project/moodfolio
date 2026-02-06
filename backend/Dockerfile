# Stage 1: restore — cache NuGet packages separately from source code
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS restore
WORKDIR /src

# Copy solution-level files first for layer caching
COPY --link Moodfolio.sln Directory.Build.props Directory.Packages.props .editorconfig ./

# Copy all .csproj files preserving directory structure
COPY --link src/Moodfolio.Api/Moodfolio.Api.csproj src/Moodfolio.Api/
COPY --link src/Moodfolio.Domain/Moodfolio.Domain.csproj src/Moodfolio.Domain/
COPY --link src/Moodfolio.Application/Moodfolio.Application.csproj src/Moodfolio.Application/
COPY --link src/Moodfolio.Contracts/Moodfolio.Contracts.csproj src/Moodfolio.Contracts/
COPY --link src/Moodfolio.Infrastructure/Moodfolio.Infrastructure.csproj src/Moodfolio.Infrastructure/
COPY --link tests/Moodfolio.Domain.Tests/Moodfolio.Domain.Tests.csproj tests/Moodfolio.Domain.Tests/
COPY --link tests/Moodfolio.Application.Tests/Moodfolio.Application.Tests.csproj tests/Moodfolio.Application.Tests/
COPY --link tests/Moodfolio.Contracts.Tests/Moodfolio.Contracts.Tests.csproj tests/Moodfolio.Contracts.Tests/
COPY --link tests/Moodfolio.IntegrationTests/Moodfolio.IntegrationTests.csproj tests/Moodfolio.IntegrationTests/

RUN dotnet restore

# Stage 2: build — compile and publish
FROM restore AS build
COPY --link . .
RUN dotnet publish src/Moodfolio.Api -c Release -o /app/publish --no-restore

# Stage 3: test — optional target for CI (docker build --target test)
FROM build AS test
RUN dotnet test --no-build -c Release

# Stage 4: runtime — minimal image for production
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime

# Install curl for healthcheck
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Create data directory for SQLite and grant non-root user write access
RUN mkdir -p /app/data && chown $APP_UID /app/data

COPY --link --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:5000
ENV ConnectionStrings__DefaultConnection="Data Source=/app/data/moodfolio.db"

EXPOSE 5000

USER $APP_UID

HEALTHCHECK --interval=10s --timeout=3s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:5000/swagger/v1/swagger.json || exit 1

ENTRYPOINT ["dotnet", "Moodfolio.Api.dll"]
