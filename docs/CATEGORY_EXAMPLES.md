# PodStream API - Category Browsing Examples

## Category Browsing Implementation

### Example 1: Fetch All Categories

**Request:**
```bash
curl -X GET http://localhost:5000/api/categories
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Technology",
    "slug": "technology",
    "color_hex": "#3498db",
    "description": "Tech podcasts"
  },
  {
    "id": 2,
    "name": "Business",
    "slug": "business",
    "color_hex": "#e74c3c",
    "description": "Business and entrepreneurship"
  },
  {
    "id": 3,
    "name": "Comedy",
    "slug": "comedy",
    "color_hex": "#f39c12",
    "description": "Comedy and entertainment"
  }
]
```

### Example 2: Get Category Details

**Request:**
```bash
curl -X GET http://localhost:5000/api/categories/technology
```

**Response:**
```json
{
  "id": 1,
  "name": "Technology",
  "slug": "technology",
  "color_hex": "#3498db",
  "description": "Latest tech news and discussions"
}
```

### Example 3: Browse Podcasts by Category (Latest)

**Request:**
```bash
curl -X GET "http://localhost:5000/api/categories/technology/podcasts?page=1&limit=20&sort=latest"
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "title": "The Tech Podcast",
      "description": "Weekly tech news and interviews",
      "cover_image_url": "https://example.com/image.jpg",
      "category_id": 1,
      "is_premium": false,
      "total_episodes": 45,
      "total_listens": 5000,
      "average_rating": 4.5,
      "created_at": "2024-01-15T10:00:00Z",
      "creator_name": "TechBlogger",
      "creator_picture": "https://example.com/avatar.jpg"
    },
    {
      "id": 2,
      "title": "AI Insights",
      "description": "Deep dive into artificial intelligence",
      "cover_image_url": "https://example.com/image2.jpg",
      "category_id": 1,
      "is_premium": true,
      "total_episodes": 32,
      "total_listens": 8000,
      "average_rating": 4.8,
      "created_at": "2024-01-10T15:30:00Z",
      "creator_name": "AIExpert",
      "creator_picture": "https://example.com/avatar2.jpg"
    }
  ],
  "pagination": {
    "total": 156,
    "page": 1,
    "limit": 20,
    "pages": 8
  }
}
```

### Example 4: Browse by Category (Most Popular)

**Request:**
```bash
curl -X GET "http://localhost:5000/api/categories/comedy/podcasts?page=1&limit=20&sort=popular"
```

**Response:**
```json
{
  "data": [
    {
      "id": 5,
      "title": "Laugh Track",
      "description": "Comedy discussions and sketches",
      "cover_image_url": "https://example.com/comedy.jpg",
      "category_id": 3,
      "is_premium": false,
      "total_episodes": 120,
      "total_listens": 50000,
      "average_rating": 4.6,
      "created_at": "2023-06-01T00:00:00Z",
      "creator_name": "FunnyPerson",
      "creator_picture": "https://example.com/avatar5.jpg"
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 20,
    "pages": 3
  }
}
```

### Example 5: Browse by Category (Trending)

**Request:**
```bash
curl -X GET "http://localhost:5000/api/categories/business/podcasts?sort=trending"
```

Trending sorts by average rating and total listens combined, showing highly-rated popular podcasts.

## Frontend Integration

### Using the Store

```javascript
import { useStore } from '@/lib/store';

export default function CategoryPage() {
  const { podcasts, fetchPodcastsByCategory } = useStore();

  useEffect(() => {
    // Fetch podcasts for technology category, latest sort
    fetchPodcastsByCategory('technology', { sort: 'latest' });
  }, []);

  return (
    <div>
      {podcasts.map(podcast => (
        <PodcastCard key={podcast.id} podcast={podcast} />
      ))}
    </div>
  );
}
```

### Category Selector Component

```javascript
function CategorySelector() {
  const { categories, fetchPodcastsByCategory } = useStore();

  const handleCategoryClick = (slug) => {
    fetchPodcastsByCategory(slug, { sort: 'latest' });
  };

  return (
    <div className="grid grid-cols-5 gap-4">
      {categories.map(cat => (
        <button
          key={cat.id}
          onClick={() => handleCategoryClick(cat.slug)}
          style={{ backgroundColor: cat.color_hex }}
          className="p-4 rounded text-white font-bold hover:opacity-80"
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
```

## Pagination Examples

### Fetch Page 2

```bash
curl -X GET "http://localhost:5000/api/categories/technology/podcasts?page=2&limit=20&sort=latest"
```

### Fetch with Custom Limit

```bash
curl -X GET "http://localhost:5000/api/categories/technology/podcasts?page=1&limit=50&sort=popular"
```

## Error Handling

### Category Not Found

**Request:**
```bash
curl -X GET http://localhost:5000/api/categories/invalid-slug
```

**Response (404):**
```json
{
  "error": "Category not found"
}
```

### Invalid Sort Parameter

The API ignores invalid sort parameters and defaults to 'latest':

```bash
curl -X GET "http://localhost:5000/api/categories/technology/podcasts?sort=invalid"
```

Returns results sorted by latest.

## Performance Tips

1. **Use Pagination**: Always use pagination for better performance
   ```javascript
   // Good
   await fetchPodcastsByCategory('technology', { page: 1, limit: 20 });
   
   // Avoid - no pagination
   await fetchPodcastsByCategory('technology', {});
   ```

2. **Cache Results**: Store fetched categories locally
   ```javascript
   // Categories rarely change, fetch once and cache
   if (!store.categories.length) {
     await store.fetchCategories();
   }
   ```

3. **Implement Infinite Scroll**: Load next page on scroll
   ```javascript
   const [page, setPage] = useState(1);
   const loadMore = async () => {
     await fetchPodcastsByCategory(slug, { page: page + 1, limit: 20 });
     setPage(page + 1);
   };
   ```

## Complete Implementation Example

```javascript
import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';

export default function CategoryBrowse() {
  const { categories, podcasts, fetchCategories, fetchPodcastsByCategory } = useStore();
  const [selectedCategory, setSelectedCategory] = useState('technology');
  const [sortBy, setSortBy] = useState('latest');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (categories.length === 0) {
        setLoading(true);
        await fetchCategories();
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchPodcastsByCategory(selectedCategory, {
        sort: sortBy,
        page: page,
        limit: 20
      });
      setLoading(false);
    };
    load();
  }, [selectedCategory, sortBy, page]);

  return (
    <div>
      {/* Category Buttons */}
      <div className="flex gap-2 mb-6">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => {
              setSelectedCategory(cat.slug);
              setPage(1);
            }}
            style={{ backgroundColor: cat.color_hex }}
            className={`px-4 py-2 rounded text-white font-bold ${
              selectedCategory === cat.slug ? 'ring-2 ring-white' : ''
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Sort Options */}
      <select
        value={sortBy}
        onChange={(e) => {
          setSortBy(e.target.value);
          setPage(1);
        }}
        className="mb-6 px-4 py-2 border rounded"
      >
        <option value="latest">Latest</option>
        <option value="popular">Most Popular</option>
        <option value="trending">Trending</option>
      </select>

      {/* Podcasts Grid */}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {podcasts.map(podcast => (
            <PodcastCard key={podcast.id} podcast={podcast} />
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="mt-6 flex gap-2">
        <button onClick={() => setPage(page - 1)} disabled={page === 1}>
          Previous
        </button>
        <span>Page {page}</span>
        <button onClick={() => setPage(page + 1)}>
          Next
        </button>
      </div>
    </div>
  );
}
```

This provides a complete, fully functional category browsing implementation! 🎙️
