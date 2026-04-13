export const ROUTES = {
  HOME: "/",
  NOT_FOUND: "/404",
  UNAUTHORIZED: "/unauthorized",

  //  Customer routes
  USER: {
    LOGIN: "/account/login",
    REGISTER: "/account/register",
    PROFILE: "/account/details",
  },

  //  Admin routes
  ADMIN: {
    LOGIN: "/admin/login",
    DASHBOARD: "/admin",
    SELLER: "/admin/seller",
  },
  //  Affiliate routes
  AFFILIATE: {
    LOGIN: "/affiliate/login",
    REGISTER: "/affiliate/register",
    DASHBOARD: "/affiliate",
  },

  //  Content manager routes
  CONTENT_MANAGER: {
    LOGIN: "/admin/login",
    BLOGS: "/admin/blogs",
  },

  // seller routes
  SELLER: {
    LOGIN: "/seller/login",
    DASHBOARD: "/seller",
    REGISTER: "/seller/register",
  },
  // Other common pages
  //   BLOG: "/blog",
  //   CONTACT: "/contact",
  //   ABOUT: "/about",
};
