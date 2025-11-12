# Manage Certifications

## Add Certification

```
POST /api/portfolio/certifications
```

## Update Certification

```
PUT /api/portfolio/certifications/:id
```

## Delete Certification

```
DELETE /api/portfolio/certifications/:id
```

## Request Body

```json
{
  "name": "AWS Certified Developer",
  "issuer": "Amazon Web Services",
  "issueDate": "2023-01-01",
  "expiryDate": "2026-01-01",
  "credentialId": "ABC123",
  "credentialUrl": "https://aws.amazon.com/verify"
}
```
