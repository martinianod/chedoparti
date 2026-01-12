# Etapa 1: Build Stage
FROM gradle:7.5.1-jdk17 AS build
WORKDIR /app

COPY build.gradle settings.gradle ./
COPY gradle ./gradle

RUN gradle dependencies --no-daemon --parallel --build-cache

COPY src ./src
RUN gradle bootJar --no-daemon --parallel --build-cache

# Etapa 2: Runtime Stage
FROM openjdk:17-jdk-alpine
VOLUME /tmp

COPY --from=build /app/build/libs/*.jar user-service.jar

EXPOSE 8081

ENTRYPOINT ["java", "-Xms256m", "-Xmx512m", "-jar", "/user-service.jar"]
