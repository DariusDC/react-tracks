import React, { useState } from "react";
import withStyles from "@material-ui/core/styles/withStyles";
import Typography from "@material-ui/core/Typography";
import Avatar from "@material-ui/core/Avatar";
import FormControl from "@material-ui/core/FormControl";
import Paper from "@material-ui/core/Paper";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import Button from "@material-ui/core/Button";
import Lock from "@material-ui/icons/Lock";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import Error from "../Shared/Error";

const Login = ({ classes, setNewUser }) => {
  const [data, setData] = useState({ username: "", password: "" });

  const handleChange = (e) => {
    setData({ ...data, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e, tokenAuth, client) => {
    e.preventDefault();
    const res = await tokenAuth();
    localStorage.setItem("authToken", res.data.tokenAuth.token);
    client.writeData({ data: { isLoggedIn: true } });
  };

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <Avatar className={classes.avatar}>
          <Lock />
        </Avatar>
        <Typography variant="headline">Login as existing user</Typography>
        <Mutation variables={data} mutation={LOGIN_MUTATION}>
          {(tokenAuth, { loading, error, called, client }) => {
            return (
              <form
                onSubmit={(e) => handleSubmit(e, tokenAuth, client)}
                className={classes.form}
              >
                <FormControl margin="normal" required fullWidth>
                  <InputLabel htmlFor="username">Username</InputLabel>
                  <Input id="username" onChange={handleChange} />
                </FormControl>
                <FormControl margin="normal" required fullWidth>
                  <InputLabel htmlFor="password">Password</InputLabel>
                  <Input
                    id="password"
                    type="password"
                    onChange={handleChange}
                  />
                </FormControl>
                <Button
                  className={classes.submit}
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  disabled={
                    loading || !data.username.trim() || !data.password.trim()
                  }
                >
                  {loading ? "Loggin in..." : "Login"}
                </Button>
                <Button
                  color="primary"
                  variant="outlined"
                  fullWidth
                  onClick={() => {
                    setNewUser(true);
                  }}
                >
                  Don't have aby account? Register here
                </Button>

                {error && <Error error={error} />}
              </form>
            );
          }}
        </Mutation>
      </Paper>
    </div>
  );
};

const LOGIN_MUTATION = gql`
  mutation ($username: String!, $password: String!) {
    tokenAuth(username: $username, password: $password) {
      token
    }
  }
`;

const styles = (theme) => ({
  root: {
    width: "auto",
    display: "block",
    marginLeft: theme.spacing.unit * 3,
    marginRight: theme.spacing.unit * 3,
    [theme.breakpoints.up("md")]: {
      width: 400,
      marginLeft: "auto",
      marginRight: "auto",
    },
  },
  paper: {
    marginTop: theme.spacing.unit * 8,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: theme.spacing.unit * 2,
  },
  title: {
    marginTop: theme.spacing.unit * 2,
    color: theme.palette.secondary.main,
  },
  avatar: {
    margin: theme.spacing.unit,
    backgroundColor: theme.palette.primary.main,
  },
  form: {
    width: "100%",
    marginTop: theme.spacing.unit,
  },
  submit: {
    marginTop: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit * 2,
  },
});

export default withStyles(styles)(Login);
