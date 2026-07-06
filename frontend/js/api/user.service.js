// user.service.js — Service layer for user‑related API calls
// Utilizes the unified ApiClient defined in src/api/apiClient.js

export const UserService = (() => {
  // GET /users – retrieve list of all users (admin view)
  const getAll = () => {
    return ApiClient.get('/users');
  };

  // GET /users/:id – retrieve single user details
  const getById = (id) => {
    if (!id) throw new Error('User ID is required');
    return ApiClient.get(`/users/${id}`);
  };

  // POST /users – create a new user (registration)
  const create = (data) => {
    return ApiClient.post('/users', data);
  };

  // PUT /users/:id – update user information
  const update = (id, data) => {
    if (!id) throw new Error('User ID is required for update');
    return ApiClient.put(`/users/${id}`, data);
  };

  // DELETE /users/:id – remove a user (admin only)
  const remove = (id) => {
    if (!id) throw new Error('User ID is required for deletion');
    return ApiClient.delete(`/users/${id}`);
  };

  return { getAll, getById, create, update, remove };
})();
