FROM openjdk:17-jdk-slim
WORKDIR /app
# Point to the target folder where Maven put the jar file in Step 2
COPY target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
