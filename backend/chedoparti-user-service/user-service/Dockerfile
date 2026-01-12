FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copy pre-built JAR (built on host with: mvn clean package -DskipTests)
COPY target/*.jar app.jar

# Install wget for health checks
RUN apk add --no-cache wget

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
