import React, { useState } from "react";
import withStyles from "@material-ui/core/styles/withStyles";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import FormControl from "@material-ui/core/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import AddIcon from "@material-ui/icons/Add";
import ClearIcon from "@material-ui/icons/Clear";
import LibraryMusicIcon from "@material-ui/icons/LibraryMusic";
import { Mutation } from "react-apollo";
import { gql } from "apollo-boost";
import Error from "../Shared/Error";
import axios from "axios";
import { GET_TRACKS_QUERY } from "../../pages/App";

const CreateTrack = ({ classes }) => {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState({ title: "", description: "" });
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [fileError, setFileError] = useState("");

  const handleChange = (e) => {
    setData({ ...data, [e.target.id]: e.target.value });
  };

  const handleChangeFile = (e) => {
    const fileSizeLimit = 10000000;
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.size > fileSizeLimit) {
      setFileError("File is too large. Upload a file of maximum 10 MB.");
      return;
    }
    setFile(selectedFile);
    setFileError("");
  };

  const handleAudioUpload = async () => {
    const data = new FormData();
    data.append("file", file);
    data.append("resource_type", "raw");
    data.append("upload_preset", "tracks");
    data.append("cloud_name", "dxutn0n5i");
    try {
      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/dxutn0n5i/raw/upload",
        data
      );
      return res.data.url;
    } catch (err) {
      console.error("Error on creating track", err);
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e, createTrack) => {
    setSubmitting(true);
    e.preventDefault();
    // Upload audio file and get returned url from api
    const uploadedUrl = await handleAudioUpload();
    createTrack({ variables: { ...data, url: uploadedUrl } });
  };

  const handleCreateCache = (cache, { data: { createTrack } }) => {
    const data = cache.readQuery({ query: GET_TRACKS_QUERY });
    const tracks = data.tracks.concat(createTrack.track);
    cache.writeQuery({ query: GET_TRACKS_QUERY, data: { tracks } });
  };

  return (
    <>
      <Button
        variant="fab"
        className={classes.fab}
        onClick={() => setOpen(true)}
        color="secondary"
      >
        {!open ? <AddIcon /> : <ClearIcon />}
      </Button>

      <Mutation
        mutation={CREATE_TRACK_MUTATION}
        onCompleted={() => {
          console.log({ data });
          setSubmitting(false);
          setOpen(false);
          setData({ title: "", description: "" });
        }}
        update={handleCreateCache}
        // refetchQueries={() => [{ query: GET_TRACKS_QUERY }]}
      >
        {(createTrack, { loading, error }) => {
          if (error) return <Error error={error} />;

          return (
            <Dialog className={classes.dialog} open={open}>
              <form onSubmit={(e) => handleSubmit(e, createTrack)}>
                <DialogTitle>Create Track</DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    Add a title description and audio file
                  </DialogContentText>
                  <FormControl fullWidth>
                    <TextField
                      label="Title"
                      id="title"
                      value={data.title}
                      placeholder="Add title"
                      onChange={handleChange}
                      className={classes.textField}
                    />
                  </FormControl>
                  <FormControl fullWidth>
                    <TextField
                      multiline
                      rows="2"
                      id="description"
                      label="Description"
                      value={data.description}
                      onChange={handleChange}
                      placeholder="Add description"
                      className={classes.textField}
                    />
                  </FormControl>
                  <FormControl error={!!fileError}>
                    <input
                      accept="audio/*"
                      required
                      id="audio"
                      type="file"
                      className={classes.input}
                      onChange={handleChangeFile}
                    />
                    <label htmlFor="audio">
                      <Button
                        variant="outlined"
                        color={file ? "secondary" : "inherit"}
                        component="span"
                        className={classes.button}
                      >
                        Audio File
                        <LibraryMusicIcon className={classes.icon} />
                      </Button>
                      {file && file.name}
                    </label>
                    <FormHelperText>{fileError}</FormHelperText>
                  </FormControl>
                </DialogContent>
                <DialogActions>
                  <Button
                    onClick={() => setOpen(false)}
                    className={classes.cancel}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    className={classes.save}
                    type="submit"
                    disabled={
                      !data.title.trim() ||
                      !data.description.trim() ||
                      submitting
                    }
                  >
                    {submitting ? (
                      <CircularProgress className={classes.save} size={24} />
                    ) : (
                      "Add Track"
                    )}
                  </Button>
                </DialogActions>
              </form>
            </Dialog>
          );
        }}
      </Mutation>
    </>
  );
};

const CREATE_TRACK_MUTATION = gql`
  mutation ($title: String!, $description: String!, $url: String!) {
    createTrack(title: $title, description: $description, url: $url) {
      track {
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
  }
`;

const styles = (theme) => ({
  container: {
    display: "flex",
    flexWrap: "wrap",
  },
  dialog: {
    margin: "0 auto",
    maxWidth: 550,
  },
  textField: {
    margin: theme.spacing.unit,
  },
  cancel: {
    color: "red",
  },
  save: {
    color: "green",
  },
  button: {
    margin: theme.spacing.unit * 2,
  },
  icon: {
    marginLeft: theme.spacing.unit,
  },
  input: {
    display: "none",
  },
  fab: {
    position: "fixed",
    bottom: theme.spacing.unit * 2,
    right: theme.spacing.unit * 2,
    zIndex: "200",
    margin: "50px 200px",
  },
});

export default withStyles(styles)(CreateTrack);
