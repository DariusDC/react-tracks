import React from "react";
import withStyles from "@material-ui/core/styles/withStyles";
import ExitToApp from "@material-ui/icons/ExitToApp";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import { ApolloConsumer } from "react-apollo";

const Signout = ({ classes }) => {
  const handleSignout = (client) => {
    localStorage.removeItem("authToken");
    client.writeData({ data: { isLoggedIn: false } });
    console.log("Signed out user", client);
  };

  return (
    <ApolloConsumer>
      {(client) => {
        return (
          <Button onClick={() => handleSignout(client)}>
            <Typography
              className={classes.buttonText}
              variant="body1"
              color="secondary"
            >
              Sign out
            </Typography>
            <ExitToApp className={classes.buttonIcon} color="secondary" />
          </Button>
        );
      }}
    </ApolloConsumer>
  );
};

const styles = {
  root: {
    cursor: "pointer",
    display: "flex",
  },
  buttonIcon: {
    marginLeft: "5px",
  },
};

export default withStyles(styles)(Signout);
