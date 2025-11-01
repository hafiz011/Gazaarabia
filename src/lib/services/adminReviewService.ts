import { apiFetch } from "../api";

export interface Review {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  product: {
    id: number;
    title: string;
    slug: string;
  };
}

// export const reviewService = {
//   getAll: (token: string, params?: { search?: string }) => {
//     const query = new URLSearchParams();
//     if (params?.search) query.append("search", params.search);
//     return apiFetch(`/api/reviews${query.toString() ? `?${query.toString()}` : ""}`, {}, token);
//   },
// };



export const adminReviewService = {

  getAll: (token: string, params?: { search?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.append("search", params.search);
    return apiFetch(`/api/reviews/list${query.toString() ? `?${query.toString()}` : ""}`, {}, token);
  },

  /**
 * Get a single review by ID
 */
  getById: (token: string, id: number): Promise<Review> =>
    apiFetch(`/api/reviews/${id}`, {}, token),

  create: (token: string, data: any) =>
    apiFetch(
      "/api/reviews",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      token
    ),


      /**
   * Update an existing review
   */
  update: (token: string, id: number, data: any): Promise<Review> =>
    apiFetch(
      `/api/reviews/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
      token
    ),


  /**
* Delete a review
*/
  remove: (token: string, id: number): Promise<{ message: string }> =>
    apiFetch(
      `/api/reviews/${id}`,
      {
        method: "DELETE",
      },
      token
    ),

  getDropdownData: (token: string) =>
    apiFetch("/api/reviews", {}, token),
};