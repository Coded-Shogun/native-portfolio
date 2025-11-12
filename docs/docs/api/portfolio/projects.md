# Manage Projects

## Add Project

```
POST /api/portfolio/projects
```

## Update Project

```
PUT /api/portfolio/projects/:id
```

## Delete Project

```
DELETE /api/portfolio/projects/:id
```

## Request Body

```json
{
  "title": "E-commerce Platform",
  "description": "Built with React and Node.js",
  "technologies": ["React", "Node.js", "PostgreSQL"],
  "liveUrl": "https://example.com",
  "githubUrl": "https://github.com/user/project"
}
```
