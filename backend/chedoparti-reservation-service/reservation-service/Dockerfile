# Multi-stage build for reservation-service
# Stage 1: Build the application
FROM eclipse-temurin:17-jdk AS builder

WORKDIR /build

# Update CA certificates to fix SSL issues
RUN apt-get update && apt-get install -y ca-certificates && update-ca-certificates

# Copy gradle wrapper and build files
COPY gradlew ./
COPY gradle ./gradle
COPY build.gradle ./
COPY settings.gradle ./

# Download dependencies
RUN chmod +x gradlew && ./gradlew dependencies --no-daemon || true

# Copy source code
COPY src ./src

# Build the application (skip tests for faster builds)
RUN ./gradlew clean bootJar --no-daemon -x test

# Stage 2: Runtime image
FROM eclipse-temurin:17-jre

WORKDIR /app

# Copy the built JAR from builder stage
COPY --from=builder /build/build/libs/*.jar app.jar

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
