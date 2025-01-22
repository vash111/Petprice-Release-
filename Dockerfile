# Stage 1: Frontend Build
FROM node:20 AS frontend-builder
WORKDIR /app
COPY frontend/ .
RUN npm install
RUN npm run build

# Stage 2: Backend Build
FROM gradle:7.6-jdk17 AS backend-builder
WORKDIR /app
COPY backend/ .
COPY --from=frontend-builder /app/build/static src/main/resources/static
RUN gradle bootJar -x test

# Stage 3: Final Image
FROM openjdk:17-jdk-alpine
WORKDIR /app
COPY --from=backend-builder /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
