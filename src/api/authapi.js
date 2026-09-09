import API from "./api";


// LOGIN API [FromQuery]
export const loginUser = async (data) => {
  try {
    const params = {
      username: data.Username,
      password: data.Password,
    };

    console.log("Login Params:", params);

    const res = await API.post(
      "/api/Auth/login",
      null, // no body
      {
        params: params,
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
          // Accept: "application/json",
        },
      }
    );

    const { token } = res.data;

    console.log("authapi token:", token);

    localStorage.setItem("token", token);

    const TokenResponse = {
      accessToken: token,
      user: {
        id: 1,
        email: "Sunil",
        name: "Sunil M N",
      },
    };

    return TokenResponse;
  } catch (error) {
    const errData = error?.response?.data || {
      message: error.message,
    };

    console.error("Login API error:", errData);

    throw errData;
  }
};

// LOGIN API [FromBody]
// export const loginUser = async (data) => {
//   const payload = {
//     Username: data.Username,
//     Password: data.Password,
//   };

//   try {
//     console.log("Login Payload:", payload);

//     const res = await API.post(
//       "/api/Auth/login",
//       payload, // body
//       {
//         headers: {
//           accept: "*/*",
//           "Content-Type": "application/json",
//           Accept: "application/json",
//         },
//       }
//     );

//     const { token } = res.data;

//     console.log("authapi token:", token);

//     localStorage.setItem("token", token);

//     const TokenResponse = {
//       accessToken: token,
//       user: {
//         id: 1,
//         email: "Sunil",
//         name: "Sunil M N",
//       },
//     };

//     return TokenResponse;
//   } catch (error) {
//     const errData = error?.response?.data || {
//       message: error.message,
//     };

//     console.error("Login API error:", errData);

//     throw errData;
//   }
// };
// GET API


