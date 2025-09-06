# ByteBerry OAuth2 Service

[![CI/CD](https://img.shields.io/github/actions/workflow/status/JRuvalcabaFSD/ByteBerry-oauth2/ci.yml?branch=develop&label=CI/CD&logo=github)](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/actions)
[![Docker](https://img.shields.io/docker/v/jruvalcabafsd/byteberry-oauth2?sort=semver&label=Docker&logo=docker&logoColor=white&color=2496ED)](https://hub.docker.com/r/jruvalcabafsd/byteberry-oauth2)
[![GitHub Tag](https://img.shields.io/github/v/tag/JRuvalcabaFSD/ByteBerry-oauth2?label=Latest%20Tag)](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/tags)
[![GitHub Release](https://img.shields.io/github/v/release/JRuvalcabaFSD/ByteBerry-oauth2?logo=semantic-release&label=Latest%20Release&link=https%3A%2F%2Fgithub.com%2FJRuvalcabaFSD%2FByteBerry-oauth2%2Freleases)](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/releases)
[![GitHub Issues](https://img.shields.io/github/issues/JRuvalcabaFSD/ByteBerry-oauth2)](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/issues)
[![GitHub Stars](https://img.shields.io/github/stars/JRuvalcabaFSD/ByteBerry-oauth2)](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/stargazers)
[![License](https://img.shields.io/github/license/JRuvalcabaFSD/ByteBerry-oauth2?label=License)](./LICENSE)

## 📌 Description
The **ByteBerry OAuth2 Service** is the authentication and identity provider microservice of the ByteBerry Expense Management System.  
It implements an OAuth2 server with **Authorization Code + PKCE**, JWT with RS256, refresh tokens, JWKS endpoint, and user management.

This service is built with **TypeScript + Express.js + Prisma**, following **Clean Architecture** principles with SOLID, Repository & Adapter patterns.

## 🚀 Features
- OAuth2 Authorization Code Flow + PKCE
- JWT generation (RS256) + JWKS endpoint
- User registration and authentication
- Refresh token rotation and logout
- Health checks for monitoring and readiness
- Docker multi-arch ready (ARM64/AMD64)

## 🏗️ Architecture
Implements Clean Architecture with 5 layers:
- **Domain**: Entities and business rules
- **Application**: Use cases and DTOs
- **Infrastructure**: Database, repositories, external integrations
- **Presentation**: Controllers, routes, middleware
- **Shared/Config**: Utilities, errors, environment variables

## 🛠️ Getting Started

### Prerequisites
- Node.js 22+
- Yarn
- Docker + Docker Compose
- PostgreSQL

### Installation
```bash
git clone https://github.com/JRuvalcabaFSD/ByteBerry-oauth2.git
cd ByteBerry-oauth2
yarn install
```

### Running locally
```bash
yarn dev
```

### Running with Docker
```bash
docker compose up
```

### Health Check
```bash
curl http://localhost:4000/health
```

## 🧪 Testing
```bash
yarn test
```

## 📦 Deployment
- Multi-arch images pushed to Docker Hub (`linux/arm64`, `linux/amd64`)
- CI/CD with GitHub Actions (lint, build, test, release)

## 🤝 Contributing
See [CONTRIBUTING.md](./CONTRIBUTING.md).

## 📜 License
This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
