import React from "react";
import { Box, Button, Typography, Paper } from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";

import { loginUser } from "../../api/authapi";
import { useAuth } from "../../context/AuthContext";
import FormInput from "../../components/form/FormInput";

const loginSchema = yup.object({
  Username: yup.string().required("User is required"),
  Password: yup
    .string()
    .required("Password required")
    .min(6, "Minimum 6 chars"),
});

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const { control, handleSubmit } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      Username: "",
      Password: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      const res = await loginUser(data);

      login(res);
      navigate("/");
    } catch {
      alert("Invalid credentials");
    }
  };

  return (
        // <Box sx={{ background: "#eef2f7", minHeight: "100vh",pt:5, px: 5 }}></Box>
<Box
  sx={{
    minHeight: "100vh",
    width: "100vw",
    background:
      "linear-gradient(135deg,#1e3c72,#2a5298)",
    display: "flex",
    alignItems: "stretch",
    justifyContent: "stretch",
    pt: 0,
    px: 0,
    mx: 0
  }}
>
  <div className="container-fluid px-0">

    <div className="row gx-0">

      <div className="col-12 px-0">

        <Paper
          elevation={5}
          sx={{
            borderRadius: 5,
            overflow: "hidden",
            backdropFilter: "blur(12px)",
            width: "100%"
          }}
        >

          <div className="row g-0">

            {/* LEFT */}
            <div className="col-md-6 bg-primary text-white d-flex flex-column justify-content-center p-5">

              <Typography
                variant="h4"
                fontWeight="bold"
                mb={2}
              >
                Invoice System
              </Typography>

              <Typography>
                Manage invoices,
                customers and reports
                from one place.
              </Typography>

            </div>


            {/* RIGHT */}
            <div className="col-md-6 bg-white p-5">

              <Typography
                variant="h5"
                fontWeight="bold"
                mb={3}
                align="center"
              >
                Login
              </Typography>

              <form
                onSubmit={handleSubmit(
                  onSubmit
                )}
              >

                <div className="mb-3">

                  <FormInput
                    name="Username"
                    control={control}
                    label="User Name"
                  />

                </div>

                <div className="mb-4">

                  <FormInput
                    name="Password"
                    control={control}
                    label="Password"
                    type="password"
                  />

                </div>

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  sx={{
                    borderRadius: 3,
                    height: 50
                  }}
                >
                  Login
                </Button>

              </form>

            </div>

          </div>

        </Paper>

      </div>

    </div>

  </div>

</Box>
  );
};

export default Login;