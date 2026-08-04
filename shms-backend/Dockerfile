# -----------------------------------------------------------------------------
# Stage 1: Build stage using Maven and Java 21
# -----------------------------------------------------------------------------
FROM maven:3.9.8-eclipse-temurin-21-alpine AS builder
WORKDIR /app

# Copy pom.xml and source code
COPY pom.xml .
COPY src ./src

# Build package without running tests
RUN mvn clean package -DskipTests

# -----------------------------------------------------------------------------
# Stage 2: Minimal Runtime stage using JRE 21
# -----------------------------------------------------------------------------
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create non-root user for security
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copy built jar from builder stage
COPY --from=builder /app/target/*.jar app.jar

# Render exposes $PORT environment variable dynamically
ENV PORT=8080
EXPOSE 8080

# Run application
ENTRYPOINT ["java", "-jar", "app.jar"]
