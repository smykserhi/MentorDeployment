# Image Functionality Client Guide

This guide shows how to use the image API from the client side.

## Base Requirements

- API base URL: `http://localhost:3000/api/v1` (or your deployed URL)
- Auth: all image endpoints require `Authorization: Bearer <token>`
- Upload content type: `multipart/form-data`
- Upload field name: `image`

## Endpoints

### User image

- `POST /images/users/:userId` - upload or replace user image
- `GET /images/users/:userId` - read/stream user image
- `DELETE /images/users/:userId` - delete user image

### Job image

- `POST /images/jobs/:jobId` - upload or replace job image
- `GET /images/jobs/:jobId` - read/stream job image
- `DELETE /images/jobs/:jobId` - delete job image

## Upload Image (Fetch API)

```js
async function uploadUserImage({ apiBase, token, userId, file }) {
  const formData = new FormData();
  formData.append('image', file); // IMPORTANT: field name must be "image"

  const response = await fetch(`${apiBase}/images/users/${userId}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.msg || `Upload failed: ${response.status}`);
  }

  return response.json(); // { image: { id, ownerType, ownerId, contentType, size, filename, url, ... } }
}
```

## Upload Image (Axios)

```js
import axios from 'axios';

async function uploadJobImage({ apiBase, token, jobId, file }) {
  const formData = new FormData();
  formData.append('image', file);

  const { data } = await axios.post(`${apiBase}/images/jobs/${jobId}`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}
```

## Display Image in UI

Since GET endpoint returns binary bytes, the easiest way is to set the image URL directly:

```jsx
<img
  src={`${apiBase}/images/users/${userId}`}
  alt="User avatar"
  onError={(e) => {
    e.currentTarget.src = '/default-avatar.png';
  }}
/>
```

If your backend requires Authorization for the image request (it does), and your browser does not automatically attach the token, use Blob loading:

```js
async function loadProtectedImage({ apiBase, token, userId }) {
  const response = await fetch(`${apiBase}/images/users/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`Image load failed: ${response.status}`);
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}
```

React usage:

```jsx
import { useEffect, useState } from 'react';

function ProtectedAvatar({ apiBase, token, userId }) {
  const [src, setSrc] = useState('');

  useEffect(() => {
    let objectUrl = '';

    (async () => {
      try {
        const response = await fetch(`${apiBase}/images/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) return;
        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
      } catch (_) {
        // optional: set fallback image
      }
    })();

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [apiBase, token, userId]);

  return <img src={src || '/default-avatar.png'} alt="Avatar" />;
}
```

## Delete Image

```js
async function deleteUserImage({ apiBase, token, userId }) {
  const response = await fetch(`${apiBase}/images/users/${userId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.msg || `Delete failed: ${response.status}`);
  }

  return response.json(); // { msg: "Image deleted successfully" }
}
```

## Important Client-Side Notes

- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`, `image/gif`
- Default max size: `5MB` (can change via backend env `IMAGE_MAX_SIZE_MB`)
- For upload forms, always validate file type and size in UI before sending.
- If you use JWT in memory/localStorage, send it in `Authorization` header for all image calls.
- For React Native or mobile clients, use multipart upload with field `image` the same way.

## Typical Flow Example

1. User logs in and receives JWT token.
2. User selects file in `<input type="file" />`.
3. Client validates type/size.
4. Client uploads via `POST /images/users/:userId`.
5. Client renders image from protected GET endpoint.
6. On replacement, call `POST` again with a new file.
7. On remove, call `DELETE`.
