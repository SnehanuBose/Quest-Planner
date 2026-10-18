# Stage 1: Build the JAR using Maven + Java 21
FROM maven:3.9.9-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Copy pom.xml and source code
COPY pom.xml .
COPY src ./src

# Build and safely rename the produced jar inside the container
RUN mvn clean package -DskipTests && \
    mv target/*.jar app.jar

# Stage 2: Run the JAR using lightweight JRE 21
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/app.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]