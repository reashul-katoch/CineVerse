FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 5003
ENTRYPOINT ["sh", "-c", "java -jar app.jar --spring.data.mongodb.uri=${SPRING_DATA_MONGODB_URI}"]
