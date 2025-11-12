# Prerequisites

## Required Software

### Node.js 18+

**Why**: Runtime for both backend and build tools

**Install**: [nodejs.org](https://nodejs.org/)

**Verify**:
```bash
node --version  # v18.x.x or higher
npm --version   # 9.x.x or higher
```

### PostgreSQL 14+

**Why**: Primary database

**Install**:
- **macOS**: `brew install postgresql@14`
- **Ubuntu**: `sudo apt install postgresql-14`
- **Windows**: [Download installer](https://www.postgresql.org/download/windows/)

**Verify**:
```bash
psql --version  # 14.x or higher
```

**Start service**:
- **macOS**: `brew services start postgresql@14`
- **Ubuntu**: `sudo service postgresql start`
- **Windows**: Already running as service

### Git

**Why**: Version control

**Install**: [git-scm.com](https://git-scm.com/downloads)

**Verify**:
```bash
git --version
```

## Recommended Tools

### Code Editor

**VS Code** (recommended)
- Install from [code.visualstudio.com](https://code.visualstudio.com/)

**Recommended Extensions**:
- ESLint
- Prettier
- Prisma
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense

### Database GUI

**Prisma Studio** (included)
- Run: `npx prisma studio`

**Alternatives**:
- pgAdmin
- DBeaver
- TablePlus

### API Testing

**Thunder Client** (VS Code extension)

**Alternatives**:
- Postman
- Insomnia
- cURL

## Optional Tools

### Docker (for deployment)

**Install**: [docker.com](https://www.docker.com/get-started/)

### nvm (Node Version Manager)

**Why**: Switch between Node versions easily

**Install**:
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
```

**Usage**:
```bash
nvm install 18
nvm use 18
```

## Knowledge Prerequisites

### Required

- **JavaScript ES6+**: Promises, async/await, destructuring, modules
- **TypeScript basics**: Types, interfaces, generics
- **React fundamentals**: Components, hooks, state
- **Node.js basics**: HTTP, modules, async
- **SQL basics**: SELECT, INSERT, UPDATE, DELETE, JOIN
- **Git basics**: commit, push, pull, branch

### Helpful

- REST API design
- JWT authentication
- ORM concepts (Prisma)
- CSS (Tailwind helps but basics are useful)
- Testing (Jest, Cypress)

## System Requirements

### Minimum

- **RAM**: 8GB
- **Storage**: 5GB free
- **OS**: macOS 10.15+, Ubuntu 20.04+, Windows 10+

### Recommended

- **RAM**: 16GB
- **Storage**: 10GB free
- **CPU**: 4+ cores

## Next Steps

Once you have all prerequisites installed:

1. [Install the project](./installation.md)
2. [Understand the tech stack](./tech-stack.md)
3. [Review project structure](./project-structure.md)
