import React, { useRef, useState } from "react";
import withStyles from "@material-ui/core/styles/withStyles";
import TextField from "@material-ui/core/TextField";
import ClearIcon from "@material-ui/icons/Clear";
import Paper from "@material-ui/core/Paper";
import IconButton from "@material-ui/core/IconButton";
import SearchIcon from "@material-ui/icons/Search";
import { ApolloConsumer } from "react-apollo";
import { gql } from "apollo-boost";

const SearchTracks = ({ classes, setSearchResults }) => {
  const [search, setSearch] = useState("");
  const inputEl = useRef();

  const clearSearchInput = () => {
    setSearchResults([]);
    setSearch("");
    inputEl.current.focus();
  };

  const handleSubmit = async (e, client) => {
    e.preventDefault();
    const res = await client.query({
      query: SEARCH_TRACKS_QUERY,
      variables: { search },
    });
    setSearchResults(res.data.tracks);
  };

  return (
    <ApolloConsumer>
      {(client) => {
        return (
          <form onSubmit={(e) => handleSubmit(e, client)}>
            <Paper elevation={1} className={classes.root}>
              <IconButton onClick={clearSearchInput}>
                <ClearIcon />
              </IconButton>
              <TextField
                fullWidth
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search all tracks"
                InputProps={{
                  disableUnderline: true,
                }}
                inputRef={inputEl}
              />
              <IconButton type="submit">
                <SearchIcon />
              </IconButton>
            </Paper>
          </form>
        );
      }}
    </ApolloConsumer>
  );
};

const SEARCH_TRACKS_QUERY = gql`
  query ($search: String) {
    tracks(search: $search) {
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
  root: {
    padding: "2px 4px",
    margin: theme.spacing.unit,
    display: "flex",
    alignItems: "center",
  },
});

export default withStyles(styles)(SearchTracks);
