# PodStream - Contributing Guide

Thank you for your interest in contributing to PodStream! This document provides guidelines and instructions for contributing.

## Code of Conduct

Be respectful, inclusive, and professional in all interactions.

## Getting Started

### 1. Fork the Repository

```bash
git clone https://github.com/YOUR_USERNAME/PodStream.git
cd PodStream
```

### 2. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
# or for bugfixes
git checkout -b bugfix/issue-description
```

### 3. Set Up Development Environment

Follow [docs/SETUP.md](docs/SETUP.md) for local development setup.

### 4. Make Changes

- Follow the existing code style
- Write clear, descriptive commit messages
- Keep commits focused and atomic
- Test your changes locally

### 5. Submit a Pull Request

- Push to your fork
- Create a pull request with clear description
- Reference any related issues
- Provide before/after screenshots if UI changes

## Code Style

### Backend (Node.js)

```javascript
// Use ES6+ modules
import express from 'express';

// Use async/await
async function fetchData() {
  try {
    const result = await query.execute();
    return result;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Use meaningful variable names
const userName = 'John';
const MAX_RETRIES = 3;

// Comment complex logic
// Retry logic for network failures
const result = await retry(fetchData, MAX_RETRIES);
```

### Frontend (React/Next.js)

```javascript
// Use functional components
export default function PodcastCard({ podcast }) {
  const [isLoading, setIsLoading] = useState(false);

  // Use descriptive component names
  return (
    <div className="podcast-card">
      {/* Comment complex JSX */}
      {isLoading ? <Spinner /> : <Content />}
    </div>
  );
}

// Export at the bottom
export { PodcastCard };
```

### CSS/Tailwind

```html
<!-- Use Tailwind classes -->
<div class="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
  <h1 class="text-2xl font-bold text-gray-900">Title</h1>
  <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
    Action
  </button>
</div>

<!-- Keep classes organized -->
<!-- Layout | Sizing | Colors | Typography | Effects -->
```

## Commit Messages

Use clear, descriptive commit messages:

```
feat(categories): add category browsing functionality

- Add category browser component
- Implement category filtering
- Add color-coded category cards

Fixes #123
```

Format: `type(scope): subject`

Types:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Code style changes
- `refactor` - Code refactoring
- `perf` - Performance improvements
- `test` - Test additions
- `chore` - Maintenance tasks

## Testing

### Backend Tests

```bash
cd backend
npm test

# With coverage
npm run test:coverage
```

### Frontend Tests

```bash
cd frontend
npm test

# With coverage
npm run test:coverage
```

### Manual Testing

1. Start the application: `./start.sh`
2. Test all user flows
3. Test on different devices/screen sizes
4. Check browser console for errors

## Pull Request Process

1. **Update Documentation** - If adding features, update relevant docs
2. **Write Tests** - Add tests for new functionality
3. **Code Review** - Address review comments
4. **Merge** - Maintain clean commit history

## Reporting Issues

### Bug Reports

Include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots/logs
- Environment (OS, browser, Docker version)

### Feature Requests

Include:
- Clear description
- Use case
- Expected behavior
- Any design/mockups

## Development Workflow

### Adding a Feature

1. **Create branch**: `git checkout -b feature/my-feature`
2. **Make changes**: Write code following style guide
3. **Test**: Manual and automated tests
4. **Document**: Update README/docs if needed
5. **Commit**: Clear commit messages
6. **Push**: `git push origin feature/my-feature`
7. **PR**: Create pull request with description

### Fixing a Bug

1. **Create branch**: `git checkout -b bugfix/issue-123`
2. **Reproduce**: Confirm the bug locally
3. **Fix**: Implement fix with minimal changes
4. **Test**: Verify fix works
5. **Commit**: Reference issue in commit
6. **PR**: Link to issue in PR

## Performance Considerations

- Optimize database queries
- Use pagination for large datasets
- Cache when appropriate
- Monitor bundle size
- Use lazy loading for components

## Security Guidelines

- Never commit secrets or API keys
- Use environment variables for sensitive data
- Validate user input
- Use prepared statements for SQL
- Keep dependencies updated
- Follow OWASP guidelines

## Documentation

- Update README for major changes
- Add API documentation for new endpoints
- Include code comments for complex logic
- Add JSDoc for functions
- Update ROADMAP.md if planning future work

Example JSDoc:

```javascript
/**
 * Fetch podcasts by category with filtering
 * @param {string} categorySlug - The category slug
 * @param {Object} options - Query options
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Items per page (default: 20)
 * @param {string} options.sort - Sort order (latest|popular|trending)
 * @returns {Promise<Array>} Array of podcast objects
 */
async function fetchPodcastsByCategory(categorySlug, options = {}) {
  // Implementation
}
```

## Review Checklist

Before submitting PR, ensure:
- [ ] Code follows project style guide
- [ ] Tests added/updated and passing
- [ ] Documentation updated
- [ ] No console errors/warnings
- [ ] No unnecessary dependencies added
- [ ] Commit messages are clear
- [ ] Works on different screen sizes (frontend)
- [ ] Database migrations included (if needed)

## Getting Help

- Check existing issues and PRs
- Read documentation in `docs/`
- Ask in GitHub Discussions
- Request mentoring in PR comments

## Recognition

All contributors will be recognized in:
- CONTRIBUTORS.md
- GitHub contributors page
- Monthly/quarterly updates

Thank you for contributing to PodStream! 🎙️
