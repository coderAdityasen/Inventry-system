# Scaling Guidelines

This document provides guidelines for scaling the application to handle increased load and traffic.

## Architecture Overview

The application follows a microservices-like architecture with:

- **Frontend**: React SPA served via Nginx
- **Backend**: Node.js/Express REST API
- **Database**: MySQL
- **Containerization**: Docker

## Horizontal Scaling

### Backend Scaling

The backend can be scaled horizontally by adding more container instances:

```yaml
# docker-compose.yml
services:
  backend:
    deploy:
      replicas: 3
    # ... rest of config
```

### Load Balancing

For production, use a load balancer (Nginx, HAProxy, or cloud-native):

```nginx
upstream backend {
    server backend-1:5000;
    server backend-2:5000;
    server backend-3:5000;
}

server {
    location /api {
        proxy_pass http://backend;
    }
}
```

## Database Scaling

### Read Replicas

For read-heavy workloads, add MySQL replicas:

```yaml
# docker-compose.prod.yml
services:
  mysql-primary:
    # ... primary database config

  mysql-replica-1:
    command: --slave-serve-stale=ON
    depends_on:
      - mysql-primary
```

### Connection Pooling

- Use connection pooling (mysql2/pool)
- Set appropriate pool size based on traffic
- Monitor connection usage

```javascript
const pool = mysql.createPool({
  connectionLimit: 20,
  waitForConnections: true,
  queueLimit: 0
});
```

### Query Optimization

- Add indexes for frequently queried columns
- Use EXPLAIN to analyze slow queries
- Implement query caching where appropriate

## Frontend Optimization

### Caching Strategies

- Cache static assets (CSS, JS, images) for 1 year
- Use service workers for offline support
- Implement CDN for static content

### Code Splitting

```javascript
// Lazy load routes
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Items = lazy(() => import('./pages/Items'));
```

### Bundle Optimization

```javascript
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['axios', 'lodash']
        }
      }
    }
  }
});
```

## Performance Monitoring

### Metrics to Track

- **Response Time**: P50, P95, P99 latencies
- **Error Rate**: 4xx and 5xx responses
- **Throughput**: Requests per second
- **Resource Usage**: CPU, memory, disk I/O

### Monitoring Tools

- **Application Monitoring**: PM2, New Relic
- **Database Monitoring**: MySQL Enterprise Monitor
- **Infrastructure**: Docker stats, Prometheus

## Caching Strategy

### API Response Caching

```javascript
// Redis caching example
const cache = require('redis').createClient();
const cacheMiddleware = (req, res, next) => {
  const key = req.originalUrl;
  cache.get(key, (err, data) => {
    if (data) {
      res.json(JSON.parse(data));
    } else {
      res.sendResponse = res.send;
      res.send = (body) => {
        cache.setex(key, 3600, JSON.stringify(body));
        res.sendResponse(body);
      };
      next();
    }
  });
};
```

### In-Memory Caching

```javascript
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300 });

// Cache expensive operations
const data = cache.get('items');
if (!data) {
  const data = await itemService.getAllItems();
  cache.set('items', data);
}
```

## Security Best Practices

### Authentication & Authorization

- Use JWT with short expiration times
- Implement refresh tokens
- Use HTTPS everywhere
- Implement rate limiting

```javascript
// Rate limiting example
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests'
});
```

### Environment Security

- Never commit secrets to Git
- Use environment variables for sensitive data
- Rotate secrets regularly
- Use secrets management tools (Vault, AWS Secrets Manager)

## Deployment Checklist

### Pre-Deployment

- [ ] Run all tests
- [ ] Run linting and fix issues
- [ ] Optimize production build
- [ ] Verify database migrations
- [ ] Set up monitoring and alerts

### Post-Deployment

- [ ] Verify health checks
- [ ] Monitor error rates
- [ ] Check response times
- [ ] Verify database connections
- [ ] Test critical user flows

### Scaling Triggers

| Metric | Threshold | Action |
|--------|-----------|--------|
| CPU Usage | > 70% | Add more backend instances |
| Memory Usage | > 80% | Increase memory limits |
| Response Time | > 500ms | Optimize queries, add cache |
| Error Rate | > 1% | Investigate and fix issues |
| Connection Pool | > 80% | Increase pool size |

## Disaster Recovery

### Backup Strategy

- Daily automated database backups
- Test backup restoration monthly
- Offsite backup storage

### Recovery Plan

1. Identify failure type
2. Assess impact
3. Execute recovery steps
4. Verify functionality
5. Post-incident analysis

## Additional Resources

- [Node.js Performance](https://nodejs.org/en/docs/guides/)
- [MySQL Optimization](https://dev.mysql.com/doc/)
- [Docker Best Practices](https://docs.docker.com/develop/)
- [React Performance](https://react.dev/)
