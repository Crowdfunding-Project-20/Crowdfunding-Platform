# Build stage
FROM maven:3.9-eclipse-temurin-21-alpine AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn package -DskipTests -B

# Run stage
FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app
COPY --from=build /app/target/crowdfunding-0.0.1-SNAPSHOT.jar nkoso.jar
EXPOSE 8080
CMD ["java", "-jar", "nkoso.jar"]