import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:5115/api",
});


// =====================================================
// REQUEST INTERCEPTOR
// =====================================================

axiosClient.interceptors.request.use(
  (config) => {

    const adminUser =
      localStorage.getItem("adminUser");

    let token;

    // -------------------------------------------------
    // ADMIN
    // -------------------------------------------------

    if (adminUser) {

      token =
        localStorage.getItem("adminToken");

    }

    // -------------------------------------------------
    // HR / EMPLOYEE
    // -------------------------------------------------

    else {

      token =
        localStorage.getItem("token");

    }


    if (token) {

      config.headers.Authorization =
        `Bearer ${token}`;

    }


    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);


// =====================================================
// RESPONSE INTERCEPTOR
// =====================================================

axiosClient.interceptors.response.use(

  (response) => {
    return response;
  },


  async (error) => {

    const originalRequest =
      error.config;


    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {

      originalRequest._retry = true;


      // =================================================
      // DETERMINE CURRENT USER
      // =================================================

      const adminUser =
        localStorage.getItem("adminUser");


      // =================================================
      // ADMIN REFRESH
      // =================================================

      if (adminUser) {

        const refreshToken =
          localStorage.getItem(
            "adminRefreshToken"
          );


        if (!refreshToken) {

          localStorage.removeItem(
            "adminToken"
          );

          localStorage.removeItem(
            "adminRefreshToken"
          );

          localStorage.removeItem(
            "adminUser"
          );

          window.location.href =
            "/admin/login";

          return Promise.reject(error);
        }


        try {

          const response =
            await axios.post(
              "http://localhost:5115/api/admin/refresh",
              {
                refreshToken:
                  refreshToken,
              }
            );


          const newToken =
            response.data.token;

          const newRefreshToken =
            response.data.refreshToken;


          localStorage.setItem(
            "adminToken",
            newToken
          );

          localStorage.setItem(
            "adminRefreshToken",
            newRefreshToken
          );


          originalRequest.headers.Authorization =
            `Bearer ${newToken}`;


          return axiosClient(
            originalRequest
          );

        } catch (refreshError) {

          console.error(
            "Admin token refresh failed:",
            refreshError
          );


          localStorage.removeItem(
            "adminToken"
          );

          localStorage.removeItem(
            "adminRefreshToken"
          );

          localStorage.removeItem(
            "adminUser"
          );


          window.location.href =
            "/admin/login";


          return Promise.reject(
            refreshError
          );
        }
      }


      // =================================================
      // HR / EMPLOYEE REFRESH
      // =================================================

      const refreshToken =
        localStorage.getItem(
          "refreshToken"
        );


      if (!refreshToken) {

        localStorage.removeItem(
          "token"
        );

        localStorage.removeItem(
          "refreshToken"
        );

        localStorage.removeItem(
          "user"
        );

        window.location.href =
          "/login";

        return Promise.reject(error);
      }


      try {

        const response =
          await axios.post(
            "http://localhost:5115/api/Auth/refresh",
            {
              refreshToken:
                refreshToken,
            }
          );


        const newToken =
          response.data.token;

        const newRefreshToken =
          response.data.refreshToken;


        localStorage.setItem(
          "token",
          newToken
        );

        localStorage.setItem(
          "refreshToken",
          newRefreshToken
        );


        originalRequest.headers.Authorization =
          `Bearer ${newToken}`;


        return axiosClient(
          originalRequest
        );

      } catch (refreshError) {

        console.error(
          "Token refresh failed:",
          refreshError
        );


        localStorage.removeItem(
          "token"
        );

        localStorage.removeItem(
          "refreshToken"
        );

        localStorage.removeItem(
          "user"
        );


        window.location.href =
          "/login";


        return Promise.reject(
          refreshError
        );
      }
    }


    return Promise.reject(error);
  }
);


export default axiosClient;