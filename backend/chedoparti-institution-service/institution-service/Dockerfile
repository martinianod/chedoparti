FROM eclipse-temurin:17-jre

WORKDIR /app

# Copy pre-built JAR (built on host with: mvn clean package -DskipTests)
COPY target/*.jar app.jar

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
