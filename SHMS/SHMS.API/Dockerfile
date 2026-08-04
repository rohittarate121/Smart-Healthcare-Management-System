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

# Render exposes PORT environment variable
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "SHMS.API.dll"]
