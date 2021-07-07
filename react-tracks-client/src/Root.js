import { gql } from "apollo-boost";
import React from "react";
import { Query } from "react-apollo";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Header from "./components/Shared/Header";
import Loading from "./components/Shared/Loading";
import App from "./pages/App";
import Profile from "./pages/Profile";
import withRoot from "./withRoot";

export const UserContext = React.createContext();

const Root = () => (
  <Query query={ME_QUERY} fetchPolicy="cache-and-network">
    {({ data, loading, error }) => {
      if (loading) return <Loading />;
      if (error) return <div>An error occured</div>;

      const currentUser = data.me;

      return (
        <Router>
          <UserContext.Provider value={currentUser}>
            <Header currentUser={currentUser} />
            <Switch>
              <Route exact path="/" component={App} />
              <Route exact path="/profile/:id" component={Profile} />
            </Switch>
          </UserContext.Provider>
        </Router>
      );
    }}
  </Query>
);

const GET_TRACKS_QUERY = gql`
  {
    tracks {
      id
      title
      description
      url
    }
  }
`;

const ME_QUERY = gql`
  {
    me {
      id
      username
      email
    }
  }
`;

export default withRoot(Root);
