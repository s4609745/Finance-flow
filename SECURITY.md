# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Which versions are eligible for receiving such patches depends on the CVSS v3.0 Rating:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

Please report (suspected) security vulnerabilities to **security@financeflow.com**. You will receive a response from us within 48 hours. If the issue is confirmed, we will release a patch as soon as possible depending on complexity but historically within a few days.

## Security Measures

FinanceFlow implements several security measures:

- **Password Hashing**: All passwords are hashed using bcrypt with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: All inputs are validated using Zod schemas
- **SQL Injection Prevention**: Using MongoDB with Mongoose ODM
- **XSS Protection**: Input sanitization and output encoding
- **CORS Configuration**: Proper cross-origin resource sharing setup
- **Environment Variables**: Sensitive data stored in environment variables
- **Rate Limiting**: API rate limiting to prevent abuse

## Best Practices

When using FinanceFlow:

1. Use strong, unique passwords
2. Keep your JWT tokens secure
3. Log out when finished using the application
4. Report any suspicious activity
5. Keep the application updated to the latest version

## Vulnerability Disclosure Timeline

- **Day 0**: Security vulnerability reported
- **Day 1**: Acknowledgment of report
- **Day 7**: Initial assessment completed
- **Day 30**: Fix developed and tested
- **Day 35**: Security patch released
- **Day 42**: Public disclosure (if applicable)