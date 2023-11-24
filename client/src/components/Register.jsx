import { ErrorMessage, Field, Form, Formik } from "formik";
import { formValidation } from "../utils/validation/formValidation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { authThunks } from "../thunks/auth";
import { useNavigate } from "react-router-dom";
import { clearMessage } from "../slices/message";

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [successful, setSuccessful] = useState(false);

  const { message } = useSelector((state) => state.message);

  useEffect(() => {
    dispatch(clearMessage());
  }, [dispatch]);

  useEffect(() => {
    // Redirect to login after 3 seconds if registration is successful
    if (successful) {
      const timer = setTimeout(() => {
        navigate("/login");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [successful, navigate]);

  const initialValues = {
    username: "",
    email: "",
    password: "",
  };

  const handleSubmit = (formValues) => {
    const { username, email, password } = formValues;

    setSuccessful(false);

    dispatch(authThunks.register({ username, email, password }))
      .unwrap()
      .then(() => {
        setSuccessful(true);
      })
      .catch(() => {
        setSuccessful(false);
      });
  };

  return (
    <div className="col-md-12 signup-form">
      <div className="card card-container">
        <img
          src="//ssl.gstatic.com/accounts/ui/avatar_2x.png"
          alt="profile-img"
          className="profile-img-card"
        />
        <Formik
          initialValues={initialValues}
          validationSchema={formValidation.registerValidationSchema}
          onSubmit={handleSubmit}
        >
          <Form>
            {!successful && (
              <>
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <Field name="username" type="text" className="form-control" />
                  <ErrorMessage
                    name="username"
                    component="div"
                    className="alert alert-danger"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <Field name="email" type="email" className="form-control" />
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="alert alert-danger"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <Field
                    name="password"
                    type="password"
                    className="form-control"
                  />
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="alert alert-danger"
                  />
                </div>

                <div className="form-group">
                  <button type="submit" className="btn btn-primary btn-block">
                    Sign Up
                  </button>
                </div>
              </>
            )}
          </Form>
        </Formik>
      </div>

      {message && (
        <div className="form-group">
          <div
            className={
              successful ? "alert alert-success" : "alert alert-danger"
            }
            role="alert"
          >
            {message}
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
