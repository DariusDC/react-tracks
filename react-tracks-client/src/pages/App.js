import React, { useState } from "react";
import withStyles from "@material-ui/core/styles/withStyles";
import SearchTracks from "../components/Track/SearchTracks";
import TrackList from "../components/Track/TrackList";
import CreateTrack from "../components/Track/CreateTrack";
import { Query } from "react-apollo";
import { gql } from "apollo-boost";
import Loading from "../components/Shared/Loading";
import Error from "../components/Shared/Error";

const App = ({ classes }) => {
  const [serachResults, setSearchResults] = useState([]);

  return (
    <div className={classes.container}>
      <SearchTracks setSearchResults={setSearchResults} />
      <CreateTrack />
      <Query query={GET_TRACKS_QUERY}>
        {({ data, loading, error }) => {
          if (loading) return <Loading />;
          if (error) return <Error error={error} />;

          const tracks = serachResults.length > 0 ? serachResults : data.tracks;
          console.log(tracks);
          return <TrackList tracks={tracks} />;
        }}
      </Query>
    </div>
  );
};

export const GET_TRACKS_QUERY = gql`
  query getTracksQuery {
    tracks {
      id
      title
      description
      url
      likes {
        id
      }
      postedBy {
        id
        username
      }
    }
  }
`;

const styles = (theme) => ({
  container: {
    margin: "0 auto",
    maxWidth: 960,
    padding: theme.spacing.unit * 2,
  },
});

export default withStyles(styles)(App);
