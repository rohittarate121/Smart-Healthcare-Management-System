# -----------------------------------------------------------------------------
# Stage 1: Build stage using .NET 8 SDK
# -----------------------------------------------------------------------------
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project file and restore dependencies
COPY ["SHMS.API.csproj", "./"]
RUN dotnet restore "SHMS.API.csproj"

# Copy all source files and publish
COPY . .
RUN dotnet publish "SHMS.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# -----------------------------------------------------------------------------
# Stage 2: Minimal Runtime stage using .NET 8 ASP.NET Core Runtime
# -----------------------------------------------------------------------------
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Render dynamically assigns PORT — bind to 0.0.0.0 so the port scan succeeds
# http://+:PORT means listen on ALL interfaces (0.0.0.0), not just localhost
ENV ASPNETCORE_URLS=http://+:${PORT:-8080}
ENV ASPNETCORE_ENVIRONMENT=Production

EXPOSE 8080

ENTRYPOINT ["dotnet", "SHMS.API.dll"]
